   /**  
    * @class davinci.model.resource.Marker
      * @constructor 
    */
define([
	"dojo/_base/declare",
	"davinci/model/resource/Resource"
], function(declare, Resource) {

return declare("davinci.model.resource.Marker", Resource, {

	constructor: function(resource, type, line, text) {
		this.resource = resource;
		this.type = type;
		this.line = line;
		this.text = text;
	}

});
});
   
