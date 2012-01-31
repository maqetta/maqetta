define([
	"dojo/_base/declare",
	"davinci/html/CSSFile",
	"davinci/js/JSFile",
	"davinci/html/HTMLFile"
], function(declare, CSSFile, JSFile, HTMLFile) {

var _instances = [];
var _resources = [];

var Factory = {

	/* return a model based on resource */
	getModel: function(args) {
		var url = args.url;
		if (!url) {
			return null;
		}
		for (var i = 0; i<_resources.length; i++) {
			if (_resources[i].url == url) {
				_instances[i]++;
				return _resources[i];
			}
		}
		if (url.indexOf("css") > 0) {
			return Factory.newCSS(args);
		}
		if (url.indexOf("html") > 0) {
			return Factory.newHTML(args);
		}
		if(url.indexOf("js") > 0) {
			return Factory.newJS(args);
		}
	},

	closeModel: function(model) {
		var url = model.url;
		if (!url) {
			return null;
		}
		for(var i = 0; i<_resources.length; i++) {
			if (_resources[i].url == url) {
				_instances[i]--;
				if (_instances[i] == 0) {
					_resources.splice(i,1);
					_instances.splice(i,1);
				}
			}
		}
	},

	newHTML: function(args) {
		if (args && args.url) {
			return Factory.getModel(args);
		}
		var model = new HTMLFile(args);
		_resources.push(model);
		var count = _resources.length - 1;
		_instances[count] = 1;
		return model;
	},

	newCSS: function(args) {
		var model = new CSSFile(args);
		_resources.push(model);
		var count = _resources.length - 1;
		_instances[count] = 1;
		return model;
	},

	newJS: function(args) {
		var model = new JSFile(args);
		_resources.push(model);
		var count = _resources.length - 1;
		_instances[count] = 1;
		return model;
	},

	getNewFromResource: function(resource) {
		var extension = resource.extension;
		if (!extension) { return Factory.newHTML(); } // default to HTML

		switch(extension) {
		case "html": 
			return Factory.newHTML();
			break;
		case "css": 
			return Factory.newCSS();
			break;
		case "js":
		case "json": 
			return Factory.newJS();
			break;
		default: 
			return Factory.newHTML(); // default to HTML
		} // end switch
	}
};

var _connection = require(["dojo/_base/connect"], function(connect) {
	connect.subscribe("davinci/model/closeModel", /*context*/ Factory, Factory.closeModel);
}); 

return Factory;

});