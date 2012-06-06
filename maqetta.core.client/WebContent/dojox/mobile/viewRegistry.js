define([
	"dojo/_base/array",
	"dojo/dom-class",
	"dijit/registry"
], function(array, domClass, registry){

	// module:
	//		dojox/mobile/viewRegistry
	// summary:
	//		A registry of existing views.

	var viewRegistry = {
		length: 0,
		hash: {},
		initialView: null,

		add: function(/*Widget*/ view){
			// summary:
			//		Add a view to the registry.
			this.hash[view.id] = view;
			this.length++;
		},

		remove: function(/*String*/ id){
			// summary:
			//		Remove a view from the registry.
			if(this.hash[id]){
				delete this.hash[id];
				this.length--;
			}
		},

		getViews: function(){
			var arr = [];
			for(var i in this.hash){
				arr.push(this.hash[i]);
			}
			return arr;
		},

		getParentView: function(/*Widget*/ view){
			for(var v = view.getParent(); v; v = v.getParent()){
				if(domClass.contains(v.domNode, "mblView")){ return v; }
			}
			return null;
		},

		getChildViews: function(/*Widget*/ parent){
			return array.filter(this.getViews(), function(v){ return this.getParentView(v) === parent; }, this);
		},

		getEnclosingView: function(/*DomNode*/ node){
			for(var n = node; n && n.tagName !== "BODY"; n = n.parentNode){
				if(n.nodeType === 1 && domClass.contains(n, "mblView")){
					return registry.byNode(n);
				}
			}
			return null;
		},

		getEnclosingScrollable: function(/*DomNode*/ node){
			for(var w = registry.getEnclosingWidget(node); w; w = w.getParent()){
				if(w.scrollableParams && w._v){ return w; }
			}
			return null;
		}
	};

	return viewRegistry;
});
