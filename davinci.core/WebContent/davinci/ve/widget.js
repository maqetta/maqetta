dojo.provide("davinci.ve.widget");

dojo.require("davinci.html.HTMLModel");
dojo.require("davinci.ve.palette.Palette");
dojo.require("davinci.ve.themeEditor.metadata.query");
dojo.require("davinci.ve.themeEditor.metadata.metadata");

davinci.ve.widget.widgetHash={};
davinci.ve.widget._dojo = function(node){
	var doc = node ? (node.ownerDocument || node) : dojo.doc;
//TODO: for some reason node.ownerDocument is occasionally null	
	doc=doc||dojo.doc;
	var win = dijit.getDocumentWindow(doc);
	return win.dojo || dojo;
};
davinci.ve.widget._dijit = function(node){
	var doc = node ? (node.ownerDocument || node) : dojo.doc;
	var win = dijit.getDocumentWindow(doc);
	return win.dijit || dijit;
};



davinci.ve.widget.allWidgets = function(containerNode){
	var result=[];
	function find(element)
	{
		if (element._dvWidget) {
			result.push(element._dvWidget);
		}
		for (var i=0;i<element.childNodes.length;i++) {
			if (element.childNodes[i].nodeType==1) {
				find(element.childNodes[i]);
			}
		}
	}
	find(containerNode);
	return result;
	
}

//recursively search for widget closest to target under root
davinci.ve.widget.findClosest = function(containerNode, dim, context, target, hLock){
	var result = {distance: Infinity, widget: target},
		t = dim;

	if(containerNode){
		var list = davinci.ve.widget.allWidgets(containerNode);
		if(davinci.ve.metadata.queryDescriptor(target.type, "isContainer")){
			// filter out child widgets of target so we don't try to drop a widget within itself
			list = list.filter(function(w){
				for(w = w.getParent && w.getParent(); w && w.getParent && w != containerNode; w = w.getParent()){
					if(w == target){
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
	if(davinci.ve.metadata.queryDescriptor(result.widget.type, "isContainer")){
		c = dojo.position(result.widget.domNode);
		p = context.getContentPosition(c);
		if(t.l > p.x && t.l < p.x + c.w && t.t > p.y && t.t < p.y + c.h){
			result.insert = true;
		}
	}

	return result;
};


davinci.ve.widget.parseStyleValues = function(text){
	var values = {};
	if(text){
		dojo.forEach(text.split(";"), function(s){
			var i = s.indexOf(":");
			if(i > 0){
				var n = dojo.trim(s.substring(0, i));
				var v = dojo.trim(s.substring(i + 1));
				values[n] = v;
			}
		});
	}
	return values;
};

davinci.ve.widget.getStyleString = function(style){
	var styleStr = '';
	for (var p in style){
		if (style[p]){
			styleStr = styleStr + p +':' + style[p] + ';';
		}
	}
	return styleStr;
};

davinci.ve.widget.getEnclosingWidget = function(node){
	var richText = this.getEnclosingWidgetForRichText(node);
	if (richText){
		return richText;
	}
	while(node){
		if (node._dvWidget) {
			return node._dvWidget;
		}
		node = node.parentNode;
	}
};

davinci.ve.widget.getEnclosingWidgetForRichText = function(node){
	if (!node || !node._dvWidget){ return; }
	if (node._dvWidget.type === 'html.stickynote' || node._dvWidget.type === 'html.richtext' ){
		return node._dvWidget;
	} else if (node.parentNode){
		return this.getEnclosingWidgetForRichText(node.parentNode);
	} else {
		return null;
	}
};

davinci.ve.widget.getUniqueObjectId = function(type, node){
	if(!type){
		return undefined;
	}

	var base = type.substring(type.lastIndexOf(".") + 1);
	var i = 1;
	var id = base + "_" + i++;
	var dj = davinci.ve.widget._dojo(node);
	while(dj.getObject(id)){
		id = base + "_" + i++;
	}
	return id;
};

davinci.ve.widget.getType = function(widget){
	if(widget.type)
		return widget.type;
	
}


davinci.ve.widget.getLabel = function(widget){
	
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
		                	    'html.',
		                	    'OpenAjax.'];
		for(var i=0; i<prefixes_to_remove.length; i++){
			if(str.indexOf(prefixes_to_remove[i])==0){
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
	}
	text+=remove_prefix(widget.type);
	text+="</span> ";

	var widgetText;
	switch(widget.type){
		case 'dijit.form.ComboBox':
		case 'dijit.form.Button':
			widgetText = widget.attr("label");
			break;
		case 'dijit.layout.ContentPane':
			widgetText = widget.attr("title");
			break;
		case 'html.label':
			widgetText = widget.domNode.innerHTML;
			break;
		default:
			widgetText = "";
	}
	if (widgetText) {
		text += "<span class='propertiesTitleWidgetText'>" + widgetText + "</span> ";
	}
	
	/* add the class */	
	var node = widget.domNode;
	var srcElement = widget._srcElement;
	var id = widget.getId();
	var classAttr = srcElement && srcElement.getAttribute("class");
	var className = classAttr && dojo.trim(classAttr);
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
	return text;
};

davinci.ve.widget.byId = function(id){
	var node=dojo.byId(id);
	if (node)
	{
		if (node._dvWidget) {
			return node._dvWidget;
		}
		var widget=davinci.ve.widget.getEnclosingWidget(node);
		if (widget.id==id) {
			return widget;
		}
	}
    return davinci.ve.widget.widgetHash[id];	
};

davinci.ve.widget.byNode = function(node){
	if (node._dvWidget) {
		return node._dvWidget;
	}
//	var d = davinci.ve.widget._dijit(node);
//	var w= d.byNode(node);
//	if (w)
//	{
//		node._dvWidget=w;
//	}
//	return w;

};

davinci.ve.widget._getUniqueId = function() {
    var dj = dijit.getDocumentWindow(dojo.doc).dojo,
        id;
    do {
        id = "widget_" + Math.floor(0x7FF * Math.random());
    } while(dj.byId(id));
    return id;
};

davinci.ve.widget.createWidget = function(data){
	//debugger;
	if(!data || !data.type){
		return undefined;
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
    var uniqueId = davinci.ve.widget._getUniqueId();
    var content = dojo.trim(metadata.content).replace(/\s+/g, ' ').replace(/__WID__/g, uniqueId);
	var node = dijit.getDocumentWindow(dojo.doc).dojo._toDom(content);
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

    node.id = (data.properties && data.properties.id) || data.context.getUniqueID(srcElement);
	
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
			davinci.ve.widget._childrenAddIds(data.context,node,srcElement);
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
					var child = davinci.ve.widget.createWidget(c);
					if(child){
						node.appendChild(child.domNode);
						srcElement.addChild(child._srcElement);
					}
				}
			});
		}
	}

	var widget = new c(data.properties, node, type, metadata, srcElement);
	widget._srcElement=srcElement;

	if(widget.chart && (data.properties && data.properties["theme"])){
		widget.chart.theme.themeName = theme;
	}
	
	/* this was _edit_scripts which didn't seem right */
	if(data.scripts){
		widget.scripts = data.scripts;
	}
//	var df = davinci.ve.widget.getDavinciFields(data);
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
		var states_json = JSON.stringify(widget.states);
		// Escape single quotes that aren't already escaped
		states_json = states_json.replace(/(\\)?'/g, function($0, $1){ 
			return $1 ? $0 : "\\'";
		});
		// Replace double quotes with single quotes
		states_json = states_json.replace(/"/g, "'");
		widget._srcElement.addAttribute(davinci.states.ATTRIBUTE, states_json);
	}

	return widget;
};

// Add temporary IDs to nested children
// Assumes iframe's DOM and the model are in sync regarding the order of child nodes
davinci.ve.widget._childrenAddIds = function(context, node, srcElement){
	 for (var i=0;i<srcElement.children.length; i++) {
		 var childNodeDOM = node.childNodes[i];
		 var childNodeModel = srcElement.children[i];
		 if((childNodeDOM && childNodeDOM.nodeType==1/*element*/) && childNodeModel.elementType=="HTMLElement"){ //node may have a different child count - wdr
			 childNodeDOM.id = context.getUniqueID(childNodeModel);
			 davinci.ve.widget._childrenAddIds(context,childNodeDOM,childNodeModel);
		 }
	 }
}

davinci.ve.widget._createSrcElement = function( node){
	var srcElement = new davinci.html.HTMLElement(node.tagName.toLowerCase());
	if (node.hasAttributes()) {
	    var attrs = node.attributes;
	    for (var j = attrs.length - 1; j >= 0; --j) {
	        srcElement.addAttribute(attrs[j].name, attrs[j].value);
	    }
	}
	return srcElement;
}

davinci.ve.widget._parseNodeData = function(node, options){
	
	
	// summary:
	// 		Same general routine as davinci.ve.widget._getData,
	// 		only adding the "html." prefix to the widget type to make it look like a widget to the Dojo Composition Tool.
	//
	if(!node){
		return undefined;
	}
	
	options = (options || {});

	var data = {};
	data['properties'] = {};
	
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
			v = dojo.trim(v.replace("HtmlWidget", ""));
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
	//	data.children = davinci.ve.widget._getChildrenData(widget, options);
	//}
	return data;
}

davinci.ve.widget.getWidget = function(node){
	
	if(!node || node.nodeType != 1){
		return undefined;
	}

	var widget = davinci.ve.widget.byNode(node);
	if(!widget){
		var ctor;
		var data = davinci.ve.widget._parseNodeData(node);
//		var oaWidgetType=node.getAttribute("oawidget");
		var dvWidgetType=node.getAttribute("dvwidget");
		if(node.getAttribute("widgetid") || node.getAttribute("dojotype")){
			var d = davinci.ve.widget._dijit(node);
			var w= d.byNode(node);
			if (w)
			{
				widget=new davinci.ve.DijitWidget(data,node,w); 
			}
			else
				widget=new davinci.ve.ObjectWidget(data,node);
//		}else if (oaWidgetType){
//			widget=new davinci.ve.OpenAjaxWidget(data,node,oaWidgetType);
		}else if (dvWidgetType){
			widget=new davinci.ve.GenericWidget(data,node,dvWidgetType);
		}else{
			if(node.nodeName == "svg" || node.parentNode == node.ownerDocument.body && (node.style.display == "none" || node.style.visibility == "hidden")){
				// Question: Is this still needed for daVinci? Prevents getting widget for top level html elements that have display set to none.
				// exclude temporary node for _Templated and Grid
				return undefined;
			}
			widget=new davinci.ve.HTMLWidget(data,node);
		}
	}
	
	return widget;
};

dojo.declare("davinci.ve._Widget",null,{
	isWidget: true,
	acceptsHTMLChildren: false,
	constructor: function (params,node,type,metadata)
	{
	  this.domNode=node;
	  this.id=node.id;
		node._dvWidget=this;
		this._params = dojo.mixin({}, params);
	  this.type = type;
	  this.metadata = metadata;
	},

	postscript: function ()
	{
		  if (this.id)
			  davinci.ve.widget.widgetHash[this.id]=this;
		this.buildRendering();
		this.postCreate();
	},
	buildRendering: function(){
	},
	postCreate: function(){
	},
	getObjectType: function(){
	},

	getContext: function()
	{
		return this._edit_context;
	},

	getChildren: function()
	{
		return [];
	},

	getContainerNode: function(){
		var helper = this.getHelper();
		if(helper && helper.getContainerNode){
			return helper.getContainerNode(this);
		}

		if ((this.dijitWidget && this.dijitWidget.isContainer)
                || davinci.ve.metadata.queryDescriptor(this.type, "isContainer")) {
            return (this.containerNode || this.domNode);
        }	
		return undefined;
	},

	getMetadata : function() {
        if (!this.metadata) {
            this.metadata = davinci.ve.metadata.query(this);
        }
        return this.metadata;
    },

	getHelper: function() {
        if (!this._edit_helper /*|| !widget._edit_helper.getChildren*/) {
    	    var helper = davinci.ve.metadata.queryDescriptor(this.type, "helper");
    	    if (helper) {
    	        try {
    	            dojo["require"](helper);
    	        } catch(e) {
                    console.error("Failed to load helper: " + helper);
                    console.error(e);
    	        }
    	       // this._edit_helper = dojo.getObject(helper); wdr
    	        var aClass = dojo.getObject(helper);
    	        if (aClass) {
    	        	this._edit_helper  = new aClass();				
    			}
    	        //wdr
    	        var obj = dojo.getObject(helper);
    	        this._edit_helper = new obj();

    	    }
    	    if (!this._edit_helper) {
    	        this._edit_helper = true;
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

	_attr: function(name,value){
	},

	indexOf: function(child){
		var children = this.getChildren();
		return dojo.indexOf(children, child);
	},

	getStyleNode: function(){
		return (this.styleNode || this.domNode); // for Textarea on FF2
	},

	addChild: function (child,index)
	{
		if(!child){
			return;
		}

		var containerNode = this.getContainerNode();
		if(containerNode){
			//TODO use dojo.place?
			if(index === undefined || index === -1){
				containerNode.appendChild(child.domNode);
				this._srcElement.addChild(child._srcElement);
			}else{
				var children = this.getChildren();
				if(index < children.length){
					containerNode.insertBefore(child.domNode, children[index].domNode);
					this._srcElement.insertBefore(child._srcElement,children[index]._srcElement);
				}else{
					containerNode.appendChild(child.domNode);
					this._srcElement.addChild(child._srcElement);
				}
			}
		}
	},
	getParent: function(){
			return davinci.ve.widget.getEnclosingWidget(this.domNode.parentNode) || this.domNode.parentNode;
			
	},
	getObjectId: function(widget){
		widget = widget || this;
		var objectId = widget._edit_object_id;
		if(objectId){
			return objectId;
		}
		if(widget.domNode){
			return widget.domNode.getAttribute("jsId");
		}
	 	return undefined;
	},
	addClass: function(className){
		var classes = this.getClassNames() || "";
		var split = classes.split(' ');
		for(var i =0;i<split.length;i++){
			if(split[i]==className) return;
		}
		var newClass = (classes?(classes + " "):"") + className;
		this._srcElement.setAttribute("class", newClass);
		dojo.addClass(this.domNode,className);
	},
	getId: function(){
		if (!this.id)
		{
			if( !this.domNode.id || !this.type){
				return undefined;
			}

			var id = this.domNode.id;
			var base = (this.isHtmlWidget ? this.getTagName() :this.type).replace(/\./g, "_") + "_";
			if(id.length > base.length && id.substring(0, base.length) == base){
				// auto-generated id
				return undefined;
			}
		}
		if (this._srcElement && this._srcElement._getAttribute("id").noPersist)
			return undefined;
		return this.id;
	},
	setMarginBox: function(box){
		var node = this.getStyleNode();
		if(!node){
			return;
		}

		dojo.marginBox(node, box);
		this._updateSrcStyle();
	},

	getMarginBox: function(){
		var node = this.getStyleNode();
		if(!node){
			return undefined;
		}

		var box = dojo.position(node),
			parentNode = node.offsetParent;
		if(parentNode){
			var c = dojo.position(parentNode),
				e = dojo._getMarginExtents(node);
			box.l = box.x - c.x + parentNode.scrollLeft - Math.round(e.l);
			box.t = box.y - c.y + parentNode.scrollTop - Math.round(e.t);
		}else{
			box.l = box.t = 0;
		}
		return box;
	},

	getStyle: function(options){
		var values = this.getStyleValues(options);
		if(!values){
			return "";
		}
		return this._styleText(values);
	},

	_sortStyleValues: function(values){
		// return a sorted array of sorted style values.
		var v = [];
		var shorthands = davinci.html.css.shorthand;
		
		var foundShorthands = [];
		
		for(var j=0;j<shorthands.length;j++){
			for(var i=0;i<shorthands[j].length;i++){
				if(shorthands[j][i] in values){
					v.push({'name': shorthands[j][i], 'value':values[shorthands[j][i]]});
					foundShorthands.push(shorthands[j][i]);
				}
			}
		}		
		
		for(var name in values){
			var found = false;
			
			for(var i=0;!found && i<foundShorthands.length;i++){
				if(foundShorthands[i] == name)
					found=true;
			}
			
			if(!found)
				v.push({'name': name, 'value':values[name]});
		}
		
		return v;
	},
	
	_styleText: function (v){
		var s = "";
		/* if ordering is given, respect it */
		if(dojo.isArray(v)){
		
			for(var i = 0;i<v.length;i++){
				value = davinci.ve.states.normalize("style", this, v[i].name, v[i].value);
				if(value !== undefined && value != "" && value!=null){
					s += v[i].name + ": " + value + "; ";
				}
	
			}
		}else{
			for(var name in v){
				var value = v[name];
				value = davinci.ve.states.normalize("style", this, name, value);
				if(value !== undefined && value != "" && value!=null){
					s += name + ": " + value + "; ";
				}
			}
			
		}
		return dojo.trim(s);
	},

	getChildrenData: function(options){
		options = (options ? options : {identify: true});

		var helper = this.getHelper();
		if(helper && helper.getChildrenData){
			return helper.getChildrenData.apply(helper,[this, options]);
		}

		return this._getChildrenData( options);
	},

	_getChildrenData: function( options){
			return this.getChildren().map(function(w){ return w.getData( options); });
//		var childrenData = [];
//		var containerNode = davinci.ve.widget.getContainerNode(widget);
//		if(containerNode){
//			var childNodes = containerNode.childNodes;
//			for(var i = 0; i < childNodes.length; i++){
//				var n = childNodes[i];
//				var d = undefined;
//				switch(n.nodeType){
//				case 1: // Element				
//					var w = davinci.ve.widget.byNode(n);
//					if(w){
//						d = davinci.ve.widget.getData(w, options);
//					}
//					break;
//				case 3: // Text
//					d = dojo.trim(n.nodeValue);
//					if(d && options.serialize){
//						d = davinci.html.escapeXml(d);
//					}
//					break;
//				case 8: // Comment
//					d = "<!--" + n.nodeValue + "-->";
//					break;
//				}
//				if(d){
//					childrenData.push(d);
//				}
//			}
//		}
//		if(childrenData.length === 0){
//			return undefined;
//		}
//		return childrenData;
	},

	getClassNames: function(){	
		var attr=this._srcElement.getAttribute("class");
		if(attr && attr.length>0){
			return attr;
		}
		return "";
	},
	_getData: function(options){
		var context = this.getContext();
		var data = {type: this.type, properties: {}};
		//FIXME: Might need OpenAjax widgets logic here someday
		if(options.identify){
			if(!this._srcElement){ //wdr why is the _srcElement missing?
				this._srcElement = davinci.ve.widget._createSrcElement(this.domNode);
			}
			var idProp = this._srcElement._getAttribute("id");
			//if (this._srcElement._getAttribute("id").noPersist) 
			if (idProp && idProp.noPersist)
				data.properties.isTempID=true;
			data.properties.id = this.id;
		}else if(options.identify !== false){
			data.properties.id = this.getId();
		}
		if ((options.preserveTagName !== false) && (this.id)) { 
			data.tagName = this._srcElement.tag;
		}
		
		// get all properties
	    var properties = davinci.ve.metadata.query(this, "property");
	    if (this.domNode && this.domNode.parentNode) { // "widget" could be a string for dojoType
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
		
		if(properties){
			for(var name in properties){
				if(name=="_children" || name == "id" || name == "style" || name == "class" || name == "dir" || name == "lang"){
					continue;
				}
				var property = properties[name];
				/*if(name == "theme"){
					value = (davinci.ve.widget.getPropertyValue(widget, name)).themeName;
					data.properties[name] = value;
				}
				else{*/
					var value = this.getPropertyValue(name);
					if(value && value.length>0){
						if(property.datatype == "array"){
							if(!davinci.ve._equals(value, property.defaultValue)){
								data.properties[name] = value;
							}
						}else{
							if(value != property.defaultValue){
								data.properties[name] = value;
							}
						}
					}else{
						if(property.datatype == "boolean" && value != property.defaultValue){
							data.properties[name] = value;
						// HACK: There's probably a better way to do this with the new model, just a stopgap measure until Phil takes a look
						} else if (property.datatype && (property.datatype.indexOf("dijit") == 0 || property.datatype == "object" && property.isData)) {
							data.properties[name] = value;
						}
					}
				//}
			}
		}
		var style = this.getStyle(options);
		if(style){
			data.properties.style = style;
		}
		var classNames = this.getClassNames(options);
		if(classNames){
			data.properties['class'] = classNames;
		}
		
		data.children = this.getChildrenData(options);
		
		return data;
	},

	getData: function(options){
		options = (options ? options : {identify: true, preserveStates: true});

		var helper = this.getHelper();
		var data = null;
		if(helper && helper.getData){
			data =  helper.getData.apply(helper, [this, options]);
		}else{
			data = this._getData( options);
		}
		
		data.states=this.states;
		if(!data.properties)
			data.properties = {};
		
		if (this.properties)
			for(var name in this.properties){
				if(!(name in data.properties)){
					data.properties[name] = this.properties[name];
				}
			}
		
		return data;
		
	},

	getPropertyValue: function(name){
		if( !name){
			return undefined;
		}

//	TODO: implement helper
//		var helper = this.getHelper();
//		if(helper && helper.getPropertyValue){
//			return helper.getPropertyValue.apply(this, [name]);
//		}
		if (name=='id')
			return this.getId();
		else if (name == 'jsId')
			return this.getObjectId();
		return this._getPropertyValue(name);
	},

	_getPropertyValue: function( name){
		var widget=this._getWidget();
		if(widget && widget.get){
			return widget.get(name);
		}
		return widget && widget[name];
	},

	_getWidget: function(){
	},

	getTagName: function()
	{
		return this.domNode.nodeName.toLowerCase();
	},

	getStyleValues: function( options){
		
		var style = this.getStyleNode().style;
		var text = this._srcElement.getAttribute("style");
		
		var values =davinci.ve.widget.parseStyleValues(text);

		if(style){
			if(style.position == "absolute" || style.position == "relative"){
				var parent = this.getParent();
				if(parent && parent.dijitWidget && parent.dijitWidget.addChild){
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
			if(style.width){
				if(resizable == "both" || resizable == "width"){
					values.width = style.width;
				}
			}
			if(style.height){
				if(resizable == "both" || resizable == "height"){
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
			this._srcElement.removeAttribute("style");
			
	},
	setStyleValues: function( values){
		if(!values){
			return;
		}
		var style = this.getStyleNode().style;
		var v = this._sortStyleValues(values);
		
		for(var i=0;i<v.length;i++){
			var value = (v[i].value || "");
			var name = v[i].name;
			
			if(name.indexOf("-") >= 0){
				// convert "property-name" to "propertyName"
				var names = name.split("-");
				name = names[0];
				for(var j = 1; j < names.length; j++){
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

	removeChild: function( /*Widget*/child){
		if(!child){
			return;
		}
		var containerNode = this.getContainerNode();
		if(containerNode){
			containerNode.removeChild(child.domNode);
			this._srcElement.removeChild(child._srcElement);
		}
	},
	
	setProperties: function(properties, modelOnly) {
		if(!this.properties) {
			this.properties = {};
		}
		
		modelOnly = modelOnly ? modelOnly : false; // default modelOnly to false

		if (properties.id)
		{
			this._srcElement.addAttribute("id", properties.id,properties.isTempID);
			delete properties.id;
			delete properties.isTempID;
		}
		if (properties.isTempID){ // delete so it does not make it's way to the source
			delete properties.isTempID;
		}
		for(var name in properties){
			var property = properties[name];
			if(property || typeof property == "boolean"){
				var value=this._stringValue(name, property);
				if ( ! modelOnly ) {
				    this.properties[name] = value;
				}
				this._srcElement.addAttribute(name, value);
			} else {
			    delete this.properties[name];
				this._srcElement.removeAttribute(name);
			}
		}
	},

	startup: function()
	{
		
	},
	renderWidget: function(){
	},
	destroyWidget: function(widget){
		var helper = this.getHelper();
		if(helper && helper.destroyWidget){
			helper.destroyWidget(this);
			return;
		}
		if (this.dijitWidget)
			this.dijitWidget.destroyRecursive();
		else
		{
			dojo.forEach(this.getChildren(),function(each){each.destroyWidget()});
		}
	},
	selectChild: function(widget)
	{
		
	},
	attach: function()
	{
		
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
				if(objectId){
					return objectId;
				}
				if(value.domNode){
					return value.domNode.getAttribute("jsId");
				}
			}
		} else if(property.datatype == "json"){
			// Kludge to prevent array from iframe from being mistaken as object
			var context = this.getContext();
			var dj = context && context.getDojo() || dojo;
			if(dj.isObject(value)){
				value = dj.toJson(value);
			}
		} else if (property.datatype == "string") {
		    switch (property.format) {
// shouldn't be needed
//		        case "url":
//	                value = this.getContext().getContentUrl(value);
//		            break;
		        case "date":
		            value = dojo.date.stamp.toISOString(value, {selector: "date"});
		            break;
		        case "time":
		            value = dojo.date.stamp.toISOString(value, {selector: "time"});
		            break;
		        default:
		        	 value = dojox.html.entities.encode(value); //When placing data in an HTML attribute, we should probably just encode it to be safe.
	              
		    }
// XXX is this used?
//		}else if(property.type == "widget"){
//			if (value.getId)
//				value = value.getId();
//			else
//			   value=value.id;
		}
		return value;
	}
});

dojo.declare("davinci.ve.GenericWidget",davinci.ve._Widget,{
	isGenericWidget: true,
	constructor: function (params,node,type,metadata,srcElement)
	{
		dojo.attr(node, "dvwidget", type);
		if(srcElement){
			srcElement.addAttribute("dvwidget", type);
		}
	},
	buildRendering: function(){
//		if(this.srcNodeRef){
//			this.domNode = this.srcNodeRef;
//		}else{
//			this.domNode = dojo.doc.createElement("div");
//		}
		this.containerNode = this.domNode; // for getDescendants()
		if(this._params){
			for(var name in this._params){
				this.domNode.setAttribute(name, this._params[name]);
			}
			this._params = undefined;
		}
/*REMOVE THIS
		try{
			// this won't work on an SVG element in FireFox
			dojo.addClass(this.domNode, "HtmlWidget");
		}catch(e){
			console.debug("Error in davinci.ve.helpers.loadHtmlWidget.buildRendering: "+e);
		}
*/
	},
	_getChildrenData: function( options){
		var childrenData = [];
		var childNodes = this.domNode.childNodes;
		for(var i = 0; i < childNodes.length; i++){
			var n = childNodes[i];
			var d;
			switch(n.nodeType){
			case 1: // Element				
				var w = davinci.ve.widget.byNode(n);
				if(w){
					d = w.getData( options);
				}
				break;
			case 3: // Text
				d = dojo.trim(n.nodeValue);
				if(d && options.serialize){
					d = davinci.html.escapeXml(d);
				}
				break;
			case 8: // Comment
				d = "<!--" + n.nodeValue + "-->";
				break;
			}
			if(d){
				childrenData.push(d);
			}
		}
		if(childrenData.length === 0){
			return undefined;
		}
		return childrenData;
	},
	
	setProperties: function(properties)
	{
		var node = this.domNode;
		
		for(var name in properties){
			if (name === 'style'){ // needed for position absolute
				dojo.style(node, properties[name]);
			} else {
				if(!properties[name]) {
					node.removeAttribute(name);
				} else {
					node[name]= properties[name];
		//			dojo.attr(node,name,properties[name]);
				}
			}
			
		}
		this.inherited(arguments);
	},

	getContainerNode: function(){
		// summary:
		//		Returns the passed node itself if the node is allowed to have childNodes.
		//		Otherwise returns undefined.
		//

		var tagName = this.getTagName();
		switch(tagName){
		case "input":
		case "img":
		case "hr":
		case "br":
		case "script":
			return undefined;
		default:
			return this.domNode;
		}
	},
	//FIXME: Shouldn't return all children, just children that are widgets
	//FIXME: DRY: code appears to be identical to HTMLWidget
	getChildren: function()
	{
		var dvWidget = function(child){
			return child._dvWidget;
		};

		return dojo.map(dojo.filter(this.domNode.children, dvWidget), dvWidget);
	},
	_attr: function(name,value)
	{
		
		if (arguments.length>1)
		{
			this.domNode[name]=value;
		}
		else
		{
			return this.domNode[name];
		}
	},
	
	_getWidget: function(){
		return this.domNode;
	},
	getTagName: function(){
		return this.domNode.nodeName.toLowerCase();
	}

});

dojo.declare("davinci.ve.DijitWidget",davinci.ve._Widget,{
	isDijitWidget: true,
	
	constructor : function(mixin, node, dijitWidget, metadata, srcElement) {
		if (dojo.isString(dijitWidget)) {
			var c = davinci.ve.widget._dojo(node).getObject(dijitWidget);
			// create the instance (follow parser.js)
			// XXX Bug 7674 - This whole code should be replaced with call to dojo.parser.parse()
			dojo.attr(node, "dojoType", dijitWidget);
			if(srcElement){
				srcElement.addAttribute("dojoType", dijitWidget);
			}
			
            // carry over node attributes to params that are passed in to constructor
            var proto = c.prototype, params = {};
            for ( var prop in proto) {
                var val = node.hasAttribute(prop) ? node.getAttribute(prop) : null;
                if (!val) {
                    continue;
                }
                if (typeof proto[prop] == "string") {
                    params[prop] = val;
                } else if (typeof proto[prop] == "number") {
                    params[prop] = val - 0;
                } else if (typeof proto[prop] == "boolean") {
                    params[prop] = (val != "false");
                } else if (typeof proto[prop] == "object") {
                    params[prop] = eval("(" + val + ")");
                }
            }
            params["class"] = node.className;
            params["style"] = node.style && node.style.cssText;
            
            // mixin other properties into params; 'mixin' takes precedence
            dojo.mixin(params, mixin);
            
            // Bug 7675 - Some widgets (i.e. dojox.mobile.IconItem) require a parent node.
            var parentNode = node.parentNode, didCreateParent = false;
            if (!parentNode) {
                parentNode = node.ownerDocument.createElement("div");
                parentNode.appendChild(node);
                didCreateParent = true;
            }

            var markupFactory = c["markupFactory"];
			if(!markupFactory && c["prototype"]){
				markupFactory = c.prototype["markupFactory"];
			}
			try {
				var dijitWidget = markupFactory ? markupFactory(params, node, c) : new c(params, node);
				this.domNode=dijitWidget.domNode;
				dijitWidget.domNode._dvWidget=this;
				if (dijitWidget.containerNode){
					dijitWidget.containerNode._dvWidget=this;
				}
				this.isLayoutContainer=dijitWidget.isLayoutContainer;

                // clean up -- "unwrap" incoming node from created DIV (bug 7675)
                if (didCreateParent) {
                    node = parentNode.removeChild(parentNode.firstChild);
                }
			} catch (e) {
				console.error(e);
				//debugger;
			}
		}else{
			this.type=dijitWidget.declaredClass;
		}
		this.acceptsHTMLChildren=dijitWidget._setContentAttr;
		this.dijitWidget=dijitWidget;
		this.containerNode=dijitWidget.containerNode;
		this.styleNode=dijitWidget.styleNode;
		this.id=dijitWidget.id;

		var helper = this.getHelper();
		if(helper && helper.create && srcElement){
			helper.create(this, srcElement);
		}
	},
	getParent: function()
	{
		var widget;
		do{
			widget = davinci.ve.widget.getEnclosingWidget(this.dijitWidget.domNode.parentNode);
		}while(widget && widget.dijitWidget && widget.dijitWidget.declaredClass.split(".").pop().charAt(0) == "_");
			// skip intermediates, like _AccordionInnerContentPane
			//TODO: use widget.getParent() and have it support this behavior?
		return widget;
	},
	getChildren: function(attach)
	{
		var children=[];
		if (this.acceptsHTMLChildren)
		{
			var dvWidget = function(child){
				return child._dvWidget;
			};

			// this.containerNode is a Dojo attachpoint. FIXME: Perhaps this detail should be abstracted by a helper?
			return dojo.map(dojo.filter((this.containerNode || this.domNode).children, dvWidget), dvWidget);
		} else {
			dojo.map(this.dijitWidget.getChildren(), function(widget){
				if (!widget){ return; }
				if (attach && !widget.domNode._dvWidget)
				{
					davinci.ve.widget.getWidget(widget.domNode);
				}
				var child = widget.domNode && widget.domNode._dvWidget;
				if (child) {
					children.push(child);
				}
			});
		}
		return children;
	},
	selectChild: function(widget)
	{
		if (this.dijitWidget.selectChild){
			this.dijitWidget.selectChild(widget.dijitWidget);
		}
	},
	addChild: function(child,index)
	{
		if(this.dijitWidget.addChild){
			if(index === undefined || index === -1){
				index = "last";
				this._srcElement.addChild(child._srcElement);
			}else {
				var children = this.getChildren();
				if(index < children.length){
					this._srcElement.insertBefore(child._srcElement,children[index]._srcElement);
				}else{
					this._srcElement.addChild(child._srcElement);
				}
				if(index === 0){
					index = "first";
				}
			}
			this.dijitWidget.addChild(child.dijitWidget, index);
			return;
		}
		this.inherited(arguments);
	},
	_getWidget: function(){
		return this.dijitWidget;
	},
	startup: function()
	{
		this.dijitWidget.startup();

	},
	attach: function()
	{
		var helper = this.getHelper();
		if(helper && helper.create){
			helper.create(this, this._srcElement);
		}
	},
	isLayout: function()
	{
		return this.dijitWidget.addChild;
	},
	resize: function()
	{
		if (this.dijitWidget.resize){
			this.dijitWidget.resize();
		}
	},
	removeChild: function( /*Widget*/child){
		if(!child){
			return;
		}

		if(this.dijitWidget.removeChild){
			// it's a Widget and a Container
			this.dijitWidget.removeChild(child.dijitWidget);
			this._srcElement.removeChild(child._srcElement);
			return;
		}
		this.inherited(arguments);
	},

	renderWidget: function(){
		if(this.dijitWidget.render){
			this.dijitWidget.render();
		}else if(this.dijitWidget.chart){ // TODO: move to helper
			var box = dojo.marginBox(this.dijitWidget.domNode);
			this.dijitWidget.resize(box);
		}
		if (this.domNode.parentNode._dvWidget && this.domNode.parentNode._dvWidget.isDijitWidget){
			this._refresh(this.domNode.parentNode);
		}

	},
	
	_refresh: function(widget){
		/* if the widget is a child of a dijitContainer widget 
		 * we may need to refresh the parent to make it all look correct in page editor
		 */
		var parentNode = widget.parentNode;
		if (parentNode._dvWidget && parentNode._dvWidget.isDijitWidget){
			this._refresh(parentNode);
		} else if (widget._dvWidget.isDijitWidget){
			widget._dvWidget.resize(); // this step may not be needed
		}
		
	},
	
	_attr: function (name,value)
	{
		return this.dijitWidget.get.apply(this.dijitWidget, arguments);
	}
});


dojo.declare("davinci.ve.ObjectWidget",davinci.ve._Widget,{
	isObjectWidget: true,
	
	constructor: function (params,node,dijitWidget,metadata,srcElement)
	{
		if (dojo.isString(dijitWidget))
		{
			dojo.attr(node, "dojoType", dijitWidget);
			if(srcElement){
				srcElement.addAttribute("dojoType", dijitWidget);
			}
		}
	},
	
	postCreate: function(){
		var id = this._params.jsId;
		if(id){
			this.domNode.setAttribute("jsId", id);
			var type = this.getObjectType();
			if(type){
				var d = davinci.ve.widget._dojo(this.domNode);
				var c = d.getObject(type);
				if(c){
					var object = undefined;
					if(c.markupFactory){
						object = c.markupFactory(this._params, this.domNode, c);
					}else if(c.prototype && c.prototype.markupFactory){
						object = c.prototype.markupFactory(this._params, this.domNode, c);
					}else{
						object = new c(this._params, this.domNode);
					}
					if(object){
						object._edit_object_id = id;
						d.setObject(id, object);
					}
				}
			}
		}else{
			id =this.getObjectId();
			if(id){
				var object = davinci.ve.widget._dojo(this.domNode).getObject(id);
				if(object){
					object._edit_object_id = id;
				}
			}
		}
	},

	getObjectType: function(){
		return this.domNode.getAttribute("dojoType");
	},

	getObjectId: function(){
		return this.domNode.getAttribute("jsId");
	}
});

dojo.declare("davinci.ve.HTMLWidget",davinci.ve._Widget,{
	isHtmlWidget: true,
	constructor: function (params,node)
	{
		this.type="html."+node.tagName.toLowerCase();
		this.acceptsHTMLChildren=true;
	},
	buildRendering: function(){
//		if(this.srcNodeRef){
//			this.domNode = this.srcNodeRef;
//		}else{
//			this.domNode = dojo.doc.createElement("div");
//		}
		this.containerNode = this.domNode; // for getDescendants()
		if(this._params){
			for(var name in this._params){
				this.domNode.setAttribute(name, this._params[name]);
			}
			this._params = undefined;
		}
		try{
			// this won't work on an SVG element in FireFox
			dojo.addClass(this.domNode, "HtmlWidget");
		}catch(e){
			console.debug("Error in davinci.ve.helpers.loadHtmlWidget.buildRendering: "+e);
		}
	},

	_getChildrenData: function( options){
		var childrenData = [];
		var childNodes = this.domNode.childNodes;
		for(var i = 0; i < childNodes.length; i++){
			var n = childNodes[i];
			var d = undefined;
			switch(n.nodeType){
			case 1: // Element				
				var w = davinci.ve.widget.byNode(n);
				if(w){
					d = w.getData( options);
				}
				break;
			case 3: // Text
				d = dojo.trim(n.nodeValue);
				if(d && options.serialize){
					d = davinci.html.escapeXml(d);
				}
				break;
			case 8: // Comment
				d = "<!--" + n.nodeValue + "-->";
				break;
			}
			if(d){
				childrenData.push(d);
			}
		}
		if(childrenData.length === 0){
			return undefined;
		}
		return childrenData;
	},
	
	setProperties: function(properties, modelOnly) {
		
        modelOnly = modelOnly ? modelOnly : false; // default modelOnly to false
		
        var node = this.domNode;
		
		for(var name in properties){
			if (name === 'style'){ // needed for position absolute
				dojo.style(node, properties[name]);
			} else {
				if(!properties[name]){
					node.removeAttribute(name);
				} else {
				    if ( ! modelOnly ) {
				        node[name]= properties[name];
				    }
		//			dojo.attr(node,name,properties[name]);
				}
			}
		}
		this.inherited(arguments);
	},

	 getContainerNode: function(){
		// summary:
		//		Returns the passed node itself if the node is allowed to have childNodes.
		//		Otherwise returns undefined.
		//

//FIXME: This isn't right. This info should be table-driven and not hard-coded.
//Better to put a 'isContainer' or 'canHaveChildren' property in widget metadata.
//That way, it would apply to OAWidgets, also.
//But actually, we probably need something more elaborate where we not only say
//whether an element can have children, we also want to say which children are
//allowed. For example, a TR should only have TD or TH children. Similarly,
//certain Dojo widget can only have certain Dojo widgets as children.
//Also, some widgets (e.g., TabContainer) should not accept children via drag/drop
//or rearrangement in Outline palette. Instead, that widget should only add/delete
//children via special controller logic.
//Maybe put some of this "children allowed" info in davinci.Runtime.widgetTable?

		var tagName = this.getTagName();
		switch(tagName){
		case "input":
		case "img":
		case "hr":
		case "br":
		case "script":
			return undefined;
		default:
			return this.domNode;
		}
	},

	getChildren: function(){
		var dvWidget = function(child){
			return child._dvWidget;
		};

		return dojo.map(dojo.filter(this.domNode.children, dvWidget), dvWidget);
	},

	_attr: function (name,value){
		if (arguments.length>1)
		{
			this.domNode[name]=value;
		}
		else
		{
			return this.domNode[name];
		}
	},
	
	_getWidget: function(){
		return this.domNode;
	},
	getTagName: function(){
		return this.domNode.nodeName.toLowerCase();
	}

});


//dojo.declare("davinci.ve.OpenAjaxWidget",davinci.ve._Widget,{
//	isOpenAjaxWidget: true,
//
//	constructor: function (parms,node,type,metadata,srcElement){
//		dojo.attr(node, "oawidget", type);
//		if(!metadata){
//			metadata = davinci.ve.metadata.getMetadata(type);
//		}
//		//FIXME: Temporary workaround until figuring out how to work with model
//		//to serialize a SCRIPT tag with oam_urls={...}.
//		//FIXME: Not good to hardcode "../". Need a more general solution.
//		var url = "../" + metadata.$src;
//		dojo.attr(node, "oaurl", url);
//		node.style.display = "inline-block";
//		if(srcElement){
//			srcElement.addAttribute("oawidget", type);
//			srcElement.addAttribute("oaurl", url);
//			var val=node.getAttribute('style');
//			srcElement.addAttribute('style', val);
//		}
//	},
//
//	buildRendering: function(){
//		this.containerNode = this.domNode; // for getDescendants()
//		if(this._params){
//			for(var name in this._params){
//				this.domNode.setAttribute(name, this._params[name]);
//			}
//			this._params = undefined;
//		}
//	},
//
//	attach: function(){
//		var that=this; //FIXME: use dojo.hitch
//
//		// Make sure loader is executed in the context of the user's doc, not daVinci's doc
//		var userElem = this.domNode;	//FIXME: Which one of these is the right one to use?
//		if (!userElem) {
//			return;
//		}
//		var userDoc = userElem.ownerDocument;
//		var userWin = userDoc.defaultView || userDoc.parentWindow; //FIXME: Might need additional logic like dijit.getDocumentWindow() for IE6
//		if (!userWin) {
//			return;
//		}
//		var loaderArgs = {
//			ManagedHub: {
//				onPublish: function(topic, data, publishContainer, subscribeContainer) { /*FIXME: console.log("onPublish not yet implemented");*/ return true; },
//				onSubscribe: function(topic, container) { /*FIXME:console.log("onSubscribe not yet implemented");*/ return true; },
//				onUnsubscribe: function(topic, container) { /*FIXME:console.log("onUnsubscribe not yet implemented");*/ return true; },
//				onSecurityAlert: function(source, alertType) { /*FIXME:console.log("onSecurityAlert not yet implemented");*/ }
//			}
//		};
//		// FIXME: put widget loader onto context?
//		if(!userWin.OpenAjax.widget._davinci_widget_loader){
//			userWin.OpenAjax.widget._davinci_widget_loader = new userWin.OpenAjax.widget.Loader(loaderArgs);
//		}
//		var oam_loader = userWin.OpenAjax.widget._davinci_widget_loader;
//
//		function loadWidgetOnComplete(data) {
//			var context = that.getContext();
//			if(context){
///*
//				// Update the oam_urls() value
//				var scripts=context.getDocumentElement().getChildElements('script', true);
//				for(var i=0; i<scripts.length; i++){
//					var src=scripts[i].getAttribute('src');
//					if(src && src.indexOf('oawidget_parser') >= 0){
//						//FIXME. Not yet working.
//						//Instead, adding an oaurl attribute to widget's root note (see above).
//						//It SHOULD work that if we put an oam_urls attribute
//						//on the SCRIPT tag that loads oawidget_parser, but
//						//when adding an attribute and saving, it doesn't appear
//						//in the output. Need to talk with Phil about this.
//						//Anyways, probably better to add an inline SCRIPT tag
//						//with oam_urls just like we did for 0.4 and 0.5.
//						scripts[i].addAttribute('oam_urls','foo');
//					}
//				}
//*/
//				// Call select potentially in onComplete() because need to recompute
//				// selection size and position now that widget has successfully loaded.
//				context.select(that);
//			}
//		}
//		function loadWidgetOnError(data) {
//			console.log("loadWidgetOnError");
//		}
//		var metadata = this.metadata;
//		var oam_metadata = metadata ? metadata._oam_metadata_ : undefined;
//		if (!oam_loader || !oam_metadata) {
//			return;
//		}
//		oam_loader.create({
//			spec: oam_metadata,
//			target:this.domNode,
//			async:false,
//			onComplete:loadWidgetOnComplete,
//			onError:loadWidgetOnError
//		});
//	},
//
//	_getWidget: function(){
//		return this.domNode;
//	},
//
//	getTagName: function(){
//		return this.domNode.nodeName.toLowerCase();
//	}
//	
//});

