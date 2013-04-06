define("davinci/ve/_Widget", [
	"dojo/_base/declare",
	"./metadata",
	"../html/CSSModel",
	"dojox/html/entities",
	"davinci/ve/utils/StyleArray",
	"davinci/ve/utils/GeomUtils"
], function(
	declare,
	metadata,
	CSSModel,
	htmlEntities,
	StyleArray,
	GeomUtils
) {
var arrayEquals = function(array1, array2, func){
	if(array1 == array2){
		return true;
	}
	if(!array1 || !array2){
		return false;
	}
	if(array1.length != array2.length){
		return false;
	}
	for(var i = 0; i < array1.length; i++){
		if(func){
			if(!func(array1[i], array2[i])){
				return false;
			}
		}else{
			if(array1[i] != array2[i]){
				return false;
			}
		}
	}
	return true;
};

return declare("davinci.ve._Widget", null, {

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
	
	indexOf: function(child) {
		var helper = this.getHelper();
		if (helper && helper.indexOf) {
			return helper.indexOf(this, child); 
		}
		return dojo.indexOf(this.getChildren(), child);
	},

	_getChildren: function(attach) {
		var containerNode = this.getContainerNode(),
			children = [];

		if (containerNode) {
			dojo.forEach(containerNode.children, function(node) {
				if (attach) {
					children.push(require("davinci/ve/widget").getWidget(node));
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

		if (metadata.getAllowedChild(this.type)[0] !== 'NONE') {
			return this._getContainerNode();
		}
		return null;
	},

	_getContainerNode: function() {
		return this.domNode;
	},

	getMetadata: function() {
        if (!this.metadata) {
            this.metadata = metadata.query(this);
        }
        return this.metadata;
    },

	getHelper: function() {
        if (!this._edit_helper) {
            this._edit_helper = require("davinci/ve/widget").getWidgetHelper(this.type);
        }
        return this._edit_helper;
    },

	attr: function(name,value)
	{
		var attrValue = this._attr.apply(this, arguments);
		if (arguments.length>1) {
			value=this._stringValue(name, value);
			this._srcElement.addAttribute(name,value);
		} else {
			return attrValue;
		}
	},

	_attr: function(name,value) {
	},

	indexOf: function(child) {
		var helper = this.getHelper();
		if (helper && helper.indexOf) {
			return helper.indexOf(this, child); 
		}
		return dojo.indexOf(this.getChildren(), child);
	},

	getStyleNode: function() {
		return this.styleNode || this.domNode; // for Textarea on FF2
	},

	addChild: function(child, index) {
		var containerNode = this.getContainerNode();
		if (containerNode) {
			// add to model (source)
			if (index === undefined || index === null || index === -1) {
				this._srcElement.addChild(child._srcElement);
			} else {
				var children = this.getChildren();
				if (index < children.length) {
					this._srcElement.insertBefore(child._srcElement,children[index]._srcElement);
				} else {
					this._srcElement.addChild(child._srcElement);
				}
			}

			// add to VE DOM
			var helper = this.getHelper();
			if (helper && helper.addChild) {
				helper.addChild(this, child, index);
			} else {
				this._addChildToDom.apply(this, arguments);
			}
		}
	},

	_addChildToDom: function(child, index) {
		var node = child.domNode;
		var containerNode = this.getContainerNode();
		if (index === undefined || index === null || index === -1) {
			containerNode.appendChild(node);
		} else {
			var children = this.getChildren();
			if (index < children.length) {
				containerNode.insertBefore(node, children[index].domNode);
			} else {
				containerNode.appendChild(node);
			}
		}
	},

	getParent: function() {
		return require("davinci/ve/widget").getEnclosingWidget(this.domNode.parentNode) || this.domNode.parentNode;
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
		var node = this.domNode;
		var box = null;
		var helper = this.getHelper();
		if(helper && helper.getMarginBoxPageCoords){
			box = helper.getMarginBoxPageCoords(this);
		} else {
			box = GeomUtils.getMarginBoxPageCoords(node);
		}
		box.l -= GeomUtils.getScrollLeft(node);
		box.t -= GeomUtils.getScrollTop(node);
		box.x = box.l;
		box.y = box.t;
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
		
		var cleaned = dojo.clone(values);
		
		function indexWithProperty(value){
			for(var i=0;i<cleaned.length;i++){
				if(cleaned[i] && cleaned[i].hasOwnProperty(value)) { return i; }
			}
			return -1;
		}
		
		// return a sorted array of sorted style values.
		var shorthands = CSSModel.shorthand;
		var lastSplice = 0;
		/* re-order the elements putting short hands first */
		
		for(var i=0;i<shorthands.length;i++) {
			var index = indexWithProperty(shorthands[i][0]);
			if(index>-1) {
				var element = cleaned[index];
				cleaned.splice(index,1);
				cleaned.splice(lastSplice,0, element);
				
				lastSplice++;
			}
		}
		return cleaned;
	},

	_styleText: function (v) {
		var s = "";
		/* if ordering is given, respect it */
		
		if(dojo.isArray(v)){
			var vArray = davinci.ve.states.normalizeArray("style", this.domNode, name, v);
			for(var i = 0;i<vArray.length;i++) {
				for(var name in vArray[i]){	// Should be only one property in each array item
					value = vArray[i][name];
					if(value !== undefined && value != "" && value!=null) {
						s += name + ": " + vArray[i][name] + "; ";
					}
				}
			}
		}else{
			for(var name in v){
				
				value = davinci.ve.states.normalize("style", this.domNode, name, v[name]);
				if(value !== undefined && value != "" && value!=null) {
					s += name + ": " + v[name] + "; ";
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
		return this.getChildren().map(function(w) { return w.getData(options); });
	},

	getClassNames: function() {
		return this._srcElement.getAttribute('class') || '';
	},

	_getData: function(options) {
		var data = {type: this.type, properties: {}},
			widgetUtils = require("davinci/ve/widget");
		//FIXME: Might need OpenAjax widgets logic here someday
		if(options.identify) {
			if(!this._srcElement) { //wdr why is the _srcElement missing?
				this._srcElement = widgetUtils._createSrcElement(this.domNode);
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
	    var properties = metadata.query(this, "property");
	    if (this.domNode && this.domNode.parentNode) {
	        var parent = widgetUtils.getEnclosingWidget(this.domNode.parentNode);
	        var childProperties = metadata.query(parent, "childProperties");
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
					value = require("davinci/ve/widget").getPropertyValue(widget, name).themeName;
					data.properties[name] = value;
				}
				else{*/
					var value = this.getPropertyValue(name);
					if(value && value.length) {
						if(property.datatype == "array") {
							if(!arrayEquals(value, property.defaultValue)) {
								data.properties[name] = value;
							}
						}else{
							if(value != property.defaultValue) {
								data.properties[name] = value;
							}
						}
					}else{
						// handle bool/numeric
						if((property.datatype == "boolean" || property.datatype == "number") && value != property.defaultValue) {
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

		data.maqAppStates=dojo.clone(this.domNode._maqAppStates);
		data.maqDeltas=dojo.clone(this.domNode._maqDeltas);
		if(!data.properties)
			data.properties = {};

		if (this.properties) {
			for(var name in this.properties) {
				if(!(name in data.properties)) {
					data.properties[name] = this.properties[name];
				}
			}
		}
		
		// Find "on*" event attributes and a[href] attributes that are in the model and
		// place on the data object. Note that Maqetta strips
		// on* event attributes and href attributes from the DOM that appears on visual canvas.
		// Upon creating new widgets, the calling logic needs to 
		// put these attributes in model but not in visual canvas.
		var srcElement = this._srcElement;
		//FIXME: Assumes "attributes" is a public API. See #nnn
		var attributes = srcElement.attributes;
		for(var i=0; i<attributes.length; i++) {
			var attribute = attributes[i];
			if(attribute.name.substr(0,2).toLowerCase()=="on" ) {
				data.properties[attribute.name] = attribute.value;
			}else if(srcElement.tag.toLowerCase() == 'a' && attribute.name.toLowerCase()=='href'){
				data.properties[attribute.name] = attribute.value;
			}
		}

		return data;
	},

	getPropertyValue: function(name) {
		if (name === 'id') {
			return this.getId();
		} else if (name === 'jsId') {
			return this.getObjectId();
		}

		var helper = this.getHelper();
		if (helper && helper.getPropertyValue) {
			// FIXME: Helper has to know about _getPropertyValue function
			// Would be cleaner if we used OO approach
			return helper.getPropertyValue(this, name);
		}

		return this._getPropertyValue(name);
	},

	_getPropertyValue: function(name) {
		return this.domNode.getAttribute(name);
	},

	getTagName: function()
	{
		return this.domNode.nodeName.toLowerCase();
	},

	getStyleValues: function() {

		function removeProperty(propName){
			for(var j=values.length-1; j>=0; j--){
				var item = values[j];
				if(item[propName] !== undefined){
					values.splice(j, 1);
				}
			}
		}
		var style = this.getStyleNode().style;
		var text = this._srcElement.getAttribute("style");

		var values = require("davinci/ve/widget").parseStyleValues(text);

/*FIXME: DELETE THIS. Leaving it in temporarily in case in last-minute Preview 6 testing we discover a need for this logic
		var o;
		if(style) {
			if(style.position == "absolute" || style.position == "relative") {
				var parent = this.getParent();
				removeProperty('position');
				removeProperty('left');
				removeProperty('top');
				//FIXME: This is Dojo-specific logic within a toolkit-independent file
				if(parent && parent.dijitWidget && parent.dijitWidget.addChild && !parent.acceptsHTMLChildren) {
					// Do nothing - logic above removed position/left/top
				}else{
					values.push({position:style.position});
					values.push({left:style.left});
					values.push({top:style.top});
				}
			}
			var resizable = metadata.queryDescriptor(this.type, "resizable");
			if(style.width) {
				if(resizable == "both" || resizable == "width") {
					removeProperty('width');
					values.push({width:style.width});
				}
			}
			if(style.height) {
				if(resizable == "both" || resizable == "height") {
					removeProperty('height');
					values.push({height:style.height});
				}
			}
		}
*/
		var parent = this.getParent();
		//FIXME: This is Dojo-specific logic within a toolkit-independent file
		if(style && parent && parent.dijitWidget && parent.dijitWidget.addChild && !parent.acceptsHTMLChildren) {
			removeProperty('position');
			removeProperty('left');
			removeProperty('top');
		}
		return values;
	},

	/**
	 * Returns an associative array holding all CSS properties for a given widget
	 * for all application states that have CSS values.
	 * The associative array is indexed by the application states in the current page,
	 * with Normal state named 'undefined'. In the associative array, each property
	 * is a valueArray: an array of objects, where each object is {<propname>:<propvalue>}.
	 * For example:
	 * {'undefined':[{'color':'red},{'font-size':'12px'}],'State1':[{'font-size':'20px'}]}
	 */
	getStyleValuesAllStates: function(){
		//FIXME: Normal states shouldn't accidentally become 'undefined'
		var normalStyleArray = this.getStyleValues();
		var styleValuesAllStates = {'undefined':normalStyleArray};
		var states = this.domNode._maqDeltas;
		if(states){
			for(var state in states){
				if(states[state].style){
					if(state == 'undefined'){
						styleValuesAllStates[state] = StyleArray.mergeStyleArrays(normalStyleArray, states[state].style);
					}else{
						styleValuesAllStates[state] = states[state].style;
					}
				}
			}
		}
		return styleValuesAllStates;
	},

	_updateSrcStyle: function() {
		var styleValue=this.getStyle();
		if (styleValue.length) {
			this._srcElement.addAttribute("style",styleValue);
		} else {
			this._srcElement.removeAttribute("style");
		}
	},
	
	_getStyleString: function(values){
		if(!values) {
			return '';
		}
		var v = this._sortStyleValues(values);
		/* we used to retrieve the style properties as an array, then flatten the values.
		 * 
		 * changed to serialize it as text, then reset the style attribute 
		 */
		
		/*
		for(var i=0;i<v.length;i++) {
			for(var name in v[i]){
			var value = v[i][name] || "";
			if(name.indexOf("-") >= 0) {
				// convert "property-name" to "propertyName"
				var names = name.split("-");
				name = names[0];
				for(var j = 1; j < names.length; j++) {
					var n = names[j];
					name += (n.charAt(0).toUpperCase() + n.substring(1));
				}
			}
			if(value=="")
				value = null;

			style[name] = value;
		
			}
		}
		*/
		var text = this._styleText(v);
		return text;
	},

	/**
	 * Updates element.style for current widget as shown on page canvas
	 * (The values passed in might be state-specific)
	 */
	setStyleValuesCanvas: function( values) {	
		if(!values) {
			return;
		}
		var text = this._getStyleString(values);
		var styleDomNode = this.getStyleNode();
		
		/* reset the style attribute */
		dojo.attr(styleDomNode, "style", text);
		
		if (this.dijitWidget)
			this.dijitWidget.style = text;
	},
	
	/**
	 * Update element.style in model
	 */
	setStyleValuesModel: function( values) {
		var text = this._getStyleString(values);
		if (text.length>0)
			this._srcElement.addAttribute("style",text);
		else
			this._srcElement.removeAttribute("style");
	},
	
	/**
	 * Returns an associative array holding all CSS properties for a given widget
	 * for all application states that have CSS values.
	 * The associative array is indexed by the application states in the current page,
	 * with Normal state named 'undefined'. In the associative array, each property
	 * is a valueArray: an array of objects, where each object is {<propname>:<propvalue>}.
	 * For example:
	 * {'undefined':[{'color':'red},{'font-size':'12px'}],'State1':[{'font-size':'20px'}]}
	 */
	setStyleValuesAllStates: function(styleValuesAllStates){
		this.domNode._maqDeltas = undefined;
		if(styleValuesAllStates){
			for(var state in styleValuesAllStates){
				var styleArray = styleValuesAllStates[state];
				//FIXME: Normal states shouldn't accidentally become 'undefined'
				if(state === 'undefined'){
					state = undefined;
				}
				davinci.ve.states.setStyle(this.domNode, state, styleArray, true /*silent*/);
			}
		}
	},

	isLayout: function() {
		return false;
	},

	resize: function() {
	},
	
	/* if the widget is a child of a dijit Container widget 
	 * we may need to refresh the parent to make it all look correct in page editor
	 * FIXME: need to factor out dijit-specific code from this base class
	 */ 
	refresh: function(){
		var parent = this.getParent();
		if (parent.dijitWidget){
			parent.refresh();
		} else if (this.resize){
			this.resize();
		}
	},

	removeChild: function(/*Widget*/child) {
		// remove from model (source)
		this._srcElement.removeChild(child._srcElement);

		// remove from VE DOM
		var helper = this.getHelper();
		if (helper && helper.removeChild) {
			helper.removeChild(this, child);
		} else {
			this._removeChildFromDom.apply(this, arguments);
		}
	},

	_removeChildFromDom: function(child) {
		var node = child.domNode;
		if (node && node.parentNode) {
			node.parentNode.removeChild(node);
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
			if(property || typeof property == "boolean" || typeof property == "number") {
				var value=this._stringValue(name, property);
				if (!modelOnly) {
				    this.properties[name] = value;
				}
				this._srcElement.addAttribute(name, value);
			} else {
			    delete this.properties[name];
				this._srcElement.removeAttribute(name);
			}
		}
	},

	startup: function() {
	},

	renderWidget: function() {
	},

	destroyWidget: function(widget) {
		var helper = this.getHelper();
		if(helper && helper.destroy) {
			helper.destroy(this);
			return;
		}
		if (this.dijitWidget) {
			// XXX Dijit-specific code, doesn't belong here.
			this.dijitWidget.destroyRecursive();
		} else {
			dojo.forEach(this.getChildren(),function(each) { each.destroyWidget(); });
		}
	},

	selectChild: function(widget) {
	},

	attach: function() {
		var helper = this.getHelper();
		if(helper && helper.create) {
			helper.create(this, this._srcElement);
		}
	},

	_stringValue: function (attributeName, value) {
		
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
		        	 value = htmlEntities.encode(value); //When placing data in an HTML attribute, we should probably just encode it to be safe.

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
