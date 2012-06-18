define(["dojo/_base/connect", "dojo/dom-style", "dojo/dom", "dojo/_base/html", "dojo/_base/window", "require"], 
function(connect, domStyle, dom, dhtml, dwindow, require){

var States = function(){};
States.prototype = {

	NORMAL: "Normal",
	DELTAS_ATTRIBUTE: "data-maq-deltas",
	DELTAS_ATTRIBUTE_P6: "dvStates",	// Attribute name used in Preview6 or earlier
	DEFS_ATTRIBUTE: "data-maq-appstates",
	DEFS_ATTRIBUTE_P6: "dvStates",	// Attribute name used in Preview6 or earlier

	/**
	 * Traverses all document nodes starting with rootnode, looking for
	 * all nodes that are state containers (due to having a states.states property),
	 * and returning a data structure that lists all state containers. See below
	 * for details about the returned data structure..
	 * @param rootnode
	 * @returns {Array} allStateContainers
	 *    List of all application state containers in the document that reflects
	 *    nesting in case some state containers are descendants of other state containers.
	 *    For example, if BODY defines 2 states "aa" and "bb", and then a inner DIV
	 *    defines two states "cc" and "dd", and then there is a SPAN that is a descendant of that DIV
	 *    that defines two states "ee" and "ff", the returned structure will look like this:
	 *        [{stateContainerNode:BODY,children:
	 *            [{stateContainerNode:DIV,children:
	 *                [{stateContainerNode:SPAN,children:[]}]
	 *            }]
	 *        }]
	 */
	getAllStateContainers: function(rootnode){
		var allStateContainers = [];
		function findStateContainers(currentNode, stateContainersArray){
			var childrenStateContainersArray = stateContainersArray;
//FIXME: This is what we want ultimately
//			if(currentNode.states && currentNode.states.states){
			if(currentNode.tagName == 'BODY'){
				var o = {stateContainerNode:currentNode, children:[]};
				stateContainersArray.push(o);
				childrenStateContainersArray = o.children;
			}
			for(var i=0; i<currentNode.children.length; i++){
				findStateContainers(currentNode.children[i], childrenStateContainersArray);
			}
		}
		findStateContainers(rootnode, allStateContainers);
		return allStateContainers;
	},
	
	/**
	 * Returns a statesArray data structure for the given node
	 * @param {Element} node  An element node in the document
	 * @param {string|undefined} oldState  The state which used to be active
	 * @param {string|undefined} newState  The state which has now become active
	 * @param {Element} statesContainerNode  The (state container) element on which oldState and newState are defined
	 * @returns {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 */ 
	getStatesArray: function(node, oldState, newState, statesContainerNode){
		var statesArray = [];
		if(node){
			var pn = node.parentNode;
			while(pn){
				if(pn._maqstates && pn._maqstates.states){
					
					if(pn == statesContainerNode){
						statesArray.splice(0, 0, {node:pn, oldState:oldState, newState:newState});
					}else{
						var current = pn._maqstates.states.current;
						statesArray.splice(0, 0, {node:pn, oldState:current, newState:current});
					}
				}
/*FIXME: Code below matches P6 states data structures
				if(pn.states){
					if(pn == statesContainerNode){
						statesArray.splice(0, 0, {node:pn, oldState:oldState, newState:newState});
					}else{
						var current = pn.states.current;
						statesArray.splice(0, 0, {node:pn, oldState:current, newState:current});
					}
				}
*/
				if(pn.tagName == 'BODY'){
					break;
				}
				pn = pn.parentNode;
			}
		}
		return statesArray;
	},

	/**
	 * Returns the nearest ancestor node that defines the given state.
	 * @param {Element} node  An element node in the document
	 * @param {string} state  The name of a state
	 * @returns {Element|undefined}  state container node (or undefined if not found)
	 */ 
	findStateContainer: function(node, state){
		if(node){
			var pn = node.parentNode;
			while(pn){
				if(pn._maqstates && pn._maqstates.states && (!state || state == this.NORMAL || pn._maqstates.states.indexOf(state)>=0)){
					return pn;
				}
				if(pn.tagName == 'BODY'){
					break;
				}
				pn = pn.parentNode;
			}
		}
	},

	/**
	 * Returns the array of application states that are currently active on the given node.
	 * If app states are only defined on BODY, then the return array will only have 1 item.
	 * If nested app state containers, then the returned array will have multiple items,
	 * with the furthest ancestor state container at position 0 and nearest at position length-1.
	 * @param {Element} node  An element node in the document
	 * @returns {[string|undefined]}  An array of strings, where each entry is either undefined
	 *           (indicating Normal state) or a state name.
	 */ 
	getStatesListCurrent: function(node){
		var statesList = [];
		if(node){
			var pn = node.parentNode;
			while(pn){
				if(pn._maqstates && pn._maqstates.states){
					statesList.splice(0, 0, pn._maqstates.current);
				}
				if(pn.tagName == 'BODY'){
					break;
				}
				pn = pn.parentNode;
			}
		}
		return statesList;
	},

	/**
	 * Returns the array of application states declared on the given node.
	 * At this point, only the BODY node can have application states declared on it.
	 * In future, maybe application states will include a recursive feature.
	 * @param {Element} node  BODY node for document
	 * @param {boolean} associative  if true return associative array, otherwise regular array
	 * FIXME: get rid of the associative parameter.
	 */ 
	getStates: function(node, associative){
		node = this._getWidgetNode(node); 
		var states = node && node._maqstates;
		if(states && states.states){
			var names = associative ? {"Normal": "Normal"} : ["Normal"];
			var statesList = states.states;
			for(var i=0; i<statesList.length; i++){
				var name = statesList[i];
				if(name != 'Normal'){
					if (associative) {
						names[name] = name;
					} else {
						names.push(name);
					}
				}
			}
			return names;
		}else{
			return associative ? {} : [];
		}
/*FIXME OLD LOGIC
		node = this._getWidgetNode(node); 
		var names = associative ? {"Normal": "Normal"} : ["Normal"];
		var states = node && node.states;
		if (states) {
			for (var name in states) {
				if (states[name].origin && name != "Normal") {
					if (associative) {
						names[name] = name;
					} else {
						names.push(name);
					}
				}
			}
		}
		return names;
*/
	},
	
	/**
	 * Internal routine. If node is null or undefined, return BODY node
	 * else return the node that was passed in.
	 * @param {null|undefined|Element} node
	 * @returns {Element}
	 * FIXME: This is somewhat ugly. We shouldn't have this sort of double-duty
	 * where some operations can either operate on BODY or on descendant nodes.
	 * Should instead have different operations for BODY vs the descendant nodes.
	 */
	_getWidgetNode: function(node) {
		if (!node) {
			var doc = this.getDocument();
			node = doc && doc.body;
		}
		return node;
	},
	
	/**
	 * Hook for when included in Maqetta page editor.
	 * The Maqetta page editor provides a subclass that overwrites this empty routine.
	 * When in the page editor, this function updates the "model" with latest states info
	 * for a given node.
	 * @param {Element} node
	 */
	_updateSrcState: function (node){
	},
	
	/**
	 * Returns true if the given application "state" exists.
	 * @param {Element} node  Right now must be BODY element
	 * @param {string} state  Name of state that might or not exist already
	 * return {boolean} 
	 */
	hasState: function(node, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
/*FIXME: old logic
		return !!(node && node.states && node.states[state] && node.states[state].origin);
*/
		return !!(node && node._maqstates && node._maqstates.states && node._maqstates.states.indexOf(state)>=0);
	},

	/**
	 * Returns the current state for the current node.
	 * Right now, node must be either empty (null|undefined) or be the BODY node.
	 * FIXME: Right now the node parameter is useless since things only
	 * work if you pass in null|undefined or BODY, and null|undefined are equiv to BODY.
	 */
	getState: function(node){ 
		node = this._getWidgetNode(node);
		return node && node._maqstates && node._maqstates.current;
	},
	
	/**
	 * Trigger updates to the given node based on the given "newState".  
	 * This gets called for every node that is affected by a change in the given state.
	 * This routine doesn't actually do any updates; instead, updates happen
	 * by publishing a /maqetta/appstates/state/changed event, which indirectly causes
	 * the _update() routine to be called for the given node.
	 * 
	 * @param {null|undefined|Element} node  If not null|undefined, must by BODY
	 * @param {null|undefined|string} newState  If null|undefined, switch to "Normal" state, else to "newState"
	 * @param {boolean} updateWhenCurrent  Force update logic to run even if newState is same as current state
	 * @param {boolean} _silent  If true, don't broadcast the state change via /davinci/states/state/changed
	 * 
	 * Subscribe using davinci.states.subscribe("/maqetta/appstates/state/changed", callback).
	 * FIXME: Right now the node parameter is useless since things only
	 * work if you pass in null|undefined or BODY, and null|undefined are equiv to BODY.
	 * FIXME: updateWhenCurrent is ugly. Higher level code could include that logic
	 * FIXME: _silent is ugly. Higher level code code broadcast the change.
	 */
	setState: function(node, newState, updateWhenCurrent, _silent){
		if (arguments.length < 2) {
			newState = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || !node._maqstates || (!updateWhenCurrent && node._maqstates.current == newState)) {
			return;
		}
		var oldState = node._maqstates.current;
		
		if (this.isNormalState(newState)) {
			if (!node._maqstates.current) { return; }
			delete node._maqstates.current;
			newState = undefined;
		} else {
//FIXME: For time being, only the BODY holds states.current.
			if(node.tagName == 'BODY'){
				node._maqstates.current = newState;
			}else{
				if(node._maqstates){
					delete node._maqstates.current;
				}
			}
		}
		if (!_silent) {
//FIXME: Reconcile node and statesContainerNode
			connect.publish("/maqetta/appstates/state/changed", 
					[{node:node, newState:newState, oldState:oldState, statesContainerNode:node}]);
		}
		this._updateSrcState (node);
		
	},
	
	/**
	 * Force a call to setState so that styling properties get reset for the given node
	 * based on the current application state.
	 */
	resetState: function(node){
		if(!node || !node.ownerDocument || !node.ownerDocument.body){
			return;
		}
		var body = node.ownerDocument.body;
		var currentState = this.getState(body);
		this.setState(node, currentState, true/*updateWhenCurrent*/, true /*silent*/);	
	},
	
	/**
	 * Returns true if the given application "state" is the NORMAL state.
	 * If "state" is not provided, then this routine responds whether the current
	 * state is the Normal state.
	 * If "state" is provided but is either null or undefined, then return true (i.e., NORMAL state).
	 * @param {null|undefined|String} state
	 * @returns {Boolean}
	 */
	isNormalState: function(state) {
		if (arguments.length == 0) {
			state = this.getState();
		}
		return !state || state == this.NORMAL;
	},

	/**
	 * Merges styleArray2's values into styleArray1. styleArray2 thus overrides styleArray1
	 * @param {Array} styleArray1  List of CSS styles to apply to this node for the given "state".
	 * 		This is an array of objects, where each object specifies a single propname:propvalue.
	 * 		eg. [{'display':'none'},{'color':'red'}]
	 * @param {Array} styleArray2
	 */
	_styleArrayMixin: function(styleArray1, styleArray2){
		// Remove all entries in styleArray1 that matching entry in styleArray2
		if(styleArray2){
			for(var j=0; j<styleArray2.length; j++){
				var item2 = styleArray2[j];
				for(var prop2 in item2){
					for(var i=styleArray1.length-1; i>=0; i--){
						var item1 = styleArray1[i];
						if(item1.hasOwnProperty(prop2)){
							styleArray1.splice(i, 1);
						}
					}
				}
			}
			// Add all entries from styleArray2 onto styleArray1
			for(var k=0; k<styleArray2.length; k++){
				styleArray1.push(styleArray2[k]);
			}
		}
	},
	
	/**
//FIXME OLD	 * Returns style values for the given node and the given application "state".
//FIXME OLD	 * If "name" is provided, then only those style values for the given property are return.
//FIXME OLD	 * If "name" is not provided, then all style values are returns.
	 * Returns style values for the given node when a particular set of application states are active.
	 * The list of application states is passed in as an array.
	 * @param {Element} node
//FIXME OLD * @param {string} state
	 * @param {[string]} statesList  
	 *    Array of appstate names. If all appstates are defined on BODY, then
	 *    the array will only have one item. If there are nested app state containers,
	 *    then the list will have multiple items, with the applicable state on furthest
	 *    ancestor at position 0 and nearest at position length-1.
	 * @param {string} name  Optional property name. If present, then returned value only contains that one property.
	 *    If not provided, then return all properties.
	 * @returns {Array} An array of objects, where each object has a single propname:propvalue.
	 *		For example, [{'display':'none'},{'color':'red'}]
	 */
	getStyle: function(node, statesList /*FIXME state */, name) {
		var styleArray, newStyleArray = [];
//FIXME: Make sure node and statesList are always sent to getStyle
/*
		node = this._getWidgetNode(node);
		if (arguments.length == 1) {
			state = this.getState();
		}
*/
		for(var i=0; i<statesList.length; i++){
			var state = statesList[i];
			// return all styles specific to this state
			styleArray = node && node._maqdeltas && node._maqdeltas[state] && node._maqdeltas[state].style;
			// states defines on deeper containers override states on ancestor containers
			this._styleArrayMixin(newStyleArray, styleArray);
			if (arguments.length > 2) {
				// Remove any properties that don't match 'name'
				if(newStyleArray){
					for(var j=newStyleArray.length-1; j>=0; j--){
						var item = newStyleArray[j];
						for(var prop in item){		// should be only one prop per item
							if(prop != name){
								newStyleArray.splice(j, 1);
								break;
							}
						}
					}
				}
			}
		}
		return newStyleArray;
/*FIXME OLD LOGIC
		var styleArray, newStyleArray;
		node = this._getWidgetNode(node);
		if (arguments.length == 1) {
			state = this.getState();
		}
		// return all styles specific to this state
		styleArray = node && node.states && node.states[state] && node.states[state].style;
		newStyleArray = dojo.clone(styleArray); // don't want to splice out of original
		if (arguments.length > 2) {
			// Remove any properties that don't match 'name'
			if(newStyleArray){
				for(var j=newStyleArray.length-1; j>=0; j--){
					var item = newStyleArray[j];
					for(var prop in item){		// should be only one prop per item
						if(prop != name){
							newStyleArray.splice(j, 1);
							break;
						}
					}
				}
			}
		}
		return newStyleArray;
*/
	},
	
	/**
	 * Returns true if the CSS property "name" is defined on the given node for the given "state".
	 * style values for the given node and the given application "state".
	 * @param {Element} node
	 * @param {string} state
	 * @param {string} name
	 * @returns {boolean} 
	 */
	hasStyle: function(node, state, name) {
		node = this._getWidgetNode(node);

		if (!node || !name) { return; }
		
		if(node._maqdeltas && node._maqdeltas[state] && node._maqdeltas[state].style){
			var valueArray = node._maqdeltas[state].style;
			for(var i=0; i<valueArray[i]; i++){
				if(valueArray[i].hasProperty(name)){
					return true;
				}
			}
		}else{
			return false;
		}
	},	
	
	/**
	 * Update the CSS for the given node for the given application "state".
	 * This routine doesn't actually do any screen updates; instead, updates happen
	 * by publishing a /maqetta/appstates/state/changed event, which indirectly causes
	 * the _update() routine to be called for the given node.
	 * @param {Element} node
	 * @param {string} state
	 * @param {Array} styleArray  List of CSS styles to apply to this node for the given "state".
	 * 		This is an array of objects, where each object specifies a single propname:propvalue.
	 * 		eg. [{'display':'none'},{'color':'red'}]
	 * @param {boolean} _silent  If true, don't broadcast the state change via /maqetta/appstates/state/changed
	 */
	setStyle: function(node, state, styleArray, silent) {
		node = this._getWidgetNode(node);

		if (!node || !styleArray) { return; }
		
		node._maqdeltas = node._maqdeltas || {};
		node._maqdeltas[state] = node._maqdeltas[state] || {};
		node._maqdeltas[state].style = node._maqdeltas[state].style || [];
		
		// Remove existing entries that match any of entries in styleArray
		var oldArray = node._maqdeltas[state].style;
		if(styleArray){
			for (var i=0; i<styleArray.length; i++){
				var newItem = styleArray[i];
				for (var newProp in newItem){	// There should be only one prop per item
					for (var j=oldArray.length-1; j>=0; j--){
						var oldItem = oldArray[j];
						for (var oldProp in oldItem){	// There should be only one prop per item
							if(newProp == oldProp){
								oldArray.splice(j, 1);
								break;
							}
						}
					}
				}
			}
		}
		//Make sure all new values are properly formatted (e.g, add 'px' to end of certain properties)
		var newArray;
		if(styleArray){
			for(var j=0; j<styleArray.length; j++){
				for(var p in styleArray[j]){	// should be only one prop per item
					var value =  styleArray[j][p];
					if (typeof value != "undefined" && value !== null) {
						if(typeof newArray == 'undefined'){
							newArray = [];
						}
						var o = {};
						o[p] = this._getFormattedValue(p, value);
						newArray.push(o)
					}
				}
			}
		}
		if(oldArray && newArray){
			node._maqdeltas[state].style = oldArray.concat(newArray);
		}else if(oldArray){
			node._maqdeltas[state].style = oldArray;
		}else if(newArray){
			node._maqdeltas[state].style = newArray;
		}else{
			node._maqdeltas[state].style = undefined;
		}
			
		if (!silent) {
			connect.publish("/davinci/states/state/style/changed", [{node:node, state:state, style:styleArray}]);
		}
		this._updateSrcState (node);
	},
	
	/**
	 * convert "property-name" to "propertyName"
	 */
	_convertStyleName: function(name) {
		if(name.indexOf("-") >= 0){
			// convert "property-name" to "propertyName"
			var names = name.split("-");
			name = names[0];
			for(var i = 1; i < names.length; i++){
				var n = names[i];
				name += (n.charAt(0).toUpperCase() + n.substring(1));
			}
		}
		return name;
	},
	
	_DYNAMIC_PROPERTIES: { width:1, height:1, top:1, right:1, bottom:1, left:1 },
	
	/**
	 * Make sure length values have a 'px' at end
	 * FIXME: What about other properties that take lengths? Seems arbitrary to help out
	 * with only a few properties.
	 */
	_getFormattedValue: function(name, value) {
		//FIXME: This code needs to be analyzed more carefully
		// Right now, only checking six properties which might be set via dynamic
		// drag actions on canvas. If just a raw number value, then add "px" to end.
		if(name in this._DYNAMIC_PROPERTIES){
			if(typeof value != 'string'){
				return value+"px";
			}
			var trimmed_value = require("dojo/_base/lang").trim(value);
			// See if value is a number
			if(/^[-+]?[0-9]*\.?[0-9]+$/.test(trimmed_value)){
				value = trimmed_value+"px";
			}
		}
		return value;			
	},
	
	/**
	 * Takes the current statesArray and returns a simple array
	 * of the same number of item, where each item in returned array
	 * indicates the Normal state (indicated by undefined for the present).
	 * @param {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 */
	_getStatesListNormal: function(statesArray){
		var statesList = [];
		if(statesArray){
			for(var i=0; i<statesArray.length; i++){
				statesList.push(undefined);
			}
		}
		return statesList;
	},
	
	/**
	 * Takes the current statesArray array and returns a simple array
	 * of the same number of items where each item indicates the state name
	 * corresponding to the given propName (which in practice can only be
	 * 'oldState' or 'newState').
	 * @param {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 * @param {string} propName  property name to use as index into items in array
	 *                           (in practice, can only be 'oldState' or 'newState')
	 */
	_getStatesListUsingPropName: function(statesArray, propName){
		var statesList = [];
		if(statesArray){
			for(var i=0; i<statesArray.length; i++){
				statesList.push(statesArray[i][propName]);
			}
		}
		return statesList;
	},
	
	/**
	 * Utility routine to clean up styling on a given "node"
	 * to reset CSS properties for "Normal" state.
	 * First, remove any properties that were defined for "oldState".
	 * Then, add properties defined for Normal state.
	 * @param {Element} node
	 * @param {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 */
	_resetAndCacheNormalStyle: function(node, statesArray /*FIXME oldState*/) {

		if(!node || !statesArray){
			return;
		}
		for(var i=0; i < statesArray.length; i++){
			var oldState = statesArray[i].oldState;
			
			var oldStatesList = this._getStatesListUsingPropName(statesArray, 'oldState');
			var oldStateStyleArray = this.getStyle(node, oldStatesList);
			var normalStatesList = this._getStatesListUsingPropName(statesArray);
			var normalStyleArray = this.getStyle(node, normalStatesList);
			
			// Clear out any styles corresponding to the oldState
			if(oldStateStyleArray){
				for(var j=0; j<oldStateStyleArray.length; j++){
					var oItem = oldStateStyleArray[j];
					for(var oProp in oItem){	// Should only be one prop
						var convertedName = this._convertStyleName(oProp);
						node.style[convertedName] = '';
					}
				}
			}
			
			// Reset normal styles
			if(normalStyleArray){
				for(var i=0; i<normalStyleArray.length; i++){
					var nItem = normalStyleArray[i];
					for(var nProp in nItem){	// Should only be one prop
						var convertedName = this._convertStyleName(nProp);
						node.style[convertedName] = this._getFormattedValue(nProp, nItem[nProp]);
					}
				}
			}
		}

		/*FIXME OLD LOGIC
		var oldStateStyleArray = this.getStyle(node, oldState);
		var normalStyleArray = this.getStyle(node, undefined);
		
		// Clear out any styles corresponding to the oldState
		if(oldStateStyleArray){
			for(var j=0; j<oldStateStyleArray.length; j++){
				var oItem = oldStateStyleArray[j];
				for(var oProp in oItem){	// Should only be one prop
					var convertedName = this._convertStyleName(oProp);
					node.style[convertedName] = '';
				}
			}
		}
		
		// Reset normal styles
		if(normalStyleArray){
			for(var i=0; i<normalStyleArray.length; i++){
				var nItem = normalStyleArray[i];
				for(var nProp in nItem){	// Should only be one prop
					var convertedName = this._convertStyleName(nProp);
					node.style[convertedName] = this._getFormattedValue(nProp, nItem[nProp]);
				}
			}
		}
*/
	},
	
	/**
	 * Updates CSS properties for the given node due to a transition
	 * from application state (from an old state to a new state).
	 * Called indirectly when the current state changes (via a setState call)
	 * from code that listens to event /maqetta/appstates/state/changed
	 * @param {Element} node
//FIXME: OLD LOGIC	 * @param {string} oldState
//FIXME: OLD LOGIC	 * @param {string} newState
	 * @param {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 */
	_update: function(node, statesArray /*FIXME: oldState, newState*/ ) {
		node = this._getWidgetNode(node);
		if (!node || !node._maqdeltas){
			return;
		}

		var newStatesList = this._getStatesListUsingPropName(statesArray, 'newState');
		var styleArray = this.getStyle(node, newStatesList);
		
		this._resetAndCacheNormalStyle(node, statesArray);

		// Apply new style
		if(styleArray){
			for(var i=0; i<styleArray.length; i++){
				var style = styleArray[i];
				for (var name in style) {	// should be only one prop in style
					var convertedName = this._convertStyleName(name);
					node.style[convertedName] = style[name];
				}
			}
		}
		
		//FIXME: This is Dojo-specific. Other libraries are likely to need a similar hook.
		var dijitWidget, parent;
		if(node.id && node.ownerDocument){
			var byId = node.ownerDocument.defaultView.require("dijit/registry").byId;
			if(byId){
				dijitWidget = byId && byId(node.id);				
			}
		}
		if(dijitWidget && dijitWidget.getParent){
			parent = dijitWidget.getParent();
		}
		if(parent && parent.resize){
			parent.resize();
		}else if(dijitWidget && dijitWidget.resize){
			dijitWidget.resize();
		}
/*FIXME OLD LOGIC
		node = this._getWidgetNode(node);
		if (!node || !node.states){
			return;
		}
		
		var styleArray = this.getStyle(node, newState);
		
		this._resetAndCacheNormalStyle(node, oldState);

		// Apply new style
		if(styleArray){
			for(var i=0; i<styleArray.length; i++){
				var style = styleArray[i];
				for (var name in style) {	// should be only one prop in style
					var convertedName = this._convertStyleName(name);
					node.style[convertedName] = style[name];
				}
			}
		}
		
		//FIXME: This is Dojo-specific. Other libraries are likely to need a similar hook.
		var dijitWidget, parent;
		if(node.id && node.ownerDocument){
			var byId = node.ownerDocument.defaultView.require("dijit/registry").byId;
			if(byId){
				dijitWidget = byId && byId(node.id);				
			}
		}
		if(dijitWidget && dijitWidget.getParent){
			parent = dijitWidget.getParent();
		}
		if(parent && parent.resize){
			parent.resize();
		}else if(dijitWidget && dijitWidget.resize){
			dijitWidget.resize();
		}
*/
	},
	
	/**
	 * Returns true if the given node is an application state "container".
	 * Right now, only BODY can be such a container.
	 * @param {Element} node
	 * @returns {Boolean}
	 */
	isContainer: function(node) {
		var result = false;
		if (node) {
			var doc = this.getDocument();
			if (node === (doc && doc.body) || node.tagName == "BODY") {
				result = true;
			}
		}
		return result;
	},
	
	/**
	 * Returns BODY node for current document.
	 * @returns {Element}
	 */
	getContainer: function() {
		return this._getWidgetNode();
	},
	
	/**
	 * Adds a state to the list of states declared by the node.
	 * Right now, node must by the BODY element.
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/added", callback).
	 */
	add: function(node, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || this.hasState(node, state)) {
			//FIXME: This should probably be an error of some sort
			return;
		}
		node._maqstates = node._maqstates || {};
/*FIXME: old logic
		node.states[state] = node.states[state] || {};
		node.states[state].origin = true;
*/
		node._maqstates.states = node._maqstates.states || [];
		node._maqstates.states.push(state);
		connect.publish("/davinci/states/state/added", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/** 
	 * Removes a state to the list of states declared by the node.
	 * Right now, node must by the BODY element.
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/removed", callback).
	 */
	remove: function(node, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || !node._maqstates || !node._maqstates.states || !this.hasState(node, state)) {
			return;
		}
		var idx = node._maqstates.states.indexOf(state);
		if(idx < 0){
			return;
		}
		var currentState = this.getState(node);
		if (state == currentState) {
			this.setState(node, undefined);
		}
/*FIXME: old logic
		delete node.states[state].origin;
		if (this._isEmpty(node.states[state])) {
			delete node.states[state];
		}
*/
		node._maqstates.states.splice(idx, 1);
		if(node._maqstates.states.length==0){
			delete node._maqstates;
		}
		connect.publish("/davinci/states/state/removed", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/**
	 * Renames a state in the list of states declared by the widget.
	 * Subscribe using connect.subscribe("/davinci/states/renamed", callback).
	 */
	rename: function(node, oldName, newName, property){ 
		if (arguments.length < 3) {
			newName = arguments[1];
			oldName = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || !this.hasState(node, oldName, property) || this.hasState(node, newName, property)) {
			return false;
		}
		node._maqstates[newName] = node._maqstates[oldName];
		delete node._maqstates[oldName];
		if (!property) {
			connect.publish("/davinci/states/state/renamed", [{node:node, oldName:oldName, newName:newName}]);
		}
		this._updateSrcState (node);
		return true;
	},

	/**
	 * Returns true if the node is set to visible within the current state, false otherwise.
	 */ 
	isVisible: function(node, state){ 
		if (arguments.length == 1) {
			state = this.getState();
		}
		node = this._getWidgetNode(node);
		if (!node){
			return;
		}
		// FIXME: The way the code is now, sometimes there is an "undefined" property
		// within widget.states. That code seems somewhat accidental and needs
		// to be studied and cleaned up.
		var isNormalState = (typeof state == "undefined" || state == "undefined");
		if(isNormalState){
			return node.style.display != "none";
		}else{
			if(node._maqdeltas && node._maqdeltas[state] && node._maqdeltas[state].style && typeof node._maqdeltas[state].style.display == "string"){
				return node._maqdeltas[state].style.display != "none";
			}else{
				return node.style.display != "none";
			}
		}
	},
	
	/**
	 * Returns true if object does not directly have property 'name'
	 * (versus inherited it from a prototype).
	 */
	_isEmpty: function(object) {
		for (var name in object) {
			if (object.hasOwnProperty(name)) {
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Convert the _maqstates and _maqdeltas properties on the given node into JSON-encoded strings.
	 * @param {Element} node
	 * @returns {object}  Object of form {defs:<string>,deltas:<string>} where both defs and deltas
	 *                    are included in object only if respective property is on the node
	 */
	serialize: function(node) {
		var that = this;
		function munge(propval){
			var str = '';
			if(node[propval]){
				var o = require("dojo/_base/lang").clone(node[propval]);
				delete o["undefined"];
				if (!that._isEmpty(o)) {
					str = JSON.stringify(o);
					// Escape single quotes that aren't already escaped
					str = str.replace(/(\\)?'/g, function($0, $1){ 
						return $1 ? $0 : "\\'";
					});
					// Replace double quotes with single quotes
					str = str.replace(/"/g, "'");
				}
			}
			return str;
		}
		var obj = {};
		if (!node){
			return obj;
		}
		var defs = munge('_maqstates');
		var deltas = munge('_maqdeltas');
		if(defs){
			obj.defs = defs;
		}
		if(deltas){
			obj.deltas = deltas;
		}
		return obj;
	},

	/**
	 * Convert a string representation of widget-specific states information into a JavaScript object
	 * using JSON.parse.
	 * The string representation is typically the value of this.DELTAS_ATTRIBUTE (dvStates)
	 * @param states  string representation of widget-specific states information
	 * @param {object} options  
	 *    options.isBody {boolean}  whether we are deserializing BODY element
	 * @return {object}  JavaScript result from JSON.parse
	 */
	deserialize: function(states, options) {
		if (typeof states == "string") {
			// Replace unescaped single quotes with double quotes, unescape escaped single quotes
			states = states.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? "'" : '"';
			});
			states = JSON.parse(states);
			this._migrate_m4_m5(states);	// Upgrade old files
			states = this._migrate_m6_m7(states, options && options.isBody);
		}
		return states;
	},
	
	/**
	 * The format of the states attribute (this.DELTAS_ATTRIBUTE = 'dvStates') changed
	 * from Preview4 to Preview5. This routine upgrades the states object in place
	 * from Preview4 or earlier data structure into data structure used by Preview 5.
	 * @param {object} states  "states" object that might be in Preview4 format
	 */
	_migrate_m4_m5: function(states){
		// We changed the states structure for Preview5 release. It used to be
		// a JSON representation of an associative array: {'display':'none', 'color':'red'}
		// But with Preview5 it is now an array of single property declarations such as:
		// [{'display':'none'}, {'color':'red';}]. The array approach was necessary to
		// deal with complexities of background-image, where there might be multiple values
		// for a single property.
		for (var s in states){
			var state = states[s];
			var style = state.style;
			if(style && !style.length){	// if style exists but isn't an array
				var statesArray = [];
				for(var prop in style){
					var o = {};
					o[prop] = style[prop];
					statesArray.push(o);
				}
				state.style = statesArray;
			}
		}
	},
	
	/**
	 * The format of the states attribute (this.DELTAS_ATTRIBUTE = 'dvStates') on the BODY changed
	 * from M6 to M7. This routine returns an M7-compatible states structure created
	 * from an M6-compatible states structure.
	 * @param {object} m6bodystates  "states" object that might be in M6 format
	 * @param {boolean} isBody  whether the "states" is for a BODY element
	 * @returns {object} m7bodystates  "states" object in M7 format
	 */
	_migrate_m6_m7: function(states, isBody){
		// We changed the states structure on BODY for M7 release. It used to be
		// a JSON representation of a simple associative array: 
		//    dvStates="{'Add Task':{'origin':true},'Task Added':{'origin':true}}"
		// But with M7 it is a different associative array, with properties 'states' and 'current':
		// where 'states' is an array of strings that lists all user-defined states on the BODY
		//    dvStates="{'states':['Add Task':'Task Added'],'current':'Add Task'}"
		// and where 'current' is a string that (if specified) indicates which state should be
		// active at page startup.
		
		// if either no param, or if states object has a states property, return original object
		if(!states || states.states){
			return states;
		}
		// otherwise, migrate from M6 to M7
		if(isBody){
			var statesArray = [];
			for(var s in states){
				statesArray.push(s);
			}
			if(statesArray.length > 0){
				return { states:statesArray };
			}else{
				return undefined;
			}
		}else{
			delete states.current;
			return states;
		}
	},
	
	/**
	 * Stuffs a JavaScript property (the states object) onto the given node.
	 * @param {Element} node  
	 * @param maqstates   the string value of the list of states attribute
	 * @param maqdeltas   the string value of the property deltas for various states
	 */
	store: function(node, maqstates, maqdeltas) {
		if (!node){
			return;
		}
		this.clear(node);
//FIXME: Generalize for nested state containers?
		var isBody = (node.tagName == 'BODY');
		if(maqstates){
			node._maqstates = this.deserialize(maqstates, {isBody:isBody});
		}
		if(maqdeltas){
			node._maqdeltas = this.deserialize(maqdeltas, {isBody:isBody});
		}
		connect.publish("/davinci/states/stored", []);
	},
	
	/**
	 * Returns the string value of the attribute that holds node-specific states information (dvStates)
	 * @param {Element} node  
//FIXME: OLD	 * @returns {string}  String value for the attribute, or unspecified|null if no such widget or attribute
	 * @returns {object}  Object with two props, defs:{string|null} and deltas:{string|null},
	 *                    which hold DELTAS and DEFS attribute values, respectively
	 */
	retrieve: function(node) {
		if (!node){
			return;
		}
/*FIXME: OLD LOGIC
		// FIXME: Maybe this check between page editor and runtime should be factored out
		var states = node.getAttribute(this.DELTAS_ATTRIBUTE);
		return states;
*/
		var defs_attribute = node.getAttribute(this.DEFS_ATTRIBUTE);
		if(!defs_attribute && node.tagName === 'BODY'){
			// Previous versions used different attribute name (ie, 'dvStates')
			defs_attribute = node.getAttribute(this.DEFS_ATTRIBUTE_P6);
		}
		var deltas_attribute = node.getAttribute(this.DELTAS_ATTRIBUTE);
		if(!deltas_attribute && node.tagName !== 'BODY'){
			// Previous versions used different attribute name (ie, 'dvStates')
			deltas_attribute = node.getAttribute(this.DELTAS_ATTRIBUTE_P6);
		}
		return {defs:defs_attribute, deltas:deltas_attribute};
	},

	/**
	 * Removes the states property on the given node
	 * @param {Element} node  
	 */
	clear: function(node) {
		if (!node || !node._maqstates) return;
		var states = node._maqstates;
		delete node._maqstates;
		connect.publish("/davinci/states/cleared", [{node:node, states:states}]);
	},
	
	/**
	 * Parse an element.style string, return a valueArray, which is an array
	 * of objects, where each object holds a single CSS property value
	 * (e.g., [{'display':'none'},{'color':'red'}]
	 * @param text
	 * @returns {Array}  valueArray: [{propname:propvalue}...]
	 */
	_parseStyleValues: function(text) {
		var values = [];
		if(text){
			dojo.forEach(text.split(";"), function(s){
				var i = s.indexOf(":");
				if(i > 0){
					var n = s.substring(0, i).trim();
					var v = s.substring(i + 1).trim();
					var o = {};
					o[n] = v;
					values.push(o);
				}
			});
		}
		return values;
	},

	/**
	 * Store original element.style values into node._maqstates['undefined'].style
	 * Called by _preserveStates
	 * @param node  
	 * @param {String} elemStyle  element.style string
	 */
	transferElementStyle: function(node, elemStyle) {
		if(node){
			var states = node._maqdeltas;
			var valueArray = this._parseStyleValues(elemStyle);
			if(!states['undefined']){
				states['undefined'] = {};
			}
			states['undefined'].style = valueArray;
		}
	},
	
	/**
	 * Returns current document object.
	 * Make into a function because in Maqetta page editor a subclass overrides this routine.
	 */
	getDocument: function() {
		return document;
	},
	
	_shouldInitialize: function() {
		var windowFrameElement = window.frameElement;
		var isDavinciEditor = top.davinci && top.davinci.Runtime && (!windowFrameElement || windowFrameElement.dvContext);
		return !isDavinciEditor;
	},


	/**
	 * Returns all child elements for given Element
	 * Note: can't just use node.children because node.children isn't available for SVG nodes.
	 * @param {Element} node
	 * @returns {Array} array of child nodes
	 */
	_getChildrenOfNode: function(node) {
		var children = [];
		for (var i=0; i<node.childNodes.length; i++){
			var n = node.childNodes[i];
			if(n.nodeType === 1){	// Element
				children.push(n);
			}
		}
		return children;
	},
	
	initialize: function() {	
		if (!this.subscribed) {
			connect.subscribe("/maqetta/appstates/state/changed", function(e) { 
				if(e.editorClass){
					// Event targets one of Maqetta's editors, not from runtime events
					return;
				}
				var children = davinci.states._getChildrenOfNode(e.node);
				while (children.length) {
					var child = children.shift();
					if (!davinci.states.isContainer(child)) {
						children = children.concat(davinci.states._getChildrenOfNode(child));
					}
					var statesArray = this.getStatesArray(child, e.oldState, e.newState, e.statesContainerNode);
					davinci.states._update(child, statesArray);
				}
			}.bind(this));
			
			this.subscribed = true;
		}
	}
};

//FIXME: remove all references to davinci global and davinci.states
if (typeof davinci === "undefined") { davinci = {}; }
var singleton = davinci.states = new States();

(function(){

	singleton.initialize();
	
	if (singleton._shouldInitialize()) {
	
		// Patch the dojo parse method to preserve states data
		if (typeof require != "undefined") {
			require(["dojo/_base/lang", "dojo/query", "dojo/domReady!"], function(lang, query) {
				var cache = {}; // could be local to hook function?
				var alreadyHooked = false;

				// hook main dojo.parser (or dojox.mobile.parser, which also
				// defines "dojo.parser" object)
				// Note: Uses global 'dojo' reference, which may not work in the future
				var hook = function(parser) {
					if(!alreadyHooked){
						var parse = parser.parse;
						// Note that Dojo parser can be called multiple times at document load time
						// where it parses different components of the document -- not all of the
						// document is parsed with that first call to the parser. As a result,
						// we might end up calling _restoreStates() multiple time for the same 
						// particular document fragments, and reassigning the "states" property
						// multiple times, but otherwise Dojo might wipe out the previously installed
						// "states" property.
						dojo.parser.parse = function(rootNode, args) {
							// logic below to compute "root" was copied from dojo's parser.js
							var root;
							if(!args && rootNode && rootNode.rootNode){
								args = rootNode;
								root = args.rootNode;
							}else{
								root = rootNode;
							}
							root = root ? dhtml.byId(root) : dwindow.body();
							
							_preserveStates(cache);
							var results = parse.apply(this, arguments);
							_restoreStates(cache, root);
							return results;
						};
						alreadyHooked = true;
					}
				};
				// only include the regular parser if the mobile parser isn't available
				var parser = lang.getObject("dojox.mobile.parser.parse");
				if (!parser) {
					require(["dojo/parser"], hook);
				} else {
					hook.apply(parser);
				}

				/**
				 * Preserve states specified on widgets.
				 * Invoked from code above that wraps the dojo parser such that
				 * dojo parsing is sandwiched between calls to _preserveStates and _restoreStates.
				 */
				var _preserveStates = function (cache) {
					var count=0;
					var prefix = 'maqTempClass';
					var doc = singleton.getDocument();
	
					// Preserve the body states directly on the dom node
					if(!doc.body._maqAlreadyPreserved){
						var statesAttributes = davinci.states.retrieve(doc.body);
						if (statesAttributes && statesAttributes.defs) {
							cache.body = statesAttributes.defs;
						}
						doc.body._maqAlreadyPreserved = true;
					}
	
					// Preserve states of children of body in the cache
					//FIXME: why can't we just query for nodes that have this.DELTAS_ATTRIBUTE?
					query("*", doc).forEach(function(node){
						// Because Dojo parser gets called recursively (multiple times), 
						// but preserveStates/restoreStates go through entire document,
						// make sure the current node hasn't already been preserved
						if(!node._maqAlreadyPreserved){
							node._maqAlreadyPreserved = true;
							var statesAttributes = singleton.retrieve(node);
							if (node.tagName != "BODY" && statesAttributes && statesAttributes.deltas) {
								var tempClass = prefix+count;
								node.className = node.className + ' ' + tempClass;
								count++;
								cache[tempClass] = {deltas: statesAttributes.deltas};
								if(node.style){
									cache[tempClass].style = node.style.cssText;
								}else{
									// Shouldn't be here
									console.error('States.js _preserveStates. No value for node.style.')
								}
							}
						}
					});
				};
				
				/**
				 * Restore widget states from cache
				 * Invoked from code below that wraps the dojo parser such that
				 * dojo parsing is sandwiched between calls to _preserveStates and _restoreStates.
				 */
				var _restoreStates = function (cache, rootNode) {
					var doc = singleton.getDocument(),
						currentStateCache = [];
					for(var id in cache){
						var node;
						if(id == 'body'){
							node = doc.body;
						}else{
							node = doc.querySelectorAll('.'+id)[0];
							
						}
						if(node){
							var isBody = (node.tagName == 'BODY');
//FIXME: Temporary - doesn't yet take into account nested state containers
							var maqstates, maqdeltas;
							if(isBody){
								maqstates = singleton.deserialize(cache[id], {isBody:isBody});
							}else{
								maqdeltas = singleton.deserialize(cache[id].deltas, {isBody:isBody});
							}
							
							if(maqstates){
								delete maqstates.current; // FIXME: Always start in normal state for now, fix in 0.7
							}
							singleton.store(node, maqstates, maqdeltas);
							if(node.tagName != 'BODY'){
								//FIXME: maybe not be general enough
								davinci.states.transferElementStyle(node, cache[id].style);
							}
						}
					}
				};
			});
		}
	}
})();

// Bind to watch for overlay widgets at runtime.  Dijit-specific, at this time
if (!davinci.Workbench && typeof dijit != "undefined"){
	connect.subscribe("/maqetta/appstates/state/changed", function(args) {
		var w;
		var byId = (args && args.node && args.node.ownerDocument && args.node.ownerDocument.defaultView &&
					args.node.ownerDocument.defaultView.require("dijit/registry").byId);
		if(byId){
			if (args.newState && !args.newState.indexOf("_show:")) {
				w = byId(args.newState.substring(6));
				w && w.show && w.show();
			} else if (args.oldState && !args.oldState.indexOf("_show:")) {
				w = byId(args.oldState.substring(6));
				w && w.hide && w.hide();
			}
		}
	});
}

return States;
});
