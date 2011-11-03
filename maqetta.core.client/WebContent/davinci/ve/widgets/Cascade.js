dojo.provide("davinci.ve.widgets.Cascade");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.html.CSSModel");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ui.ErrorDialog");
dojo.require("davinci.ui.widgets.DocileDialog");
dojo.require("davinci.workbench.Preferences");
dojo.require("davinci.Workbench");
dojo.require("davinci.ve.widget");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "ve");  

dojo.declare("davinci.ve.widgets.Cascade",  [davinci.workbench.WidgetLite], {

	target : null,
	targetField : null,
	toggleClasses : null,
	targetFile : "app.css",
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
		this.topDiv = dojo.doc.createElement("div");

		
		this.container.appendChild(this.topDiv);
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
			this._getFieldValue = function(){
				return widget.attr('value'); 
			};
			this._setFieldValue = function(value, loc){
				this._value = value || "";
				this._loc = loc;
				
				if(widget._setBaseLocationAttr)
					widget.attr('baseLocation', loc?loc.getPath():null);
				
				widget.attr('value', this._value, true);
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
	
	
	_canModifyRule : function(modifiedRule){
		
		// not all "rules" passed in are rules, and sometimes they are null (in case of element.style).
		if(!modifiedRule || !modifiedRule.getCSSFile) // empty object, in cases like element.style there is no rule
			return true; 
		
		var cssFile = modifiedRule.getCSSFile();
		if(cssFile==null) return true;
		
		
		var resource = cssFile.getResource();
		return !resource.readOnly();
		
	},
	
	
	
	_onFieldChange : function(){
		
		if(this.context)
			this.context.blockChange(false);
		
		if(this._value==this._getFieldValue())
			return;
		if(this._getFieldValue()=="(overrides)"){
			
			this._setFieldValue("(overrides)", null);
			return;
		}

		// Pretty sure this._targetValueIndex will not have a value only when
		// something is wrong, such as theme metadata saying no rules are available
		// and that inline style is disallowed.
		if(typeof this._targetValueIndex != "number"){
			console.log("_onFieldChange. this._targetValueIndex is not a number");
			return;
		}
		
		var editorPrefs = davinci.workbench.Preferences.getPreferences('davinci.ve.editorPrefs', davinci.Runtime.getProject());
		
		var askUser = false;
		// New logic: prompt user only if theme CSS files are going to change
		var content = null;
		
		var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
		if(this._values[this._targetValueIndex].readOnly){
			//FIXME: the commented out message in next line provides a more informative error message
            var helpLink = "<a href='app/docs/index.html#peAppCss' target='_blank'>"+ langObj.creatingStyleRules +"</a>";
			var content = langObj.propChangeCannotComplete + "<br><br>" + dojo.string.substitute(langObj.toChangeProperty,[helpLink]) + "<br/><br/>";
			var errorDialog = new davinci.ui.ErrorDialog({errorText: content});
			davinci.Workbench.showModal(errorDialog, langObj.errorModifyingValue);
            
            //alert("Error- cant change read only value")
			this._setFieldValue(this._value,this._loc);
			return;
		}else if(this._values[this._targetValueIndex].type=="theme" &&
				   editorPrefs.cssOverrideWarn &&
					this._editor.supports("MultiPropTarget")){
			askUser = true;
			var helpLink = "<a href='app/docs/index.html#peAppCss' target='_blank'>"+ langObj.creatingStyleRules +"</a>";
            content = langObj.changeWillModify+"<br><br>"+dojo.string.substitute(langObj.insteadOfChanging,[helpLink])+"<br><br>"+langObj.okToProceed;
        }
		// Old prompt if changing app.css or other non-theme CSS file:
		// content = "This change will modify a CSS rule within a CSS file and therefore may globally effect other widgets. OK to proceed with this change?";

		if(askUser){
			var overRide = new davinci.ui.widgets.DocileDialog({content:content,
																callBack:dojo.hitch(this, function(result){
																
																	if(result.value=="OK"){
																		this._value=this._getFieldValue();
																		this._changeValue(this._targetValueIndex,this._value);
																	}else{
																		// set back to original value
																		this._setFieldValue(this._value,this._loc);
																	}
																	
																	if(!result.alwaysShow){
																		editorPrefs.cssOverrideWarn = false;
																		davinci.workbench.Preferences.savePreferences('davinci.ve.editorPrefs',null, editorPrefs);
																	}
																	
																})});
																	
			
		}else{
			this._value=this._getFieldValue();
			this._changeValue(this._targetValueIndex,this._value);
			
		}
	},
	
	_changeValue : function(targetIndex,value){
		
		// applyToWhichStates controls whether style change is attached to Normal or other states
		//   "current" => apply to currently active state
		//   [...array of strings...] => apply to these states (may not yet be implemented)
		//   any other value (null/undefined/"Normal"/etc) => apply to Normal state
		var applyToWhichStates = undefined;
		if(this._whichStateInputElement && this._whichStateInputElement.checked){
			applyToWhichStates = "current";
		}
		var targetRule = this._values[targetIndex];
		var valueObject = {};
		for(var i = 0;i<this.target.length;i++)
			valueObject[this.target[i]] = value;
		if(targetRule.type=="element.style"){
			dojo.publish("/davinci/ui/styleValuesChange",[{values:valueObject, appliesTo:'inline', applyToWhichStates:applyToWhichStates }]);
		}else{
			dojo.publish("/davinci/ui/styleValuesChange",[{values:valueObject, appliesTo:targetRule, applyToWhichStates:applyToWhichStates }]);
		}
	},
	
	_getAttribStyleValue : function(){
		return this.context.getStyleAttributeValues(this._widget);
	},
	
	_getShortHands : function(){
		if(this._shorthands)
			return this._shorthands;
		this._shorthands = [];
		for(var i = 0;i<this.target.length;i++)
			this._buildShortHands(this.target[i]);
	
		return this._shorthands;
	},
	
	_buildShortHands : function(target){
		if(target in davinci.ve.utils.CssShortHand.map){
			var expanded = davinci.ve.utils.CssShortHand.map[target];
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
	
	_onChangeOverride : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
		alert(langObj.valueIsOverriden);
		return false;
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
		/* element rules */
		var defaultSelection=this._getDefaultSelection();
		
		if(this._editor.supports("inline-style") && 
		  (this._topWidgetDom==this._widget.domNode || defaultSelection=="element.style")){
			var v = this._getAttribStyleValue();
			var value = null;
			for(var name in this.target)
				if(name in v)
					value = v[name];
			
			values.push({rule:v, value:value, matchLevel:'element.style', type:'element.style'});
		}
		
		/* selection (queried) rules */
		var v = this.context.getSelectionCssRules(this._topWidgetDom);
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
		
		/* create list of proposals for new rules (using classes defined on this widget) */
		var allCssClasses = this._getClasses(this._widget);
		var nProposals = 0;
		for(var i=0;i<allCssClasses.length;i++){
			var thisClass=allCssClasses[i];
			if(typeof thisClass=="string" && thisClass.length>0){
				var proposedNewRule=this._getClassSelector(thisClass);
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
			}
		}

		/* theme/meta rules */
		if (this._editor.editorID == 'davinci.ve.ThemeEditor'){
			v = this._editor._getCssRules(this._widget, null, this._editor._currentState);
		} else if(this._widget){
			v = this.context.getMetaTargets(this._widget,this.target);
		}else{
			v=[];
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
				values.push({rule : v[i], matchLevel: 'theme', type:'theme'});
		}
		
		return values;
	},
	
	_buildCssRuleset : function(){
		
		//if(this._isTarget("color")) debugger;
		
		var allRules = this._getAllRules();
		this._values = [];
		this._hasOverride = false;

		/* figure out the properties values */
		var shorthands = this._getShortHands();
		for(var i = 0;i<allRules.length;i++){
			var rule = allRules[i].rule;
			if(rule){
				for(var k=0;k<shorthands.length;k++){
					if(allRules[i].type!="element.style" && allRules[i].rule.getProperty(shorthands[i])!=null){
						allRules[i].shorthand = shorthands[i];
						var prop = rule.getProperty(shorthands[i]);
						allRules[i].value = prop && prop.value;
						
						this._hasOverride = true;
						
					}else if(allRules[i].type=="element.style" && dojo.indexOf(allRules[i].rule, shorthands[i])>-1){
						allRules[i].shorthand = shorthands[i];
						var index = dojo.indexOf(allRules[i].rule, shorthands[i]);
						allRules[i].value = rule[index];
						this._hasOverride = true;
					}
				}
				if(!allRules[i].shorthand && allRules[i].type!="element.style")
					allRules[i].value = this._getRuleTargetValue(rule);
				else if(!allRules[i].shorthand && allRules[i].type=="element.style")
						allRules[i].value = rule[this.target[0]];
			}else{
				// rule is null when type=='proposal'
				allRules[i].value=null;
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
			if(this._hasOverride)
				rules[i].extraClass.push("shorthandOverrideCascadeNode");
			else if(foundValue)
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
		if(!this._widget){
			this._setFieldValue("",null);
			dojo.addClass(this.container,"dijitHidden");
			return;
		}
		var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
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
		column.innerHTML = langObj.applyToWhich;
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

		// Checkbox to allow user to control whether the current style settings
		// should apply to the "Normal" style or the current interactive state.
		// FIXME: This feature just has to have bugs. For example, I don't see
		// logic for displaying the current property value when the state != "Normal"
		// FIXME: Ultimately, we will want to allow the user to select any number
		// of interactive states, not just "Normal" or the current state
		// FIXME: The default value of this checkbox should be true if there
		// is a custom value for the property for the current state, else false.
		var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
		var state=davinci.ve.states.getState();
		var isNormalState = davinci.ve.states.isNormalState(state);
		if(!isNormalState){
			row = dojo.doc.createElement("tr");
			row.className = "propWhichStateRow";
			column = dojo.doc.createElement("td");
			column.colSpan = '3';
			var whichStateInputElement = dojo.create("input", {type:'checkbox',checked:false,className:'propWhichStateInput'});
			this._whichStateInputElement = whichStateInputElement;
			column.appendChild(whichStateInputElement);
			var whichStateLabelElement = dojo.create("label", {className:'propWhichStateLabel'});
			whichStateLabelElement.innerHTML = dojo.string.substitute(langObj.onlyApplyToState,[state]);
			column.appendChild(whichStateLabelElement);
			column.className = "propWhichStateCell";
			row.appendChild(column);
			table.appendChild(row);
		}
		
		this.topDiv.appendChild(table);
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
	
	_isTarget : function(t){
		for(var i = 0;i<this.target.length;i++)
			if(this.target[i]== t) return true;
		
		return false;
		
	},
	_updateFieldValue : function(){
		
		function isReadOnly(value){	
			if(value && value.rule && value.rule.getCSSFile){
				var file = value.rule.getCSSFile();
				var resource = file.getResource();
				return resource.readOnly();
			}else{
				return false;
			}
		}
		
		if(this._widget==null)
			this._setFieldValue("",this._getBaseLocation());
	
		if(this._hasOverride){
			this._setFieldValue("(overrides)",null);
			var widget = dijit.byId(this.targetField);
			if(widget){
				this._handles.push(dojo.connect(widget, "onClick", this, "_onChangeOverride"));
			}else{
				var node = dojo.byId(this.targetField);
				this._handles.push(dojo.connect(node, "onclick", this, "_onChangeOverride"));
			}
			
			return;
		}
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
			
			if((this._values[i].value && !foundValue && !defaultValue) ||
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
		if(!foundValue && !defaultValue){
			this.selectRuleBySelector("element.style");
		}
		
	},
	_getDefaultSelection : function(){
		
		var theme = this.context.getThemeMeta();
		if(!theme)
			return null;
		
		var widgetType = theme.loader.getType(this._widget);
		
		// Note: Let's be careful to not get confused between the states in theme metadata
		// and the user-defined interactive states that are part of a user-created HTML page
		// For theme editor, we need to use whatever state is selected in States palette
		// For page editor, always use "Normal"
		var state = "Normal";
		if (this._editor.editorID == 'davinci.ve.ThemeEditor'){
			state = davinci.ve.states.getState();
		}

		var meta = theme.loader.getMetaData(widgetType);
		if(!meta || !meta.states){
			
		//	console.log("error loading metadata:\nwidgetType:" + widgetType + "\nfound:\n" + meta);
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
		if(meta && meta.states[state] && meta.states[state].selectors){
			var md = meta.states[state].selectors;
			for(var name in md){
				for(var c=0;c<md[name].length;c++){
					if(this._isTarget(md[name][c])) return name;
				}
			}
		}
		
		return null;
	},
	
	_getRuleTargetValue : function(rule){
		var value = null;
		if(rule){
			for(var i = 0;!value && i<this.target.length;i++)
				value = rule.getProperty(this.target[i]);
		}			
		return value && value.value;
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
			loc=cssFile.getResource();
		}else{
			loc = this._values[event.target].rule.getCSSFile().getResource();
		}
		this._setFieldValue(this._values[event.target].value || "",loc);
		this._targetValueIndex = event.target;
	},
	
	_widgetValuesChanged : function(event){
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
	},
	_formatRuleString : function(r){
		var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
		if(r.type=="element.style"){
			return "element.style";
		}
		var s = "";
		if(r.type=="proposal"){
			//s+="[class:" + r.className + " - New rule in " + this.targetFile + "] ";
			s+=dojo.string.substitute(langObj.newRule, [r.className,this.targetFile]);
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
		if(this._widget)
			this._topWidgetDom = this.context.getWidgetTopDom(this._widget, this.target) || this._widget.domNode || this._widget;
		else
			this._topWidgetDom = null;
		
		this._updateCascadeList();	
	
	},
	
	_getBaseLocation : function(){
		return this._editor.getContext().getBaseResource();
	},
	
	_editorSelected : function(editorChange){
		this._editor = editorChange.editor;
		if(this._editor && this._editor.getContext){
			
			this.context = this._editor.getContext();
			var v = this.context.getSelection();
			if(v.length>0){
				this._widgetSelectionChanged(v);
			}else{
				this._widgetSelectionChanged([]);
			}
				                
		}else{
			this.context = null;
			this._widget = null;
			this._setFieldValue("",null);
		}
		this._updateCascadeList();
	},
	
	_onFieldFocus : function(){
		if(this.context)
			this.context.blockChange(true);
	},
	_destroy: function(){
		var containerNode = (this.topDiv);
		dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function(w){
			w.destroy();
		});
		while(containerNode.firstChild){
			dojo._destroyElement(containerNode.firstChild);
		}
		this.topDiv = dojo.doc.createElement("div");
		this.container.appendChild(this.topDiv);
		dojo.forEach(this._handles,dojo.disconnect);
		this._handles = [];
	},
	
	_onFieldBlur : function(){
		if(this.context)
			this.context.blockChange(false);		
	},
	
	_getClasses : function(target){
		/* return all CSS classes given target */
		
		var classes = target.getClassNames("class") || "";
		classes=classes.split(' ');
		
		/* have to filter out dupes */
		for(var i = 0;i<classes.length;i++){
			for(var j=i+1;j<classes.length;j++){
				if(classes[j]==classes[i])
					classes.splice(j,1);
			}
		}
		
		return classes;
		
	},
	
	_getClassSelector : function (className){
		
		var rel = this.context.getRelativeMetaTargetSelector(this.target);
		var text = rel.length>0?rel[0]:"";
		var bodyId = this.context.getBodyId();
		var theme = this.context.getTheme();
		var bodyClass = theme.className;
		
		/* PITFALL here. if the relative selector doesn't start at the top node, 
		 * then it needs to be a child selector (ie with a space) and no sibling.
		 */
		return "#" + bodyId + "." + bodyClass + " ." + className  + text;
		
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
davinci.ve.widgets.Cascade.__id = 0;