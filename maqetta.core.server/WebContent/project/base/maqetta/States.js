// Runtime version, used by preview-in-browser

// Various functions extracted from dojo for use in non-dojo environments
(function(){

	if (typeof davinci == "undefined") {
		davinci = {};
	}
	davinci.dojo = {};
	var d = davinci.dojo;
	
	/*=====
	davinci.dojo.doc = {
		// summary:
		//		Alias for the current document. 'davinci.dojo.doc' can be modified
		//		for temporary context shifting. Also see davinci.dojo.withDoc().
		// description:
		//    Refer to davinci.dojo.doc rather
		//    than referring to 'window.document' to ensure your code runs
		//    correctly in managed contexts.
		// example:
		// 	|	n.appendChild(davinci.dojo.doc.createElement('div'));
	}
	=====*/
	d.doc = window["document"] || null;
	d.global = window;
	
	var n = navigator;
	var dua = n.userAgent,
		dav = n.appVersion,
		tv = parseFloat(dav);

	if(dua.indexOf("Opera") >= 0){ d.isOpera = tv; }
	d.isWebKit = parseFloat(dua.split("WebKit/")[1]) || undefined;

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(document.all && !d.isOpera){
		d.isIE = parseFloat(dav.split("MSIE ")[1]) || undefined;
		//In cases where the page has an HTTP header or META tag with
		//X-UA-Compatible, then it is in emulation mode.
		//Make sure isIE reflects the desired version.
		//document.documentMode of 5 means quirks mode.
		//Only switch the value if documentMode's major version
		//is different from isIE's major version.
		var mode = document.documentMode;
		if(mode && mode != 5 && Math.floor(d.isIE) != mode){
			d.isIE = mode;
		}
	}
	//>>excludeEnd("webkitMobile");

	/*=====
	davinci.dojo.byId = function(id, doc){
		//	summary:
		//		Returns DOM node with matching `id` attribute or `null`
		//		if not found. If `id` is a DomNode, this function is a no-op.
		//
		//	id: String|DOMNode
		//	 	A string to match an HTML id attribute or a reference to a DOM Node
		//
		//	doc: Document?
		//		Document to work in. Defaults to the current value of
		//		davinci.dojo.doc.  Can be used to retrieve
		//		node references from other documents.
		//
		//	example:
		//	Look up a node by ID:
		//	|	var n = davinci.dojo.byId("foo");
		//
		//	example:
		//	Check if a node exists, and use it.
		//	|	var n = davinci.dojo.byId("bar");
		//	|	if(n){ doStuff() ... }
		//
		//	example:
		//	Allow string or DomNode references to be passed to a custom function:
		//	|	var foo = function(nodeOrId){
		//	|		nodeOrId = davinci.dojo.byId(nodeOrId);
		//	|		// ... more stuff
		//	|	}
	=====*/

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(d.isIE || d.isOpera){
		d.byId = function(id, doc){
			if(typeof id != "string"){
				return id;
			}
			var _d = doc || d.doc, te = _d.getElementById(id);
			// attributes.id.value is better than just id in case the 
			// user has a name=id inside a form
			if(te && (te.attributes.id.value == id || te.id == id)){
				return te;
			}else{
				var eles = _d.all[id];
				if(!eles || eles.nodeName){
					eles = [eles];
				}
				// if more than 1, choose first with the correct id
				var i=0;
				while((te=eles[i++])){
					if((te.attributes && te.attributes.id && te.attributes.id.value == id)
						|| te.id == id){
						return te;
					}
				}
			}
		};
	}else{
	//>>excludeEnd("webkitMobile");
		d.byId = function(id, doc){
			// inline'd type check
			return (typeof id == "string") ? (doc || d.doc).getElementById(id) : id; // DomNode
		};
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	}
	//>>excludeEnd("webkitMobile");
	
		// Although we normally eschew argument validation at this
	// level, here we test argument 'node' for (duck)type,
	// by testing nodeType, ecause 'document' is the 'parentNode' of 'body'
	// it is frequently sent to this function even 
	// though it is not Element.
	var gcs;
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(d.isWebKit){
	//>>excludeEnd("webkitMobile");
		gcs = function(/*DomNode*/node){
			var s;
			if(node.nodeType == 1){
				var dv = node.ownerDocument.defaultView;
				s = dv.getComputedStyle(node, null);
				if(!s && node.style){
					node.style.display = "";
					s = dv.getComputedStyle(node, null);
				}
			}
			return s || {};
		};
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	}else if(d.isIE){
		gcs = function(node){
			// IE (as of 7) doesn't expose Element like sane browsers
			return node.nodeType == 1 /* ELEMENT_NODE*/ ? node.currentStyle : {};
		};
	}else{
		gcs = function(node){
			return node.nodeType == 1 ?
				node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
		};
	}
	//>>excludeEnd("webkitMobile");
	d.getComputedStyle = gcs;

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(!d.isIE){
	//>>excludeEnd("webkitMobile");
		d._toPixelValue = function(element, value){
			// style values can be floats, client code may want
			// to round for integer pixels.
			return parseFloat(value) || 0;
		};
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	}else{
		d._toPixelValue = function(element, avalue){
			if(!avalue){ return 0; }
			// on IE7, medium is usually 4 pixels
			if(avalue == "medium"){ return 4; }
			// style values can be floats, client code may
			// want to round this value for integer pixels.
			if(avalue.slice && avalue.slice(-2) == 'px'){ return parseFloat(avalue); }
			with(element){
				var sLeft = style.left;
				var rsLeft = runtimeStyle.left;
				runtimeStyle.left = currentStyle.left;
				try{
					// 'avalue' may be incompatible with style.left, which can cause IE to throw
					// this has been observed for border widths using "thin", "medium", "thick" constants
					// those particular constants could be trapped by a lookup
					// but perhaps there are more
					style.left = avalue;
					avalue = style.pixelLeft;
				}catch(e){
					avalue = 0;
				}
				style.left = sLeft;
				runtimeStyle.left = rsLeft;
			}
			return avalue;
		}
	}
	//>>excludeEnd("webkitMobile");
	var px = d._toPixelValue;

	// FIXME: there opacity quirks on FF that we haven't ported over. Hrm.
	/*=====
	davinci.dojo._getOpacity = function(node){
			//	summary:
			//		Returns the current opacity of the passed node as a
			//		floating-point value between 0 and 1.
			//	node: DomNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for speed reasons.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	var astr = "DXImageTransform.Microsoft.Alpha";
	var af = function(n, f){
		try{
			return n.filters.item(astr);
		}catch(e){
			return f ? {} : null;
		}
	};

	//>>excludeEnd("webkitMobile");
	d._getOpacity =
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		d.isIE ? function(node){
			try{
				return af(node).Opacity / 100; // Number
			}catch(e){
				return 1; // Number
			}
		} :
	//>>excludeEnd("webkitMobile");
		function(node){
			return gcs(node).opacity;
		};

	/*=====
	davinci.dojo._setOpacity = function(node, opacity){
			//	summary:
			//		set the opacity of the passed node portably. Returns the
			//		new opacity of the node.
			//	node: DOMNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for performance reasons.
			//	opacity: Number
			//		A Number between 0 and 1. 0 specifies transparent.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/

	d._setOpacity =
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		d.isIE ? function(/*DomNode*/node, /*Number*/opacity){
			var ov = opacity * 100, opaque = opacity == 1;
			node.style.zoom = opaque ? "" : 1;

			if(!af(node)){
				if(opaque){
					return opacity;
				}
				node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
			}else{
				af(node, 1).Opacity = ov;
			}

			// on IE7 Alpha(Filter opacity=100) makes text look fuzzy so disable it altogether (bug #2661),
			//but still update the opacity value so we can get a correct reading if it is read later.
			af(node, 1).Enabled = !opaque;

			if(node.nodeName.toLowerCase() == "tr"){
				d.query("> td", node).forEach(function(i){
					d._setOpacity(i, opacity);
				});
			}
			return opacity;
		} :
		//>>excludeEnd("webkitMobile");
		function(node, opacity){
			return node.style.opacity = opacity;
		};

	var _pixelNamesCache = {
		left: true, top: true
	};
	var _pixelRegExp = /margin|padding|width|height|max|min|offset/;  // |border
	var _toStyleValue = function(node, type, value){
		type = type.toLowerCase(); // FIXME: should we really be doing string case conversion here? Should we cache it? Need to profile!
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(d.isIE){
			if(value == "auto"){
				if(type == "height"){ return node.offsetHeight; }
				if(type == "width"){ return node.offsetWidth; }
			}
			if(type == "fontweight"){
				switch(value){
					case 700: return "bold";
					case 400:
					default: return "normal";
				}
			}
		}
		//>>excludeEnd("webkitMobile");
		if(!(type in _pixelNamesCache)){
			_pixelNamesCache[type] = _pixelRegExp.test(type);
		}
		return _pixelNamesCache[type] ? px(node, value) : value;
	};

	var _floatStyle = d.isIE ? "styleFloat" : "cssFloat",
		_floatAliases = { "cssFloat": _floatStyle, "styleFloat": _floatStyle, "float": _floatStyle }
	;

	// public API

	d.style = function(	/*DomNode|String*/ node,
							/*String?|Object?*/ style,
							/*String?*/ value){
		//	summary:
		//		Accesses styles on a node. If 2 arguments are
		//		passed, acts as a getter. If 3 arguments are passed, acts
		//		as a setter.
		//	description:
		//		Getting the style value uses the computed style for the node, so the value
		//		will be a calculated value, not just the immediate node.style value.
		//		Also when getting values, use specific style names,
		//		like "borderBottomWidth" instead of "border" since compound values like
		//		"border" are not necessarily reflected as expected.
		//		If you want to get node dimensions, use `davinci.dojo.marginBox()`, 
		//		`davinci.dojo.contentBox()` or `davinci.dojo.position()`.
		//	node:
		//		id or reference to node to get/set style for
		//	style:
		//		the style property to set in DOM-accessor format
		//		("borderWidth", not "border-width") or an object with key/value
		//		pairs suitable for setting each property.
		//	value:
		//		If passed, sets value on the node for style, handling
		//		cross-browser concerns.  When setting a pixel value,
		//		be sure to include "px" in the value. For instance, top: "200px".
		//		Otherwise, in some cases, some browsers will not apply the style.
		//	example:
		//		Passing only an ID or node returns the computed style object of
		//		the node:
		//	|	davinci.dojo.style("thinger");
		//	example:
		//		Passing a node and a style property returns the current
		//		normalized, computed value for that property:
		//	|	davinci.dojo.style("thinger", "opacity"); // 1 by default
		//
		//	example:
		//		Passing a node, a style property, and a value changes the
		//		current display of the node and returns the new computed value
		//	|	davinci.dojo.style("thinger", "opacity", 0.5); // == 0.5
		//
		//	example:
		//		Passing a node, an object-style style property sets each of the values in turn and returns the computed style object of the node:
		//	|	davinci.dojo.style("thinger", {
		//	|		"opacity": 0.5,
		//	|		"border": "3px solid black",
		//	|		"height": "300px"
		//	|	});
		//
		// 	example:
		//		When the CSS style property is hyphenated, the JavaScript property is camelCased.
		//		font-size becomes fontSize, and so on.
		//	|	davinci.dojo.style("thinger",{
		//	|		fontSize:"14pt",
		//	|		letterSpacing:"1.2em"
		//	|	});
		//
		//	example:
		//		davinci.dojo.NodeList implements .style() using the same syntax, omitting the "node" parameter, calling
		//		davinci.dojo.style() on every element of the list. See: `davinci.dojo.query()` and `davinci.dojo.NodeList()`
		//	|	davinci.dojo.query(".someClassName").style("visibility","hidden");
		//	|	// or
		//	|	davinci.dojo.query("#baz > div").style({
		//	|		opacity:0.75,
		//	|		fontSize:"13pt"
		//	|	});

		var n = d.byId(node), args = arguments.length, op = (style == "opacity");
		style = _floatAliases[style] || style;
		if(args == 3){
			return op ? d._setOpacity(n, value) : n.style[style] = value; /*Number*/
		}
		if(args == 2 && op){
			return d._getOpacity(n);
		}
		var s = gcs(n);
		if(args == 2 && typeof style != "string"){ // inline'd type check
			for(var x in style){
				d.style(node, x, style[x]);
			}
			return s;
		}
		return (args == 1) ? s : _toStyleValue(n, style, s[style] || n.style[style]); /* CSS2Properties||String||Number */
	};
	
		d._listener = {
		// create a dispatcher function
		getDispatcher: function(){
			// following comments pulled out-of-line to prevent cloning them 
			// in the returned function.
			// - indices (i) that are really in the array of listeners (ls) will 
			//   not be in Array.prototype. This is the 'sparse array' trick
			//   that keeps us safe from libs that take liberties with built-in 
			//   objects
			// - listener is invoked with current scope (this)
			return function(){
				var ap=Array.prototype, c=arguments.callee, ls=c._listeners, t=c.target;
				// return value comes from original target function
				var r = t && t.apply(this, arguments);
				// make local copy of listener array so it is immutable during processing
				var i, lls;
				lls = [].concat(ls);

				// invoke listeners after target function
				for(i in lls){
					if(!(i in ap)){
						lls[i].apply(this, arguments);
					}
				}
				// return value comes from original target function
				return r;
			};
		},
		// add a listener to an object
		add: function(/*Object*/ source, /*String*/ method, /*Function*/ listener){
			// Whenever 'method' is invoked, 'listener' will have the same scope.
			// Trying to supporting a context object for the listener led to 
			// complexity. 
			// Non trivial to provide 'once' functionality here
			// because listener could be the result of a davinci.dojo.hitch call,
			// in which case two references to the same hitch target would not
			// be equivalent. 
			source = source || davinci.dojo.global;
			// The source method is either null, a dispatcher, or some other function
			var f = source[method];
			// Ensure a dispatcher
			if(!f || !f._listeners){
				var d = this.getDispatcher();
				// original target function is special
				d.target = f;
				// dispatcher holds a list of listeners
				d._listeners = []; 
				// redirect source to dispatcher
				f = source[method] = d;
			}
			// The contract is that a handle is returned that can 
			// identify this listener for disconnect. 
			//
			// The type of the handle is private. Here is it implemented as Integer. 
			// DOM event code has this same contract but handle is Function 
			// in non-IE browsers.
			//
			// We could have separate lists of before and after listeners.
			return f._listeners.push(listener); /*Handle*/
		},
		// remove a listener from an object
		remove: function(/*Object*/ source, /*String*/ method, /*Handle*/ handle){
			var f = (source || davinci.dojo.global)[method];
			// remember that handle is the index+1 (0 is not a valid handle)
			if(f && f._listeners && handle--){
				delete f._listeners[handle];
			}
		}
	};
	
	d._topics = {};
	
	d.publish = function(/*String*/ topic, /*Array*/ args){
		//	summary:
		//	 	Invoke all listener method subscribed to topic.
		//	topic:
		//	 	The name of the topic to publish.
		//	args:
		//	 	An array of arguments. The arguments will be applied 
		//	 	to each topic subscriber (as first class parameters, via apply).
		//	example:
		//	|	davinci.dojo.subscribe("alerts", null, function(caption, message){ alert(caption + "\n" + message); };
		//	|	davinci.dojo.publish("alerts", [ "read this", "hello world" ]);	

		// Note that args is an array, which is more efficient vs variable length
		// argument list.  Ideally, var args would be implemented via Array
		// throughout the APIs.
		var f = this._topics[topic];
		if(f){
			f.apply(this, args||[]);
		}
	};
	
	d.subscribe = function(/*String*/ topic, /*Object|null*/ context, /*String|Function*/ method){
		//	summary:
		//		Attach a listener to a named topic. The listener function is invoked whenever the
		//		named topic is published (see: davinci.dojo.publish).
		//		Returns a handle which is needed to unsubscribe this listener.
		//	context:
		//		Scope in which method will be invoked, or null for default scope.
		//	method:
		//		The name of a function in context, or a function reference. This is the function that
		//		is invoked when topic is published.
		//	example:
		//	|	davinci.dojo.subscribe("alerts", null, function(caption, message){ alert(caption + "\n" + message); });
		//	|	davinci.dojo.publish("alerts", [ "read this", "hello world" ]);																	

		// support for 2 argument invocation (omitting context) depends on hitch
		return [topic, this._listener.add(this._topics, topic, this.hitch(context, method))]; /*Handle*/
	};

	d.unsubscribe = function(/*Handle*/ handle){
		//	summary:
		//	 	Remove a topic listener. 
		//	handle:
		//	 	The handle returned from a call to subscribe.
		//	example:
		//	|	var alerter = davinci.dojo.subscribe("alerts", null, function(caption, message){ alert(caption + "\n" + message); };
		//	|	...
		//	|	davinci.dojo.unsubscribe(alerter);
		if(handle){
			this._listener.remove(this._topics, handle[0], handle[1]);
		}
	};
	
	d._hitchArgs = function(scope, method /*,...*/){
		var pre = this._toArray(arguments, 2);
		var named = this.isString(method);
		return function(){
			// arrayify arguments
			var args = this._toArray(arguments);
			// locate our method
			var f = named ? (scope||this.global)[method] : method;
			// invoke with collected args
			return f && f.apply(scope || this, pre.concat(args)); // mixed
		} // Function
	};

	d.hitch = function(/*Object*/scope, /*Function|String*/method /*,...*/){
		//	summary:
		//		Returns a function that will only ever execute in the a given scope.
		//		This allows for easy use of object member functions
		//		in callbacks and other places in which the "this" keyword may
		//		otherwise not reference the expected scope.
		//		Any number of default positional arguments may be passed as parameters 
		//		beyond "method".
		//		Each of these values will be used to "placehold" (similar to curry)
		//		for the hitched function.
		//	scope:
		//		The scope to use when method executes. If method is a string,
		//		scope is also the object containing method.
		//	method:
		//		A function to be hitched to scope, or the name of the method in
		//		scope to be hitched.
		//	example:
		//	|	davinci.dojo.hitch(foo, "bar")();
		//		runs foo.bar() in the scope of foo
		//	example:
		//	|	davinci.dojo.hitch(foo, myFunction);
		//		returns a function that runs myFunction in the scope of foo
		//	example:
		//		Expansion on the default positional arguments passed along from
		//		hitch. Passed args are mixed first, additional args after.
		//	|	var foo = { bar: function(a, b, c){ console.log(a, b, c); } };
		//	|	var fn = davinci.dojo.hitch(foo, "bar", 1, 2);
		//	|	fn(3); // logs "1, 2, 3"
		//	example:
		//	|	var foo = { bar: 2 };
		//	|	davinci.dojo.hitch(foo, function(){ this.bar = 10; })();
		//		execute an anonymous function in scope of foo
		
		if(arguments.length > 2){
			return this._hitchArgs.apply(d, arguments); // Function
		}
		if(!method){
			method = scope;
			scope = null;
		}
		if(this.isString(method)){
			scope = scope || this.global;
			if(!scope[method]){ throw(['davinci.dojo.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
			return function(){ return scope[method].apply(scope, arguments || []); }; // Function
		}
		return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
	};
	
	var efficient = function(obj, offset, startWith){
		return (startWith||[]).concat(Array.prototype.slice.call(obj, offset||0));
	};

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	var slow = function(obj, offset, startWith){
		var arr = startWith||[];
		for(var x = offset || 0; x < obj.length; x++){
			arr.push(obj[x]);
		}
		return arr;
	};
	//>>excludeEnd("webkitMobile");

	d._toArray =
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		this.isIE ?  function(obj){
			return ((obj.item) ? slow : efficient).apply(this, arguments);
		} :
		//>>excludeEnd("webkitMobile");
		efficient;
		
	d.isString = function(/*anything*/ it){
		//	summary:
		//		Return true if it is a String
		return (typeof it == "string" || it instanceof String); // Boolean
	};

})();


davinci.States = function(){};
davinci.States.prototype = {

	NORMAL: "Normal",
	ATTRIBUTE: "dvStates",

	/**
	 * Returns the array of states declared by the widget, plus the implicit normal state. 
	 */ 
	getStates: function(widget, associative){ 
		widget = this._getWidget(widget); 
		var names = associative ? {"Normal": "Normal"} : ["Normal"];
		var states = widget && widget.states;
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
	
	_getWidget: function(widget) {
		if (!widget) {
			var doc = this.getDocument();
			widget = doc && doc.body;
		}
		return widget;
	},
	
	_updateSrcState: function (widget)
	{
		
	},
	
	/**
	 * Returns true if the widget declares the state, false otherwise.
	 */
	hasState: function(widget, state, property){ 
		if (arguments.length < 2) {
			state = arguments[0];
			widget = undefined;
		}
		widget = this._getWidget(widget);
		return !!(widget && widget.states && widget.states[state] && (property || widget.states[state].origin));
	},

	/**
	 * Returns the current state of the widget.
	 */
	getState: function(widget){ 
		widget = this._getWidget(widget);
		return widget && widget.states && widget.states.current;
	},
	
	/**
	 * Sets the current state of the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/changed", callback).
	 */
	setState: function(widget, newState, updateWhenCurrent, _silent){
		if (arguments.length < 2) {
			newState = arguments[0];
			widget = undefined;
		}
		widget = this._getWidget(widget);
		if (!widget || !widget.states || (!updateWhenCurrent && widget.states.current == newState)) {
			return;
		}
		var oldState = widget.states.current;
		
		if (this.isNormalState(newState)) {
			if (!widget.states.current) { return; }
			delete widget.states.current;
			newState = undefined;
		} else {
			widget.states.current = newState;
		}
		if (!_silent) {
			this.publish("/davinci/states/state/changed", [{widget:widget, newState:newState, oldState:oldState}]);
		}
		this._updateSrcState (widget);
		
	},
	
	/**
	 * If the current state is not Normal, force a call to setState
	 * so that styling properties get reset for a subtree.
	 */
	resetState: function(widget){
		var currentState = this.getState(widget.getContext().rootWidget);
		if(!this.isNormalState(currentState)){
			this.setState(widget, currentState, true/*updateWhenCurrent*/, false /*silent*/);
		}		
	},
	
	isNormalState: function(state) {
		if (arguments.length == 0) {
			state = this.getState();
		}
		return !state || state == this.NORMAL;
	},
	
	getStyle: function(widget, state, name) {
		var style;
		widget = this._getWidget(widget);
		if (arguments.length == 1) {
			state = this.getState();
		}
		// return all styles specific to this state
		style = widget && widget.states && widget.states[state] && widget.states[state].style;
		if (arguments.length > 2) { 
			style = style && widget.states[state].style[name];
		}
		return style;
	},

	hasStyle: function(widget, state, name) {
		widget = this._getWidget(widget);

		if (!widget || !name) { return; }
		
		return widget.states && widget.states[state] && widget.states[state].style && widget.states[state].style.hasOwnProperty(name);
	},

	setStyle: function(widget, state, style, value, silent) {
		widget = this._getWidget(widget);

		if (!widget || !style) { return; }
			
		if (typeof style == "string") {
			var name = style;
			style = {};
			style[name] = value;
		}

		widget.states = widget.states || {};
		widget.states[state] = widget.states[state] || {};
		widget.states[state].style = widget.states[state].style || {};
		
		for (var name in style) {
			value = style[name];
			if (typeof value != "undefined" && value !== null) {
				value = this._getFormattedValue(name, value);
				widget.states[state].style[name] = value;
			}		
		}
			
		if (!silent) {
			this.publish("/davinci/states/state/style/changed", [{widget:widget, state:state, style:style}]);
		}
		this._updateSrcState (widget);
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
	
	_resetAndCacheNormalStyle: function(widget, node, style, newState) {
		var normalStyle = this.getStyle(widget, undefined);
		
		// Reset normal styles
		for (var name in normalStyle) {
			var convertedName = this._convertStyleName(name);
			var previousValue = this._getFormattedValue(name, davinci.dojo.style(node, convertedName));
			if (previousValue !== normalStyle[name]) {
				davinci.dojo.style(node, convertedName, normalStyle[name]);
			}
		}

		// Remember style values from the normal state
		if (!this.isNormalState(newState)) {
			for (var name in style) {
				if(!this.hasStyle(widget, undefined, name)) {
					var convertedName = this._convertStyleName(name);
					var value = this._getFormattedValue(name, davinci.dojo.style(node, convertedName));
					this.setStyle(widget, undefined, name, value, true);
				}
			}
		}
	},
	
	_update: function(widget, newState, oldState) {
		widget = this._getWidget(widget);
		if (!widget) return;
		
		var node = widget.domNode || widget;

		var style = this.getStyle(widget, newState);
		
		this._resetAndCacheNormalStyle(widget, node, style, newState);

		// Apply new style
		for (var name in style) {
			var convertedName = this._convertStyleName(name);
			davinci.dojo.style(node, convertedName, style[name]);
		}
	},
		
	isContainer: function(widget) {
		var result = false;
		if (widget) {
			var doc = this.getDocument();
			if (widget === (doc && doc.body) || (widget.domNode && widget.domNode.tagName && widget.domNode.tagName == "BODY")) {
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
	add: function(widget, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			widget = undefined;
		}
		widget = this._getWidget(widget);
		if (!widget || this.hasState(widget, state)) {
			//FIXME: This should probably be an error of some sort
			return;
		}
		widget.states = widget.states || {};
		widget.states[state] = widget.states[state] || {};
		widget.states[state].origin = true;
		this.publish("/davinci/states/state/added", [{widget:widget, state:state}]);
		this._updateSrcState (widget);
	},
	
	/** 
	 * Removes a state from the list of states declared by the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/removed", callback).
	 */
	remove: function(widget, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			widget = undefined;
		}
		widget = this._getWidget(widget);
		if (!widget || !this.hasState(widget, state)) {
			return;
		}
		
		var currentState = this.getState(widget);
		if (state == currentState) {
			this.setState(widget, undefined);
		}
		
		delete widget.states[state].origin;
		if (this._isEmpty(widget.states[state])) {
			delete widget.states[state];
		}
		this.publish("/davinci/states/state/removed", [{widget:widget, state:state}]);
		this._updateSrcState (widget);
	},
	
	/**
	 * Renames a state in the list of states declared by the widget.
	 * Subscribe using davinci.states.subscribe("/davinci/states/renamed", callback).
	 */
	rename: function(widget, oldName, newName, property){ 
		if (arguments.length < 3) {
			newName = arguments[1];
			oldName = arguments[0];
			widget = undefined;
		}
		widget = this._getWidget(widget);
		if (!widget || !this.hasState(widget, oldName, property) || this.hasState(widget, newName, property)) {
			return false;
		}
		widget.states[newName] = widget.states[oldName];
		delete widget.states[oldName];
		if (!property) {
			this.publish("/davinci/states/state/renamed", [{widget:widget, oldName:oldName, newName:newName}]);
		}
		this._updateSrcState (widget);
		return true;
	},

	/**
	 * Returns true if the widget is set to visible within the current state, false otherwise.
	 */ 
	isVisible: function(widget, state){ 
		if (arguments.length == 1) {
			state = this.getState();
		}
		widget = this._getWidget(widget);
		if (!widget) return;
		// FIXME: The way the code is now, sometimes there is an "undefined" property
		// within widget.states. That code seems somewhat accidental and needs
		// to be studied and cleaned up.
		var domNode = (widget.domNode || widget);
		var isNormalState = (typeof state == "undefined" || state == "undefined");
		if(isNormalState){
			return domNode.style.display != "none";
		}else{
			if(widget.states && widget.states[state] && widget.states[state].style && typeof widget.states[state].style.display == "string"){
				return widget.states[state].style.display != "none";
			}else{
				return domNode.style.display != "none";
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
	
	serialize: function(widget) {
		if (!widget) return;
		var value = "";
		if (widget.states) {
			var states = require("dojo/_base/lang").clone(widget.states);
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
	
	deserialize: function(states) {
		if (typeof states == "string") {
			// Replace unescaped single quotes with double quotes, unescape escaped single quotes
			states = states.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? "'" : '"';
			});
			states = JSON.parse(states);
		}
		return states;
	},
	
	store: function(widget, states) {
		if (!widget || !states) return;
		
		this.clear(widget);
		widget.states = states = this.deserialize(states);
		this.publish("/davinci/states/stored", [{widget:widget, states:states}]);
	},
		
	retrieve: function(widget) {
		if (!widget) return;
		
		var node = widget.domNode || widget;
		var states = node.getAttribute(this.ATTRIBUTE);
		return states;
	},

	clear: function(widget) {
		if (!widget || !widget.states) return;
		var states = widget.states;
		delete widget.states;
		this.publish("/davinci/states/cleared", [{widget:widget, states:states}]);
	},
	
	getDocument: function() {
		return document;
	},
	
	_shouldInitialize: function() {
		var windowFrameElement = window.frameElement;
		var isDavinciEditor = top.davinci && top.davinci.Runtime && (!windowFrameElement || windowFrameElement.dvContext);
		return !isDavinciEditor;
	},

	publish: function(/*String*/ topic, /*Array*/ args) {
		try {
			return davinci.dojo.publish(topic, args);
		} catch(e) {
			console.error(e);
		}
	},
	
	subscribe: function(/*String*/ topic, /*Object|null*/ context, /*String|Function*/ method){
		return davinci.dojo.subscribe(topic, context, method);
	},
	
	unsubscribe: function(handle){
		return davinci.dojo.unsubscribe(handle);
	}, 

	_getChildrenOfNode: function(node) {
		var children = [];
		var child = node.firstChild;
		while(child) {
			if (child.nodeType == 1) {
				children.push(child);
			}
			child = child.nextSibling;
		}
		return children;
	},
	
	_getWidgetByNode: function(node) {
		var widget = node;
		if (typeof dijit != "undefined") {
			widget = node.widgetid ? dijit.byId(node.widgetid) : (dijit.byNode(node) || node);
		}
		return widget;
	},
	
	initialize: function() {
	
		if (!this.subscribed && this._shouldInitialize()) {
		
			this.subscribe("/davinci/states/state/changed", function(e) { 
				var children = davinci.states._getChildrenOfNode(e.widget.domNode || e.widget);
				while (children.length) {
					var child = children.shift();
					var childWidget = davinci.states._getWidgetByNode(child);
					if (!davinci.states.isContainer(childWidget)) {
						children = children.concat(davinci.states._getChildrenOfNode(childWidget.domNode || childWidget));				
					}
					davinci.states._update(childWidget, e.newState, e.oldState);
				}
			});
			
			this.subscribed = true;
		}
	}
};

if (typeof dojo != "undefined") {
//	dojo.provide("workspace.maqetta.States");
	// only include the regular parser if the mobile parser isn't available
	if (! dojo.getObject("dojox.mobile.parser.parse")) {
		dojo.require("dojo.parser");
	}
//	var zclass = dojo.declare("workspace.maqetta.States", null, davinci.states);	
}
davinci.states = new davinci.States();

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
			
				// preserve states specified on widgets
				var _preserveStates = function (cache) {
					var doc = davinci.states.getDocument();
	
					// Preserve the body states directly on the dom node
					var states = davinci.states.retrieve(doc.body);
					if (states) {
						cache.body = states;
					}
	
					// Preserve states of children of body in the cache
					query("*", doc).forEach(function(node){
						var states = davinci.states.retrieve(node);
						if (states) {
							if (!node.id) {
								node.id = _getTemporaryId(node);
							}
							if (node.tagName != "BODY") {
								cache[node.id] = states;
							}
						}
					});
				};
	
				// restore widget states from cache
				var _restoreStates = function (cache) {
					var doc = davinci.states.getDocument(),
						currentStateCache = [];
					for(var id in cache){
						var widget = id == "body" ? doc.body : dijit.byId(id) || dojo.byId(id);
						if (!widget) {
							console.error("States: Failed to get widget by id: ", id);
						}
						var states = davinci.states.deserialize(cache[id]);
						delete states.current; // always start in normal state for runtime
						davinci.states.store(widget, states);
					}
				};
					
				var _getTemporaryId = function (type) {
					if (!type) {
						return undefined;
					}
					if (type.domNode) { // widget
						type = type.declaredClass;
					} else if (type.nodeType === 1) { // Element
						type = (type.getAttribute("dojoType") || type.nodeName.toLowerCase());
					}
					type = type ? type.replace(/\./g, "_") : "";
					return dijit.getUniqueId(type);
				};
			});
		}
	}
})();

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
