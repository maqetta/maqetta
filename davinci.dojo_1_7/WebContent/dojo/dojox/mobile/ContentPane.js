define(["dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "dojo/_base/xhr","./ProgressIndicator"], function(WidgetBase,Container,Contained,xhr,ProgressIndicator) {

	// summary:
	//		A very simple content pane to embed an HTML fragment.
	// description:
	//		This widget embeds an HTML fragment and run the parser.
	//		onLoad() is called when parsing is done and the content is ready.
	//		"dojo/_base/xhr" is in the dependency list. Usually this is not
	//		necessary, but there is a case where dojox.mobile custom build does not
	//		contain dojo._base.xhr.

	return dojo.declare("dojox.mobile.ContentPane", [dijit._WidgetBase,dijit._Container,dijit._Contained],{
		href: "",
		content: "",
		parseOnLoad: true,
		prog: true, // show progress indicator

		startup: function(){
			if(this._started){ return; }
			if(this.prog){
				this._p = dojox.mobile.ProgressIndicator.getInstance();
			}
			if(this.href){
				this.set("href", this.href);
			}else if(this.content){
				this.set("content", this.content);
			}
			var parent = this.getParent && this.getParent();
			if(!parent || !parent.resize){ // top level widget
				this.resize();
			}
			this.inherited(arguments);
		},
	
		resize: function(){
			dojo.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},
	
		loadHandler: function(/*String*/response){
			this.set("content", response);
		},
	
		errorHandler: function(err){
			if(p){ p.stop(); }
		},
	
		onLoad: function(){
			// Stub method to allow the application to connect to.
			// Called when parsing is done and the content is ready.
		},
	
		_setHrefAttr: function(/*String*/href){
			var p = this._p;
			if(p){
				dojo.body().appendChild(p.domNode);
				p.start();
			}
			this.href = href;
			dojo.xhrGet({
				url: href,
				handleAs: "text",
				load: dojo.hitch(this, "loadHandler"),
				error: dojo.hitch(this, "errorHandler")
			});
		},

		_setContentAttr: function(/*String|DomNode*/data){
			this.destroyDescendants();
			if(typeof data === "object"){
				this.domNode.appendChild(data);
			}else{
				this.domNode.innerHTML = data;
			}
			if(this.parseOnLoad){
				dojo.parser.parse(this.domNode);
			}
			if(this._p){ this._p.stop(); }
			this.onLoad();
		}
	});
});
