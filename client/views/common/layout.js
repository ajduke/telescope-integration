Template.telescope_layout.helpers({
  pageName : function(){
    getCurrentTemplate();
  },
  backgroundColor: function(){
  	return getSetting('backgroundColor');
  },
  secondaryColor: function(){
  	return getSetting('secondaryColor');
  },
  buttonColor: function(){
  	return getSetting('buttonColor');
  },
  headerColor: function(){
  	return getSetting('headerColor');
  },
  extraCode: function(){
    return getSetting('extraCode');
  },
  enabledNotification: function(){
    return TelescopeConfig.enableNotifications;
  },
  bgColor:function(){
    return  typeof TelescopeConfig.backgroudColor  === 'undefined' ? '#F6F4F2' : TelescopeConfig.backgroudColor ;
  }
});

Template.telescope_layout.created = function(){
  Session.set('currentScroll', null);
}

Template.telescope_layout.rendered = function(){
    if(currentScroll=Session.get('currentScroll')){
      $('body').scrollTop(currentScroll);
      Session.set('currentScroll', null);
    }

    // set title
    var title = getSetting("title");
    var tagline = getSetting("tagline");
    document.title = (tagline ? title+': '+tagline : title) || "";
}
