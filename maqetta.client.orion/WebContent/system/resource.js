define([
   "dojo/_base/lang",
   "dojo/_base/declare", // declare
   "system/model/Resource",
   "davinci/model/Path",
   'orion/serviceregistry'
   
   
   
],function(lang, declare,resource, path, mServiceregistry){
   debugger;

	/* hijack the window openers resource to hook into orion */
	if(window.opener && window.opener.maqetta && window.opener.maqetta.system && window.opener.maqetta.system.resource){
		return dojo.declare("system.resource", [window.opener.maqetta.system.resource]);
	}
	
   //this.subscriptions = [dojo.subscribe("/davinci/resource/resourceChanged",system.resource, function(){return system.resource.resourceChanged;}())];
   var orionResource = dojo.declare("system.resource",[],{});
   var serviceRegistry = new mServiceregistry.ServiceRegistry();
   debugger;
   var fileClient = serviceRegistry.getServiceReferences("orion.core.file");;
   return lang.mixin(orionResource,{
       createProject: function(name,includeResources){
    	   debugger;
    	   console.log(fileClient);
       }
   })
   
});