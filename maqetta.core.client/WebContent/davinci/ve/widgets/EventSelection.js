define(["dojo/_base/declare",
		"dojo/_base/connect",
		"dojo/dom-class",
		'system/resource',
		'davinci/Runtime',
		'davinci/Workbench',
		'davinci/model/Path',
		'../../workbench/Preferences',
		"../../workbench/ViewLite",
		"../commands/EventCommand",
		"./HTMLStringUtil",
		"../States"
],function(declare, connect, domClass, Resource, Runtime, Workbench, Path, Preferences, ViewLite, EventCommand, HTMLStringUtil, States){

var StateColonString = 'State:';
var StatePatternDisplay=new RegExp('^'+StateColonString+'.*');
var SetStateString = 'davinci.states.setState';
var StatePatternSource=/^\s*davinci\.states\.setState\s*\(\s*([\'"])((?:(?!\1).)*)\1\s*\)\s*$/;

var FileColonString = 'File:';
var FilePatternDisplay=new RegExp('^'+FileColonString+'.*');
var LocationHrefString = 'location.href';
var FilePatternSource=/^\s*location\.href\s*\=\s*([\'"])((?:(?!\1).)*)\1\s*$/;

var getEventSelectionValues = function(root){
	var items = [""],
		states = [],
		stateContainers = root && States.getAllStateContainers(root);

	if(stateContainers){
		states = stateContainers.reduce(function(statesList, container){
			return statesList.concat(States.getStates(container));
		}, []);
	}
	for(var i=0; i<states.length; i++){
		var state = states[i];
		var stateDisplayName = state == 'Normal' ? 'Background' : state;
		var val = StateColonString + stateDisplayName;
		if(items.indexOf(val) < 0){
			items.push(val);
		}
	}
	
	var base = Workbench.getProject();
	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
	if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
		var fullPath = new Path(base).append(prefs.webContentFolder);
		base = fullPath.toString();
	}
	var folder = Resource.findResource(base);
	var samplesPath = new Path(base).append('samples');
	var samplesFolder = Resource.findResource(samplesPath.toString());
	var themePath = new Path(base).append(prefs.themeFolder);
	var themeFolder = Resource.findResource(themePath.toString());
	var customWidgetPath = new Path(base).append(prefs.widgetFolder);
	var customWidgetFolder = Resource.findResource(customWidgetPath.toString());
	var htmlFiles = [];
	function recurseFindHtmlFiles(folder){
		folder.getChildren(function(children){	// onComplete
			for(var i=0; i<children.length; i++){
				var child = children[i];
				if(child.elementType == 'Folder'){
					if(!child._readOnly && child != samplesFolder && child != themeFolder && child != customWidgetFolder){
						recurseFindHtmlFiles(child);
					}
				} else if(/^html?$/i.test(child.extension)) {
					htmlFiles.push(child);
				}
			}
		}.bind(htmlFiles), function(a, b){	// onError
			console.error('EventSelection.js: folder.getChildren error');
		});
	}
	recurseFindHtmlFiles(folder);
	var basePathString = folder.getPath().toString()+'/';
	for(var i=0; i<htmlFiles.length; i++){
		var htmlFile = htmlFiles[i];
		var htmlFilePath = htmlFile.getPath().toString();
		if(htmlFilePath.indexOf(basePathString) == 0){
			htmlFilePath = htmlFilePath.substr(basePathString.length);
		}
		var val = FileColonString + htmlFilePath;
		if(items.indexOf(val) < 0){
			items.push(val);
		}
	}
	
	return items;
};

var getEventScriptFromValue = function(value) {
	if (value && value.match(StatePatternDisplay)) {
		var state = value.substring(StateColonString.length);
		var stateRuntimeValue = state == 'Background' ? 'Normal' : state;
		value = SetStateString + "('" + stateRuntimeValue + "')";
	}
	if (value && value.match(FilePatternDisplay)) {
		value = LocationHrefString + "=\'" + value.substring(FileColonString.length) + "\'";
	}
	
	return value;
};

var getValueFromEventScript = function(value) {
	var match;
	if(value){
		match = value.match(StatePatternSource);
		if(match){
			var state = match[2];
			value = StateColonString + state;
		}
		match = value.match(FilePatternSource);
		if(match){
			var filename = match[2];
			value = FileColonString + filename;
		}
	}
	return value;
};
	
var EventSelection = declare("davinci.ve.widgets.EventSelection", [ViewLite], {

		pageTemplate: [{display:"onclick", target:"onclick",type:"state", hideCascade:true},
			{display:"ondblclick",target:"ondblclick",type:"state", hideCascade:true},
			{display:"onmousedown",target:"onmousedown",type:"state", hideCascade:true},
			{display:"onmouseup",target:"onmouseup",type:"state", hideCascade:true},
			{display:"onmouseover",target:"onmouseover",type:"state", hideCascade:true},
			{display:"onmousemove",target:"onmousemove",type:"state", hideCascade:true},
			{display:"onmouseout",target:"onmouseout", type:"state",hideCascade:true},
			{display:"onkeypress",target:"onkeypress",type:"state", hideCascade:true},
			{display:"onkeydown",target:"onkeydown", type:"state", hideCascade:true},
			{display:"onkeyup",  target:"onkeyup",type:"state", hideCascade:true},
			{display:"onfocus",  target:"onfocus",type:"state", hideCascade:true},
			{display:"onblur",  target:"onblur",type:"state", hideCascade:true},
			{display:"onchange",  target:"onchange",type:"state", hideCascade:true}],

		buildRendering : function(){
			this.domNode =  dojo.doc.createElement("div");
			this.domNode.innerHTML = HTMLStringUtil.generateTable(this.pageTemplate, {zeroSpaceForIncrDecr:true});
			domClass.add(this.domNode, 'EventSelection');
			this.inherited(arguments);
		},
		setReadOnly : function(isReadOnly){
			for(var i = 0;i<this.pageTemplate.length;i++){
				var widget = this.pageTemplate[i].widget;
				if(widget)
					widget.set("readOnly", isReadOnly);
				else{
					var node = this.pageTemplate[i].domNode;
					if(node)
						dojo.attr(node, "disabled", isReadOnly);
				}
			}
		},
		startup : function(){
			this.inherited(arguments);
			function makeOnChange(target){
				return function(){
					return this._onChange({target:target});
				};
			}
			
			for(var i=0;i<this.pageTemplate.length;i++){
				var box = dijit.byId(this.pageTemplate[i].id);
				this.pageTemplate[i].widget = box;
				connect.connect(box, "onChange", this, makeOnChange(i));
			}
			this._buildSelectionValues();
			//FIXME: unsubscribe? leak?
			connect.subscribe("/davinci/ui/context/loaded", dojo.hitch(this, this._buildSelectionValues));
			connect.subscribe("/davinci/states/stored", dojo.hitch(this, this._buildSelectionValues));
			connect.subscribe("/davinci/states/state/added", dojo.hitch(this, this._buildSelectionValues));
			connect.subscribe("/davinci/states/state/removed", dojo.hitch(this, this._updateValues));
			connect.subscribe("/davinci/states/state/renamed", dojo.hitch(this, this._updateValues));
			connect.subscribe("/davinci/ui/widgetPropertiesChanged", dojo.hitch(this, this._widgetPropertiesChanged));
			this.setReadOnly(true);
		},

		onEditorSelected : function(){
			if(!this._editor || !this._editor.supports("states")) {
				delete this._editor;
			}
			this._buildSelectionValues();
		 },	

		 _onChange : function(a){
			var index = a.target;
			var widget = dijit.byId(this.pageTemplate[index].id);
			var	value = widget.get('value');
			
			value = getEventScriptFromValue(value);
			var properties = {};
			
			properties[this.pageTemplate[index].target] = value;
			
			var command = new EventCommand(this._widget, properties);
			dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
	 		
		},
		_getRoot: function() {
			var currentEditor = this._editor, root;
			if (currentEditor && currentEditor.getContext) {
				var context = currentEditor.getContext();
				root = context && context.rootNode;
			}
			return root;
		},
	
		_updateValues: function(e) {
			if(!e || !e.node || !e.node._dvWidget){
				return;
			}
			var context = e.node._dvWidget.getContext();
			var editor = (context && context.editor);
			if(!editor || editor != Runtime.currentEditor){
				return;
			}
			this._buildSelectionValues();
			if(this._widget){
				this._setValues();
			}
		},

		onWidgetSelectionChange : function(){
			if(!this._widget){
				this.setReadOnly(true);
				this._clearValues();
				return;
			}else{
				this._setValues();
				this.setReadOnly(false);
			}
		},
		_clearValues : function(){
			for(var i = 0;i<this.pageTemplate.length;i++){
				var box = dijit.byId(this.pageTemplate[i].id);
				box.set("value","", false );
			}
		},
		
		_buildSelectionValues : function(){
			var root = this._getRoot();
			var items = getEventSelectionValues(root);
			
			for(var i=0;i<this.pageTemplate.length;i++){
				var box = dijit.byId(this.pageTemplate[i].id);
				box.store.clearValues();
				box.store.setValues(items);
			}
		},

		_setValues: function() {
			for(var i=0;i<this.pageTemplate.length;i++){
				var name = this.pageTemplate[i].target;
				var widget = this._widget;
				var	value = "";
		
				if (widget.properties && widget.properties[name]) {
					value = widget.properties[name];
				}else {
					/* check the model for the events value */
					value = widget._srcElement.getAttribute(name);
				}
				value = getValueFromEventScript(value);
				var box = dijit.byId(this.pageTemplate[i].id);
				if(box){
					box.set('value', value, false);
				}
			}
		},

		_widgetPropertiesChanged: function(data) {
		  // data is array of widgets
		  this._updateValues({widget: data[0]});
		}
	});

//Make helpers available as "static" functions
EventSelection.getEventSelectionValues = getEventSelectionValues;
EventSelection.getEventScriptFromValue = getEventScriptFromValue;
EventSelection.getValueFromEventScript = getValueFromEventScript;

return EventSelection;

});