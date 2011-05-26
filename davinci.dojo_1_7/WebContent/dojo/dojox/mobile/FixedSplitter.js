define(["dojo/_base/html","dojo/_base/lang",  "dojo/_base/array", "dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./FixedSplitterPane"],function(dhtml,dlang,darray,WidgetBase,Container,Contained){
	// module:
	//		dojox/mobile/FixedSplitter
	// summary:
	//		A layout container that splits the window horizontally or vertically.
	// description:
	//		FixedSplitter is a very simple container widget that layouts its child
	//		dom nodes side by side either horizontally or vertically.
	//		An example usage of this widget would be to realize the split view on iPad.
	//		There is no visual splitter between the children, and there is no
	//		function to resize the child panes with drag-and-drop.
	//		If you need a visual splitter, you can specify a border of a child
	//		dom node with CSS.
	//		A child of the widget can be a plain <div> or dojox.mobile.FixedSplitterPane.
	// example:
	// |	<div dojoType="dojox.mobile.FixedSplitter" orientation="H">
	// |		<div style="width:200px;border-right:1px solid black;">
	// |			pane #1 (width=200px)
	// |		</div>
	// |		<div>
	// |			pane #2
	// |		</div>
	// |	</div>

	return dojo.declare("dojox.mobile.FixedSplitter", [dijit._WidgetBase,dijit._Container,dijit._Contained], {
		orientation: "H", // "H" or "V"

		isContainer: true,

		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef ? this.srcNodeRef : dojo.doc.createElement("DIV");
			dojo.addClass(this.domNode, "mblFixedSpliter");
		},

		startup: function(){
			if(this._started){ return; }
			var children = dojo.filter(this.domNode.childNodes, function(node){ return node.nodeType == 1; });
			dojo.forEach(children, function(node){
				dojo.addClass(node, "mblFixedSplitterPane"+this.orientation);
			}, this);
			this.inherited(arguments);
	
			var _this = this;
			setTimeout(function(){
				var parent = _this.getParent && _this.getParent();
				if(!parent || !parent.resize){ // top level widget
					_this.resize();
				}
			}, 0);
		},
	
		resize: function(){
			this.layout();
		},

		layout: function(){
			var sz = this.orientation == "H" ? "w" : "h";
			var children = dojo.filter(this.domNode.childNodes, function(node){ return node.nodeType == 1; });
			var offset = 0;
			for(var i = 0; i < children.length; i++){
				dojo.marginBox(children[i], this.orientation == "H" ? {l:offset} : {t:offset});
				if(i < children.length - 1){
					offset += dojo.marginBox(children[i])[sz];
				}
			}
	
			var h;
			if(this.orientation == "V"){
				if(this.domNode.parentNode.tagName == "BODY"){
					if(dojo.filter(dojo.body().childNodes, function(node){ return node.nodeType == 1; }).length == 1){
						h = (dojo.global.innerHeight||dojo.doc.documentElement.clientHeight);
					}
				}
			}
			var l = (h || dojo.marginBox(this.domNode)[sz]) - offset;
			var props = {};
			props[sz] = l;
			dojo.marginBox(children[children.length - 1], props);
	
			dojo.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		}
	});
});
