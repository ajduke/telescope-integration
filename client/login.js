Template.loginForm.events({
 'click .btn-twitter' : function(e){
   Meteor.loginWithTwitter(function(err){
     console.log('login with twitter called')
     if(err){
       Session.set('loginStatus','failed');
       console.log('login with Twitter Failed')
     }else{
       Router.go('/forum')

     }
   })
  }

})
