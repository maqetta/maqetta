dojo.provide("davinci.ve.ThemeModifier");
dojo.require("davinci.ve.utils.URLRewrite");

dojo.declare("davinci.ve.ThemeModifier", null, {

	_getCssFiles : function(){
		
		if(this.cssFiles)
			return this.cssFiles;
		
		this.cssFiles = [];
		
		for(var i = 0;i<this.themeCssfiles.length;i++){
			var cssURL= this._themePath.getParentPath().append(this.themeCssfiles[i]).toString();
			this.cssFiles.push(davinci.model.Factory.getInstance().getModel({url:cssURL,
			    includeImports : true,
			    loader:function(url){
					var resource=  davinci.resource.findResource(url);
					return resource.getContents();
				}
			}));
		}
		return this.cssFiles;
		
		
	},
	

	_getThemeResource : function (fileName)
	{
		var absoluteLocation = this._themePath.getParentPath().append(fileName).toString();
		var resource=  davinci.resource.findResource(absoluteLocation);
		return resource;
	},
	
	_hotModifyCssRule: function(rules){
		//debugger;
		function updateSheet(sheet, rule){
			////debugger;;
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
	
	_modifyTheme : function (rules, values){

		var oldValues = new Array();
		var unset = dojo.clone(values);
		for (var r = 0; r < rules.length; r++){
			var rule = rules[r];
			var file = rule.searchUp( "CSSFile");
			var rebasedValues = dojo.clone(values);
			var rebasedValues = this._rebaseCssRuleImagesFromStylePalette(rule, rebasedValues);
			for(var a in rebasedValues){
				var x = rule.getProperty(a);
				if(this._theme.isPropertyVaildForWidgetRule(rule,a,this._selectedWidget) && x){
					if (x && !oldValues[a]){ // set by another rule
						oldValues[a] = x.value; // just want the value not the whole CSSProperty
					}else if (!oldValues[a]){ // set by another rule
						oldValues[a] = x; //undefined
					}
					if(!rebasedValues[a]){
						rule.removeProperty(a);
					}else /*if(this._theme.isPropertyVaildForWidgetRule(rule,a,this._selectedWidget) && x)*/{
						rule.setProperty(a,  rebasedValues[a]);
						unset[a] = null;
					}
				}
			}
			this._markDirty(file.url);
		}
		// now set the new properties.
		for (var r = 0; r < rules.length; r++){
			var rule = rules[r];
			var file = rule.searchUp( "CSSFile");
			var rebasedValues = dojo.clone(unset);
			var rebasedValues = this._rebaseCssRuleImagesFromStylePalette(rule, rebasedValues);
			for(var a in rebasedValues){
				if(this._theme.isPropertyVaildForWidgetRule(rule,a,this._selectedWidget) && (rebasedValues[a])){
					//debugger;
					rule.setProperty(a,  rebasedValues[a]);
					//rebasedValues[a] = null;  not sure about this might be valid for more than one rule
	
				}
			}
			this._markDirty(file.url);
		}
		
		return oldValues;
		
	},
	

	_markDirty : function (file,cssModelObject){
		if(!this._dirtyResource)
			this._dirtyResource = {};
		
		this._dirtyResource[file] = {time:new Date().getTime(), modelObject:cssModelObject};
		this._srcChanged();
		
	},	
	_rebaseCssRuleImagesFromStylePalette: function(rule, values){ // the style palete assumes the basedir for images user/. where css in relation to the file.
		//debugger;
		if (!rule) return values;

		var basePath = new davinci.model.Path(rule.parent.url);
		for(var a in values){
			var str = values[a];
			if (davinci.ve.utils.URLRewrite.containsUrl(str))
			{
				var url = davinci.ve.utils.URLRewrite.getUrl(str);;
				var path=new davinci.model.Path(url);
				var newUrl=path.relativeTo(basePath, true).toString(); // ignore the filename to get the correct path to the image
				values[a]="url('"+ newUrl + "')";
			}
			
		}

		return values;
		
	}
});