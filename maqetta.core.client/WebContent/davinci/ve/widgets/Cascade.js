define(["dojo/_base/declare",
        "../../workbench/WidgetLite",
        "../../workbench/Preferences",
        "../../Workbench",
        "../../html/CSSModel",
        "../../library",
        "../../Theme",
    	"../../html/CSSRule",
        "../States",
        "dojo/i18n!../nls/ve",
        "system/resource"
],function(declare,WidgetLite,Preferences,Workbench, CSSModel, Library, Theme, CSSRule, States, veNLS, systemResource){
	var cascade =  declare("davinci.ve.widgets.Cascade", [WidgetLite], {
		target : null,
		targetField : null,
		toggleClasses : null,
		// CSS selector regular expressions used in calculating specificity values and comparing rules
		_regex_combinators : /[\s\~\+\>]+/,
		_regex_not_pseudoclass : /(.*)\:not\((.*)\)(.*)/,
		_regex_pseudoelement : /(.*)(\:\:[^\:\.\#\[]*)(.*)/,
		_regex_id : /(.*)(\#[^\:\.\#\[]*)(.*)/,
		_regex_class : /(.*)(\.[^\:\.\#\[]*)(.*)/,
		_regex_attribute : /(.*)(\[[^\]]*\])(.*)/,
		_regex_pseudoclass : /(.*)(\:[^\:\.\#\[]*)(.*)/,
		_regex_univeral : /(.*)(\*[^\:\.\#\[]*)(.*)/,	
	
		constructor: function(params, srcNodeRef){
			this.subscriptions=[];
			this.publishing={};
			
			this._radioGroupName =  "davinci_ve_widgets_Cascade" + (davinci.ve.widgets.Cascade.__id++);
			this._handles = [];
			this.inherited(arguments);
		},
		
		buildRendering: function(){
			this.domNode =   dojo.doc.createElement("div");
			this.container =   dojo.doc.createElement("div");
			dojo.addClass(this.container,"showCascade");
			this.domNode.appendChild(this.container);
			this.topDiv = dojo.create('div', 
					{'class':'cascadeTopDiv'},
					this.container);
			this.cascadeTableDiv = dojo.create('div', 
					{'class':'cascadeTableDiv'},
					this.container);
			dojo.removeClass(this.container, "showAllValues");
	
			if(!dojo.isArray(this.target)){
				this.target = [this.target];
			}
			
			dojo.addClass(this.domNode, "CascadeTop");
			this.inherited(arguments);
		},
		
		
		startup : function(){
			var widget = dijit.byId(this.targetField);
			if(widget){
				widget._cascade = this;
				this._getFieldValue = function(){
					return widget.get('value'); 
				};
				this._setFieldValue = function(value, loc){
					if (!widget.set) {return;} // #23 FIXME why is there no set
					this._value = value || "";
					this._loc = loc;

					if(widget._setBaseLocationAttr){
						widget.set('baseLocation', (loc && loc.getPath) ?loc.getPath():null); //#23 FIXME why no getPath
					}
					widget.set('value', this._value, true);
				};
				dojo.connect(widget, "onChange", this, "_onFieldChange");
				dojo.connect(widget, "onFocus", this, "_onFieldFocus");
				dojo.connect(widget, "onBlur", this, "_onFieldBlur");
			}else{
				var node = dojo.byId(this.targetField);
				this._getFieldValue = function(){return dojo.attr(node, 'value');};
				
				this._setFieldValue = function(value, baseLocation){
					this._value = value || "";
					this._loc = baseLocation;
					dojo.attr(node, 'value', this._value);
				};
				dojo.connect(node, "onchange", this, "_onFieldChange", true);
				dojo.connect(node, "onfocus", this, "_onFieldFocus", true);
				dojo.connect(node, "onblur", this, "_onFieldBlur", true);
				
			}
			this._value = this._getFieldValue();
			this._started=true;
		},
		
		
		_canModifyRule: function(modifiedRule){
			
			// not all "rules" passed in are rules, and sometimes they are null (in case of element.style).
			if(!modifiedRule || !modifiedRule.getCSSFile) {// empty object, in cases like element.style there is no rule
				return true; 
			}

			var cssFile = modifiedRule.getCSSFile();
			if (!cssFile) {
				return true;
			}

			var resource = systemResource.findResource(cssFile.url);
			return !resource.readOnly();
		},
		
		/**
		 * Invoked whenever the input field (TextBox, ComboBox, ...) on a property changes.
		 * To get the new value, usually call this._getFieldValue(), but for background-image,
		 * which provides an array for gradients, look at this._valueArrayNew.
		 * Existing values are stored in this._value and this._valueArray.
		 */
		_onFieldChange : function(){
			// Return true if two valueArray objects are equivalent
			var valueArrayCompare = function(arr1, arr2){
				if(!arr1 && !arr2){
					return true;
				}
				if((!arr1 && arr2) || (arr1 && !arr2)){
					return false;
				}
				if(arr1.length != arr2.length){
					return false;
				}
				for(var i=0; i<arr1.length; i++){
					if(arr1[i] !== arr2[i]){
						return false;
					}
				}
				return true;
			};
	
			if(this.context){
				this.context.blockChange(false);
			}
			if(this._value==this._getFieldValue() && valueArrayCompare(this._valueArray, this._valueArrayNew)){
				return;
			}
			if (this._values.length < 1) {
				/*
				 * no cascade rules this should only happen when we are in theme editor and the 
				 * user has selected a widget or subwidget and then a state not supported by the widget
				 * then changes a property that 
				 * the true fix to this will be when #226 is implemented
				 * until then this will prevent an exception.
				*/
				return; // no cascade rules.
			}
			if(this._getFieldValue()=="(overrides)"){
				if(this._setFieldValue){
					this._setFieldValue("(overrides)", null);					
				}
				return;
			}
	
			// Pretty sure this._targetValueIndex will not have a value only when
			// something is wrong, such as theme metadata saying no rules are available
			// and that inline style is disallowed.
			if(typeof this._targetValueIndex != "number"){
				console.log("_onFieldChange. this._targetValueIndex is not a number");
				return;
			}
			
			var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
			
			if(this._widget && this.target && this.target.length>0){
				var propName = this.target[0];
				var context = this._widget.getContext();
				var cascadeBatch;
				if(context){
					cascadeBatch = context.cascadeBatch;
				}
				if(cascadeBatch){
					var askUserResponse = cascadeBatch.askUserResponse;
					if(cascadeBatch.deferreds){
						var deferreds = cascadeBatch.deferreds;
					}
				}
			}
	
			function innerResolveFunc(){
				if(propName && deferreds && deferreds[propName]){
					deferreds[propName].resolve();
				}
			}
			function innerChangeValueFunc(that){
				that._value=that._getFieldValue();
				that._valueArray = that._valueArrayNew;
				var value = (that._valueArray && dojo.isArray(that._valueArray) && that._valueArray.length>0) ? that._valueArray : that._value;
				that._changeValue(that._targetValueIndex, value);
			}
			
			if(askUserResponse === false){
				// Reset current field
				this._setFieldValue(this._value,this._loc);
				innerResolveFunc();
				
			}else if(askUserResponse === true){
				innerChangeValueFunc(this);		
				innerResolveFunc();
		
			}else{		// askUserResponse is undefined
				// New logic: prompt user only if theme CSS files are going to change
				var askUser = false;
				var content = null;		
				var langObj = veNLS;
				if(this._values[this._targetValueIndex].readOnly && this._editor.editorID != 'davinci.themeEdit.ThemeEditor'){ // #23 theme editor only writes out deltas
					//FIXME: the commented out message in next line provides a more informative error message
		            var helpLink = "<a href='app/docs/index.html#CreatingStyleRulesWithAppCss' target='_blank'>"+ langObj.creatingStyleRules +"</a>";
					var content = langObj.propChangeCannotComplete + "<br><br>" + dojo.string.substitute(langObj.toChangeProperty,[helpLink]) + "<br/><br/>";

					davinci.Workbench.showMessage(langObj.errorModifyingValue, content, {width: 350}, dojo.hitch(this, function(){
						innerResolveFunc();
						return true;
					}));
					if(cascadeBatch){
						cascadeBatch.askUserResponse = false;
					}
					this._setFieldValue(this._value,this._loc);
				}else if((this._values[this._targetValueIndex].type=="theme" || this._values[this._targetValueIndex].proposalTarget =='theme')&&
						   editorPrefs.cssOverrideWarn &&
							this._editor.supports("MultiPropTarget")){
					require(['davinci/ve/widgets/ChangeWillModify'], dojo.hitch(this, function(ChangeWillModify) {
							function _submit() {
								if(cascadeBatch){
									cascadeBatch.askUserResponse = true;
								}
								innerChangeValueFunc(this);
								innerResolveFunc();

								if (cwm.checkbox.get("checked")) {
									editorPrefs.cssOverrideWarn = false;
									Preferences.savePreferences('davinci.ve.editorPrefs',null, editorPrefs);
								}
							}

							var cwm = new ChangeWillModify();
							var dialog = davinci.Workbench.showDialog({
								title: "", 
								content: cwm, 
								style: {width: 350}, 
								okCallback: dojo.hitch(this, _submit), 
								okLabel: null, 
								hideCancel: null, 
								submitOnEnter: true
							});

							dojo.connect(dialog, "onCancel", dojo.hitch(this, function() {
									if (cascadeBatch){
										cascadeBatch.askUserResponse = false;
									}

									// set back to original value
									this._setFieldValue(this._value,this._loc);
									innerResolveFunc();

									if (cwm.checkbox.get("checked")) {
										editorPrefs.cssOverrideWarn = false;
										Preferences.savePreferences('davinci.ve.editorPrefs',null, editorPrefs);
									}
							}));

					}));
				}else {
					innerChangeValueFunc(this);
					innerResolveFunc();
				}
			}
		},
		
		_changeValue : function(targetIndex,value){
			// applyToWhichStates controls whether style change is attached to Normal or other states
			//   "current" => apply to currently active state
			//   [...array of strings...] => apply to these states (may not yet be implemented)
			//   any other value (null/undefined/"Normal"/etc) => apply to Normal state
			var applyToWhichStates = undefined;
			if(this._whichStateInputElement && this._whichStateInputElement.checked){
				applyToWhichStates = this._whichState;
			}
			var targetRule = this._values[targetIndex];
			var valueObject = [];
			for(var i = 0;i<this.target.length;i++){
				if(dojo.isArray(value)){
					for(var k=0;k<value.length;k++){
						var a = {};
						a[this.target[i]] = value[k];
						valueObject.push(a);
					}
				}else{
					var a = {};
					a[this.target[i]] = value;
					valueObject.push(a);
	
				}
			}
			// Flag that the cascade list for this property needs to be recalculated/refreshed
			this._dirtyCascadeList = true;
			if(targetRule.type=="element.style"){
				// If user is changing a widget to position:absolute, also force a z-index change
				// If user is changing a widget away from position:absolute, remove existing z-index
				if(this.target[0] == 'position' && valueObject.length == 1){
					if(valueObject[0]['position'] == 'absolute'){
						var absoluteWidgetsZindex = this.context.getPreference('absoluteWidgetsZindex');
						valueObject.push({'z-index':absoluteWidgetsZindex});
					}else{
						valueObject.push({'z-index':''});
					}
				}
				dojo.publish("/davinci/ui/styleValuesChange",[{values:valueObject, appliesTo:'inline', applyToWhichStates:applyToWhichStates }]);
			}else{
				dojo.publish("/davinci/ui/styleValuesChange",[{values:valueObject, appliesTo:targetRule, applyToWhichStates:applyToWhichStates }]);
			}
		},
		
		_getAttribStyleValue : function(){
			return this.context.getStyleAttributeValues(this._widget);
		},
		
		_getShortHands : function(){
			if (this._shorthands) {
				return this._shorthands;
			}
			this._shorthands = [];
			for(var i = 0;i<this.target.length;i++) {
				this._buildShortHands(this.target[i]);
			}
		
			return this._shorthands;
		},
		
		_buildShortHands : function(target){
			var isShorthand = false;
			for(var j=0; j<CSSModel.shorthand.length; j++){
				if(target == CSSModel.shorthand[j][0]){
					isShorthand = true;
					break;
				}
			}
			if(isShorthand){
				var expanded = CSSModel.shorthand[j][1];
				for(var i = 0;i<expanded.length;i++){
					var found = false;
					for(var j=0;j<this._shorthands.length && !found;j++){
						if(this._shorthands[j]==expanded[i]) found = true;
					}
					if(!found) {
						this._shorthands.push(expanded[i]);
					}
					this._buildShortHands(expanded[i]);
				}
			}
			return this._shorthands;
		},
		
		_onChangeOverride : function(e){
			alert(veNLS.valueIsOverriden);
			return false;
		},

		_getSelector: function(widget, target){
			// return rules based on metadata IE theme
			
			var theme = this.context.getThemeMeta();
			if(!theme){
				return [];
			}
			// Note: Let's be careful to not get confused between the states in theme metadata
			// and the user-defined interactive states that are part of a user-created HTML page
			// For theme editor, we need to use whatever state is selected in States palette
			// For page editor, always use "Normal"
			var state = "Normal";
	/*FIXME: OLD LOGIC
			if (this.context.editor.editorID == 'davinci.themeEdit.ThemeEditor'){
	//FIXME: Ramifications if nested states? (Maybe OK: theme editor specific)
	//getState(node)
				state = davinci.ve.states.getState();
			}
	*/
			
			var widgetType = theme.loader.getType(widget),
				selectors = theme.metadata.getStyleSelectors(widgetType,state);

			if(selectors){
				for(var name in selectors){
					for(var i = 0; i < selectors[name].length; i++){
						for(var s = 0 ; s < target.length; s++) {
							if(target[s] == selectors[name][i]){
								return name;
							}
						}
					}
				}
			}
		},

		_getMetaTargets: function(widget, target){
			var name = this._getSelector(widget, target),
				rules = this.context.getModel().getRule(name); 
			/*
			 * getRule returns all rules that match the selector, this can be to many in the case of combined rules
			 * so weed them out so we have an exact match to the metaData
			 */
			return rules.filter(function(rule){
				return rule.getSelectorText() == name;
			});
		},

		_getSelectionCssRules: function(targetDomNode){
			this.context._cssCache = this.context._cssCache || {}; // prevent undefined exception in theme editor
			var hashDomNode = function (node) {
				return node.id + "_" + node.className;
			};
			var selection = this.context.getSelection();
			if (!targetDomNode && !selection.length) {
				return {rules:null, matchLevels:null};
			}
			
			var targetDom = targetDomNode || selection[0].domNode || selection[0],
				domHash = hashDomNode(targetDom);
			
			/*
			if(this.context._cssCache[domHash])
				return this.context._cssCache[domHash];
			*/
			
			if(selection.length){
				var match = this.context._cssCache[domHash] = this.context.model.getMatchingRules(targetDom, true);
				if (this.context.cssFiles) {
					this.context.cssFiles.forEach(function(file){
						file.getMatchingRules(targetDom, match.rules, match.matchLevels); // adds the dynamic rules to the match
					});
					//this.context.cssFiles[0].getMatchingRules(targetDom, match.rules, match.matchLevels); // adds the dynamic rules to the match
				}
				match.rules.forEach(function(rule) {
					/* remove stale elements from the cache if they change */
					var handle = dojo.hitch(rule, "onChange", this, function(){
						delete this.context._cssCache[domHash];
						connect.unsubscribe(handle);
					});
				}, this);
				
				return match;
			}

			return {rules:null, matchLevels:null};
		},

		_getAllRules : function(){
			//FIXME: This function is a short-term solution that gets things working reasonably
			// and depends on the fact that the current software always puts themes in the
			// ./themes/ folder. Not good to hardcode such filenaming assumptions.
			// Logged code cleanup bug https://github.com/maqetta/maqetta/issues/696
			function getRuleType(rule){
				if(rule && rule.parent && rule.parent.url){
					var url=rule.parent.url;
					if(/^themes\//.test(url) || /\/themes\//.test(url)){
						return 'theme';
					}else{
						return 'queried';
					}
				}
				
			}
			
			var values =  [];
			if (this._editor.editorID != 'davinci.themeEdit.ThemeEditor'){
				/* element rules */
				var defaultSelection=this._getDefaultSelection();
				
				if(this._editor.supports("inline-style") && 
				  (/*this._topWidgetDom==this._widget.domNode ||*/ defaultSelection=="element.style")){ //#2409 just use default selector result 
					var vArray = this._getAttribStyleValue();
					var value = null;
					for(var vIndex=0; vIndex<vArray.length; vIndex++){
						var vItem = vArray[vIndex];
						for(var t=0; t<this.target.length; t++){// should be only one property in this.target
							var name = this.target[t];
							if(vItem[name] !== undefined){
								value = vItem[name];
							}
						}
					}
					values.push({rule:vArray, value:value, matchLevel:'element.style', type:'element.style'});				
				}
				
				/* selection (queried) rules */
				var v = this._getSelectionCssRules(this._topWidgetDom);
				if(v && v.rules){
					for(var i=0;i<v.rules.length;i++){
						var s="";
						var rule = v.rules[i];
						for(var j = 0;j<rule.selectors.length;j++){
							if(j!=0) s+=", ";
							s+=rule.selectors[j].getLabel();
						}
						var ruletype = getRuleType(rule);
						values.push({rule:v.rules[i], ruleString:s,
									matchLevel:v.matchLevels[i], type:ruletype});
					}
				}
				// #23
				var deltas = this._addDeltaRules(this._widget, values);
				
				/* create list of proposals for new rules (using classes defined on this widget) */
				var allCssClasses = this._getClasses(this._widget);
				var nProposals = 0;
				for(var i=0;i<allCssClasses.length;i++){
					var thisClass=allCssClasses[i];
					if(typeof thisClass=="string" && thisClass.length>0){
						var proposedNewRules=this._getClassSelector(thisClass);
						proposedNewRules.forEach(function(proposedNewRule){
							// See if there is an existing rule for thisClass
							var existingRule=false;
							for(var j=0; j<values.length; j++){
								if(this._compareSelectors(values[j].ruleString,proposedNewRule)){
									values[j].className = thisClass;
									existingRule=true;
									break;
								}
							}
							if(!existingRule){
								var matchLevel = this._computeMatchLevelSelector(proposedNewRule);
								values.splice(nProposals,0,{rule:null, ruleString:proposedNewRule, 
											targetFile:this.targetFile, className:thisClass,
											value:null, matchLevel:matchLevel, type:'proposal'});
								nProposals++;
							}
						}.bind(this));
						
					}
				}
			}
			/* theme/meta rules */
			if (this._editor.editorID == 'davinci.themeEdit.ThemeEditor'){
				v = this._editor._getCssRules(this._widget, this._editor._selectedSubWidget, this._editor._currentState);
				// #23
				if (v){
					// cascade excepts the rules in decending order
					var t = [];
					for (var x = v.length -1; x > -1; --x){
						t.push(v[x]);
					}
					v = t;
				}
				// #23
			} else if(this._widget) {
				v = this._getMetaTargets(this._widget, this.target);
			} else {
				v = [];
			}
			
			for(var i = 0;i<v.length;i++){
				var found = false;
				for(var k=0;!found && k<values.length;k++){
					if(values[k].rule==v[i]){
						found = true;
						values[k].type = 'theme';
					}
				}
				if(!found)
					values.push({rule: v[i], matchLevel: 'theme', type:'theme'});
			}
			
			return values;
		},
		
		_buildCssRuleset : function(){
			//if(this._isTarget("background-color")) debugger;
			var allRules = this._getAllRules();
			this._values = [];
			//Disabled hasOverride logic - had bugs, causes problems with logic and not sure it helps user
			this._hasOverride = false;
			var propName = this.target[0];
	
			/* figure out the properties values */
		
			var shorthands = this._getShortHands();
			for(var i = 0;i<allRules.length;i++){
				var rule = allRules[i].rule;
				if(rule){
					for(var k=0;k<shorthands.length;k++){
						if(allRules[i].type!="element.style" && allRules[i].rule.getProperty(shorthands[k])!=null){
							allRules[i].shorthand = shorthands[k];
							var prop = rule.getProperty(shorthands[k]);
							allRules[i].value = prop && prop.value;
							
							this._hasOverride = true;
							
						}else if(allRules[i].type=="element.style" && dojo.indexOf(allRules[i].rule, shorthands[k])>-1){
							allRules[i].shorthand = shorthands[k];
							var index = dojo.indexOf(allRules[i].rule, shorthands[k]);
							allRules[i].value = rule[index];
							this._hasOverride = true;
						}
					}
					if(!allRules[i].shorthand && allRules[i].type!="element.style")
						allRules[i].value = this._getRuleTargetValue(rule);
					else if(!allRules[i].shorthand && allRules[i].type=="element.style"){
						for(var kk=0;kk<rule.length;kk++){
							if(rule[kk].hasOwnProperty(this.target[0])){
								allRules[i].value = rule[kk][this.target[0]];
							}
						}
					}
				}else{
					// rule is null when type=='proposal'
					//allRules[i].value=null;
				}
			}
			/* sort rules basaed on priority */
			allRules  = this._sortRules(allRules);
			
			/* add any extra classes to the rules for display */
			this._addClasses(allRules);
			this._values = allRules;
			
		},
		
		_sortRules : function(rules){
			// sort rules based on priority
			var sorted = [];
			for(var i = 0;i<rules.length;i++){
				var inserted = false;
				if(rules[i].type=="element.style"){
					sorted.splice(0,0,rules[i] );
					inserted = true;
				}
				
				for(var k=0;!inserted && k<sorted.length;k++){
					if(sorted[k].matchLevel!="element.style" && sorted[k].matchLevel<rules[i].matchLevel){
						inserted = true;
						sorted.splice(k,0,rules[i] );
					}
				}
				if(!inserted)
					sorted.push(rules[i]);
			}
			return sorted;
		},
		
		/* add classes to the values, effects display */
		_addClasses : function(rules){
			var value = null;
			/*
			 * classes:
			 * shorthandOverrideCascadeNode = value over ridden by shorthand
			 * hiddenCascadeNode = no value in the node, but still in the cascade
			 * cssShorthandOverRidden = over ridden node
			 */
			var foundValue = false;
			for(var i = 0;i<rules.length;i++){
				rules[i].extraClass = [];
				/*NOTE: Disabled hasOverride logic - had bugs, causes problems with logic and not sure it helps user
				if(this._hasOverride)
					rules[i].extraClass.push("shorthandOverrideCascadeNode");
				else */
				if(foundValue)
					rules[i].extraClass.push("cssShorthandOverRidden");
				
				if( rules[i].value || (rules[i].type!="element.style" && this._getRuleTargetValue(rules[i].rule))){
					foundValue = true;
				}else if(!rules[i].value && rules[i].type!="element.style"){
					rules[i].extraClass.push("hiddenCascadeNode");	
				}
				/* different class for element.style since we dont want to hide it (but want to hide the X */
				if(rules[i].type=="element.style" && !rules[i].value)
					rules[i].extraClass.push("elementStyleNode");
				
				if(!this._canModifyRule(rules[i].rule)){
					rules[i].extraClass.push("readOnlyRule");
					rules[i].readOnly = true;
				}
				
			}
		
		},
	
		
		_updateCascadeList : function(){
			
			if(this._setFieldValue){
				/*
				 * Clear the old value in case we have no new value to set.
				 * This happends often in theme editor
				 */
				this._setFieldValue("",null);
			}
			if(!this._widget || !this._widget.domNode){
				dojo.addClass(this.container,"dijitHidden");
				return;
			}
			dojo.removeClass(this.container,"dijitHidden");
			this._buildCssRuleset();
			function makeOnChange(target){return function(){return this._onChange({target:target});};}
			function makeRemoveOnChange(target){
				return function(){
					return this._onChangeRemove({target:target});
				};
			}
			this._destroy();
			var table = dojo.doc.createElement("table");
			dojo.addClass(table, "cascadeTable");
			var row = null;
			var column = null;
			row = dojo.doc.createElement("tr");
			row.className = "propApplyToLabelRow";
			column = dojo.doc.createElement("td");
			column.colSpan = '3';
			column.innerHTML = veNLS.applyToWhich;
			column.className = "propApplyToLabelCell";
			row.appendChild(column);
			table.appendChild(row);
	
			this._radio = [];
		
		
			
			for(var i = 0;i<this._values.length;i++){
				
				var valueString = this._formatRuleString(this._values[i]);
				
				// uncomment the disabled bit to make read only options unselectable 
				this._radio.push( dojo.create("input", {type:'radio', name:this._radioGroupName /*, disabled: this._values[i].readOnly*/}) );
				
				
				row = dojo.doc.createElement("tr");
				for(var j=0;j<this._values[i].extraClass.length;j++)
					dojo.addClass(row,this._values[i].extraClass[j]);
				
				column = dojo.doc.createElement("td");
				row.appendChild(column);
				
				dojo.addClass(column, "cascadeSpacer");
				column = dojo.doc.createElement("td");
				
				dojo.addClass(column,  "cascadeButton");
				column.appendChild(this._radio[this._radio.length-1]);
				row.appendChild(column);
				
				column = dojo.doc.createElement("td");
				dojo.addClass(column, "cascadText");
				column.innerHTML = "<div class='cascadeRuleText'>" + valueString + "</div>";
				
				if(!this._values[i].shorthand)
					this._handles.push(dojo.connect(this._radio[this._radio.length-1], "onclick", this, makeOnChange(i)));
				else
					this._handles.push(dojo.connect(this._radio[this._radio.length-1], "onclick", this, "_onChangeOverride"));
				
				if(this._values[i].shorthand){
					column.innerHTML += "<div>" + this._values[i].shorthand + ":" + this._values[i].value + ";" + "</div>";
				}else if(this._values[i].value){
					var typeString = "";
					for(var j = 0;j<this.target.length;j++)
						typeString += this.target[j] + (j-1==this.target.length?",":"");
					column.innerHTML += "<div class='ruleValue'>" + this.target[0] + ":" + this._values[i].value + ";" + "</div>";
				}
				
				row.appendChild(column);
				column = dojo.doc.createElement("td");
				dojo.addClass(column, "cascadRemove");
				
				var button = dojo.doc.createElement("button");
				if(this._values[i].readOnly){
					dojo.attr(button, "disabled", "true");
				}
				dojo.addClass(button,"cascadeRemoveButton");
				column.appendChild(button);
				this._handles.push(dojo.connect(button, "onclick", this, makeRemoveOnChange(i)));
				row.appendChild(column);
				column = dojo.doc.createElement("td");
				column.className = "cascadeSpacer";
				row.appendChild(column);
				table.appendChild(row);
			}
			
			// Add checkboxes to allow user to control whether the current style settings
			// should apply to the "Normal" style or the current interactive states.
			// FIXME: This feature just has to have bugs. For example, I don't see
			// logic for displaying the current property value when the state != "Normal"
			// FIXME: Ultimately, we will want to allow the user to select any number
			// of interactive states, not just "Normal" or the current state
			// FIXME: The default value of this checkbox should be true if there
			// is a custom value for the property for the current state, else false.
			this._widgetState = this._whichStateInputElement = undefined;
			var langObj = veNLS;
			var node = this._widget.domNode;
			var currentStatesList = States.getStatesListCurrent(node);
			for(var i=0; i<currentStatesList.length; i++){
				if(currentStatesList[i]){
					var state = currentStatesList[i];
					row = dojo.doc.createElement("tr");
					row.className = "propWhichStateRow";
					column = dojo.doc.createElement("td");
					column.colSpan = '3';
					var whichStateInputElement = dojo.create("input", {type:'checkbox',checked:false,className:'propWhichStateInput'});
					this._whichState = state;
					this._whichStateInputElement = whichStateInputElement;
					column.appendChild(whichStateInputElement);
					var whichStateLabelElement = dojo.create("label", {className:'propWhichStateLabel'});
					whichStateLabelElement.innerHTML = dojo.string.substitute(langObj.onlyApplyToState,[state]);
					column.appendChild(whichStateLabelElement);
					column.className = "propWhichStateCell";
					row.appendChild(column);
					table.appendChild(row);
					break;
				}
			}			
			this.cascadeTableDiv.appendChild(table);
			this._updateFieldValue();
		},
			
		selectRule : function(rule){
			for(var i = 0;i<this._values.length;i++){
				if(rule!="element.style" && this._values[i].rule==rule ){
					dojo.removeClass(this._radio[i].parentNode.parentNode, "hiddenCascadeNode");
					dojo.attr(this._radio[i], 'checked',true);
					this._onChange({target:i});
					break;
				}else if(rule=="element.style" &&  this._values[i].type=="element.style"){
					dojo.removeClass(this._radio[i].parentNode.parentNode, "hiddenCascadeNode");
					dojo.attr(this._radio[i], 'checked',true);
					this._onChange({target:i});
					break;
				}
			}
		},
		
		selectRuleBySelector : function(selector){
			if(selector=="element.style"){
				this._targetValueIndex = 0;
				if(this._values.length > 0){
					dojo.attr(this._radio[0], 'checked', true);
					if(this._values[0].shorthand){
						dojo.addClass(this._radio[0].parentNode.parentNode, "cssShorthandOverRidden");
					}else{
						var loc = this._getBaseLocation();
						this._setFieldValue(this._values[0].value,loc);
					}
				}
				return;
			}
			for(var i = 0;i<this._values.length;i++){
				if(this._values[i].type!="element.style" && this._values[i].rule && this._values[i].rule.hasSelector(selector)){
					
					dojo.removeClass(this._radio[i].parentNode.parentNode, "hiddenCascadeNode");
					dojo.attr(this._radio[i], 'checked',true);
					this._onChange({target:i});
					break;
				}
			}
		},
		
		_isTarget: function(t){
			if (t === '$std_10') {
				// this means all values are vaild for this selctor
				// FIXME: at some point in the future we will define $std_10 but for now it means all
				return true;
			}

			for(var i = 0;i<this.target.length;i++) {
				if(this.target[i]== t) {
					return true;
				}
			}
			
			return false;
			
		},
		
		_targetIsRootProperty: function() {
			/*
			 * Some properties should always be applied to the root element by default
			 */
			var rootPropeties = ['left', 'top', 'right', 'bottom'];
			for(var i = 0;i<this.target.length;i++) {
				if(rootPropeties.indexOf(this.target[i]) > -1) {
					return true;
				}
			}
			return false;
		},

		_updateFieldValue: function(){
			
			function isReadOnly(value){	
				if(value && value.rule && value.rule.getCSSFile){
					return systemResource.findResource(value.rule.getCSSFile().url).readOnly();
				}else{
					return false;
				}
			}
			
			if(this._widget==null) {
				this._setFieldValue("",this._getBaseLocation());
			}
		
			/*Disabled hasOverride logic - had bugs, causes problems with logic and not sure it helps user
			if(this._hasOverride){
				this._setFieldValue("(overrides)",null);
				var widget = dijit.byId(this.targetField);
				if(widget){
					this._handles.push(dojo.connect(widget, "onClick", this, "_onChangeOverride"));
				}else{
					var node = dojo.byId(this.targetField);
					if (node){
						this._handles.push(dojo.connect(node, "onclick", this, "_onChangeOverride"));
					}
				}
				
				return;
			}
			*/
		//if(this._isTarget("width")) debugger;
			var defaultSelection = this._getDefaultSelection();
			this._targetValueIndex = 0;
			/*
			if(defaultSelection!=null){
				this.selectRuleBySelector(defaultSelection);
				return;
			}
			*/
			var foundValue = false;
			var defaultValue = false;
			
			for(var i = 0;i<this._values.length;i++){
				/* skip read only values */
				//if(this._values[i].readOnly) continue;
				
				var isPageEditor = (this._editor.editorID == 'davinci.ve.HTMLPageEditor');
				var isThemeEditor = (this._editor.editorID == 'davinci.themeEdit.ThemeEditor');
				if((this._values[i].value && !foundValue && isThemeEditor) ||	// for theme editor, choose first CSS rule with a value
						(this._values[i].value && !foundValue && isPageEditor && !this._values[i].readOnly) ||	// for page editor, skip readonly values
						(!foundValue && !defaultValue && 
						 this._values[i].type!="element.style" && 
						 this._values[i].rule &&
						 this._values[i].rule.hasSelector(defaultSelection)) ||
						 (defaultSelection=="element.style" && this._values[i].type=="element.style")){
					
					var selection = this._values[i].type=="element.style"? "element.style" : this._values[i].rule;
					this.selectRule(selection);
					if(this._values[i].value)
						foundValue = true;
					defaultValue = true;
					
				}else if(foundValue && !defaultValue){
					dojo.addClass(this._radio[i].parentNode.parentNode, "cssOverRidden");
				}
			
			}
			if(!foundValue && !defaultValue && isPageEditor){
				this.selectRuleBySelector("element.style");
			}
			
		},

		_getThemeMetaDataByWidget: function(widget){
			var theme = this.context.getThemeMeta();
			if (!theme) {
				return null;
			}
			
			var widgetType = theme.loader.getType(widget);
			var meta = theme.loader.getMetaData(widgetType);
			
			var isHtmlWidget = false;
			var parts = (typeof widgetType == 'string') ? widgetType.split('.') : null;
			if(parts && parts[0] == 'html'){
				isHtmlWidget = true;
			}
			if (!meta && this.context.cssFiles && !isHtmlWidget){
				// chack the dynamically added files
				for (var i = 0; i < this.context.cssFiles.length; i++){
					var dTheme = Theme.getThemeByCssFile(this.context.cssFiles[i]);
					if (dTheme) {
						var themeMeta = Library.getThemeMetadata(dTheme);
						// found a theme for this css file, check for widget meta data
						meta = themeMeta.loader.getMetaData(widgetType);
						if (meta){
							break;
						}
					}
				}
			}
			return meta;
		},

		_getDefaultSelection: function(){
			
			// Note: Let's be careful to not get confused between the states in theme metadata
			// and the user-defined interactive states that are part of a user-created HTML page
			// For theme editor, we need to use whatever state is selected in States palette
			// For page editor, always use "Normal"
			var state = "Normal";
			if (this._editor.editorID == 'davinci.themeEdit.ThemeEditor'){
				state = state || States.getState();
			}

			var meta = this._getThemeMetaDataByWidget(this._widget);
			if(!meta || !meta.states){
				// no meta data so default is all properties are applied to the root element 
				return "element.style";
			}
			if (this._targetIsRootProperty()){
				// the target property is one of the properties that should always
				// default to the root element #3844
				return "element.style";
			}
			if(meta &&  meta.states[state] && meta.states[state].elements ){
				var md = meta.states[state].elements;
				for(var name in md){
					for(var p=0;p<md[name].length;p++){
						if( this._isTarget(md[name][p])){	
							if( name=="$root")
								return "element.style";
							else
								return  name;
						}
					}
				}
			}
			
			/* no metadata for where this value goes in DOM, search for default target rule */
			if(meta && meta.states[state] ){
				var theme = this.context.getThemeMeta();
				if (theme) {
					var widgetType = theme.loader.getType(this._widget);
					/*
					 * Some default selectors are not created until the first access,
					 * So use the getter to insure they are created.
					 */
					var md = theme.metadata.getStyleSelectors(widgetType, state, null); 
					if(md){
						for(var name in md){
							for(var c=0;c<md[name].length;c++){
								if(this._isTarget(md[name][c])){
									if (meta.rootSelectors) {
										for (var i = 0; i < meta.rootSelectors.length; i++){
											if (name == meta.rootSelectors[i]){
												// if the selector is in the rootSelectors array then apply this
												// prop to the node element by default
												return "element.style";
											}
										}
									}
									return name;
								}
							}
						}
					}
				}
				
			}
			
			return null;
		},
		
		_addDeltaRules : function(widget, values){

			var state = "Normal";
			var lastElementStyle = -1;
			var deltas = [];
			var cssFiles = this.context._getCssFiles();
			var dynamicThemeUrl = (cssFiles &&  cssFiles.length > 0)? cssFiles[0].url: null;
			var dynamicThemeReadOnly = false;
			if (dynamicThemeUrl){
				var file = systemResource.findResource(dynamicThemeUrl);
				dynamicThemeReadOnly = file._readOnly;
			}
			if (this._editor.editorID == 'davinci.themeEdit.ThemeEditor'){
				state = state || States.getState();
			}
			var meta = this._getThemeMetaDataByWidget(widget);
			if(meta &&  meta.states[state] && meta.states[state].selectors ){
				var md = meta.states[state].selectors;
				for(var name in md){
					var found = false;
					for(var i=0; i < values.length; i++){
						var r = values[i];
						if(r.type === 'element.style') {
							lastElementStyle = i;
						}
						if (r.type === 'theme' && r.ruleString === name && 
							(r.rule.parent.relativeURL == this.context._themeUrl || r.rule.parent.url == dynamicThemeUrl)
							) {
							found = true;
							break;
						}
					}
					if (!found){
						var matchLevel = this._computeMatchLevelSelector(name);
						if (dynamicThemeUrl && !dynamicThemeReadOnly) { // add rule for dynamic file, in most cases mobile 
							deltas.push({rule:null, ruleString:name, 
								targetFile:dynamicThemeUrl, className: null,
								value:null, matchLevel:matchLevel, type:'proposal'});
						}
						if (this.context._themeUrl && !this.context.theme.getFile().readOnly()) { // add rule for static file, in most cases desktop
							deltas.push({rule:null, ruleString:name, 
								targetFile:this.context._themeUrl, className: null,
								value:null, matchLevel:matchLevel, type:'proposal', proposalTarget: 'theme'});
						}
					}
				}
			}
			var n = lastElementStyle +1; // add the proposals after element.style
			deltas.forEach(function(item){
				values.splice(n++, 0,item);
			});
			return values;
		},
		
		_getRuleTargetValue : function(rule){
			//if(this._isTarget("background")) debugger;
			
			var value = null;
			if(rule){
				for(var i = 0;!value && i<this.target.length;i++)
					value = rule.getProperties(this.target[i]);
			}			
			if(value!=null){
				
				if(value.length > 1){
					var results = [];
					for(var i=0;i<value.length;i++){
						results.push(value[i].value);
					}
					return results;
				}else if(value.length==1){
					return value[0].value;
				}
			}
			
			return null;
			
		},
		
		_onChangeRemove : function(event){
			var target = event.target;
			this._changeValue(target,null);
			this._updateCascadeList();
		},
		
		_onChange : function(event){
			var loc = null;
			
			if(this._values[event.target].type=="element.style"){
				loc = this._getBaseLocation();
			}else if(this._values[event.target].type=="proposal"){
				var model = this.context.getModel();
				var cssFile = model.find({elementType:'CSSFile', relativeURL: this._values[event.target].targetFile}, true);
				var contextCssFiles =  this.context._getCssFiles();
				//#23
				if (cssFile /*&& cssFile.length > 0*/) {
					loc = systemResource.findResource(cssFile.url); //FIXME: can we skip findReource?
				} else if (contextCssFiles[0].url == this._values[event.target].targetFile){ // FIXME should run the array
					// maybe it's a dynamic theme (mobile)
					loc = systemResource.findResource(contextCssFiles[0].url); //contextCssFiles[0].cssFiles[0];
				}
				//#23
			}else{
				loc = systemResource.findResource(this._values[event.target].rule.getCSSFile().url);  //FIXME: can we skip findReource?
			}
			this._setFieldValue(this._values[event.target].value || "",loc);
			this._targetValueIndex = event.target;
		},
		
		_widgetValuesChanged : function(event){
			// If widget's values have changed and this particular property
			// has the dirty bit set on the cascade list, then update the cascade list.
			//FIXME: This is a bandaid fix to address bug #1005. It might have been better to
			//force a call to _updateCascadeList() for all properties whenever anything widget
			//properties change. This fix was safer.
			if(this._dirtyCascadeList){
				this._updateCascadeList();
				this._dirtyCascadeList = false;
				
			// Else update cascade list if this property is a sub-component of
			// a shorthand property (e.g., padding-left is a sub-component of padding)
			}else{
				/* have to listen for style values post change in case a shortcut property is updated */
				var shorthands = this._getShortHands();
				var values = event.values;
				for(var name in values){
					for(var i = 0;i<shorthands.length;i++){
						if(shorthands[i]==name){
							this._updateCascadeList();	
							return;
						}
					}
				}
			}
		},
		
		_formatRuleString : function(r){
			var langObj = veNLS;
			if(r.type=="element.style"){
				return "element.style";
			}
			var s = "";
			if(r.type=="proposal"){
				if (r.className) {
					s+=dojo.string.substitute(langObj.newRule, [r.className,r.targetFile]);
				} else {
					s+=dojo.string.substitute(langObj.newThemeRule, [r.targetFile]);
				}
				s+=r.ruleString;
			}else{
				var rule = r.rule;
				
				if(r.className){
					//s+="[class:" + r.className + " - Existing rule in " + this.targetFile + "] ";
					s+=dojo.string.substitute(langObj.existingRule, [r.className,this.targetFile]);
				}else if(r.type=="theme"){
					s+="[" + r.type + "] ";
				}
				if(r.ruleString){
					s+=r.ruleString;
				}else{
					for(var i = 0;i<rule.selectors.length;i++){
						if(i!=0) s+=", ";
						s+=rule.selectors[i].getLabel();
					}
				}
				var file = rule.searchUp("CSSFile");
				if(file)
					s += "  (" + file.url || file.relativeURL;
				
				if(r.property){
					//s += " line:" + r.property.startLine+ ")";
					s += dojo.string.substitute(langObj.line,[r.property.startLine]);
				}
				else{
					//s += " line:" + rule.startLine+ ")";
					s += dojo.string.substitute(langObj.line,[rule.startLine || langObj.propUndefined]);
				}
			}
			
			return s;
		},

		/* returns the top/target dom node for a widget for a specific property */
		_getWidgetTopDom: function (widget, propertyTarget){
			var selector = this._getSelector(widget, propertyTarget);
			// find the DOM node associated with this rule.
			var findTarget = function(target, rule){
				if(rule.matches(target)) {
					return target;
				}
				for(var i = 0;i<target.children.length;i++){
					return findTarget(target.children[i], rule); //FIXME: return stops for-loop at i=0
				}
			};

			if(selector){
				var rule = new CSSRule();
				rule.setText(selector + "{}");
				return findTarget(widget.domNode || widget, rule);
			}
			return null;
		},

		_widgetSelectionChanged : function (changeEvent){
			//	debugger;
		//	if(	!this._editor )
		//		return;
			//if(this._isTarget("font-family")) debugger;
			var widget=changeEvent[0];
			/* What about state changes and undo/redo? wdr
			 * if(this._widget == widget && this._subwidget==widget.subwidget)
				return false;
				*/
			this._widget = widget;
			
			if(this._widget){
				this.context = widget.getContext(); // #3046 at start up we can end up with no context or editor set
				this.targetFile = this.context.getAppCssRelativeFile();		// path to app.css
				this._editor = this.context.editor; // due to async editor selection getting published before the cascade is built
				                                    // so best to set this here on widget selection
				this._topWidgetDom = this._getWidgetTopDom(this._widget, this.target) || this._widget.domNode || this._widget;
			} else {
				this._topWidgetDom = null;
			}

			this._updateCascadeList();	
		},
		
		_getBaseLocation: function(){
			return systemResource.findResource(this._editor.getContext().getDocumentLocation());
		},
		
		_editorSelected: function(editorChange){
			this._editor = editorChange.editor;
			var context;
			if(this._editor && this._editor.getContext){
				context = this._editor.getContext();
			}
			if(context && this._editor.supports("style")){	
				this.context = context;
				this.targetFile = context.getAppCssRelativeFile();		// path to app.css
				var v = context.getSelection();
				if(v.length>0){
					this._widgetSelectionChanged(v);
				}else{
					this._widgetSelectionChanged([]);
				}
					                
			}else{
				this.context = null;
				this._widget = null;
				if(this._setFieldValue){
					this._setFieldValue("",null);
				}
			}
			this._updateCascadeList();
		},
		
		_onFieldFocus: function(){
			if(this.context) {
				this.context.blockChange(true);
			}
		},

		_destroy: function(){
			var containerNode = (this.cascadeTableDiv);
			dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function(w){
				w.destroy();
			});
			while(containerNode.firstChild){
				dojo._destroyElement(containerNode.firstChild);
			}
			dojo.forEach(this._handles,dojo.disconnect);
			this._handles = [];
		},
		
		_onFieldBlur: function(){
			if(this.context) {
				this.context.blockChange(false);
			}
		},
		
		_getClasses : function(target){
			/* return all CSS classes given target */
			
			var classes = target.getClassNames("class") || "";
			classes=classes.split(' ');
			
			/* have to filter out dupes */
			for(var i = 0;i<classes.length;i++){
				for(var j=i+1;j<classes.length;j++){
					if(classes[j]==classes[i]) {
						classes.splice(j,1);
					}
				}
			}
			
			return classes;
		},

		_getRelativeMetaTargetSelector: function(target){
			var theme = this.context.getThemeMeta();
			if(!theme) {
				return [];
			}
	/*FIXME: OLD LOGIC
	//FIXME: Ramifications if nested states?
	//FIXME: getState(node)?
			var state = davinci.ve.states.getState();
			
			if(!state) {
				state = "Normal";
			}
	*/
			var state = "Normal";
			var widget = this.context.getSelection();
			if(!widget.length){
				return [];
			}
			widget = widget[0];
			
			var widgetType = theme.loader.getType(widget);
			return theme.metadata.getRelativeStyleSelectorsText(widgetType, state, null, target, this.context.getTheme().className);
		},		

		_getClassSelector: function (className){
			
			var rel = this._getRelativeMetaTargetSelector(this.target);
			var text = rel.length ? rel[0] : "";

			var bodyNode = this.context.model.find({elementType:'HTMLElement', tag:'body'}, true),
				id = bodyNode.find({elementType:'HTMLAttribute', name:'id'}, true);
				bodyId = id.value;

			var theme = this.context.getTheme();
			var rules = [];
			if (!theme) {
				return rules;
			}
			var bodyClass = theme.className;
			
			/* PITFALL here. if the relative selector doesn't start at the top node, 
			 * then it needs to be a child selector (ie with a space) and no sibling.
			 */
			var selectors = text.split(",");
			selectors.forEach(function(selector){
				selector = selector.trim();
				rules.push("#" + bodyId + "." + bodyClass + " ." + className  + selector);
			}.bind(this));
			
			return rules;
		},
	
		// The following two routines calculates a specificity value for a CSS selector
		// These routines are candidates for moving into a more global part of the codebase
		// and/or to reconcile with logic in the model code.
		_computeMatchLevelSelector : function (selectorText){
			var simple_selectors=selectorText.split(this._regex_combinators);		
			var matchLevel=0;
			for(var i=0;i<simple_selectors.length;i++){
				var ss=simple_selectors[i];
				// Preprocess and remove all :not() pseudo-selectors
				// CSS rules are that the :not() specificity is that of its contents
				while(true){
					var not_result = ss.match(this._regex_not_pseudoclass);
					if(not_result!=null){
						matchLevel+=this._computeMatchLevelSimpleSelector(not_result[2]);
						ss=not_result[1]+not_result[3];
					}else{
						break;
					}
				}
				matchLevel+=this._computeMatchLevelSimpleSelector(ss);
			}
			return matchLevel;
		},

		_computeMatchLevelSimpleSelector : function (ss){
			var matchLevel=0;
			do{
				var foundMatch=false;			
				// Inner function that uses local variables that are in scope
				function regexCheck(regex, specificityValue){
					var result=ss.match(regex);
					if(result!=null){
						foundMatch=true;
						matchLevel+=specificityValue;
						ss=result[1]+result[3];
					}
				}
				// Get all pseudo elements first because they are 2-char matches (::)
				regexCheck(this._regex_pseudoelement,1);
				if(!foundMatch){
					// If no pseudo elements left, then search for other types of selectors.
					regexCheck(this._regex_id,100);
					regexCheck(this._regex_class,10);
					regexCheck(this._regex_attribute,10);
					regexCheck(this._regex_pseudoclass,10);
					regexCheck(this._regex_univeral,0);
				}
			}while(foundMatch);
			// If anything left over, it's a tag selector
			if(ss.length>0){
				matchLevel+=1;
			}
			return matchLevel;
		},
	
		// Determines if the two selector strings are equivalent
		// Returns true if they match, false if not.
		// Order matters in current code.
		_compareSelectors : function (selectorText1, selectorText2){
			// If one is null and the other is not null, return false
			if((!selectorText1 || !selectorText2) && selectorText1 != selectorText2){
				return false;
			}
			var simple_selectors_1 = selectorText1.split(this._regex_combinators);
			var simple_selectors_2 = selectorText2.split(this._regex_combinators);
			if(simple_selectors_1.length != simple_selectors_1.length){
				return false;
			}
			for(var i=0;i<simple_selectors_1.length;i++){
				var ss1=simple_selectors_1[i];
				var ss2=simple_selectors_2[i];
				if(ss1!=ss2){
					return false;
				}
			}
			return true;
		},
	
		// Determines if the two simple selector strings are equivalent
		// Returns true if they match, false if not.
		// Order matters in current code.
		_compareSimpleSelectors : function (ss1, ss2){
		}		
	});
	return dojo.mixin(cascade, {__id : 0});
});
