dojo.provide("dojox.widget.TitleGroup");

dojo.require("dijit._Widget");
dojo.require("dijit.TitlePane");

(function(d){
	
	var tp = dijit.TitlePane.prototype,
		lookup = function(){
			// generic handler function for click and keypress
			var parent = this._dxfindParent && this._dxfindParent();
			parent && parent.selectChild(this);
		}
	;
	
	// this might hide this uberprivate function from the docparser.
	tp._dxfindParent = function(){
		// summary: TitlePane's MUST be first-children of a TitleGroup. only used by
		//		`dojox.widget.TitleGroup`. Find a possible parent TitleGroup of a TitlePane
		var n = this.domNode.parentNode;
		if(n){
			n = dijit.getEnclosingWidget(n);
			return n && n instanceof dojox.widget.TitleGroup && n;
		}
		return n;
	};

	// if we click our own title, hide everyone
	d.connect(tp, "_onTitleClick", lookup);
	d.connect(tp, "_onTitleKey", function(e){
		// if we're tabbing through the items in a group, don't do toggles.
		// if we hit enter, let it happen.
		if(!(e && e.type && e.type == "keypress" && e.charOrCode == d.keys.TAB)){
			lookup.apply(this, arguments);
		}
	});
		
	d.declare("dojox.widget.TitleGroup", dijit._Widget, {
		// summary: A container which controls a series of `dijit.TitlePane`s,
		//		allowing one to be visible and hiding siblings
		//
		// description:
		//		A container which controls a series of `dijit.TitlePane`s,
		//		allowing one to be visible and hiding siblings. Behaves similarly
		//		to a `dijit.layout.AccordionContainer` in that the children
		//		are all stacked, though merges the TitlePane behavior of
		//		variable height
		//
		// example:
		//	|	var group = new dojox.widget.TitleGroup().placeAt(dojo.body());
		//	|	new dijit.TitlePane({ title:"One" }, "fromsource").placeAt(group);
		//	|	new dijit.TitlePane({ title:"Remote", href:"foo.html" }).placeAt(group);
		
		"class":"dojoxTitleGroup",

		addChild: function(widget, position){
			// summary: Add a passed widget reference to this container at an optional
			//		position index.
			//
			// widget: dijit.TitlePane
			//		A widget reference to add
			// position: String?|Int?
			//		An optional index or position to pass. defaults to "last"
			return widget.placeAt(this.domNode, position); // dijit.TitlePane
		},
		
		removeChild: function(widget){
			// summary: Remove the passed widget from this container. Does not destroy
			//		child.
			
			this.domNode.removeChild(widget.domNode);
			return widget;
		},
		
		selectChild: function(widget){
			// summary: close all found titlePanes within this group, excluding
			// the one the we pass to select
			widget && dojo.query("> .dijitTitlePane", this.domNode).forEach(function(n){
				var tp = dijit.getEnclosingWidget(n);
				tp && tp !== widget && tp.open && tp.set("open", false);
			});
			return widget; // dijit.TitlePane
		}
	
	});

})(dojo);
