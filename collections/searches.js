Searches = new Meteor.Collection('telescopeSearches');

Searches.allow({
  update: isAdminById
, remove: isAdminById
});

