define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/Deferred",
	"dijit/_WidgetBase",
	"davinci/Runtime",
	"davinci/Workbench",
	"dijit/_KeyNavContainer",
	"dijit/Tooltip",
	"dijit/form/TextBox",
	"davinci/ui/dnd/DragSource",
	"davinci/ve/metadata",
	"davinci/library",
	"./PaletteFolder",	// There must be a circular dependency - not available when this routine is loaded
	"./PaletteItem",
	"dojo/i18n!davinci/ve/nls/common",
	"davinci/ve/tools/CreateTool",
	"davinci/workbench/Preferences",
	"davinci/ve/metadata"
], function(
	declare,
	Lang,
	connect,
	Deferred,
	WidgetBase,
	Runtime,
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
	Preferences,
	Metadata) {

// Disable dijit's automatic key handlers until there is time to do it right
return declare("davinci.ve.palette.Palette", [WidgetBase, _KeyNavContainer], {

	descriptors: "", // "fooDescriptor,barDescriptor"
//	_resource: null,
//	_context: null,
	_displayShowValue: 'block', // either block or inline-block, depending on editorPrefs.widgetPaletteLayout
	_presetClassNamePrefix: 'maqPaletteSection_',	// Only used for debugging purposes
	_presetSections: {},	// Assoc array of all paletteItem objects, indexed by [preset][section]
	
	postMixInProperties: function() {
		this._resource = commonNls;
	},
	
	postCreate: function(){
		dojo.addClass(this.domNode, "dojoyPalette");
		this.refresh();
		// Disable dijit's automatic key handlers until there is time to do it right
		// As currently implemented, causes hidden palette folders from other presets to appear
		//this.connectKeyNavHandlers([dojo.keys.UP_ARROW], [dojo.keys.DOWN_ARROW]);
		connect.subscribe("/davinci/ui/libraryChanged", this, "refresh");
		connect.subscribe("/davinci/ui/addedCustomWidget", this, "addCustomWidget");
		connect.subscribe("/davinci/preferencesChanged", this, "preferencesChanged");
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
			// this._createFolder() has a miniscule chance of not happening synchronously
			var deferred = this._createFolder(opt);
			deferred.then(function(){
				if(component.items){
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
			}.bind(this));
		}
	},
	
	setContext: function(context){
		this._context = context;
		this._loadPalette();
		// Disable dijit's automatic key handlers until there is time to do it right
		//this.startupKeyNavChildren();

		// setting context will reset
		this.filterField.set("value", "");
		this._filter();
		this.updatePaletteVisibility();
	},

	refresh: function() {
		delete this._loaded;
		this._presetSections = {};
		this._createFolderTemplate();
		this._createHeader();
		
		if (this._context) {
			this._loadPalette();
			// Disable dijit's automatic key handlers until there is time to do it right
			//this.startupKeyNavChildren();
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

		var paletteItemGroupCount = 0;
		var widgetPalette = Runtime.getSiteConfigData('widgetPalette');
		if(!widgetPalette){
			console.error('widgetPalette.json not defined (in siteConfig folder)');
		}else{
			// There should be a preset for each of built-in composition types (desktop, mobile, sketchhifi, sketchlofi)
			// In future, we might allow users to create custom presets
			var presets = widgetPalette.presets;
			if(!presets || typeof presets != 'object'){
				console.warning('No presets defined in widgetPalette.json (in siteConfig folder)');
			}else{
				for(var p in presets){
					this._presetSections[p] = [];
					var preset = presets[p];
					var collections = preset.collections;	// Precedence order for the different widget collections
					// For each preset, widgetPalette.json can either use the $defaultSections list of sections
					// or a special list of sections defined for this preset
					var sections = preset.sections == '$defaultSections' ? widgetPalette['$defaultSections'] : preset.sections;
					if(!sections || !sections.length){
						console.warning('No sections defined for preset '+p+' in widgetPalette.json (in siteConfig folder)');
					}else{
						for(var s=0; s < sections.length; s++){
							var section = dojo.clone(sections[s]);
							// Add preset name to object so downstream logic can add an appropriate CSS class
							// to the paletteFolder and paletteItem DOM nodes
							section.preset = preset;
							section.presetId = p;
							section.items = [];
							var includes = section.includes;
							if(!includes || !includes.length){
								console.warning('No includes property for preset '+p+' in widgetPalette.json (in siteConfig folder)');
								continue;
							}
							for(var inc=0; inc < includes.length; inc++){
								var includeValue = includes[inc];
								// Each item in "includes" property can be an array of strings or string
								var includeArray = Lang.isArray(includeValue) ? includeValue : [includeValue];
								var sectionItems = [];
								for(var ii=0; ii < includeArray.length; ii++){
									var includeItem = includeArray[ii];
									var items = [];
									if(includeItem.substr(0,5) === 'type:'){
										// explicit widget type
										var item = Metadata.getWidgetDescriptorForType(includeItem.substr(5));
										if(item){
											items.push(item);
										}
									}else{
										items = Metadata.getWidgetsWithTag(includeItem);
									}
									for(var itemindex=0; itemindex < items.length; itemindex++){
										var item = items[itemindex];
										var newItem = dojo.clone(item);
										var $wm = Metadata.getLibraryMetadataForType(newItem.type);
										newItem.$library = $wm;
										newItem.paletteItemGroup = paletteItemGroupCount;
										sectionItems.push(newItem);
									}
								}
								// Sort sectionItems based on order in "collections" property
								var sortedItems = [];
								// Created a sorted list of items, using preset.collections to define the order
								// of widgets within this group.
								if(collections && collections.length){
									for(var co=0; co<collections.length; co++){
										var collection = collections[co];
										var si = 0;
										while(si < sectionItems.length){
											var sectionItem = sectionItems[si];
											if(sectionItem.collection == collection.id){
												sortedItems.push(sectionItem);
												sectionItems.splice(si, 1);
											}else{
												si++;
											}
										}
									}
									// Add any remaining section items to end of sortedItems
									for(var si = 0; si < sectionItems.length; si++){
										sortedItems.push(sectionItems[si]);
									}
								}else{
									sortedItems = sectionItems;
								}
								for(var si=0; si < sortedItems.length; si++){
									section.items.push(sortedItems[si]);
								}
								paletteItemGroupCount++;
							}
							this._presetSections[p].push(section);
						}
					}
				}
			}
		}
		this._loaded = true; // call this only once
	},
	
	// generate CSS Rules for icons based on this._descriptor
	// TODO: Currently this is used by Outline only, Palette should use
	_generateCssRules: function(descriptor) {
		var sheet = dojo.doc.styleSheets[0]; // This is dangerous...assumes content.css is first position
		if(!sheet){ return; }

		dojo.forEach(descriptor, function(component){
			if(component.items){
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
			}
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
		
		// Only used for debugging purposes
		var presetClassName = component.presetId ? this._presetClassNamePrefix + component.presetId : null;
		var opt = {
			paletteId: this.id,
			icon: componentIcon,
			displayName: /* XXX component.provider.getDescriptorString(component.name) ||*/ component.name,
			preset: component.preset,
			presetId: component.presetId,
			presetClassName: presetClassName	// Only used for debugging purposes
		};
		// this._createFolder() has a miniscule chance of not happening synchronously
		var deferred = this._createFolder(opt);
		deferred.then(function(){
			if(component.items){
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
						category: component.name,
						preset: component.preset,
						presetId: component.presetId,
						presetClassName: presetClassName,	// Only used for debugging purposes
						paletteItemGroup: item.paletteItemGroup
					};
					this._createItem(opt);
				}, this);
			}
		}.bind(this));
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
		var deferred = new Deferred();
		
		// Must have a circular require() reference going on because
		// doesn't work to put require for PaletteFolder at top of file
		require(["davinci/ve/palette/PaletteFolder"],function(PaletteFolder){
			var PaletteFolder = new PaletteFolder(opt);
			this.addChild(PaletteFolder);
			deferred.resolve();
		}.bind(this));
		return deferred;
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
	
	/**
	 * Control visibility of the various paletteFolder and paletteItem controls
	 * based on the preset that applies to the currently open editor.
	 */
	updatePaletteVisibility: function(){
		// Determine which preset applies to the current editor
		if(!Runtime.currentEditor || Runtime.currentEditor.declaredClass != "davinci.ve.PageEditor" ||
				!Runtime.currentEditor.getContext){
			return;
		}
		var context = Runtime.currentEditor.getContext();
		var comptype = context.getCompType();
		var presetClassName = this._presetClassNamePrefix + comptype;	// Only used for debugging purposes

		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
		if(editorPrefs.widgetPaletteLayout == 'icons'){
			dojo.addClass(this.domNode, "paletteLayoutIcons");
			this._displayShowValue = 'inline-block';
		}else{
			dojo.removeClass(this.domNode, "paletteLayoutIcons");
			this._displayShowValue = 'block';
		}

		//FIXME: current preset might be different than comptype once various new UI options become available
		var orderedDescriptions = [];
		var sections = this._presetSections[comptype];
		if(!sections){
			console.error('Palette.js - no sections for comptype='+comptype);
		}else{
			for(var s = 0; s<sections.length; s++){
				var section = sections[s];
				if(!section._created){
					var orderedDescriptors = [section];
					this._generateCssRules(orderedDescriptors);
					this._createPalette(section);
					section._created = true;
				}
			}
		}
		// Set display property to show only those PaletteFolder's and PaletteItem's
		// that correspond to the current preset
		var children = this.getChildren();
		for(var i = 0, len = children.length; i < len; i++){
			var child = children[i];
			if(child && child.domNode && child.presetId){
				if(child.declaredClass == "davinci.ve.palette.PaletteFolder" && child.presetId == comptype){
					child.domNode.style.display = 'block';
				}else{
					child.domNode.style.display = 'none';
				}
			}
		
		}
	},
	
	preferencesChanged: function() {
		this.updatePaletteVisibility();
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
