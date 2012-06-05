define([
        "dojo/_base/declare",
        "dojo/_base/connect",
        "davinci/maqetta/AppStates",
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
		var existingStatesAttr = widget._srcElement.getAttribute(davinci.states.ATTRIBUTE);
		if (widget && widget._srcElement) {
			var str=this.serialize(node);
			if (str.trim()) {
				widget._srcElement.addAttribute(davinci.states.ATTRIBUTE,str);
			} else {
				widget._srcElement.removeAttribute(davinci.states.ATTRIBUTE);
			}
			var newStatesAttr = widget._srcElement.getAttribute(davinci.states.ATTRIBUTE);
			if(existingStatesAttr !== newStatesAttr){
				var editor = this.getEditor();
				if(editor){
					editor._visualChanged();	// Tell app that source view needs updating
				}			
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
	
	// Application "state" has been removed from the document
	// Recursively remove all references to that state from given node and descendants
	_removeStateFromNodeRecursive: function(node, state){
		var widget = node._dvWidget;
		if(!node || !widget || !state){
			return;
		}
		this._removeStateFromNode(node, state);
		var children = widget.getChildren();
		for(var i=0; i<children.length; i++){
			this._removeStateFromNodeRecursive(children[i].domNode, state);
		}
	},
	
	// Remove all references to given "state" from given node
	_removeStateFromNode: function(node, state){
		if(node && node.states && node.states[state]){
			delete node.states[state];
			this._updateSrcState(node);
		}
	},
	
	// Remove any application states information that are defined on particular widgets
	// for all states that aren't in the master list of application states.
	// (This is to clean up after bugs found in older releases)
	removeUnusedStatesRecursive: function(node, activeStates){
		var widget = node._dvWidget;
		if(!node || !widget){
			return;
		}
		// Special-case BODY - it holds the master list of states. Don't try to clean up its list.
		// Assume that is being done by higher-level software.
		if(node.tagName !== 'BODY'){
			this._removeUnusedStates(node, activeStates);
		}
		var children = widget.getChildren();
		for(var i=0; i<children.length; i++){
			this.removeUnusedStatesRecursive(children[i].domNode, activeStates);
		}
	},
	
	// Remove all references to unused states from given node
	_removeUnusedStates: function(node, activeStates){
		if(node && node.states){
			for(var state in node.states){
				if(state !== 'undefined' && activeStates.indexOf(state) < 0){
					delete node.states[state];
					this._updateSrcState(node);
				}
			}
		}
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
			
			connect.subscribe("/davinci/states/state/removed", dojo.hitch(this, function(params) {
				// Application "state" has been removed from the document
				// Recursively remove all references to that state from given node and descendants
				if(!params){
					return;
				}
				this._removeStateFromNodeRecursive(params.node, params.state);
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
