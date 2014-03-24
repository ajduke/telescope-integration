Template.telescope_posts_list.helpers({
  posts : function () {
    this.postsList.rewind();    
    var posts = this.postsList.map(function (post, index, cursor) {
      post.rank = index;
      return post;
    });
    return posts;
  },
  hasMorePosts: function(){
    // as long as we ask for N posts and all N posts showed up, then keep showing the "load more" button
    return parseInt(Session.get('postsLimit')) == this.postsCount
  },
  loadMoreUrl: function () {
    var count = parseInt(Session.get('postsLimit')) + parseInt(getSetting('postsPerPage', 10));
    var categorySegment = Session.get('categorySlug') ? Session.get('categorySlug') + '/' : '';
    return '/'+baseUrl+'/' + Session.get('view') + '/' + categorySegment + count;
  },
  currentPage:function(){
    return capitalise(Session.get('view'))
  },
  isCategoryPage: function(){
    return Session.get('view')==='category'
  },
  getCategorySlug: function(){
    return Session.get('categorySlug')
  },isSearchPage: function(){
    return Session.get('view')==='search'
  },
  searchQueryTerm : function(){
    return Session.get('searchQuery')
  }



});

var capitalise = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

Template.telescope_posts_list.rendered = function(){
  var distanceFromTop = 0;
  $('.post').each(function(){
    distanceFromTop += $(this).height();
  });
  Session.set('distanceFromTop', distanceFromTop);
  $('body').css('min-height',distanceFromTop+160);
}

