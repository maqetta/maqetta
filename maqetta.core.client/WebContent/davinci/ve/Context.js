define([
    "require",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/xhr",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
	"dojo/query",
	"dojo/Deferred",
	"dojo/promise/all",
	"dojo/_base/connect",
	"dojo/topic",
	"dojo/window",
    'system/resource',
    "../UserActivityMonitor",
    "../Theme",
    "./ThemeModifier",
	"../commands/CommandStack",
	"./commands/ChangeThemeCommand",
	"./tools/SelectTool",
	"../model/Path",
	"../Runtime",
	"../Workbench",
	"./widget",
	"./Focus",
	"../library",
	"./metadata",
	"./ChooseParent",
	"./Snap",
	"./States",
	"./HTMLWidget",
	"../html/HTMLElement",
	"../html/HTMLText",
	"../workbench/Preferences",
	"preview/silhouetteiframe",
	"./utils/GeomUtils",
	"dojo/text!./newfile.template.html",
	"./utils/pseudoClass",
	"dojox/html/_base"	// for dojox.html.evalInGlobal	
], function(
	require,
	declare,
	lang,
	xhr,
	domClass,
	domConstruct,
	domStyle,
	query,
	Deferred,
	all,
	connect,
	Topic,
	windowUtils,
	systemResource,
	UserActivityMonitor,
	Theme,
	ThemeModifier,
	CommandStack,
	ChangeThemeCommand,
	SelectTool,
	Path,
	Runtime,
	Workbench,
	Widget,
	Focus,
	Library,
	metadata,
	ChooseParent,
	Snap,
	States,
	HTMLWidget,
	HTMLElement,
	HTMLText,
	Preferences,
	Silhouette,
	GeomUtils,
	newFileTemplate,
	pseudoClass
) {

davinci.ve._preferences = {}; //FIXME: belongs in another object with a proper dependency
var MOBILE_DEV_ATTR = 'data-maq-device',
	MOBILE_DEV_ATTR_P6 = 'data-maqetta-device',
	MOBILE_ORIENT_ATTR = 'data-maq-orientation',
	MOBILE_ORIENT_ATTR_P6 = 'data-maqetta-device-orientation',
	PREF_LAYOUT_ATTR = 'data-maq-flow-layout',
	PREF_LAYOUT_ATTR_P6 = 'data-maqetta-flow-layout',
	COMPTYPE_ATTR = 'data-maq-comptype';

var contextCount = 0;

var removeEventAttributes = function(node) {
	var libraries = metadata.getLibrary();	// No argument => return all libraries
	

	if(node){
		dojo.filter(node.attributes, function(attribute) {
			return attribute.nodeName.substr(0,2).toLowerCase() == "on";
		}).forEach(function(attribute) {
			var requiredAttribute = false;
			for(var libId in libraries){
				/*
				 * Loop through each library to check if the event attribute is required by that library
				 * in page designer
				 * 
				 */
				var library = metadata.getLibrary(libId);
				var requiredAttribute = metadata.invokeCallback(library, 'requiredEventAttribute', [attribute]);
				if (requiredAttribute) {
					/*
					 * If the attribute is required by a library then we stop checking 
					 * it only needs to be required by one library for us to leave it on the node
					 */
							
					break;
				}
			}
			if (!requiredAttribute) {
				/*
				 * No library requires this event attribute in page designer so we will remove it.
				 */
				node.removeAttribute(attribute.nodeName);
			}
		});
	}
};

var removeHrefAttribute = function(node) {
	if(node.tagName.toUpperCase() == "A" && node.hasAttribute("href")){
		node.removeAttribute("href");
	}
};

return declare("davinci.ve.Context", [ThemeModifier], {

	// comma-separated list of modules to load in the iframe
	_bootstrapModules: "dijit/dijit",

/*=====
	// keeps track of widgets-per-library loaded in context
	_widgets: null,

	// Cache for the HTMLElement (model) holding the main `require` call.  Used in
	// addJavaScriptModule(), cleared in _setSource().
	_requireHtmlElem: null,

	// HTMLElement (model) of the <script> which points to "dojo.js".  Cleared
	// in _setSource().
	_dojoScriptElem: null,
=====*/

	constructor: function(args) {
		if(!args) {
			args ={};
		}
		this._contentStyleSheet = Workbench.location() + require.toUrl("davinci/ve/resources/content.css");
		this._id = "_edit_context_" + contextCount++;
		this.widgetHash = {};
		
		lang.mixin(this, args);

		if(typeof this.containerNode == "string"){
			this.containerNode = dijit.byId(this.containerNode);
		}

		this._commandStack = new CommandStack(this);
		this._defaultTool = new SelectTool();

		this._widgetIds = [];
		this._objectIds = [];
		this._widgets = [];
		this._loadedCSSConnects = [];
		this._chooseParent = new ChooseParent({context:this});
		this.sceneManagers = {};
		
		this._customWidgetPackages = lang.clone(Library.getCustomWidgetPackages());

	    // Invoke each library's onDocInit function, if library has such a function.
		var libraries = metadata.getLibrary();	// No argument => return all libraries
		for(var libId in libraries){
			var library = metadata.getLibrary(libId);
			metadata.invokeCallback(library, 'onDocInit', [this]);
		}
	},
	
	destroy: function () {
		this.deactivate();
		this.inherited(arguments);
		if (this._loadedCSSConnects) {
			this._loadedCSSConnects.forEach(connect.disconnect);
			delete this._loadedCSSConnects;
		}
	},

	isActive: function(){
		return !!this._activeTool;
	},

	//FIXME: accessor func is unnecessary?
	getModel: function(){
		return this._srcDocument;
	},
	
	/*
	 * @returns the path to the file being edited
	 */
	getPath: function(){
		
		/*
		 * FIXME:
		 * We dont set the path along with the content in the context class, so
		 * have to pull the resource path from the model.  
		 * 
		 * I would rather see the path passed in, rather than assume the model has the proper URL,
		 * but using the model for now.
		 * 
		 */
		return new Path(this.getModel().fileName);
	},

	activate: function(){
		if(this.isActive()){
			return;
		}

		this.loadStyleSheet(this._contentStyleSheet);
		this._attachAll();
		this._restoreStates();

		query("*",this.rootNode).forEach(function(n){
			// Strip off interactivity features from DOM on canvas
			// Still present in model
			removeEventAttributes(n);	// Make doubly sure there are no event attributes (was also done on original source)
			removeHrefAttribute(n);		// Remove href attributes on A elements
		});
		this._AppStatesActivateActions();
		// The initialization of states object for BODY happens as part of user document onload process,
		// which sometimes happens after context loaded event. So, not good enough for StatesView
		// to listen to context/loaded event - has to also listen for context/statesLoaded.
		this._statesLoaded = true;
		connect.publish('/davinci/ui/context/statesLoaded', [this]);
		this._onLoadHelpers();

		var containerNode = this.getContainerNode();
		domClass.add(containerNode, "editContextContainer");
		
		this._connects = [
			connect.connect(this._commandStack, "onExecute", this, "onCommandStackExecute"),
			// each time the command stack executes, onContentChange sets the focus, which has side-effects
			// defer this until the stack unwinds in case a caller we don't control iterates on multiple commands
			connect.connect(this._commandStack, "onExecute", function(){setTimeout(this.onContentChange.bind(this), 0);}.bind(this)),
			connect.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
			connect.connect(this.getDocument(), "onkeyup", this, "onKeyUp"),
			connect.connect(containerNode, "ondblclick", this, "onDblClick"),
			connect.connect(containerNode, "onmousedown", this, "onMouseDown"),
			connect.connect(containerNode, "onmousemove", this, "onMouseMove"),
			connect.connect(containerNode, "onmouseup", this, "onMouseUp"),
			connect.connect(containerNode, "onmouseover", this, "onMouseOver"),
			connect.connect(containerNode, "onmouseout", this, "onMouseOut")
		];
		if(this.visualEditor && this.visualEditor._pageEditor && this.visualEditor._pageEditor._visualChanged){
			this.visualEditor._pageEditor._visualChanged(true);
		}
		this.setActiveTool();
	},

	deactivate: function(){
		if(!this.isActive()){
			return;
		}

		this._connects.forEach(connect.disconnect);
		delete this._connects;
		(this._focuses || []).forEach(function(f){
			f._connected = false;
		});
		this._commandStack.clear();
		if(this._activeTool){
			this._activeTool.deactivate();
			delete this._activeTool;
		}

		var containerNode = this.getContainerNode();
		// FIXME: what's _menu?
		//this._menu.unBindDomNode(containerNode);

		this.select(null);
		domClass.remove(containerNode, "editContextContainer");
		this.getTopWidgets().forEach(this.detach, this);
		this.unloadStyleSheet(this._contentStyleSheet);
	},

	attach: function(widget){
		if(!widget || widget._edit_focus){
			return;
		}

		if(!widget._srcElement){
			widget._srcElement=this._srcDocument.findElement(widget.id);
		}
		// The following two assignments needed for OpenAjax widget support
		if(!widget.type){
			if(widget.isHtmlWidget){
				widget.type = "html." + widget.getTagName();
			}else if(widget.isGenericWidget){
				widget.type = widget.domNode.getAttribute('dvwidget');
			}else if(widget.isObjectWidget){
				widget.type = widget.getObjectType();
			}else{
				widget.type = widget.declaredClass.replace(/\./g, "/"); //FIXME: not a safe association
			}
		}

		widget.metadata = widget.metadata || metadata.query(widget.type);
		widget._edit_context = this;
		
		widget.attach();

		//TODO: dijit-specific convention of "private" widgets
		if(widget.type.charAt(widget.type.lastIndexOf(".") + 1) == "_"){
			widget.internal = true;
			// internal Dijit widget, such as _StackButton, _Splitter, _MasterTooltip
			return;
		}

        var addOnce = function(array, item) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        };
		var id = widget.getId();
		if(id){
			addOnce(this._widgetIds, id);
		}
		var objectId = widget.getObjectId(widget);
		if(objectId){
			addOnce(this._objectIds, objectId);
		}

		// Recurse down widget hierarchy
		dojo.forEach(widget.getChildren(true), this.attach, this);
	},

	detach: function(widget) {
		// FIXME: detaching context prevent destroyWidget from working
		//widget._edit_context = undefined;
		var arrayRemove = function(array, item) {
			var i = array.indexOf(item);
	        if (i != -1) {
	            array.splice(i, 1);
	        }
		};

		var id = widget.getId();
		if(id){
			arrayRemove(this._widgetIds, id);
		}
		var objectId = widget.getObjectId();
		if(objectId){
			arrayRemove(this._objectIds, objectId);
		}
		if (this._selection){
			for(var i=0; i<this._selection.length; i++){
				if(this._selection[i] == widget){
					this.focus(null, i);
					this._selection.splice(i, 1);
				}
			}
		}

        var library = metadata.getLibraryForType(widget.type);
        if (library){
            var libId = library.name,
                data = [widget.type, this];

            // Always invoke the 'onRemove' callback.
            metadata.invokeCallback(library, 'onRemove', data);
            // If this is the last widget removed from page from a given library,
            // then invoke the 'onLastRemove' callback.
            this._widgets[libId] -= 1;
            if (this._widgets[libId] === 0) {
                metadata.invokeCallback(library, 'onLastRemove', data);
            }
        }

		dojo.forEach(widget.getChildren(), this.detach, this);
		delete this._containerControls;
	},


	getSource: function(){
		return this._srcDocument.getText();
	},

	getDocumentElement: function(){
		return this._srcDocument.getDocumentElement();
	},

	getDocumentLocation: function(){
		return this._srcDocument.fileName;
	},

	//FIXME: private/protected?
	getLibraryBase: function(id, version){
		return Library.getLibRoot(id,version, this.getBase());
	},

	loadRequires: function(type, updateSrc, doUpdateModelDojoRequires, skipDomUpdate) {
		// this method is used heavily in RebuildPage.js, so please watch out when changing  API!
		var requires = metadata.query(type, "require");

		if (!requires) {
			var noop = new Deferred();
			noop.resolve();
			return noop;
		}

		var libraries = metadata.query(type, 'library'),
			libs = {},
			context = this,
			_loadJSFile = function(libId, src) {
				return context.addJavaScriptSrc(_getResourcePath(libId, src), updateSrc, src, skipDomUpdate);
			},
			_getResourcePath = function(libId, src) {
				return libs[libId].append(src).relativeTo(context.getPath(), true).toString();
			};

		var loadLibrary = function(libId, lib) {
			var d = new Deferred();
			if (libs.hasOwnProperty(libId)) {
				d.resolve();
				return d;
			}

			// calculate base library path, used in loading relative required
			// resources
			var ver = metadata.getLibrary(libId).version || lib.version;
			return context.getLibraryBase(libId, ver).then(function(root) {
				if (root == null /*empty string OK here, but null isn't. */) {
					console.error("No library found for name = '" + libId +	"' version = '" + ver + "'");
					d.reject();
					return d;
				}
	
				// store path
				libs[libId] = new Path(context.getBase()).append(root);	
	
				// If 'library' element points to the main library JS (rather than
				// just base directory), then load that file now.
				if (lib && lib.src && lib.src.substr(-3) === '.js') {
					// XXX For now, lop off relative bits and use remainder as main
					// library file.  In the future, we should use info from
					// package.json and library.js to find out what part of this
					// path is the piece we're interested in.
					var m = lib.src.match(/((?:\.\.\/)*)(.*)/);
							// m[1] => relative path
							// m[2] => main library JS file
					return _loadJSFile(libId, m[2]);
				}
				d.resolve();
				return d;
			});
		};

		var libraryPromises = [];
		// first load any referenced libraries
		for (var libId in libraries) {
			if (libraries.hasOwnProperty(libId)) {
				libraryPromises.push(loadLibrary(libId, libraries[libId]));
			}
		}

		return all(libraryPromises).then(function(){
			// next, load the require statements
			var requirePromises = [];
			requires.every(function(r) {
				// If this require belongs under a library, load library file first
				// (if necessary).
				if (r.$library) {
					requirePromises.push(loadLibrary(r.$library, libraries[r.$library]));
				}
	
				switch (r.type) {
					case "javascript":
						if (r.src) {
							requirePromises.push(_loadJSFile(r.$library, r.src));
						} else {
							this.addJavaScriptText(r.$text, updateSrc || doUpdateModelDojoRequires, skipDomUpdate);
						}
						break;
					
					case "javascript-module":
						// currently, only support 'amd' format
						if (r.format !== 'amd') {
							console.error("Unknown javascript-module format");
						}
						if (r.src) {
							requirePromises.push(
								this.addJavaScriptModule(r.src, updateSrc || doUpdateModelDojoRequires, skipDomUpdate));
						} else {
							console.error("Inline 'javascript-module' not handled src=" + r.src);
						}
						break;
					
					case "css":
						if (r.src) {
							var src = _getResourcePath(r.$library, r.src);
							if (updateSrc) {
								this.addModeledStyleSheet(src, skipDomUpdate);
							} else {
								this.loadStyleSheet(src);
							}
						} else {
							console.error("Inline CSS not handled src=" + r.src);
						}
						break;
					
					case "image":
						// Allow but ignore type=image
						break;
						
					default:
						console.error("Unhandled metadata resource type='" + r.type +
								"' for widget '" + type + "'");
				}
				return true;
			}, this);
			return all(requirePromises);
		}.bind(this));
	},

	/**
	 * Retrieve mobile device from Model.
	 * @returns {?string} mobile device name
	 */
	getMobileDevice: function() {
        var bodyElement = this.getDocumentElement().getChildElement("body");
        if (!bodyElement) {
        	return undefined;
        }
        var attvalue = bodyElement.getAttribute(MOBILE_DEV_ATTR);
        var attvalueP6 = bodyElement.getAttribute(MOBILE_DEV_ATTR_P6);
		if(!attvalue && attvalueP6){
			// Migrate from old attribute name (data-maqetta-device) to new attribute name (data-maq-device)
			bodyElement.removeAttribute(MOBILE_DEV_ATTR_P6);
			bodyElement.setAttribute(MOBILE_DEV_ATTR, attvalueP6);
			attvalue = attvalueP6;
			this.editor._visualChanged();
		}
        return attvalue;
    },

    /**
     * Sets mobile device in Model.
     * @param device {?string} device name
     */
    setMobileDevice: function(device) {
    	this.getGlobal()["require"]("dojo/_base/config").mblUserAgent =
    			Silhouette.getMobileTheme(device + '.svg');
    	var bodyElement = this.getDocumentElement().getChildElement("body");
        if (!device || device == 'none') {
            bodyElement.removeAttribute(MOBILE_DEV_ATTR, device);
        } else {
            bodyElement.addAttribute(MOBILE_DEV_ATTR, device);
        }
    },
	
    /**
     * Sets the correct CSS files for the given mobile device.
     * @param device {string} device identifier, in form of "iphone" or
     *              "android_340x480" (taken from SVG silhouette file name)
     * @param force {boolean} if true, forces setting of CSS files, even if
     *              'device' is the same as the current device
     */
	setMobileTheme: function(device) {

        var oldDevice = this.getMobileDevice() || 'none';
        if (oldDevice != device) {
        	this.setMobileDevice(device);
        }
        this.close(); //// return any singletons for CSSFiles
		
        // Need this to be run even if the device is not changed,
        // when the page is loaded the device matches what is in the doc
        // but we need to get dojo in sync.
        try {
        	var ua = Silhouette.getMobileTheme(device + '.svg') || "other";
    		// dojox/mobile specific CSS file handling
      		this._configDojoxMobile();
    		//var deviceTheme = this.getGlobal()['require']('dojox/mobile/deviceTheme');
        	//deviceTheme.loadDeviceTheme(ua);
        } catch(e) {
        	// dojox/mobile/deviceTheme not loaded
        }
	},

	/**
  	* Retrieves the mobile orientation.
  	* @returns {?string} orientation
  	*/
	getMobileOrientation: function() {
		var bodyElement = this.getDocumentElement().getChildElement("body");
		var attvalue = bodyElement.getAttribute(MOBILE_ORIENT_ATTR);
        var attvalueP6 = bodyElement.getAttribute(MOBILE_ORIENT_ATTR_P6);
		if(!attvalue && attvalueP6){
			// Migrate from old attribute name (data-maqetta-orientation) to new attribute name (data-maq-orientation)
			bodyElement.removeAttribute(MOBILE_ORIENT_ATTR_P6);
			bodyElement.setAttribute(MOBILE_ORIENT_ATTR, attvalueP6);
			attvalue = attvalueP6;
			this.editor._visualChanged();
		}
        return attvalue;
	},

	/**
  	* Sets mobile orientation in Model.
  	* @param orientation {?string} orientation
  	*/
	setMobileOrientation: function(orientation) {
		var bodyElement = this.getDocumentElement().getChildElement("body");
		if (orientation) {
			bodyElement.setAttribute(MOBILE_ORIENT_ATTR, orientation);
		} else {
			bodyElement.removeAttribute(MOBILE_ORIENT_ATTR);
		}
	},
	
	/**
	 * @static
	 */
	_mobileMetaElement: {
		name: 'viewport',
		content: 'width=device-width, initial-scale=1.0, user-scalable=no'
	},
	
	setMobileMeta: function(deviceName) {
		if (deviceName === 'none') {
			this._removeHeadElement('meta', this._mobileMetaElement);
		} else {
			this._addHeadElement('meta', this._mobileMetaElement);
		}
	},

	themeChanged: function(){
		var changed = true;
		// check for false alarms to avoid reloading theme
		var model = this.getModel();
		if(this._themeUrl){
			var style = model.find({elementType:'CSSImport', url:this._themeUrl},true);
			if (style) {
				changed = false;
			}
		}
		if(changed){
			this.theme = null;
			this._themeMetaCache = null;
		}
	},
	
	getTheme: function(){
        if (!this.theme) {
            var theme = metadata.loadThemeMeta(this._srcDocument);
            if (theme) { // wdr #1024
                this._themeUrl = theme.themeUrl;
                this._themeMetaCache = theme.themeMetaCache;
                this.theme = theme.theme;
                this.theme.helper = Theme.getHelper(this.theme);
                if (this.theme.helper && this.theme.helper.then){ // it might not be loaded yet so check for a deferred
                	this.theme.helper.then(function(result){
        	       		 if (result.helper) {
        	       			 this.theme.helper = result.helper;
        	       		 }
                	}.bind(this));
        		}
            }
        }
        return this.theme;
    }, 

	getThemeMeta: function(){
		if(!this._themeMetaCache ){
			this.getTheme();
		}
		return this._themeMetaCache;
	},

	setSource: function(source, callback, scope, initParams){
		dojo.withDoc(this.getDocument(), "_setSource", this, arguments);
	},

	getDojoUrl: function(){
		var loc=Workbench.location();
		if (loc.charAt(loc.length-1)=='/') {
			loc=loc.substring(0,loc.length-1);
		}
			
		if(document && document.getElementsByTagName){
			var scripts = document.getElementsByTagName("script");
			var rePkg = /dojo(\.xd)?\.js(\W|$)/i;
			for(var i = 0; i < scripts.length; i++){
				var src = scripts[i].getAttribute("src");
				if(!src){ continue; }
				var m = src.match(rePkg);
				if(m){
					// find out where we came from
					return loc + "/" + src;
					// "first Dojo wins"
				}
			}
		}	
		
	},

	getBase: function(){
		if(davinci.Workbench.singleProjectMode()) {
			return Workbench.getProject();
		}
	},
	
	getFullResourcePath: function() {
		if(!this._fullResourcePath){
			var filename = this.getModel().fileName;
			this._fullResourcePath = new Path(filename);
		}
		return this._fullResourcePath;
	},

	_getCurrentBasePath: function(){
		var base = new Path(Workbench.getProject()),
			prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);

		if (prefs.webContentFolder!==null && prefs.webContentFolder!=="") {
			base = base.append(prefs.webContentFolder);
		}
		return base;
	},

	getRelativeFileString: function(filename){
		var currentHtmlFolderPath = this.getFullResourcePath().getParentPath(),
			filePath = this._getCurrentBasePath().append(filename);
		return filePath.relativeTo(currentHtmlFolderPath).toString();
	},

	//FIXME: consider inlining.  Is caching necessary?
	getAppCssRelativeFile: function(){
		if(!this._appCssRelativeFile){
			this._appCssRelativeFile = this.getRelativeFileString('app.css');
		}
		return this._appCssRelativeFile;
	},

	//FIXME: consider inlining.  Is caching necessary?
	_getAppJsRelativeFile: function(){
		if(!this._appJsRelativeFile){
			this._appJsRelativeFile = this.getRelativeFileString('app.js');
		}
		return this._appJsRelativeFile;
	},
	
    /* ensures the file has a valid theme.  Adds the users default if its not there already */
    loadTheme: function(newHtmlParms){
    	/* 
    	 * Ensure the model has a default theme.  Defaulting to Claro for now, should
    	 * should load from prefs 
    	 * 
    	 * */
    	var model = this.getModel();
       	var defaultThemeName="claro";
       	if (newHtmlParms && newHtmlParms.themeSet) {
       	    defaultThemeName = newHtmlParms.themeSet.desktopTheme;
       	} else if (newHtmlParms && newHtmlParms.theme){
       	    if (newHtmlParms.theme == 'deviceSpecific') {
       	     defaultThemeName = "claro"; 
       	    } else {
       	        defaultThemeName = newHtmlParms.theme;
       	    }
       	}
    	var imports = model.find({elementType: 'CSSImport'});
		
		
		/* remove the .theme file, and find themes in the given base location */
		var allThemes = Library.getThemes(Workbench.getProject()),
			themeHash = {},
			defaultTheme;
		
		allThemes.forEach(function(theme){
			if(theme.name==defaultThemeName) {
				defaultTheme = theme;
			}
			
			if (theme.files){ // #1024 some themes may not contain files, themeMaps
				theme.files.forEach(function(file){
   			        themeHash[file] = theme;
				});
			}
		});
			
		/* check the header file for a themes CSS.  
		 * 
		 * TODO: This is a first level check, a good second level check
		 * would be to grep the body classes for the themes className. this would be a bit safer.
		 */
		
		if(imports.some(function(imp){
			/* trim off any relative prefix */
			for(var themeUrl in themeHash){
				if(imp.url.indexOf(themeUrl)  > -1){
					// theme already exists
					return true;
				}
			}
		})){
			return true;
		}

		var body = model.find({elementType:'HTMLElement', tag:'body'},true);
		body.setAttribute("class", defaultTheme.className);
		/* add the css */
		var filePath = defaultTheme.getFile().getPath();
		defaultTheme.files.forEach(function(file) {
			var url = new Path(filePath).removeLastSegments(1).append(file).relativeTo(this.getPath(), true);
			this.addModeledStyleSheet(url.toString(), true);
		}, this);
    },
    

//////////////////////////////////////////////////////////////////////////////////////////////     
    
	_setSource: function(source, callback, scope, newHtmlParams){
		// clear cached values
		delete this._requireHtmlElem;
		delete this._dojoScriptElem;
		delete this.rootWidget;

		// clear dijit registry
		if (this.frameNode) {
			var doc = this.frameNode.contentDocument || (this.frameNode.contentWindow && this.frameNode.contentWindow.document);
			if (doc) {
				try {
					windowUtils.get(doc).require("dijit/registry")._destroyAll();
				} catch(e) {
					// registry not loaded yet. nothing to see here, move along.
				}
			}
		}

		this._srcDocument=source;
		

		// css files need to be added to doc before body content
		// ensure the top level body deps are met (ie. maqetta.js, states.js and app.css)
		if(newHtmlParams){
			// theme editor does not pass newHtmlParms
			var modelBodyElement = source.getDocumentElement().getChildElement("body");
			modelBodyElement.setAttribute(MOBILE_DEV_ATTR, newHtmlParams.device);
			modelBodyElement.setAttribute(PREF_LAYOUT_ATTR, newHtmlParams.flowlayout);
			modelBodyElement.setAttribute(COMPTYPE_ATTR, newHtmlParams.comptype);
		}
		this.loadRequires(
				"html.body",
				true /*updateSrc*/,
				false /*doUpdateModelDojoRequires*/,
				true /*skipDomUpdate*/
		).then(function(){
				// make sure this file has a valid/good theme
			if(newHtmlParams){
				// theme editor loads themes in themeEditor/context
				this.loadTheme(newHtmlParams);
			}
			this._setSourcePostLoadRequires(source, callback, scope, newHtmlParams);
		}.bind(this));


	},
	
	_setSourcePostLoadRequires: function(source, callback, scope, newHtmlParams){

		//FIXME: Need to add logic for initial themes and device size.
		if(newHtmlParams){
			if (newHtmlParams.themeSet){
    			var cmd = new ChangeThemeCommand(newHtmlParams.themeSet, this);
    			cmd._dojoxMobileAddTheme(this, newHtmlParams.themeSet.mobileTheme, true); // new file
			}
			// Automatically include app.css and app.js so users 
			// have a place to put their custom CSS rules and JavaScript logic
			this.addModeledStyleSheet(this.getAppCssRelativeFile(), true /*skipDomUpdate*/);
			var appJsUrl = this._getAppJsRelativeFile();
			this.addHeaderScript(appJsUrl);
		}
		
		// Remove any SCRIPT elements from model that include dojo.require() syntax
		// With Preview 4, user files must use AMD loader
		source.find({elementType:'HTMLElement', tag:'script'}).forEach(function(scriptTag){
			for (var j=0; j<scriptTag.children.length; j++){
				var text = scriptTag.children[j].getText();
				if(text.indexOf('dojo.require')>=0){
					scriptTag.parent.removeChild(scriptTag);
					break;
				}
			}
		});
		
		var data = this._parse(source);
		if (this.frameNode) {
			if(!this.getGlobal()){
				console.warn("Context._setContent called during initialization");
			}

			// tear down old error message, if any
			query(".loading", this.frameNode.parentNode).orphan();

			// frame has already been initialized, changing content (such as changes from the source editor)
			this._continueLoading(data, callback, this, scope);
		} else {
			// initialize frame
			var dojoUrl;
			
			dojo.some(data.scripts, function(url){
				if(url.indexOf("/dojo.js") != -1){
					dojoUrl = url;
					return true;
				}
			});
			
			/* get the base path, removing the file extension.  the base is used in the library call below
			 * 
			 */
			var resourceBase = this.getBase();
			if (!dojoUrl) {
				// #3839 Theme editor uses dojo from installed lib
				// pull Dojo path from installed libs, if available
				var context  = this;
				dojo.some(Library.getUserLibs(resourceBase.toString()), function(lib) {
					if (lib.id === "dojo") {
						var fullDojoPath = new Path(this.getBase()).append(lib.root).append("dojo/dojo.js");
						dojoUrl = fullDojoPath.relativeTo(this.getPath(),true).toString();
						//dojoUrl = new Path(this.relativePrefix).append(lib.root).append("dojo/dojo.js").toString();
						context.addJavaScriptSrc(dojoUrl, true, "", false);
						return true;
					}
					return false;
				}, this);
				// if still not defined, use app's Dojo (which may cause other issues!)
				if (!dojoUrl) {
					dojoUrl = this.getDojoUrl();
					console.warn("Falling back to use workbench's Dojo in the editor iframe");
				}
			}

			// Make all custom widget module definitions relative to dojo.js
			var currentFilePath = this.getFullResourcePath();
			var currentFilePathFolder = currentFilePath.getParentPath();
			var dojoPathRelative = new Path(dojoUrl);
			var dojoPath = currentFilePathFolder.append(dojoPathRelative);
			var dojoFolderPath = dojoPath.getParentPath();
			var workspaceUrl = Runtime.getUserWorkspaceUrl();
			for(var i=0; i<this._customWidgetPackages.length; i++){
				var cwp = this._customWidgetPackages[i];
				var relativePathString = cwp.location.substr(workspaceUrl.length);
				var relativePath = new Path(relativePathString);
				cwp.location = relativePath.relativeTo(dojoFolderPath).toString();
			}

			var containerNode = this.containerNode;
			containerNode.style.overflow = "hidden";
			var frame = domConstruct.create("iframe", this.iframeattrs, containerNode);
			frame.dvContext = this;
			this.frameNode = frame;
			/* this defaults to the base page */
			var realUrl = Workbench.location() + "/" ;
			
			/* change the base if needed */
			
			if(this.baseURL){
				realUrl = this.baseURL;
			}

			var doc = frame.contentDocument || frame.contentWindow.document,
				win = windowUtils.get(doc),
				subs = {
					baseUrl: realUrl
				};

			if (dojoUrl) {
				subs.dojoUrl = dojoUrl;
				subs.id = this._id;

				var config = {
					packages: this._getLoaderPackages() // XXX need to add dynamically
				};
				this._getDojoScriptValues(config, subs);

				if (this._bootstrapModules) {
					subs.additionalModules = ',' + this._bootstrapModules.split(',').map(function(mid) {
						return '\'' + mid + '\'';
					}).join(',');
				}
			}

			if(source.themeCssFiles) { // css files need to be added to doc before body content
				subs.themeCssFiles = source.themeCssFiles.map(function(file) {
					return '<link rel="stylesheet" type="text/css" href="' + file + '">';
				}).join('');
			}

			window["loading" + this._id] = function(parser, htmlUtil) {
				var callbackData = this;
				try {
					var win = windowUtils.get(doc),
					 	body = (this.rootNode = doc.body);

					if (!body) {
						// Should never get here if domReady! fired?  Try again.
						this._waiting = this._waiting || 0;
						if(this._waiting++ < 10) {
							setTimeout(window["loading" + this._id], 500);
							console.log("waiting for doc.body");
							return;
						}
						throw "doc.body is null";
					}

					delete window["loading" + this._id];

					body.id = "myapp";

					// Kludge to enable full-screen layout widgets, like BorderContainer.
					// What possible side-effects could there be setting 100%x100% on every document?
					// See note above about margin:0 temporary hack
					body.style.width = "100%";
					body.style.height = "100%";
					// Force visibility:visible because CSS stylesheets in dojox.mobile
					// have BODY { visibility:hidden;} only to set visibility:visible within JS code. 
					// Maybe done to minimize flickering. Will follow up with dojox.mobile
					// folks to find out what's up. See #712
					body.style.visibility = "visible";
					body.style.margin = "0";

					body._edit_context = this; // TODO: find a better place to stash the root context
					var requires = this._bootstrapModules.split(",");
					if (requires.indexOf('dijit/dijit-all') != -1){
						// this is needed for FF4 to keep dijit.editor.RichText from throwing at line 32 dojo 1.5
						win.dojo._postLoad = true;
					}

					// see Dojo ticket #5334
					// If you do not have this particular dojo.isArray code, DataGrid will not render in the tool.
					// Also, any array value will be converted to {0: val0, 1: val1, ...}
					// after swapping back and forth between the design and code views twice. This is not an array!
					win.require("dojo/_base/lang").isArray = win.dojo.isArray=function(it){
						return it && Object.prototype.toString.call(it)=="[object Array]";
					};

					// Add module paths for all folders in lib/custom (or wherever custom widgets are stored)
					win.require({
						packages: this._customWidgetPackages
					});

				} catch(e) {
					console.error(e.stack || e);
					// recreate the Error since we crossed frames
					callbackData = new Error(e.message, e.fileName, e.lineNumber);
					lang.mixin(callbackData, e);
				}
				this._continueLoading(data, callback, callbackData, scope);
			}.bind(this);

			doc.open();
			var content = lang.replace(
				newFileTemplate,
				function(_, key) {
					return subs.hasOwnProperty(key) ? subs[key] : '';
				}
			);
			doc.write(content);
			doc.close();

			// intercept BS key - prompt user before navigating backwards
			connect.connect(doc.documentElement, "onkeypress", function(e){
				if(e.charOrCode==8){
					window.davinciBackspaceKeyTime = win.davinciBackspaceKeyTime = Date.now();
				}
			});	

			// add key press listener
			connect.connect(doc.documentElement, "onkeydown", dojo.hitch(this, function(e) {
				// we let the editor handle stuff for us
				this.editor.handleKeyEvent(e);
			}));	

		}
	},

	_continueLoading: function(data, callback, callbackData, scope) {
		var promise, failureInfo = {};
		try {
			if (callbackData instanceof Error) {
				throw callbackData;
			}

			promise = this._setSourceData(data).then(this.onload.bind(this), function(error) {
				failureInfo.errorMessage = "Unable to parse HTML source.  See console for error.  Please switch to \"Display Source\" mode and correct the error."; // FIXME: i18n
				console.error(error.stack || error.message);
			});
		} catch(e) {
			failureInfo = e;
			// recreate the Error since we crossed frames
//			failureInfo = new Error(e.message, e.fileName, e.lineNumber);
//			lang.mixin(failureInfo, e);
		} finally {
			if (callback) {
				if (promise) {
					promise.then(function(){
						callback.call((scope || this), failureInfo);
					}.bind(this));
				} else {
					callback.call((scope || this), failureInfo);
				}
			}
		}
	},

	_getLoaderPackages: function() {
		var base = this.getBase(),
			libs = Library.getUserLibs(base),
			dojoBase,
			packages = [];
		
		// get dojo base path
		libs.some(function(lib) {
			if (lib.id === 'dojo') {
				dojoBase = new Path(lib.root + '/dojo');
				return true; // break
			}
			return false;
		});

		// Add namespace for custom widgets
		// FIXME: should add this only when compound widgets are part of the page

		var getWidgetFolder = function(){
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);
			if(!prefs.widgetFolder) {
				prefs.widgetFolder = "WebContent/lib/custom";
				Preferences.savePreferences('davinci.ui.ProjectPrefs', base, prefs);
			}
		
			var folder = prefs.widgetFolder;
			while(folder.length>1 && (folder.charAt(0)=="." || folder.charAt(0)=="/")) {
				folder = folder.substring(1);
			}
			return folder;
		};

		libs = libs.concat({ id: 'widgets', root: getWidgetFolder() });

		libs.forEach(function(lib) {
			var id = lib.id;
			// since to loader, everything is relative to 'dojo', ignore here
			if (lib.root === undefined || id === 'dojo' || id === 'DojoThemes') {
				return;
			}
			var root = new Path(lib.root).relativeTo(dojoBase).toString();
			packages.push({ name: lib.id, location: root });
		});

		return packages;
	},

	/**
	 * Generate attribute values for the "dojo.js" script element, pulling in
	 * any attributes from the source file, while also merging in any attributes
	 * that are passed in.
	 * 
	 * @param  {Object} config
	 * @param  {Object} subs
	 */
	_getDojoScriptValues: function(config, subs) {
		var dojoScript = this._getDojoJsElem();
		var djConfig = dojoScript.getAttribute('data-dojo-config');

		// special handling for 'data-dojo-config' attr
		djConfig = djConfig ? require.eval("({ " + djConfig + " })", "data-dojo-config") : {};
		// give precedence to our 'config' options, over that in file; make sure
		// to turn off parseOnLoad
		lang.mixin(djConfig, config, {
			async: true,
			parseOnLoad: false
		});
		subs.dojoConfig = JSON.stringify(djConfig).slice(1, -1).replace(/"/g, "'");

		// handle any remaining attributes
		var attrs = [];
		dojoScript.attributes.forEach(function(attr) {
			var name = attr.name,
				val = attr.value;
			if (name !== 'src' && name !== 'data-dojo-config') {
				attrs.push(name + '="' + val + '"');
			}
		});
		if (attrs.length) {
			subs.additionalDojoAttrs = attrs.join(' ');
		}
	},

	_setSourceData: function(data) {
		// cache the theme metadata
		this.themeChanged();
		var theme = this.getThemeMeta();
		if(theme && theme.usingSubstituteTheme){
			var oldThemeName = theme.usingSubstituteTheme.oldThemeName;
			var newThemeName = theme.usingSubstituteTheme.newThemeName;
			data.styleSheets = data.styleSheets.map(function(sheet){
				return sheet.replace(new RegExp("/"+oldThemeName,"g"), "/"+newThemeName);				
			});
			data.bodyClasses = data.bodyClasses.replace(new RegExp("\\b"+oldThemeName+"\\b","g"), newThemeName);

			if(this.editor && this.editor.visualEditor && this.editor.visualEditor._onloadMessages){
				this.editor.visualEditor._onloadMessages.push(dojo.replace(
					"Warning. File refers to CSS theme '{0}' which is not in your workspace. Using CSS theme '{1}' instead.", //FIXME: Needs to be globalized
					[oldThemeName, newThemeName]));
			}
		}

        

		this.setHeader({
			title: data.title,
			scripts: data.scripts,
			modules: data.modules,
			styleSheets: data.styleSheets,
			//className: data.className,
			
			bodyClasses: data.bodyClasses,
//FIXME: Research setHeader - doesn't seem to use states info
/*
			maqAppStates: data.maqAppStates,
			maqDeltas: data.maqDeltas,
*/
			style: data.style
		});

		var content = data.content || "";
		
		var active = this.isActive();
		if(active){
			this.select(null);
			this.getTopWidgets().forEach(this.detach, this);
		}
		var states = {},
		    containerNode = this.getContainerNode();

		if (data.maqAppStates) {
			states.body = data.maqAppStates;
		}
		this.getTopWidgets().forEach(function(w){
			if(w.getContext()){
				w.destroyWidget();
			}
		});

		// remove all registered widgets
        this.getGlobal().dijit.registry.forEach(function(w) { //FIXME: use require?
              w.destroy();           
        });
        
        //FIXME: Temporary fix for #3030. Strip out any </br> elements
        //before stuffing the content into the document.
        content = content.replace(/<\s*\/\s*br\s*>/gi, "");

        // Set content
		//  Content may contain inline scripts. We use dojox.html.set() to pull
		// out those scripts and execute them later, after _processWidgets()
		// has loaded any required resources (i.e. <head> scripts)
		var scripts;
        // It is necessary to run the dojox.html.set utility from the context
	    // of inner frame.  Might be a Dojo bug in _toDom().
	    this.getGlobal()['require']('dojox/html/_base').set(containerNode, content, {
	        executeScripts: true,
	        onEnd: function() {
	            // save any scripts for later execution
	            scripts = this._code;
	            this.executeScripts = false;
                this.inherited('onEnd', arguments);
	        }
	    });

		// Remove "on*" event attributes from editor DOM.
		// They are already in the model. So, they will not be lost.
		removeEventAttributes(containerNode);
		query("*",containerNode).forEach(removeEventAttributes);

		// Convert all text nodes that only contain white space to empty strings
		containerNode.setAttribute('data-maq-ws','collapse');
		var modelBodyElement = this._srcDocument.getDocumentElement().getChildElement("body");
		if (modelBodyElement) {
			modelBodyElement.addAttribute('data-maq-ws', 'collapse');	
		}

		// Set the mobile agaent if there is a device on the body
		// We need to ensure it is set before the require of deviceTheme is executed
		var djConfig = this.getGlobal().dojo.config;  // TODO: use require
		var bodyElement = this.getDocumentElement().getChildElement("body");
		var device = bodyElement && bodyElement.getAttribute(MOBILE_DEV_ATTR);
		if (device && djConfig) {
			djConfig.mblUserAgent = Silhouette.getMobileTheme(device + '.svg') || "other";
		} 
				
		// Collapses all text nodes that only contain white space characters into empty string.
		// Skips certain nodes where whitespace does not impact layout and would cause unnecessary processing.
		// Similar to features that hopefully will appear in CSS3 via white-space-collapse.
		// Code is also injected into the page via workbench/davinci/davinci.js to do this at runtime.
		var skip = {SCRIPT:1, STYLE:1},
			collapse = function(element) {
			dojo.forEach(element.childNodes, function(cn){
				if (cn.nodeType == 3){	// Text node
					//FIXME: exclusion for SCRIPT, CSS content?
					cn.nodeValue = cn.data.replace(/^[\f\n\r\t\v\ ]+$/g,"");
				}else if (cn.nodeType == 1 && !skip[cn.nodeName]){ // Element node
					collapse(cn);
				}
			});
		};
		collapse(containerNode);
		this._loadFileStatesCache = states;
		return this._processWidgets(containerNode, active, this._loadFileStatesCache, scripts);		
	},

	/**
	 * Invoked when the page associated with this Context has finished its
	 * initial loading.
	 */
	onload: function() {
		// Don't actually get the composition type. Calling this routine
		// causes a maq-data-comptype attribute to be added to old documents
		// if it doesn't exist already.
		this.getCompType();
		
		// add the user activity monitoring to the document and add the connects to be 
		// disconnected latter
		this._connects = (this._connects || []).concat(UserActivityMonitor.addInActivityMonitor(this.getDocument()));
		// Set mobile device CSS files
		var mobileDevice = this.getMobileDevice();
	
		if (mobileDevice) {
			this.setMobileDevice(mobileDevice);
			/* 
			 * on start up the theme should already be set by deviceTheme
			 * setting it again here can cause timing problems, so just 
			 * the device silhouette 
			*/
			this.visualEditor.setDevice(mobileDevice, true); // set deviceOnly
			this.visualEditor.setOrientation(this.getMobileOrientation());
		}
		this._configDojoxMobile(true); // loading
		/*
		 * Need to let the widgets get parsed, and things finish loading async
		 */
		window.setTimeout(function(){
			this.widgetAddedOrDeleted();
			connect.publish('/davinci/ui/context/loaded', [this]);
			if(this._markDirtyAtLoadTime){
				// Hack to allow certain scenarios to force the document to appear
				// as dirty at document load time
				this.editor.setDirty(true);
				delete this._markDirtyAtLoadTime;
				this.editor.save(true);		// autosave
			}else{
				this.editor.setDirty(this.hasDirtyResources());
			}
			this.addPseudoClassSelectors();
		}.bind(this), 500);
	},

	/**
	 * Process dojoType, oawidget and dvwidget attributes on text content for containerNode
	 */
	_processWidgets: function(containerNode, attachWidgets, states, scripts) {
		var prereqs = [];
		this._loadFileDojoTypesCache = {};
		dojo.forEach(query("*", containerNode), function(n){
			var type =  n.getAttribute("data-dojo-type") || n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			//FIXME: This logic assume that if it doesn't have a dojo type attribute, then it's an HTML widget
			//Need to generalize to have a check for all possible widget type designators
			//(dojo and otherwise)
			if(!type){
				type = 'html.' + n.tagName.toLowerCase();
			}
			//doUpdateModelDojoRequires=true forces the SCRIPT tag with dojo.require() elements
			//to always check that scriptAdditions includes the dojo.require() for this widget.
			//Cleans up after a bug we had (7714) where model wasn't getting updated, so
			//we had old files that were missing some of their dojo.require() statements.
			prereqs.push(this.loadRequires((type||"").replace(/\./g, "/"), false/*doUpdateModel*/, true/*doUpdateModelDojoRequires*/));
			prereqs.push(this._preProcess(n));
//			this.resolveUrl(n);
			this._preserveStates(n, states);
			this._preserveDojoTypes(n);
		}, this);
		var promise = new Deferred();
		all(prereqs).then(function() {
			//FIXME: dojo/ready call may no longer be necessary, now that parser requires its own modules
			this.getGlobal()["require"]("dojo/ready")(function(){
				try {
					// M8: Temporary hack for #3584.  Should be moved to a helper method if we continue to need this.
					// Because of a race condition, override _getValuesAttr with a fixed value rather than querying
					// individual slots.
					try {
						var sws = this.getGlobal()["require"]("dojox/mobile/SpinWheelSlot");
						if (sws && sws.prototype && !sws.prototype._hacked) {
							sws.prototype._hacked = true;
							console.warn("Patch SpinWheelSlot");
							var keySuper = sws.prototype._getKeyAttr;
							sws.prototype._getKeyAttr = function() {
		                        if(!this._started) { 
		                        	if(this.items) {
		                        		for(var i = 0; i < this.items.length; i++) {
		                        			if(this.items[i][1] == this.value) {
		                        				return this.items[i][0];
		                        			}
		                        		}
		                        	}
		                        	return null;
		                        }
		                        return keySuper.apply(this);
							};
							var valueSuper = sws.prototype._getValueAttr;
							sws.prototype._getValueAttr = function() {
		                        if(!this._started){ 
		                        	return this.value;
		                        }
		                        return valueSuper.apply(this) || this.value;
							};
						}
					}catch(e){
						// ignore
					}

					this.getGlobal()["require"]("dojo/parser").parse(containerNode).then(function(){
						// In some cases, parser wipes out the data-dojo-type. But we need
						// the widget type in order to do our widget initialization logic.
						this._restoreDojoTypes();	

						promise.resolve();

						if(attachWidgets){
							this._attachAll();
						}
			
				        if (scripts) {
				            try {
				                dojox.html.evalInGlobal(scripts, containerNode);
				            } catch(e) {
				                console.error('Error eval script in Context._setSourceData, ' + e);
				            }
				        }
					}.bind(this), function(e){
						promise.reject(e);
					});
				} catch(e) {
					// When loading large files on FF 3.6 if the editor is not the active editor (this can happen at start up
					// the dojo parser will throw an exception trying to compute style on hidden containers
					// so to fix this we catch the exception here and add a subscription to be notified when this editor is seleected by the user
					// then we will reprocess the content when we have focus -- wdr
	
					console.error(e);
					promise.reject(e);
				}
			}.bind(this));
		}.bind(this));

		/*
		promise.otherwise(function(e){
			// remove all registered widgets, some may be partly constructed.
			this.getGlobal().dijit.registry.forEach(function(w){
				  w.destroy();			 
			});

			this._editorSelectConnection = connect.subscribe("/davinci/ui/editorSelected",
					this, '_editorSelectionChange');			
		});
		*/

		return promise;
	},
	
	_preProcess: function (node){
		//need a helper to pre process widget
		// also, prime the helper cache
        var type = node.getAttribute("data-dojo-type") || node.getAttribute("dojoType");
		//FIXME: This logic assume that if it doesn't have a dojo type attribute, then it's an HTML widget
		//Need to generalize to have a check for all possible widget type designators
		//(dojo and otherwise)
		if(!type){
			type = 'html.' + node.tagName.toLowerCase();
		}
        return Widget.requireWidgetHelper((type||"").replace(/\./g, "/")).then(function(helper) {        	
	        if(helper && helper.preProcess){
	            helper.preProcess(node, this);
	        }
        }.bind(this));
    },
	    
	_editorSelectionChange: function(event){
		// we should only be here do to a dojo.parse exception the first time we tried to process the page
		// Now the editor tab container should have focus becouse the user selected it. So the dojo.processing should work this time
		if (event.editor.fileName === this.editor.fileName){
			connect.unsubscribe(this._editorSelectConnection);
			delete this._editorSelectConnection;
			this._setSource(this._srcDocument);
		}
	},

	_attachAll: function()
	{
		var rootWidget=this.rootWidget=new HTMLWidget({},this.rootNode);
		rootWidget._edit_context=this;
		rootWidget.isRoot=true;
		rootWidget._srcElement=this._srcDocument.getDocumentElement().getChildElement("body");
		rootWidget._srcElement.setAttribute("id", "myapp");
		this._attachChildren(this.rootNode);
	},

	_attachChildren: function (containerNode){
		query("> *", containerNode).map(Widget.getWidget).forEach(this.attach, this);
	},
	
	/**
	 * If any widgets in the document have onLoad helpers, invoke those helpers.
	 * We pass a parameter to tell the helper whether this is the first time
	 * it has been called for this document.
	 * FIXME: If we change helpers to using object-oriented approach inheriting from
	 * helper base class, then helper class can probably keep track of already themselves.
	 */
	_onLoadHelpers: function(){
		var onLoadHelpersSoFar={};
		query("> *", this.rootNode).map(Widget.getWidget).forEach(function(widget){
			var helper = widget.getHelper();
			if(helper && helper.onLoad){
				var already = onLoadHelpersSoFar[widget.type];
				onLoadHelpersSoFar[widget.type] = true;
				helper.onLoad(widget,already);
			}
		}, this);
	},

	getHeader: function(){
		return this._header || {};
	},

	setHeader: function(header){
		var oldStyleSheets = [],
			newStyleSheets,
			oldBodyClasses,
			newBodyClasses;
		if(this._header){
			oldStyleSheets = this._header.styleSheets || [];
			oldBodyClasses = this._header.bodyClasses;
		}
		if(header){
			newStyleSheets = header.styleSheets || [];
			newBodyClasses = header.bodyClasses;
			if(header.modules){
				var innerRequire = this.getGlobal()["require"];
				header.modules.map(function(module) {
					return [module.replace(/\./g, "/")];
				}).forEach(innerRequire);
			}

			if(header.className){
				var classes = header.className.split(' ');
				dojo.some(classes, function(clasz, index){
					classes.splice(index, 1);
					newBodyClasses = classes.join(' ');
					return true;
				});
			}
		}

		if(oldBodyClasses != newBodyClasses){
			var containerNode = this.getContainerNode();
			if(oldBodyClasses){
				domClass.remove(containerNode, oldBodyClasses);
			}
			if(newBodyClasses){
				domClass.add(containerNode, newBodyClasses);
			}
		}

		if(oldStyleSheets != newStyleSheets){
			oldStyleSheets = [].concat(oldStyleSheets); // copy array for splice() below
			dojo.forEach(newStyleSheets, function(s){
				var index = dojo.indexOf(oldStyleSheets, s);
				if(index < 0){
					this.loadStyleSheet(s);
				}else{
					oldStyleSheets.splice(index, 1);
				}
			}, this);
			dojo.forEach(oldStyleSheets, this.unloadStyleSheet, this);
		}

		this.setStyle(header ? header.style : undefined);

		this._header = header;
	},
	
	getStyle: function(){
		return this._header ? this._header.style : undefined;
	},

	setStyle: function(style){
		var values = (Widget.parseStyleValues(style));
		if(this._header){
			var oldValues = Widget.parseStyleValues(this._header.style);
			if(oldValues){
				for(var name in oldValues){
					if(!values[name]){
						values[name] = undefined; // to remove
					}
				}
			}
			this._header.style = style;
		}else{
			this._header = {style: style};
		}
/* TODO: implement Context::setStyle */		
//		Widget.setStyleValues(this.container, values); //TODO
	},

	/**
	 * Load the style sheet into the page's DOM.
	 * @param url {string}
	 */
	loadStyleSheet: function(url) {
		var doc = this.getDocument(),
			query = this.getGlobal()["require"]("dojo/query"),
			links = query('link');

		if (links.some(function(val) {
			return val.getAttribute('href') === url;
		})) {
	        // don't add if stylesheet is already loaded in the page
			return;
		}

		dojo.withDoc(doc, function() {
	        var newLink = domConstruct.create('link', {
	            rel: 'stylesheet',
	            type: 'text/css',
	            href: url
	        });
	        // Make sure app.css is the after library CSS files, and content.css is after app.css
	        // FIXME: Shouldn't hardcode this sort of thing
	        var headElem = doc.getElementsByTagName('head')[0],
				isAppCss = url.indexOf('app.css') > -1,
				isContentCss = url.indexOf('content.css') > -1,
				appCssLink, contentCssLink;

			links.forEach(function(link) {
				if(link.href.indexOf('app.css') > -1){
					appCssLink = link;
				}else if(link.href.indexOf('content.css') > -1){
					contentCssLink = link;
				}
			});

			var beforeChild;
			if(!isContentCss){
				if(isAppCss && contentCssLink){
					beforeChild = contentCssLink;
				}else{
					beforeChild = appCssLink;
				}
			}
			if(beforeChild){
				headElem.insertBefore(newLink, beforeChild);
			}else{
		        headElem.appendChild(newLink);
			}
		});
	},

	/**
	 * Remove style sheet from page's DOM.
	 * @param url {string}
	 */
    unloadStyleSheet: function(url) {
    	var userWin = this.getGlobal();
    	if(userWin && userWin["require"]){
    		var query = userWin["require"]("dojo/query");
    		query('link').filter(function(node) {
                return node.getAttribute('href') == url;
    		}).forEach(domConstruct.destroy);
    	}
    },

	addModeledStyleSheet: function(url, skipDomUpdate) {
		if (!skipDomUpdate) {
			this.loadStyleSheet(url);
		}
		if (!this.model.hasStyleSheet(url)) {
			// Make sure app.css is the last CSS file within the list of @import statements
	        // FIXME: Shouldn't hardcode this sort of thing
			var isAppCss = url.indexOf('app.css') > -1;
			var appCssImport;
			var styleElem = this.model.find({elementType: "HTMLElement", tag: 'style'}, true);
			if(styleElem){
				var kids = styleElem.children;
				for(var i=0; i<kids.length; i++){
					if(kids[i].url.indexOf('app.css') > -1){
						appCssImport = kids[i];
					}
				}
			}
			var beforeChild = isAppCss ? undefined : appCssImport;
			this.model.addStyleSheet(url, undefined, undefined, beforeChild);
			
			for (var css in this.model._loadedCSS) {
				this._loadedCSSConnects.push(
					connect.connect(this.model._loadedCSS[css], 'onChange', this, '_themeChange'));
			}
		}
	},

	//FIXME: refactor with hotModifyCSSRule to another module and use in both PageEditor and ThemeEditor
	_themeChange: function(e){
		if (e && e.elementType === 'CSSRule'){
			this.editor.setDirty(true); // a rule change so the CSS files are dirty. we need to save on exit
			this.hotModifyCssRule(e); 
		}
	},

	// Temporarily stuff a unique class onto element with each _preserveStates call.
	// Dojo will sometimes replace the widget's root node with a different root node
	// and transfer IDs and other properties to subnodes. However, Dojo doesn't mess
	// with classes.
	//FIXME: Need a more robust method, but not sure exactly how to make this bullet-proof and future-proof.
	//Could maybe use XPath somehow to address the root node.
	maqStatesClassCount: 0,
	maqStatesClassPrefix: 'maqStatesClass',

	// preserve states specified to node
	_preserveStates: function(node, cache){
		var statesAttributes = davinci.ve.states.retrieve(node);
//FIXME: Need to generalize this to any states container
		if (node.tagName.toUpperCase() != "BODY" && (statesAttributes.maqAppStates || statesAttributes.maqDeltas)) {
			var tempClass = this.maqStatesClassPrefix + this.maqStatesClassCount;
			node.className = node.className + ' ' + tempClass;
			this.maqStatesClassCount++;
			cache[tempClass] = {};
			if(statesAttributes.maqAppStates){
				cache[tempClass].maqAppStates = statesAttributes.maqAppStates;
			}
			if(statesAttributes.maqDeltas){
				cache[tempClass].maqDeltas = statesAttributes.maqDeltas;
			}
			if(node.style){
				cache[tempClass].style = node.style.cssText;
			}else{
				// Shouldn't be here
				console.error('Context._preserveStates: fail'); // FIXME: throw on error?
			}
		}
	},

	// restore states into widget
	_restoreStates: function(){
		var cache = this._loadFileStatesCache;
		if(!cache){
			console.error('Context._restoreStates: this._loadFileStatesCache missing');
			return;
		}
		var maqAppStatesString, maqDeltasString, maqAppStates, maqDeltas;
		for(var id in cache){
			//FIXME: This logic depends on the user never add ID "body" to any of his widgets.
			//That's bad. We should find another way to achieve special case logic for BODY widget.
			// Carefully pick the correct root node for this widget
			var node = null;
			if(id == "body"){	
				node = this.getContainerNode();
			}
			if(!node){
				var doc = this.getDocument();
				node = doc.querySelectorAll('.'+id)[0];
				if(node){
					node.className = node.className.replace(' '+id,'');
				}
			}
			if(!node){
				console.error('Context.js _restoreStates node not found. id='+id);
				continue;
			}
			var widget = Widget.getWidget(node);
//FIXME: Need to generalize beyond just BODY
			var isBody = (node.tagName.toUpperCase() == 'BODY');
//FIXME: Temporary - doesn't yet take into account nested state containers
			var srcElement = widget._srcElement;
			maqAppStatesString = maqDeltasString = maqAppStates = maqDeltas = null;
			if(isBody){
				maqAppStatesString = cache[id];
			}else{
				maqAppStatesString = cache[id].maqAppStates;
				maqDeltasString = cache[id].maqDeltas;
			}
			var maqAppStates = maqDeltas = null;
			var visualChanged = false;
			if(maqAppStatesString){
				maqAppStates = davinci.states.deserialize(maqAppStatesString, {isBody:isBody});
//FIXME: If files get migrated, should set dirty bit
//FIXME: Logic doesn't completely deal with nesting yet.
				// Migrate states attribute names in the model
				var oldValue = srcElement.getAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE);
				if(oldValue != maqAppStatesString){
					srcElement.setAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE, maqAppStatesString);
					visualChanged = true;
				}
				// Remove any lingering old dvStates attribute from model
				if(srcElement.hasAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6)){
					srcElement.removeAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6);
					visualChanged = true;
				}
			}
			if(maqDeltasString){
				maqDeltas = davinci.states.deserialize(maqDeltasString, {isBody:isBody});
//FIXME: If files get migrated, should set dirty bit
//FIXME: Logic doesn't completely deal with nesting yet.
				// Migrate states attribute names in the model
				var oldValue = srcElement.getAttribute(davinci.ve.states.DELTAS_ATTRIBUTE);
				if(oldValue != maqDeltasString){
					srcElement.setAttribute(davinci.ve.states.DELTAS_ATTRIBUTE, maqDeltasString);
					visualChanged = true;
				}
				// Remove any lingering old dvStates attribute from model
				if(srcElement.hasAttribute(davinci.ve.states.DELTAS_ATTRIBUTE_P6)){
					srcElement.removeAttribute(davinci.ve.states.DELTAS_ATTRIBUTE_P6);
					visualChanged = true;
				}
			}
			if(visualChanged){
				// we are resoring, don't mark dirty
				this.editor._visualChanged(true);
			}
			if(maqAppStates){
				if(maqAppStates.initial){
					// If user defined an initial state, then set current to that state
					maqAppStates.current = maqAppStates.initial;
				}else{
					if(maqAppStates.focus){
						// Can't have focus on a state that isn't current
						delete maqAppStates.focus; 
					}
					// Otherwise, delete any current state so that we will be in Normal state by default
					delete maqAppStates.current;
				}
			}
			davinci.ve.states.store(widget.domNode, maqAppStates, maqDeltas);
			
//FIXME: Need to generalize beyond just BODY
/*FIXME: OLD LOGIC
			if(node.tagName.toUpperCase() != 'BODY'){
*/
			if(maqDeltas){
				davinci.states.transferElementStyle(node, cache[id].style);
			}
			
		}
		// Remove any application states information that are defined on particular widgets
		// for all states that aren't in the master list of application states.
		// (This is to clean up after bugs found in older releases)
		davinci.ve.states.removeUnusedStates(this);
		
		// Call setState() on all of the state containers that have non-default
		// values for their current state (which was set to initial state earlier
		// in this routine).
		davinci.ve.states.getAllStateContainers(this.rootNode).forEach(function(stateContainer) {			
			if(stateContainer._maqAppStates && typeof stateContainer._maqAppStates.current == 'string'){
				var focus = stateContainer._maqAppStates.focus;
				davinci.states.setState(stateContainer._maqAppStates.current, stateContainer, {updateWhenCurrent:true, focus:focus});
			}
		});
	},

	// Temporarily stuff a unique class onto element with each _preserveDojoTypes call.
	// Dojo will sometimes replace the widget's root node with a different root node
	// and transfer IDs and other properties to subnodes. However, Dojo doesn't mess
	// with classes.
	maqTypesClassCount: 0,
	maqTypesClassPrefix: 'maqTypesClass',
	
	// Preserve data-dojo-type and dojoType values
	_preserveDojoTypes: function(node){
		var widgetType = node.getAttribute("data-dojo-type") || node.getAttribute("dojoType");
		if(widgetType){
			var cache = this._loadFileDojoTypesCache;
			var tempClass = this.maqTypesClassPrefix + this.maqTypesClassCount;
			node.className = node.className + ' ' + tempClass;
			this.maqTypesClassCount++;
			cache[tempClass] = widgetType;
		}
	},

	// restore info from dojo-data-type attribute onto widgets so that getWidget() will
	// be able to determine the widget types
	_restoreDojoTypes: function(){
		var cache = this._loadFileDojoTypesCache;
		var doc = this.getDocument();
		for(var id in cache){
			node = doc.querySelectorAll('.'+id)[0];
			if(node){
				node.className = node.className.replace(' '+id,'');
				node.setAttribute('data-dojo-type', cache[id]);
			}
		}
	},

	/**
	 * Force a data-maq-appstates attribute on the BODY
	 */
	_AppStatesActivateActions: function(){
		if(this.editor.declaredClass !== "davinci.ve.PageEditor"){
			return;
		}
		if(!this.rootNode._maqAppStates){
			this.rootNode._maqAppStates = {};
			var bodyModelNode = this.rootWidget._srcElement;
			var o = States.serialize(this.rootNode);
			if(o.maqAppStates){
				bodyModelNode.setAttribute(States.APPSTATES_ATTRIBUTE, o.maqAppStates);
			}else{
				bodyModelNode.removeAttribute(States.APPSTATES_ATTRIBUTE);
			}
			// no src changes to pass in true
			this.editor._visualChanged(true);
		}
		var statesFocus = States.getFocus(this.rootNode);
		if(!statesFocus){
			var currentState = States.getState(this.rootNode);
			States.setState(currentState, this.rootNode, {updateWhenCurrent:true, silent:true, focus:true });
		}
	},

	getDocument: function(){
		var container = this.getContainerNode();
		return container && container.ownerDocument;
	},

	getGlobal: function(){
		var doc = this.getDocument();
		return doc ? windowUtils.get(doc) : null;
	},

	//DEPRECATED
	getDojo: function(){
		var win = this.getGlobal();
		//FIXME: Aren't we asking for downstream bugs if we return "dojo", which is Maqetta's dojo
		//instead of the user document's dojo?
		return (win && win.dojo) || dojo;
	},

	//DEPRECATED
	getDijit: function(){
		var win = this.getGlobal();
		return win && win.dijit || dijit;
	},

	//FIXME: accessor func is unnecessary?
	getContainerNode: function(){
		return this.rootNode;
	},

	getParentIframe: function(){
		if(!this._parentIframeElem){
	        var userdoc = this.getDocument();
			var iframes = document.getElementsByTagName('iframe');
			for(var i=0; i < iframes.length; i++){
				if(iframes[i].contentDocument === userdoc){
					this._parentIframeElem = iframes[i];
					break;
				}
			}
		}
		return this._parentIframeElem;
	},

	getTopWidgets: function(){
		var topWidgets = [];
		for(var node = this.rootNode.firstChild; node; node = node.nextSibling){
			if(node.nodeType == 1 && node._dvWidget){
				topWidgets.push(node._dvWidget);
			}
		}
		return topWidgets;
	},

	getCommandStack: function(){
		return this._commandStack;
	},

	getSelection: function(){
		return this._selection || [];
	},

	// Returns true if inline edit is showing
	inlineEditActive: function(){
	    return this.getSelection().some(function(item, i){
	    	return this._focuses[i].inlineEditActive();
	    }, this);
	},
	
	updateFocus: function(widget, index, inline){
		if(this.editor.getDisplayMode && this.editor.getDisplayMode() == 'source'){
			return;
		}
		Widget.requireWidgetHelper(widget.type).then(function(helper) { 
			if(!this.editor.isActiveEditor()){
				return;
			}
			var box, op, parent;
	
			if (!metadata.queryDescriptor(widget.type, "isInvisible")) {
				//Get the margin box (deferring to helper when available)
				var helper = widget.getHelper();
				if(helper && helper.getMarginBoxPageCoords){
					box = helper.getMarginBoxPageCoords(widget);
				} else {
					var node = widget.getStyleNode();
					if(helper && helper.getSelectNode){
						node = helper.getSelectNode(this) || node;
					}
					box = GeomUtils.getMarginBoxPageCoords(node);
				}
	
				parent = widget.getParent();
				op = {move: !(parent && parent.isLayout && parent.isLayout())};
	
				//FIXME: need to consult metadata to see if layoutcontainer children are resizable, and if so on which axis
				var resizable = (parent && parent.isLayout && parent.isLayout() ) ?
						"none" : metadata.queryDescriptor(widget.type, "resizable");
				switch(resizable){
				case "width":
					op.resizeWidth = true;
					break;
				case "height":
					op.resizeHeight = true;
					break;
				case "both":
					op.resizeWidth = true;
					op.resizeHeight = true;
				}
			}
			this.focus({
				box: box,
				op: op,
				hasLayout: (widget.isLayout && widget.isLayout()),
				isChild: parent && parent.isLayout && parent.isLayout()
			}, index, inline);
			
			// Currently only used by theme editor
			this._focuses[0].showContext(this, widget);
			
		}.bind(this));	
	},
	
	updateFocusAll: function(){
		if(this.editor && this.editor.getDisplayMode && this.editor.getDisplayMode() == 'source'){
			return;
		}
		var selection = this._selection;
		if(selection){
			for(var i=0; i<selection.length; i++){
				this.updateFocus(selection[i], i);			
			}
		}
		//Update all of the highlights that show which widgets appear in a custom state
		// but which are actually visible on the base state and "shining through" to custom state
		States.updateHighlightsBaseStateWidgets(this);
	},
	
	select: function(widget, add, inline){
		if(!widget || widget==this.rootWidget){
			if(!add){
				this.deselect(); // deselect all
			}
			return;
		}
		
		var index, alreadySelected = false;
		if (this._selection) {
			alreadySelected = this._selection.some(function(w, idx) {
				if (w === widget) {
					index = idx;
					return true;
				}
				return false;
			});
		}

		if(!alreadySelected){
			var selection;
			if(add && this._selection){
				index = this._selection.length;
				selection = this._selection;
				selection.push(widget);
			}else{
				selection = [widget];
			}

			var parent = widget.getParent();
			if(parent){
				var parentHelper = parent.getHelper();
				if (parentHelper && parentHelper.selectChild){
					parentHelper.selectChild(parent, widget);
				} else {
					parent.selectChild(widget);
				}
			}
			
			if(!this._selection || this._selection.length > 1 || selection.length > 1 || this.getSelection() != widget){
				var oldSelection = this._selection;
				this._selection = selection;
				this.onSelectionChange(selection, add);
				if(oldSelection){
					oldSelection.forEach(function(w){
						var h = w.getHelper();
						if(h && h.onDeselect){
							h.onDeselect(w);
						}
					},this);
				}
				var helper = widget.getHelper();
				if(helper && helper.onSelect){
					helper.onSelect(widget);
				}
			}
		}
		this.updateFocus(widget, index, inline);
	},

	deselect: function(widget){
		if(!this._selection){
			return;
		}

		if(widget){
			helper = widget.getHelper();
		}
		if(widget && this._selection.length){ // undo of add got us here some how.
			if(this._selection.length === 1){
				if(this._selection[0] != widget){
					return;
				}
				this.focus(null, 0);
				this._selection = undefined;
			}else{
				var index = dojo.indexOf(this._selection, widget);
				if(index < 0){
					return;
				}
				this.focus(null, index);
				this._selection.splice(index, 1);
			}
			if(helper && helper.onDeselect){
				helper.onDeselect(widget);
			}
		}else{ // deselect all
			if(this._selection){
				this._selection.forEach(function(w){
					var h = w.getHelper();
					if(h && h.onDeselect){
						h.onDeselect(w);
					}
				},this);
			}
			this.focus(null);
			this._selection = undefined;
		}

		this.onSelectionChange(this.getSelection());
	},
	
	deselectInvisible: function(){
		function isHidden(node) {
			if ((node.nodeType == 1 /*ELEMENT_NODE*/) &&  (domStyle.get(node, "display") == 'none')) {
				return true;
			}
			if (node.parentNode) {
				return isHidden(node.parentNode);
			} 
			return false;
		}
		
		if(this._selection){
			for(var i=this._selection.length-1; i>=0; i--){
				var widget = this._selection[i];
				var domNode = widget.domNode;
				// Check for display:none somewhere in ancestor DOM hierarchy
				if (isHidden(domNode)) {
					this.deselect(widget);
				}else{
					while(domNode && domNode.tagName.toUpperCase() != 'BODY'){
						// Sometimes browsers haven't set up defaultView yet,
						// and domStyle.get will raise exception if defaultView isn't there yet
						if(domNode && domNode.ownerDocument && domNode.ownerDocument.defaultView){
							var computedStyleDisplay = domStyle.get(domNode, 'display');
							if(computedStyleDisplay == 'none'){
								this.deselect(widget);
								break;
							}
						}
						domNode = domNode.parentNode;
					}
				}
			}
		}
	},
	
	// If widget is in selection, returns the focus object for that widget
	getFocus: function(widget){
		var i = this.getSelection().indexOf(widget);
		return i == -1 ? null : this._focuses[i];
	},

	/**
	 * Returns true if the given node is part of the focus (ie selection) chrome
	 */
	isFocusNode: function(node){
		if(this._selection && this._selection.length && this._focuses && this._focuses.length >= this._selection.length){
			for(var i=0; i<this._selection.length; i++){
				if(this._focuses[i].isFocusNode(node)){
					return true;
				}
			}
		}
		return false;
	},

	focus: function(state, index, inline){
		this._focuses = this._focuses || [];
		var clear = false;
		if(index === undefined){
			clear = true;
			index = 0;
		}
		var focus;
		if(index < this._focuses.length){
			focus = this._focuses[index];
		}else{
			dojo.withDoc(this.getDocument(), dojo.hitch(this, function(){
				focus = new Focus();
				focus._edit_focus = true;
				focus._context = this;
			}));
			this._focuses.push(focus);
		}

		//FIXME: DELETE THIS var containerNode = this.getContainerNode();
		var containerNode = this.getFocusContainer();

		if(state){
			if(state.box && state.op){
				if(!focus._connected){
					this._connects.push(connect.connect(focus, "onExtentChange", this, "onExtentChange"));
					focus._connected = true;
				}
				var w = this.getSelection();
				focus.resize(state.box, w[0]);
				var windex = index < w.length ? index : 0;	// Just being careful in case index is messed up
				focus.resize(state.box, w[windex]);
				focus.allow(state.op);
				if(focus.domNode.parentNode != containerNode){
					containerNode.appendChild(focus.domNode);
				}
				focus.show(w[windex], { inline:inline });
			}else{ // hide
				focus.hide();
			}
			index++; // for clear
		}else if(!clear){ // remove
			if(focus.domNode.parentNode == containerNode){
				focus.hide();
				containerNode.removeChild(focus.domNode);
			}
			this._focuses.splice(index, 1);
			this._focuses.push(focus); // recycle
		}
		if(clear){
			this.hideFocusAll(index);
		}
	},
	
	hideFocusAll: function(startIndex){
		if(!startIndex){
			startIndex = 0;
		}
		var containerNode = this.getFocusContainer();
		if(this._focuses){
			for(var i = startIndex; i < this._focuses.length; i++){
				var focus = this._focuses[i];
				if(focus.domNode.parentNode == containerNode){
					focus.hide();
					containerNode.removeChild(focus.domNode);
				}
			}
		}
	},

	//FIXME: refactor.  Does not need to be in Context.js
	getPreference: function(name){
		if(!name){
			return undefined;
		}
		return davinci.ve._preferences[name];
	},

	getPreferences: function(){
		return lang.mixin({}, davinci.ve._preferences);
	},
	setPreference: function(name, value){
		if(!name){
			return;
		}
		davinci.ve._preferences[name] = value;

		if(this.isActive()){
			// Previously, included logic to show a rectangular grid under the drawing canvas.
			// Now, nothing, but leaving empty IF statement in case we add things in future.
		}
	},

	setPreferences: function(preferences){
		if(preferences){
			for(var name in preferences){
				this.setPreference(name, preferences[name]);
			}
		}
	},

	//FIXME: getter seems to have side-effects.
	getFlowLayout: function() {
		var bodyElement = this.getDocumentElement().getChildElement("body"),
			flowLayout = bodyElement && bodyElement.getAttribute(PREF_LAYOUT_ATTR),
			flowLayoutP6 = bodyElement && bodyElement.getAttribute(PREF_LAYOUT_ATTR_P6);
		if(!flowLayout && flowLayoutP6){
			// Migrate from old attribute name (data-maqetta-flow-layout) to new attribute name (data-maq-flow-layout)
			bodyElement.removeAttribute(PREF_LAYOUT_ATTR_P6);
			bodyElement.setAttribute(PREF_LAYOUT_ATTR, flowLayoutP6);
			flowLayout = flowLayoutP6;
			this.editor._visualChanged();
		}
		if (!flowLayout){ // if flowLayout has not been set in the context check the edit prefs
			//var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
			//flowLayout = editorPrefs.flowLayout;
			flowLayout = true;
			this.setFlowLayout(flowLayout);
		} else {
			flowLayout = (flowLayout === 'true');
		}
		return flowLayout;
	},
	
	setFlowLayout: function(flowLayout){
		var bodyElement = this.getDocumentElement().getChildElement("body");
		if (bodyElement) {
			bodyElement.addAttribute(PREF_LAYOUT_ATTR, ''+flowLayout);
		}
		return flowLayout;
	},
	
	getCompType: function(){
		var bodyElement = this.getDocumentElement().getChildElement("body"),
			comptype = bodyElement && bodyElement.getAttribute(COMPTYPE_ATTR);
		if (bodyElement && !comptype){ 
			var device = this.getMobileDevice();
			comptype = device ? 'mobile' : 'desktop';
			bodyElement.addAttribute(COMPTYPE_ATTR, comptype);
		}
		return comptype;
	},

	getActiveTool: function(){
		return this._activeTool;
	},

	setActiveTool: function(tool){
		if(this._activeTool){
			this._activeTool.deactivate();
		}
		this._activeTool = tool;
		if(!this._activeTool){
			this._activeTool = this._defaultTool;
		}
		this._activeTool.activate(this);
		connect.publish("/davinci/ve/activeToolChanged", [this, tool]);
	},
	
	// getter/setter for currently active drag/drop object
	// FIXME: remove getter/setter
	getActiveDragDiv: function(){
		return this._activeDragDiv;
	},

	setActiveDragDiv: function(activeDragDiv){
		this._activeDragDiv = activeDragDiv;
	},
	
	blockChange: function(shouldBlock){
		this._blockChange = shouldBlock;
	},

	onMouseDown: function(event){
		if(this._activeTool && this._activeTool.onMouseDown && !this._blockChange){
			this._activeTool.onMouseDown(event);
		}
		this.blockChange(false);
	},
	
	onDblClick: function(event){
	},

	onMouseMove: function(event){
		if(this._activeTool && this._activeTool.onMouseMove && !this._blockChange){
			this._activeTool.onMouseMove(event);
		}
	},

	onMouseUp: function(event){
		if(this._activeTool && this._activeTool.onMouseUp){
			this._activeTool.onMouseUp(event);
		}
		this.blockChange(false);
		Topic.publish("/davinci/ve/context/mouseup", event);
	},

	onMouseOver: function(event){
		if(this._activeTool && this._activeTool.onMouseOver){
			this._activeTool.onMouseOver(event);
		}
	},

	onMouseOut: function(event){
		if(this._activeTool && this._activeTool.onMouseOut){
			this._activeTool.onMouseOut(event);
		}
	},
	
	onExtentChange: function(focus, oldBox, newBox, applyToWhichStates){
		if(this._activeTool && this._activeTool.onExtentChange && !this._blockChange){
			var index = dojo.indexOf(this._focuses, focus);
			if(index >= 0){
				this._activeTool.onExtentChange({ index: index, oldBoxes:[oldBox], newBox:newBox, applyToWhichStates:applyToWhichStates});
			}
		}
		this.blockChange(false);
	},

	/**
	 * Parse the given model.
	 * @param  {davinci/html/HTMLFile} source
	 * @return {Object} a data structure containing information on parsed source
	 */
	_parse: function(source) {
		var data = {metas: [], scripts: [], modules: [], styleSheets: []},
		 	htmlElement = source.getDocumentElement(),
		 	head = htmlElement.getChildElement("head"),
		 	bodyElement = htmlElement.getChildElement("body");

		this._uniqueIDs = {};
		if (bodyElement) {
			bodyElement.visit({ visit: dojo.hitch(this, function(element) {
				if (element.elementType == "HTMLElement" && element != bodyElement) {
					this.getUniqueID(element);
				}
			})});
			var classAttr = bodyElement.getAttribute("class");
			if (classAttr) {
				data.bodyClasses = classAttr;
				/*
				var classes =classAttr.split(' ');
				dojo.some(classes, function(clasz, index){
						
						classes.splice(index, 1)
						data.bodyClasses = classes.join(' ');
						return true;
				});
				*/
			}
			data.style = bodyElement.getAttribute("style");
			data.content = bodyElement.getElementText({includeNoPersist:true, excludeIgnoredContent:true});

//FIXME: Need to generalize beyond just BODY
			var states = bodyElement.getAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE);
			if(!states){
				// Previous versions used different attribute name (ie, 'dvStates')
				states = bodyElement.getAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6);
				if(states){
					bodyElement.setAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE, states);
				}
			}
			// Remove any lingering old dvStates attribute from model
			bodyElement.removeAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6);
			data.maqAppStates = states;
		}
		
		var titleElement=head.getChildElement("title");
		if (titleElement){
			data.title=titleElement.getElementText();
		}
		
		var scriptTags=head.getChildElements("script");
		dojo.forEach(scriptTags, function (scriptTag){
			var value=scriptTag.getAttribute("src");
			if (value) {
				data.scripts.push(value);
			}
			var text=scriptTag.getElementText();
			if (text.length) {
				// Look for old-style dojo.require dependencies
				text.replace(/dojo\.require\(["']([^'"]+)["']\)/g, function(match, module) {
					data.modules.push(module);
				});

				// grab AMD-style dependencies
				text.replace(/require\(\[["']([^'"]+)["']\]\)/g, function(match, module) {
					data.modules.push(module);
				});
			}
		}, this);

		var styleTags=head.getChildElements("style");
		dojo.forEach(styleTags, function (styleTag){
			dojo.forEach(styleTag.children,function(styleRule){
				if (styleRule.elementType === "CSSImport") {
					data.styleSheets.push(styleRule.url);
				}
			}); 
		});
		
		return data;
	},

	onKeyDown: function(event){
		//FIXME: Research task. This routine doesn't get fired when using CreateTool and drag/drop from widget palette.
		// Perhaps the drag operation created a DIV in application's DOM causes the application DOM
		// to be the keyboard focus?
		if(this._activeTool && this._activeTool.onKeyDown){
			this._activeTool.onKeyDown(event);
		}
	},

	onKeyUp: function(event){
		//FIXME: Research task. This routine doesn't get fired when using CreateTool and drag/drop from widget palette.
		// Perhaps the drag operation created a DIV in application's DOM causes the application DOM
		// to be the keyboard focus?
		if(this._activeTool && this._activeTool.onKeyUp){
			this._activeTool.onKeyUp(event);
		}
	},

	onContentChange: function(){
		this._updateWidgetHash();
		
		this.deselectInvisible();
		
		// update focus
		dojo.forEach(this.getSelection(), function(w, i){
			if(i === 0){
				this.select(w);
			}else{
				this.select(w, true); // add
			}
		}, this);

		//FIXME: ALP->WBR: do we still need this? move to ThemeEditor's context?
		if (this.editor.editorID == 'davinci.themeEdit.ThemeEditor'){
			var helper = Theme.getHelper(this.visualEditor.theme);
			if(helper && helper.onContentChange){
				helper.onContentChange(this, this.visualEditor.theme);
			} else if (helper && helper.then){ // it might not be loaded yet so check for a deferred
           	 helper.then(function(result){
        		 if (result.helper && result.helper.onContentChange){
        			 result.helper.onContentChange(this, this.visualEditor.theme); 
    			 }
        	 }.bind(this));
          }
		}

		if (this._forceSelectionChange) {
			this.onSelectionChange(this.getSelection());
			delete this._forceSelectionChange;
		}

		setTimeout(function(){
			// Invoke autoSave, with "this" set to Workbench
			Workbench._autoSave.call(Workbench);
		}, 0);
	},

	onSelectionChange: function(selection){
		this._cssCache = {};
		connect.publish("/davinci/ui/widgetSelected",[selection]);
	},

	//FIXME: candidate to move to a separate module
	hotModifyCssRule: function(r){
		
		function updateSheet(sheet, rule){
			var url = systemResource.findResource(rule.parent.url).getURL(); // FIXME: can we skip findResource?
			var fileName = encodeURI(url); // FIXME: corresponding rule we compare this to is url encoded, but probably shouldn't be?
			var selectorText = rule.getSelectorText();
			if (selectorText.indexOf(":") > -1) {
				selectorText = pseudoClass.replace(selectorText);
			}
//			console.log("------------  Hot Modify looking  " + fileName + " ----------------:=\n" + selectorText + "\n");
			selectorText = selectorText.replace(/^\s+|\s+$/g,""); // trim white space
			//var rules = sheet.cssRules;
			var foundSheet = findSheet(sheet, fileName);
			if (foundSheet){
				var rules = foundSheet.cssRules;
				for (var r = 0; r < rules.length; r++){
					if (rules[r].type && rules[r].type == CSSRule.STYLE_RULE){
						if (rules[r].selectorText == selectorText) {
							/* delete the rule if it exists */
							foundSheet.deleteRule(r);
//							console.log("------------  Hot Modify delete " + foundSheet.href + "index " +r+" ----------------:=\n" + selectorText + "\n");
							
							break;
						}
					}
				}
				if (rule.properties.length) { // only insert rule if it has properties
					var text = rule.getText({noComments:true});
					if (text.indexOf(":") > -1) {
						text = pseudoClass.replace(text);
					}
//					console.log("------------  Hot Modify Insert " + foundSheet.href +  "index " +r+" ----------------:=\n" + text + "\n");
					foundSheet.insertRule(text, r);
				}
				return true;
			}
			return false;
		}
		
		function findSheet(sheet, sheetName){
			if (sheet.href == sheetName){
//				console.log("------------  Hot foundsheet " +  sheetName + "\n");
				return sheet;
			}
			var foundSheet;
			var rules = sheet.cssRules;
			for (var r = 0; r < rules.length; r++){
			    var x = '' + rules[r].constructor;
				if (rules[r].type && rules[r].type === CSSRule.IMPORT_RULE){
				    var n = rules[r].href;
					if (rules[r].href == sheetName) {
						foundSheet = rules[r].styleSheet;
						//break;
					} else { // it might have imports
						foundSheet = findSheet(rules[r].styleSheet, sheetName);
					}
					if (foundSheet){
						break;
					}
				}
			}
			return foundSheet;
		}

		dojo.some(this.getDocument().styleSheets, function(sheet) {
			return updateSheet(sheet, r);
		});
	},
	
	addPseudoClassSelectors: function (selectors) {
		
		var updateSheet = function(sheet){
			if (sheet){
				var rules = sheet.cssRules;
				var r = 0;
				for (r = 0; r < rules.length; r++){
					// NOTE: For some reason the instanceof check does not work on Safari..
				    // So we are testing the constructor instead, but we have to test it as a string...
				    var y = rules[r];
					if (y.type && y.type === CSSRule.IMPORT_RULE){
						updateSheet(rules[r].styleSheet);
					} else if (rules[r].type == CSSRule.STYLE_RULE){
						var selectorText = rules[r].selectorText;
						if (selectorText.indexOf(":") > -1) {
							selectorText = pseudoClass.replace(selectorText);
							/*
							 * For now we will just replace the selector text,
							 * if this does not work well we can just append
							 */
							y.selectorText = selectorText;
							/* delete the rule if it exists */
							sheet.deleteRule(r);
							sheet.insertRule(y.cssText, r);
							break;
						}
					}
				}
				return true;
			}
			return false;
		};

		dojo.some(this.getDocument().styleSheets, updateSheet);
	},
	
	//FIXME: refactor. Move to Cascade.js?  need to account for polymorphism in themeEditor/Context
	getStyleAttributeValues: function(widget){
		//FIXME: This totally seems to have missed the array logic
		var vArray = widget ? widget.getStyleValues() : [];
		var stateContainers = States.getStateContainersForNode(widget.domNode);
		var isNormalState = true;
		for(var sc=0; sc<stateContainers.length; sc++){
			var stateContainer = stateContainers[sc];
			var state = States.getState(stateContainer);
			if(state && state != States.NORMAL){
				isNormalState = false;
				break;
			}
		}
		if (!isNormalState) {
			var currentStatesList = davinci.ve.states.getStatesListCurrent(widget.domNode);
			var stateStyleValuesArray = davinci.ve.states.getStyle(widget.domNode, currentStatesList);
			if(stateStyleValuesArray){
				// Remove entries from vArray that are in stateStyleValuesArray
				for(var i=0; i<stateStyleValuesArray.length; i++){
					var sItem = stateStyleValuesArray[i];
					for(var sProp in sItem){	// should be only object in each array item
						for(var j=vArray.length-1; j>=0; j--){
							var vItem = vArray[j];
							for(var vProp in vItem){	// should be only object in each array item
								if(sProp == vProp){
									vArray.splice(j, 1);
									break;
								}
							}
						}
					}
				}
				// Concat entries from stateStyleValuesArray to end of vArray
				vArray = vArray.concat(stateStyleValuesArray);
			}
		}
		return vArray;
	},

	// FIXME: should consider renaming method.  Has side effect of actually setting the id.
	getUniqueID: function(node, idRoot) {
		 var id = node.getAttribute("id");
		 if (!id) {
			 var userDoc = this.rootWidget ? this.rootWidget.domNode.ownerDocument : null,
			 	root = idRoot || node.tag,
			 	num;

			 while(1){
				 if (!this._uniqueIDs.hasOwnProperty(root)) {
					 num = this._uniqueIDs[root]=0;
				 } else {
					 num = ++this._uniqueIDs[root];
				 }
				 id = root + "_" + num;	
				 if(userDoc){
					 // If this is called when user doc is available,
					 // make sure this ID is unique
					 if(!userDoc.getElementById(id)){
						 break;
					 }
				 }else{
					 break;
				 }
			 }
			 var temp = !idRoot;
			 node.addAttribute("id", id, temp);	 
		 }
		 return id;
	},

	addJavaScriptSrc: function(url, doUpdateModel, baseSrcPath, skipDomUpdate) {
		var isDojoJS = /\/dojo.js$/.test(url),
			promises = [];
		// XXX HACK: Don't add dojo.js to the editor iframe, since it already has an instance.
		//	  Adding it again will overwrite the existing Dojo, breaking some things.
		//	  See bug 7585.
		if (!isDojoJS && !skipDomUpdate) {
			var context = this,
				absoluteUrl = new dojo._Url(this.getDocument().baseURI, url).toString(); //FIXME: use require.toUrl
			// This xhrGet() used to include `handleAs: "javascript"`, surrounded
			// by a `dojo.withGlobal`.  However, `dojo.eval` regressed in Dojo 1.7,
			// such that it no longer evals using `dojo.global` -- instead evaling
			// into the global context. To work around that, we do our own `eval` call.
			promises.push(xhr.get({
				url: absoluteUrl,
				sync: true    // XXX -> async, Defer rest of method
			}).then(function(data) {
				context.getGlobal()['eval'](data);
			}));
		}
		if (doUpdateModel) {				
			// update the script if found
			var head = this.getDocumentElement().getChildElement('head'),
				config = {
					parseOnLoad: true,
					async: true,
					packages: this._getLoaderPackages()
				},
				found = head.getChildElements('script').some(function(element) {
					var elementUrl = element.getAttribute("src");
					if (elementUrl && elementUrl.indexOf(baseSrcPath) > -1) {
						element.setAttribute("src", url);
						return true;
					}
				});

			// Make sure we include all custom widget packages in the data-dojo-config in the model
			config.packages = config.packages.concat(this._customWidgetPackages);

			if (found) {
				if (isDojoJS) {
					this._updateDojoConfig(config);
				}
			} else {
				if (isDojoJS) {
					// special case for dojo.js to provide config attribute
					// XXX TODO: Need to generalize in the metadata somehow.
					this.addHeaderScript(url, {
						"data-dojo-config": JSON.stringify(config).slice(1, -1).replace(/"/g, "'")
					});
	
					// TODO: these two dependencies should be part of widget or library metadata
					promises.push(this.addJavaScriptModule("dijit/dijit", true, true));
					promises.push(this.addJavaScriptModule("dojo/parser", true, true));
				}else{
					this.addHeaderScript(url);
				}
			}
		}

		return all(promises);
	},

	_reRequire: /\brequire\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/,
	_reModuleId: /[\w.\/]+/g,

	addJavaScriptModule: function(mid, doUpdateModel, skipDomUpdate) {
		var promise = new Deferred();
		if (!skipDomUpdate) {
			this.getGlobal().require([mid], function(module) {
				promise.resolve(module);
			});
		} else {
			promise.resolve();
		}

		if (doUpdateModel) {
			if (!this._requireHtmlElem) {
				// find a script element which has a 'require' call
				var head = this.getDocumentElement().getChildElement('head'),
					found;

				found = head.getChildElements('script').some(function(child) {
					var script = child.find({elementType: 'HTMLText'}, true);
					if (script) {
						if (this._reRequire.test(script.getText())) {
							// found suitable `require` block
							this._requireHtmlElem = child;
							return true; // break 'some' loop
						}
					}
				}, this);

				if (!found) {
					// no such element exists yet; create now
					this._requireHtmlElem = this.addHeaderScriptText('require(["' + mid + '"]);\n');
					return promise;
				}
			}

			// insert new `mid` into array of existing `require`
			var scriptText = this._requireHtmlElem.find({elementType: 'HTMLText'}, true),
				text = scriptText.getText(),
				m = text.match(this._reRequire),
				arr = m[1].match(this._reModuleId);
			// check for duplicate
			if (arr.indexOf(mid) === -1) {
				arr.push(mid);
				text = text.replace(this._reRequire, 'require(' + JSON.stringify(arr, null, '  ') + ')');
				scriptText.setText(text);
				// XXX For some reason, <script> text is handled differently in the
				//   Model than that of other elements.  I think I only need to call
				//   setScript(), but the correct process should be to just update
				//   HTMLText. See issue #1350.
				scriptText.parent.setScript(text);
			}
		}

		return promise;
	},

	addJavaScriptText: function(text, doUpdateModel, skipDomUpdate) {
		/* run the requires if there is an iframe */
		if (! skipDomUpdate) {
			try {
				this.getGlobal()['eval'](text);
			} catch(e) {
				var len = text.length;
				console.error("eval of \"" + text.substr(0, 20) + (len > 20 ? "..." : "") +
						"\" failed");
			}
		}
		if (doUpdateModel) {
			this.addHeaderScriptText(text);
		}
	},

	// add script URL to HEAD
	addHeaderScript: function(url, attributes) {
		// look for duplicates
		/*
		var found = dojo.some(this.getHeader().scripts, function(val) {
			return val === url;
		});
		if (found) {
			return;
		}
		*/
		
		var script = new HTMLElement('script');
		script.addAttribute('type', 'text/javascript');
		script.addAttribute('src', url);
		
		if (attributes) {
			for (var name in attributes) {
				script.addAttribute(name, attributes[name]);		
			}
		}
		
		var head = this.getDocumentElement().getChildElement('head');
		head.addChild(script);
		
		//this.getHeader().scripts.push(url);
	},


	/**
	 * Add inline JavaScript to <head>.
	 * 
	 * This function looks for the last inline JS element in <head> which comes
	 * after the last <script src='...'> element.  If a script URL exists after
	 * the last inline JS element, or if no inline JS element exists, then we
	 * create one.
	 * 
	 * @param {string} text inline JS to add
	 * @return {HTMLElement} the element which contains added script
	 */
	addHeaderScriptText: function(text) {
		var head = this.getDocumentElement().getChildElement('head'),
			scriptText,
			children = head.children,
			i,
			node;

		// reverse search; cannot use getChildElements, et al
		for (i = children.length - 1; i >= 0; i--) {
			node = children[i];
			if (node.elementType === 'HTMLElement' && node.tag === 'script') {
				// Script element will either have inline script or a URL.
				// If the latter, this breaks with 'inlineScript' equal to 'null'
				// and a new inline script is created later.  This is done so
				// that new inline script comes after the latest added JS file.
				scriptText = node.find({elementType: 'HTMLText'}, true);
				break;
			}
		}

		if (!scriptText) {
			// create a new script element
			var script = new HTMLElement('script');
			script.addAttribute('type', 'text/javascript');
			script.script = "";
			head.addChild(script);

			scriptText = new HTMLText();
			script.addChild(scriptText);
		}

		var oldText = scriptText.getText();
		if (oldText.indexOf(text) === -1) {
			var newText = oldText + '\n' + text;
			scriptText.setText(oldText + '\n' + text);
			// XXX For some reason, <script> text is handled differently in the
			//   Model than that of other elements.  I think I only need to call
			//   setScript(), but the correct process should be to just update
			//   HTMLText. See issue #1350.
			scriptText.parent.setScript(oldText + '\n' + text);
		}

		return scriptText.parent; // HTMLElement obj
	},
	
	/**
	 * Significant attributes for HTML elements; used for matching duplicates.
	 * If an element isn't listed here, defaults to 'src'.
	 * 
	 * @static
	 */
	_significantAttrs: {
		link: 'href',
		meta: 'name'
	},
	
	/**
	 * Add element to <head> of document.  Modeled on domConstruct.create().
	 */
	_addHeadElement: function(tag, attrs/*, refNode, pos*/, allowDup) {
		var head = this.getDocumentElement().getChildElement('head');
		
		if (!allowDup) {
			// Does <head> already have an element that matches the given
			// element?  Only match based on significant attribute.  For
			// example, a <script> element will match if its 'src' attr is the
			// same as the incoming attr.  Same goes for <meta> and its 'name'
			// attr.
			var sigAttr = this._significantAttrs[tag] || 'src';
			var found = head.getChildElements(tag).some(function(elem) {
				return elem.getAttribute(sigAttr) === attrs[sigAttr];
			});
			if (found) {
				return;
			}
		}
		
		// add to Model...
		var elem = new HTMLElement(tag);
		for (var name in attrs) if (attrs.hasOwnProperty(name)) {
			elem.addAttribute(name, attrs[name]);
		}
		head.addChild(elem);
		
		// add to DOM...
		dojo.withGlobal(this.getGlobal(), function() {
			domConstruct.create(tag, attrs, query('head')[0]);
		});
	},
	
	/**
	 * Remove element from <head> that matches given tag and attributes.
	 */
	_removeHeadElement: function(tag, attrs) {
		var head = this.getDocumentElement().getChildElement('head');
		
		// remove from Model...
		head.getChildElements(tag).some(function(elem) {
			var found = true;
			for (var name in attrs) if (attrs.hasOwnProperty(name)) {
				if (elem.getAttribute(name) !== attrs[name]) {
					found = false;
					break;
				}
			}
			
			if (found) {
				head.removeChild(elem);
				return true;	// break some() iteration
			}
		});
		
		// remove from DOM...
		dojo.withGlobal(this.getGlobal(), function() {
			var queryStr = tag;
			for (var name in attrs) {
				if (attrs.hasOwnProperty(name)) {
					queryStr += '[' + name + '="' + attrs[name] + '"]';
				}
			}
			query(queryStr).orphan();
		});
	},

	_getDojoJsElem: function() {
		if (!this._dojoScriptElem) {
			// find and cache the HTMLElement which points to dojo.js
			var head = this.getDocumentElement().getChildElement('head'),
				found = head.getChildElements('script').some(function(child) {
					if (/\/dojo.js$/.test(child.getAttribute('src'))) {
						this._dojoScriptElem = child;
						return true; // break 'some' loop
					}
				}, this);
			if (!found) {
				// serious problems! dojo.js not found
				console.error('"dojo.js" script element not found!');
				return;
			}
		}

		return this._dojoScriptElem;
	},

	/**
	 * Update the value of `data-dojo-config` attribute in the model element
	 * pointing to "dojo.js".  Properties in `data` overwrite existing value;
	 * null values remove properties from `data-dojo-config`.
	 * 
	 * Note: This only updates the model. In order for the change to take in
	 * the VE, you will need to refresh the iframe from the updated source.
	 * 
	 * @param  {Object} data
	 */
	_updateDojoConfig: function(data) {
		this.close(); // return any singletons for CSSFiles
		var dojoScript = this._getDojoJsElem(),
			djConfig = dojoScript.getAttribute('data-dojo-config');
		djConfig = djConfig ? require.eval("({ " + djConfig + " })", "data-dojo-config") : {};
		var regEx = "";
		/*
		 * This is nasty, but djConfig.mblLoadCompatPattern is a regexp and if you attempt to 
		 * JSON.stringfy a regexp you get "{}" not very useful
		 * So we need to use toString to get the string value of the regexp so 
		 * we can put it back later
		 */
		if (djConfig.mblLoadCompatPattern){
			regEx = ", mblLoadCompatPattern: " + djConfig.mblLoadCompatPattern.toString();
			delete djConfig.mblLoadCompatPattern;
		}
		// If `prop` has a value, copy it into djConfig, overwriting existing
		// value.  If `prop` is `null`, then delete from djConfig.
		
		for (var prop in data) {
			 if (prop == 'mblLoadCompatPattern'){
				if (data[prop] === null){
					// we already deleted from djConfig above 
					// just clear the regex we are going to put back
					regEx = "";
				} else {
				/*
				 * Note above about stringify regexp
				 */
					regEx = ", 'mblLoadCompatPattern': "+ data[prop];
				}
					
			} else if (data[prop] === null) {
				delete djConfig[prop];
			} else {
				djConfig[prop] = data[prop];
			}
		}
		var str = JSON.stringify(djConfig).slice(1, -1).replace(/"/g, "'");
		/*
		 * This is where we add the regexp string to the stringified object.
		 * Read the note above about why this is needed.
		 */
		str += regEx;
		dojoScript.setAttribute('data-dojo-config', str);
	},

////////////////////////////////////////////////////////////////////////////////
// XXX move this section to Dojo library?
	_addCssForDevice: function(localDevice, themeMap, context) {
		for (var i = 0, len = themeMap.length; i < len; i++) {
			var item = themeMap[i];
			if (item[0] === localDevice || item[0] === '.*'){
				if (!this.themeCssFiles) {
					this.themeCssFiles = [];
				}

				var cssFiles = item[2];
				this.themeCssFiles = this.themeCssFiles.concat(cssFiles);

				this._themePath = new Path(this.visualEditor.fileName);
				// Connect to the css files, so we can update the canvas when
				// the model changes.
				this._getCssFiles().forEach(function(file) {
					this._loadedCSSConnects.push(connect.connect(file, 'onChange', this, '_themeChange'));
				}, this);

				break;
			}
		}
	},

	_configDojoxMobile: function(loading) {
		// dojox.mobile.configDeviceTheme should run only the first time dojox.mobile.deviceTheme runs, to establish
		// monitoring of which stylesheets get loaded for a given theme

		try {
			var innerRequire = this.getGlobal()['require'],
				dm = innerRequire('dojox/mobile'),
				deviceTheme = innerRequire('dojox/mobile/deviceTheme'),
				djConfig = this.getGlobal().dojo.config,  // TODO: use require
				djConfigModel = this._getDojoJsElem().getAttribute('data-dojo-config'),
				ua = djConfig.mblUserAgent || 'none',
				themeMap,
				themeFiles,
				mblLoadCompatPattern;

			djConfigModel = djConfigModel ? require.eval("({ " + djConfigModel + " })", "data-dojo-config") : {};
			themeMap = djConfigModel.themeMap;
			themeFiles = djConfigModel.mblThemeFiles;
			mblLoadCompatPattern = djConfigModel.mblLoadCompatPattern;
			
			// clear dynamic CSS
			delete this.themeCssFiles;
			delete this.cssFiles;

			// load CSS files specified by `themeMap`
			if (!themeMap) {
				// load defaults if not defined in file
				themeMap = Theme.getDojoxMobileThemeMap(this, dojo.clone(Theme.dojoMobileDefault));
				themeFiles = [];
				// Add the theme path so dojo can locate the *-compat.css files, if any
				//mblLoadCompatPattern=/\/themes\/.*\.css$/;
				var themePath = Theme.getThemeLocation().toString().replace(/\//g,'\\/');
				//var re = new RegExp('\/'+themePath+'\/.*\.css$');
				var re = new RegExp(''); //*-compat files not used
				mblLoadCompatPattern=re;
			}
			this._addCssForDevice(ua, themeMap, this);
			if (!Theme.themeMapsEqual(deviceTheme.themeMap, themeMap)) {
				loading = false;
				deviceTheme.themeMap = themeMap;		// djConfig.themeMap = themeMap;
			}
			
			if (themeFiles) {
				djConfig.mblThemeFiles = themeFiles;
			} else {
				delete djConfig.mblThemeFiles;
			}
			if (mblLoadCompatPattern) {
				djConfig.mblLoadCompatPattern = mblLoadCompatPattern;
				dm.loadCompatPattern = mblLoadCompatPattern;
			} else {
				delete djConfig.mblLoadCompatPattern;
				// put the dojo defalut back
				dm.loadCompatPattern = /\/mobile\/themes\/.*\.css$/;
			}

			if (this._selection) {
				// forces style palette to update cascade rules
				this.onSelectionChange(this._selection);
			}
			if (!loading){
				// if we are loading the reqire of deviceTheme will have already done this				
				deviceTheme.loadDeviceTheme(ua);
			}
		} catch(e) {
			// dojox/mobile wasn't loaded
		}

/*		// Set mobile device CSS files
		var mobileDevice = this.getMobileDevice();
		if (mobileDevice) {
			this.setMobileDevice(mobileDevice);
			this.visualEditor.setDevice(mobileDevice, true);
		}

		// Check mobile orientation
		var orientation = this.getMobileOrientation();
		if (orientation) {
			this.visualEditor.setOrientation(orientation);
		}*/
	},
// XXX end "move this section to Dojo library"
////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * Perform any visual updates in response to mousemove event while performing a
	 * drag operation on the visual canvas.
	 * @param {object} params  object with following properties:
	 * 		[array{object}] widgets  Array of widgets being dragged (can be empty array)
	 *      {object|array{object}} data  For widget being dragged, either {type:<widgettype>} or array of similar objects
	 *      {object} eventTarget  Node (usually, Element) that is current event.target (ie, node under mouse)
	 *      {object} position  x,y properties hold current mouse location
	 *      {boolean} absolute  true if current widget will be positioned absolutely
	 *      {object} currentParent  if provided, then current parent widget for thing being dragged
	 * 		{object} rect  l,t,w,h properties define rectangle being dragged around
	 * 		{boolean} doSnapLinesX  whether to show dynamic snap lines (x-axis)
	 * 		{boolean} doSnapLinesY  whether to show dynamic snap lines (y-axis)
	 * 		{boolean} doFindParentsXY  whether to show candidate parent widgets
	 * 		{boolean} doCursor  whether to show drop cursor (when dropping using flow layout)
	 * 		{string|undefined} beforeAfter  either 'before' or 'after' or undefined (which means default behavior)
	 * 		{string|array} widgetType  widget type (e.g., 'dijit.form.Button')
	 */
	dragMoveUpdate: function(params) {
		var context = this,
			cp = this._chooseParent,
			widgets = params.widgets,
			data = params.data,
//			eventTarget = params.eventTarget,
			position = params.position,
			absolute = params.absolute,
			currentParent = params.currentParent,
			rect = params.rect,
			doSnapLinesX = params.doSnapLinesX,
			doSnapLinesY = params.doSnapLinesY,
			doFindParentsXY = params.doFindParentsXY,
			doCursor = params.doCursor,
			beforeAfter = params.beforeAfter,
			widgetType = dojo.isArray(data) ? data[0].type : data.type;

		// inner function that gets called recurively for each widget in document
		// The "this" object for this function is the Context object
		var _updateThisWidget = function(widget){
			if(widgets && widgets.indexOf(widget) >= 0){
				// Drag operations shouldn't apply to any of the widget being dragged
				return;
			}
			
			var innerStyle = this.getGlobal()['require']('dojo/dom-style'),
				computedStyle = innerStyle.get(widget.domNode);

			if(doSnapLinesX || doSnapLinesY){
				Snap.findSnapOpportunities(this, widget, computedStyle, doSnapLinesX, doSnapLinesY);
			}
			cp.findParentsXY({data:data, widget:widget, absolute:absolute, position:position, doCursor:doCursor, beforeAfter:beforeAfter});
			dojo.forEach(widget.getChildren(), function(w){
				_updateThisWidget.apply(context, [w]);
			});
		};
		
		if(doSnapLinesX || doSnapLinesY){
			doSnapLines = Snap.updateSnapLinesBeforeTraversal(this, rect);
		}
		var differentXY = cp.findParentsXYBeforeTraversal(params);
		// Traverse all widgets, which will result in updates to snap lines and to 
		// the visual popup showing possible parent widgets 
		_updateThisWidget.apply(context, [this.rootWidget]);
		if(doSnapLinesX || doSnapLinesY){
			Snap.updateSnapLinesAfterTraversal(this);
		}
		cp.findParentsXYAfterTraversal(params);
		if(differentXY){
			cp.dragUpdateCandidateParents({widgetType:widgetType,
					showCandidateParents:doFindParentsXY, 
					doCursor:doCursor, 
					beforeAfter:beforeAfter, 
					absolute:absolute, 
					currentParent:currentParent});
			cp.findParentsXYCleanup(params);
		}
	},
	
	/**
	 * Cleanups after completing drag operations.
	 */
	dragMoveCleanup: function() {
		Snap.clearSnapLines(this);
		this._chooseParent.cleanup(this);
	},

	registerSceneManager: function(sceneManager){
	
		if(!sceneManager || !sceneManager.id){
			return;
		}
		var id = sceneManager.id;
		if(!this.sceneManagers[id]){
			this.sceneManagers[id] = sceneManager;
			connect.publish('/davinci/ui/context/registerSceneManager', [sceneManager]);
		}
	},

	onCommandStackExecute: function() {
		this.clearCachedWidgetBounds();
		if(this.editor && this.editor.editorContainer && this.editor.editorContainer.updateToolbars){
			this.editor.editorContainer.updateToolbars();
		}
		//Update all of the highlights that show which widgets appear in a custom state
		// but which are actually visible on the base state and "shining through" to custom state
		States.updateHighlightsBaseStateWidgets(this);
	},

	/**
	 * Called by any commands that can causes widgets to be added or deleted.
	 */
	widgetAddedOrDeleted: function(resetEverything){
		var helper = Theme.getHelper(this.getTheme());
		if(helper && helper.widgetAddedOrDeleted){
			helper.widgetAddedOrDeleted(this, resetEverything);
		} else if (helper && helper.then){ // it might not be loaded yet so check for a deferred
	       	 helper.then(function(result){
	       		 if (result.helper) {
	       			 this.theme.helper = result.helper;
	       			 if (result.helper.widgetAddedOrDeleted){
	       				 result.helper.widgetAddedOrDeleted(this, resetEverything); 
	       			 }
	       		 }
	       	 }.bind(this));
		}
	},

	WIDGET_MODIFIED: 0,
	WIDGET_ADDED: 1,
	WIDGET_REMOVED: 2,
	WIDGET_REPARENTED: 3,
	WIDGET_ID_CHANGED: 4,
	/**
	 * Called by any command that can causes widgets to be added/deleted/moved/changed
	 *
	 * @param {number} type  0 - modified, 1 - added, 2 - removed
	*/
	widgetChanged: function(type, widget) {
		if(type == 1){
			this.widgetHash[widget.id] = widget;
		}else if(type == 2){
			delete this.widgetHash[widget.id];
		}
	},

	resizeAllWidgets: function () {
		this.getTopWidgets().forEach(function (widget) {
			if (widget.resize) {
				widget.resize();
			}
		});
	},
	
	hasDirtyResources: function(){
		if(this._htmlFileDirtyOnLoad){}
		var dirty = false;
		var baseRes = systemResource.findResource(this.getDocumentLocation()); // theme editors don't have a base resouce. 
		if (baseRes){
			dirty = baseRes.isDirty();
		}
		
		if(dirty) {
			return dirty;
		}
		var visitor = {
			visit: function(node){
				if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){
					dirty = true;
				}
				return dirty;
			}
		};
		
		this.getModel().visit(visitor);

		if (!dirty) {
			dirty = this.dirtyDynamicCssFiles(this.cssFiles);
		}

		return dirty;
	},
	
	/**
	 * Returns an array of all widgets in the current document. 
	 * In the returned result, parents are listed before their children.
	 */
	getAllWidgets: function(){
		var result = [];
		var find = function(widget) {
			result.push(widget);
			widget.getChildren().forEach(function(child) {
				find(child);
			});
		};
		if(this.rootWidget){
			find(this.rootWidget);
		}
		return result;
	},
	
	/**
	 * Returns the container node for all of the focus chrome DIVs
	 */
	getFocusContainer: function(){
		return document.getElementById('focusContainer');
	},
	
	/**
	 * Clear any cached widget bounds
	 */
	clearCachedWidgetBounds: function(){
		this.getAllWidgets().forEach(function(widget) {
			var domNode = widget.domNode;
			if (domNode) {
				GeomUtils.clearGeomCache(domNode);
			}			
		});
	},
	
	/**
	 * Reorder a list of widgets to preserve sibling order for widgets in the list
	 */
	reorderPreserveSiblingOrder: function(origArray){
		var newArray = [].concat(origArray); // shallow copy
		var j=0;
		while(j < (newArray.length - 1)){
			var refWidget = newArray[j];
			var refParent = refWidget.getParent();
			var k = j + 1;
			var adjacentSiblings = false;
			while(k < newArray.length){
				var parent = newArray[k].getParent();
				if(parent == refParent){
					adjacentSiblings = true;
					k++;
				}else{
					break;
				}
			}
			if(adjacentSiblings){
				var children = refParent.getChildren();
				for(var m = (k-2); m >= j; m--){
					for(var n = j; n <= m; n++){
						var index1 = children.indexOf(newArray[n]);
						var index2 = children.indexOf(newArray[n+1]);
						if(index1 > index2){
							var temp = newArray[n+1];
							newArray[n+1] = newArray[n];
							newArray[n] = temp;
						}
					}
				}
			}
			j = k;
		}
		return newArray;
	},
	
	_updateWidgetHash: function(){
		this.widgetHash = {};
		this.getAllWidgets().forEach(function(widget) {
			var id = widget.id;
			if(id){
				this.widgetHash[id] = widget;
			}
		}, this);
	},

});

});
