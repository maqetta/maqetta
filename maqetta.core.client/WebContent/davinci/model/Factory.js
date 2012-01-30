define([
	"dojo/_base/declare",
	"davinci/html/CSSFile",
	"davinci/js/JSFile",
	"davinci/html/HTMLFile"
], function(declare, CSSFile, JSFile, HTMLFile) {

if (typeof davinci.model === "undefined") { davinci.model={}; }
if (typeof davinci.model.Factory === "undefined") { davinci.model.Factory={}; }

return declare("davinci.model.Factory", null, {

	constructor: function() {
		this._resources = [];
		this._instances = [];
	},

	getInstance: function(){
		if (davinci.model.Factory._instance == null) {
			davinci.model.Factory._instance = new davinci.model.Factory();
		}
		return davinci.model.Factory._instance;
	},

	/* return a model based on resource */
	getModel: function(args) {
		var url = args.url;
		if (!url) {
			return null;
		}
		for (var i = 0; i<this._resources.length; i++) {
			if (this._resources[i].url == url) {
				this._instances[i]++;
				return this._resources[i];
			}
		}
		if (url.indexOf("css") > 0) {
			return davinci.model.Factory.newCSS(args);
		}
		if (url.indexOf("html") > 0) {
			return davinci.model.Factory.newHTML(args);
		}
		if(url.indexOf("js") > 0) {
			return davinci.model.Factory.newJS(args);
		}
	},

	closeModel: function(model) {
		var url = model.url;
		if (!url) {
			return null;
		}
		for(var i = 0; i<this._resources.length; i++) {
			if (this._resources[i].url == url) {
				this._instances[i]--;
				if (this._instances[i] == 0) {
					this._resources.splice(i,1);
					this._instances.splice(i,1);
				}
			}
		}
	},

	newHTML: function(args) {
		if (args && args.url) {
			return davinci.model.Factory.getInstance().getModel(args);
		}
		var model = new HTMLFile(args);
		davinci.model.Factory.getInstance()._resources.push(model);
		var count = davinci.model.Factory.getInstance()._resources.length - 1;
		davinci.model.Factory.getInstance()._instances[count] = 1;
		return model;
	},

	newCSS: function(args) {
		var model = new CSSFile(args);
		davinci.model.Factory.getInstance()._resources.push(model);
		var count = davinci.model.Factory.getInstance()._resources.length - 1;
		davinci.model.Factory.getInstance()._instances[count] = 1;
		return model;
	},

	newJS: function(args) {
		var model = new JSFile(args);
		davinci.model.Factory.getInstance()._resources.push(model);
		var count = davinci.model.Factory.getInstance()._resources.length - 1;
		davinci.model.Factory.getInstance()._instances[count] = 1;
		return model;
	},

	getNewFromResource: function(resource) {
		var extension = resource.extension;
		if(!extension) { return davinci.model.Factory.newHTML();} // default to HTML

		switch(extension) {
		case "html": 
			return davinci.model.Factory.newHTML();
			break;

		case "css": 
			return davinci.model.Factory.newCSS();
			break;

		case "js":
		case "json": 
			return davinci.model.Factory.newJS();
			break;

		default: 
			return davinci.model.Factory.newHTML(); // default to HTML
		}; // end switch
	}

});
});

