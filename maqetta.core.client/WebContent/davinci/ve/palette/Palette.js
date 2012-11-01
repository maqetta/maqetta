define([
    "dojo/_base/declare",
	"dijit/_WidgetBase",
	"davinci/Workbench",
	"dijit/_KeyNavContainer",
	"dijit/Tooltip",
	"dijit/form/TextBox",
	"davinci/ui/dnd/DragSource",
	"davinci/ve/metadata",
	"davinci/library",
	"./PaletteFolder",
	"./PaletteItem",
	"dojo/i18n!davinci/ve/nls/common",
	"davinci/ve/tools/CreateTool",
	"davinci/workbench/Preferences"
], function(
	declare,
	WidgetBase,
	Workbench,
	_KeyNavContainer,
	Tooltip,
	TextBox,
	DragSource,
	Metadata,
	Library,
	PaletteFolder,
	PaletteItem,
	commonNls,
	CreateTool,
	Preferences) {

return declare("davinci.ve.palette.Palette", [WidgetBase, _KeyNavContainer], {

	descriptors: "", // "fooDescriptor,barDescriptor"
//	_resource: null,
//	_context: null,
	_folders: {}, //FIXME: not instance safe
	_folderNodes: {}, //FIXME: not instance safe
	_displayShowValue: 'block', // either block or inline-block, depending on editorPrefs.widgetPaletteLayout
	
	postMixInProperties: function() {
		this._resource = commonNls;
	},
	
	postCreate: function(){
		dojo.addClass(this.domNode, "dojoyPalette");
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', 
				Workbench.getProject());
		if(editorPrefs.widgetPaletteLayout == 'icons'){
			dojo.addClass(this.domNode, "paletteLayoutIcons");
			this._displayShowValue = 'inline-block';
		}else{
			dojo.removeClass(this.domNode, "paletteLayoutIcons");
			this._displayShowValue = 'block';
		}
		this.refresh();
		this.connectKeyNavHandlers([dojo.keys.UP_ARROW], [dojo.keys.DOWN_ARROW]);
		dojo.subscribe("/davinci/ui/libraryChanged", this, "refresh");
		dojo.subscribe("/davinci/ui/addedCustomWidget", this, "addCustomWidget");
	},
	
	addCustomWidget: function(lib){
		
		/* make sure the pallette has loaded. if it hasnt, the init will take care of customs */
		if(!this._loaded) return;
		
		var libraries = {};
		
		dojo.mixin(libraries, {custom:lib});
		
		// Merge descriptors that have the same category
		// XXX Need a better solution for enumerating through descriptor items and creating
		//    category groups.
        var descriptorObject = {};
		for (var name in libraries) {
			if (libraries.hasOwnProperty(name)) {
			    var library = libraries[name].$wm;
			    if (! library) {
			        continue;
			    }
			    
			    dojo.forEach(library.widgets, function(item) {
	                var category = library.categories[item.category];
	                if (!descriptorObject[category.name]) {
	                    descriptorObject[category.name] = dojo.clone(category);
	                    descriptorObject[category.name].items = [];
	                }
	                var newItem = dojo.clone(item);
	                newItem.$library = library;
	                descriptorObject[category.name].items.push(newItem);
			    });
			}
		}
		this._generateCssRules(descriptorObject);
		
		for(var name in descriptorObject){
			var component = descriptorObject[name];
			var iconFolder = "ve/resources/images/";
			var defaultIconFile = "fldr_obj.gif";
			var iconFile = defaultIconFile;
			var iconUri = iconFolder + iconFile;
			
			var componentIcon = this._getIconUri(component.icon, iconUri);
			
			var opt = {
				paletteId: this.id,
				icon: componentIcon,
				displayName: /* XXX component.provider.getDescriptorString(component.name) ||*/ component.name
			};
			var folder = this._createFolder(opt);
			dojo.forEach(component.items, function(item){
		        // XXX For now, we want to keep some items hidden. If item.hidden is set, then don't
		        //  add this item to palette (see bug 5626).
				
		        if (item.hidden || this._hasItem(item.type)) {
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
					data: item.data || {name:item.name, type: item.type, properties: item.properties, children: item.children},
					tool: item.tool,
					category: name
				};
				this._createItem(opt,folder);
			}, this);
		}
	},
	
	setContext: function(context){
		this._context = context;
		this._loadPalette();
		this.startupKeyNavChildren();

		// setting context will reset
		this.filterField.set("value", "");
		this._filter();
	},

	refresh: function() {
		delete this._loaded;
		this._createFolderTemplate();
		this._createHeader();
		
		if (this._context) {
			this._loadPalette();
			this.startupKeyNavChildren();
		}
	},

	_loadPalette: function(){
		if (this._loaded) { return; }

		var allLibraries = Metadata.getLibrary();
		var userLibs = Library.getUserLibs(Workbench.getProject());
		var libraries = {};
		
		function findInAll(name, version) {
			for (var n in allLibraries) {
				if (allLibraries.hasOwnProperty(n)) {
					var lib = allLibraries[n];
					if (lib.name === name && lib.version === version) {
						var ro = {};
						ro[name] = allLibraries[n];
						return ro;
					}
				}
			}
			return null;
		}
		
		userLibs.forEach(function(ulib) {
			var library = findInAll(ulib.id, ulib.version);
			if (library) {
				dojo.mixin(libraries, library);
			}
		});
	
		var customWidgets = Library.getCustomWidgets(Workbench.getProject());
		
		if (customWidgets) {
			dojo.mixin(libraries, customWidgets);
		}
		
		// Merge descriptors that have the same category
		// XXX Need a better solution for enumerating through descriptor items and creating
		//    category groups.
		var descriptorObject = {};
		for (var name in libraries) {
			if (libraries.hasOwnProperty(name)) {
				var lib = libraries[name].$wm;
			  if (! lib) {
			  	continue;
			  }

			  dojo.forEach(lib.widgets, function(item) {
			  	// skip untested widgets 
			  	if (item.category == "untested") {
						return;
					}
					
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
		}
		
		// Force certain hardcoded ones to top: Containers, Controls, Other, Untested, ...
		// FIXME: Need a more flexible approach (versus hardcoding in JavaScript)
		var orderedDescriptors = [];
		var predefined = ["Dojo Containers", "Dojo Controls", "HTML", "Dojox Mobile", "Clip Art", "Drawing Tools", "Untested Dojo & HTML"];
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
		this._loaded = true; // call this only once
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
			"Drawing Tools":"drawing-tools-widgets.png",
			"Clip Art":"clipart-widgets.png",
			"Untested Dojo & HTML":"untested.gif",
//			"jQuery UI":"jquery-wdgts.gif",
//			"YUI":"yui-widgets.gif",
			"Lotus One UI":"lts-widgets.gif",
			"Dojox Mobile":"dojox.mobile.cat.gif"
		};
		var defaultIconFile = "fldr_obj.gif";
		var iconFile = icon_table[component.name];
		if(!iconFile){
			iconFile = defaultIconFile;
		}
		
		var iconUri = iconFolder + iconFile;
		var componentIcon = this._getIconUri(component.icon, iconUri);
		
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
				data: item.data || {name:item.name, type: item.type, properties: item.properties, children: item.children},
				category: component.name
			};
			this._createItem(opt);
		}, this);
	},
	
	_getIconUri: function(uri, fallbackUri) {
		
	    if (uri) {
	    	/* maybe already resolved */
	    	if(uri.indexOf("http")==0) {
	    		return uri;
	    	}
	    	
	    	return Workbench.location() + uri;
	    }
	    return require.toUrl("davinci/" + fallbackUri);
	},

	_createFolder: function(opt){
		
		if(this._folderNodes[opt.displayName]!=null) {
			return this._folderNodes[opt.displayName];
		}

		this._folderNodes[opt.displayName] = new PaletteFolder(opt);
		this.addChild(this._folderNodes[opt.displayName]);
		return this._folderNodes[opt.displayName];
	},
	
	_createFolderTemplate: function(){
		// <DIV class="dojoyPaletteFolder">
		//     <A href="javascript:void(0)"><IMG src="a.gif">label</A>
		// </DIV>
		this.folderTemplate = dojo.create('div',
		        {
		            className: 'dojoyPaletteCommon dojoyPaletteFolder dojoyPaletteFolderLow',
		            innerHTML: '<a href="javascript:void(0)"><img border="0"/></a>'
		        }
		);
	},

	_createHeader: function(){
		var div = dojo.doc.createElement("div");
		div.className = "dojoyPaletteCommon";

		var input = dojo.doc.createElement("input");
		div.appendChild(input);
		this.domNode.appendChild(div);

		var searchString =  this._resource["filter"]+"...";
		this.filterField = new TextBox({style: "width: 99%", placeHolder: searchString}, input);
		dojo.connect(this.filterField, "onKeyUp", this, "_filter");

	},
	
	_filter: function(e) {
		var value = this.filterField.get("value"),
    	re = new RegExp(value, 'i'),
      action;

      // reset to default state -- only show category headings
		var displayShowValue = this._displayShowValue;
	    function resetWidgets(child) {
	    	if (child.declaredClass != 'dijit.form.TextBox') {
	    		var style = child.declaredClass === 'davinci.ve.palette.PaletteFolder' ?
	    			'block' : 'none';
	    		dojo.style(child.domNode, 'display', style);
	    	}
	    }

	    // show widgets which match filter text
	    function filterWidgets(child) {
	    	if (child.declaredClass == 'dijit.form.TextBox') {
	    		// do nothing
	    	} else if (child.declaredClass === 'davinci.ve.palette.PaletteFolder') {
	    		dojo.style(child.domNode, 'display', 'none');
	    	} else if (child.name && re.test(child.name)) {
	    		dojo.style(child.domNode, 'display', displayShowValue);
	    	} else {
	    		dojo.style(child.domNode, 'display', 'none');
	    	}
	    }

	    if (value === '') {
	        action = resetWidgets;
	        dojo.removeClass(this.domNode, 'maqWidgetsFiltered');
	    } else {
	        action = filterWidgets;
	        dojo.addClass(this.domNode, 'maqWidgetsFiltered');
	    }
        this.getChildren().forEach(action);
	},
	
	_hasItem : function(type){
		var children = this.getChildren();
		for(var i=0;i<children.length;i++){
			
			if(children[i].type==type){
				return true; // already exists.
			}
		}
		return false;
	},
	
	_createItem: function(opt,folder){
		
		
		var node = new PaletteItem(opt);
		if(!folder){
			this.addChild(node);
		}else{
			folder.addChild(node);
		}
		var ds = new DragSource(node.domNode, "component", node);
		ds.targetShouldShowCaret = true;
		ds.returnCloneOnFailure = false;
		this.connect(ds, "onDragStart", dojo.hitch(this,function(e){this.onDragStart(e);})); // move start
		this.connect(ds, "onDragEnd", dojo.hitch(this,function(e){this.onDragEnd(e);})); // move end
		node.tooltip = new Tooltip({
			label:opt.description, 
			connectId:[node.id]
		});
		return node;
	},
	
	onDragStart: function(e){	
		var data = e.dragSource.data;
		Metadata.getHelper(data.type, 'tool').then(function(ToolCtor) {
			// Copy the data in case something modifies it downstream -- what types can data.data be?
			var tool = new (ToolCtor || CreateTool)(dojo.clone(data.data));
			this._context.setActiveTool(tool);
		}.bind(this));

		// Sometimes blockChange doesn't get cleared, force a clear upon starting a widget drag operation
		this._context.blockChange(false);

		// Place an extra DIV onto end of dragCloneDiv to allow 
		// posting a list of possible parent widgets for the new widget
		// and register the dragClongDiv with Context
		if(e._dragClone){
			dojo.create('div',{className:'maqCandidateParents'}, e._dragClone);
		}
		//FIXME: Attach dragClone and event listeners to tool instead of context?
		this._context.setActiveDragDiv(e._dragClone);
		this._dragKeyDownListener = dojo.connect(document, 'onkeydown', dojo.hitch(this,function(event){
			var tool = this._context.getActiveTool();
			if(tool && tool.onKeyDown){
				tool.onKeyDown(event);
			}
		}));
		this._dragKeyUpListener = dojo.connect(document, 'onkeyup', dojo.hitch(this,function(event){
			var tool = this._context.getActiveTool();
			if(tool && tool.onKeyUp){
				tool.onKeyUp(event);
			}
		}));
	},

    onDragEnd: function(e){
		this.pushedItem = null;
		this._context.setActiveTool(null);
		this._context.setActiveDragDiv(null);
		dojo.disconnect(this._dragKeyDownListener);
		dojo.disconnect(this._dragKeyUpListener);
	},
	
	onDragMove: function(e){
		// someone may want to connect to this...
	},

	nop: function(){
		return false;
	},

	__dummy__: null	
});
});
