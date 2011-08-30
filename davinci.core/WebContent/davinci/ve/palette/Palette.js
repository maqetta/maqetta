dojo.provide("davinci.ve.palette.Palette");

dojo.require("dijit._Widget");
dojo.require("dijit._Container");
dojo.require("dijit.Tooltip");
dojo.require("dojo.i18n");
dojo.require("dojo.fx");
dojo.require("davinci.ve.tools.CreateTool");
dojo.require("davinci.ui.dnd.DragSource");
//dojo.require("davinci.ui.dnd.DropTarget");
dojo.require("davinci.ve.metadata");
dojo.require("davinci.ve.palette.PaletteFolder");
dojo.require("davinci.ve.palette.PaletteItem");
//FIXME: Need to separate out the logic that builds the davinci.Runtime.widgetTable
dojo.require("davinci.Runtime");

dojo.requireLocalization("davinci.ve", "common");

dojo.declare("davinci.ve.palette.Palette", [dijit._Widget, dijit._KeyNavContainer], {

	descriptors: "", // "fooDescriptor,barDescriptor"
	_resource: null,
	_context: null,
	_folders: {},
	
	postMixInProperties: function() {
		this._resource = dojo.i18n.getLocalization("davinci.ve", "common");
	},
	
	postCreate: function(){

		dojo.addClass(this.domNode, "dojoyPalette");
		this._createFolderTemplate();
		this._createItemTemplate();
		this._createHeader();
		this.connectKeyNavHandlers([dojo.keys.UP_ARROW], [dojo.keys.DOWN_ARROW]);
	},
	
	setContext: function(context){
		this._context = context;
		this._loadPalette();
		this.startupKeyNavChildren();
	},

	_loadPalette: function(){
		
		this._loadPalette = function(){}; // call this only once
		var libraries = davinci.ve.metadata.getLibrary();

		// Merge descriptors that have the same category
		// XXX Need a better solution for enumerating through descriptor items and creating
		//    category groups.
        var descriptorObject = {};
		for (var name in libraries) if (libraries.hasOwnProperty(name)) {
		    var lib = libraries[name];
		    dojo.forEach(lib.widgets, function(item) {
                var category = lib.categories[item.category];
                if (!descriptorObject[category.name]) {
                    descriptorObject[category.name] = dojo.clone(category);
                    descriptorObject[category.name].items = [];
                }
                var newItem = dojo.clone(item);
                newItem.$library = lib;
                descriptorObject[category.name].items.push(newItem);
		    });
		}
		
		// Force certain hardcoded ones to top: Containers, Controls, Other, Untested, ...
		// FIXME: Need a more flexible approach (versus hardcoding in JavaScript)
		var orderedDescriptors = [];
		var predefined = ["Dojo Containers", "Dojo Controls", "HTML", "Dojox Mobile", "Untested Dojo & HTML"];
		dojo.forEach(predefined, function(name) {
		    if (descriptorObject[name]) {
		        orderedDescriptors.push(descriptorObject[name]);
		        delete descriptorObject[name];
		    }
		});
		// For any categories other than the hardcoded ones.
		for (var category in descriptorObject) {
            orderedDescriptors.push(descriptorObject[category]);
            delete descriptorObject[category];
        }
		
		this._generateCssRules(orderedDescriptors);
		dojo.forEach(orderedDescriptors, function(component) {
			if (component.name && !this._folders[component.name]) {
				this._createPalette(component);
				this._folders[component.name] = true;
			}
		}, this);
	},
	
	// possible to add descriptor and palette items dynamically
// XXX not used
//	addDescriptor: function(name){
//		
//		//FIXME: Not sure this function ever gets called
//		//FIXME: Bug here. Can't add widgets to an already-existing section
//		dojo.forEach(this._getDescriptor(name), 
//			function(component) { 
//				if (component.category && !this._folders[component.category]) {
//					this._createPalette(component);
//					this._folders[component.category] = true;
//				}
//			},
//			this
//		);
//	},
	
	
	// generate CSS Rules for icons based on this._descriptor
	// TODO: Currently this is used by Outline only, Palette should use
	_generateCssRules: function(descriptor) {
		var sheet = dojo.doc.styleSheets[0]; // This is dangerous...assumes content.css is first position
		if(!sheet){ return; }

		dojo.forEach(descriptor, function(component){
			dojo.forEach(component.items, function(item){
				var iconSrc = item.iconBase64 || this._getIconUri(item.icon, "ve/resources/images/file_obj.gif");
				var selector = "img.davinci_"+item.type.replace(/\./g, "_");
				var rule = "{background-image: url(" + iconSrc + ")}";
				if(dojo.isIE){
					sheet.addRule(selector, rule);
				}else{
					sheet.insertRule(selector + rule, sheet.cssRules.length);
				}
			}, this);
		}, this);
	},
	
	_createPalette: function(component){
		
		//FIXME: Hardcode icons for now. Need to make this into configuration metadata feature.
		//See bug 7642
		var iconFolder = "ve/resources/images/";
		var icon_table = {
			"Dojo Containers":"dojo-objects.png",
			"Dojo Controls":"dojo-objects.png",
			"HTML":"html-widgets.png",
			"Untested Dojo & HTML":"untested.gif",
			"jQuery UI":"jquery-wdgts.gif",
			"YUI":"yui-widgets.gif",
			"Lotus One UI":"lts-widgets.gif",
			"Dojox Mobile":"dojox.mobile.cat.gif"
		};
		var defaultIconFile = "fldr_obj.gif";
		var iconFile = icon_table[component.name];
		if(!iconFile){
			iconFile = defaultIconFile;
		}
		var iconUri = iconFolder + iconFile;
		componentIcon = this._getIconUri(component.icon, iconUri);
		
		var opt = {
			paletteId: this.id,
			icon: componentIcon,
			displayName: /* XXX component.provider.getDescriptorString(component.name) ||*/ component.name
		};
		this._createFolder(opt);
		dojo.forEach(component.items, function(item){
	        // XXX For now, we want to keep some items hidden. If item.hidden is set, then don't
	        //  add this item to palette (see bug 5626).
	        if (item.hidden) {
	            return;
	        }

			var opt = {
				icon: item.iconBase64 || this._getIconUri(item.icon, "ve/resources/images/file_obj.gif"),
				displayName:
					item.$library._maqGetString(item.type) ||
					item.$library._maqGetString(item.name) ||
					item.name,
				description: 
				    item.$library._maqGetString(item.type+"_description") || 
				    item.$library._maqGetString(item.name+"_description") || 
					item.description || 
					item.type,
				name: item.name,
				paletteId: this.id,
				type: item.type,
				data: item.data || {type: item.type, properties: item.properties, children: item.children},
				tool: item.tool
			};
			this._createItem(opt);
		}, this);
	},
	
	_getIconUri: function(uri, fallbackUri) {
	    if (uri) {
	    	/* maybe already resolved */
	    	if(uri.indexOf("http")==0)
	    		return uri;
	    	
	    	return davinci.Workbench.location() + uri;
	      
	    }
	    return dojo.moduleUrl("davinci", fallbackUri).uri;
	},

	_createFolder: function(opt){
		var node = new davinci.ve.palette.PaletteFolder(opt);
		this.addChild(node);
		return node;
	},
	
	_createFolderTemplate: function(){
		// <DIV class="dojoyPaletteFolder">
		//     <A href="javascript:void(0)"><IMG src="a.gif">label</A>
		// </DIV>
		var div = this.folderTemplate = dojo.doc.createElement("DIV");
		div.className = "dojoyPaletteCommon dojoyPaletteFolder dojoyPaletteFolderLow";
		var a = dojo.doc.createElement("A");
		a.href = "javascript:void(0)";
		var img = dojo.doc.createElement("IMG");
		img.border = "0";
		a.appendChild(img);
		div.appendChild(a);
	},

	_createItemTemplate: function(){
		var div = this.itemTemplate = dojo.doc.createElement("DIV");
		div.className = "dojoyPaletteCommon dojoyPaletteItem";
		var a = dojo.doc.createElement("A");
		a.href = "javascript:void(0)";
		var img = dojo.doc.createElement("IMG");
		img.border = "0";
		a.appendChild(img);
		div.appendChild(a);
	},

	_createHeader: function(){
		var div = dojo.doc.createElement("div");
		div.className = "dojoyPaletteCommon";
		var input = this.filterField = dojo.doc.createElement("input");
		input.type = "text";
//		input.size = "24";
		input.className = "dojoyPaletteSearch";
		var searchString = input.value = this._resource["filter"]+"...";
		this.connect(input, "onblur", function(){ if(input.value=="") input.value = searchString;});
		this.connect(input, "onfocus", function() { if(input.value == searchString) input.value = "";});
		this.connect(input, "onkeyup", "_filter");
		div.appendChild(input);
		this.domNode.appendChild(div);
	},
	
	_filter: function(e) {
		var children = this.getChildren();
		var value = this.filterField.value;
		for(var i = 0; i < children.length; i++){
			var child = children[i];
			if(value == "") {
				dojo.style(child.domNode, "display", "block");
			}else if(child.declaredClass == "davinci.ve.palette.PaletteFolder") {
				dojo.style(child.domNode, "display", "none");
			}else if((child.name && child.name.match(new RegExp(value,"i")))) {
				dojo.style(child.domNode, "display", "block");
			}else{
				dojo.style(child.domNode, "display", "none");
			}
		}
	},
	
	_createItem: function(opt){
		var node = new davinci.ve.palette.PaletteItem(opt);
		this.addChild(node);
		var ds = new davinci.ui.dnd.DragSource(node.domNode, "component", node);
		ds.targetShouldShowCaret = true;
		ds.returnCloneOnFailure = false;
		this.connect(ds, "onDragStart", "onDragStart"); // move start
		this.connect(ds, "onDragEnd", "onDragEnd"); // move end
		node.tooltip = new dijit.Tooltip({
			label:opt.description, 
			connectId:[node.id]
		});
		return node;
	},

	onDragStart: function(e){
		
		var data = e.dragSource.data,
		// Clone the data in case something modifies it downstream
			dataClone = dojo.clone(data.data),
			toolClass = davinci.ve.tools.CreateTool;
		if (data.tool) {
		    dojo["require"](data.tool);
		    toolClass = dojo.getObject(data.tool);
		}
		var tool = new toolClass(dataClone);
		tool._type = data.type;
		this._context.setActiveTool(tool);
	},

    onDragEnd: function(e){
		this.pushedItem = null;
		this._context.setActiveTool(null);
	},
	
	onDragMove: function(e){
		// someone may want to connect to this...
	},

	nop: function(){
		return false;
	},

	__dummy__: null	
});
