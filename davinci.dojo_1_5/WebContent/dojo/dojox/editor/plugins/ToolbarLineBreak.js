dojo.provide("dojox.editor.plugins.ToolbarLineBreak");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._editor._Plugin");

dojo.declare("dojox.editor.plugins._ToolbarLineBreak",
	[ dijit._Widget, dijit._Templated ],
	{
	// summary:
	//		A 'line break' between two `dijit.Toolbar` items so that very 
	//		long toolbars can be organized a bit.
	templateString: "<span class='dijit dijitReset'><br></span>",
	postCreate: function(){ dojo.setSelectable(this.domNode, false); },
	isFocusable: function(){ 
		// summary:
		//		This widget isn't focusable, so pass along that fact.
		// tags:
		//		protected
		return false; 
	}
});


// Register this plugin.
dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o){
	if(o.plugin){ return; }
	var name = o.args.name.toLowerCase();
	if(name ===  "||" || name === "toolbarlinebreak"){
		o.plugin = new dijit._editor._Plugin({
			button: new dojox.editor.plugins._ToolbarLineBreak(),
			setEditor: function(editor){
				this.editor = editor;
			}
		});
	}
});
