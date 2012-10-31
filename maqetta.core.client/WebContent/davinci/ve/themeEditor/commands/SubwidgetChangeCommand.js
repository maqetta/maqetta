define([
    	"dojo/_base/declare",
    	"davinci/ve/themeEditor/commands/ThemeEditorCommand"
], function(declare, ThemeEditorCommand){


return declare("davinci.ve.themeEditor.commands.SubwidgetChangeCommand", [ThemeEditorCommand], {

	constructor: function(args){
		dojo.mixin(this, args);
	},
	
	execute: function(){
		this._old__selectedWidget = this._themeEditor._selectedWidget;
		this._old_selectedSubWidget = this._themeEditor._selectedSubWidget;
		this._themeEditor._selectedSubWidget = this._subwidget;
		this.updatePropertiesView();
		this._themeEditor.deselectSubwidget(this._old__selectedWidget,this._old_selectedSubWidget);
		this._themeEditor.selectSubwidget(this._themeEditor._selectedWidget,this._themeEditor._selectedSubWidget);
		if (this._redo){
			dojo.publish("/davinci/ui/subwidgetSelectionChanged",[{subwidget: this._themeEditor._selectedSubWidget, origin: this.declaredClass}]);
		}else {
			this._redo = true; // executes only happen on redos after first run....
		}
		
	},
	undo: function(){
		this._themeEditor.deselectSubwidget(this._themeEditor._selectedWidget,this._themeEditor._selectedSubWidget);
		this._themeEditor.selectSubwidget(this._old__selectedWidget,this._old_selectedSubWidget);
		this._themeEditor._selectedWidget = this._old__selectedWidget;
		this._themeEditor._selectedSubWidget = this._old_selectedSubWidget;
		this.updatePropertiesView();
		// need to update the context menu
		dojo.publish("/davinci/ui/subwidgetSelectionChanged",[{subwidget: this._themeEditor._selectedSubWidget, origin: this.declaredClass}]);

	
	}
});
});