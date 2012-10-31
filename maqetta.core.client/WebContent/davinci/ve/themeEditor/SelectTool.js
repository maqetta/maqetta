define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/tools/SelectTool",
    	"davinci/ve/themeEditor/commands/StateChangeCommand"
], function(declare, Widget, SelectTool, StateChangeCommand){


return declare("davinci.ve.themeEditor.SelectTool", [SelectTool], {

	
	
	onMouseDown: function(event){

		var t = Widget.getEnclosingWidget(event.target);
		if (event.target.id.indexOf('enableWidgetFocusFrame_') >-1){
			t = event.target._widget;
		}
		var widget = (this._getTarget() || t );
		
		
		while(widget){
			if (widget.dvAttributes && widget.dvAttributes.isThemeWidget && widget.getContext() ){ // managed widget
				break;
			}
			widget = Widget.getEnclosingWidget(widget.domNode.parentNode);
		}
		/*
		 * prevent selection of non theme widgets.
		 * widgets with attribute dvThemeWidget="true" are selectable.
		 * 
		 */
		if (!widget) { //#1024
			var editor = this._context.editor,
				cmd = new StateChangeCommand({
			        _themeEditor: editor,
		            _widget: editor._selectedWidget, 
		            _newState: editor._currentState,
		            _oldState: editor._oldState,
		            _firstRun: true
		        });
		    setTimeout(function (){cmd.execute();},500);
		    
			return;
		}

		var selection = this._context.getSelection();
		var ctrlKey = navigator.appVersion.indexOf("Macintosh") < 0? event.ctrlKey: event.metaKey;
		if(dojo.indexOf(selection, widget) >= 0){
			if(ctrlKey && event.button !== 2){ // CTRL to toggle
				this._context.deselect(widget);
			}else if(event.button !== 2){ // Right mouse not to alter selection
				this._context.select(widget);
			}
		}else{
			// at least for V0.6 theme editor does not support ctrl
			// this._context.select(widget, ctrlKey); // CTRL to add 
			widget.subwidget = null; // the widget was just selected so ensure the subwidget is null
			this._context.select(widget, false); // at least for V0.6 theme editor does not support multi select
			event.stopPropagation(); // wdr mobile 
		}
	}

});
});
