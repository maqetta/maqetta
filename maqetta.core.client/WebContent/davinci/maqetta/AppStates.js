define(["dojo/_base/connect", "dojo/dom-style", "dojo/dom", "require"], function(connect, domStyle, dom, require){

var States = function(){};
States.prototype = {

	NORMAL: "Normal",
	ATTRIBUTE: "dvStates",

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
		return !!(node && node.states && node.states[state] && node.states[state].origin);
	},

	/**
	 * Returns the current state for the current node.
	 * Right now, node must be either empty (null|undefined) or be the BODY node.
	 * FIXME: Right now the node parameter is useless since things only
	 * work if you pass in null|undefined or BODY, and null|undefined are equiv to BODY.
	 */
	getState: function(node){ 
		node = this._getWidgetNode(node);
		return node && node.states && node.states.current;
	},
	
	/**
	 * Trigger updates to the given node based on the given "newState".  
	 * This gets called for every node that is affected by a change in the given state.
	 * This routine doesn't actually do any updates; instead, updates happen
	 * by publishing a /davinci/states/state/changed event, which indirectly causes
	 * the _update() routine to be called for the given node.
	 * 
	 * @param {null|undefined|Element} node  If not null|undefined, must by BODY
	 * @param {null|undefined|string} newState  If null|undefined, switch to "Normal" state, else to "newState"
	 * @param {boolean} updateWhenCurrent  Force update logic to run even if newState is same as current state
	 * @param {boolean} _silent  If true, don't broadcast the state change via /davinci/states/state/changed
	 * 
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/changed", callback).
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
		if (!node || !node.states || (!updateWhenCurrent && node.states.current == newState)) {
			return;
		}
		var oldState = node.states.current;
		
		if (this.isNormalState(newState)) {
			if (!node.states.current) { return; }
			delete node.states.current;
			newState = undefined;
		} else {
			//FIXME: For time being, only the BODY holds states.current.
			if(node.tagName == 'BODY'){
				node.states.current = newState;
			}else{
				delete node.states.current;
			}
		}
		if (!_silent) {
			connect.publish("/davinci/states/state/changed", [{node:node, newState:newState, oldState:oldState}]);
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
	 * Returns style values for the given node and the given application "state".
	 * If "name" is provided, then only those style values for the given property are return.
	 * If "name" is not provided, then all style values are returns.
	 * @param {Element} node
	 * @param {string} state
	 * @param {string} name
	 * @returns {Array} An array of objects, where each object has a single propname:propvalue.
	 *		For example, [{'display':'none'},{'color':'red'}]
	 */
	getStyle: function(node, state, name) {
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
		
		if(node.states && node.states[state] && node.states[state].style){
			var valueArray = node.states[state].style;
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
	 * by publishing a /davinci/states/state/changed event, which indirectly causes
	 * the _update() routine to be called for the given node.
	 * @param {Element} node
	 * @param {string} state
	 * @param {Array} styleArray  List of CSS styles to apply to this node for the given "state".
	 * 		This is an array of objects, where each object specifies a single propname:propvalue.
	 * 		eg. [{'display':'none'},{'color':'red'}]
	 * @param {boolean} _silent  If true, don't broadcast the state change via /davinci/states/state/changed
	 */
	setStyle: function(node, state, styleArray, silent) {
		node = this._getWidgetNode(node);

		if (!node || !styleArray) { return; }
		
		node.states = node.states || {};
		node.states[state] = node.states[state] || {};
		node.states[state].style = node.states[state].style || [];
		
		// Remove existing entries that match any of entries in styleArray
		var oldArray = node.states[state].style;
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
			node.states[state].style = oldArray.concat(newArray);
		}else if(oldArray){
			node.states[state].style = oldArray;
		}else if(newArray){
			node.states[state].style = newArray;
		}else{
			node.states[state].style = undefined;
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
	 * Utility routine to clean up styling on a given "node"
	 * to reset CSS properties for "Normal" state.
	 * First, remove any properties that were defined for "oldState".
	 * Then, add properties defined for Normal state.
	 * @param {Element} node
	 * @param {string} oldState
	 */
	_resetAndCacheNormalStyle: function(node, oldState) {
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
	},
	
	/**
	 * Updates CSS properties for the given node due to a transition
	 * from application state "oldState" to "newState".
	 * Called indirectly when the current state changes (via a setState call)
	 * from code that listens to event /davinci/states/state/changed
	 * @param {Element} node
	 * @param {string} oldState
	 * @param {string} newState
	 */
	_update: function(node, oldState, newState) {
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
		node.states = node.states || {};
		node.states[state] = node.states[state] || {};
		node.states[state].origin = true;
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
		if (!node || !this.hasState(node, state)) {
			return;
		}
		
		var currentState = this.getState(node);
		if (state == currentState) {
			this.setState(node, undefined);
		}
		
		delete node.states[state].origin;
		if (this._isEmpty(node.states[state])) {
			delete node.states[state];
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
		node.states[newName] = node.states[oldName];
		delete node.states[oldName];
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
			if(node.states && node.states[state] && node.states[state].style && typeof node.states[state].style.display == "string"){
				return node.states[state].style.display != "none";
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
	 * Convert the states object on the given node into a JSON-encoded string.
	 * @param {Element} node
	 * @returns {string}
	 */
	serialize: function(node) {
		if (!node){
			return;
		}
		var value = "";
		if (node.states) {
			var states = require("dojo/_base/lang").clone(node.states);
			delete states["undefined"];
			if (!this._isEmpty(states)) {
				value = JSON.stringify(states);
				// Escape single quotes that aren't already escaped
				value = value.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? $0 : "\\'";
				});
				// Replace double quotes with single quotes
				value = value.replace(/"/g, "'");
			}
		}
		return value;
	},

	/**
	 * Convert a string representation of widget-specific states information into a JavaScript object
	 * using JSON.parse.
	 * The string representation is typically the value of the this.ATTRIBUTE (dvStates)
	 * @param states  string representation of widget-specific states information
	 * @return {object}  JavaScript result from JSON.parse
	 */
	deserialize: function(states) {
		if (typeof states == "string") {
			// Replace unescaped single quotes with double quotes, unescape escaped single quotes
			states = states.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? "'" : '"';
			});
			states = JSON.parse(states);
			this._upgrade_p4_p5(states);	// Upgrade old files
		}
		return states;
	},
	
	/**
	 * The format of the states attribute (this.ATTRIBUTE = 'dvStates') changed
	 * from Preview4 to Preview5. This routine upgrades the states object in place
	 * from Preview4 or earlier data structure into data structure used by Preview 5.
	 * @param {object} states  "states" object that might be in Preview4 format
	 */
	_upgrade_p4_p5: function(states){
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
	 * Stuffs a JavaScript property (the states object) onto the given node.
	 * @param {Element} node  
	 * @param states   the string value of the node-specific states information.
	 * 				This is the string that is stuffed into the attribute that 
	 * 				holds widget-specific states information (dvStates)
	 */
	store: function(node, states) {
		if (!node || !states){
			return;
		}
		this.clear(node);
		//FIXME: Shouldn't be stuffing a property with such a generic name ("states") onto DOM elements
		node.states = states = this.deserialize(states);
		connect.publish("/davinci/states/stored", [{node:node, states:states}]);
	},
	
	/**
	 * Returns the string value of the attribute that holds node-specific states information (dvStates)
	 * @param {Element} node  
	 * @returns {string}  String value for the attribute, or unspecified|null if no such widget or attribute
	 */
	retrieve: function(node) {
		if (!node){
			return;
		}
		
		// FIXME: Maybe this check between page editor and runtime should be factored out
		var states = node.getAttribute(this.ATTRIBUTE);
		return states;
	},

	/**
	 * Removes the states property on the given node
	 * @param {Element} node  
	 */
	clear: function(node) {
		if (!node || !node.states) return;
		var states = node.states;
		delete node.states;
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
	 * Store original element.style values into node.states['undefined'].style
	 * Called by _preserveStates
	 * @param node  
	 * @param {String} elemStyle  element.style string
	 */
	transferElementStyle: function(node, elemStyle) {
		if(node){
			var states = node.states;
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
			connect.subscribe("/davinci/states/state/changed", function(e) { 
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
					davinci.states._update(child, e.oldState, e.newState);
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
						dojo.parser.parse = function() {
							_preserveStates(cache);
							var results = parse.apply(this, arguments);
							_restoreStates(cache);
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
						var states = davinci.states.retrieve(doc.body);
						if (states) {
							cache.body = states;
						}
						doc.body._maqAlreadyPreserved = true;
					}
	
					// Preserve states of children of body in the cache
					//FIXME: why can't we just query for nodes that have this.ATTRIBUTE?
					query("*", doc).forEach(function(node){
						// Because Dojo parser gets called recursively (multiple times), 
						// but preserveStates/restoreStates go through entire document,
						// make sure the current node hasn't already been preserved
						if(!node._maqAlreadyPreserved){
							node._maqAlreadyPreserved = true;
							var states = singleton.retrieve(node);
							if (states) {
								if (node.tagName != "BODY") {
									var tempClass = prefix+count;
									node.className = node.className + ' ' + tempClass;
									count++;
									cache[tempClass] = {states: states};
									if(node.style){
										cache[tempClass].style = node.style.cssText;
									}else{
										// Shouldn't be here
										console.error('States.js _preserveStates. No value for node.style.')
									}
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
				var _restoreStates = function (cache) {
					var doc = singleton.getDocument(),
						currentStateCache = [];
					for(var id in cache){
						var node;
						if(id == 'body'){
							node = doc.body;
						}else{
							node = doc.querySelectorAll('.'+id)[0];
							if(node){
								node.className = node.className.replace(' '+id,'');
							}
							
						}
						if (!node) {
							console.error("States: Failed to get node by id: ", id);
						}
						// BODY node has app states directly on node.states. All others have it on node.states.style.
						var states = singleton.deserialize(node.tagName == 'BODY' ? cache[id] : cache[id].states);
						delete states.current; // FIXME: Always start in normal state for now, fix in 0.7
						singleton.store(node, states);
						if(node.tagName != 'BODY'){
							davinci.states.transferElementStyle(node, cache[id].style);
						}
						delete cache[id];
					}
				};
			});
		}
	}
})();

// Bind to watch for overlay widgets at runtime.  Dijit-specific, at this time
if (!davinci.Workbench && typeof dijit != "undefined"){
	connect.subscribe("/davinci/states/state/changed", function(args) {
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
