define([
        "dojo/_base/declare",
        "davinci/maqetta/States",
        "./commands/EventCommand",
        "./commands/StyleCommand"
], function(declare, maqettaStates, EventCommand, StyleCommand){

declare("davinci.ve.States", davinci.maqetta.States, {
	
	_update: function(node, newState, oldState) {
//console.trace();
		this.inherited(arguments);
		
		node = this._getWidgetNode(node);
		if (!node || !node._dvWidget){
			return;
		}
		var widget = node._dvWidget;
		var styleArray = this.getStyle(node, newState);
		var styleValuesAllStates = widget.getStyleValuesAllStates();
		var stateIndex;
		if(!newState || newState === 'Normal'){
			//FIXME: we are using 'undefined' as name of Normal state due to accidental programming
			stateIndex = 'undefined';
		}else{
			stateIndex = this._state;
		}
		if(styleValuesAllStates[stateIndex]){
			styleValuesAllStates[stateIndex] = StyleArray.mergeStyleArrays(styleValuesAllStates[stateIndex], styleArray);
		}else{
			styleValuesAllStates[stateIndex] = styleArray;
		}
		widget.setStyleValuesAllStates(styleValuesAllStates);
		this._refresh(widget);
		// Recompute styling properties in case we aren't in Normal state
		this.resetState(node);
/*
		if (this.isNormalState(newState)) {
			this._styleChange(node, styleArray);
		}
*/
	},
		
	_updateEvents: function(node, state, name) {
//console.trace();
		if(!node || !node._dvWidget){
			return;
		}
		var widget = node._dvWidget;
		var events = ["onclick", "onmouseover", "onmouseout", "onfocus", "onblur"];
		var properties;
		for(var i in events){
			var event = events[i];
			var value = widget && widget.properties && widget.properties[event];
			if (typeof value == "string" && value.indexOf("davinci.states.setState") >= 0) {
				var original = value;
				value = value.replace("'" + state + "'", "'" + name + "'");
				if (value !== original) {
					properties = properties || {};
					properties[event] = value;
				}
			}
		}
		
		var context = this.getContext();
		if (context) {
			var command = new EventCommand(widget, properties);
			context.getCommandStack().execute(command);
		}
	},
/*
	_styleChange: function (node, styleArray){
//console.trace();
		if(!node || !node._dvWidget){
			return;
		}
		var widget = node._dvWidget;
		var currentEditor = top.davinci.Runtime.currentEditor; //TODO: use require?
		var context = currentEditor.getContext();

		var command = new StyleCommand(widget, styleArray);	
		
		context.getCommandStack().execute(command);
	},
*/
	
	normalize: function(type, node, name, value) {
//console.trace();
        switch(type) {
		    case "style":
	            var state = davinci.ve.states.getState();
	            if (state) {
	                var normalValueArray = this.getStyle(node, undefined, name);
	                if (normalValueArray) {
		                for(var i=0; i<normalValueArray.length; i++){
		                	if(normalValueArray[i][name]){
		                		value = normalValueArray[i][name];
		                	}
		                }
	                }
	            }
	            break;
        }
        return value;
	},
	
	normalizeArray: function(type, node, name, valueArray) {
//console.trace();
		switch(type) {
		    case "style":
	            var state = davinci.ve.states.getState();
	            if (state) {
	                var normalValueArray = this.getStyle(node, undefined, name);
	                if (normalValueArray) {
	                	// Remove all entries from valueArray that are in normalValueArray
		                for(var i=0; i<normalValueArray.length; i++){
		                	var nItem = normalValueArray[i];
		                	for(var nProp in nItem){	// should be only one property 
		                		for(var j=valueArray.length-1; j>=0; j--){
		                			var vItem = valueArray[j];
		                			for(var vProp in vItem){	// should be only one property
		                				if(vProp == nProp){
		                					valueArray.splice(j, 1);
		                					break;
		                				}
		                			}
		                		}
		                	}
		                }
		                // Append values from normalValueArray
		                valueArray = valueArray.concat(normalValueArray);
	                }
	            }
	            break;
        }
        return valueArray;
	},
	
	getEditor: function() {
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
	},
	
	getContext: function() {
		var editor = this.getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	getDocument: function() {
		var context = this.getContext();
		return context && context.getDocument && context.getDocument();
	},
	_updateSrcState: function (node)
	{
//console.trace();
		var widget = (node && node._dvWidget);
		if (widget && widget._srcElement) {
			var str=this.serialize(node);
			if (str.trim()) {
				widget._srcElement.addAttribute(davinci.states.ATTRIBUTE,str);
			} else {
				widget._srcElement.removeAttribute(davinci.states.ATTRIBUTE);
			}
		}
	},

	_getWidgetNode: function(node) {
		if (!node) {
			var doc = this.getDocument();
			node = doc && doc.body;
		}
		return node;
	},
	

	initialize: function() {
	
		if (!this.subscribed) {
		
			this.subscribe("/davinci/states/state/changed", dojo.hitch(this, function(e) { 
//console.trace();
				var editor = this.getEditor();
				if (!dojo.isObject(e.node) || !editor || editor.declaredClass != "davinci.ve.PageEditor"){
					return;
				} // ignore if node is not an object (eg '$all') and ignore updates in theme editor

				dojo.publish("/davinci/states/state/changed/start");
				// If rootWidget, then loop through children, else loop starting with this widget.
				var widget = (e.node && e.node._dvWidget);
				var widget = (widget == this.getContext().rootWidget) ? widget : widget.getParent();
				var n = widget.domNode;

				var children = davinci.states._getChildrenOfNode(n);
				while (children.length) {
					var child = children.shift();
					if (!this.isContainer(child)) {
						children = children.concat(davinci.states._getChildrenOfNode(child));
					}
					this._update(child, e.newState, e.oldState);
				}
				dojo.publish("/davinci/states/state/changed/end");

				// Trigger update of the selection box in case the selected widget changed size or moved
				var context = this.getContext();
				if (context) {
					var selection = context.getSelection();
					if (selection && selection.length == 1) {
						context.updateFocus(selection[0]);
					} else if (selection && selection.length > 1) {
						console.warn("States::TODO: Handle multiple selection");
					}
				}
			}));
			
			this.subscribe("/davinci/states/state/renamed", dojo.hitch(this, function(e) { 
				var editor = this.getEditor();
				if (!editor || editor.declaredClass == "davinci.themeEditor.ThemeEditor") return; // ignore updates in theme editor
				var widget = (e.node && e.node._dvWidget);

				var children = davinci.states._getChildrenOfNode(e.node);
				while (children.length) {
					var child = children.shift();
					if (!this.isContainer(child)) {
						children = children.concat(davinci.states._getChildrenOfNode(child));
					}
					this.rename(child, e.oldName, e.newName, true);
					this._updateEvents(child, e.oldName, e.newName);
				}

				var state = this.getState();
				if (state === e.oldName) {
					this.setState(e.node, e.newName, false, true);
				}
			}));
			
			this.subscribe("/davinci/states/state/style/changed", dojo.hitch(this, function(e) { 
				var containerState = this.getState();
				if (containerState == e.state) {
					this._update(e.node, e.state, containerState);		
				}
			}));
			
			this.subscribe("/davinci/ui/widget/replaced", dojo.hitch(this, function(newWidget, oldWidget) { 
				var containerState = this.getState();
				if (containerState) {
					this._update(newWidget.domNode, containerState, undefined);		
				}
			}));
			
			this.subscribed = true;
		}
	}
});

//TODO: change to use singleton pattern for this module?
davinci.ve.states = new davinci.ve.States();
davinci.ve.states.initialize();

return davinci.ve.states;
});
