dojo.provide("dojox.form.manager._NodeMixin");

dojo.require("dojox.form.manager._Mixin");

(function(){
	var fm = dojox.form.manager,
		aa = fm.actionAdapter,
		keys = fm._keys,

		ce = fm.changeEvent = function(node){
			// summary:
			//		Function that returns a valid "onchange" event for a given form node.
			// node: Node:
			//		Form node.

			var eventName = "onclick";
			switch(node.tagName.toLowerCase()){
				case "textarea":
					eventName = "onkeyup";
					break;
				case "select":
					eventName = "onchange";
					break;
				case "input":
					switch(node.type.toLowerCase()){
						case "text":
						case "password":
							eventName = "onkeyup";
							break;
					}
					break;
				// button, input/button, input/checkbox, input/radio,
				// input/file, input/image, input/submit, input/reset
				// use "onclick" (the default)
			}
			return eventName;	// String
		},

		registerNode = function(node, groupNode){
			var name = dojo.attr(node, "name");
			groupNode = groupNode || this.domNode;
			if(name && !(name in this.formWidgets)){
				// verify that it is not part of any widget
				for(var n = node; n && n !== groupNode; n = n.parentNode){
					if(dojo.attr(n, "widgetId") && dijit.byNode(n) instanceof dijit.form._FormWidget){
						// this is a child of some widget --- bail out
						return null;
					}
				}
				// register the node
				if(node.tagName.toLowerCase() == "input" && node.type.toLowerCase() == "radio"){
					var a = this.formNodes[name];
					a = a && a.node;
					if(a && dojo.isArray(a)){
						a.push(node);
					}else{
						this.formNodes[name] = {node: [node], connections: []};
					}
				}else{
					this.formNodes[name] = {node: node, connections: []};
				}
			}else{
				name = null;
			}
			return name;
		},

		getObserversFromNode = function(name){
			var observers = {};
			aa(function(_, n){
				var o = dojo.attr(n, "observer");
				if(o && typeof o == "string"){
					dojo.forEach(o.split(","), function(o){
						o = dojo.trim(o);
						if(o && dojo.isFunction(this[o])){
							observers[o] = 1;
						}
					}, this);
				}
			}).call(this, null, this.formNodes[name].node);
			return keys(observers);
		},

		connectNode = function(name, observers){
			var t = this.formNodes[name], c = t.connections;
			if(c.length){
				dojo.forEach(c, dojo.disconnect);
				c = t.connections = [];
			}
			aa(function(_, n){
				// the next line is a crude workaround for dijit.form.Button that fires onClick instead of onChange
				var eventName = ce(n);
				dojo.forEach(observers, function(o){
					c.push(dojo.connect(n, eventName, this, function(evt){
						if(this.watch){
							this[o](this.formNodeValue(name), name, n, evt);
						}
					}));
				}, this);
			}).call(this, null, t.node);
		};
	dojo.declare("dojox.form.manager._NodeMixin", null, {
		// summary:
		//		Mixin to orchestrate dynamic forms (works with DOM nodes).
		// description:
		//		This mixin provideas a foundation for an enhanced form
		//		functionality: unified access to individual form elements,
		//		unified "onchange" event processing, and general event
		//		processing. It complements dojox.form.manager._Mixin
		//		extending the functionality to DOM nodes.

		destroy: function(){
			// summary:
			//		Called when the widget is being destroyed

			for(var name in this.formNodes){
				dojo.forEach(this.formNodes[name].connections, dojo.disconnect);
			}
			this.formNodes = {};

			this.inherited(arguments);
		},

		// register/unregister widgets and nodes

		registerNode: function(node){
			// summary:
			//		Register a node with the form manager
			// node: String|Node:
			//		A node, or its id
			// returns: Object:
			//		Returns self
			if(typeof node == "string"){
				node = dojo.byId(node);
			}
			var name = registerNode.call(this, node);
			if(name){
				connectNode.call(this, name, getObserversFromNode.call(this, name));
			}
			return this;
		},

		unregisterNode: function(name){
			// summary:
			//		Removes the node by name from internal tables unregistering
			//		connected observers
			// name: String:
			//		Name of the to unregister
			// returns: Object:
			//		Returns self
			if(name in this.formNodes){
				dojo.forEach(this.formNodes[name].connections, this.disconnect, this);
				delete this.formNodes[name];
			}
			return this;
		},

		registerNodeDescendants: function(node){
			// summary:
			//		Register node's descendants (form nodes) with the form manager
			// node: String|Node:
			//		A widget, or its widgetId, or its DOM node
			// returns: Object:
			//		Returns self

			if(typeof node == "string"){
				node = dojo.byId(node);
			}

			dojo.query("input, select, textarea, button", node).
				map(function(n){
					return registerNode.call(this, n, node);
				}, this).
				forEach(function(name){
					if(name){
						connectNode.call(this, name, getObserversFromNode.call(this, name));
					}
				}, this);

			return this;
		},

		unregisterNodeDescendants: function(node){
			// summary:
			//		Unregister node's descendants (form nodes) with the form manager
			// node: String|Node:
			//		A widget, or its widgetId, or its DOM node
			// returns: Object:
			//		Returns self

			if(typeof node == "string"){
				node = dojo.byId(node);
			}

			dojo.query("input, select, textarea, button", node).
				map(function(n){ return dojo.attr(node, "name") || null; }).
				forEach(function(name){
					if(name){
						this.unregisterNode(name);
					}
				}, this);

			return this;
		},

		// value accessors

		formNodeValue: function(elem, value){
			// summary:
			//		Set or get a form element by name.
			// elem: String|Node|Array:
			//		Form element's name, DOM node, or array or radio nodes.
			// value: Object?:
			//		Optional. The value to set.
			// returns: Object:
			//		For a getter it returns the value, for a setter it returns
			//		self. If the elem is not valid, null will be returned.

			var isSetter = arguments.length == 2 && value !== undefined, result;

			if(typeof elem == "string"){
				elem = this.formNodes[elem];
				if(elem){
					elem = elem.node;
				}
			}

			if(!elem){
				return null;	// Object
			}

			if(dojo.isArray(elem)){
				// input/radio array
				if(isSetter){
					dojo.forEach(elem, function(node){
						node.checked = "";
					});
					dojo.forEach(elem, function(node){
						node.checked = node.value === value ? "checked" : "";
					});
					return this;	// self
				}
				// getter
				dojo.some(elem, function(node){
					if(node.checked){
						result = node;
						return true;
					}
					return false;
				});
				return result ? result.value : "";	// String
			}
			// all other elements
			switch(elem.tagName.toLowerCase()){
				case "select":
					if(elem.multiple){
						// multiple is allowed
						if(isSetter){
							if(dojo.isArray(value)){
								var dict = {};
								dojo.forEach(value, function(v){
									dict[v] = 1;
								});
								dojo.query("> option", elem).forEach(function(opt){
									opt.selected = opt.value in dict;
								});
								return this;	// self
							}
							// singular property
							dojo.query("> option", elem).forEach(function(opt){
								opt.selected = opt.value === value;
							});
							return this;	// self
						}
						// getter
						var result = dojo.query("> option", elem).filter(function(opt){
							return opt.selected;
						}).map(function(opt){
							return opt.value;
						});
						return result.length == 1 ? result[0] : result;	// Object
					}
					// singular
					if(isSetter){
						dojo.query("> option", elem).forEach(function(opt){
							opt.selected = opt.value === value;
						});
						return this;	// self
					}
					// getter
					return elem.value || ""; // String
				case "button":
					if(isSetter){
						elem.innerHTML = "" + value;
						return this;
					}
					// getter
					return elem.innerHTML;
				case "input":
					if(elem.type.toLowerCase() == "checkbox"){
						// input/checkbox element
						if(isSetter){
							elem.checked = value ? "checked" : "";
							return this;
						}
						// getter
						return Boolean(elem.checked);
					}
			}
			// the rest of inputs
			if(isSetter){
				elem.value = "" + value;
				return this;
			}
			// getter
			return elem.value;
		},

		// inspectors

		inspectFormNodes: function(inspector, state, defaultValue){
			// summary:
			//		Run an inspector function on controlled form elements returning a result object.
			// inspector: Function:
			//		A function to be called on a form element. Takes three arguments: a name, a node or
			//		an array of nodes, and a supplied value. Runs in the context of the form manager.
			//		Returns a value that will be collected and returned as a state.
			// state: Object?:
			//		Optional. If a name-value dictionary --- only listed names will be processed.
			//		If an array, all names in the array will be processed with defaultValue.
			//		If omitted or null, all form elements will be processed with defaultValue.
			// defaultValue: Object?:
			//		Optional. The default state (true, if omitted).

			var name, result = {};

			if(state){
				if(dojo.isArray(state)){
					dojo.forEach(state, function(name){
						if(name in this.formNodes){
							result[name] = inspector.call(this, name, this.formNodes[name].node, defaultValue);
						}
					}, this);
				}else{
					for(name in state){
						if(name in this.formNodes){
							result[name] = inspector.call(this, name, this.formNodes[name].node, state[name]);
						}
					}
				}
			}else{
				for(name in this.formNodes){
					result[name] = inspector.call(this, name, this.formNodes[name].node, defaultValue);
				}
			}

			return result;	// Object
		}
	});
})();
