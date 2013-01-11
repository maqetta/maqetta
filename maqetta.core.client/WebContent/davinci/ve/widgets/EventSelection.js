define(["dojo/_base/declare",
		"dojo/_base/connect",
		"../../workbench/ViewLite",
		"./HTMLStringUtil",
		"davinci/ve/States",
        "../commands/ModifyCommand"
],function(declare, connect, ViewLite, HTMLStringUtil, States, ModifyCommand){

var getEventSelectionValues = function(root){
	var states = [];
	var stateContainers = root && States.getAllStateContainers(root);
	if(stateContainers){
		for(var j=0; j<stateContainers.length; j++){
			var statesList = States.getStates(stateContainers[j]);
			states = states.concat(statesList);
		}
	}
	var items = [""];

	for(var i=0; i<states.length; i++){
		var val = "State:" + states[i];
		if(items.indexOf(val) < 0){
			items.push(val);
		}
	}
	return items;
};

var getEventScriptFromValue = function(value) {
	value.replace(/'/,"\\'");
	value.replace(/"/,'\\"');
	
	var stateString = 'State:';
	if (value && value.match(/^State:.*/)) {
		value = "davinci.states.setState('" + value.substring(stateString.length) + "')";
	}
	
	return value;
};

var getValueFromEventScript = function(value) {
	if (value && value.match(/^davinci.states.setState\('.*'\)$/)) {
		var state = value.substring("davinci.states.setState('".length, value.length - 2); //FIXME: use regexp match
		value = "State:" + state;
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
			{display:"onblur",  target:"onblur",type:"state", hideCascade:true}],

		buildRendering : function(){
			this.domNode =  dojo.doc.createElement("div");
			this.domNode.innerHTML = HTMLStringUtil.generateTable(this.pageTemplate, {zeroSpaceForIncrDecr:true});
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
			
			var command = new davinci.ve.commands.EventCommand(this._widget, properties);
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
			var widget = e.node._dvWidget;
			this._buildSelectionValues();
			if (widget == this._widget) {
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