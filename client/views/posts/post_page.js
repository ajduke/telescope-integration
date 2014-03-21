Template.telescope_post_page.helpers({
  post: function () {
    return Posts.findOne(this.postId);
  },
  body_formatted: function(){
    return this.body;
  },
  canComment: function(){
    return canComment(Meteor.user());
  }
}); 

Template.telescope_post_page.rendered = function(){
  if((scrollToCommentId=Session.get('scrollToCommentId')) && !this.rendered && $('#'+scrollToCommentId).exists()){
    scrollPageTo('#'+scrollToCommentId);
    Session.set('scrollToCommentId', null);
    this.rendered=true;
  }
  document.title = this.data.headline;
}
