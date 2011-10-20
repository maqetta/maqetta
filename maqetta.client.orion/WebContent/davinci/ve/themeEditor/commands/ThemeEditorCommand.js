dojo.provide("davinci.ve.themeEditor.commands.ThemeEditorCommand");
dojo.declare("davinci.ve.themeEditor.commands.ThemeEditorCommand", null, {

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
		var v = this._themeEditor._getSelectionStyleValues();
		var rules = this._themeEditor._getCssRules();
		this._themeEditor._rebaseCssRuleImagesForStylePalette(rules, v);
		var domNode;
		var widgetType = this._themeEditor._selectedWidget.type;
		if(this._themeEditor._selectedWidget.id === 'all'){ // this is the mythical widget used for global change of widgets 
			widgetType = widgetType + '.$all'; // add this to the end so it will match the key in the metadata
		}
		var domNode = this._themeEditor._theme.getDomNode(this._themeEditor._selectedWidget.domNode, widgetType, this._themeEditor._selectedSubWidget);
		var allStyle = dojo.getComputedStyle(domNode);
		this._themeEditor._selectedWidget.subwidget= this._themeEditor._selectedSubWidget;
		if(updateContext){ 
			try{	
				var context = this._themeEditor.getContext();
				context.select(this._themeEditor._selectedWidget);
			}catch(e){
				console.log("[theme editor] error selecting canvas widget from undo");
				
			}
		
		}
		var e = [this._themeEditor._selectedWidget];
		dojo.publish("/davinci/ui/widgetSelected",[e]);
		
		
	}
		

});

