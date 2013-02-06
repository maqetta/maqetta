define([
    	"dojo/_base/declare",
    	"davinci/actions/Action",
    	"davinci/Runtime"
], function(declare, Action, Runtime){


return declare("davinci.ve.actions.ContextAction", [Action], {

	_normalizeSelection: function(context){
		var selection = context.getSelection();
		if(selection.length < 2){
			return selection;
		}
		var container = context.rootWidget;
		var roots = [];
		//FIXME: GENERALIZE
		dojo.forEach(selection, function(w){
			var p = w.getParent();
			while(p && p != container){
				for(var i = 0; i < selection.length; i++){
					if(selection[i] == p){ // ancestor is selected
						context.deselect(w);
						return;
					}
				}
				p = p.getParent();
			}
			roots.push(w);
		});
		return roots;
	},

	_getContext: function(context) {
		if (context) {
			return context;
		}
		var editor = Runtime.currentEditor;
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},

	// FIXME: We've got a problem. The Workbench menubar mechanism passes
	// the Context object as the "context" because createPopup() has the Context
	// object available to it, but the toolbar mechanism passes the HTMLVisualEditor
	// object as the "context". Also, the Outline palette passed "undefined" as the
	// context. Not sure how to fix this in the right way,
	// so to get things working for now, just adapting to all known cases here.
	fixupContext: function(contextFromWorkbench){
		// Following call will retrieve the "context" object if contextFromWorkbench is undefined
		var obj = this._getContext(contextFromWorkbench);
		if(obj.declaredClass=="davinci.ve.Context"){
			return obj;
		}else if (typeof obj.getContext == "function") {
			return obj.getContext();
		}else{
			return null;
		}		
	}
});
});

