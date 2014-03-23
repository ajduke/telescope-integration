Settings = new Meteor.Collection('telescopeSettings');

Settings.allow({
  insert: isAdminById
, update: isAdminById
, remove: isAdminById
});

