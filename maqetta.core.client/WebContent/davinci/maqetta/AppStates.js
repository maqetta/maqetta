define(["dojo/_base/connect", "dojo/dom-style", "dojo/dom", "dojo/_base/html", "dojo/_base/window", "dojo/_base/array", "dojo/parser", "require", "dojo/json", "dojo/_base/lang"], 
function(connect, domStyle, dom, dhtml, dwindow, darray, dparser, require, JSON, lang){ // needed for IE9 compat view mode

var States = function(){};
States.prototype = {

	NORMAL: "Normal",
	DELTAS_ATTRIBUTE: "data-maq-deltas",
	DELTAS_ATTRIBUTE_P6: "dvStates",	// Attribute name used in Preview6 or earlier
	APPSTATES_ATTRIBUTE: "data-maq-appstates",
	APPSTATES_ATTRIBUTE_P6: "dvStates",	// Attribute name used in Preview6 or earlier
	reImportant: /^(.*)(!\ *important)(.*)/,

	/**
	 * Returns true if the given node has application states (i.e., node._maqAppStates has a value)
	 */
	isStateContainer: function(node){
		return !!(node && node._maqAppStates);
	},
	
	/**
	 * Returns an array of all ancestor nodes that are state containers (due to having a _maqAppStates property)
	 * @param node
	 * @returns {Array[Element]}  an array of Elements for all ancestor state containers.
	 *      If this node is a state container, it is included in the list.
	 *      First element in array should be the BODY element.
	 */
	getStateContainersForNode: function(node){
		var allStateContainers = [];
		var n = node;
		while(n){
			if(n._maqAppStates){
				allStateContainers.splice(0, 0, n);
			}
			if(n.tagName == 'BODY'){
				break;
			}
			n = n.parentNode;
		}
		return allStateContainers;
	},
	
	/**
	 * Returns an array of all nodes that are state containers (due to having a _maqAppStates property)
	 * @param rootnode
	 * @returns {Array[Element]}  an array of Elements for all state containers in document
	 */
	getAllStateContainers: function(rootnode){
		var allStateContainers = [];
		var that = this;
		function findStateContainers(currentNode){
			if(currentNode._maqAppStates){
				allStateContainers.push(currentNode);
			}
			var children = that._getChildrenOfNode(currentNode);
			for(var i=0; i<children.length; i++){
				findStateContainers(children[i]);
			}
		}
		findStateContainers(rootnode);
		return allStateContainers;
	},
	
	/**
	 * Returns a statesArray data structure for the given node
	 * @param {Element} node  An element node in the document
	 * @param {string|undefined} oldState  The state which used to be active
	 * @param {string|undefined} newState  The state which has now become active
	 * @param {Element} stateContainerNode  The (state container) element on which oldState and newState are defined
	 * @returns {[object]} statesArray  
	 *    Array of "state containers" that apply to this node,
	 *    with furthest ancestor at position 0 and nearest at position length-1.
	 *    Each item in array is an object with these properties
	 *      statesArray[i].node - a state container node
	 *      statesArray[i].oldState - the previous appstate that had been active on this state container node
	 *      statesArray[i].newState - the new appstate for this state container node
	 */ 
	getStatesArray: function(node, oldState, newState, stateContainerNode){
		var statesArray = [];
		if(node){
			var pn = node.parentNode;
			while(pn){
				if(pn._maqAppStates){
					
					if(pn == stateContainerNode){
						statesArray.splice(0, 0, {node:pn, oldState:oldState, newState:newState});
					}else{
						var current = pn._maqAppStates.states ? pn._maqAppStates.states.current : undefined;
						statesArray.splice(0, 0, {node:pn, oldState:current, newState:current});
					}
				}
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
				if(pn._maqAppStates && 
						(!state || state == this.NORMAL ||  
						(pn._maqAppStates.states && pn._maqAppStates.states.indexOf(state)>=0))){
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
	 * Returns a flat list of all states that apply to the given node.
	 * @param {Element} node  An element node in the document
	 * @returns {[string]}  An array of strings, one item for each state that 
	 *       that is defined by a parent state container.
	 *       Note that there might be duplicate names.
	 *       "Normal" is only added once even if there are multiple
	 *       state containers.
	 */ 
	getAllStatesForNode: function(node){
		var statesList = [this.NORMAL];
		if(node){
			var pn = node.parentNode;
			while(pn){
				if(pn._maqAppStates && pn._maqAppStates.states){
					var states = pn._maqAppStates.states ? pn._maqAppStates.states : [];
					for(var i=0; i<states.length; i++){
						statesList.push(states[i]);
					}
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
				if(pn._maqAppStates){
					statesList.splice(0, 0, pn._maqAppStates.current);
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
	 * Returns the array of objects that lists all statecontainers that are on the given rootnode
	 * or any descendants and the currently active state for each given statecontainer.
	 * @param {Element} rootnode  
	 * @returns {[object]}  An array of objects, where each object has the following properties
	 *           {Element} stateContainerNode
	 *           {string|undefined|null} currently active state
	 */ 
	getAllCurrentStates: function(rootnode){
		var allStateContainers = this.getAllStateContainers(rootnode);
		var currentStates = [];
		for(var i=0; i<allStateContainers.length; i++){
			var node = allStateContainers[i];
			var state = this.getState(node);
			currentStates.push({ stateContainerNode:node, state:state });
		}
		return currentStates;
	},

	/**
	 * Returns the array of application states declared on the given node.
	 * At this point, only the BODY node can have application states declared on it.
	 * In future, maybe application states will include a recursive feature.
	 * @param {Element} node  BODY node for document
	 */ 
	getStates: function(node){
		var states = node && node._maqAppStates;
		var names = ["Normal"];
		if(states){
			var statesList = states.states ? states.states : [];
			for(var i=0; i<statesList.length; i++){
				var name = statesList[i];
				if(name != 'Normal'){
					names.push(name);
				}
			}
		}
		return names;
	},

	/**
	 * Internal routine. Returns state container corresponding to state and ElemOrEvent.
	 * @param {undefined|null|string} state   we are searching for a state container that defines this state
	 * @param {Element|Event} ElemOrEvent 
	 *        If an Element, then either the given Element is the state container
	 *        or we will march up the ancestor tree until finding the state container.
	 *        If an Event, then either the Event.currentTarget is the state container
	 *        or we will march up the ancestor tree until finding the state container.
	 * @returns {Element}
	 */
	_getSCNodeFromElemOrEvent: function(state, ElemOrEvent) {
		var node;
		// Determine if second param is an Element or Event object
		if(ElemOrEvent && ElemOrEvent.tagName && ElemOrEvent.nodeName){
			// ElemOrEvent is an Element
			node = ElemOrEvent._maqAppStates ? ElemOrEvent : this.findStateContainer(ElemOrEvent, state);
		}else if(ElemOrEvent && ElemOrEvent.target && ElemOrEvent.currentTarget){
			// ElemOrEvent is an Event
			node = ElemOrEvent.currentTarget;
			if(!node._maqAppStates){
				node = this.findStateContainer(node, state);
			}
		}else{
			node = this.getContainer();;
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
		return !!(node && node._maqAppStates && node._maqAppStates.states && node._maqAppStates.states.indexOf(state)>=0);
	},

	/**
	 * Returns the current state for the given state container node.
	 */
	getState: function(node){
		return node && node._maqAppStates && node._maqAppStates.current;
	},
	
	/**
	 * Change the current "state" for a particular state container node.
	 * This will trigger updates to the document such that various properties
	 * on various node will be altered (e.g., visibility of particular nodes)
	 * because the document defines state-specific values for particular properties.
	 * This routine doesn't actually do any updates; instead, updates happen
	 * by publishing a /maqetta/appstates/state/changed event, which indirectly causes
	 * the _update() routine to be called for the given node.
	 * 
	 * @param {null|undefined|string} newState  If null|undefined, switch to "Normal" state, else to "newState"
	 * @param {Element|Event} ElemOrEvent  Identifies state container.
	 *        If an Element, then either the given Element is the state container
	 *        or we will march up the ancestor tree until finding the state container.
	 *        If an Event, then either the Event.currentTarget is the state container
	 *        or we will march up the ancestor tree until finding the state container.
	 * @param [{object}] params  (Optional) Various flags
	 *     params.updateWhenCurrent {boolean}  Force update logic to run even if newState is same as current state
	 *     params.silent {boolean}  If true, don't broadcast the state change via /davinci/states/state/changed
	 *     params.focus {boolean}  If true, then set the document-level "application state focus" 
	 *                             to the given state on the given state container.
	 *                             This feature is primarily used by design-time tools.
	 *     params.initial {boolean}  If provided and true, then this state becomes initial state
	 *                             at document load time for the given state container.
	 *                             If provided and false, then remove any designation that this
	 *                             state should be the initial state at document load time.
	 *                             This feature is primarily used by design-time tools.
	 * Subscribe using davinci.states.subscribe("/maqetta/appstates/state/changed", callback).
	 * FIXME: updateWhenCurrent is ugly. Higher level code could include that logic
	 * FIXME: silent is ugly. Higher level code code broadcast the change.
	 */
	setState: function(newState, ElemOrEvent, params){
		var updateWhenCurrent = params ? params.updateWhenCurrent : false;
		var silent = params ? params.silent : false;
		var focus = params ? params.focus : false;
		var node = this._getSCNodeFromElemOrEvent(newState, ElemOrEvent);
		if (!node || !node._maqAppStates || (!updateWhenCurrent && node._maqAppStates.current == newState)) {
			return;
		}
		var oldState = node._maqAppStates.current;
		if (this.isNormalState(newState)) {
			if(node._maqAppStates.hasOwnProperty('current')){
				delete node._maqAppStates.current;
			}
			newState = undefined;
		} else {
			node._maqAppStates.current = newState;
		}
		if(focus){
			this._setFocus(newState, node);
		}
		if(params && params.hasOwnProperty('initial')){
			if(params.initial){
				node._maqAppStates.initial = newState;
			}else if(node._maqAppStates.initial){
				delete node._maqAppStates.initial;
			}
		}
		if (!silent) {
//FIXME: Reconcile node and stateContainerNode
			connect.publish("/maqetta/appstates/state/changed", 
					[{node:node, newState:newState, oldState:oldState, stateContainerNode:node}]);
		}

		// if no new state we can skip setting the dirty flag
		this._updateSrcState (node, !newState);		
	},

	/**
	 * Returns the application state for the given state container node
	 * that should show at document load time.
	 */
	getInitial: function(node){
		return node && node._maqAppStates && node._maqAppStates.initial;
	},
	
	/**
	 * Returns the document-level "focus" for the application states feature.
	 * The "focus" consists of a particular state within a particular state container.
	 * This feature is primarily used by design-time tools.
	 * @param {Element} rootNode  BODY element for document
	 * @returns {null|object}
	 *      return null if a search through document did not find any state containers
	 *      that claim to have the focus
	 *      if search finds at least one state container that claims to have focus,
	 *      then for first one encountered, return an object of form
	 *      { stateContainerNode:{Element}, state:{string} }
	 */
	getFocus: function(rootNode){
		if(!rootNode){
			return null;
		}
		var allStateContainerNodes = this.getAllStateContainers(rootNode);
		for(var i=0; i<allStateContainerNodes.length; i++){
			var maqAppStates = allStateContainerNodes[i]._maqAppStates;
			if(maqAppStates && maqAppStates.hasOwnProperty('focus')){
				return { stateContainerNode:allStateContainerNodes[i], state:maqAppStates.focus };
			}
		}
		return null;
	},

	/**
	 * Internal routine, calls by setState() if the "set focus" flag says that we should
	 * set the document-level "focus" to a particular state within a particular state container.
	 * This feature is primarily used by design-time tools.
	 * @param {null|undefined|string} state  If null|undefined, set focus to "Normal" state, else to "newState"
	 * @param {Element} node  Identifies state container.
	 */
	_setFocus: function(newState, node){
		if (!node || !node._maqAppStates) {
			return;
		}
		var rootNode = (node.ownerDocument && node.ownerDocument.body);
		if(!rootNode){
			return;
		}
		var currentFocus = this.getFocus(rootNode);
		if(currentFocus && currentFocus.stateContainerNode == node && currentFocus.state == newState){
			return;
		}
		var maqAppStates;
		var allStateContainerNodes = this.getAllStateContainers(rootNode);
		for(var i=0; i<allStateContainerNodes.length; i++){
			maqAppStates = allStateContainerNodes[i]._maqAppStates;
			if(maqAppStates){
				delete maqAppStates.focus;
			}
		}
		node._maqAppStates.focus = newState;
	},

//FIXME: Need to pass node into this routine
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
	 * Returns style values for the given node when a particular set of application states are active.
	 * The list of application states is passed in as an array.
	 * @param {Element} node
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
		for(var i=0; i<statesList.length; i++){
			var state = statesList[i];
			// return all styles specific to this state
			styleArray = node && node._maqDeltas && node._maqDeltas[state] && node._maqDeltas[state].style;
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
		if (!node || !name) { return; }
		
		if(node._maqDeltas && node._maqDeltas[state] && node._maqDeltas[state].style){
			var valueArray = node._maqDeltas[state].style;
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
		if (!node || !styleArray) { return; }
		
		node._maqDeltas = node._maqDeltas || {};
		node._maqDeltas[state] = node._maqDeltas[state] || {};
		node._maqDeltas[state].style = node._maqDeltas[state].style || [];
		
		// Remove existing entries that match any of entries in styleArray
		var oldArray = node._maqDeltas[state].style;
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
						newArray.push(o);
					}
				}
			}
		}
		if(oldArray && newArray){
			node._maqDeltas[state].style = oldArray.concat(newArray);
		}else if(oldArray){
			node._maqDeltas[state].style = oldArray;
		}else if(newArray){
			node._maqDeltas[state].style = newArray;
		}else{
			node._maqDeltas[state].style = undefined;
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
	_resetAndCacheNormalStyle: function(node, statesArray) {

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
				for(var k=0; k<normalStyleArray.length; k++){
					var nItem = normalStyleArray[k];
					for(var nProp in nItem){	// Should only be one prop
						var convertedName = this._convertStyleName(nProp);
						var style = node.style;
						var value = this._getFormattedValue(nProp, nItem[nProp])+'';
						var matches = value ? value.match(this.reImportant) : null;
						if(matches){	// if value includes !important
							var t = matches[1]+matches[3];
							t = lang.trim(t); // IE9 does not like spaces at the end of the value
							if(style.setProperty){
								style.setProperty(nProp, t, 'important');
							}else{
								node.style[convertedName] = t; 
							}
						}else{
							node.style[convertedName] = value;
						}
					}
				}
			}
		}
	},
	
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
		if (!node || !node._maqDeltas){
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
					var value = style[name]+'';
					var matches = value ? value.match(this.reImportant) : null;
					if(matches){	// if value includes !important
						var t = matches[1]+matches[3];
						t = lang.trim(t); // IE9 does not like spaces at the end of the value
						if(style.setProperty){
							style.setProperty(name, t, 'important');
						}else{
							node.style[convertedName] = t; 
						}
					}else{
						node.style[convertedName] = value;
					}
				}
			}
		}
		
		//FIXME: This is Dojo-specific. Other libraries are likely to need a similar hook.
		var dijitWidget, parent;
		if(node.id && node.ownerDocument){
			// TODO: referencing the global 'require' is not valid.  What's the right way to access this module?
			var byId = node.ownerDocument.defaultView./*require("dijit/registry")*/dijit.byId;
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
	},
	
	/**
	 * Returns true if the given node is an application state "container".
	 * Right now, only BODY can be such a container.
	 * @param {Element} node
	 * @returns {Boolean}
	 */
	isContainer: function(node) {
//FIXME: Need to generalize this for nested states
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
		return document.body;
	},
	
	/**
	 * Adds a state to the list of states declared by the node.
	 * Right now, node must by the BODY element.
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/added", callback).
	 * @param node {Element} State container node
	 * @param state {string} Name of state to add
	 * @param params [{object}] Optional parameters:
	 *    params.index - Splice the new state into the list of states at this position
	 */
	add: function(node, state, params){ 
		if (!node || this.hasState(node, state)) {
			//FIXME: This should probably be an error of some sort
			return;
		}
		var stateIndex = params && params.index;
		node._maqAppStates = node._maqAppStates || {};
		node._maqAppStates.states = node._maqAppStates.states || [];
		if(typeof stateIndex == 'number' && stateIndex >= 0){
			node._maqAppStates.states.splice(stateIndex, 0, state);
		}else{
			node._maqAppStates.states.push(state);
		}
		connect.publish("/davinci/states/state/added", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/** 
	 * Removes a state to the list of states declared by the node.
	 * Right now, node must by the BODY element.
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/removed", callback).
	 */
	remove: function(node, state){
		if (!node || !node._maqAppStates || !node._maqAppStates.states || !this.hasState(node, state)) {
			return;
		}
		var idx = node._maqAppStates.states.indexOf(state);
		if(idx < 0){
			return;
		}
		var currentState = this.getState(node);
		var body = node.ownerDocument.body;
		var statesFocus = this.getFocus(body);
		node._maqAppStates.states.splice(idx, 1);
		var params = {};
		if(statesFocus && statesFocus.stateContainerNode == node && statesFocus.state == state){
			params.focus = true;
			params.updateWhenCurrent = true;
		}
		if (state == currentState) {
			this.setState(undefined, node, params);
		}
		connect.publish("/davinci/states/state/removed", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/**
	 * Renames a state in the list of states declared by the widget.
	 * Subscribe using connect.subscribe("/davinci/states/renamed", callback).
	 * @param {Element} stateContainerNode  A DOM element that is a state container node (i.e., has _maqAppStates property)
	 * @param {object} params  Various params:
	 *    params.oldName {string} old state name (i.e., state name to change)
	 *    params.newName {string} new state name
	 * @returns {boolean}  Return true with success, false if failure
	 */
	rename: function(stateContainerNode, params){
		if(!params){
			return false;
		}
		var oldName = params.oldName;
		var newName = params.newName;
		if (!stateContainerNode || !stateContainerNode._maqAppStates || 
				!stateContainerNode._maqAppStates.states || !stateContainerNode._maqAppStates.states.length){
			return false;
		}
		var states = stateContainerNode._maqAppStates.states;
		if(states.indexOf(oldName) < 0 || states.indexOf(newName) >= 0){
			return false;
		}
		states.splice(states.indexOf(oldName), 1, newName);
		if(stateContainerNode._maqAppStates.focus === oldName){
			stateContainerNode._maqAppStates.focus = newName;
		}
		if(stateContainerNode._maqAppStates.current === oldName){
			stateContainerNode._maqAppStates.current = newName;
		}
		
		var nodes = [stateContainerNode];
		var currentState = this.getState(stateContainerNode);
		nodes = nodes.concat(this._getChildrenOfNode(stateContainerNode));
		while (nodes.length) {
			var node = nodes.shift();
			if(node._maqDeltas && node._maqDeltas[oldName]){
				node._maqDeltas[newName] = node._maqDeltas[oldName];
				delete node._maqDeltas[oldName];
			}
			nodes = nodes.concat(this._getChildrenOfNode(node));
			var statesArray = this.getStatesArray(node, null, newName, stateContainerNode);
			this._update(node, statesArray);
			this._updateSrcState (node);
		}
		connect.publish("/davinci/states/state/renamed", [{node:node, oldName:oldName, newName:newName, stateContainerNode:node }]);
		return true;
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
	 * Call JSON stringify on an object, make sure
	 * all single quotes are escaped and replace double-quotes with single quotes
	 */
	stringifyWithQuotes: function(o){
		str = JSON.stringify(o);
		// Escape single quotes that aren't already escaped
		str = str.replace(/(\\)?'/g, function($0, $1){ 
			return $1 ? $0 : "\\'";
		});
		// Replace double quotes with single quotes
		str = str.replace(/"/g, "'");
		return str;
	},
	
	/**
	 * Convert the _maqAppStates and _maqDeltas properties on the given node into JSON-encoded strings.
	 * @param {Element} node
	 * @returns {object}  Object of form {maqAppStates:<string>,maqDeltas:<string>} 
	 *                    where both maqAppStates and maqDeltas are included in object 
	 *                    only if respective property is on the node
	 */
	serialize: function(node) {
		var that = this;
		var munge = function(propval){
			var str = null;
			if(node[propval]){
				var o = require("dojo/_base/lang").clone(node[propval]);
				delete o["undefined"];
				if (!that._isEmpty(o)) {
					str = this.stringifyWithQuotes(o);
				}
			}
			return str;
		}.bind(this);
		var obj = {};
		if (!node){
			return obj;
		}
		var maqAppStates = munge('_maqAppStates');
		if(typeof maqAppStates == 'string'){
			obj.maqAppStates = maqAppStates;
		}
		var maqDeltas = munge('_maqDeltas');
		if(typeof maqDeltas == 'string'){
			obj.maqDeltas = maqDeltas;
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
			if(state){
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
				if(s != 'current'){
					statesArray.push(s);
				}
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
	 * @param maqAppStates   the string value of the list of states attribute
	 * @param maqDeltas   the string value of the property deltas for various states
	 */
	store: function(node, maqAppStates, maqDeltas) {
		if (!node){
			return;
		}
		this.clear(node);
//FIXME: Generalize for nested state containers?
		var isBody = (node.tagName == 'BODY');
		if(maqAppStates){
			node._maqAppStates = this.deserialize(maqAppStates, {isBody:isBody});
		}
		if(maqDeltas){
			node._maqDeltas = this.deserialize(maqDeltas, {isBody:isBody});
		}
		connect.publish("/davinci/states/stored", []);
	},
	
	/**
	 * Returns the string value of the attribute that holds node-specific states information (dvStates)
	 * @param {Element} node  
	 * @returns {object}  Object with two props, defs:{string|null} and deltas:{string|null},
	 *                    which hold DELTAS and DEFS attribute values, respectively
	 */
	retrieve: function(node) {
		if (!node){
			return;
		}
		var maqAppStates_attribute = node.getAttribute(this.APPSTATES_ATTRIBUTE);
		if(!maqAppStates_attribute && node.tagName === 'BODY'){
			// Previous versions used different attribute name (ie, 'dvStates')
			maqAppStates_attribute = node.getAttribute(this.APPSTATES_ATTRIBUTE_P6);
		}
		var maqDeltas_attribute = node.getAttribute(this.DELTAS_ATTRIBUTE);
		if(!maqDeltas_attribute && node.tagName !== 'BODY'){
			// Previous versions used different attribute name (ie, 'dvStates')
			maqDeltas_attribute = node.getAttribute(this.DELTAS_ATTRIBUTE_P6);
		}
		return {maqAppStates:maqAppStates_attribute, maqDeltas:maqDeltas_attribute};
	},

	/**
	 * Removes the states property on the given node
	 * @param {Element} node  
	 */
	clear: function(node) {
		if (!node) return;
		if (node._maqAppStates) { // IE8
			delete node._maqAppStates;
		}
		if (node._maqDeltas) { // IE8
			delete node._maqDeltas;
		}
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
			darray.forEach(text.split(";"), function(s){
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
	 * Store original element.style values into node._maqAppStates['undefined'].style
	 * Called by _preserveStates
	 * @param node  
	 * @param {String} elemStyle  element.style string
	 */
	transferElementStyle: function(node, elemStyle) {
		if(node){
			var states = node._maqDeltas;
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
	
	/**
	 * Returns true if AppStates.js should run its initialization logic.
	 * If an editor that embeds this routine (e.g., the Maqetta page editor)
	 * provides its own alternate initialization logic, then the editor
	 * needs to set davinci.AppStatesDontInitialize to true before
	 * AppStates.js is loaded and initialized.
	 */
	shouldInitialize: function() {
		return !davinci.AppStatesDontInitialize;
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
			connect.subscribe("/maqetta/appstates/state/changed", this, function(e) { 
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
					var statesArray = this.getStatesArray(child, e.oldState, e.newState, e.stateContainerNode);
					davinci.states._update(child, statesArray);
				}
			});
			
			this.subscribed = true;
		}
	}
};

//FIXME: remove all references to davinci global and davinci.states
if (typeof davinci === "undefined") { davinci = {}; }
var singleton = davinci.states = new States();

(function(){

	singleton.initialize();
	
	if (singleton.shouldInitialize()) {
	
		// Patch the dojo parse method to preserve states data
		if (typeof require != "undefined") {
			require(["dojo/_base/lang", "dojo/query", "dojo/aspect"], function(lang, query, aspect) {
				var count = 0,
					alreadyHooked = false;

				// hook main dojo/parser (or dojox.mobile.parser, which also defines a parse method)
				var hook = function(parser) {
					if(!alreadyHooked){
						// Note that Dojo parser can be called multiple times at document load time
						// where it parses different components of the document -- not all of the
						// document is parsed with that first call to the parser. As a result,
						// we might end up calling _restoreStates() multiple time for the same 
						// particular document fragments, and reassigning the "states" property
						// multiple times, but otherwise Dojo might wipe out the previously installed
						// "states" property.
						aspect.around(parser, "parse", function(parse) {
							var cache = {};
							return function(rootNode, args) {
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
						});
						dojo.parser.parse = parser.parse; // for backwards compatibility
						alreadyHooked = true;
					}
				};

				try {
					var parser = require("dojox/mobile/parser");
					hook.apply(parser);
				} catch(e) {
					// only include the regular parser if the mobile parser isn't available
				}

				if(!parser) {
					hook.call(null, dparser);
				}

				/**
				 * Preserve states specified on widgets.
				 * Invoked from code above that wraps the dojo parser such that
				 * dojo parsing is sandwiched between calls to _preserveStates and _restoreStates.
				 */
				var _preserveStates = function (cache) {
					var prefix = 'maqTempClass';
					var doc = singleton.getDocument();
	
					// Preserve the body states directly on the dom node
					if(!doc.body._maqAlreadyPreserved){
						var statesAttributes = davinci.states.retrieve(doc.body);
						if (statesAttributes && statesAttributes.maqAppStates) {
							cache.body = statesAttributes.maqAppStates;
						}
						doc.body._maqAlreadyPreserved = true;
					}
	
					// Preserve states of children of body in the cache
					//FIXME: why can't we just query for nodes that have this.DELTAS_ATTRIBUTE?
					query("*", doc).forEach(function(node){
						// Because Dojo parser gets called recursively (multiple times), 
						// but preserveStates/restoreStates go through entire document,
						// The second part of the check, className.indexOf(), is there because 
						// an earlier pass of the parser might have replaced the node, 
						// and therefore the _maqAlreadyPreserved flag would be lost.
						var className = node.getAttribute('class') 
						if(!className){
							className = '';
						}
						if(!node._maqAlreadyPreserved && className.indexOf(prefix)<0){
							node._maqAlreadyPreserved = true;
							var statesAttributes = singleton.retrieve(node);
							if (node.tagName != "BODY" && statesAttributes && (statesAttributes.maqAppStates || statesAttributes.maqDeltas)) {
								var tempClass = prefix+count;
								className = className + ' ' + tempClass;
								node.setAttribute('class', className);
								count++;
								cache[tempClass] = {};
								if(statesAttributes.maqAppStates){
									cache[tempClass].maqAppStates = statesAttributes.maqAppStates;
								}
								if(statesAttributes.maqDeltas){
									cache[tempClass].maqDeltas = statesAttributes.maqDeltas;
								}
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
						currentStateCache = [],
						maqAppStatesString, maqDeltasString, maqAppStates, maqDeltas;
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
							maqAppStatesString = maqDeltasString = maqAppStates = maqDeltas = null;
							if(isBody){
								maqAppStatesString = cache[id];
							}else{
								maqAppStatesString = cache[id].maqAppStates;
								maqDeltasString = cache[id].maqDeltas;
							}
							if(maqAppStatesString){
								maqAppStates = singleton.deserialize(maqAppStatesString, {isBody:isBody});
							}
							if(maqDeltasString){
								maqDeltas = singleton.deserialize(maqDeltasString, {isBody:isBody});
							}
							if(maqAppStates){
								if(maqAppStates.initial){
									// If user defined an initial state, then set current to that state
									maqAppStates.current = maqAppStates.initial;
								}else{
									if(maqAppStates.focus){
										// Can't have focus on a state that isn't current
										delete maqAppStates.focus; 
									}
									// Otherwise, delete any current state so that we will be in Normal state by default
									delete maqAppStates.current;
								}
							}
							singleton.store(node, maqAppStates, maqDeltas);
							if(maqDeltasString){
								//FIXME: maybe not be general enough
								davinci.states.transferElementStyle(node, cache[id].style);
							}
						}
					}
					
					// Call setState() on all of the state containers that have non-default
					// values for their current state (which was set to initial state earlier
					// in this routine).
					var allStateContainers = singleton.getAllStateContainers(doc.body);
					var statesInfo = [];
					for(var i=0; i<allStateContainers.length; i++){
						var stateContainer = allStateContainers[i];
						if(stateContainer._maqAppStates && typeof stateContainer._maqAppStates.current == 'string'){
							var focus = stateContainer._maqAppStates.focus;
							singleton.setState(stateContainer._maqAppStates.current, stateContainer, {updateWhenCurrent:true, focus:focus});
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
					args.node.ownerDocument.defaultView./*require("dijit/registry")*/dijit.byId);
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

