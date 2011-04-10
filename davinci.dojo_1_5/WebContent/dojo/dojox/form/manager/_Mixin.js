dojo.provide("dojox.form.manager._Mixin");

dojo.require("dijit._Widget");

(function(){
	var fm = dojox.form.manager,

		aa = fm.actionAdapter = function(action){
			// summary:
			//		Adapter that automates application of actions to arrays.
			// action: Function:
			//		Function that takes three parameters: a name, an object
			//		(usually node or widget), and a value. This action will
			//		be applied to all elements of array.
			return function(name, elems, value){
				if(dojo.isArray(elems)){
					dojo.forEach(elems, function(elem){
						action.call(this, name, elem, value);
					}, this);
				}else{
					action.apply(this, arguments);
				}
			};
		},

		ia = fm.inspectorAdapter = function(inspector){
			// summary:
			//		Adapter that applies an inspector only to the first item of the array.
			// inspector: Function:
			//		Function that takes three parameters: a name, an object
			//		(usually node or widget), and a value.
			return function(name, elem, value){
				return inspector.call(this, name, dojo.isArray(elem) ? elem[0] : elem, value);
			};
		},

		skipNames = {domNode: 1, containerNode: 1, srcNodeRef: 1, bgIframe: 1},

		keys = fm._keys = function(o){
			// similar to dojox.lang.functional.keys
			var list = [], key;
			for(key in o){
				if(o.hasOwnProperty(key)){
					list.push(key);
				}
			}
			return list;
		},

		registerWidget = function(widget){
			var name = widget.get("name");
			if(name && widget instanceof dijit.form._FormWidget){
				if(name in this.formWidgets){
					var a = this.formWidgets[name].widget;
					if(dojo.isArray(a)){
						a.push(widget);
					}else{
						this.formWidgets[name].widget = [a, widget];
					}
				}else{
					this.formWidgets[name] = {widget: widget, connections: []};
				}
			}else{
				name = null;
			}
			return name;
		},

		getObserversFromWidget = function(name){
			var observers = {};
			aa(function(_, w){
				var o = w.get("observer");
				if(o && typeof o == "string"){
					dojo.forEach(o.split(","), function(o){
						o = dojo.trim(o);
						if(o && dojo.isFunction(this[o])){
							observers[o] = 1;
						}
					}, this);
				}
			}).call(this, null, this.formWidgets[name].widget);
			return keys(observers);
		},

		connectWidget = function(name, observers){
			var t = this.formWidgets[name], w = t.widget, c = t.connections;
			if(c.length){
				dojo.forEach(c, dojo.disconnect);
				c = t.connections = [];
			}
			if(dojo.isArray(w)){
				// radio buttons
				dojo.forEach(w, function(w){
					dojo.forEach(observers, function(o){
						c.push(dojo.connect(w, "onChange", this, function(evt){
							// TODO: for some reason for radio button widgets
							// w.checked != w.focusNode.checked when value changes.
							// We test the underlying value to be 100% sure.
							if(this.watch && dojo.attr(w.focusNode, "checked")){
								this[o](w.get("value"), name, w, evt);
							}
						}));
					}, this);
				}, this);
			}else{
				// the rest
				// the next line is a crude workaround for dijit.form.Button that fires onClick instead of onChange
				var eventName = w.declaredClass == "dijit.form.Button" ?
						"onClick" : "onChange";
				dojo.forEach(observers, function(o){
					c.push(dojo.connect(w, eventName, this, function(evt){
						if(this.watch){
							this[o](w.get("value"), name, w, evt);
						}
					}));
				}, this);
			}
		};

	dojo.declare("dojox.form.manager._Mixin", null, {
		// summary:
		//		Mixin to orchestrate dynamic forms.
		// description:
		//		This mixin provideas a foundation for an enhanced form
		//		functionality: unified access to individual form elements,
		//		unified "onchange" event processing, general event
		//		processing, I/O orchestration, and common form-related
		//		functionality. See additional mixins in dojox.form.manager
		//		namespace.

		watch: true,

		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under dojo.doc.body.

			if(this._started){ return; }

			this.formWidgets = {};
			this.formNodes = {};
			this.registerWidgetDescendants(this);

			this.inherited(arguments);
		},

		destroy: function(){
			// summary:
			//		Called when the widget is being destroyed

			for(var name in this.formWidgets){
				dojo.forEach(this.formWidgets[name].connections, dojo.disconnect);
			}
			this.formWidgets = {};

			this.inherited(arguments);
		},

		// register/unregister widgets and nodes

		registerWidget: function(widget){
			// summary:
			//		Register a widget with the form manager
			// widget: String|Node|dijit.form._FormWidget:
			//		A widget, or its widgetId, or its DOM node
			// returns: Object:
			//		Returns self
			if(typeof widget == "string"){
				widget = dijit.byId(widget);
			}else if(widget.tagName && widget.cloneNode){
				widget = dijit.byNode(widget);
			}
			var name = registerWidget.call(this, widget);
			if(name){
				connectWidget.call(this, name, getObserversFromWidget.call(this, name));
			}
			return this;
		},

		unregisterWidget: function(name){
			// summary:
			//		Removes the widget by name from internal tables unregistering
			//		connected observers
			// name: String:
			//		Name of the to unregister
			// returns: Object:
			//		Returns self
			if(name in this.formWidgets){
				dojo.forEach(this.formWidgets[name].connections, this.disconnect, this);
				delete this.formWidgets[name];
			}
			return this;
		},

		registerWidgetDescendants: function(widget){
			// summary:
			//		Register widget's descendants with the form manager
			// widget: String|Node|dijit._Widget:
			//		A widget, or its widgetId, or its DOM node
			// returns: Object:
			//		Returns self

			// convert to widget, if required
			if(typeof widget == "string"){
				widget = dijit.byId(widget);
			}else if(widget.tagName && widget.cloneNode){
				widget = dijit.byNode(widget);
			}

			// build the map of widgets
			var widgets = dojo.map(widget.getDescendants(), registerWidget, this);

			// process observers for widgets
			dojo.forEach(widgets, function(name){
				if(name){
					connectWidget.call(this, name, getObserversFromWidget.call(this, name));
				}
			}, this);

			// do the same with nodes, if available
			return this.registerNodeDescendants ?
				this.registerNodeDescendants(widget.domNode) : this;
		},

		unregisterWidgetDescendants: function(widget){
			// summary:
			//		Unregister widget's descendants with the form manager
			// widget: String|Node|dijit._Widget:
			//		A widget, or its widgetId, or its DOM node
			// returns: Object:
			//		Returns self

			// convert to widget, if required
			if(typeof widget == "string"){
				widget = dijit.byId(widget);
			}else if(widget.tagName && widget.cloneNode){
				widget = dijit.byNode(widget);
			}

			// unregister widgets by names
			dojo.forEach(
				dojo.map(
					widget.getDescendants(),
					function(w){
						return w instanceof dijit.form._FormWidget && w.get("name") || null;
					}
				),
				function(name){
					if(name){
						this.unregisterNode(name);
					}
				},
				this
			);

			// do the same with nodes, if available
			return this.unregisterNodeDescendants ?
				this.unregisterNodeDescendants(widget.domNode) : this;
		},

		// value accessors

		formWidgetValue: function(elem, value){
			// summary:
			//		Set or get a form widget by name.
			// elem: String|Object|Array:
			//		Form element's name, widget object, or array or radio widgets.
			// value: Object?:
			//		Optional. The value to set.
			// returns: Object:
			//		For a getter it returns the value, for a setter it returns
			//		self. If the elem is not valid, null will be returned.

			var isSetter = arguments.length == 2 && value !== undefined, result;

			if(typeof elem == "string"){
				elem = this.formWidgets[elem];
				if(elem){
					elem = elem.widget;
				}
			}

			if(!elem){
				return null;	// Object
			}

			if(dojo.isArray(elem)){
				// input/radio array of widgets
				if(isSetter){
					dojo.forEach(elem, function(widget){
						widget.set("checked", false, !this.watch);
					});
					dojo.forEach(elem, function(widget){
						widget.set("checked", widget.value === value, !this.watch);
					});
					return this;	// self
				}
				// getter
				dojo.some(elem, function(widget){
					// TODO: for some reason for radio button widgets
					// w.checked != w.focusNode.checked when value changes.
					// We test the underlying value to be 100% sure.
					if(dojo.attr(widget.focusNode, "checked")){
					//if(widget.get("checked")){
						result = widget;
						return true;
					}
					return false;
				});
				return result ? result.get("value") : "";	// String
			}

			// checkbox widget is a special case :-(
			if(elem.declaredClass == "dijit.form.CheckBox"){
				if(isSetter){
					elem.set("value", Boolean(value), !this.watch);
					return this;	// self
				}
				return Boolean(elem.get("value"));	// Object
			}

			// all other elements
			if(isSetter){
				elem.set("value", value, !this.watch);
				return this;	// self
			}
			return elem.get("value");	// Object
		},

		formPointValue: function(elem, value){
			// summary:
			//		Set or get a node context by name (using dojoAttachPoint).
			// elem: String|Object|Array:
			//		A node.
			// value: Object?:
			//		Optional. The value to set.
			// returns: Object:
			//		For a getter it returns the value, for a setter it returns
			//		self. If the elem is not valid, null will be returned.

			if(elem && typeof elem == "string"){
				elem = this[elem];
			}

			if(!elem || !elem.tagName || !elem.cloneNode){
				return null;	// Object
			}

			if(!dojo.hasClass(elem, "dojoFormValue")){
				// accessing the value of the attached point not marked with CSS class 'dojoFormValue'
				return null;
			}

			if(arguments.length == 2 && value !== undefined){
				// setter
				elem.innerHTML = value;
				return this;	// self
			}
			// getter
			return elem.innerHTML;	// String
		},

		// inspectors

		inspectFormWidgets: function(inspector, state, defaultValue){
			// summary:
			//		Run an inspector function on controlled widgets returning a result object.
			// inspector: Function:
			//		A function to be called on a widget. Takes three arguments: a name, a widget object
			//		or an array of widget objects, and a supplied value. Runs in the context of
			//		the form manager. Returns a value that will be collected and returned as a state.
			// state: Object?:
			//		Optional. If a name-value dictionary --- only listed names will be processed.
			//		If an array, all names in the array will be processed with defaultValue.
			//		If omitted or null, all widgets will be processed with defaultValue.
			// defaultValue: Object?:
			//		Optional. The default state (true, if omitted).

			var name, result = {};

			if(state){
				if(dojo.isArray(state)){
					dojo.forEach(state, function(name){
						if(name in this.formWidgets){
							result[name] = inspector.call(this, name, this.formWidgets[name].widget, defaultValue);
						}
					}, this);
				}else{
					for(name in state){
						if(name in this.formWidgets){
							result[name] = inspector.call(this, name, this.formWidgets[name].widget, state[name]);
						}
					}
				}
			}else{
				for(name in this.formWidgets){
					result[name] = inspector.call(this, name, this.formWidgets[name].widget, defaultValue);
				}
			}

			return result;	// Object
		},

		inspectAttachedPoints: function(inspector, state, defaultValue){
			// summary:
			//		Run an inspector function on "dojoAttachPoint" nodes returning a result object.
			// inspector: Function:
			//		A function to be called on a node. Takes three arguments: a name, a node or
			//		an array of nodes, and a supplied value. Runs in the context of the form manager.
			//		Returns a value that will be collected and returned as a state.
			// state: Object?:
			//		Optional. If a name-value dictionary --- only listed names will be processed.
			//		If an array, all names in the array will be processed with defaultValue.
			//		If omitted or null, all attached point nodes will be processed with defaultValue.
			// defaultValue: Object?:
			//		Optional. The default state (true, if omitted).

			var name, result = {};

			if(state){
				if(dojo.isArray(state)){
					dojo.forEach(state, function(name){
						var elem = this[name];
						if(elem && elem.tagName && elem.cloneNode){
							result[name] = inspector.call(this, name, elem, defaultValue);
						}
					}, this);
				}else{
					for(name in state){
						var elem = this[name];
						if(elem && elem.tagName && elem.cloneNode){
							result[name] = inspector.call(this, name, elem, state[name]);
						}
					}
				}
			}else{
				for(name in this){
					if(!(name in skipNames)){
						var elem = this[name];
						if(elem && elem.tagName && elem.cloneNode){
							result[name] = inspector.call(this, name, elem, defaultValue);
						}
					}
				}
			}

			return result;	// Object
		},

		inspect: function(inspector, state, defaultValue){
			// summary:
			//		Run an inspector function on controlled elements returning a result object.
			// inspector: Function:
			//		A function to be called on a widget, form element, and an attached node.
			//		Takes three arguments: a name, a node (domNode in the case of widget) or
			//		an array of such objects, and a supplied value. Runs in the context of
			//		the form manager. Returns a value that will be collected and returned as a state.
			// state: Object?:
			//		Optional. If a name-value dictionary --- only listed names will be processed.
			//		If an array, all names in the array will be processed with defaultValue.
			//		If omitted or null, all controlled elements will be processed with defaultValue.
			// defaultValue: Object?:
			//		Optional. The default state (true, if omitted).

			var result = this.inspectFormWidgets(function(name, widget, value){
				if(dojo.isArray(widget)){
					return inspector.call(this, name, dojo.map(widget, function(w){ return w.domNode; }), value);
				}
				return inspector.call(this, name, widget.domNode, value);
			}, state, defaultValue);
			if(this.inspectFormNodes){
				dojo.mixin(result, this.inspectFormNodes(inspector, state, defaultValue));
			}
			return dojo.mixin(result, this.inspectAttachedPoints(inspector, state, defaultValue));	// Object
		}
	});
})();

// These arguments can be specified for widgets which are used in forms.
// Since any widget can be specified as sub widgets, mix it into the base
// widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	observer: ""
});
