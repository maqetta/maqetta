define([
    	"dojo/_base/declare"
], function(declare){


return declare("davinci.ve.themeEditor.commands.ThemeEditorCommand", null, {

	constructor: function(args){
		dojo.mixin(this, args);
	},
	execute: function(){
		this.old_selectedWidget = this._themeEditor._selectedWidget;
		this.old_selectedSubWidget = this._themeEditor._selectedSubWidget;
		this._themeEditor.deselectSubwidget(this.old_selectedWidget,this.old_selectedSubWidget);
		this._themeEditor._selectedWidget = this._widget[0];
		this._themeEditor._selectedSubWidget = null; // reset the subWidget
		if (this._firstRun){
			this.updatePropertiesView(false);
		} else {
			this.updatePropertiesView(true);
			dojo.publish("/davinci/ui/subwidgetSelectionChanged",[{subwidget: this._themeEditor._selectedSubWidget, origin: this.declaredClass}]);
		}
		this._firstRun = false;		
	},
	undo: function(){
		this._themeEditor.deselectSubwidget(this._themeEditor._selectedWidget,this._themeEditor._selectedSubWidget);
		this._themeEditor._selectedWidget = this.old_selectedWidget;
		this._themeEditor._selectedSubWidget = this.old_selectedSubWidget;
		this._themeEditor.selectSubwidget(this.old_selectedWidget,this.old_selectedSubWidget);
		this.updatePropertiesView(true);
		dojo.publish("/davinci/ui/subwidgetSelectionChanged",[{subwidget: this._themeEditor._selectedSubWidget, origin: this.declaredClass}]);
								
	},
	updatePropertiesView: function(updateContext){
		if (!this._themeEditor._selectedWidget) return;
		var e = [this._themeEditor._selectedWidget];
		dojo.publish("/davinci/ui/widgetSelected",[e]);
		
		
	}
		

});
});

