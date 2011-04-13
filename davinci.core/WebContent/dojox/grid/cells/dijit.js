dojo.provide("dojox.grid.cells.dijit");

dojo.require("dojox.grid.cells");

// TODO: shouldn't it be the test file's job to require these modules,
// if it is using them?  Most of these modules aren't referenced by this file.

dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.CurrencyTextBox");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.Editor");

(function(){
	var dgc = dojox.grid.cells;
	dojo.declare("dojox.grid.cells._Widget", dgc._Base, {
		widgetClass: dijit.form.TextBox,
		constructor: function(inCell){
			this.widget = null;
			if(typeof this.widgetClass == "string"){
				dojo.deprecated("Passing a string to widgetClass is deprecated", "pass the widget class object instead", "2.0");
				this.widgetClass = dojo.getObject(this.widgetClass);
			}
		},
		formatEditing: function(inDatum, inRowIndex){
			this.needFormatNode(inDatum, inRowIndex);
			return "<div></div>";
		},
		getValue: function(inRowIndex){
			return this.widget.attr('value');
		},
		setValue: function(inRowIndex, inValue){
			if(this.widget&&this.widget.attr){
				//Look for lazy-loading editor and handle it via its deferred.
				if(this.widget.onLoadDeferred){
					var self = this;
					this.widget.onLoadDeferred.addCallback(function(){
						self.widget.attr("value",inValue===null?"":inValue); 
					});
				}else{
					this.widget.attr("value", inValue); 
				}
			}else{
				this.inherited(arguments);
			}
		},
		getWidgetProps: function(inDatum){
			return dojo.mixin(
				{
					dir: this.dir,
					lang: this.lang
				},
				this.widgetProps||{},
				{
					constraints: dojo.mixin({}, this.constraint) || {}, //TODO: really just for ValidationTextBoxes
					value: inDatum
				}
			);
		},
		createWidget: function(inNode, inDatum, inRowIndex){
			return new this.widgetClass(this.getWidgetProps(inDatum), inNode);
		},
		attachWidget: function(inNode, inDatum, inRowIndex){
			inNode.appendChild(this.widget.domNode);
			this.setValue(inRowIndex, inDatum);
		},
		formatNode: function(inNode, inDatum, inRowIndex){
			if(!this.widgetClass){
				return inDatum;
			}
			if(!this.widget){
				this.widget = this.createWidget.apply(this, arguments);
			}else{
				this.attachWidget.apply(this, arguments);
			}
			this.sizeWidget.apply(this, arguments);
			this.grid.rowHeightChanged(inRowIndex);
			this.focus();
			return undefined;
		},
		sizeWidget: function(inNode, inDatum, inRowIndex){
			var
				p = this.getNode(inRowIndex),
				box = dojo.contentBox(p);
			dojo.marginBox(this.widget.domNode, {w: box.w});
		},
		focus: function(inRowIndex, inNode){
			if(this.widget){
				setTimeout(dojo.hitch(this.widget, function(){
					dojox.grid.util.fire(this, "focus");
				}), 0);
			}
		},
		_finish: function(inRowIndex){
			this.inherited(arguments);
			dojox.grid.util.removeNode(this.widget.domNode);
		}
	});
	dgc._Widget.markupFactory = function(node, cell){
		dgc._Base.markupFactory(node, cell);
		var d = dojo;
		var widgetProps = d.trim(d.attr(node, "widgetProps")||"");
		var constraint = d.trim(d.attr(node, "constraint")||"");
		var widgetClass = d.trim(d.attr(node, "widgetClass")||"");
		if(widgetProps){
			cell.widgetProps = d.fromJson(widgetProps);
		}
		if(constraint){
			cell.constraint = d.fromJson(constraint);
		}
		if(widgetClass){
			cell.widgetClass = d.getObject(widgetClass);
		}
	};

	dojo.declare("dojox.grid.cells.ComboBox", dgc._Widget, {
		widgetClass: dijit.form.ComboBox,
		getWidgetProps: function(inDatum){
			var items=[];
			dojo.forEach(this.options, function(o){
				items.push({name: o, value: o});
			});
			var store = new dojo.data.ItemFileReadStore({data: {identifier:"name", items: items}});
			return dojo.mixin({}, this.widgetProps||{}, {
				value: inDatum,
				store: store
			});
		},
		getValue: function(){
			var e = this.widget;
			// make sure to apply the displayed value
			e.attr('displayedValue', e.attr('displayedValue'));
			return e.attr('value');
		}
	});
	dgc.ComboBox.markupFactory = function(node, cell){
		dgc._Widget.markupFactory(node, cell);
		var d=dojo;
		var options = d.trim(d.attr(node, "options")||"");
		if(options){
			var o = options.split(',');
			if(o[0] != options){
				cell.options = o;
			}
		}
	};

	dojo.declare("dojox.grid.cells.DateTextBox", dgc._Widget, {
		widgetClass: dijit.form.DateTextBox,
		setValue: function(inRowIndex, inValue){
			if(this.widget){
				this.widget.attr('value', new Date(inValue));
			}else{
				this.inherited(arguments);
			}
		},
		getWidgetProps: function(inDatum){
			return dojo.mixin(this.inherited(arguments), {
				value: new Date(inDatum)
			});
		}
	});
	dgc.DateTextBox.markupFactory = function(node, cell){
		dgc._Widget.markupFactory(node, cell);
	};

	dojo.declare("dojox.grid.cells.CheckBox", dgc._Widget, {
		widgetClass: dijit.form.CheckBox,
		getValue: function(){
			return this.widget.checked;
		},
		setValue: function(inRowIndex, inValue){
			if(this.widget&&this.widget.attributeMap.checked){
				this.widget.attr("checked", inValue);
			}else{
				this.inherited(arguments);
			}
		},
		sizeWidget: function(inNode, inDatum, inRowIndex){
			return;
		}
	});
	dgc.CheckBox.markupFactory = function(node, cell){
		dgc._Widget.markupFactory(node, cell);
	};

	dojo.declare("dojox.grid.cells.Editor", dgc._Widget, {
		widgetClass: dijit.Editor,
		getWidgetProps: function(inDatum){
			return dojo.mixin({}, this.widgetProps||{}, {
				height: this.widgetHeight || "100px"
			});
		},
		createWidget: function(inNode, inDatum, inRowIndex){
			// widget needs its value set after creation
			var widget = new this.widgetClass(this.getWidgetProps(inDatum), inNode);
			dojo.connect(widget, 'onLoad', dojo.hitch(this, 'populateEditor'));
			return widget;
		},
		formatNode: function(inNode, inDatum, inRowIndex){
			this.content = inDatum;
			this.inherited(arguments);
			if(dojo.isMoz){
				// FIXME: seem to need to reopen the editor and display the toolbar
				var e = this.widget;
				e.open();
				if(this.widgetToolbar){
					dojo.place(e.toolbar.domNode, e.editingArea, "before");
				}
			}
		},
		populateEditor: function(){
			this.widget.attr('value', this.content);
			this.widget.placeCursorAtEnd();
		}
	});
	dgc.Editor.markupFactory = function(node, cell){
		dgc._Widget.markupFactory(node, cell);
		var d = dojo;
		var h = dojo.trim(dojo.attr(node, "widgetHeight")||"");
		if(h){
			if((h != "auto")&&(h.substr(-2) != "em")){
				h = parseInt(h, 10)+"px";
			}
			cell.widgetHeight = h;
		}
	};
})();
