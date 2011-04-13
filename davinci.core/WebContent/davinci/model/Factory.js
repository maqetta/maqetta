dojo.provide("davinci.model.Factory");
dojo.require("davinci.html.CSSModel");
dojo.require("davinci.html.HTMLModel");


if (!davinci)
	davinci={};
if (!davinci.model)
	 davinci.model={};
if (!davinci.model.Factory)
	 davinci.model.Factory={};

davinci.model.Factory= function(){
	this._resources = [];
	this._instances = [];
}

davinci.model.Factory.getInstance= function(){
	if(davinci.model.Factory._instance==null)
		davinci.model.Factory._instance = new davinci.model.Factory();
	
	return davinci.model.Factory._instance;
}

/* return a model based on resource */
davinci.model.Factory.prototype.getModel = function( args  ){
	
	var url = args.url;

	if(!url)
		return null;
	/*
	if(!window.debugTarget && url.indexOf('css') > 0 ){
		window.debugTarget = url;
		debugger;
	}
	*/
	
	for(var i = 0;i<this._resources.length;i++){
		if(this._resources[i].url==url){
			this._instances[i]++;
			return this._resources[i];
		}
	}
	
	if(url.indexOf("css")>0)
		return davinci.model.Factory.newCSS(args);
	
	if(url.indexOf("html")> 0)
		return davinci.model.Factory.newHTML(args);
	
	if(url.indexOf("js")> 0)
		return davinci.model.Factory.newJS(args);
}

davinci.model.Factory.prototype.closeModel = function( model  ){
	
	var url = model.url;
	if(!url)
		return null;
	for(var i = 0;i<this._resources.length;i++){
		if(this._resources[i].url==url){
			
			this._instances[i]--;
			if(this._instances[i]==0){
				this._resources.splice(i,1);
				this._instances.splice(i,1);
			}
		}
	}
}

davinci.model.Factory.newHTML = function( args ){
//	debugger;
	if(args && args.url)
		return davinci.model.Factory.getInstance().getModel(args);
	var model = new davinci.html.HTMLFile(args);
	davinci.model.Factory.getInstance()._resources.push(model);
	var count = davinci.model.Factory.getInstance()._resources.length-1;
	davinci.model.Factory.getInstance()._instances[count] = 1;
	
	return model;

}

davinci.model.Factory.newCSS = function( args  ){
	
	var model = new davinci.html.CSSFile(args);
	davinci.model.Factory.getInstance()._resources.push(model);
	var count = davinci.model.Factory.getInstance()._resources.length-1;
	davinci.model.Factory.getInstance()._instances[count] = 1;
	return model;
}

davinci.model.Factory.newJS = function( args  ){
	var model = new davinci.js.JSFile(args);
	davinci.model.Factory.getInstance()._resources.push(model);
	var count = davinci.model.Factory.getInstance()._resources.length-1;
	davinci.model.Factory.getInstance()._instances[count] = 1;
	
	return model;
	
}



