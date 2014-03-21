
Template.telescope_comment_form.events({
  'submit form': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');
    clearSeenErrors();
//    var content = instance.editor.exportFile();
    var content = $('.editor').val()
      // root comment
      // console.log(postObject)
      var post = postObject;

      Meteor.call('comment', post._id, null, content, function(error, commentProperties){
        if(error){
          console.log(error);
          throwError(error.reason);
        }else{
          trackEvent("newComment", commentProperties);
          Session.set('scrollToCommentId', commentProperties.commentId);

        }
      });
      $('.editor').val(' ')
  }
});