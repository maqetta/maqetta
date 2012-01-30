define([
	"davinci/html/HTMLModel", //HTMLElement
	"davinci/ve/metadata",
	"davinci/ve/DijitWidget",
	"davinci/ve/GenericWidget",
	"davinci/ve/HTMLWidget",
	"davinci/ve/ObjectWidget",
	"dojo/window"
], function(){

var getUniqueId = function() {
    var dj = dojo.window.get(dojo.doc).dojo,
        id;
    do {
        id = "widget_" + Math.floor(0x7FF * Math.random());
    } while(dj.byId(id));
    return id;
};

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
	var win = dojo.window.get(doc);
	return win.dojo || dojo;
},

_dijit: function(node) {
	var doc = node ? (node.ownerDocument || node) : dojo.doc;
	var win = dojo.window.get(doc);
	return win.dijit || dijit;
},

allWidgets: function(containerNode) {
	var result=[];
	function find(element)
	{
		if (element._dvWidget) {
			result.push(element._dvWidget);
		}
		dojo.forEach(element.childNodes, function(node) {
			if (node.nodeType == 1) {
				find(node);
			}
		});
	}
	find(containerNode);
	return result;
},

//recursively search for widget closest to target under root
//FIXME: Used by SelectTool.  Move code there?
findClosest: function(containerNode, dim, context, target, hLock, allowedFilter) {
	var result = {distance: Infinity, widget: target},
		t = dim,
		isContainer = function(type) { return davinci.ve.metadata.getAllowedChild(type)[0] !== 'NONE'; };

	if(containerNode){
		var list = widgetObject.allWidgets(containerNode);
		if (allowedFilter) {
			// remove anything that wouldn't be a valid sibling.  Would be much more efficient to do during list construction.
			list = list.filter(function(w){
				var parent = w.getParent();
				return parent.type && allowedFilter(parent);
			});
		}
		if (isContainer(target.type)) {
			// filter out child widgets of target so we don't try to drop a widget within itself
			list = list.filter(function(widget) {
			    var w = widget;
				for (w = w.getParent && w.getParent(); w && w.getParent && w != containerNode; w = w.getParent()) {
					if (w === target) {
						return false;
					}
				}
				return true;
			});
		}
		list.forEach(function(w){
			var n = w.domNode;
			if(n==containerNode){
				return;
			}if(!w.isSplitter){
				var c = dojo.position(n),
					p = context.getContentPosition(c),
					dx = [t.l-p.x, t.l+c.w-p.x],
					dy = [t.t-p.y, t.t+c.h-p.x];
				dojo.forEach(dx, function(x){
					dojo.forEach(dy, function(y){
						var dis = x*x + y*y;
						if(dis < result.distance){
							if(!hLock || (t.t > p.y && t.t < p.y + c.w)){
								result = {distance: dis, widget: w, hpos: t.l-p.x > c.w / 2, vpos: t.t-p.y > c.h / 2};
							}
						}
					});
				});
			}
		});
	}

	// Eligible for inserting as a child of result rather than a sibling?
	if (allowedFilter ? allowedFilter(result.widget) : isContainer(result.widget.type)) {
		c = dojo.position(result.widget.domNode);
		p = context.getContentPosition(c);
		if (t.l > p.x && t.l < p.x + c.w && t.t > p.y && t.t < p.y + c.h) {
			result.insert = true;
		}
	}

	return result;
},

parseStyleValues: function(text) {
	var values = {};
	if(text){
		dojo.forEach(text.split(";"), function(s){
			var i = s.indexOf(":");
			if(i > 0){
				var n = s.substring(0, i).trim();
				var v = s.substring(i + 1).trim();
				values[n] = v;
			}
		});
	}
	return values;
},

getStyleString: function(style) {
	var styleStr = '';
	for (var p in style){
		if (style[p]){
			styleStr = styleStr + p +':' + style[p] + ';';
		}
	}
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

getUniqueObjectId: function(type, node) {
	if(!type){
		return undefined;
	}

	var base = type.substring(type.lastIndexOf(".") + 1);
	var i = 1;
	var id = base + "_" + i++;
	var dj = widgetObject._dojo(node);
	while(dj.getObject(id)){
		id = base + "_" + i++;
	}
	return id;
},

getLabel: function(widget) {
	var text = "<span class='propertiesTitleWidgetName'>";
	//FIXME: This is a hack so that meaningful names
	//don't show a bunch of ugly prefix stuff.
	//Need a better approach for this.
	var remove_prefix=function(str){
		var returnstr = str;
		var prefixes_to_remove=[
		                	    'dijit.form.',
		                	    'dijit.layout.',
		                	    'dijit.',
		                	    'dojox.mobile.',
		                	    'html.',
		                	    'OpenAjax.'];
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
	};

	text+=remove_prefix(widget.type);
	text+="</span> ";

	var widgetText,
		helper = widgetObject.getWidgetHelper(widget.type);
	if (helper && helper.getWidgetText) {
		widgetText = helper.getWidgetText(widget);
	}

	//TODO: move to getWidgetText helper methods
	var domNode = widget.domNode;
	switch(widget.type){
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

	/* add the class */
	var srcElement = widget._srcElement;
	var id = widget.getId();
	var classAttr = srcElement && srcElement.getAttribute("class");
	var className = classAttr && classAttr.trim();
	if (id || className) {
		text += "<span class='propertiesTitleClassName'>";
		//text += node.tagName;
		if (id) {
			text += "#" + id;
		}
		if (className) {
			text += "." + className.replace(/\s+/g,".");
		}
		text += "</span> ";
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
	if(davinci.Runtime.currentEditor && davinci.Runtime.currentEditor.currentEditor && davinci.Runtime.currentEditor.currentEditor.context){
		var context = davinci.Runtime.currentEditor.currentEditor.context;
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
 * @param {object} initialCreationArgs  Initial creation info
 *      parent - target parent widget
 *      size - explicit size {w:, h:}
 *      position - explicit position {x:, y:} 
 */
createWidget: function(widgetData, initialCreationArgs) {
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
		metadata = davinci.ve.metadata.query(type);
	if (!metadata) {
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
	var widgetClassId = davinci.ve.metadata.queryDescriptor(type, "widgetClass");
	var widgetClassName;
	if(widgetClassId == "object"){
		dojoType = type;
		widgetClassName="davinci.ve.ObjectWidget";
		// Temporary Hack: Required when object specifies a jsId, otherwise object is not created
		// see davinci.ve.ObjectWidget::postCreate::if(id)::var type = this.getObjectType(); (type = undefined without the following lines to add dojoType to the element attributes)
		// Drag tree onto canvas to test.
		// Berkland: Please review! (needs replacing)
		metadata.attributes = metadata.attributes || {};
		metadata.attributes.dojoType = dojoType;
	}else if(widgetClassId == "html"){
		widgetClassName="davinci.ve.HTMLWidget";
//	}else if(widgetClassId == "OpenAjax"){
//		widgetClassName="davinci.ve.OpenAjaxWidget";
	}else if(widgetClassId == "dijit"){
		widgetClassName="davinci.ve.DijitWidget";
	} else { // if(widgetClassId == "generic"){
		widgetClassName="davinci.ve.GenericWidget";
	}
	if(!widgetClassName){
		//debugger;
		return undefined;
	}
	c = dojo.getObject(widgetClassName);

	// XXX eventually replace with dojo.place()?
	// XXX Technically, there can be more than one 'content'
    var uniqueId = getUniqueId();
    var content = metadata.content.trim().replace(/\s+/g, ' ').replace(/__WID__/g, uniqueId);
	var node = dojo.window.get(dojo.doc).dojo._toDom(content);
	// XXX Used to create node like this, which added attributes from metadata, is there still a way to do this?
	//	var node = dojo.create(metadata.tagName || "div", metadata.attributes);

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

    var srcElement = new davinci.html.HTMLElement(node.tagName.toLowerCase());
    if (node.hasAttributes()) {
        var attrs = node.attributes;
        for (var j = attrs.length - 1; j >= 0; --j) {
            srcElement.addAttribute(attrs[j].name, attrs[j].value);
        }
    }
    if (node.innerHTML) {
        srcElement.addText(node.innerHTML);
    }

    if (metadata.javascript) {
        var js = {};
        js.location = metadata.javascript.location || "afterContent";
        if (metadata.javascript.src) {
            js.src = metadata.javascript.src;
        } else {
            js.$text = (metadata.javascript.$text || metadata.javascript).replace(/__WID__/g, uniqueId);
        }

        if (js.location == "atEnd") {
            console.error("ERROR: <javascript> metadata element -- 'location' of 'atEnd' not supported");
            js.location = "afterContent";
        }

        var script = dojo.doc.createElement("script");
        var scriptModel = new davinci.html.HTMLElement("script");
        if (js.src) {
            script.setAttribute("src", js.src);
            scriptModel.addAttribute("src", js.src);
        } else {
            script.text = js.$text;
            scriptModel.script = "";
            scriptModel.setScript(js.$text);
        }

        var wrapper = dojo.doc.createElement("div");
        var wrapperModel = new davinci.html.HTMLElement("div");
        if (js.location == "beforeContent") {
            wrapper.appendChild(script);
            wrapperModel.addChild(scriptModel);
        }
        wrapper.appendChild(node);
        wrapperModel.addChild(srcElement);
        if (js.location == "afterContent") {
            wrapper.appendChild(script);
            wrapperModel.addChild(scriptModel);
        }
        node = wrapper;
        srcElement = wrapperModel;
    }

    var requiresId = davinci.ve.metadata.queryDescriptor(type,"requiresId");
    var name = davinci.ve.metadata.queryDescriptor(type,"name");
    var idRoot = node.tagName.toLowerCase();
    if(name.match(/^[A-Za-z]\w*$/) != null){
    	idRoot = name;
    }
    node.id = (data.properties && data.properties.id) || data.context.getUniqueID(srcElement, requiresId, idRoot);

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
	
	// Invoke widget initialSize helper if this is widget's initial creation time
	// (i.e., initialCreationArgs is provided)
	if(initialCreationArgs && helper && helper.initialSize){
        size =  helper.initialSize(initialCreationArgs);
        if(size){
        	var styleString = data.properties.style;
        	var tempElem = styleString ? dojo.create('span',{style:styleString}) : dojo.create('span');
        	if(size.width){
        		tempElem.style.width = size.width;
        	}
        	if(size.height){
        		tempElem.style.height = size.height;
        	}
        	data.properties.style = tempElem.style.cssText;
        }
	}
		
    // Strip out event attributes. We want them in the model
    // but not in the DOM within page canvas.
    var props = {};
    for(var p in data.properties){
    	// The "if(propval" check will be false for empty strings.
    	// We are therefore stripping out properties with empty string values
    	// to match similar check in widget.setProperties
    	var propval = data.properties[p];
    	if((propval || typeof propval == "boolean") && p.substr(0,2).toLowerCase()!="on"){
    		props[p] = propval;
    	}
    }
	var widget = new c(props, node, type, metadata, srcElement);
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
		widget.setProperties(data.properties);
	}

	if(data.states){
		widget.states = data.states;
		var states_json = davinci.states.serialize(widget);
		if(states_json){
			widget._srcElement.addAttribute(davinci.states.ATTRIBUTE, states_json);
		}
	}

	return widget;
},

_createSrcElement: function(node) {
	var srcElement = new davinci.html.HTMLElement(node.tagName.toLowerCase());
	if (node.hasAttributes()) {
	    var attrs = node.attributes;
	    for (var j = attrs.length - 1; j >= 0; --j) {
	        srcElement.addAttribute(attrs[j].name, attrs[j].value);
	    }
	}
	return srcElement;
},

getWidgetHelper: function(type) {
	var HelperCtor = davinci.ve.metadata.getHelper(type, 'helper');
	if (HelperCtor) {
		// XXX need to cache
		return new HelperCtor();
	}

    // var helper = davinci.ve.metadata.queryDescriptor(type, "helper");
    // if (helper) {
    // 	var helperConstructor;
    //     try {
    //     	helperConstructor = dojo["require"](helper) && dojo.getObject(helper); /* remove && dojo.getObject after transition to AMD */;
    //     } catch(e) {
    //         console.error("Failed to load helper: " + helper);
    //         console.error(e);
    //         throw e;
    //     }
    //     return /*this._edit_helper = */new helperConstructor();
    // }
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
		if(node.getAttribute("widgetid") || node.getAttribute("dojotype")){
			var d = widgetObject._dijit(node);
			var w= d.byNode(node);
			if (w) {
				widget=new davinci.ve.DijitWidget(data,node,w);
			} else {
				widget=new davinci.ve.ObjectWidget(data,node);
			}
//		}else if (oaWidgetType){
//			widget=new davinci.ve.OpenAjaxWidget(data,node,oaWidgetType);
		}else if (dvWidgetType){
			widget=new davinci.ve.GenericWidget(data,node,dvWidgetType);
		}else{
			if(node.nodeName == "svg"){
				//FIXME: inline SVG support not yet available
				return undefined;
			}
			widget=new davinci.ve.HTMLWidget(data,node);
		}
	}

	return widget;
}
};

return widgetObject;
});
