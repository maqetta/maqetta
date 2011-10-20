define([
   "dojo/_base/lang",
   "dojo/_base/declare", // declare
   "system/model/resource",
   "davinci/model/Path",
   "davinci/system/resource",
   'orion/serviceregistry'
   
   
],function(lang, declare, resource, path,resource, mServiceregistry){
   
   //this.subscriptions = [dojo.subscribe("/davinci/resource/resourceChanged",system.resource, function(){return system.resource.resourceChanged;}())];
   var orionResource = declare("system.resource", [davinci.system.resource]);
   var serviceRegistry = new mServiceregistry.ServiceRegistry();
   
   var fileClient = serviceRegistry.getServiceReferences("orion.core.file");;
   return lang.mixin(orionResource,{
       createProject: function(name,includeResources){
    	   debugger;
    	   console.log(fileClient);
       }
   })
   
});