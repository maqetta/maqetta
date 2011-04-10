dojo.provide("dojox.dtl._Templated");
dojo.require("dijit._Templated");
dojo.require("dojox.dtl._base");

dojo.declare("dojox.dtl._Templated", dijit._Templated, {
	_dijitTemplateCompat: false,
	buildRendering: function(){
		var node;

		if(this.domNode && !this._template){
			return;
		}

		if(!this._template){
			var t = this.getCachedTemplate(
				this.templatePath,
				this.templateString,
				this._skipNodeCache
			);
			if(t instanceof dojox.dtl.Template) {
				this._template = t;
			}else{
				node = t;
			}
		}
		if(!node){
			var context = new dojox.dtl._Context(this);
			if(!this._created){
				delete context._getter;
			}
			var nodes = dojo._toDom(
				this._template.render(context)
			);
			// TODO: is it really necessary to look for the first node?
			if(nodes.nodeType !== 1 && nodes.nodeType !== 3){
				// nodes.nodeType === 11
				// the node is a document fragment
				for(var i = 0, l = nodes.childNodes.length; i < l; ++i){
					node = nodes.childNodes[i];
					if(node.nodeType == 1){
						break;
					}
				}
			}else{
				// the node is an element or a text
				node = nodes;
			}
		}

		this._attachTemplateNodes(node);

		if(this.widgetsInTemplate){
			//Make sure dojoType is used for parsing widgets in template.
			//The dojo.parser.query could be changed from multiversion support.
			var parser = dojo.parser, qry, attr;
			if(parser._query != "[dojoType]"){
				qry = parser._query;
				attr = parser._attrName;
				parser._query = "[dojoType]";
				parser._attrName = "dojoType";
			}

			//Store widgets that we need to start at a later point in time
			var cw = (this._startupWidgets = dojo.parser.parse(node, {
				noStart: !this._earlyTemplatedStartup,
				inherited: {dir: this.dir, lang: this.lang}
			}));

			//Restore the query. 
			if(qry){
				parser._query = qry;
				parser._attrName = attr;
			}

			this._supportingWidgets = dijit.findWidgets(node);

			this._attachTemplateNodes(cw, function(n,p){
				return n[p];
			});
		}

		if(this.domNode){
			dojo.place(node, this.domNode, "before");
			this.destroyDescendants();
			dojo.destroy(this.domNode);
		}
		this.domNode = node;

		this._fillContent(this.srcNodeRef);
	},
	_templateCache: {},
	getCachedTemplate: function(templatePath, templateString, alwaysUseString){
		// summary:
		//		Layer for dijit._Templated.getCachedTemplate
		var tmplts = this._templateCache;
		var key = templateString || templatePath;
		if(tmplts[key]){
			return tmplts[key];
		}

		templateString = dojo.string.trim(templateString || dojo.cache(templatePath, {sanitize: true}));

		if(	this._dijitTemplateCompat && 
			(alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g))
		){
			templateString = this._stringRepl(templateString);
		}

		// If we always use a string, or find no variables, just store it as a node
		if(alwaysUseString || !templateString.match(/\{[{%]([^\}]+)[%}]\}/g)){
			return tmplts[key] = dojo._toDom(templateString);
		}else{
			return tmplts[key] = new dojox.dtl.Template(templateString);
		}
	},
	render: function(){
		this.buildRendering();
	},
	startup: function(){
		dojo.forEach(this._startupWidgets, function(w){
			if(w && !w._started && w.startup){
				w.startup();
			}
		});
		this.inherited(arguments);
	}
});
