dojo.provide("dojox.dtl.contrib.dijit");

dojo.require("dojox.dtl.dom");
dojo.require("dojo.parser");

(function(){
	var dd = dojox.dtl;
	var ddcd = dd.contrib.dijit;

	ddcd.AttachNode = dojo.extend(function(keys, object){
		this._keys = keys;
		this._object = object;
	},
	{
		render: function(context, buffer){
			if(!this._rendered){
				this._rendered = true;
				for(var i=0, key; key = this._keys[i]; i++){
					context.getThis()[key] = this._object || buffer.getParent();
				}
			}
			return buffer;
		},
		unrender: function(context, buffer){
			if(this._rendered){
				this._rendered = false;
				for(var i=0, key; key = this._keys[i]; i++){
					if(context.getThis()[key] === (this._object || buffer.getParent())){
						delete context.getThis()[key];
					}
				}
			}
			return buffer;
		},
		clone: function(buffer){
			return new this.constructor(this._keys, this._object);
		}
	});

	ddcd.EventNode = dojo.extend(function(command, obj){
		this._command = command;

		var type, events = command.split(/\s*,\s*/);
		var trim = dojo.trim;
		var types = [];
		var fns = [];
		while(type = events.pop()){
			if(type){
				var fn = null;
				if(type.indexOf(":") != -1){
					// oh, if only JS had tuple assignment
					var funcNameArr = type.split(":");
					type = trim(funcNameArr[0]);
					fn = trim(funcNameArr.slice(1).join(":"));
				}else{
					type = trim(type);
				}
				if(!fn){
					fn = type;
				}
				types.push(type);
				fns.push(fn);
			}
		}

		this._types = types;
		this._fns = fns;
		this._object = obj;
		this._rendered = [];
	},
	{
		// _clear: Boolean
		//		Make sure we kill the actual tags (onclick problems, etc)
		_clear: false,
		render: function(context, buffer){
			for(var i = 0, type; type = this._types[i]; i++){
				if(!this._clear && !this._object){
					buffer.getParent()[type] = null;
				}
				var fn = this._fns[i];
				var args;
				if(fn.indexOf(" ") != -1){
					if(this._rendered[i]){
						dojo.disconnect(this._rendered[i]);
						this._rendered[i] = false;
					}
					args = dojo.map(fn.split(" ").slice(1), function(item){
						return new dd._Filter(item).resolve(context);
					});
					fn = fn.split(" ", 2)[0];
				}
				if(!this._rendered[i]){
					if(!this._object){
						this._rendered[i] = buffer.addEvent(context, type, fn, args);
					}else{
						this._rendered[i] = dojo.connect(this._object, type, context.getThis(), fn);
					}
				}
			}
			this._clear = true;

			return buffer;
		},
		unrender: function(context, buffer){
			while(this._rendered.length){
				dojo.disconnect(this._rendered.pop());
			}
			return buffer;
		},
		clone: function(){
			return new this.constructor(this._command, this._object);
		}
	});

	function cloneNode(n1){
		var n2 = n1.cloneNode(true);
		if(dojo.isIE){
			dojo.query("script", n2).forEach("item.text = this[index].text;", dojo.query("script", n1));
		}
		return n2;
	}

	ddcd.DojoTypeNode = dojo.extend(function(node, parsed){
		this._node = node;
		this._parsed = parsed;

		var events = node.getAttribute("dojoAttachEvent");
		if(events){
			this._events = new ddcd.EventNode(dojo.trim(events));
		}
		var attach = node.getAttribute("dojoAttachPoint");
		if(attach){
			this._attach = new ddcd.AttachNode(dojo.trim(attach).split(/\s*,\s*/));
		}

		if (!parsed){
			this._dijit = dojo.parser.instantiate([cloneNode(node)])[0];
		}else{
			node = cloneNode(node);
			var old = ddcd.widgetsInTemplate;
			ddcd.widgetsInTemplate = false;
			this._template = new dd.DomTemplate(node);
			ddcd.widgetsInTemplate = old;
		}
	},
	{
		render: function(context, buffer){
			if(this._parsed){
				var _buffer = new dd.DomBuffer();
				this._template.render(context, _buffer);
				var root = cloneNode(_buffer.getRootNode());
				var div = document.createElement("div");
				div.appendChild(root);
				var rendered = div.innerHTML;
				div.removeChild(root);
				if(rendered != this._rendered){
					this._rendered = rendered;
					if(this._dijit){
						this._dijit.destroyRecursive();
					}
					this._dijit = dojo.parser.instantiate([root])[0];
				}
			}

			var node = this._dijit.domNode;

			if(this._events){
				this._events._object = this._dijit;
				this._events.render(context, buffer);
			}
			if(this._attach){
				this._attach._object = this._dijit;
				this._attach.render(context, buffer);
			}

			return buffer.concat(node);
		},
		unrender: function(context, buffer){
			return buffer.remove(this._dijit.domNode);
		},
		clone: function(){
			return new this.constructor(this._node, this._parsed);
		}
	});

	dojo.mixin(ddcd, {
		widgetsInTemplate: true,
		dojoAttachPoint: function(parser, token){
			return new ddcd.AttachNode(token.contents.slice(16).split(/\s*,\s*/));
		},
		dojoAttachEvent: function(parser, token){
			return new ddcd.EventNode(token.contents.slice(16));
		},
		dojoType: function(parser, token){
			var parsed = false;
			if(token.contents.slice(-7) == " parsed"){
				parsed = true;
			}
			var contents = token.contents.slice(9);
			var dojoType = parsed ? contents.slice(0, -7) : contents.toString();

			if(ddcd.widgetsInTemplate){
				var node = parser.swallowNode();
				node.setAttribute("dojoType", dojoType);
				return new ddcd.DojoTypeNode(node, parsed);
			}

			return new dd.AttributeNode("dojoType", dojoType);
		},
		on: function(parser, token){
			// summary: Associates an event type to a function (on the current widget) by name
			var parts = token.contents.split();
			return new ddcd.EventNode(parts[0] + ":" + parts.slice(1).join(" "));
		}
	});

	dd.register.tags("dojox.dtl.contrib", {
		"dijit": ["attr:dojoType", "attr:dojoAttachPoint", ["attr:attach", "dojoAttachPoint"], "attr:dojoAttachEvent", [/(attr:)?on(click|key(up))/i, "on"]]
	});
})();