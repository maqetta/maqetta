define([
    "dojo/_base/declare",
    "../model/Path",
    "../model/Factory",
	"./utils/URLRewrite"
], function(declare, Path, Factory, URLRewrite) {

return declare("davinci.ve.ThemeModifier", null, {

	_getCssFiles: function(){
		
		if(this.cssFiles) {
			return this.cssFiles;
		}
		
		this.cssFiles = [];
		
		for(var i = 0;i<this.themeCssfiles.length;i++){
			var cssURL = this._themePath.getParentPath().append(this.themeCssfiles[i]).toString();
			this.cssFiles.push(Factory.getModel({
				url: cssURL,
			    includeImports: true,
			    loader: function(url){
					return system.resource.findResource(url).getText();
				}
			}));
		}
		return this.cssFiles;
	},
	

	_getThemeResource: function (fileName) {
		var absoluteLocation = this._themePath.getParentPath().append(fileName).toString();
		var resource=  system.resource.findResource(absoluteLocation);
		return resource;
	},
	
	_hotModifyCssRule: function(rules){
		function updateSheet(sheet, rule){
			var fileName = rule.parent.relativeURL || rule.parent.url;
			var selectorText = rule.getSelectorText();
			selectorText = selectorText.replace(/^\s+|\s+$/g,""); // trim white space
			//selectorText = selectorText.replace( /\s/g, "" ); //remove all whitespace
			var intIndexOfMatch = selectorText.indexOf("  ");
			while (intIndexOfMatch != -1){ // keep only one space between words
				selectorText = selectorText.replace( "  ", " " );
				intIndexOfMatch = selectorText.indexOf( "  " );
			}
			var rules = sheet.cssRules;
			var foundSheet;
			foundSheet = findSheet(sheet, fileName);
			if (foundSheet){
				var rules = foundSheet.cssRules;
				for (var r = 0; r < rules.length; r++){
					if (rules[r] instanceof CSSStyleRule){
						var ruleSelectorText = rules[r].selectorText;
						//ruleSelectorText = ruleSelectorText.replace( /\s/g, "" ); //remove all whitespace
						ruleSelectorText = ruleSelectorText.replace(/^\s+|\s+$/g,""); // trim white space
						var intIndexOfMatch = ruleSelectorText.indexOf("  ");
						while (intIndexOfMatch != -1){ // keep only one space between words
							ruleSelectorText = ruleSelectorText.replace( "  ", " " );
							intIndexOfMatch = ruleSelectorText.indexOf( "  " );
						}
						//console.log('rule text ' +rules[r].selectorText);
						//console.log('selector text ' + selectorText);
						if (/*rules[r].selectorText*/ ruleSelectorText == selectorText) {
							var text = rule.getText({noComments:true});
							foundSheet.deleteRule(r);
							foundSheet.insertRule(text, r);
							
							return true;
						}
					}
				}
			}
			return false;
		}
		
		function findSheet(sheet, sheetName){
			if (sheet.href == sheetName){
				return sheet;
			}
			var foundSheet;
			var rules = sheet.cssRules;
			for (var r = 0; r < rules.length; r++){
				if (rules[r] instanceof CSSImportRule){
					if (rules[r].href == sheetName) {
						foundSheet = rules[r].styleSheet;
						//break;
					} else { // it might have imports
						foundSheet = findSheet(rules[r].styleSheet, sheetName);
					}
					if (foundSheet){
						break;
					}
				}
			}
			return foundSheet;
		}
		
		for (var r = 0; r < rules.length; r++){
			var rule = rules[r];
			var document = this.getContext().getDocument();
			var sheets = document.styleSheets; 
			for (var i=0; i < sheets.length; i++){
				if (updateSheet(sheets[i],rule)){
					break;
				}
			}
		}
	},

	getOldValues: function (rules, values){

		function oldValuesAddIfNewValue(propName, propValue){
			for(k=0;k<oldValues.length;k++){
				if(oldValues[k][propName] === propValue){
					return;
				}
			}
			var o = {};
			o[a] = propValue; // x.value;
			oldValues.push(o);
		}
		var oldValues = new Array();
		for (var r = 0; r < rules.length; r++){
			var rule = rules[r];
			var rebasedValues; 
            if (values.length < 1) {
                rebasedValues = [];
                rebasedValues[0] = dojo.clone(values);;
            } else {
                rebasedValues = dojo.clone(values);
            }
			rebasedValues = this._rebaseCssRuleImagesFromStylePalette(rule, rebasedValues);
			
			for(var i=0;i<rebasedValues.length;i++){
				for(var a in rebasedValues[i]){
					var propDeclarations = rule.getProperties(a);
					if(this._theme.isPropertyVaildForWidgetRule(rule,a,this._selectedWidget) /*&& propDeclarations.length > 0*/){
					    if (propDeclarations.length > 0) {
    						for(var p=0; p<propDeclarations.length; p++){
    							var x = propDeclarations[p];
   								oldValuesAddIfNewValue(a, x.value);
      						}
					    }else{
					        // this actually remove an existing property?
                            oldValuesAddIfNewValue(a, "");  
					    }
					}
				}
			}
		}
		return oldValues;
	},

	_modifyTheme: function (rules, values) {

		if (!values) {
		    return;
		}
	    var unset = dojo.clone(values);
		
		for (var r = 0; r < rules.length; r++){
			var rule = rules[r];
			var file = rule.searchUp( "CSSFile");
			var rebasedValues; // = dojo.clone(values);
			if (values.length < 1) {
			    rebasedValues = [];
			    rebasedValues[0] = dojo.clone(values);;
			} else {
			    rebasedValues = dojo.clone(values);
			}
			var rebasedValues = this._rebaseCssRuleImagesFromStylePalette(rule, rebasedValues);
			var propertiesAlreadyProcessed = {};
			
			for(var i=0;i<rebasedValues.length;i++){
				for(var a in rebasedValues[i]){
					var propDeclarations = rule.getProperties(a);
					if(this._theme.isPropertyVaildForWidgetRule(rule,a,this._selectedWidget) /*&& rebasedValues[i][a]*/){
						if(!propertiesAlreadyProcessed[a]){
							var context = this.visualEditor.context;
							// Process all property declarations for given property
							var allPropValues = [];
							for(var i2=0;i2<rebasedValues.length;i2++){
								//if(rebasedValues[i2][a]){
									var o = {};
									o[a] = rebasedValues[i2][a];
									allPropValues.push(o)
								//}   
							}
							context.modifyRule(rule, allPropValues);
							this._markDirty(file.url);
							propertiesAlreadyProcessed[a] = true;
						}
					}
				}
			}
		}
	},

	_markDirty: function (file,cssModelObject){
		if(!this._dirtyResource) {
			this._dirtyResource = {};
		}
		
		this._dirtyResource[file] = {time: Date.now(), modelObject: cssModelObject};
		this._srcChanged();
	},	

	_rebaseCssRuleImagesFromStylePalette: function(rule, values){ // the style palete assumes the basedir for images user/. where css in relation to the file.
		//debugger;
		if (!rule) {
			return values;
		}

		var basePath = new Path(rule.parent.url);
		
		for(var i=0;i<values.length;i++){
			for(var a in values[i]){
				var str = values[i][a];
				if (URLRewrite.containsUrl(str)) {
					var url = URLRewrite.getUrl(str);
					var path = new Path(url);
					var newUrl=path.relativeTo(basePath, true).toString(); // ignore the filename to get the correct path to the image
					values[i][a]="url('"+ newUrl + "')";
				}
			}
		}
		return values;
	}
});
});