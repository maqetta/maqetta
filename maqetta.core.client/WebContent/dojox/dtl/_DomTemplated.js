dojo.provide("dojox.dtl._DomTemplated");

dojo.require("dijit._Templated");
dojo.require("dojox.dtl.dom");
dojo.require("dojox.dtl.render.dom");
dojo.require("dojox.dtl.contrib.dijit");

dojox.dtl._DomTemplated = function(){};
dojox.dtl._DomTemplated.prototype = {
	_dijitTemplateCompat: false,
	buildRendering: function(){
		//	summary:
		//		Construct the UI for this widget, setting this.domNode.

		//render needs a domNode to work with
		this.domNode = this.srcNodeRef;

		if(!this._render){
			var ddcd = dojox.dtl.contrib.dijit;
			var old = ddcd.widgetsInTemplate;
			ddcd.widgetsInTemplate = this.widgetsInTemplate;
			this.template = this.template || this._getCachedTemplate(this.templatePath, this.templateString);
			this._render = new dojox.dtl.render.dom.Render(this.domNode, this.template);
			ddcd.widgetsInTemplate = old;
		}

		var context = this._getContext();
		if(!this._created){
			delete context._getter;
		}
		this.render(context);

		this.domNode = this.template.getRootNode();
		if(this.srcNodeRef && this.srcNodeRef.parentNode){
			dojo.destroy(this.srcNodeRef);
			delete this.srcNodeRef;
		}
	},
	setTemplate: function(/*String|dojo._Url*/ template, /*dojox.dtl.Context?*/ context){
		// summary:
		//		Quickly switch between templated by location
		if(dojox.dtl.text._isTemplate(template)){
			this.template = this._getCachedTemplate(null, template);
		}else{
			this.template = this._getCachedTemplate(template);
		}
		this.render(context);
	},
	render: function(/*dojox.dtl.Context?*/ context, /*dojox.dtl.DomTemplate?*/ tpl){
		if(tpl){
			this.template = tpl;
		}
		this._render.render(this._getContext(context), this.template);
	},
	_getContext: function(context){
		if (!(context instanceof dojox.dtl.Context)) {
			context = false;
		}
		context = context || new dojox.dtl.Context(this);
		context.setThis(this);
		return context;
	},
	_getCachedTemplate: function(templatePath, templateString){
		if(!this._templates){
			this._templates = {};
		}
		var key = templateString || templatePath.toString();
		var tmplts = this._templates;
		if(tmplts[key]){
			return tmplts[key];
		}
		return (tmplts[key] = new dojox.dtl.DomTemplate(
			dijit._Templated.getCachedTemplate(
				templatePath,
				templateString,
				true
			)
		));
	}
};
