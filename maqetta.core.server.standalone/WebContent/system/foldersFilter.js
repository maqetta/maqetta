define(["dojo/_base/declare"],function(declare){
	return dojo.declare("system.resource.foldersFilter",null,{
	   filterItem: function(item)
	   {
	       if (item.elementType=='File') {
		    	return true;
	       }
	   }
	});
});