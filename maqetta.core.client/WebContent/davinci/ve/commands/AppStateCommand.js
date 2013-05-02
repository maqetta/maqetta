define([
    	"dojo/_base/declare",
    	"dojo/_base/lang",
    	"dojo/topic",
    	"davinci/XPathUtils",
    	"davinci/html/HtmlFileXPathAdapter",
    	"davinci/ve/States"
], function(declare, lang, topic, XPathUtils, HtmlFileXPathAdapter, States){


return declare("davinci.ve.commands.AppStateCommand", null, {
	name: "AppStateCommand",
	_actions:['add','remove','modify','reorder'],

	/**
	 * @param {object} params
	 *		params.action {string} add|delete|modify
	 *		params.state {string} name of custom state
	 *		params.stateContainerNode {Element} state container node
	 *		(the following parameters only apply to 'modify')
	 *		params.newState {string} New state name
	 *		params.initialState {undefined|"undefined"|{string}} Initial state for this state container
	 *				if undefined, don't change anything
	 *				if "undefined", set initial state to undefined state
	 *				if a string other than "undefined", set initial state to that state
	 *		(the following parameters only apply to 'reorder')
	 *		params.newStatesList [{string}] New order for the list of states on the StateContainer
	 */
	constructor: function(params){
		if(!params){
			return;
		}
		this._params = lang.mixin({}, params);
		var stateContainerNode = params.stateContainerNode;
		if(stateContainerNode && stateContainerNode._dvWidget){
			this._params.stateContainerId = stateContainerNode.id;
			this._params.stateContainerXpath = XPathUtils.getXPath(stateContainerNode._dvWidget._srcElement,
					HtmlFileXPathAdapter);
		}
		if(this._params.action == 'reorder'){
			// Verify that all parameters have been supplied properly
			stateContainerNode = this._getStateContainerNode();
			if(!stateContainerNode || !params.newStatesList.length){
				this._params = null;
			}else{
				this._oldStatesList = States.getStates(stateContainerNode);
				this._oldStatesList.shift();	// Remove "Normal" state
			}
		}
	},
	
	_validParams: function(){
		return (this._params &&
			this._actions.indexOf(this._params.action) >= 0) &&
			this._params.stateContainerNode && 
			this._params.stateContainerId && 
			this._params.stateContainerXpath && 
			this._params.context;
	},
	
	_getStateContainerNode: function(){
		var stateContainerNode;
		var context = this._params.context;
		if(!context){
			return stateContainerNode;
		}
		var userDoc = context.getDocument();
		if(!userDoc){
			return stateContainerNode;
		}
		var stateContainerId = this._params.stateContainerId;
		var stateContainerXpath = this._params.stateContainerXpath;
		var stateContainerNode = userDoc.getElementById(stateContainerId);
		if(!stateContainerNode){
			var element = context.model.evaluate(stateContainerXpath);
			if (element) {
				stateContainerNode = userDoc.getElementById(element.getAttribute('id'));
			}
		}
		return stateContainerNode;
	},
	
	execute: function(){
		if(!this._validParams()){
			return;
		}
		var action = this._params.action;
		var state = this._params.state;
		var stateContainerNode = this._getStateContainerNode();
		if(!stateContainerNode){
			return;
		}
		if(action == 'add'){
			// No need to worry about preserving maqDeltas information for undo for
			// add state command because AddState.js creates a giant CompoundCommand
			// which includes both the AppStateCommand({action:'add',...}) and all of the
			// appropriate StyleCommands.
			States.add(stateContainerNode, state);
			this._setStateAndFocus(stateContainerNode);
		}else if(action == 'remove'){
			// However, for removing a state, RemoveState.js simply creates
			// an AppStateCommand({action:'remove', ...}), and the States.remove()
			// call therein has a side-effect of removing any maqDeltas settings
			// corresponding to that particular state. To make undo work properly,
			// need to stash away all of the maqDeltas for all of the affected nodes
			// so they can be restored with an undo operation.
			this._stateIndex = stateContainerNode._maqAppStates && 
					stateContainerNode._maqAppStates.states && 
					stateContainerNode._maqAppStates.states.indexOf(state);
			this._preservedNodesId = [];
			this._preservedNodesXpath = [];
			this._preservedStateValues = [];
			this._preserveStateFromNodeRecursive(stateContainerNode, state);
			States.remove(stateContainerNode, state);
			this._setStateAndFocus(stateContainerNode);
		}else if(action == 'modify'){
			if(this._params.newState){
				this._traverseRenameState(this._params.state, this._params.newState);
				topic.publish("/davinci/states/state/renamed", 
						{node:stateContainerNode, oldName:this._params.state, newName:this._params.newState, stateContainerNode:stateContainerNode });
			}
			if(typeof this._params.initialState == 'string'){
				this._oldInitialState = States.getInitial(stateContainerNode);
				
				// Hacky approach. The string "undefined" says to set initial state to NORMAL/base state
				// which has the value undefined (not the string, but JavaScript undefined type).
				var initialState = (this._params.initialState == "undefined") ? undefined : this._params.initialState;
				if(this._params.newState && initialState == this._params.state){
					initialState = this._params.newState;
				}
				States.setState(initialState, stateContainerNode, 
						{initial:initialState, updateWhenCurrent:true});
			}
			this._setStateAndFocus(stateContainerNode);
		}else if(action == 'reorder'){
			if(stateContainerNode && stateContainerNode._maqAppStates && stateContainerNode._dvWidget){
				stateContainerNode._maqAppStates.states = this._params.newStatesList;
				var attrValue = States.stringifyWithQuotes(stateContainerNode._maqAppStates);
				stateContainerNode.setAttribute(States.APPSTATES_ATTRIBUTE, attrValue);
				srcElement = stateContainerNode._dvWidget._srcElement;
				srcElement.setAttribute(States.APPSTATES_ATTRIBUTE, attrValue);
				topic.publish("/davinci/states/statesReordered", [stateContainerNode, this._params.newStatesList]);
			}
		}
	},

	undo: function(){
		if(!this._validParams()){
			return;
		}
		var action = this._params.action;
		var state = this._params.state;
		var stateContainerNode = this._getStateContainerNode();
		if(!stateContainerNode){
			return;
		}
		if(action == 'add'){
			States.remove(stateContainerNode, state);
			this._setStateAndFocus(stateContainerNode);
		}else if(action == 'remove'){
			States.add(stateContainerNode, state, {index:this._stateIndex});
			this._restoreState(state);
			States.setState(state, stateContainerNode, {focus:true});
			this._setStateAndFocus(stateContainerNode);
		}else if(action == 'modify'){
			if(typeof this._params.initialState == 'string'){
				States.setState(this._oldInitialState, stateContainerNode, 
						{initial:this._oldInitialState, updateWhenCurrent:true});
			}
			if(this._params.newState){
				this._traverseRenameState(this._params.newState, this._params.state);
			}
			this._setStateAndFocus(stateContainerNode);
		}else if(action == 'reorder'){
			if(stateContainerNode && stateContainerNode._maqAppStates && stateContainerNode._dvWidget){
				stateContainerNode._maqAppStates.states = this._oldStatesList;
				var attrValue = States.stringifyWithQuotes(stateContainerNode._maqAppStates);
				stateContainerNode.setAttribute(States.APPSTATES_ATTRIBUTE, attrValue);
				srcElement = stateContainerNode._dvWidget._srcElement;
				srcElement.setAttribute(States.APPSTATES_ATTRIBUTE, attrValue);
				topic.publish("/davinci/states/statesReordered", [stateContainerNode, this._params.newStatesList]);
			}
		}
	},
	
	_setStateAndFocus: function(stateContainerNode){
		var currentState = States.getState(stateContainerNode);
		States.setState(currentState, stateContainerNode, 
				{focus:currentState, updateWhenCurrent:true});
	},
	
	_preserveStateFromNodeRecursive: function(node, state){
		var widget = node._dvWidget;
		if(!node || !widget || !state){
			return;
		}
		this._preserveStateFromNode(node, state);
		var children = widget.getChildren();
		for(var i=0; i<children.length; i++){
			this._preserveStateFromNodeRecursive(children[i].domNode, state);
		}
	},
		
	// Preserve all references to given "state" from given node
	// onto the "this" object
	_preserveStateFromNode: function(node, state){
		if(node && node._maqDeltas && node._maqDeltas[state] && node._dvWidget && node._dvWidget._srcElement){
			this._preservedNodesId.push(node.id);
			this._preservedNodesXpath.push(XPathUtils.getXPath(node._dvWidget._srcElement,
					HtmlFileXPathAdapter));
			this._preservedStateValues.push(lang.clone(node._maqDeltas[state]));
		}
	},
	
	_restoreState: function(state){
		var context = this._params.context;
		if(!context || !this._preservedNodesId){
			return;
		}
		var userDoc = context.getDocument();
		if(!userDoc){
			return;
		}
		for(var i=0; i<this._preservedNodesId.length; i++){
			var id = this._preservedNodesId[i];
			var xpath = this._preservedNodesXpath[i];
			var node = userDoc.getElementById(id);
			if(!node){
				var element = context.model.evaluate(xpath);
				if (element) {
					node = userDoc.getElementById(element.getAttribute('id'));
				}
			}
			if(node){
				if(!node._maqDeltas){
					node._maqDeltas = {};
				}
				node._maqDeltas[state] = lang.clone(this._preservedStateValues[i]);
				States._updateSrcState(node);
			}
		}
	},
	
	_traverseRenameState: function(oldName, newName){
		var stateContainerNode = this._getStateContainerNode();
		if(!stateContainerNode){
			return;
		}
		States.rename(stateContainerNode, {oldName:oldName, newName:newName});
		var containerSrcElement = stateContainerNode._dvWidget && stateContainerNode._dvWidget._srcElement;
		if(containerSrcElement){
			var currentElement = null;
			var anyAttributeChanges = false;
			var value_regex = /^(.*davinci.states.setState\s*\(\s*)('[^']*'|"[^"]*")([^\)]*\).*)$/;
			var quoted_state_regex = /^(['"])(.*)(['"])$/;
			containerSrcElement.visit({ visit: dojo.hitch(this, function(node) {
				if (node.elementType == "HTMLElement") {
					currentElement = node;
				}else if (node.elementType == "HTMLAttribute") {
					var attrName = node.name;
					if(attrName && attrName.substr(0,2).toLowerCase() == 'on'){
						var value = node.value;
						var outerMatches = value.match(value_regex);
						if(outerMatches){
							// If here, the event attribute appears to have davinci.states.setState(blah) inside
							var innerMatches = outerMatches[2].match(quoted_state_regex);
							if(innerMatches){
								// If here, then innerMatches[2] contains the set state value
								if(innerMatches[2] == oldName){
									// If here, we need to replace the state name
									var newValue = outerMatches[1] + innerMatches[1] + newName + innerMatches[3] + outerMatches[3];
									currentElement.setAttribute(attrName, newValue);
									anyAttributeChanges = true;
								}
							}
						}
					}
				}
			})});
			if(anyAttributeChanges){
				var editor = (this._params && this._params.context && this._params.context.editor);
				if(editor){
					editor._visualChanged();
				}
			}
		}
	}
});
});