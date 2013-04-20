define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/on",
	"dojo/query",
	"dojo/dom-class",
	"dojo/Deferred",
	"dijit/focus",
	"dijit/_WidgetBase",
	"davinci/Runtime",
	"davinci/Workbench",
	"dijit/_KeyNavContainer",
	"dijit/form/TextBox",
	"dijit/form/DropDownButton",
	"dijit/DropDownMenu",
	"dijit/MenuItem",
	"davinci/ui/dnd/DragSource",
	"davinci/ve/metadata",
	"davinci/library",
	"./PaletteFolder",	// There must be a circular dependency - not available when this routine is loaded
	"./PaletteItem",
	"dojo/i18n!davinci/ve/nls/common",
	"davinci/ve/tools/CreateTool",
	"davinci/workbench/Preferences"
], function(
	declare,
	Lang,
	connect,
	On,
	Query,
	domClass,
	Deferred,
	FocusUtils,
	WidgetBase,
	Runtime,
	Workbench,
	_KeyNavContainer,
	TextBox,
	DropDownButton,
	DropDownMenu,
	MenuItem,
	DragSource,
	Metadata,
	Library,
	PaletteFolder,
	PaletteItem,
	commonNls,
	CreateTool,
	Preferences) {

// Disable dijit's automatic key handlers until there is time to do it right
return declare("davinci.ve.palette.Palette", [WidgetBase, _KeyNavContainer], {

	descriptors: "", // "fooDescriptor,barDescriptor"
//	_resource: null,
//	_context: null,
	_displayShowValue: 'block', // either block or inline-block, depending on editorPrefs.widgetPaletteLayout
	_presetClassNamePrefix: 'maqPaletteSection_',	// Only used for debugging purposes
	_presetSections: {},	// Assoc array of all paletteItem objects, indexed by [preset][section]
	_presetCreated:{},	// Whether the given preset has created its PaletteFolder and PaletteItems
	raisedItems: [],	// PaletteItems that have "raised" styling
	sunkenItems: [],	// PaletteItems that have "sunken" styling
	moreItems: [],	// PaletteItems that have "more" tooltip dialog showing
	helpItems: [],	// PaletteItems that have "help" tooltip dialog showing
	_userWidgetSection: {
		"id": "$$UserWidgets$$",
		"name": "User Widgets",
		"includes": []
	},

	
	postMixInProperties: function() {
		this._resource = commonNls;
	},
	
	postCreate: function(){
		dojo.addClass(this.domNode, "dojoyPalette");
		this.refresh();
		// Disable dijit's automatic key handlers until there is time to do it right
		// As currently implemented, causes hidden palette folders from other presets to appear
		//this.connectKeyNavHandlers([dojo.keys.UP_ARROW], [dojo.keys.DOWN_ARROW]);
		
		/* Removing "refresh" logic because currently Palette.js only works
		 * at program initialization. Bad things happen if we try to recreate
		 * the palette in middle of a session. Of course, would be good to make
		 * the palette such that it could be reconstructed in middle of session.
		connect.subscribe("/davinci/ui/libraryChanged", this, "refresh");
		*/
		connect.subscribe("/davinci/ui/addedCustomWidget", this, "addCustomWidget");
		connect.subscribe("/davinci/preferencesChanged", this, "preferencesChanged");
	},

	addCustomWidget: function(lib){
		/* make sure the pallette has loaded. if it hasnt, the init will take care of customs */
		if(!this._loaded) return;
		if(!lib || !lib.$wm || !lib.$wm.widgets || !lib.$wm.widgets.length){
			return;
		}
		var context = Runtime.currentEditor.getContext();
		var comptype = context.getCompType();
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
		if(editorPrefs.showAllWidgets){
			comptype = (comptype == 'mobile') ? "$ALLMOBILE" : "$ALLDESKTOP";
		}

		var $library = lib.$wm;
		var widgets = lib.$wm.widgets;
		var folderToShow = null;
		for(var w=0; w<widgets.length; w++){
			var item = widgets[w];
			for(var presetId in this._presetSections){
				var customSection = null;
				var sections = this._presetSections[presetId];
				if(!sections){
					console.error('Palette.js:addCustomWidget - no sections for comptype='+presetId);
				}else{
					for(var s = 0; s<sections.length; s++){
						var section = sections[s];
						if(section.id == '$$UserWidgets$$'){
							customSection = section;
							break;
						}
					}
					if(!customSection){
						customSection = dojo.clone(this._userWidgetSection);
						customSection.preset = this._presetSections[presetId];
						customSection.presetId = presetId;
						customSection.items = [];
						sections.push(customSection);
						if(this._presetCreated[presetId]){
							var orderedDescriptors = [customSection];
							this._generateCssRules(orderedDescriptors);
							this._createPalette(customSection);
							customSection._created = true;
						}
					}
					var includesValue = 'type:' + item.type;
					if(customSection.includes.indexOf(includesValue) < 0){
						customSection.includes.push(includesValue);
						item.$library = $library;
						item.section = customSection;
						item._paletteItemGroup = this._paletteItemGroupCount++;
						customSection.items.push(item);
						var name = 'custom';
						var folder = null;
						var children = this.getChildren();
						for(var ch=0; ch<children.length; ch++){
							var child = children[ch];
							if(child.declaredClass == 'davinci.ve.palette.PaletteFolder'){
								if(child.presetId == presetId && child.section.id == '$$UserWidgets$$'){
									folder = child;
									break;
								}
							}
						}
						if(folder){
							folder.domNode.style.display = 'none';
							var opt = {
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
									category: name,
									section: customSection,
									PaletteFolderSection: folder,
									PaletteFolderSubsection: null,
									_paletteItemGroup: item._paletteItemGroup,
									_paletteGroupSelected: true
									};
							this._setIconProperties(item, opt);
							var newPaletteItem = this._createItem(opt,folder);
							newPaletteItem.domNode.style.display = 'none';
							if(comptype == presetId){
								folderToShow = folder;
							}
						}
					}
				}
			}
		}
		if(folderToShow){
			// open the currently active custom widget folder after creating a new custom widget
			folderToShow.showHideFolderContents(true);
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

		// For developer notes on how custom widgets work in Maqetta, see:
		// https://github.com/maqetta/maqetta/wiki/Custom-widgets	

		var customWidgets = Library.getCustomWidgets(Workbench.getProject());
		var customWidgetDescriptors = Library.getCustomWidgetDescriptors();
		if (customWidgets) {
			dojo.mixin(libraries, customWidgets);
		}

		// Create a master list of widget types.
		// Used later to make sure that there aren't widgets in widgets.json files
		// that do not appear anywhere in widget palette
		var widgetTypeList = [];
		for(var name in libraries){
			if (libraries.hasOwnProperty(name)) {
				var lib = libraries[name].$wm;
				if (!lib) {
					continue;
				}
				dojo.forEach(lib.widgets, function(item) {
					// skip untested widgets
					if (item.category == "untested" || item.hidden) {
						return;
					}
					widgetTypeList.push(item.type);
				});
			}
		}
		this._paletteItemGroupCount = 0;
		this._widgetPalette = Runtime.getSiteConfigData('widgetPalette');
		if(!this._widgetPalette){
			console.error('widgetPalette.json not defined (in siteConfig folder)');
		}else{
			// There should be a preset for each of built-in composition types (desktop, mobile, sketchhifi, sketchlofi)
			// In future, we might allow users to create custom presets
			var presets = this._widgetPalette.presets;
			if(!presets || typeof presets != 'object'){
				console.warning('No presets defined in widgetPalette.json (in siteConfig folder)');
			}else{
				for(var p in presets){
					var widgetList = widgetTypeList.concat();	// clone the array
					this._presetSections[p] = [];
					var preset = presets[p];
					var catchAllSection;
					// For each preset, the 'sections' property can either be a string or an array of section objects.
					// If a string, then that string is an reference to a sub-property of the top-level 'defs' object 
					var sections = (typeof preset.sections == 'string') ? 
							(this._widgetPalette.defs ? this._widgetPalette.defs[preset.sections] : undefined) : 
							preset.sections;
					if(!sections || !sections.length){
						console.warning('No sections defined for preset '+p+' in widgetPalette.json (in siteConfig folder)');
					}else{
						var arr = [];
						for(var cw in customWidgetDescriptors){
							var obj = customWidgetDescriptors[cw];
							if(obj.descriptor){
								arr.push({name:cw, value:obj});								
							}
						}
						arr.sort(function(a, b){
							var aa = a.name.split('/').pop().toLowerCase();
							var bb = b.name.split('/').pop().toLowerCase();
							 return aa<bb ? -1 : (aa>bb ? 1 : 0);
						});
						var UserWidgetSectionAdded = false;
						var userWidgetSection, customIncludes;
						for(var j=0; j<arr.length; j++){
							if(!UserWidgetSectionAdded){
								userWidgetSection = dojo.clone(this._userWidgetSection);
								sections = sections.concat(userWidgetSection);
								UserWidgetSectionAdded = true;
								customIncludes = userWidgetSection.includes;
							}
							var custWidgets = arr[j].value.descriptor.widgets;
							for(var cw=0; cw<custWidgets.length; cw++){
								var custWidget = custWidgets[cw];
								customIncludes.push('type:'+custWidget.type);
							}
						}
						for(var s=0; s < sections.length; s++){
							// For each sections, the value can either be a string or a section objects.
							// If a string, then that string is an reference to a sub-property of the top-level 'defs' object 
							var sectionObj = (typeof sections[s] == 'string') ? 
									(this._widgetPalette.defs ? this._widgetPalette.defs[sections[s]] : undefined) : 
									sections[s];
							var section = dojo.clone(sectionObj);
							// Add preset name to object so downstream logic can add an appropriate CSS class
							// to the paletteFolder and paletteItem DOM nodes
							section.preset = preset;
							section.presetId = p;
							if(section.subsections && section.subsections.length){
								var subsections = section.subsections;
								for(var sub=0; sub < subsections.length; sub++){
									if(typeof subsections[sub] == 'string'){
										var subsectionObj = this._widgetPalette.defs ? this._widgetPalette.defs[subsections[sub]] : undefined;
										if(subsectionObj){
											subsections[sub] = dojo.clone(subsectionObj);
										}
									}
									var subsection = subsections[sub];
									if(subsection.includes && subsection.includes.indexOf("$$AllOthers$$")>=0){
										catchAllSection = subsection;
									}
									subsection.preset = preset;
									subsection.presetId = p;
									// Stuffs in value for section.items
									this._createSectionItems(subsection, preset, widgetList);
								}								
							}else{
								// Stuffs in value for section.items
								this._createSectionItems(section, preset, widgetList);
								if(section.includes && section.includes.indexOf("$$AllOthers$$")>=0){
									catchAllSection = section;
								}
							}
							this._presetSections[p].push(section);
						}
					}
					for(var wi=0; wi<widgetList.length; wi++){
						var widgetType = widgetList[wi];
						if(catchAllSection){
							var item = Metadata.getWidgetDescriptorForType(widgetType);
							var newItem = dojo.clone(item);
							this._prepareSectionItem(newItem, catchAllSection, this._paletteItemGroupCount);
							catchAllSection.items.push(newItem);
							this._paletteItemGroupCount++;
						}else{
							console.log('For preset '+p+' Not in widget palette: '+widgetList[wi]);
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
					var selector = "img.davinci_"+item.type.replace(/[\.\/]/g, "_");
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
	
	/**
	 * Creates the PaletteItems for a given section or subsection (the "component")
	 * @param {object} component  either a section object or subsection object from widgetPalette.json
	 * @param {object} params
	 *    params.presetClassName {string} classname to put onto PaletteItems (for debugging purposes)
	 */
	_createPaletteItemsForComponent: function(component, params){
		if(component.items){
			var lastPaletteItemGroup = null;
			dojo.forEach(component.items, function(item){
		        // XXX For now, we want to keep some items hidden. If item.hidden is set, then don't
		        //  add this item to palette (see bug 5626).
		        if (item.hidden) {
		            return;
		        }

				var opt = {
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
					section: component,
					preset: component.preset,
					presetId: component.presetId,
					presetClassName: params.presetClassName,	// Only used for debugging purposes
					PaletteFolderSection: params.PaletteFolderSection,
					PaletteFolderSubsection: params.PaletteFolderSubsection,
					_paletteItemGroup: item._paletteItemGroup,
					_paletteGroupSelected: (item._paletteItemGroup != lastPaletteItemGroup),	// Initially, first widget in group is selected
					_collectionName: (item.$library && item.$library.collections && item.$library.collections[item.collection] && item.$library.collections[item.collection].name)
				};
				this._setIconProperties(item, opt);
				this._createItem(opt);
				lastPaletteItemGroup = item._paletteItemGroup;
			}, this);
		}
	},
	
	_createPalette: function(component){
		var iconUri = "ve/resources/images/fldr_obj.gif";
		
		// Only used for debugging purposes
		var presetClassName = component.presetId ? this._presetClassNamePrefix + component.presetId : null;
		var opt = {
			paletteId: this.id,
			icon: this._getIconUri(component.icon, iconUri),
			iconBase64: component.iconBase64,
			displayName: /* XXX component.provider.getDescriptorString(component.name) ||*/ component.name,
			section: component,
			subsections: component.subsections,
			subsection_container: null,
			preset: component.preset,
			presetId: component.presetId,
			presetClassName: presetClassName	// Only used for debugging purposes
		};
		// this._createFolder() has a miniscule chance of not happening synchronously
		var deferred = this._createFolder(opt);
		deferred.then(function(PaletteFolderSection){
			if(component.subsections && component.subsections.length){
				for(var i=0; i<component.subsections.length; i++){
					var subsection = component.subsections[i]
					var opt2 = {
							paletteId: this.id,
							icon: this._getIconUri(subsection.icon, iconUri),
							iconBase64: subsection.iconBase64,
							displayName: subsection.name,
							section: component,
							subsection: subsection,
							subsection_container: PaletteFolderSection,
							preset: component.preset,
							presetId: component.presetId,
							presetClassName: presetClassName	// Only used for debugging purposes
						};
					// this._createFolder() has a miniscule chance of not happening synchronously
					var deferred = this._createFolder(opt2);
					deferred.then(function(PaletteFolderSubsection){
						PaletteFolderSection._children.push(PaletteFolderSubsection);
						this._createPaletteItemsForComponent(component.subsections[i], 
								{ presetClassName:presetClassName,
									PaletteFolderSection: PaletteFolderSection,
									PaletteFolderSubsection: PaletteFolderSubsection }
						);
					}.bind(this));
				}
			}else{
				this._createPaletteItemsForComponent(component, 
						{ presetClassName:presetClassName,
							PaletteFolderSection: PaletteFolderSection,
							PaletteFolderSubsection: null }
				);
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
			deferred.resolve(PaletteFolder);
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
		var table = dojo.doc.createElement("table");
		table.className = "dojoyPaletteHeaderTable";
		div.appendChild(table);
		var tr = dojo.doc.createElement("tr");
		table.appendChild(tr);
		var td1 = dojo.doc.createElement("td");
		td1.className = "dojoyPaletteHeaderTableCol1";
		tr.appendChild(td1);
		var td2 = dojo.doc.createElement("td");
		td2.className = "dojoyPaletteHeaderTableCol2";
		tr.appendChild(td2);

		var filterContainer = dojo.doc.createElement("div");
		filterContainer.className = 'dojoyPaletteFilterContainer';
		td1.appendChild(filterContainer);

		var input = dojo.doc.createElement("input");
		filterContainer.appendChild(input);
		
		var searchString =  this._resource["filter"]+"...";
		this.filterField = new TextBox({style: "width: 99%", placeHolder: searchString, 'class':'dojoyPaletteFilterTextBox'}, input);
		dojo.connect(this.filterField, "onKeyUp", this, "_filter");
		
		var clearIcon = dojo.doc.createElement("div");
		clearIcon.className = 'dojoyPaletteFilterClearIcon';
		filterContainer.appendChild(clearIcon);
		On(clearIcon, "click", function(e){
			this._clearFilter();
		}.bind(this));

		var menu = new DropDownMenu({ style: "display: none;"});
		var menuItem1 = new MenuItem({
			id: 'PaletteMenuShowSuggested',
		    label: commonNls.showSuggestedWidgets,
		    iconClass: "dojoyPaletteMenuItemCheckMark",
		    onClick: function(){
		    	this._updateShowAllWidgetsPreference(false);
		    }.bind(this)
		});
		menu.addChild(menuItem1);
		var menuItem2 = new MenuItem({
			id: 'PaletteMenuShowAll',
		    label: commonNls.showAllWidgets,
		    iconClass: "dojoyPaletteMenuItemCheckMark",
		    onClick: function(){
		    	this._updateShowAllWidgetsPreference(true);
		    }.bind(this)
		});
		menu.addChild(menuItem2);
		var button = new DropDownButton({
		    showLabel: false,
		    dropDown: menu
		});
		td2.appendChild(button.domNode);

		this.toolbarDiv.appendChild(div);

	},
	
	_updateShowAllWidgetsPreference: function(newValue){
		var id = 'davinci.ve.editorPrefs';
		var base = Workbench.getProject();
		var editorPrefs = Preferences.getPreferences(id, base);
		editorPrefs.showAllWidgets = newValue;
		Preferences.savePreferences(id, base, editorPrefs);
	},
	
	_updateShowAllWidgetsMenu: function(newValue){
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
		var PaletteMenuShowSuggested = dijit.byId('PaletteMenuShowSuggested');
		var PaletteMenuShowAll = dijit.byId('PaletteMenuShowAll');
		var visible = 'dojoyPaletteMenuItemCheckMark';
		var invisible = 'dojoyPaletteMenuItemCheckMark dojoyPaletteMenuItemCheckMarkOff';
		if(editorPrefs.showAllWidgets){
			PaletteMenuShowSuggested.set('iconClass', invisible);
			PaletteMenuShowAll.set('iconClass', visible);
		}else{
			PaletteMenuShowSuggested.set('iconClass', visible);
			PaletteMenuShowAll.set('iconClass', invisible);
		}
	},
	
	_clearFilter: function(){
		this.filterField.set("value", ""),
		this._filter();
	},
	
	_filter: function() {
		var context = Runtime.currentEditor.getContext();
		var comptype = context.getCompType();
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
		if(editorPrefs.showAllWidgets){
			comptype = (comptype == 'mobile') ? "$ALLMOBILE" : "$ALLDESKTOP";
		}

		var value = this.filterField.get("value"),
		re = new RegExp(value, 'i'),
		action,
		filterWidgetList = {};

      // reset to default state -- only show category headings
		var displayShowValue = this._displayShowValue;
	    function resetWidgets(child) {
	    	if (child.declaredClass != 'dijit.form.TextBox') {
	    		var style = (child.declaredClass === 'davinci.ve.palette.PaletteFolder' && 
	    					child.presetId == comptype && 
	    					child._children.length > 0 &&
	    					(child._type == 'simple' || child._type == 'subsection_container'))
	    			? 'block' : 'none';
	    		dojo.style(child.domNode, 'display', style);
	    	}
	    }

	    // show widgets which match filter text
	    function filterWidgets(child) {
	    	if (child.declaredClass == 'dijit.form.TextBox') {
	    		// do nothing
	    	} else if (child.declaredClass === 'davinci.ve.palette.PaletteFolder') {
	    		dojo.style(child.domNode, 'display', 'none');
	    	} else if (child.name && re.test(child.name)){
	    		if(child.presetId == comptype && child._paletteGroupSelected && !filterWidgetList[child.type]) {
	    			dojo.style(child.domNode, 'display', displayShowValue);
		    		filterWidgetList[child.type] = true;
	    		}else{
					dojo.style(child.domNode, 'display', 'none');
	    		}
	    	} else {
	    		dojo.style(child.domNode, 'display', 'none');
	    	}
	    }

	    if (value === '') {
	        action = resetWidgets;
	        dojo.removeClass(this.domNode, 'maqWidgetsFiltered');
	        dojo.removeClass(this.toolbarDiv, 'maqWidgetsToolbarFiltered');
	    } else {
	        action = filterWidgets;
	        dojo.addClass(this.domNode, 'maqWidgetsFiltered');
	        dojo.addClass(this.toolbarDiv, 'maqWidgetsToolbarFiltered');
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
		if(opt.section.id != '$$UserWidgets$$'){
			// See if this proposed PaletteItem's collection property is included in the current preset
			var collection = Metadata.queryDescriptor(opt.type, 'collection');
			var presetCollections;
			if(opt.preset){
				presetCollections = opt.preset.collections;
				if(!presetCollections || !presetCollections.length){
					return;
				}
			}
			if(opt.preset && opt.preset.exclude){
				var exclude = (typeof opt.preset.exclude == 'string') ? 
						(this._widgetPalette.defs ? this._widgetPalette.defs[opt.preset.exclude] : undefined) : 
						opt.preset.exclude;
				if(exclude && exclude.indexOf(opt.type)>=0){
					return;
				}
			}
			var active = false;
			if(presetCollections && presetCollections.length){
				for(var i=0; i<presetCollections.length; i++){
					if(presetCollections[i].id == collection && presetCollections[i].show){
						active = true;
						break;
					}
				}
				if(!active){
					return;
				}
			}
		}
		//FIXME: temporary
		opt.icon = opt.iconLarge;
		var node = new PaletteItem(opt);
		if(!folder){
			this.addChild(node);
		}else{
			folder.addChild(node);
		}
		if(opt.PaletteFolderSubsection){
			opt.PaletteFolderSubsection._children.push(node);
			node.domNode.style.display = (opt.PaletteFolderSubsection._isOpen && node._paletteGroupSelected) ? this._displayShowValue : 'none';
		}else if(opt.PaletteFolderSection){
			opt.PaletteFolderSection._children.push(node);
			node.domNode.style.display = (opt.PaletteFolderSection._isOpen && node._paletteGroupSelected) ? this._displayShowValue : 'none';
		}
		var nodeToClone = Query('.paletteItemImageContainer', node.domNode)[0];
		var ds = new DragSource(node.domNode, "component", node, nodeToClone);
		ds.targetShouldShowCaret = true;
		ds.returnCloneOnFailure = false;
		this.connect(ds, "onDragStart", dojo.hitch(this,function(e){this.onDragStart(e);})); // move start
		this.connect(ds, "onDragEnd", dojo.hitch(this,function(e){this.onDragEnd(e);})); // move end
		return node;
	},

	/**
	 * Prepare a section item
	 */
	_prepareSectionItem: function(item, section, paletteItemGroup){
		var $wm = Metadata.getLibraryMetadataForType(item.type);
		item.$library = $wm;
		item.section = section;
		item._paletteItemGroup = paletteItemGroup;
	},

	/**
	 * Stuffs values into section.items (or subsection.items).
	 * section.items holds the list of PaletteItems that belong to this section (or subsection)
	 * of the widget palette. This routine does all of the detailed processing of the "includes"
	 * property in widgetPalette.json, including the grouping of widgets that represent 
	 * alternative versions of the same widget, sorting the alternatives by precedence order
	 * for the various widget libraries for the given "preset" (mobile, desktop, sketchhifi, sketchlofi)
	 * For each widget processed, if widget is in widgetList array, remove from the array
	 * @param {object} section - section or subsection object from widgetPalette.json file
	 * @param {object} preset - current preset
	 * @param {array[string]} widgetList - List of widget types, gets updated by this routine
	 */
	_createSectionItems: function(section, preset, widgetList){
		section.items = [];
		collections = preset.collections;
		var includes = section.includes;
		if(!includes || !includes.length){
			console.warning('No includes property for preset '+p+' in widgetPalette.json (in siteConfig folder)');
			return returnItems;
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
					this._prepareSectionItem(newItem, section, this._paletteItemGroupCount);
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
				var sortedItem = sortedItems[si];
				var idx = widgetList.indexOf(sortedItem.type);
				if(idx >= 0){
					// Remove the current widget type from widgetList array
					// to indicate that the given widget has been added to palette
					widgetList.splice(idx, 1);
				}
				section.items.push(sortedItem);
			}
			this._paletteItemGroupCount++;
		}
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
		this._updateShowAllWidgetsMenu();
		var context = Runtime.currentEditor.getContext();
		var comptype = context.getCompType();
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
		if(editorPrefs.showAllWidgets){
			comptype = (comptype == 'mobile') ? "$ALLMOBILE" : "$ALLDESKTOP";
		}

		this._presetCreated[comptype] = true;
		var presetClassName = this._presetClassNamePrefix + comptype;	// Only used for debugging purposes

		if(!editorPrefs.widgetPaletteLayout || editorPrefs.widgetPaletteLayout == 'icons'){
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
		// Set display:none for any PaletteFolders without any visible children
		var children = this.getChildren();
		for(var i = 0, len = children.length; i < len; i++){
			var child = children[i];
			if(child && child.domNode && child.presetId){
				if(child.declaredClass == "davinci.ve.palette.PaletteFolder"){
					if(child.presetId == comptype){
						// Initially, hide any PaletteFolder's that are contain a subsection.
						if(child._children.length == 0 || child._type == 'subsection'){
							child.domNode.style.display = 'none';
						}else{
							child.domNode.style.display = 'block';
						}
					}else{
						child.domNode.style.display = 'none';
					}
					if(child._type == 'subsubsection_container'){
						child._openSubsection = null;	// Only PaletteFolder's that have subsections use the "_openSubsection" property
					}
					child._isOpen = false;
				}else{
					child.domNode.style.display = 'none';
				}
			}
		
		}
	},
	
	preferencesChanged: function() {
		//FIXME: the following logic has never been tested because currently
		//the preference for changing between icon and list view in widget palette
		//is unavailable
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
		var prop = (!editorPrefs.widgetPaletteLayout || editorPrefs.widgetPaletteLayout == 'icons') ?
				'iconLarge' : 'icon';
		var children = this.getChildren();
		for(var ch=0; ch<children.length; ch++){
			var child = children[ch];
			if(child.declaredClass == 'davinci.ve.palette.PaletteItem'){
				child.updateImgSrc(child[prop]);
			}
		}
		
		this.updatePaletteVisibility();
	},
	
	/**
	 * Call flat() for all PaletteItems that have raised or sunken styling
	 */
	flattenAll: function(){
		for(var i=0; i<this.raisedItems.length; i++){
			this.raisedItems[i].flat(this.raisedItems[i].domNode);
		}
		this.raisedItems = [];
		for(var i=0; i<this.sunkenItems.length; i++){
			var paletteItem = this.sunkenItems[i];
			if(paletteItem._tooltipDialog){
				//FIXME: Need to generalize for help feature, too
				paletteItem.paletteItemMoreCloseCleanup();
				paletteItem.paletteItemHelpCloseCleanup();
			}
			paletteItem.flat(paletteItem.domNode);
			paletteItem._selectionShowing = false;
		}
		this.sunkenItems = [];
	},
	
	/**
	 * Remove any selection content for any of the PaletteItems
	 */
	removeSelectionAll: function(){
		this.flattenAll();
		
		var paletteItemSelectionArray = Query('.paletteItemSelectionContent', this.domNode);
		for(var i=0; i<paletteItemSelectionArray.length; i++){
			var node = paletteItemSelectionArray[i];
			if(node && node.parentNode){
				node.parentNode.innerHTML = '';
			}
		}
	},
	
	/**
	 * Find all siblings paletteItem's that share the given paletteItemGroup.
	 * Assumes all widgets with same paletteItemGroup are adjacent siblings
	 * @param {PaletteItem} one of the PaletteItem's within the paletteItemGroup
	 * @returns {array}  an array of paletteItem's
	 */
	getPaletteItemsSameGroup: function(paletteItem){
		var paletteItems = [];
		var paletteItemGroup = paletteItem._paletteItemGroup;
		var thisPaletteItem = paletteItem;
		var firstPaletteItem;
		// Go backwards while still matching
		while(thisPaletteItem && thisPaletteItem._paletteItemGroup){
			if(thisPaletteItem._paletteItemGroup == paletteItemGroup){
				firstPaletteItem = thisPaletteItem;
				thisPaletteItem = thisPaletteItem && thisPaletteItem.domNode && thisPaletteItem.domNode.previousSibling
						&& thisPaletteItem.domNode.previousSibling._paletteItem;
			}else{
				break;
			}
		};
		// Go forwards while still matching
		thisPaletteItem = firstPaletteItem;
		while(thisPaletteItem && thisPaletteItem._paletteItemGroup == paletteItemGroup){
			paletteItems.push(thisPaletteItem);
			thisPaletteItem = thisPaletteItem && thisPaletteItem.domNode && thisPaletteItem.domNode.nextSibling
					&& thisPaletteItem.domNode.nextSibling._paletteItem;
		}
		return paletteItems;
	},
	
	_setIconProperties: function(item, opt){
		// for small icons, first look for small icons, else look for large icons, else use file_obj.gif
		opt.icon = item.iconBase64 || (item.icon && this._getIconUri(item.icon, "ve/resources/images/file_obj.gif")) ||
			item.iconLargeBase64 || 
			(item.iconLarge && this._getIconUri(item.iconLarge, "ve/resources/images/file_obj.gif")) ||
			this._getIconUri(item.icon, "ve/resources/images/file_obj.gif");
		// for large icons, first look for small icons, else look for large icons, else use file_obj.gif
		opt.iconLarge = item.iconLargeBase64 || 
			(item.iconLarge && this._getIconUri(item.iconLarge, "ve/resources/images/file_obj.gif")) ||
			item.iconBase64 || this._getIconUri(item.icon, "ve/resources/images/file_obj.gif");
	},
	
	onDragStart: function(e){
		this.removeSelectionAll();
		this.selectedItem = null;
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
			domClass.add(e._dragClone, 'paletteDragContainer');
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
		this._context.setActiveTool(null);
		this._context.setActiveDragDiv(null);
		dojo.disconnect(this._dragKeyDownListener);
		dojo.disconnect(this._dragKeyUpListener);
		if(FocusUtils.curNode && FocusUtils.curNode.blur){
			FocusUtils.curNode.blur();
		}
		this.removeSelectionAll();
		this.selectedItem = null;
		this.flattenAll();

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
