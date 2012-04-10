// Duplicate of workspace/maqetta/maqetta.js for use by page editor.
// Created this cloned version to overcome loader/build conflicts 
// if page editor and runtime (possibly) using different versions of Dojo

// Code below is looking for dojo at davinci.dojo. Don't ask why.

if ( typeof davinci === "undefined" ) { davinci = {}; }
require(["dojo/_base/connect"], function(connect){
davinci.dojo = dojo;

davinci.maqetta = davinci.maqetta || {};
davinci.maqetta.States = function(){};
davinci.maqetta.States.prototype = {

	NORMAL: "Normal",
	ATTRIBUTE: "dvStates",

	/**
	 * Returns the array of states declared by the widget, plus the implicit normal state. 
	 * Called by:
	 * 		EventSelection.js: _buildSelectionValues
	 * 		Context.js: _attachChildren
	 * 		Context.js: _restoreStates
	 * 		StatesView.js: _updateList
	 * 		StatesView.js: _hideShowToolBar
	 * 		(this routine): isVisible (indirect for VisualEditorOutline.js: isToggleOn)
	 */ 
	getStates: function(node, associative){
//console.trace();
		node = this._getWidget(node); 
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
	
	_getWidget: function(node) {
//console.trace();
		if (!node) {
			var doc = this.getDocument();
			node = doc && doc.body;
		}
		return node;
	},
	
	_updateSrcState: function (node)
	{
//console.trace();
	},
	
	/**
	 * Returns true if the node declares the state, false otherwise.
	 */
	hasState: function(node, state, property){ 
//console.trace();
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidget(node);
		return !!(node && node.states && node.states[state] && (property || node.states[state].origin));
	},

	/**
	 * Returns the current state of the widget.
	 * Called by:
	 * 		(this routine): normalizeArray
	 * 		(this routine): resetState
	 * 		(this routine): isVisible
	 * 		(this routine): initialize.subscribed
	 * 		StatesView.js: _updateSelection
	 *		VisualEditorOutline.js: _toggle
	 *		(anonymous function)States.js:208
	 *		StyleCommand.js: execute
	 */
	getState: function(node){ 
//console.trace();
		node = this._getWidget(node);
		return node && node.states && node.states.current;
	},
	
	/**
	 * Sets the current state of the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/changed", callback).
	 * Called by:
	 * 		(this routine): resetState
	 * 		StatesView.js: (anonymous:81)
	 * 		StatesView.js: (anonymous function)536 - many, many times
	 */
	setState: function(node, newState, updateWhenCurrent, _silent){
//console.trace();
		if (arguments.length < 2) {
			newState = arguments[0];
			node = undefined;
		}
		node = this._getWidget(node);
		if (!node || !node.states || (!updateWhenCurrent && node.states.current == newState)) {
			return;
		}
		var oldState = node.states.current;
		
		if (this.isNormalState(newState)) {
			if (!node.states.current) { return; }
			delete node.states.current;
			newState = undefined;
		} else {
			node.states.current = newState;
		}
		if (!_silent) {
			this.publish("/davinci/states/state/changed", [{node:node, newState:newState, oldState:oldState}]);
		}
		this._updateSrcState (node);
		
	},
	
	/**
	 * If the current state is not Normal, force a call to setState
	 * so that styling properties get reset for a subtree.
	 */
	resetState: function(node){
//console.trace();
		var currentState = this.getState(node.getContext().rootWidget);
		if(!this.isNormalState(currentState)){
			this.setState(node, currentState, true/*updateWhenCurrent*/, false /*silent*/);
		}		
	},
	
	isNormalState: function(state) {
		if (arguments.length == 0) {
			state = this.getState();
		}
		return !state || state == this.NORMAL;
	},
	
	/**
	 * Called by:
	 * 		(this routine): normalizeArrayStates (indirectly from _Widget.js:_styleText)
	 * 		(this routine): _update (indirectly/inherited from davinci.ve.States:_update)
	 * 		(this routine): _resetAndCacheNormalStyleStates.js
	 * @param widget
	 * @param state
	 * @param name
	 * @returns
	 */
	getStyle: function(node, state, name) {
//console.trace();
		var styleArray;
		node = this._getWidget(node);
		if (arguments.length == 1) {
			state = this.getState();
		}
		// return all styles specific to this state
		styleArray = node && node.states && node.states[state] && node.states[state].style;
		if (arguments.length > 2) {
			// Remove any properties that don't match 'name'
			if(styleArray){
				for(var j=styleArray.length-1; j>=0; j--){
					var item = styleArray[j];
					for(var prop in item){		// should be only one prop per item
						if(prop != name){
							styleArray.splice(j, 1);
							break;
						}
					}
				}
			}
		}
		return styleArray;
	},

	hasStyle: function(node, state, name) {
//console.trace();
		node = this._getWidget(node);

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
	 * Called by:
	 * 		VisualEditorOutline.js: _toggle
	 * 		(this routine): _resetAndCacheNormalStyle
	 * @param widget
	 * @param state
	 * @param name
	 * @returns
	 */
	setStyle: function(node, state, styleArray, silent) {
//console.trace();
		node = this._getWidget(node);

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
			this.publish("/davinci/states/state/style/changed", [{node:node, state:state, style:styleArray}]);
		}
		this._updateSrcState (node);
	},
	
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
	
	_resetAndCacheNormalStyle: function(node, styleArray, newState) {
//console.trace();
		var normalStyleArray = this.getStyle(node, undefined);
		
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

		// Remember style values from the normal state
		if (!this.isNormalState(newState)) {
			if(styleArray){
				for(var i=0; i<styleArray.length; i++){
					var style = styleArray[i];
					for (var name in style) {	// should only be one prop in each normalStyle
						if(!this.hasStyle(node, undefined, name)) {
							var convertedName = this._convertStyleName(name);
							var value = this._getFormattedValue(name, davinci.dojo.style(node, convertedName));
							var o = {};
							o[name] = value;
							this.setStyle(node, undefined, [o], true);
						}
					}
				}
			}
		}
	},
	
	_update: function(node, newState, oldState) {
//console.trace();
		node = this._getWidget(node);
		if (!node){
			return;
		}
		
		var styleArray = this.getStyle(node, newState);
		
		this._resetAndCacheNormalStyle(node, styleArray, newState);

		// Apply new style
		if(styleArray){
			for(var i=0; i<styleArray.length; i++){
				var style = styleArray[i];
				for (var name in style) {	// should be only one prop in style
					var convertedName = this._convertStyleName(name);
					//FIXME: Probably doesn't work with arrays
					davinci.dojo.style(node, convertedName, style[name]);
				}
			}
		}
		
		//FIXME: This is Dojo-specific. Other libraries are likely to need a similar hook.
		var dijitWidget, parent;
		if(node.id && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.dijit){
			dijitWidget = node.ownerDocument.defaultView.dijit.byId(node.id);
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
	
	getContainer: function() {
		return this._getWidget();
	},
	
	/**
	 * Adds a state to the list of states declared by the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/added", callback).
	 */
	add: function(node, state){ 
//console.trace();
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidget(node);
		if (!node || this.hasState(node, state)) {
			//FIXME: This should probably be an error of some sort
			return;
		}
		node.states = node.states || {};
		node.states[state] = node.states[state] || {};
		node.states[state].origin = true;
		this.publish("/davinci/states/state/added", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/** 
	 * Removes a state from the list of states declared by the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/removed", callback).
	 */
	remove: function(node, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidget(node);
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
		this.publish("/davinci/states/state/removed", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/**
	 * Renames a state in the list of states declared by the widget.
	 * Subscribe using davinci.states.subscribe("/davinci/states/renamed", callback).
	 */
	rename: function(node, oldName, newName, property){ 
		if (arguments.length < 3) {
			newName = arguments[1];
			oldName = arguments[0];
			node = undefined;
		}
		node = this._getWidget(node);
		if (!node || !this.hasState(node, oldName, property) || this.hasState(node, newName, property)) {
			return false;
		}
		node.states[newName] = node.states[oldName];
		delete node.states[oldName];
		if (!property) {
			this.publish("/davinci/states/state/renamed", [{node:node, oldName:oldName, newName:newName}]);
		}
		this._updateSrcState (node);
		return true;
	},

	/**
	 * Returns true if the widget is set to visible within the current state, false otherwise.
	 */ 
	isVisible: function(node, state){ 
//console.trace();
		if (arguments.length == 1) {
			state = this.getState();
		}
		node = this._getWidget(node);
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
	
	_isEmpty: function(object) {
		for (var name in object) {
			if (object.hasOwnProperty(name)) {
				return false;
			}
		}
		return true;
	},
	
	serialize: function(node) {
//console.trace();
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
	 * Called by:
	 * 		(this routine): store()
	 * 		Context.js: _attachChildren()
	 * 		(this routine): _restoreStates()
	 * @param states  string representation of widget-specific states information
	 * @return {object}  JavaScript result from JSON.parse
	 */
	deserialize: function(states) {
//console.trace();
		if (typeof states == "string") {
			// Replace unescaped single quotes with double quotes, unescape escaped single quotes
			states = states.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? "'" : '"';
			});
			states = JSON.parse(states);
			this._upgrate_p4_p5(states);	// Upgrade old files
		}
		return states;
	},
	
	_upgrate_p4_p5: function(states){
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
	 * Stuffs a JavaScript property (the states object) onto the "widget",
	 * which in page editor is a davinci.ve._Widget object, and when running directly in browser,
	 * is an Element DOM node.
	 * Called by:
	 * 		Context.js: _parse() - why ????
	 * 		Context.js: _restoreStates() - why ????
	 * @param widget  Pointer to widget. For page editor, it's a davinci.ve._Widget object.
	 * 		When actually running in browser outside of page editor, it's an Element DOM node.
	 * @param states   the string value of the widget-specific states information.
	 * 				This is the string that is stuffed into the attribute that 
	 * 				holds widget-specific states information (dvStates)
	 */
	store: function(node, states) {
//console.trace();
		if (!node || !states){
			return;
		}
		
		this.clear(node);
		//FIXME: Shouldn't be stuffing a property with such a generic name ("states") onto DOM elements
		node.states = states = this.deserialize(node);
		this.publish("/davinci/states/stored", [{node:node, states:states}]);
	},
	
	/**
	 * Returns the string value of the attribute that holds widget-specific states information (dvStates)
	 * Called by:
	 * 		(this routine): _preserveStates
	 * 		Context.js: _preserveStates
	 * @param widget  Pointer to widget. For page editor, it's a davinci.ve._Widget object.
	 * 		When actually running in browser outside of page editor, it's an Element DOM node.
	 * @returns {string}  String value for the attribute, or unspecified|null if no such widget or attribute
	 */
	retrieve: function(node) {
//console.trace();
		if (!node){
			return;
		}
		
		// FIXME: Maybe this check between page editor and runtime should be factored out
		var states = node.getAttribute(this.ATTRIBUTE);
		return states;
	},

	/**
	 * Removes the states property on the given widget
	 * Called by store().
	 * @param widget  A davinci.ve._Widget in page editor and an Element when running directly in browser
	 */
	clear: function(node) {
//console.trace();
		if (!node || !node.states) return;
		var states = node.states;
		delete node.states;
		this.publish("/davinci/states/cleared", [{node:node, states:states}]);
	},
	
	getDocument: function() {
		return document;
	},
	
	_shouldInitialize: function() {
//console.trace();
		var windowFrameElement = window.frameElement;
		var isDavinciEditor = top.davinci && top.davinci.Runtime && (!windowFrameElement || windowFrameElement.dvContext);
		return !isDavinciEditor;
	},

	publish: function(/*String*/ topic, /*Array*/ args) {
		try {
			return connect.publish(topic, args);
		} catch(e) {
			console.error(e);
		}
	},
	
	subscribe: function(/*String*/ topic, /*Object|null*/ context, /*String|Function*/ method){
		return connect.subscribe(topic, context, method);
	},
	
	unsubscribe: function(handle){
		return connect.unsubscribe(handle);
	}, 

	_getChildrenOfNode: function(node) {
		var children = [];
		node.children.forEach(function(child){
			children.push(child);
		});
		return children;
	},
	
	initialize: function() {
//console.trace();
	
		if (!this.subscribed && this._shouldInitialize()) {
		
			this.subscribe("/davinci/states/state/changed", function(e) { 
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
					davinci.states._update(child, e.newState, e.oldState);
				}
			});
			
			this.subscribed = true;
		}
	}
};

davinci.states = new davinci.maqetta.States();

(function(){

	if (davinci.states._shouldInitialize()) {
	
		davinci.states.initialize();
		
		// Patch the dojo parse method to preserve states data
		if (typeof require != "undefined") {
			require(["dojo/_base/lang", "dojo/query", "dojo/domReady!"], function(lang, query) {
				var cache = {}; // could be local to hook function?

				// hook main dojo.parser (or dojox.mobile.parser, which also
				// defines "dojo.parser" object)
				// Note: Uses global 'dojo' reference, which may not work in the future
				var hook = function(parser) {
					var parse = parser.parse;
					dojo.parser.parse = function() {
						_preserveStates(cache);
						var results = parse.apply(this, arguments);
						_restoreStates(cache);
						return results;
					};
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
//console.trace();
					var doc = davinci.states.getDocument();
	
					// Preserve the body states directly on the dom node
					var states = davinci.states.retrieve(doc.body);
					if (states) {
						davinci.states._upgrate_p4_p5(states);	// upgrade older files
						cache.body = states;
					}
	
					// Preserve states of children of body in the cache
					//FIXME: why can't we just query for nodes that have this.ATTRIBUTE?
					query("*", doc).forEach(function(node){
						var states = davinci.states.retrieve(node);
						if (states) {
							if (!node.id) {
								node.id = _getTemporaryId(node);
							}
							if (node.tagName != "BODY") {
								davinci.states._upgrate_p4_p5(states);	// upgrade older files
								cache[node.id] = states;
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
//console.trace();
					var doc = davinci.states.getDocument(),
						currentStateCache = [];
					for(var id in cache){
						var node = id == "body" ? doc.body : dojo.byId(id);
						if (!node) {
							console.error("States: Failed to get node by id: ", id);
						}
						var states = davinci.states.deserialize(cache[id]);
						delete states.current; // always start in normal state for runtime
						davinci.states.store(node, states);
					}
				};
					
				var _getTemporaryId = function (node) {
					if (!node || node.nodeType != 1) {	// 1== Element
						return undefined;
					}
					var type = (node.getAttribute("dojoType") || node.nodeName.toLowerCase());
					type = type ? type.replace(/\./g, "_") : "";
					return dijit.getUniqueId(type);
				};
			});
		}
	}
})();

/*FIXME: Temporarily comment out overlay widget logic

// Bind to watch for overlay widgets at runtime.  Dijit-specific, at this time
if (!davinci.Workbench && typeof dijit != "undefined"){
	davinci.states.subscribe("/davinci/states/state/changed", function(args) {
		var w;
		if (args.newState && !args.newState.indexOf("_show:")) {
			w = dijit.byId(args.newState.substring(6));
			w && w.show && w.show();
		} else if (args.oldState && !args.oldState.indexOf("_show:")) {
			w = dijit.byId(args.oldState.substring(6));
			w && w.hide && w.hide();
		}
	});
}
*/

});
