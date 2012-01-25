define([
    "dojo/_base/declare",
	"davinci/ve/themeEditor/commands/ThemeEditorCommand",
	"davinci/ve/themeEditor/ThemeColor"
], function(declare, ThemeEditorCommand, ThemeColor) {
return declare("davinci.ve.themeEditor.commands.StyleChangeCommand", [ThemeEditorCommand], {

	constructor: function(args){
		dojo.mixin(this, args);
	},
	execute: function(){
		//debugger;
		if (this._themeEditor._selectedWidget.id === 'all'){
			var colorValues = [];
			//this._rules = [];
			this._oldValues = [];
			for(var i=0; i < this._values.length; i++){
				var arritem = this._values[i];
				for (var v in arritem){
					if (v.indexOf('color')> -1){
						colorValues[v] = arritem[v];
					}
				}
			}
			var widgetMetadata = this._themeEditor._theme.getMetadata(this._themeEditor._theme.getWidgetType(this._themeEditor._selectedWidget));
			for (var c in widgetMetadata.states){
				if (c != 'Normal'){
					var setColorValues = dojo.clone(colorValues);
					for (var prop in setColorValues){
						var nColor;
						var hColor;
						if (widgetMetadata.states.Normal.defaults && widgetMetadata.states.Normal.defaults.cssPropery)
							nColor = widgetMetadata.states.Normal.defaults.cssPropery[prop];
						if (widgetMetadata.states[c].defaults && widgetMetadata.states[c].defaults.cssPropery)
							hColor = widgetMetadata.states[c].defaults.cssPropery[prop];
						var color = setColorValues[prop];
						if(nColor && hColor && color){
							var baseColor = new ThemeColor(color);
							var calcColor = baseColor.calculateHighlightColor(nColor, hColor);
							setColorValues[prop] = calcColor.toHex();
							var rules = this.getRules(this._themeEditor._selectedWidget, this._themeEditor._selectedSubWidget, c);
							this._oldValues[c] = this._themeEditor.getOldValues(rules, setColorValues);
							this._themeEditor._modifyTheme(rules, setColorValues);
						} 
					}
				} else {
					//Normal
					var rules = this.getRules(this._themeEditor._selectedWidget, this._themeEditor._selectedSubWidget, this._themeEditor._currentState);
					this._oldValues[c] = this._themeEditor.getOldValues(rules, this._values);
					this._themeEditor._modifyTheme(rules, this._values);
				}
			}
			if (this._themeEditor._selectedWidget.resize) this._themeEditor._selectedWidget.resize(); // forces redraw of widget to adjust for new styles like border size
			
		} else {
			//values = this._rebaseCssRuleImagesFromStylePalette(rule, this.values);
			var rules = this.getRules(this._themeEditor._selectedWidget, this._themeEditor._selectedSubWidget, this._themeEditor._currentState);
			this._oldValues = new Array();
			for (prop in this._values){
				this._oldValues[prop] = null; // this will create a list of props that were added to the rule
			}			
			var exsistingProps = this._themeEditor.getOldValues(/*this._*/rules, this._values);
			this._themeEditor._modifyTheme(/*this._*/rules, this._values);
			for (prop in exsistingProps){
				this._oldValues[prop] = exsistingProps[prop]; // this will mix in the old values of existing props. but preserve a list of added props for undo
			}
			if (this._themeEditor._selectedWidget.resize) this._themeEditor._selectedWidget.resize(); // forces redraw of widget to adjust for new styles like border size
			
		}
		if (!this._firstRun){
			this.updatePropertiesView(false); // this is only need for redo
		} 
		this._firstRun = false;
	},
	undo: function(){
		//debugger;;
		if (this._themeEditor._selectedWidget && this._themeEditor._selectedWidget.id === 'all'){
			var widgetMetadata = this._themeEditor._theme.getMetadata(this._themeEditor._theme.getWidgetType(this._themeEditor._selectedWidget));
			for (var c in widgetMetadata.states){
				var rules = this.getRules(this._themeEditor._selectedWidget, this._themeEditor._selectedSubWidget, c);
				this._themeEditor._modifyTheme(rules, this._oldValues[c]);
				this._themeEditor._hotModifyCssRule(rules); 
				
			}
			
		} else {
			var rules = this.getRules(this._themeEditor._selectedWidget, this._themeEditor._selectedSubWidget, this._themeEditor._currentState);
			this._themeEditor._modifyTheme(/*this._*/rules, this._oldValues);
			this._themeEditor._hotModifyCssRule(/*this._*/rules); 
		}
		if (this._themeEditor._selectedWidget.resize) { this._themeEditor._selectedWidget.resize(); } // forces redraw of widget to adjust for new styles like border size

		var context = this._themeEditor.getContext();
		context.onContentChange();
		this.updatePropertiesView();
	},
	getRules: function(widget, subwidget, state){

		var selectors = this._themeEditor._loadCssSelectors(widget, subwidget, state);
		var rules = [];
		for (var s = 0; s < selectors.length; s++) {
			var modified = false;
			var cssFiles = this._themeEditor._getCssFiles();
			if (cssFiles){
				for(var i = 0;i<cssFiles.length;i++){
					var selectorNodes = cssFiles[i].getRules(selectors[s]);
					for (var sn = 0; sn < selectorNodes.length; sn++){
						var selectorNode = selectorNodes[sn];
						if(selectorNode){
							var rule = selectorNode.searchUp( "CSSRule");
							if(rule){
								rules.push(rule);
								modified = true;
							}
						}
					}
				}
			}
			if(!modified){
				console.log("[theme editor style change command] !FATAL! Rule not found in theme: " + selectors[s]);
			}
		}
		return rules;
	}
});
});
