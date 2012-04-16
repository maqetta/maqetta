define([
        "dojo/_base/declare",
        "dojo/_base/connect",
        "davinci/maqetta/States",
        "./commands/EventCommand",
        "./commands/StyleCommand",
    	"davinci/ve/utils/StyleArray"
], function(declare, connect, maqettaStates, EventCommand, StyleCommand, StyleArray){

var veStates = declare(maqettaStates, {
	
	_update: function(node, oldState, newState) {		
		node = this._getWidgetNode(node);
		if (!node || !node._dvWidget || !node.states){
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
			stateIndex = newState;
		}
		if(styleValuesAllStates[stateIndex]){
			styleValuesAllStates[stateIndex] = StyleArray.mergeStyleArrays(styleValuesAllStates[stateIndex], styleArray);
		}else{
			styleValuesAllStates[stateIndex] = styleArray;
		}
		widget.setStyleValuesAllStates(styleValuesAllStates);
		this._refresh(widget);
		var body = node.ownerDocument.body;
		var currentState = this.getState(body);
		if(!this.isNormalState(currentState)){
			this.setState(node, currentState, true/*updateWhenCurrent*/, true /*silent*/);
		}		
	},
	
	_refresh: function(widget){
		/* if the widget is a child of a dijiContainer widget 
		 * we may need to refresh the parent to make it all look correct in page editor
		 * */ 
		var parent = widget.getParent();
		if (parent.dijitWidget){
			this._refresh(parent);
		} else if (widget && widget.resize){
			widget.resize();
		}
	},
		
	_updateEvents: function(node, state, name) {
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
	
	normalize: function(type, node, name, value) {
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
		var newValueArray = dojo.clone(valueArray);
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
		                		for(var j=newValueArray.length-1; j>=0; j--){
		                			var vItem = newValueArray[j];
		                			for(var vProp in vItem){	// should be only one property
		                				if(vProp == nProp){
		                					newValueArray.splice(j, 1);
		                					break;
		                				}
		                			}
		                		}
		                	}
		                }
		                // Append values from normalValueArray
		                newValueArray = newValueArray.concat(normalValueArray);
	                }
	            }
	            break;
        }
        return newValueArray;
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
		
			connect.subscribe("/davinci/states/state/changed", dojo.hitch(this, function(e) { 
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
					this._update(child, e.newState);
				}
				dojo.publish("/davinci/states/state/changed/end");

				// Trigger update of the selection box in case the selected widget changed size or moved
				var context = this.getContext();
				if (context) {
					context.updateFocusAll();
				}
			}));
			
			connect.subscribe("/davinci/states/state/renamed", dojo.hitch(this, function(e) { 
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
			
			connect.subscribe("/davinci/states/state/style/changed", dojo.hitch(this, function(e) { 
				var containerState = this.getState();
				if (containerState == e.state) {
					this._update(e.node, e.state, containerState);		
				}
			}));
			
			connect.subscribe("/davinci/ui/widget/replaced", dojo.hitch(this, function(newWidget, oldWidget) { 
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
davinci.ve.states = new veStates();
davinci.ve.states.initialize();

return davinci.ve.states;
});
