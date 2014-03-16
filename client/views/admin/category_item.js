Template.category_item.events({
  'click .edit-link': function(e, instance){
    e.preventDefault();
    var categoryId = instance.data._id;
    console.log(categoryId)
    var name = $('#name_'+categoryId).val();
    console.log('name '+name)
    var slug = slugify(name);
    console.log('slug '+slug)
    if(name){
      Categories.update(categoryId,{ $set: {name: name, slug: slug}});
    }else{
      Categories.remove(categoryId);
    }
    Meteor.call('updateCategoryInPosts', categoryId, function(error) {
      if (error) {
        throwError(error.reason);
      }
    });
    }
})