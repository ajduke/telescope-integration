Template.telescope_nav.helpers({
  site_title: function(){
    return getSetting('title');
  },
  logo_url: function(){
    return getSetting('logoUrl');
  },
  logo_height: function(){
    return getSetting('logoHeight');
  },
  logo_width: function(){
    return getSetting('logoWidth');
  },
  logo_top: function(){
    return Math.floor((70-getSetting('logoHeight'))/2);
  },  
  logo_offset: function(){
    return -Math.floor(getSetting('logoWidth')/2);
  },
  intercom: function(){
    return !!getSetting('intercomId');
  },
  canPost: function(){
    return canPost(Meteor.user());
  },
  requirePostsApproval: function(){
    return getSetting('requirePostsApproval');
  },
  hasCategories: function(){
    return Categories.find().count();
  },
  categories: function(){
    return Categories.find({}, {sort: {name: 1}});
  },
  categoryLink: function () {
    return getCategoryUrl(this.slug);
  },
  pendingURL: function(){
    return '/'+baseUrl+'/pending';
  },
  categoriesURL: function(){
    return '/'+baseUrl+'/categories';
  },
  allUsersURL: function(){
    return '/'+baseUrl+'/all-users';
  },
  logsURL: function(){
    return '/'+baseUrl+'/logs';
  },
  toolboxURL:function(){
    return '/'+baseUrl+'/toolbox';
  },
  submitURL:function(){
    return '/'+baseUrl+'/submit';
  },
  viewProfileURL: function(){
    return "/"+baseUrl+'/users/'+Meteor.user().slug;
  },
  editProfileURL: function(){
    return '/'+baseUrl+'/account';
  },
  topURL: function(){
    return '/'+baseUrl+'/top';
  },
  newURL: function(){
    return '/'+baseUrl+'/new';
  },
  digestURL: function(){
    return '/'+baseUrl+'/digest';
  },
  bestURL: function(){
    return '/'+baseUrl+'/best';
  },
  enableCategories: function(){
    return typeof TelescopeConfig.enableCategories  === 'undefined' ? true : TelescopeConfig.enableCategories
  }

});


Template.telescope_nav.loggedInUserName=function(){
  return Meteor.user().profile.name;
}

Template.telescope_nav.events({
  'click #logout': function(e){
    e.preventDefault();
    Meteor.logout();
  },
  'click .signout': function(e){
    e.preventDefault();
    Router.go('/'+baseUrl)
    Meteor.logout();
    throwError("You are successfully logged out, Login again to post.")
  },
  'click #mobile-menu': function(e){
    e.preventDefault();
    $('body').toggleClass('mobile-nav-open');
  },
  'click .login-header': function(e){
    e.preventDefault();
    Router.go('/account');
  }
});