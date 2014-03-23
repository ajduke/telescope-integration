/*

//--------------------------------------------------------------------------------------------------//
//---------------------------------------- Table Of Contents ---------------------------------------//
//--------------------------------------------------------------------------------------------------//

---------------------------------------------------------------
#                             Config                          #
---------------------------------------------------------------

//

---------------------------------------------------------------
#                            Filters                          #
---------------------------------------------------------------

isLoggedIn
isLoggedOut
isAdmin

canView
canPost
canEditPost
canEditComment

hasCompletedProfile

---------------------------------------------------------------
#                          Controllers                        #
---------------------------------------------------------------

PostsListController
PostPageController

---------------------------------------------------------------
#                             Routes                          #
---------------------------------------------------------------

1) Paginated Lists
----------------------
Top
New
Best
Pending
Categories

2) Digest
--------------------
Digest

3) Posts
--------------------
Post Page
Post Page (scroll to comment)
Post Edit
Post Submit

4) Comments
--------------------
Comment Page
Comment Edit
Comment Submit

5) Users
--------------------
User Profie
User Edit
Forgot Password
Account
All Users
Unsubscribe (from notifications)
Sign Up
Sign In

6) Misc Routes
--------------------
Settings
Categories
Toolbox

7) Server-side
--------------------
API
RSS

*/

// uncomment to disable FastRender
// var FastRender = {RouteController: RouteController, onAllRoutes: function() {}};

//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Config ---------------------------------------------//
//--------------------------------------------------------------------------------------------------//

var preloadSubscriptions = ['telescopeCategories', 'currentUser'];

Router.configure({
//  loadingTemplate: 'loading',
//  notFoundTemplate: 'not_found',

  waitOn: function () {
    return _.map(preloadSubscriptions, function(sub){
      Meteor.subscribe(sub);
    });
  }
});

//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Filters --------------------------------------------//
//--------------------------------------------------------------------------------------------------//

var filters = {

  nProgressHook: function () {
    if (this.ready()) {
      NProgress.done();
    } else {
      NProgress.start();
      this.stop();
    }
  },

  resetScroll: function () {
    var scrollTo = window.currentScroll || 0;
    $('body').scrollTop(scrollTo);
    $('body').css("min-height", 0);
  },

  isLoggedIn: function() {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      throwError('Please Sign In First.')
      this.render('telescope_signin');
      this.stop();
    }
  },

  isLoggedOut: function() {
    if(Meteor.user()){
      this.render('telescope_already_logged_in');
      this.stop();
    }
  },

  isAdmin: function() {
    if(!this.ready()) return;
    if(!isAdmin()){
      throwError("Sorry, you  have to be an admin to view this page.")
      this.render('telescope_no_rights');
      this.stop();
    }
  },

  canView: function() {
    if(!this.ready()) return;
    if(!canView()){
      this.render('telescope_no_rights');
      this.stop();
    }
  },

  canPost: function () {
    if(!this.ready()) return;
    if(!canPost()){
      throwError("Sorry, you don't have permissions to add new items.")
      this.render('telescope_no_rights');
      this.stop();
    }
  },

  canEditPost: function() {
    if(!this.ready()) return;
    // Already subscribed to this post by route({waitOn: ...})
    var post = Posts.findOne(this.params._id);
    if(!currentUserCanEdit(post)){
      throwError("Sorry, you cannot edit this post.")
      this.render('telescope_no_rights');
      this.stop();
    }
  },

  canEditComment: function() {
    if(!this.ready()) return;
    // Already subscribed to this commit by CommentPageController
    var comment = Comments.findOne(this.params._id);
    if(!currentUserCanEdit(comment)){
      throwError("Sorry, you cannot edit this comment.")
      this.render('telescope_no_rights');
      this.stop();
    }
  },

  hasCompletedProfile: function() {
    if(!this.ready()) return;
    var user = Meteor.user();
    if (user && ! userProfileComplete(user)){
      this.render('telescope_user_email');
      this.stop();
    }
  }

}

if(Meteor.isClient){

  // Load Hooks

  Router.load( function () {
    clearSeenErrors(); // set all errors who have already been seen to not show anymore
    Session.set('categorySlug', null);

    // if we're not on the search page itself, clear search query and field
    if(getCurrentRoute().indexOf('search') == -1){
      Session.set('searchQuery', '');
      $('.search-field').val('').blur();
    }

  });

  // Before Hooks

  // Use nProgress on every route that has to load a subscription
  Router.before(filters.nProgressHook, {only: [
    'posts_top',
    'posts_new',
    'posts_best',
    'posts_pending',
    'posts_digest',
    'posts_category',
    'search',
    'post_page',
    'post_edit',
    'comment_page',
    'comment_edit',
    'comment_reply',
    'user_edit',
    'user_profile',
    'all-users',
    'logs'
  ]});

  Router.before(filters.canView);
//  Router.before(filters.hasCompletedProfile);
  Router.before(filters.isLoggedIn, {only: ['comment_reply','post_submit']});
  Router.before(filters.isLoggedOut, {only: ['signin', 'signup']});
  Router.before(filters.canPost, {only: ['posts_pending', 'comment_reply', 'post_submit']});
  Router.before(filters.canEditPost, {only: ['post_edit']});
  Router.before(filters.canEditComment, {only: ['comment_edit']});
  Router.before(filters.isAdmin, {only: ['posts_pending', 'all-users', 'categories', 'toolbox', 'logs']});

  // After Hooks

  Router.after(filters.resetScroll, {except:['posts_top', 'posts_new', 'posts_best', 'posts_pending', 'posts_category', 'all-users']});
  Router.after( function () {
    analyticsInit(); // will only run once thanks to _.once()
    analyticsRequest() // log this request with mixpanel, etc
  });

  // Unload Hooks

  //

}

//--------------------------------------------------------------------------------------------------//
//------------------------------------------- Controllers ------------------------------------------//
//--------------------------------------------------------------------------------------------------//


// Controller for all posts lists



//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Routes ---------------------------------------------//
//--------------------------------------------------------------------------------------------------//

telescopeRoutes = function(appBaseUrl){
  baseUrl= appBaseUrl===undefined ? 'forum': appBaseUrl;
  appBaseUrl= appBaseUrl===undefined ? 'forum': appBaseUrl;
//  TelescopeConfig.siteUrl ='forum'

  PostsListController = FastRender.RouteController.extend({
    template:'telescope_posts_list',
    waitOn: function () {
      // take the first segment of the path to get the view, unless it's '/' in which case the view default to 'top'
      // note: most of the time this.params.slug will be empty
      this._terms = {
        view: (this.path == '/'+appBaseUrl) || (this.path == '/'+appBaseUrl+'/' ) ? 'top' : this.path.split('/')[2],
        limit: this.params.limit || getSetting('postsPerPage', 10),
        category: this.params.slug
      };

      if(Meteor.isClient) {
        this._terms.query = Session.get("searchQuery");
      }

      return [
        Meteor.subscribe('telescopePostsList', this._terms),
        Meteor.subscribe('telescopePostsListUsers', this._terms)
      ]
    },
    data: function () {
      var parameters = getParameters(this._terms),
        posts = Posts.find(parameters.find, parameters.options);
      postsCount = posts.count();

      Session.set('postsLimit', this._terms.limit);

      return {
        postsList: posts,
        postsCount: postsCount
      }
    },
    after: function() {
      var view = (this.path == '/'+appBaseUrl) || (this.path == '/'+appBaseUrl+'/' ) ? 'top'  : this.path.split('/')[2];
      Session.set('view', view);
    }
  });

// Controller for post digest

  PostsDigestController = FastRender.RouteController.extend({
    template: 'telescope_posts_digest',
    waitOn: function() {
      // if day is set, use that. If not default to today
      var currentDate = this.params.day ? new Date(this.params.year, this.params.month-1, this.params.day) : new Date(),
        terms = {
          view: 'digest',
          after: moment(currentDate).startOf('day').valueOf(),
          before: moment(currentDate).endOf('day').valueOf()
        }
      return [
        Meteor.subscribe('telescopePostsList', terms),
        Meteor.subscribe('telescopePostsListUsers', terms)
      ]
    },
    data: function() {
      var currentDate = this.params.day ? new Date(this.params.year, this.params.month-1, this.params.day) : Session.get('today'),
        terms = {
          view: 'digest',
          after: moment(currentDate).startOf('day').valueOf(),
          before: moment(currentDate).endOf('day').valueOf()
        },
        parameters = getParameters(terms);
      Session.set('currentDate', currentDate);
      return {
        posts: Posts.find(parameters.find, parameters.options)
      }
    }
  });

// Controller for post pages

  PostPageController = FastRender.RouteController.extend({
    template: 'telescope_post_page',
    waitOn: function () {
      return [
        Meteor.subscribe('telescopeSinglePost', this.params._id),
        Meteor.subscribe('telescopePostComments', this.params._id),
        Meteor.subscribe('telescopePostUsers', this.params._id)
      ];
    },
    data: function () {
      return {postId: this.params._id};
    },
    after: function () {
      window.queueComments = false;
      window.openedComments = [];
      // TODO: scroll to comment position
    }
  });

// Controller for comment pages

  CommentPageController = FastRender.RouteController.extend({
    waitOn: function() {
      return [
        Meteor.subscribe('telescopeSingleComment', this.params._id),
        Meteor.subscribe('telescopeCommentUser', this.params._id),
        Meteor.subscribe('telescopeCommentPost', this.params._id)
      ]
    },
    data: function() {
      return {
        comment: Comments.findOne(this.params._id)
      }
    },
    after: function () {
      window.queueComments = false;
    }
  });

// Controller for user pages

  UserPageController = FastRender.RouteController.extend({
    waitOn: function() {
      return Meteor.subscribe('telescopeSingleUser', this.params._idOrSlug);
    },
    data: function() {
      var findById = Meteor.users.findOne(this.params._idOrSlug);
      var findBySlug = Meteor.users.findOne({slug: this.params._idOrSlug});
      if(typeof findById !== "undefined"){
        // redirect to slug-based URL
        Router.go(getProfileUrl(findById), {replaceState: true});
      }else{
        return {
          user: (typeof findById == "undefined") ? findBySlug : findById
        }
      }
    }
  });


  Router.map(function() {

    // -------------------------------------------- Post Lists -------------------------------------------- //

    // Top

    // need to change render in
    this.route('posts_top', {
      path: '/'+appBaseUrl,
      controller: PostsListController,
      layoutTemplate:'telescope_layout'
    });


    this.route('posts_top', {
      path: '/'+appBaseUrl+'/top/:limit?',
      controller: PostsListController,
      layoutTemplate:'telescope_layout'
    });

    this.route('user_email', {
      template:'telescope_user_email',
      layoutTemplate:'telescope_layout'
    });



    // New

    this.route('posts_new', {
      path: '/'+appBaseUrl+'/new/:limit?',
      controller: PostsListController,
      layoutTemplate:'telescope_layout'
    });

    // Best

    this.route('posts_best', {
      path: '/'+appBaseUrl+'/best/:limit?',
      controller: PostsListController,
      layoutTemplate:'telescope_layout'
    });

    // Pending

    this.route('posts_pending', {
      path: '/'+appBaseUrl+'/pending/:limit?',
      controller: PostsListController,
      layoutTemplate:'telescope_layout'
    });

    // Categories

    this.route('posts_category', {
      path: '/'+appBaseUrl+'/category/:slug/:limit?',
      controller: PostsListController,
      layoutTemplate:'telescope_layout',
      after: function() {
        Session.set('categorySlug', this.params.slug);
      }
    });

    // TODO: enable /category/new, /category/best, etc. views

    // Search

    this.route('search', {
      path: '/'+appBaseUrl+'/search/:limit?',
      controller: PostsListController,
      layoutTemplate:'telescope_layout'
    });

    // Digest

    this.route('posts_digest', {
      path: '/'+appBaseUrl+'/digest/:year/:month/:day',
      controller: PostsDigestController,
      layoutTemplate:'telescope_layout'
    });

    this.route('posts_digest', {
      path: '/'+appBaseUrl+'/digest',
      controller: PostsDigestController,
      layoutTemplate:'telescope_layout'
    });

    // -------------------------------------------- Post -------------------------------------------- //


    // Post Page

    this.route('post_page', {
      path: '/'+appBaseUrl+'/posts/:_id',
      controller: PostPageController,
      layoutTemplate:'telescope_layout'
    });

    this.route('post_page', {
      path: '/'+appBaseUrl+'/posts/:_id/comment/:commentId',
      controller: PostPageController,
      layoutTemplate:'telescope_layout',
      after: function () {
        // TODO: scroll to comment position
      }
    });

    // Post Edit

    this.route('post_edit', {
      template:'telescope_post_edit',
      path: '/'+appBaseUrl+'/posts/:_id/edit',
      layoutTemplate:'telescope_layout',
      waitOn: function () {
        return Meteor.subscribe('telescopeSinglePost', this.params._id);
      },
      data: function() {
        return {postId: this.params._id};
      },
      fastRender: true
    });

    // Post Submit

    this.route('post_submit', {
      template:'telescope_post_submit',
      path: '/'+appBaseUrl+'/submit',
      layoutTemplate:'telescope_layout'});

    // -------------------------------------------- Comment -------------------------------------------- //

    // Comment Page

    this.route('comment_page', {
      template:'telescope_comment_page',
      path: '/'+appBaseUrl+'/comments/:_id',
      controller: CommentPageController,
      layoutTemplate:'telescope_layout'
    });

    // Comment Reply

    this.route('comment_reply', {
      template:'telescope_comment_reply',
      path: '/'+appBaseUrl+'/comments/:_id/reply',
      controller: CommentPageController,
      layoutTemplate:'telescope_layout',
      after: function() {
        window.queueComments = false;
      }
    });

    // Comment Edit

    this.route('comment_edit', {
      template:'telescope_comment_edit',
      path: '/'+appBaseUrl+'/comments/:_id/edit',
      controller: CommentPageController,
      layoutTemplate:'telescope_layout',
      after: function() {
        window.queueComments = false;
      }
    });

    // -------------------------------------------- Users -------------------------------------------- //

    // User Profile

    this.route('user_profile', {
      path: '/'+appBaseUrl+'/users/:_idOrSlug',
      template:'telescope_user_profile',
      controller: UserPageController,
      layoutTemplate:'telescope_layout'
    });

    // User Edit

    this.route('user_edit', {
      path: '/'+appBaseUrl+'/users/:_idOrSlug/edit',
      template:'telescope_user_edit',
      controller: UserPageController,
      layoutTemplate:'telescope_layout'
    });

    // Account

    this.route('account', {
      path: '/'+appBaseUrl+'/account',
      template:'telescope_user_edit',
      layoutTemplate:'telescope_layout',
      data: function() {
        return {
          user: Meteor.user()
        }
      }
    });

    // Forgot Password

    this.route('forgot_password',{
      path:'/'+appBaseUrl+'/forgot_password',
      layoutTemplate:'telescope_layout'
    });

    // All Users

    this.route('all-users', {
      path: '/'+appBaseUrl+'/all-users/:limit?',
      template: 'telescope_users',
      layoutTemplate:'telescope_layout',
      waitOn: function() {
        var limit = parseInt(this.params.limit) || 20;
        return Meteor.subscribe('telescopeAllUsers', this.params.filterBy, this.params.sortBy, limit);
      },
      data: function() {
        var limit = parseInt(this.params.limit) || 20,
          parameters = getUsersParameters(this.params.filterBy, this.params.sortBy, limit),
          filterBy = (typeof this.params.filterBy === 'string') ? this.params.filterBy : 'all',
          sortBy = (typeof this.params.sortBy === 'string') ? this.params.sortBy : 'createdAt';
        Session.set('usersLimit', limit);
        return {
          users: Meteor.users.find(parameters.find, parameters.options),
          filterBy: filterBy,
          sortBy: sortBy
        }
      },
      fastRender: true
    });

    // Unsubscribe (from notifications)

    this.route('unsubscribe', {
      path: '/'+appBaseUrl+'/unsubscribe/:hash',
      layoutTemplate:'telescope_layout',
      data: function() {
        return {
          hash: this.params.hash
        }
      }
    });


    // User Login In
    this.route('loginForm',{
      path:'/'+appBaseUrl+'/login',
      layoutTemplate:'telescope_layout'
    });

    // User Sign-Up
    this.route('signup',{
      path:'/'+appBaseUrl+'/signup',
      layoutTemplate:'telescope_layout'
    });

    // User Sign-In
    this.route('signin',{
      path:'/'+appBaseUrl+'/signin',
      layoutTemplate:'telescope_layout'
    });


    // -------------------------------------------- Other -------------------------------------------- //

    // Categories

    this.route('categories',{
      template:'telescope_categories',
      path: '/'+appBaseUrl+'/categories',
      layoutTemplate:'telescope_layout'
    });

    // Loading (for testing purposes)

    this.route('loading',{
      path:'/'+appBaseUrl+'/loading',
      layoutTemplate:'telescope_layout'
    });

    // Search Logs

    this.route('logs', {
      template:'telescope_logs',
      path: '/'+appBaseUrl+'/logs/:limit?',
      layoutTemplate:'telescope_layout',
      waitOn: function () {
        var limit = this.params.limit || 100;
        if(Meteor.isClient) {
          Session.set('logsLimit', limit);
        }
        return Meteor.subscribe('telescopeSearches', limit);
      },
      data: function () {
        return Searches.find({}, {sort: {timestamp: -1}});
      },
      fastRender: true
    });



  });
}

telescopeRoutesServer= function(appBaseUrl) {
  baseUrl= appBaseUrl===undefined ? 'forum': appBaseUrl;
  appBaseUrl= appBaseUrl===undefined ? 'forum': appBaseUrl;

  Router.map(function() {
    // -------------------------------------------- Server-Side -------------------------------------------- //

    this.route('api', {
      where: 'server',
      path: '/'+appBaseUrl+'/api',
      layoutTemplate:'telescope_layout',
      action: function() {
        this.response.write(serveAPI());
        this.response.end();
      }
    });

    this.route('apiWithParameter', {
      where: 'server',
      path: '/'+appBaseUrl+'/api/:limit',
      layoutTemplate:'telescope_layout',
      action: function() {
        this.response.write(serveAPI(this.params.limit));
        this.response.end();
      }
    });

    // RSS

    this.route('feed', {
      where: 'server',
      path: '/'+appBaseUrl+'/feed.xml',
      layoutTemplate:'telescope_layout',
      action: function() {
        this.response.write(serveRSS());
        this.response.end();
      }
    });

    // Link Out

    this.route('out', {
      where: 'server',
      path: '/'+appBaseUrl+'/out',
      action: function(){
        var query = this.request.query;
        if(query.url){
          var post = Posts.findOne({url: query.url});
          if(post){
            Posts.update({_id: post._id}, {$inc: {clicks: 1}});
          }
          this.response.writeHead(302, {'Location': query.url});
          this.response.end();
        }
      }
    });
  })
}

// adding common subscriptions that's need to be loaded on all the routes
// notification does not included here since it is not much critical and 
// it might have considerable amount of docs
if(Meteor.isServer) {
  FastRender.onAllRoutes(function() {
    var router = this;
    _.each(preloadSubscriptions, function(sub){
      router.subscribe(sub);
    });
  });
}
