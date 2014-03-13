Template.comment_form.rendered = function(){
  console.log('rendeding ')
  if(Meteor.user() && !this.editor){
    this.editor = new EpicEditor(EpicEditorOptions).load();
    console.log('edipc editor loaded')
    $(this.editor.editor).bind('keydown', 'meta+return', function(){
      $(window.editor).closest('form').find('input[type="submit"]').click();
    });
  }
}

Template.comment_form.events({
  'submit form': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');
    clearSeenErrors();
//    var content = instance.editor.exportFile();
    var content = $('.editor').val()
    if(getCurrentTemplate() == 'comment_reply'){
      // child comment
      var parentComment = this.comment;
      console.log(parentComment)
      Meteor.call('comment', parentComment.post, parentComment._id, content, function(error, commentProperties){
        if(error){
          console.log(error);
          throwError(error.reason);
        }else{
          $('.editor').val(' ')
          trackEvent("newComment", commentProperties);
          Router.go('/'+baseUrl+'/posts/'+parentComment.post+'/comment/'+commentProperties.commentId);
        }
      });
    }else{
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
//          instance.editor.importFile('editor', '');

        }
      });
      $('.editor').val(' ')
    }
  }
});