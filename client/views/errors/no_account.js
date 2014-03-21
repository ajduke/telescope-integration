Template.telescope_no_account.helpers({
  landingPageText: function(){
    return getSetting("landingPageText");
  }
});
Template.telescope_no_account.events({
  'click .twitter-button': function(){
    Meteor.loginWithTwitter(function(){
		Router.go('/');
    });
  }
});