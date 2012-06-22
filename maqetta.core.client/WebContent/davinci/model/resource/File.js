  /**  
   * @class davinci.model.resource.File
     * @constructor 
     * @extends davinci.model.resource.Resource
   */
 define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/model/resource/Resource",
	"davinci/model/resource/Marker"
], function(declare, Runtime, Resource, Marker) {

return declare("davinci.model.resource.File", Resource, {

	constructor: function(name,parent) {
		this.elementType = "File";
		this.name = name;
		this.parent = parent;
		this.markers = [];
		this.extension = name.substr(name.lastIndexOf('.') + 1);
	},

	getExtension: function() {
		return this.extension;
	},

	clearMarkers: function() {
		this.markers=[];
	},

	addMarker: function(type,line,text) {
		var marker = new Marker(this, type, line, text);
		this.markers.push(marker);
	},

	getMarkers: function(markerTypes) {
		var result=[];
		if (this.markers)
			for (var i=0; i<this.markers.length; i++)
			{
				var marker = this.markers[i];
				if (!markerTypes) {
					result.push(marker);
				} else if (typeof markerTypes == 'string') { 
					if (marker.type == markerTypes) {
						result.push(marker);
					}
				} else {
					dojo.forEach(markerTypes,function (type) {
						if (type == marker.type) {
							result.push(marker);
						}
					});
				}
			}
		return result;
	},

	setContents: function(content, isWorkingCopy){
		var workingCopy = isWorkingCopy ? "true" : "false";
		if (this.isNew && !isWorkingCopy) {
			this.isNew = false;
		}
		var workingCopyExtension = isWorkingCopy ? ".workingcopy" : "";
		var path = encodeURI(this.getPath() + workingCopyExtension);
		var deferred = dojo.xhrPut({
			url: path,
			putData: content,
			handleAs:"text",
			contentType:"text/html"
		});	
		deferred.then(function(res){
			dojo.publish("/davinci/resource/resourceChanged", ["modified", this]);
		}, function(err){
			// This shouldn't occur, but it's defined just in case
			// more meaningful error message should be reported to user higher up the food chain...
			console.error("An error occurred: davinci.model.resource.File.prototype.setContents " + err + " : " + path);
		});
		return deferred;
	},

	getText: function(){
		return Runtime.serverJSONRequest({
			url: this.getURL(), handleAs:"text", sync:true
		});
	},

	removeWorkingCopy: function() {
		Runtime.serverJSONRequest({
			url:"cmd/removeWorkingCopy",
			handleAs:"text",
			content:{path: this.getPath()},
			sync:true
		});
		if (this.isNew) {
			this.deleteResource(true);
		}
	}
   
});
});

