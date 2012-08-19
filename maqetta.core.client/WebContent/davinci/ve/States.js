define([
        "dojo/_base/declare",
        "dojo/_base/connect",
        "davinci/Runtime",
        "davinci/maqetta/AppStates",
        "./commands/EventCommand",
        "./commands/StyleCommand",
    	"davinci/ve/utils/StyleArray"
], function(declare, connect, Runtime, maqettaStates, EventCommand, StyleCommand, StyleArray){

var veStates = declare(maqettaStates, {
	
	/**
	 * Updates CSS properties for the given node due to a transition
	 * from application state (from an old state to a new state).
	 * Called indirectly when the current state changes (via a setState call)
	 * from code that listens to event /maqetta/appstates/state/changed
	 * @param {Element} node
	 * @param {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 */
	_update: function(node, statesArray) {
		if(!Runtime.currentEditor || Runtime.currentEditor.declaredClass != "davinci.ve.PageEditor"){
			return;
		}
		if (!node || !node._dvWidget || (!node._maqAppStates && node._maqDeltas)){
			return;
		}
		var widget = node._dvWidget;
		this._refresh(widget);
//FIXME: Generalize beyond BODY?
		//var body = node.ownerDocument.body;
		//var currentState = this.getState(body);
		//if(!this.isNormalState(currentState)){
//FIXME: Is this really necessary? Shouldn't we be calling setState only on state containers?
			//this.setState(currentState, node, {updateWhenCurrent:true, silent:true});
		//}		
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
//FIXME: What's this doing? Why this particular set of events?
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
				var currentStatesList = this.getStatesListCurrent(node);
				for(var i=0; i<currentStatesList.length; i++){
					currentStatesList[i] = 'Normal';
				}
				var normalValueArray = this.getStyle(node, currentStatesList, name);
				if (normalValueArray) {
					for(var i=0; i<normalValueArray.length; i++){
						if(normalValueArray[i][name]){
							value = normalValueArray[i][name];
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
				var currentStatesList = this.getStatesListCurrent(node);
				for(var i=0; i<currentStatesList.length; i++){
					currentStatesList[i] = 'Normal';
				}
				var normalValueArray = this.getStyle(node, currentStatesList, name);
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
	
	/**
	 * Force a call to setState so that styling properties get reset for the given node
	 * based on the current application state.
	 */
	resetState: function(node){
		if(!node){
			return;
		}
		var stateContainers = this.getStateContainersForNode(node);
		var focusState = this.getFocus(node.ownerDocument.body);
		for(var i=0; i<stateContainers.length; i++){
			var stateContainerNode = stateContainers[i];
			var currentState = this.getState(stateContainerNode);
			var focus = (focusState && stateContainerNode == focusState.stateContainerNode && currentState == focusState.state);
			this.setState(currentState, stateContainerNode, { focus:focus, updateWhenCurrent:true, silent:true });	
		}
	},
	
	_updateSrcState: function (node){
		var widget = (node && node._dvWidget);
		if(!widget){
			return;
		}
		var existingDefsAttr = widget._srcElement.getAttribute(davinci.states.APPSTATES_ATTRIBUTE);
		var existingDeltasAttr = widget._srcElement.getAttribute(davinci.states.DELTAS_ATTRIBUTE);
		if (widget && widget._srcElement) {
			var obj=this.serialize(node);
			if(obj.maqAppStates){	// _maqAppStates properties was present
				obj.maqAppStates.trim();
			}
			if(obj.maqAppStates){
				widget._srcElement.addAttribute(davinci.states.APPSTATES_ATTRIBUTE, obj.maqAppStates);
			}else{
				widget._srcElement.removeAttribute(davinci.states.APPSTATES_ATTRIBUTE);
			}
			if(obj.maqDeltas){	// _maqDeltas properties was present
				obj.maqDeltas.trim();
			}
			if(obj.maqDeltas){
				widget._srcElement.addAttribute(davinci.states.DELTAS_ATTRIBUTE, obj.maqDeltas);
			}else{
				widget._srcElement.removeAttribute(davinci.states.DELTAS_ATTRIBUTE);
			}
			var newDefsAttr = widget._srcElement.getAttribute(davinci.states.APPSTATES_ATTRIBUTE);
			var newDeltasAttr = widget._srcElement.getAttribute(davinci.states.DELTAS_ATTRIBUTE);
			if(existingDefsAttr !== newDefsAttr || existingDeltasAttr !== newDeltasAttr){
				var editor = this.getEditor();
				if(editor && editor._visualChanged){
					editor._visualChanged();	// Tell app that source view needs updating
				}			
			}
		}

	},
	
//FIXME: Need to deal with recursive state containers
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
		if(node && node._maqDeltas && node._maqDeltas[state]){
			delete node._maqDeltas[state];
			var hasAnyProperties = false;
			for (var prop in node._maqDeltas) {
				if(prop !== 'undefined'){
					hasAnyProperties = true;
					break;
				}
			}
			if (!hasAnyProperties){
				delete node._maqDeltas;
			}
			this._updateSrcState(node);
		}
	},

	// Remove any application states information that are defined on particular widgets
	// for all states that aren't in the master list of application states.
	// (This is to clean up after bugs found in older releases)
	removeUnusedStates: function(context){
		if(!context){
			return;
		}
		var allWidgets = context.getAllWidgets();
		for(var i=0; i<allWidgets.length; i++){
			var node = allWidgets[i].domNode;
			if(node.tagName !== 'BODY'){
				if(node && node._maqDeltas){
					var allStatesForNode = this.getAllStatesForNode(node);
					for(var state in node._maqDeltas){
						if(state !== 'undefined' && allStatesForNode.indexOf(state) < 0){
							this._removeStateFromNode(node, state);
						}
					}
				}
			}
		}
	},

	/**
	 * Returns array index into states object for given state
	 * Mostly used so that a null or undefined or 'Normal' state will get converted to string 'undefined'
	 * to compensate for screwy way that States.js is currently implemented
	 * @param {string|null|undefined} state  Current state
	 * @returns {string}  Returns either original state string or 'undefined'
	 */
	_getStateIndex:function(state){
		var stateIndex;
		if(!state || state == 'Normal' || state == 'undefined'){
			//FIXME: we are using 'undefined' as name of Normal state due to accidental programming
			stateIndex = 'undefined';
		}else{
			stateIndex = state;
		}
		return stateIndex;
	},

	getCurrentStateIndex:function(){
//FIXME: getState(node)
		return this._getStateIndex(this.getState());
	},

	getApplyToStateIndex:function(applyToWhichStates){
		var currentState = this.getState();
		var state;
		if(applyToWhichStates === "current" && currentState && currentState != 'Normal' && currentState != 'undefined'){
			state = currentState;
		}else{
			state = undefined;
		}
		return this._getStateIndex(state);
	},
	
	/**
	 * Checks to see if any of the properties listed in proplist are defined
	 * in any of the currently active states for the given node
	 * @param {Element} node
	 * @param {Array[string]} proplist
	 * @returns {undefined|string}  Return either nothing if search is empty, or name of first state encountered
	 */
	propertyDefinedForAnyCurrentState: function(node, proplist){
		var whichState;
		var maqDeltas = node._maqDeltas;
		if(maqDeltas){
			var stateContainers = this.getStateContainersForNode(node);
			outer_loop:
			for(var i=stateContainers.length-1; i>=0; i--){
				var stateContainer = stateContainers[i];
				var currentState = this.getState(stateContainer);
				var stateIndex = (!currentState || currentState == this.NORMAL) ? 'undefined' : currentState;
				var stateStyles = maqDeltas[stateIndex] && maqDeltas[stateIndex].style;
				if(stateStyles){
					for(var s=0; s<stateStyles.length; s++){
						var o = stateStyles[s];
						for(var j=0; j<proplist.length; j++){
							if(o.hasOwnProperty(proplist[j])){
								whichState = currentState;
								break outer_loop;
							}
						}
					}
				}
			}
		}
		return whichState;
	},

	initialize: function() {
	
		if (!this.subscribed) {
		
			connect.subscribe("/maqetta/appstates/state/changed", dojo.hitch(this, function(e) { 
				var editor = this.getEditor();
				if (!dojo.isObject(e.node) || !editor || editor.declaredClass != "davinci.ve.PageEditor"){
					return;
				} // ignore if node is not an object (eg '$all') and ignore updates in theme editor

				dojo.publish("/maqetta/appstates/state/changed/start", [e]);
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
					var statesArray = this.getStatesArray(child, e.oldState, e.newState, e.stateContainerNode);
					this._update(child, statesArray);
				}
				dojo.publish("/maqetta/appstates/state/changed/end", [e]);

				// Trigger update of the selection box in case the selected widget changed size or moved
				var context = this.getContext();
				if (context) {
					context.clearCachedWidgetBounds();
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
				var state = this.getState(e.stateContainerNode);
				if (state === e.oldName) {
					this.setState(e.newName, e.stateContainerNode, {updateWhenCurrent:false, silent:true});
				}
			}));
			
			connect.subscribe("/davinci/states/state/style/changed", dojo.hitch(this, function(e) { 
//FIXME: getState(node)
//FIXME: what's the difference between e.state and containerState?
				var containerState = this.getState();
				if (containerState == e.state) {
					var stateContainerNode = this.findStateContainer(e.node, e.state);
					var statesArray = this.getStatesArray(e.node, e.state, e.state, stateContainerNode);
					this._update(e.node, statesArray);
				}
			}));
			
			connect.subscribe("/davinci/ui/widget/replaced", dojo.hitch(this, function(newWidget, oldWidget) { 
//FIXME: getState(node)
				var containerState = this.getState();
				if (containerState) {
					var stateContainerNode = this.findStateContainer(newWidget.domNode, containerState);
					var statesArray = this.getStatesArray(newWidget.domNode, containerState, containerState, stateContainerNode);
					this._update(newWidget.domNode, statesArray);
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
