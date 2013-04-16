  /**  
   * @class davinci.model.resource.File
     * @constructor 
     * @extends davinci.model.resource.Resource
   */
define([
	"dojo/_base/declare",
	"dojo/_base/xhr",
	"davinci/Runtime",
	"davinci/model/resource/Resource",
	"davinci/model/resource/Marker",
	"davinci/ve/utils/URLRewrite"
], function(declare, xhr, Runtime, Resource, Marker, URLRewrite) {

return declare("davinci.model.resource.File", Resource, {

	constructor: function(name,parent) {
		this.elementType = "File";
		this.name = name;
		this.parent = parent;
		this.markers = [];
		this.extension = name.substr(name.lastIndexOf('.') + 1);
	},

	// deprecated.  use extension property instead
	getExtension: function() {
		return this.extension;
	},

	clearMarkers: function() {
		this.markers = [];
	},

	addMarker: function(type,line,text) {
		this.markers.push(new Marker(this, type, line, text));
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
		if (this.isNew && !isWorkingCopy) {
			this.isNew = false;
		}
		var workingCopyExtension = isWorkingCopy ? ".workingcopy" : "";
		var path = encodeURI(this.getPath() + workingCopyExtension);
		var promise = xhr.put({
			url: path,
			putData: content,
			handleAs: "text",
			contentType: "text/html"
		});
		promise.then(function(res){
			this.dirtyResource = isWorkingCopy;
			dojo.publish("/davinci/resource/resourceChanged", ["modified", this]);
			return this;
		}.bind(this), function(err){ 
			// more meaningful error message should be reported to user higher up the food chain...
			console.error("An error occurred: davinci.model.resource.File.prototype.setContents " + err + " : " + path);
			return err;
		});
		return promise;
	},

	// deprecated.  Use getContent instead.
	getContentSync: function(){
		return Runtime.serverJSONRequest({
			url: URLRewrite.encodeURI(this.getURL()),
			handleAs: "text",
			sync: true
		});
	},

	getContent: function() {
		return xhr.get({
			url: URLRewrite.encodeURI(this.getURL()),
			handleAs: "text"
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

