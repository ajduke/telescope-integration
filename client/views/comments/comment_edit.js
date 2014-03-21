Template.telescope_comment_edit.rendered = function(){
}

Template.telescope_comment_edit.events({
  'click input[type=submit]': function(e, instance){
    var comment = this;
    var content  = $('.edt').val();

    e.preventDefault();

    if(!Meteor.user())
      throw i18n.t('You must be logged in.');

    Comments.update(comment._id, {
      $set: {
        body: content
      }
    });

    trackEvent("edit comment", {'postId': comment.post, 'commentId': comment._id});
    Router.go('/'+baseUrl+"/posts/"+comment.post+"/comment/"+comment._id);
  },
  'click .delete-link': function(e){
    var comment = this;

    e.preventDefault();
    
    if(confirm(i18n.t("Are you sure?"))){
      console.log('comment._id '+comment._id)
      Meteor.call('removeComment', comment._id);
      Router.go('/'+baseUrl+"/posts/"+comment.post)
      throwError("Your comment has been deleted.");

    }
  }
});