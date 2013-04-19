define([
	"davinci/html/HTMLElement", //HTMLElement
	"../Runtime",
	"./metadata",
	"dojo/Deferred",
	"./DijitWidget",
	"./GenericWidget",
	"./HTMLWidget",
	"./ObjectWidget",
	"dojo/window"
], function(
	HTMLElement,
	Runtime,
	metadata,
	Deferred,
	DijitWidget,
	GenericWidget,
	HTMLWidget,
	ObjectWidget,
	dojoWindow
) {

var helperCache = {};

//Add temporary IDs to nested children
//Assumes iframe's DOM and the model are in sync regarding the order of child nodes
var childrenAddIds = function(context, node, srcElement) {
	 for (var i=0;i<srcElement.children.length; i++) {
		 var childNodeDOM = node.childNodes[i];
		 var childNodeModel = srcElement.children[i];
		 if((childNodeDOM && childNodeDOM.nodeType==1/*element*/) && childNodeModel.elementType=="HTMLElement"){ //node may have a different child count - wdr
			 childNodeDOM.id = context.getUniqueID(childNodeModel);
			 childrenAddIds(context,childNodeDOM,childNodeModel);
		 }
	 }
};

var parseNodeData = function(node, options) {
	// summary:
	// 		Same general routine as widgetObject._getData,
	// 		only adding the "html." prefix to the widget type to make it look like a widget to the Dojo Composition Tool.
	//
	if(!node){
		return undefined;
	}

	options = options || {};

	var data = {};
	data.properties = {};

	for(var i = 0; i < node.attributes.length; i++){
		var a = node.attributes[i];
		if(!a.specified || !a.nodeValue){
			continue;
		}
		var n = a.nodeName.toLowerCase();
		if(n == "id" || n == "widgetid" || n == "style"){
			continue;
		}else if(n.charAt(0) == "_"){
			continue;
		}
		var v = a.nodeValue;
		if(v && n == "class"){
			v = v.replace("HtmlWidget", "").trim();
			if(!v){
				continue;
			}
		}
//		if(options.serialize){
//			var p = properties[n];
//			if(p && p.type == "url"){
//				v = context.getContentUrl(v);
//			}
//		}
		data.properties[n] = v;
	}

	if(node.tagName.toLowerCase() == "script"){
		data.children = (node.innerHTML || undefined);
	}//else{
	//	data.children = widgetObject._getChildrenData(widget, options);
	//}
	return data;
};

var widgetObject = {
_dojo: function(node) {
	var doc = node ? (node.ownerDocument || node) : dojo.doc;
//TODO: for some reason node.ownerDocument is occasionally null
	doc=doc||dojo.doc;
	var win = dojoWindow.get(doc);
	return win.dojo || dojo;
},

_dijit: function(node) {
	var doc = node ? (node.ownerDocument || node) : dojo.doc;
	var win = dojoWindow.get(doc);
	return win.dijit || dijit;
},

//Turns text into an an array of style values
parseStyleValues: function(text) {
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

//Looks for a particular property within styleArray
retrieveStyleProperty: function(styleArray, propName, defaultValue){
	var propValue = defaultValue;
	if(styleArray) {
		dojo.some(styleArray, function(o){
			if(o.hasOwnProperty(propName)){
				propValue = o[propName];
				return true;
			}
		});
	}
	return propValue;
},

//sets value of a particular property in styleArray (or adds if property not found)
setStyleProperty: function(styleArray, propName, value){
	var modifiedProperty = false;
	if(styleArray) {
		dojo.some(styleArray, function(o){
			if(o.hasOwnProperty(propName)){
				o[propName] = value;
				modifiedProperty = true;
				return true;
			}
		});
	}
	if (!modifiedProperty) {
		var o = {};
		o[propName] = value;
		styleArray.push(o);
	}
},

//turn styleArray back into string
getStyleString: function(styleArray) {
	var styleStr = "";
	dojo.forEach(styleArray, function(style) {
		for (var p in style){
			if (style[p]){
				styleStr = styleStr + p +':' + style[p] + ';';
			}
		}
	});
	return styleStr;
},

/**
 * Return instance of "managed" widget which contains the given 'node'.
 *
 * @param {DOMElement | davinci.ve._Widget} node
 * 			Element for which to find enclosing "managed" widget.
 *
 * @return "managed" widget instance which contains 'node'; 'undefined' if no
 * 			such valid widget instance is found.
 * @type {davinci.ve._Widget}
 */
getEnclosingWidget: function(node) {
	var richText = widgetObject.getEnclosingWidgetForRichText(node);
	if (richText) {
		return richText;
	}
	var enc = node;
	while (enc) {
		if (enc._dvWidget) {
			return enc._dvWidget;
		}
		//        DOMElement || davinci.ve._Widget
		enc = enc.parentNode || (enc.domNode && enc.domNode.parentNode);
	}
},

getEnclosingWidgetForRichText: function(node) {
	if (!node || !node._dvWidget){ return; }
	if (node._dvWidget.type === 'html.stickynote' || node._dvWidget.type === 'html.richtext' ){
		return node._dvWidget;
	} else if (node.parentNode){
		return widgetObject.getEnclosingWidgetForRichText(node.parentNode);
	} else {
		return null;
	}
},

// used by helpers
getUniqueObjectId: function(type, node) {
	if(!type){
		return undefined;
	}

	var base = type.substring((type.lastIndexOf("/") || type.lastIndexOf(".")) + 1);
	var i = 1;
	var id = base + "_" + i++;
	var dj = widgetObject._dojo(node);
	while(dj.getObject(id) || dj.byId(id)){
		id = base + "_" + i++;
	}
	return id;
},

//FIXME: This is a hack so that meaningful names
//don't show a bunch of ugly prefix stuff.
//Need a better approach for this.
_remove_prefix: function(str){
	var returnstr = str;
	var prefixes_to_remove=[
	                	    'dijit/form/',
	                	    'dijit/layout/',
	                	    'dijit/',
	                	    'dojox/mobile/',
	                	    'html.',
	                	    'html/',
	                	    'OpenAjax.',
	                	    'OpenAjax/'];
	for(var i=0; i<prefixes_to_remove.length; i++){
		if(str.indexOf(prefixes_to_remove[i])==0){ // use ===?
			returnstr=str.substr(prefixes_to_remove[i].length);
			//FIXME: Another hack. Need a better approach for this.
			//Special case logic for HTML widgets
			if(prefixes_to_remove[i]=='html.'){
				returnstr='&lt;'+returnstr+'&gt;';
			}
			break;
		}
	}
	return returnstr;
},

_getWidgetNameText: function(type){
	var text = "<span class='propertiesTitleWidgetName'>";
	text+=this._remove_prefix(type);
	text+="</span> ";
	return text;
},

_getWidgetClassText: function(id, className){
	var text = "<span class='propertiesTitleClassName'>";
	//text += node.tagName;
	if (id) {
		text += "#" + id;
	}
	if (className) {
		text += "." + className.replace(/\s+/g,".");
	}
	text += "</span> ";
	return text;
},

/**
 * Simpler version of getLabel, called as part of review/commenting,
 * when there isn't a widget object available.
 * @param node
 * @returns string to display in Maqetta's UI
 */
getLabelForNode: function(node) {
	var type = node.getAttribute('data-dojo-type') || node.getAttribute('dojoType');
	if(!type){
		type = node.tagName.toLowerCase();
	}
	type = type.replace(/\./g, "/");
	var text = this._getWidgetNameText(type);
	//FIXME: temporarily not showing classname because mobile views look better
	// in review/commenting, but really instead of hard-coding this, we should
	// default to showing classname and allow sceneManager to override the default
	if(node.id /* || node.className*/){
		text += this._getWidgetClassText(node.id /*, node.className*/);
	}
	return text;
},

getLabel: function(widget) {
	var text = this._getWidgetNameText(widget.type);

	var widgetText,
		helper = widgetObject.getWidgetHelper(widget.type);
	if (helper && helper.getWidgetText) {
		widgetText = helper.getWidgetText(widget);
	}

	//TODO: move to getWidgetText helper methods
	var domNode = widget.domNode;
	switch(widget.type.replace(/\//g, ".")){
		case 'dijit.form.ComboBox':
		case 'dijit.form.Button':
			widgetText = widget.attr("label");
			break;
		case 'dijit.layout.ContentPane':
			widgetText = widget.attr("title");
			break;
		case 'html.label':
			widgetText = domNode.innerHTML;
			break;
		case 'html.img':
			widgetText = domNode.alt;
			if(!widgetText){
				widgetText = domNode.title;
			}
	}

	if (widgetText) {
		text += "<span class='propertiesTitleWidgetText'>" + widgetText + "</span> ";
	}

	if (helper && helper.getWidgetDescriptor) {
		text += " <span class='propertiesTitleWidgetDescriptor'>" + helper.getWidgetDescriptor(widget) + "</span> ";
	}

	/* add the class */
	var srcElement = widget._srcElement;
	var id = widget.getId();
	var classAttr = srcElement && srcElement.getAttribute("class");
	var className = classAttr && classAttr.trim();
	if (id || className) {
/*
		text += "<span class='propertiesTitleClassName'>";
		//text += node.tagName;
		if (id) {
			text += "#" + id;
		}
		if (className) {
			text += "." + className.replace(/\s+/g,".");
		}
		text += "</span> ";
*/
		text += this._getWidgetClassText(id, className);
	}

	if (helper && helper.getWidgetTextExtra) {
		text += helper.getWidgetTextExtra(widget);
	}

	//TODO: move to getWidgetTextExtra helper methods
	if (widget.type == 'html.img') {
		text += '<span>' + domNode.src.substr(domNode.src.lastIndexOf('/') + 1) + '</span>';
	}
	return text;
},

byId: function(id, doc) {
	var node=dojo.byId(id, doc && doc.body ? doc : undefined); // we're sometimes getting called with context as the second arg; don't pass it as a doc.
	if (node)
	{
		if (node._dvWidget) {
			return node._dvWidget;
		}
		var widget=widgetObject.getEnclosingWidget(node);
		if (widget.id==id) {
			return widget;
		}
	}
	if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
		var context = Runtime.currentEditor.currentEditor.context;
		return context.widgetHash[id];
	}
	return undefined;
},

byNode: function(node) {
	if (node._dvWidget) {
		return node._dvWidget;
	}
//	var d = widgetObject._dijit(node);
//	var w= d.byNode(node);
//	if (w)
//	{
//		node._dvWidget=w;
//	}
//	return w;
},

/**
 * Main routine for creating a new widget on the current page canvas
 * @param {object} data  (Needs to be documented!)
 */
createWidget: function(widgetData) {
	if(!widgetData || !widgetData.type){
		return undefined;
	}
	// Some logic below changes the data.properties object. We don't want to mess up
	// other downstream logic in the product, particularly given than data
	// sometimes is a pointer to the original widget object from widgets.json.
	// For purposes of this routine, OK to do a shallow clone of data and data.properties.
	var data = dojo.mixin({}, widgetData);
	if(data.properties){
		data.properties = dojo.mixin({}, widgetData.properties);
	}
	
	var type = data.type, c, theme, dojoType,
		md = metadata.query(type);
	if (!md) {
	    return undefined;
	}

	if(data.properties){
		// ContentPane content:"" as a default is confusing ModifyCommand.  If we pass this as a default, it will
		// empty out ContentPanes anytime they're modified, so remove for now.  We could remove this property from the metadata.
		if("content" in data.properties && !data.properties.content){
			delete data.properties.content;
		}
		if(data.properties.theme){
			theme = data.properties.theme.themeName;
		}
	}
	var widgetClassId = metadata.queryDescriptor(type, "widgetClass");
	var widgetClass;
	if(widgetClassId == "object"){
		dojoType = type;
		widgetClass = ObjectWidget;
		// Temporary Hack: Required when object specifies a jsId, otherwise object is not created
		// see davinci.ve.ObjectWidget::postCreate::if(id)::var type = this.getObjectType(); (type = undefined without the following lines to add dojoType to the element attributes)
		// Drag tree onto canvas to test.
		// Berkland: Please review! (needs replacing)
		md.attributes = md.attributes || {};
		md.attributes.dojoType = dojoType;
	}else if(widgetClassId == "html"){
		widgetClass = HTMLWidget;
//	}else if(widgetClassId == "OpenAjax"){
//		widgetClassName="davinci.ve.OpenAjaxWidget";
	}else if(widgetClassId == "dijit"){
		widgetClass = DijitWidget;
	} else { // if(widgetClassId == "generic"){
		widgetClass = GenericWidget;
	}
	if(!widgetClass){
		//debugger;
		return undefined;
	}
	c = widgetClass;

	// XXX eventually replace with dojo.place()?
	// XXX Technically, there can be more than one 'content'
    var content = md.content.trim().replace(/\s+/g, ' ');
	var node = dojoWindow.get(dojo.doc).dojo._toDom(content);
	// XXX Used to create node like this, which added attributes from metadata, is there still a way to do this?
	//	var node = dojo.create(md.tagName || "div", md.attributes);

	// Check if widget content consists of more than one node
	if (node.nodeType === 11 /*DOCUMENT_FRAGMENT_NODE*/) {
	    var count = 0,
	        n = null,
	        children = node.childNodes;
	    for (var i = 0; i < children.length; i++) {
	        if (children[i].nodeType !== 8 /*COMMENT_NODE*/) {
	            count++;
	            n = children[i];
	            if (count > 1) {
	                break;
	            }
	        }
	    }
	    // XXX more than one node not supported
	    if (count > 1) {
	        console.error("ERROR: complex widget content not supported");
	        return;
	    }
        node = n;
	}

    var srcElement = new HTMLElement(node.tagName.toLowerCase());
    if (node.hasAttributes()) {
        var attrs = node.attributes;
        for (var j = attrs.length - 1; j >= 0; --j) {
            srcElement.addAttribute(attrs[j].name, attrs[j].value);
        }
    }
    if (node.innerHTML) {
        srcElement.addText(node.innerHTML);
    }

    var requiresId = metadata.queryDescriptor(type, "requiresId"),
    	name = metadata.queryDescriptor(type, "name"),
    	idRoot = requiresId && name.match(/^[A-Za-z]\w*$/) ? name : undefined;

    node.id = (data.properties && data.properties.id) || data.context.getUniqueID(srcElement, idRoot);

	var children = data.children;
	if(children){
		if(dojo.isString(children)){
			node.innerHTML = children;
			var nodeNameLC = node.nodeName.toLowerCase();
			// 'id' attribute might be temporary. Store off temporarily.
			var idattr = srcElement._getAttribute('id');
			// Temporarily add string as a text node
			srcElement.addText(children);
			// Retrieve outerHTML version, which won't include a temporary 'id' attribute
			var temp_outerHTML = srcElement.getText(data.context);
			// Black out existing children, which will unattach the textnode child inserted above
			srcElement.children = [];
			// Reparse the element
			srcElement.setText(temp_outerHTML);
			// Restore 'id' attribute.
			if(idattr){
				srcElement.addAttribute(idattr.name,idattr.value,idattr.noPersist);
			}
			// Add a temporary ID to all of the nested elements that do not have an ID
			childrenAddIds(data.context, node, srcElement);
		}else{ // Array
			dojo.forEach(children, function(c){
				if (!c){
					return;
				}
				if(dojo.isString(c)){ // Text or Comment
					if(c.length > 7 && c.substring(0, 4) == "<!--" &&
						c.substring(c.length - 3) == "-->"){
						node.appendChild(dojo.doc.createComment(c.substring(4, c.length - 3)));
						srcElement.addComment(c.substring(4, c.length - 3));
					}else{
						node.appendChild(dojo.doc.createTextNode(c));
						srcElement.addText(c);
					}
				}else{
					c.context=data.context;
                    // XXX Need to load requires on 'c' first?
					var child = widgetObject.createWidget(c);
					if(child){
						node.appendChild(child.domNode);
						srcElement.addChild(child._srcElement);
					}
				}
			});
		}
	}
	//need a helper to process the data for horizontalSlider prior to creating the widget
	// -- may be needed for other widgets with properties of dataype array
	var helper = widgetObject.getWidgetHelper(type);
	if(helper && helper.preProcessData){
        data =  helper.preProcessData(data);
	}

	// Strip out event attributes and a[href] attributes. We want them in the model
	// but not in the DOM within page canvas.
	// FIXME: should make the check for a[href] into a helper so other
	// widgets can register similar attributes
	var canvasAndModelProps = {};
	var modelOnlyProps = {};
	for (var p in data.properties) {
		var propval = data.properties[p];
		if (propval != null){ /*"!=" checks for null/undefined some properties may be false like Tree showRoot */  
			if(p.substr(0,2).toLowerCase()!="on" && !(srcElement.tag.toLowerCase()=='a' && p.toLowerCase()=='href')) { 
				canvasAndModelProps[p] = propval;
			}else{
				modelOnlyProps[p] = propval;
			}
		}
	}
	var widget = new c(canvasAndModelProps, node, type, md, srcElement, type);
	widget._srcElement=srcElement;

	if(widget.chart && (data.properties && data.properties.theme)){
		widget.chart.theme.themeName = theme;
	}

	/* this was _edit_scripts which didn't seem right */
	if(data.scripts){
		widget.scripts = data.scripts;
	}
//	var df = widgetObject.getDavinciFields(data);
//
//	dojo.mixin(widget, df);

	if(data.context) {
		widget._edit_context = data.context;
	}

	if(data.properties){	
		widget.setProperties(canvasAndModelProps);
		widget.setProperties(modelOnlyProps, true);
	}

//FIXME: Does data.states ever have a value? 
//Yes, gets called when changing 'selected' property on a View
	if(data.maqAppStates || data.maqDeltas){
		if(data.maqAppStates){
			widget.domNode._maqAppStates = dojo.clone(data.maqAppStates);
		}
		if(data.maqDeltas){
			widget.domNode._maqDeltas = dojo.clone(data.maqDeltas);
		}
		var obj = davinci.states.serialize(widget.domNode);
		if(obj.maqAppStates){	// if node has a _maqAppStates property
			widget._srcElement.addAttribute(davinci.states.APPSTATES_ATTRIBUTE, obj.maqAppStates);
		}
		if(obj.maqDeltas){	// if node has a _maqDeltas property
			widget._srcElement.addAttribute(davinci.states.DELTAS_ATTRIBUTE, obj.maqDeltas);
		}
	}
	
	// In some cases we are handling certain attributes within data-dojo-props 
	// or via child HTML elements, and we do not want to allow those attributes 
	// to be written out into the final HTML. Here, we give the helper a chance to 
	// remove those attributes.
	var helper = widgetObject.getWidgetHelper(type);
	if(helper && helper.cleanSrcElement){
		helper.cleanSrcElement(widget._srcElement);
	}
	if(helper && helper.postCreateWidget){
		helper.postCreateWidget(widget);
	}

	return widget;
},

_createSrcElement: function(node) {
	var srcElement = new HTMLElement(node.tagName.toLowerCase());
	if (node.hasAttributes()) {
	    var attrs = node.attributes;
	    for (var j = attrs.length - 1; j >= 0; --j) {
	        srcElement.addAttribute(attrs[j].name, attrs[j].value);
	    }
	}
	return srcElement;
},

// assumes the caller has already primed the cache by calling requireWidgetHelper
getWidgetHelper: function(type) {
	return helperCache[type];
},

requireWidgetHelper: function(type) {
	var d = new Deferred();
	metadata.getHelper(type, 'helper').then(function(HelperCtor) {
		if (HelperCtor) {
			d.resolve(helperCache[type] = new HelperCtor());
		} else {
			d.resolve();
		}
	});
	return d;
},

getWidget: function(node){
	if(!node || node.nodeType != 1){
		return undefined;
	}

	var widget = widgetObject.byNode(node);
	if(!widget){
		var ctor;
		var data = parseNodeData(node);
//		var oaWidgetType=node.getAttribute("oawidget");
		var dvWidgetType=node.getAttribute("dvwidget");
		if (node.hasAttribute("widgetid") || node.hasAttribute("data-dojo-type") ||
				node.hasAttribute("dojotype"))
		{
			var d = widgetObject._dijit(node);
			var w = d.byNode(node);
			var widgetType = node.getAttribute("data-dojo-type") || node.getAttribute("dojotype");
			if (w) {
				widget = new DijitWidget(data,node,w,null,null,widgetType);
			} else {
				widget = new ObjectWidget(data,node);
			}
//		}else if (oaWidgetType){
//			widget = new OpenAjaxWidget(data,node,oaWidgetType);
		}else if (dvWidgetType){
			widget = new GenericWidget(data,node,dvWidgetType);
		}else{
			if(node.nodeName == "svg"){
				//FIXME: inline SVG support not yet available
				return undefined;
			}
			widget = new HTMLWidget(data,node);
		}
	}

	return widget;
}
};

dojo.setObject("davinci.ve.widget", widgetObject); // temporary
return widgetObject;
});
