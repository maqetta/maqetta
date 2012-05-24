define([
    "dojo/_base/declare",
    "../model/Path",
    "../model/Factory",
	"./utils/URLRewrite",
	"./commands/ModifyRuleCommand",
	"dojo/i18n!davinci/ve/nls/common",
	"system/resource"	
], function(declare, Path, Factory, URLRewrite, ModifyRuleCommand,commonNls,systemResource) {

return declare("davinci.ve.ThemeModifier", null, {

	
	_getCssFiles: function(){
		
		if(this.cssFiles) {
			return this.cssFiles;
		}
		
		this.cssFiles = [];
		
		if(this.themeCssFiles){
			for(var i = 0;i<this.themeCssFiles.length;i++){
				var cssURL = this._themePath.getParentPath().append(this.themeCssFiles[i]).toString();
				this.cssFiles.push(Factory.getModel({
					url: cssURL,
				    includeImports: true,
				    loader: function(url){
						return system.resource.findResource(url).getText();
					}
				}));
			}
		}
		return this.cssFiles;
	},
	

	_getThemeResource: function (fileName) {
		var absoluteLocation = this._themePath.getParentPath().append(fileName).toString();
		var resource=  system.resource.findResource(absoluteLocation);
		return resource;
	},
	
	/*
	 *  Added for theme Delta #23
	 */
	getDeltaRule: function(rule){
		var retRule=null;
	
		// if this rule is not from the delta file add a new rule to the delta
		retRule = this.cssFiles[0].getRule(rule.getSelectorText());
		if (retRule.parent.url != this.cssFiles[0].url) {
			 retRule = this.cssFiles[0].addRule(rule.getSelectorText()+" {}");
		}
		return retRule;
	},

	_markDirty: function (file,cssModelObject){
		if(!this._dirtyResource) {
			this._dirtyResource = {};
		}
		
		this._dirtyResource[file] = {time: Date.now(), modelObject: cssModelObject};
		this._srcChanged();
	},	

	
	/**
	 * Causes property changes on the currently selected widget.
	 * Right now, only operates on the first widget in the selection.
	 * Creates and executes an appropriate StyleCommand for the operation.
	 * @param {object} value
	 *		value.appliesTo {string|object} - either 'inline' or a CSSRule object
	 *		applyToWhichStates - controls whether style change is attached to Normal or other states:
	 *			"current" => apply to currently active state
	 *			[...array of strings...] => apply to these states (may not yet be implemented)
	 *			any other value (null/undefined/"Normal"/etc) => apply to Normal state
	 *		values [object]  Array of property values. Each item in array is an object with one property
	 *						<propname>:<propvalue>, where <propname> is name of styling property and <propvalue> is value string
	 */
	getCommandForStyleChange: function (value){
		/*if(!this.isActiveEditor() ){
			return;
		}*/
		
		var context = this.getContext(),
			selection = context.getSelection(),
			widget = selection.length ? selection[selection.length - 1] : undefined;

		if(selection.length > 1){
			context.select(widget);
		}
		var command = null;
		
		if(value.appliesTo=="inline"){
			var allValues = [];
			/* rewrite any URLs found */
			
			var filePath = new Path(this.fileName);
			
			for(var i=0;i<value.values.length;i++){
				for(var name in value.values[i]){
					if(URLRewrite.containsUrl(value.values[i][name]) && !URLRewrite.isAbsolute(value.values[i][name])){
						
						var oldUrl = new Path(URLRewrite.getUrl(value.values[i][name]));
						if(!oldUrl.isAbsolute){
							var newUrl = oldUrl.relativeTo(filePath).toString();
							var newValue = URLRewrite.replaceUrl(value.values[i][name], newUrl);
							allValues.push(a);
							
						}else{
							var a ={};
							a[name] = value.values[i][name];
						
							allValues.push(a); //FIXME: combine with below
						}
					}else{
						var a ={};
						a[name] = value.values[i][name];
						allValues.push(a);
					}
				}
			}
			command = new davinci.ve.commands.StyleCommand(widget, allValues, value.applyToWhichStates);	
		}else{
			var rule=null;
			
			// if type=="proposal", the user has chosen a proposed new style rule
			// that has not yet been added to the given css file (right now, app.css)
			if(value.appliesTo.type=="proposal"){

				//FIXME: Not included in Undo logic
				var cssFile = this.context.model.find({elementType:'CSSFile', relativeURL: value.appliesTo.targetFile}, true);
				if(!cssFile && context.cssFiles){
					// #23 look in dynamic files
					for (var i = 0; context.cssFiles.length; i++){
						if (context.cssFiles[i].url === value.appliesTo.targetFile) {
							cssFile = context.cssFiles[i];
							break;
						}
					}
					// #23 
					if (!cssFile) {
						console.log("Cascade._changeValue: can't find targetFile");
						return;
					}
				}
				var rule = cssFile.addRule(value.appliesTo.ruleString+" {}");
			}else{
				rule = value.appliesTo.rule;
			}
			
			/* update the rule */
			var command = new ModifyRuleCommand(rule, value.values, context);
		}
		return command;

	},
	
	saveDynamicCssFiles: function(cssFiles, isAutoSave){
		var visitor = {
				visit: function(node){
					if( node.elementType=="CSSFile" && node.isDirty()){
						var deferred = node.save(isAutoSave);
						deferred.then(function(){
							// only remove the working copy if the save was a success 
							if (!isAutoSave){
								systemResource.findResource(node.url).removeWorkingCopy();
							}
							node.dirtyResource = isAutoSave;
						}.bind(this),
						function(error){
							alert(dojo.string.substitute(commonNls.errorSavingFile, [node.url, error]));
						}.bind(this));
					}
					return false;
				}
			};
			
		if (cssFiles) {
			cssFiles.forEach(function(file){
				file.visit(visitor);
			}.bind(this));
		}
	}
	
});
});