define("davinci/ve/_Widget", ["davinci/ve/metadata"], function() {

/*return*/ dojo.declare("davinci.ve._Widget", null, {

	isWidget: true,

	acceptsHTMLChildren: false,

	/**
	 * @static
	 */
	_skipAttrs: ['id', 'style', 'class', 'dir', 'lang', '_children'],

	constructor: function (params, node, type, metadata) {
	  this.domNode=node;
	  this.id=node.id;
		node._dvWidget=this;
		this._params = dojo.mixin({}, params);
	  this.type = type;
	  this.metadata = metadata;
	},

	postscript: function() {
		// FIXME: The following lines of code attempt to find
		// the context object that applies to the widget we are creating.
		// However, depending on various code paths, sometimes the context is
		// not available on widget or widget's domNode._dvWidget, so have
		// to go all the way back to BODY element.
		// Instead, we need to fix so that context is already available on "this" object.
		var context;
		if(this.domNode) {
			var doc = this.domNode.ownerDocument;
			if(doc.body._edit_context) {
				context = doc.body._edit_context;
			}else if(doc.body._dvWidget && doc.body._dvWidget._edit_context) {
				context = doc.body._dvWidget._edit_context;
			}
		}
		if(this.id && context) {
			context.widgetHash[this.id]=this;
		}
		this.buildRendering();
		this.postCreate();
	},

	buildRendering: function() {
	},

	postCreate: function() {
	},

	getObjectType: function() {
	},

	getContext: function() {
		return this._edit_context;
	},

	getChildren: function(attach) {
		var helper = this.getHelper();
		if (helper && helper.getChildren) {
			return helper.getChildren(this, attach);
		}

		return this._getChildren(attach);
	},

	_getChildren: function(attach) {
		var containerNode = this.getContainerNode(),
			children = [];

		if (containerNode) {
			dojo.forEach(containerNode.children, function(node) {
				if (attach) {
					children.push(davinci.ve.widget.getWidget(node));
				} else {
					var widget = node._dvWidget;
					if (widget) {
						children.push(widget);
					}
				}
			});
		}

		return children;
	},

	getContainerNode: function() {
		var helper = this.getHelper();
		if(helper && helper.getContainerNode) {
			return helper.getContainerNode(this);
		}

		if (davinci.ve.metadata.getAllowedChild(this.type)[0] !== 'NONE') {
			return this._getContainerNode();
		}
		return null;
	},

	_getContainerNode: function() {
		return this.domNode;
	},

	getMetadata: function() {
        if (!this.metadata) {
            this.metadata = davinci.ve.metadata.query(this);
        }
        return this.metadata;
    },

	getHelper: function() {
        if (!this._edit_helper) {
            this._edit_helper = davinci.ve.widget.getWidgetHelper(this.type);
    	    if (!this._edit_helper) {
    	        this._edit_helper = true; // FIXME: why not just assign null and skip the boolean stuff?
    	    }
        }
        return (typeof this._edit_helper === "boolean") ? null : this._edit_helper;
    },
    
   
	attr: function(name,value)
	{
		var attrValue=	this._attr.apply(this, arguments);
		if (arguments.length>1)
		{
			value=this._stringValue(name, value);
			this._srcElement.addAttribute(name,value);
		}
		else
			return attrValue;
	},

	_attr: function(name,value) {
	},

	indexOf: function(child) {
		return dojo.indexOf(this.getChildren(), child);
	},

	getStyleNode: function() {
		return this.styleNode || this.domNode; // for Textarea on FF2
	},

	addChild: function (child,index)
	{
		if(!child) {
			return;
		}

		var containerNode = this.getContainerNode();
		if(containerNode) {
			//TODO use dojo.place?
			if(index === undefined || index === -1) {
				containerNode.appendChild(child.domNode);
				this._srcElement.addChild(child._srcElement);
			}else{
				var children = this.getChildren();
				if(index < children.length) {
					containerNode.insertBefore(child.domNode, children[index].domNode);
					this._srcElement.insertBefore(child._srcElement,children[index]._srcElement);
				}else{
					containerNode.appendChild(child.domNode);
					this._srcElement.addChild(child._srcElement);
				}
			}
		}
	},
	getParent: function() {
			return davinci.ve.widget.getEnclosingWidget(this.domNode.parentNode) || this.domNode.parentNode;
	},

	getObjectId: function(widget) {
		widget = widget || this;
		var objectId = widget._edit_object_id;
		if(objectId) {
			return objectId;
		}
		if(widget.domNode) {
			return widget.domNode.getAttribute("jsId");
		}
	 	return undefined;
	},
	
	addClass: function(newClass) {
		// add to Model...
		var classes = this.getClassNames();
		classes = classes ? classes.split(/\s+/) : [];
		if (classes.indexOf(newClass) !== -1) {
			// duplicate class name
			return;
		}
		classes.push(newClass);
		this._srcElement.setAttribute('class', classes.join(' '));
		
		// add to DOM...
		dojo.addClass(this.domNode, newClass);
	},
	
	getId: function() {
		if (!this.id)
		{
			if( !this.domNode.id || !this.type) {
				return undefined;
			}

			var id = this.domNode.id;
			var base = (this.isHtmlWidget ? this.getTagName() : this.type).replace(/\./g, "_") + "_";
			if(id.length > base.length && id.substring(0, base.length) == base) {
				// auto-generated id
				return undefined;
			}
		}
		if ( this._srcElement && this._srcElement._getAttribute("id")
		  && this._srcElement._getAttribute("id").noPersist ) { return undefined; }

		return this.id;
	},
	setMarginBox: function(box) {
		var node = this.getStyleNode();
		if(!node) {
			return;
		}

		dojo.marginBox(node, box);
		this._updateSrcStyle();
	},

	getMarginBox: function() {
		var node = this.getStyleNode();
		if(!node) {
			return undefined;
		}

		var box = dojo.position(node),
			parentNode = node.offsetParent;
		if(parentNode) {
			var c = dojo.position(parentNode),
				e = dojo._getMarginExtents(node);
			box.l = box.x - c.x + parentNode.scrollLeft - Math.round(e.l);
			box.t = box.y - c.y + parentNode.scrollTop - Math.round(e.t);
		}else{
			box.l = box.t = 0;
		}
		return box;
	},

	getStyle: function(options) {
		var values = this.getStyleValues(options);
		if(!values) {
			return "";
		}
		return this._styleText(values);
	},

	_sortStyleValues: function(values) {
		// return a sorted array of sorted style values.
		var v = [];
		var shorthands = davinci.html.css.shorthand;

		var foundShorthands = [];

		for(var j=0;j<shorthands.length;j++) {
			for(var i=0;i<shorthands[j].length;i++) {
				if(shorthands[j][i] in values) {
					v.push({name: shorthands[j][i], value: values[shorthands[j][i]]});
					foundShorthands.push(shorthands[j][i]);
				}
			}
		}

		for(var name in values) {
			var found = false;

			for(var i=0;!found && i<foundShorthands.length;i++) {
				if(foundShorthands[i] == name)
					found=true;
			}

			if(!found)
				v.push({name: name, value: values[name]});
		}

		return v;
	},

	_styleText: function (v) {
		var s = "";
		/* if ordering is given, respect it */
		if(dojo.isArray(v)) {

			for(var i = 0;i<v.length;i++) {
				value = davinci.ve.states.normalize("style", this, v[i].name, v[i].value);
				if(value !== undefined && value != "" && value!=null) {
					s += v[i].name + ": " + value + "; ";
				}

			}
		}else{
			for(var name in v) {
				var value = v[name];
				value = davinci.ve.states.normalize("style", this, name, value);
				if(value !== undefined && value != "" && value!=null) {
					s += name + ": " + value + "; ";
				}
			}

		}
		return s.trim();
	},

	getChildrenData: function(options) {
		options = options || {identify: true};

		var helper = this.getHelper();
		if(helper && helper.getChildrenData) {
			return helper.getChildrenData.apply(helper,[this, options]);
		}

		return this._getChildrenData( options);
	},

	_getChildrenData: function( options) {
			return this.getChildren().map(function(w) { return w.getData( options); });
//		var childrenData = [];
//		var containerNode = davinci.ve.widget.getContainerNode(widget);
//		if(containerNode) {
//			var childNodes = containerNode.childNodes;
//			for(var i = 0; i < childNodes.length; i++) {
//				var n = childNodes[i];
//				var d = undefined;
//				switch(n.nodeType) {
//				case 1: // Element
//					var w = davinci.ve.widget.byNode(n);
//					if(w) {
//						d = davinci.ve.widget.getData(w, options);
//					}
//					break;
//				case 3: // Text
//					d = dojo.trim(n.nodeValue);
//					if(d && options.serialize) {
//						d = davinci.html.escapeXml(d);
//					}
//					break;
//				case 8: // Comment
//					d = "<!--" + n.nodeValue + "-->";
//					break;
//				}
//				if(d) {
//					childrenData.push(d);
//				}
//			}
//		}
//		if(childrenData.length === 0) {
//			return undefined;
//		}
//		return childrenData;
	},

	getClassNames: function() {
		return this._srcElement.getAttribute('class') || '';
	},

	_getData: function(options) {
		var data = {type: this.type, properties: {}};
		//FIXME: Might need OpenAjax widgets logic here someday
		if(options.identify) {
			if(!this._srcElement) { //wdr why is the _srcElement missing?
				this._srcElement = davinci.ve.widget._createSrcElement(this.domNode);
			}
			var idProp = this._srcElement._getAttribute("id");
			//if (this._srcElement._getAttribute("id").noPersist)
			if (idProp && idProp.noPersist)
				data.properties.isTempID=true;
			data.properties.id = this.id;
		}
		if ((options.preserveTagName !== false) && (this.id)) {
			data.tagName = this._srcElement.tag;
		}

		// get all properties
	    var properties = davinci.ve.metadata.query(this, "property");
	    if (this.domNode && this.domNode.parentNode) {
	        var parent = davinci.ve.widget.getEnclosingWidget(this.domNode.parentNode);
	        var childProperties = davinci.ve.metadata.query(parent, "childProperties");
	        if (childProperties) {
	            if (!properties) {
	                properties = childProperties;
	            } else {
	                properties = dojo.mixin({}, properties, childProperties);
	            }
	        }
	    }

		if(properties) {
			for(var name in properties) {
				if (this._skipAttrs.indexOf(name.toLowerCase()) !== -1) {
					continue;
				}
				var property = properties[name];
				/*if(name == "theme") {
					value = (davinci.ve.widget.getPropertyValue(widget, name)).themeName;
					data.properties[name] = value;
				}
				else{*/
					var value = this.getPropertyValue(name);
					if(value && value.length) {
						if(property.datatype == "array") {
							if(!davinci.ve._equals(value, property.defaultValue)) {
								data.properties[name] = value;
							}
						}else{
							if(value != property.defaultValue) {
								data.properties[name] = value;
							}
						}
					}else{
						if(property.datatype == "boolean" && value != property.defaultValue) {
							data.properties[name] = value;
						// HACK: There's probably a better way to do this with the new model, just a stopgap measure until Phil takes a look
						} else if (property.datatype && (property.datatype.indexOf("dijit") == 0 || property.datatype == "object" && property.isData)) {
							data.properties[name] = value;
						}
					}
				//}
			}
		}
		data.properties.style = this.getStyle(options);
		var classNames = this.getClassNames(options);
		if(classNames) {
			data.properties['class'] = classNames;
		}

		data.children = this.getChildrenData(options);

		return data;
	},

	getData: function(options) {
		options = options || {identify: true, preserveStates: true};

		var data, helper = this.getHelper();
		if(helper && helper.getData) {
			data =  helper.getData.apply(helper, [this, options]);
		}else{
			data = this._getData( options);
		}

		data.states=this.states;
		if(!data.properties)
			data.properties = {};

		if (this.properties) {
			for(var name in this.properties) {
				if(!(name in data.properties)) {
					data.properties[name] = this.properties[name];
				}
			}
		}
		
		// Save source for widget
		data.content = this._getElementSource();
		
		// Find "on*" event attributes that are in the model and
		// place on the data object. Note that Maqetta strips
		// on* event attributes from the DOM that appears on visual canvas.
		// Upon creating new widgets, the calling logic needs to 
		// put these attributes in model but not in visual canvas.
		var srcElement = this._srcElement;
		//FIXME: Assumes "attributes" is a public API. See #nnn
		var attributes = srcElement.attributes;
		for(var i=0; i<attributes.length; i++) {
			var attribute = attributes[i];
			if(attribute.name.substr(0,2).toLowerCase()=="on" ) {
				data.properties[attribute.name] = attribute.value;
			}
		}

		return data;
	},

    // Save source for widget, everything except for any widget children.
	_getElementSource: function() {
        var srcElement = this._srcElement,
            content = ['<'];
        content.push(srcElement.tag);
        srcElement.attributes.forEach(function(attr) {
            if (this._skipAttrs.indexOf(attr.name.toLowerCase()) === -1) {
                content.push(' $n="$v"'.replace('$n', attr.name).replace('$v', attr.value));
            }
        }, this);
        content.push('>');
        
        // look for any model children that aren't managed widgets
        var childWidgets = this.getChildren();
        srcElement.children.filter(function(child) {
            return ! childWidgets.some(function(w) {
                return w._srcElement === child;
            });
        }).forEach(function(child) {
            content.push(child.getText());
        });

        content.push('</$t>'.replace('$t', srcElement.tag));
        return content.join('');
	},

	getPropertyValue: function(name) {
		if(!name) {
			return undefined;
		}

//	TODO: implement helper
//		var helper = this.getHelper();
//		if(helper && helper.getPropertyValue) {
//			return helper.getPropertyValue.apply(this, [name]);
//		}
		if (name=='id') {
			return this.getId();
		} else if (name == 'jsId') {
			return this.getObjectId();
		}
		return this._getPropertyValue(name);
	},

	_getPropertyValue: function(name) {
		var widget=this._getWidget();
		if(widget && widget.get) {
			return widget.get(name);
		}
		return widget && widget[name];
	},

	_getWidget: function() {
	},

	getTagName: function()
	{
		return this.domNode.nodeName.toLowerCase();
	},

	getStyleValues: function( options) {

		var style = this.getStyleNode().style;
		var text = this._srcElement.getAttribute("style");

		var values =davinci.ve.widget.parseStyleValues(text);

		if(style) {
			if(style.position == "absolute" || style.position == "relative") {
				var parent = this.getParent();
				if(parent && parent.dijitWidget && parent.dijitWidget.addChild) {
					values.position = undefined;
					values.left = undefined;
					values.top = undefined;
				}else{
					values.position = style.position;
					values.left = style.left;
					values.top = style.top;
				}
			}
			var resizable = davinci.ve.metadata.queryDescriptor(this.type, "resizable");
			if(style.width) {
				if(resizable == "both" || resizable == "width") {
					values.width = style.width;
				}
			}
			if(style.height) {
				if(resizable == "both" || resizable == "height") {
					values.height = style.height;
				}
			}
		}
		return values;
	},
	_updateSrcStyle: function()
	{
		var styleValue=this.getStyle();
		if (styleValue.length>0)
		{
			this._srcElement.addAttribute("style",styleValue);
		}
		else
		{
			this._srcElement.removeAttribute("style");
		}
	},
	setStyleValues: function( values) {
		if(!values) {
			return;
		}
		var style = this.getStyleNode().style;
		var v = this._sortStyleValues(values);

		for(var i=0;i<v.length;i++) {
			var value = (v[i].value || "");
			var name = v[i].name;

			if(name.indexOf("-") >= 0) {
				// convert "property-name" to "propertyName"
				var names = name.split("-");
				name = names[0];
				for(var j = 1; j < names.length; j++) {
					var n = names[j];
					name += (n.charAt(0).toUpperCase() + n.substring(1));
				}
			}
			/* lots of input boxes convert */
			if(value=="")
				value = null;

			style[name] = value;
		}

		var text = this._styleText(v);

		if (this.dijitWidget)
			this.dijitWidget.style = text;
		if (text.length>0)
			this._srcElement.addAttribute("style",text);
		else
			this._srcElement.removeAttribute("style");

		style.cssText = text;

	},

	isLayout: function()
	{
		return false;
	},
	resize: function()
	{

	},

	removeChild: function( /*Widget*/child) {
		if(!child) {
			return;
		}
		var containerNode = this.getContainerNode();
		if(containerNode) {
			containerNode.removeChild(child.domNode);
			this._srcElement.removeChild(child._srcElement);
		}
	},

	setProperties: function(properties, modelOnly) {
		if(!this.properties) {
			this.properties = {};
		}

		modelOnly = modelOnly || false; // default modelOnly to false

		if (properties.id)
		{
			this._srcElement.addAttribute("id", properties.id,properties.isTempID);
			delete properties.id;
			delete properties.isTempID;
		}
		if (properties.isTempID) { // delete so it does not make it's way to the source
			delete properties.isTempID;
		}
		for(var name in properties) {
			var property = properties[name];
			// The following check on "property" will result in false value for empty strings
			if(property || typeof property == "boolean") {
				var value=this._stringValue(name, property);
				if ( ! modelOnly ) {
				    this.properties[name] = value;
				}
				this._srcElement.addAttribute(name, value);
			} else {
			    delete this.properties[name];
				this._srcElement.removeAttribute(name);
				/*
				 * WORKAROUND for issue 771
				 * This workaround can be removed once we integrate a version of dojo
				 * which includes the fix for http://bugs.dojotoolkit.org/ticket/13776
				 */
				var w = this._getWidget();
				if (name == "back" && w.declaredClass != undefined && w.declaredClass == "dojox.mobile.Heading") dojo.destroy(w._btn);
			}
		}
	},

	startup: function()
	{

	},
	renderWidget: function() {
	},
	destroyWidget: function(widget) {
		var helper = this.getHelper();
		if(helper && helper.destroyWidget) {
			helper.destroyWidget(this);
			return;
		}
		if (this.dijitWidget)
			this.dijitWidget.destroyRecursive();
		else
		{
			dojo.forEach(this.getChildren(),function(each) {each.destroyWidget()});
		}
	},
	selectChild: function(widget)
	{

	},
	attach: function()
	{
		var helper = this.getHelper();
		if(helper && helper.create) {
			helper.create(this, this._srcElement);
		}
	},
	_stringValue: function (attributeName, value)
	{
	    var metadata = this.getMetadata();
		var property = metadata.property && metadata.property[attributeName];
		if (!property)
			return value;
		if (property.datatype == "object") {
			if (value.getObjectId) {
				value = value.getObjectId();
		    } else {	// not wrapped
				var objectId = value._edit_object_id;
				if(objectId) {
					return objectId;
				}
				if(value.domNode) {
					return value.domNode.getAttribute("jsId");
				}
			}
		} else if(property.datatype == "json") {
			// Kludge to prevent array from iframe from being mistaken as object
			var context = this.getContext();
			var dj = context && context.getDojo() || dojo;
			
			var helper = this.getHelper();
			if(helper && helper.checkValue) {
				value =  helper.checkValue(value);
			}
			
			if(dj.isObject(value)) {
				value = dj.toJson(value);
			}
		} else if (property.datatype == "string") {
		    switch (property.format) {
// shouldn't be needed
//		        case "url":
//	                value = this.getContext().getContentUrl(value);
//		            break;
		        case "date":
		        case "time":
		        	if(isFinite(value)) {
		        		value = dojo.date.stamp.toISOString(value, {selector: property.format});
		        	}/*else{
		        		value = "";
		        	}*/
		            break;
		        default:
		        	 value = dojox.html.entities.encode(value); //When placing data in an HTML attribute, we should probably just encode it to be safe.

		    }
// XXX is this used?
//		}else if(property.type == "widget") {
//			if (value.getId)
//				value = value.getId();
//			else
//			   value=value.id;
		}
		return value;
	}
});

});
