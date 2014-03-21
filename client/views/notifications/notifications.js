Template.telescope_notifications.helpers({
  notifications: function(){
    return Notifications.find({userId: Meteor.userId()}, {sort: {timestamp: -1}});
  },
  notification_count: function(){
  	var notifications=Notifications.find({userId: Meteor.userId(), read: false}).fetch();
  	if(notifications.length==1){
  		return '1';
  	}else{
  		return notifications.length;
  	}
  },
  notification_class: function(){
    var notifications=Notifications.find({userId: Meteor.userId(), read: false}).fetch();
  	if(notifications.length==0)
  		return 'no-notifications';
  }
});

Template.telescope_notifications.events({
	'click .notifications-toggle': function(e){
    e.preventDefault();
		$('body').toggleClass('notifications-open');
	},
	'click .mark-as-read': function(){
    Meteor.call('markAllNotificationsAsRead', 
      function(error, result){
        error && console.log(error);
      }
    );
	}
})
