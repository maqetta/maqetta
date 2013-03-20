define([
	"../html/CSSFile",
	"../js/JSFile",
	"../html/HTMLFile",
	"system/resource"
], function(CSSFile, JSFile, HTMLFile, systemResource) {

var _instances = [],
	_resources = [];

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
				this.incrementImports(_resources[i]); 
				//this.log();
				return _resources[i];
			}
		}
		if (/\.html?$/i.test(url)) {
			return Factory.newHTML(args);
		}
		if (/\.css$/i.test(url)) {
			return Factory.newCSS(args);
		}
		if(/\.js$/i.test(url)) {
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
				var modelResource = _resources[i];
				_instances[i]--;
				if (_instances[i] === 0) {
					_resources.splice(i,1);
					_instances.splice(i,1);
					// delete the working copy, we are done with it, and their should only 
					// be a working copy if the last instance did not save it when they closed the
					// editor.
					var resource = systemResource.findResource(url);
					if (resource && resource.dirtyResource){ // models can be created without a real resource.
						resource.removeWorkingCopy(); 
						resource.dirtyResource = false;
					}
				}
			}
		}
		//this.log();
	},

	newHTML: function(args) {

		var model = new HTMLFile(args.url);
		_resources.push(model);
		var count = _resources.length - 1;
		_instances[count] = 1;
		//this.log();
		return model;
	},

	newCSS: function(args) {
		var model = new CSSFile(args);
		_resources.push(model);
		var count = _resources.length - 1;
		_instances[count] = 1;
		//this.log();
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
		// temp models, no need to singleton them....
		var extension = resource.extension;
		if (!extension) { return new HTMLFile(); } // default to HTML

		switch(extension) {
		case "html": 
			return new HTMLFile(); //Factory.newHTML();
			break;
		case "css": 
			return new CSSFile(); //Factory.newCSS();
			break;
		case "js":
		case "json": 
			return new JSFile(); //Factory.newJS();
			break;
		default: 
			return new HTMLFile(); // default to HTML
		} // end switch
	},
	
	incrementImports: function(resource){
		var visitor = {
				visit: function(node){
					if( node.elementType=="CSSImport"){
						var url = node.cssFile.url;
						for (var i = 0; i<_resources.length; i++) {
							if (_resources[i].url == url) {
								_instances[i]++;
							}
						}
						
					}
					return false;
				}
			};
			
		if (resource) {
			resource.visit(visitor);
		}
		
	},
	
	log: function(){
		console.log('=============Factory.log============');
		for(var i = 0; i<_resources.length; i++) {
			console.log(_resources[i].url+' : '+ _instances[i]); 
		}
		console.log('===========================================');
	}
};

var _connection = require(["dojo/_base/connect"], function(connect) {
	connect.subscribe("davinci/model/closeModel", /*context*/ Factory, Factory.closeModel);
}); 

return Factory;

});