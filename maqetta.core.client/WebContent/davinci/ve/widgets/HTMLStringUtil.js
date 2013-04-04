define([
	"davinci/Runtime",
	"./FontDataStore",
	"./FontComboBox",
	"./MultiInputDropDown",
	"dijit/form/ComboBox",
	"dijit/form/DateTextBox",
	"dijit/form/TimeTextBox",
	"./MetaDataStore",
	"./ColorPicker",
	"./Background"
],function(Runtime, FontDataStore){

	var HTMLStringUtil = dojo.getObject("davinci.ve.widgets.HTMLStringUtil", true);

	dojo.mixin(HTMLStringUtil, {
			__id: 0,
			idPrefix: "davinci_ve_widgets_properties_generated",
			_currentPropSection: null,
			
			animSS:null,	// Cache of style sheet that contains animation effects
			animRuleIndex:{}, 	// Cache of style rules that contains animation effects, indexed by selector
			
			getCurrentPropSection: function(){
				return this._currentPropSection;
			},
		
			getId: function(){
				return this.idPrefix + (this.__id++);
			},
		
		injectId: function(htmlText,id){
			/* attempts to inject an ID in the top HTML element */
			
			var firstEndTag = htmlText.indexOf(">");
			
			if(!firstEndTag) {
				return "<span id='" + id + "'>" + htmlText + "</span";
			}

			return htmlText.substring(0,firstEndTag) + " id='" + id + "'" + htmlText.substring(firstEndTag, htmlText.length);
		},
		
		getEditor: function(jsonString){
			
			function getValueAndTitle(value) {
				var obj = {};
				obj.value = (typeof(value.value) != "undefined" && value.value !== null) ? value.value : value;
				// if it is an object use the value and look for a title
				obj.title = value.title || obj.value;
				return obj;
			}
			
			var metaType = jsonString.type; 
			var id = this.getId();
			var extraAttribs = "";
			
			jsonString.id = id;

			var disabled = jsonString.disabled ? " disabled='true' " : "";			
			
			/*
			 * 
			 * when writing dijit markup BE SURE TO INCLUDE class='propertyPaneEditableValue' to signify a onChange target and property target
			 * as well as the 'extraAttributes' string, which will contain the inputs target as parsed from JSON template.
			 */

			switch (metaType){
				case "multi":
					var valuesText = "";
					if(jsonString.values){
						valuesText = "data='"
							+ dojo.toJson(dojo.map(jsonString.values, function(v){ return {value: v}; })) 
							+ "'";
					}
					var text = "<div dojoType='davinci.ve.widgets.MultiInputDropDown' " + valuesText + "  class='propertyPaneEditablevalue' style='display:inline-block; width:100%;' id='"+ id + "'"+disabled+"></div>";
					
			        return text;
				case "boolean":
					var text = "<input type='checkbox' class='propertyPaneEditablevalue' style='display:inline-block;margin-left:5px' id='"+ id + "'></input>";
			        return text;
			        
				case "comboEdit":
					var values = jsonString.values;
					var text = "<select dojoType='dijit.form.ComboBox' autoComplete='false' style='display:inline-block; width:100%;' id='"+ id + "'"+disabled+">";
					for(var i = 0;i<values.length;i++) {
						var obj = getValueAndTitle(values[i]);
						text+="<option value='" + obj.value + "'>" + obj.title + "</option>";
					}
					text+="</select>";
					return text;
					
				case "combo":
					var values = jsonString.values;
					var text = "<select style='display:inline-block; width:100%;' id='"+ id + "'"+disabled+">";
					for(var i = 0;i<values.length;i++) {
						var obj = getValueAndTitle(values[i]);
						text+="<option value='" + obj.value + "'>" + obj.title + "</option>";
					}
					text+="</select>";
					return text;
				case "font":
					var text = "<div dojoType='davinci.ve.widgets.FontDataStore' jsId='"+ id + ('_fontStore') + "'>";
						text+= "<div dojoType='davinci.ve.widgets.FontComboBox' value='" + FontDataStore.fonts[0].value + "' store='"+ id + ('_fontStore') + "'  id='"+ id +"' class='propertyPaneEditablevalue' style='display:inline-block; width:100%;'></div>";
					return text;
				case "state":
					var text="<div dojoType='davinci.ve.widgets.MetaDataStore' jsId='davinci.properties.event"+ (id) + ('_Store') + "'>";
					text+="<div dojoType='dijit.form.ComboBox' id='"+ id +"'store='davinci.properties.event"+ (id) + ('_Store') + "' class='propertyPaneEditablevalue' style='display:inline-block; width:100%;' autoComplete='false'></div>";
					return text;
				case "color":
					var text = "<div class='propertyPaneEditablevalue' dojoType='davinci.ve.widgets.ColorPicker' id='"+ id + "' ></div>";
					return text;
					/*todo - write color chooser widget */
				case "background":
					var valuesText = dojo.isArray(jsonString.values) ? " data='" + dojo.toJson(jsonString.values) + "'" : "";
					var propName = dojo.isArray(jsonString.target) ? jsonString.target[0] : jsonString.target;
					var propNameText = " propname='" + propName + "'";
					var swatchText = jsonString.colorswatch ? " colorswatch='true'" : '';
					var text="<div dojoType='davinci.ve.widgets.Background' id='" + id + "'" + valuesText + propNameText + swatchText + "></div>";
					return text;		
			
				case "border":
					/* todo - write border widget */
				case "number":
				case "object":
				case "text":
				case "array":
				case "string":
					if (jsonString.format == "date") {
						return "<div class='propertyPaneEditablevalue' dojoType='dijit.form.DateTextBox' id='"+ id + "'></input>";
					} else if (jsonString.format == "time") {
						return "<div class='propertyPaneEditablevalue' dojoType='dijit.form.TimeTextBox' id='"+ id + "'></input>";
					} 
					// else fallthrough...
				default:
					var text = "<input type='text' class='propertyPaneEditablevalue' style='display:inline-block; width:100%;' id='"+ id + "'></input>";
					return text;
			}
		},

		generateTable: function(page,params){
			var rowsOnly = params ? params.rowsOnly : false;
			var zeroSpaceForIncrDecr = params ? params.zeroSpaceForIncrDecr : false;
			var incrDecrSize = zeroSpaceForIncrDecr ? '0px' : '20px';
			var htmlText = "";
			if(page.html){
				page.id=this.getId();
				return this.injectId(page.html,page.id);
			}
			
			var tableHtml = "<table class='property_table_stretchable' border='0' width='100%' align='center' cellspacing='0' cellpadding='0'>";
			tableHtml += "<colgroup>"; 
			tableHtml += "<col style='width:6px;' />"
			tableHtml +="<col class='gap02' />";
			tableHtml +="<col class='gap03' />";
			tableHtml +="<col style='width:"+incrDecrSize+";' />";
			tableHtml += "<col style='width:6px;' />"
			tableHtml +="</colgroup>";
		//	tableHtml +="<tr class='property_table_rowgap property_table_rowgap_group_separator'><td colspan='7'/></tr>";
			if(!rowsOnly)
				htmlText+=tableHtml;
			
			for(var i=0;i<page.length;i++){
					
					if(page[i].widgetHtml){
						
						page[i].id=this.getId();
						page[i].rowId = this.getId();
						htmlText+= "<tr id='" + page[i].rowId +"'";
						
						if( page[i].rowClass){
							htmlText+=" class='" + page[i].rowClass + "'";
						}
						htmlText+=">";
						htmlText+= "<td colspan='5' width='100%'>";
						htmlText+= this.injectId(page[i].widgetHtml,page[i].id);
						htmlText+="</td>";
						htmlText+= "</tr>";
					}else if(page[i].html){
					
						page[i].id=this.getId();
						page[i].rowId = this.getId();
						htmlText+= "<tr id='" + page[i].rowId +"'";
						htmlText+= " class='cssPropertySection";
						
						if( page[i].rowClass){
							htmlText+=" " + page[i].rowClass;
						}
						htmlText+="'>";
						htmlText+= "<td colspan='5' width='100%'>";
						htmlText+= page[i].html;
						htmlText+="</td>";
						htmlText+= "</tr>";
					}else if(page[i].type=="toggleSection"){
					
						htmlText+= "<tr id='" + page[i].id + "'  class='cssPropertySection'><td colspan='5'>";
					
						var onclick = "";
						var moreTable = this.generateTable(page[i].pageTemplate, {rowsOnly:true});
						for(var j=0;j<page[i].pageTemplate.length;j++){
							if(page[i].pageTemplate[j].rowId){
								onclick+= "dojo.toggleClass('" + page[i].pageTemplate[j].rowId + "','propertiesSectionHidden');";
							}
							if(page[i].pageTemplate[j].cascadeSectionRowId){
								onclick+= "if(this.checked){dojo.removeClass('" + page[i].pageTemplate[j].cascadeSectionRowId + "','propertiesSectionHidden');}else{{dojo.addClass('" + page[i].pageTemplate[j].cascadeSectionRowId + "','propertiesSectionHidden');}}";
							}
						}

						htmlText+="<input type='checkbox' onclick=\"" + onclick + "\"></input>";
						htmlText+= page[i].display;
						htmlText+="</td></tr>";
						htmlText+=moreTable;
					}else if(page[i].display){
						page[i].toggleCascade = this.getId();
					//	page[i].showHelp = this.getId();
						page[i].cascadeSection = this.getId();
						page[i].rowId = this.getId();
						page[i].cascadeSectionRowId = this.getId();
						
						htmlText+= "<tr id='" + page[i].rowId +"'";
						htmlText+=" class='cssPropertySection";
						if( page[i].rowClass){
							htmlText+=" " + page[i].rowClass;
						}
						htmlText+="'";
						htmlText+=" propName='"+page[i].display+"'";
						htmlText+=">";
						htmlText+="<td/>";
						htmlText+="<td class='propertyDisplayName'>" + page[i].display + ":&nbsp;</td>";
						
						htmlText+="<td class='propertyInputField'>" + this.getEditor(page[i]) + "</td>";
						htmlText+="<td class='propertyExtra' nowrap='true'>";
						if(page[i].target && !page[i].hideCascade){
			
							htmlText+= "<div width='100%'><button class='showCss propertyButton' id='" + page[i].toggleCascade + "'";
							htmlText+= " onClick=\"davinci.ve.widgets.HTMLStringUtil.showProperty(";
							htmlText+= "'"+page[i].rowId+"'";
							htmlText+= ")\">&gt;</button>";
							htmlText+="</div>";
						}
						htmlText+="<td/>";
						htmlText+= "</tr>";
						if(page[i].target && !page[i].hideCascade){
							var toggleClasses = "{'cascadeSectionRowId':\"" + page[i].cascadeSectionRowId + "\",'toggleCascade':\"" + page[i].toggleCascade +'\"}';
							htmlText+= "<tr id='" + page[i].cascadeSectionRowId +"' class='cssCascadeSection cascadeRowHidden'>";
							htmlText+="<td colspan='5' width='100%' class='showCascadeDiv'><div dojoType='davinci.ve.widgets.Cascade' toggleClasses=" + toggleClasses + " target='" + dojo.toJson(page[i].target)+"' targetField='\"" + page[i].id + "\"' id='" + page[i].cascadeSection + "'></div></td></tr>";
						}
					}else{
						htmlText+="</table>";
						htmlText+=this.getEditor(page[i]);
						htmlText+=tableHtml;
					}
			}
			if(!rowsOnly)
				htmlText+="</table>";
			return htmlText;
			
		},
		generateTemplate: function(jsonString){
			var htmlText = "";
			
			if(jsonString.pageTemplate){
				if( jsonString.key){
					jsonString.id = this.getId();
					htmlText = "<div class='propGroup' id='" + jsonString.id +"' propGroup='"+jsonString.key+"'>";
				}	
					
				htmlText+=this.generateTable(jsonString.pageTemplate);
				htmlText+="</div>";
			}else if(jsonString.html){
				htmlText+=jsonString.html;
			}else if(jsonString.widgetHtml){
			
				jsonString.id = this.getId();
				htmlText+= this.injectId(jsonString.widgetHtml,jsonString.id);
			}
			return htmlText;
		},
		stylesheetHref: "propview.css",
		
		animShowSectionClass: "propRootDetailsContainer",
		animShowSectionClassSelector: ".propRootDetailsContainer",
		animShowDetailsClass: "property_table_stretchable",
		animShowDetailsClassSelector: ".property_table_stretchable",
		showPropAnimClasses: ["propRowFadeIn","propRowFadeOut","propRowTransparent","propRowOpaque","propRowHidden"],
		
		showRoot: function(){
			var Util = this;
			Util._hideSectionShowRoot();
			Util._currentPropSection = null;
			return false;
		},
		
		showSection: function(sectionKey, sectionTitle){
			var Util = this;
			Util._initSection(sectionKey);
			return false;
		},

		showProperty: function(propertyRowId){
			
			var hideAllButThisRow = function (){
				for(var i=0; i<rowParent.children.length; i++){
					var node=rowParent.children[i];
					if(node.nodeType==1 && dojo.hasClass(node,"cssPropertySection")){	// 1=Element. IE7 bug - children[] includes comments
						if(node==thisPropertyRowTR){
							Util._addRemoveClasses(node, allTRAnimClasses, []);
						}else{
							Util._addRemoveClasses(node, allTRAnimClasses, ["propRowHidden"]);
						}
					}
				}
			}
		
			var fadeInCascade = function(){
				if(thisCascadeRowTR){
					dojo.removeClass(thisCascadeRowTR,"cascadeRowHidden");
					dojo.addClass(thisCascadeRowTR,"cascadeRowTransparent");	// To set transition starting point at opacity:0
					setTimeout(function(){
						dojo.removeClass(thisCascadeRowTR,"cascadeRowTransparent");
						dojo.addClass(thisCascadeRowTR,"cascadeRowFadeIn");
					},1);
				}
			};
		
			function transEnd(event){
				dojo.disconnect(webkitConnection);
				dojo.disconnect(connection);
				hideAllButThisRow();			
				var returnObj = Util._findRule(Util.animShowDetailsClassSelector);
				if(!returnObj){
					console.error('HTMLStringUtil showProperty: transEnd: rule not found');
					return;
				}else{
					var ss = returnObj.ss;
					var ruleIndex = returnObj.ruleIndex;
				}
				ss.deleteRule(ruleIndex);
				ss.insertRule(Util.animShowDetailsClassSelector + " { margin-top:0px; }",ruleIndex);
				fadeInCascade();
			}
			
			dojo.addClass(dojo.byId('davinci_app'),"showingCascade");
			
			var Util = this;
			var allTRAnimClasses = this.showPropAnimClasses;
			
			// Find various elements
			//   thisPropertyRowTR: TR corresponding to eventElem (element that received user click)
			//   rowParent: parent element of thisPropertyRowTR (either TBODY or TABLE)
			//   firstPropertyRowTR: 1st child of rowParent that is a TR with class "cssPropertySection". Holds prop's input entry widgets.
			//   thisCascadeRowTR: TR element just after firstPropertyRowTR, with class "cssCascadeSection". Holds prop's cascade info.
			//   propertySectionTABLE: TABLE element that is ancestor of thisPropertyRowTR.
			var thisPropertyRowTR = dojo.byId(propertyRowId);
			var rowParent = thisPropertyRowTR.parentNode;
			var firstPropertyRowTR = Util._searchSiblingsByTagClass(rowParent.children[0], "TR", "cssPropertySection");
			var thisCascadeRowTR = Util._searchSiblingsByTagClass(thisPropertyRowTR.nextSibling, "TR", "cssCascadeSection");
			var propertySectionTABLE = Util._searchUpByTagClass(rowParent, "TABLE", Util.animShowDetailsClass);
			var propertyGroupDIV = Util._searchUpByTagClass(thisPropertyRowTR, "DIV", "propGroup");
			var sectionKey = dojo.attr(propertyGroupDIV, "propGroup");
			var propName = dojo.attr(thisPropertyRowTR, "propName");
			var SwitchingStyleView = require("davinci/ve/views/SwitchingStyleView");
			var sectionTitle = SwitchingStyleView.prototype.sectionTitleFromKey(sectionKey);

			if(Runtime.supportsCSS3Transitions){
				
				// Compute top coordinate diff between firstPropertyRowTR and thisPropertyRowTR
				var firstMetrics = dojo.marginBox(firstPropertyRowTR);
				var thisMetrics = dojo.marginBox(thisPropertyRowTR);
				var topDiff = thisMetrics.t - firstMetrics.t;
				var returnObj = Util._findRule(Util.animShowDetailsClassSelector);
				if(!returnObj){
					console.error('HTMLStringUtil showProperty: transEnd: rule not found');
					return;
				}else{
					var ss = returnObj.ss;
					var ruleIndex = returnObj.ruleIndex;
				}
				
				var webkitConnection = dojo.connect(propertySectionTABLE,'webkitTransitionEnd', transEnd);
				var connection = dojo.connect(propertySectionTABLE,'transitionend', transEnd);
				ss.deleteRule(ruleIndex);
				// opacity:.99 to force animation to occur even if topDiff is zero.
				ss.insertRule(Util.animShowDetailsClassSelector + " { margin-top:-"+topDiff+"px; opacity:.99; -webkit-transition: all .6s ease; -moz-transition: all .6s ease; }",ruleIndex);
				
				// assign classes to cause fade-in/fade-out effects
				var foundThisPropertyRowTR = false;
				for(var i=0; i<rowParent.children.length; i++){
					var node=rowParent.children[i];
					if(node.nodeType==1 && dojo.hasClass(node,"cssPropertySection")){	// 1=Element. IE7 bug - children[] includes comments
						if(node==thisPropertyRowTR){
							Util._addRemoveClasses(node, allTRAnimClasses, ["propRowFadeIn"]);
							foundThisPropertyRowTR = true;
						}else if(!foundThisPropertyRowTR){
							Util._addRemoveClasses(node, allTRAnimClasses, ["propRowTransparent"]);
						}else{
							Util._addRemoveClasses(node, allTRAnimClasses, ["propRowHidden"]);
						}
					}
				}
			
			// Else if browser does not support transitions (e.g., FF3.x)
			}else{
				hideAllButThisRow();
				fadeInCascade();
			}	
		},
		
		_initSection: function(sectionKey){
			var Util = this;
			var allTRAnimClasses = Util.showPropAnimClasses;
			var rootTD = Util._getRootTD();
			var propGroups = dojo.query(".propGroup",rootTD);

			var propGroupDIV;
			for(var i=0; i<propGroups.length; i++){
				var propGroup = propGroups[i];
				var name = dojo.attr(propGroup, "propGroup");
				if(name==sectionKey){
					dojo.removeClass(propGroup,"dijitHidden");
					propGroupDIV = propGroup;
				}else{
					dojo.addClass(propGroup,"dijitHidden");
				}
			}
			var pSects = dojo.query(".cssPropertySection",propGroupDIV);
			for(var i=0; i<pSects.length; i++){
				Util._addRemoveClasses(pSects[i],allTRAnimClasses,[]);
			}
			var cSects = dojo.query(".cssCascadeSection",propGroupDIV);
			for(var i=0; i<cSects.length; i++){
				dojo.addClass(cSects[i],"cascadeRowHidden");
			}
			Util._currentPropSection = sectionKey;
			dojo.removeClass(dojo.byId('davinci_app'),"showingCascade");
		},
		
		_hideSectionShowRoot: function(){
			var Util = this;
			var rootTD = Util._getRootTD();
			dojo.removeClass(rootTD,"dijitHidden");
		},
		
		// Search animSS (property palette's animation stylesheet) to find the style rule
		// with given the selectorText. Returns index for the rule.
		_findRule: function(selectorText){
			if(this.animSS && typeof this.animRuleIndex[selectorText] == 'number'){
				var idx = this.animRuleIndex[selectorText];
				if(this.animSS.cssRules[idx].selectorText == selectorText){
					return {ss:this.animSS, ruleIndex:idx};
				}
			}
			function searchRules(ss, selectorText){
				for(var ruleIndex=0; ruleIndex<ss.cssRules.length; ruleIndex++){
					var rule=ss.cssRules[ruleIndex];
					if(rule.type === 3){		// 3=@import
						var importSS = rule.styleSheet;
						var retObj = searchRules(importSS, selectorText);
						if(retObj){
							return retObj;
						}
					}else if(rule.selectorText == selectorText){
						return {ss:ss, ruleIndex:ruleIndex};
					}
				}
			}
			for(var i=0; i<document.styleSheets.length; i++){
				var ss=document.styleSheets[i];
				var returnObj = searchRules(ss, selectorText);
				if(returnObj){
					// Cache the results so hopefully we only have to search stylesheets once per session
					this.animSS = returnObj.ss;
					this.animRuleIndex[selectorText] = returnObj.ruleIndex;
					return returnObj;
				}
			}
			return null;
		},
		
		// Adds all classes in the classesToAdd array and removes any
		// classes from allClasses that aren't in classesToAdd
		_addRemoveClasses: function(elem, allClasses, classesToAdd){
			var classesToRemove=[];
			for(var i=0; i<allClasses.length; i++){
				var found=false;
				for(var j=0; j<classesToAdd.length; j++){
					if(allClasses[i]==classesToAdd[j]){
						found=true;
						break;
					}
				}
				if(!found){
					classesToRemove.push(allClasses[i]);
				}
			}
			for(var i=0; i<classesToRemove.length; i++){
				dojo.removeClass(elem,classesToRemove[i]);
			}
			for(var i=0; i<classesToAdd.length; i++){
				dojo.addClass(elem,classesToAdd[i]);
			}
		},
		
		// Look at refElem and ancestors for a particular tag and optionally a particular class
		_searchUpByTagClass: function(refElem, tagName, className){
			while(refElem != null && refElem.nodeName != "BODY"){
				if(refElem.nodeName == tagName && (!className || dojo.hasClass(refElem, className))){
					return refElem;
				}
				refElem = refElem.parentNode;
			}
			return null;
		},
		
		// Look at refElem and nextSiblings for a particular tag and optionally a particular class
		_searchSiblingsByTagClass: function(refElem, tagName, className){
			while(refElem != null){
				if(refElem.nodeName == tagName && (!className || dojo.hasClass(refElem, className))){
					return refElem;
				}
				refElem = refElem.nextSibling;
			}
			return null;
		},
		
		_getRootDetailsContainer: function(){
			var Util = this;
			if(!Util._rootDetailsContainer){
				Util._rootDetailsContainer=dojo.query(Util.animShowSectionClassSelector)[0];
			}
			return Util._rootDetailsContainer;
		},
		
		_getRootTD: function(){
			var Util = this;
			var rootDetailsContainer = Util._getRootDetailsContainer();
			if(!Util._rootTD){
				//FIXME: Make .propPaletteRoot into a var
				Util._rootTD=dojo.query(".propPaletteRoot", rootDetailsContainer)[0];
			}
			return Util._rootTD;
		}
	});
	return HTMLStringUtil;
});
