define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dojo/query",
	"dojo/_base/Deferred",
	"dojo/DeferredList",
	"dojo/_base/connect",
	"dojo/window",
    'system/resource',
    "../UserActivityMonitor",
    "../Theme",
    "./ThemeModifier",
	"../commands/CommandStack",
	"./commands/ChangeThemeCommand",
	"./tools/SelectTool",
	"../model/Path",
	"../Workbench",
	"./widget",
	"./Focus",
	"../library",
	"./metadata",
	"./ChooseParent",
	"./Snap",
	"./HTMLWidget",
	"../html/CSSModel", // shorthands
	"../html/CSSRule",
	"../html/CSSImport",
	"../html/HTMLElement",
	"../html/HTMLText",
	"../workbench/Preferences",
	"preview/silhouetteiframe",
	"davinci/ve/utils/GeomUtils",
	"dojo/text!./newfile.template.html",
	"davinci/model/Factory", // FIXME: needed for document.css M6 hack
	"dojox/html/_base"	// for dojox.html.evalInGlobal	
], function(
	declare,
	lang,
	domquery,
	Deferred,
	DeferredList,
	connect,
	windowUtils,
	Resource,
	UserActivityMonitor,
	Theme,
	ThemeModifier,
	CommandStack,
	ChangeThemeCommand,
	SelectTool,
	Path,
	Workbench,
	Widget,
	Focus,
	Library,
	metadata,
	ChooseParent,
	Snap,
	HTMLWidget,
	CSSModel,
	CSSRule,
	CSSImport,
	HTMLElement,
	HTMLText,
	Preferences,
	Silhouette,
	GeomUtils,
	newFileTemplate,
	Factory
) {

davinci.ve._preferences = {}; //FIXME: belongs in another object with a proper dependency
var MOBILE_DEV_ATTR = 'data-maqetta-device',
	PREF_LAYOUT_ATTR = 'dvFlowLayout',
	MOBILE_ORIENT_ATTR = 'data-maqetta-deviceorientation';

return declare("davinci.ve.Context", [ThemeModifier], {

	// comma-separated list of modules to load in the iframe
	_bootstrapModules: "dijit/dijit",
	_configProps: {}, //FIXME: shouldn't be shared on prototype if we're going to use this for dynamic properties
	_contextCount: 0,

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
		this._id = "_edit_context_" + this._contextCount++;
		this.widgetHash = {};
		
		lang.mixin(this, args);

		if(dojo.isString(this.containerNode)){
			this.containerNode = dijit.byId(this.containerNode);
		}

		this.hostNode = this.containerNode;

		this._commandStack = new CommandStack(this);
		this._defaultTool = new SelectTool();

		this._widgetIds = [];
		this._objectIds = [];
		this._widgets = [];
		this._chooseParent = new ChooseParent({context:this});
		this.sceneManagers = {};

	    // Invoke each library's onDocInit function, if library has such a function.
		var libraries = metadata.getLibrary();	// No argument => return all libraries
		for(var libId in libraries){
			var library = metadata.getLibrary(libId);
			args = [this];
			metadata.invokeCallback(library, 'onDocInit', args);
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
		var path = this.getModel().fileName;
		return new Path(path);
	},


	
	activate: function(){
		if(this.isActive()){
			return;
		}

		this.loadStyleSheet(this._contentStyleSheet);
		this._attachAll();
		this._restoreStates();
		// The initialization of states object for BODY happens as part of user document onload process,
		// which sometimes happens after context loaded event. So, not good enough for StatesView
		// to listen to context/loaded event - has to also listen for context/statesLoaded.
		this._statesLoaded = true;
		dojo.publish('/davinci/ui/context/statesLoaded', [this]);
		this._onLoadHelpers();

		var containerNode = this.getContainerNode();
		dojo.addClass(containerNode, "editContextContainer");
		
		this._connects = [
			dojo.connect(this._commandStack, "onExecute", this, "onCommandStackExecute"),
			// each time the command stack executes, onContentChange sets the focus, which has side-effects
			// defer this until the stack unwinds in case a caller we don't control iterates on multiple commands
			dojo.connect(this._commandStack, "onExecute", function(){setTimeout(this.onContentChange.bind(this), 0);}.bind(this)),
			dojo.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
			dojo.connect(this.getDocument(), "onkeyup", this, "onKeyUp"),
			dojo.connect(containerNode, "ondblclick", this, "onDblClick"),
			dojo.connect(containerNode, "onmousedown", this, "onMouseDown"),
			dojo.connect(containerNode, "onmousemove", this, "onMouseMove"),
			dojo.connect(containerNode, "onmouseup", this, "onMouseUp"),
			dojo.connect(containerNode, "onmouseover", this, "onMouseOver"),
			dojo.connect(containerNode, "onmouseout", this, "onMouseOut")
		];
		this.setActiveTool();
	},

	deactivate: function(){
		if(!this.isActive()){
			return;
		}

		dojo.forEach(this._connects, dojo.disconnect);
		this._connects = undefined;
		dojo.forEach(this._focuses, function(f){
			f._connected = false;
		});
		this._commandStack.clear();
		if(this._activeTool){
			this._activeTool.deactivate();
			delete this._activeTool;
		}
		var containerNode = this.getContainerNode();
		this._menu.unBindDomNode(containerNode);

		this.select(null);
		dojo.removeClass(containerNode, "editContextContainer");
		dojo.forEach(this.getTopWidgets(), this.detach, this);
		this.unloadStyleSheet(this._contentStyleSheet);
	},

	attach: function(widget){
		if(!widget){
			return;
		}
		if(widget._edit_focus){
			return;
		}
		var type = widget.declaredClass;

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
				widget.type = widget.declaredClass;
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
	
	getBodyId: function(){
		/* return the ID of the body element */
		
		var bodyNode = this.model.find({elementType:'HTMLElement', tag:'body'}, true),
			id = bodyNode.find({elementType:'HTMLAttribute', name:'id'}, true);
		return id.value;
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


	getSource: function(options){
		return this._srcDocument.getText();
	},

	getDocumentElement: function(){
		return this._srcDocument.getDocumentElement();
	},

	getDocumentLocation: function(options){
		return this._srcDocument.fileName;
	},

	getBaseResource: function(options){
		return system.resource.findResource(this.getDocumentLocation());
	},

	getLibraryBase: function(id, version){
		return Library.getLibRoot(id,version, this.getBase()) || "";
	},

	loadRequires: function(type, updateSrc, doUpdateModelDojoRequires, skipDomUpdate) {
		// this method is used heavily in RebuildPage.js, so please watch out when changing  API!

		if (!type) {
			return false;
		}
		
		var requires = metadata.query(type, "require");
		if (!requires) {
			return true;
		}

		var libraries = metadata.query(type, 'library'),
			libs = {},
			context = this,
			succeeded;

		function _loadLibrary(libId, lib) {
			if (libs.hasOwnProperty(libId)) {
				return true;
			}

			// calculate base library path, used in loading relative required
			// resources
			var ver = metadata.getLibrary(libId).version || lib.version,
				root = context.getLibraryBase(libId, ver);
			
			if (root == null /*empty string OK here, but null isn't. */) {
				console.error("No library found for name = '" + libId +	"' version = '" + ver + "'");
				return false;
			}

			// store path
			libs[libId] = new Path(context.getBase()).append(root);

			// If 'library' element points to the main library JS (rather than
			// just base directory), then load that file now.
			if (lib.src.substr(-3) === '.js') {
				// XXX For now, lop off relative bits and use remainder as main
				// library file.  In the future, we should use info from
				// package.json and library.js to find out what part of this
				// path is the piece we're interested in.
				var m = lib.src.match(/((?:\.\.\/)*)(.*)/);
						// m[1] => relative path
						// m[2] => main library JS file
				_loadJSFile(libId, m[2]);
			}

			return true;
		}

		function _getResourcePath(libId, src) {
			return libs[libId].append(src).relativeTo(context.getPath(), true).toString();
		}

		function _loadJSFile(libId, src) {
			context.addJavaScriptSrc(_getResourcePath(libId, src), updateSrc, src, skipDomUpdate);
		}

		// first load any referenced libraries
		for (var libId in libraries) {
			if (libraries.hasOwnProperty(libId)) {
				succeeded = _loadLibrary(libId, libraries[libId]);
				if (! succeeded) {
					return false;
				}
			}
		}

		// next, load the require statements
		return requires.every(function(r) {
			// If this require belongs under a library, load library file first
			// (if necessary).
			if (r.$library) {
				if (! _loadLibrary(r.$library)) {
					return false; // break 'every' loop
				}
			}

			switch (r.type) {
				case "javascript":
					if (r.src) {
						_loadJSFile(r.$library, r.src);
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
						this.addJavaScriptModule(r.src, updateSrc || doUpdateModelDojoRequires,
								skipDomUpdate);
					} else {
						console.error("Inline 'javascript-module' not handled");
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
						console.error("Inline CSS not handled");
					}
					break;
				
				case "image":
					// Allow but ignore type=image
					break;
					
				default:
					console.error("Unhandled metadata resource type '" + r.type +
							"' for widget '" + type + "'");
			}
			return true;
		}, this);
	},

	_getWidgetFolder: function(){
		
		var base = this.getBase();
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs.widgetFolder){
			prefs.widgetFolder = "WebContent/widgets";
			Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
	
		var folder = prefs.widgetFolder;
		while(folder.length>1 && (folder.charAt(0)=="." || folder.charAt(0)=="/")) {
			folder = folder.substring(1);
		}
		return folder;
	},

	_require: function(module){
		try{
			return this.getGlobal()["require"]([module.replace(/\./g, "/")]);
		}catch(e){
			console.error("FAILED: Context.js _require failure for module="+module);
			throw e;
		}
	},
	
	/**
	 * Retrieve mobile device from Model.
	 * @returns {?string} mobile device name
	 */
	getMobileDevice: function() {
        var bodyElement = this.getDocumentElement().getChildElement("body");
        return bodyElement.getAttribute(MOBILE_DEV_ATTR);
    },

    /**
     * Sets mobile device in Model.
     * @param device {?string} device name
     */
    setMobileDevice: function(device) {
    	this.getDojo().config.mblUserAgent = /* remove this line for Dojo 1.7 final */
    	this.getGlobal()["require"](["dojo/_base/config"]).mblUserAgent =
    			Silhouette.getMobileTheme(device + '.svg');
    	var bodyElement = this.getDocumentElement().getChildElement("body");
        if (! device || device === 'none') {
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
        if (oldDevice === device) {
            return;
        }
        this.close(); //// return any singletons for CSSFiles
        this.setMobileDevice(device);

		// dojox.mobile specific CSS file handling

        var dm = lang.getObject("dojox.mobile", false, this.getGlobal());
        if(dm && dm.loadDeviceTheme) {
        	dm.loadDeviceTheme(Silhouette.getMobileTheme(device + '.svg'));
        }
	},

	/**
  	* Retrieves the mobile orientation.
  	* @returns {?string} orientation
  	*/
	getMobileOrientation: function() {
		var bodyElement = this.getDocumentElement().getChildElement("body");
		return bodyElement.getAttribute(MOBILE_ORIENT_ATTR);
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
            var theme = this.loadThemeMeta(this._srcDocument);
            if (theme) { // wdr #1024
                this._themeUrl = theme.themeUrl;
                this._themeMetaCache = theme.themeMetaCache;
                this.theme = theme.theme;
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
	
	loadThemeMeta: function(model){
		// try to find the theme using path magic

		var ro = metadata.loadThemeMeta(model);
		//this.editor._visualChanged(); // do not know why we are calling this handler method inline
		return ro;
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
	
	getResourcePath: function() {
		return this.getFullResourcePath().removeLastSegments(1);
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
	
	getAppCssRelativeFile: function(){
		if(!this._appCssRelativeFile){
			var currentHtmlFilePath = this.getFullResourcePath();
			var currentHtmlFolderPath = currentHtmlFilePath.getParentPath();
			var base = new Path(Workbench.getProject());
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			var appCssFolderPath;
			if(prefs.webContentFolder!==null && prefs.webContentFolder!==""){
				appCssFolderPath = base.append(prefs.webContentFolder);
			}else{
				appCssFolderPath = base;
			}
			var appCssFilePath = appCssFolderPath.append('app.css');
			this._appCssRelativeFile = appCssFilePath.relativeTo(currentHtmlFolderPath).toString();
		}
		return this._appCssRelativeFile;
	},
	
    /* ensures the file has a valid theme.  Adds the users default if its not there alread */
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
    	var imports = model.find({elementType:'CSSImport'});
		
		
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
		var filePath = defaultTheme.file.getPath();
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
				windowUtils.get(doc).require("dijit/registry")._destroyAll();				
			}
		}

		// Get the helper before creating the IFRAME, or bad things happen in FF
		var helper = Theme.getHelper(this.visualEditor.theme);

		this._srcDocument=source;
		
		// determine if it's the theme editor loading
		if (!source.themeCssFiles) { // css files need to be added to doc before body content
			// ensure the top level body deps are met (ie. maqetta.js, states.js and app.css)
			this.loadRequires("html.body", true /*updateSrc*/, false /*doUpdateModelDojoRequires*/,
					true /*skipDomUpdate*/ );
			this.addModeledStyleSheet(this.getAppCssRelativeFile(), true /*skipDomUpdate*/);
			// make sure this file has a valid/good theme
			this.loadTheme(newHtmlParams);
		}

		//FIXME: Need to add logic for initial themes and device size.
		if(newHtmlParams){
			var modelBodyElement = source.getDocumentElement().getChildElement("body");
			modelBodyElement.setAttribute(MOBILE_DEV_ATTR, newHtmlParams.device);
			modelBodyElement.setAttribute(PREF_LAYOUT_ATTR, newHtmlParams.flowlayout);
			if (newHtmlParams.themeSet){
    			var cmd = new ChangeThemeCommand(newHtmlParams.themeSet, this);
    			cmd._dojoxMobileAddTheme(this, newHtmlParams.themeSet.mobileTheme, true); // new file
			}
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
			dojo.query(".loading", this.frameNode.parentNode).orphan();

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
				// pull Dojo path from installed libs, if available
				dojo.some(Library.getUserLibs(resourceBase.toString()), function(lib) {
					if (lib.id === "dojo") {
						var fullDojoPath = new Path(this.getBase()).append(lib.root).append("dojo/dojo.js");
						dojoUrl = fullDojoPath.relativeTo(this.getPath(),true).toString();
						//dojoUrl = new Path(this.relativePrefix).append(lib.root).append("dojo/dojo.js").toString();
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
			
			var containerNode = this.containerNode;
			containerNode.style.overflow = "hidden";
			var frame = dojo.create("iframe", this.iframeattrs, containerNode);
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
				lang.mixin(config, this._configProps);
				this._getDojoScriptValues(config, subs);

				if (this._bootstrapModules) {
					var mods = '';
					this._bootstrapModules.split(',').forEach(function(mod) {
						mods += ',\'' + mod + '\'';
					})
					subs.additionalModules = mods;
				}
			}

			if (helper && helper.getHeadImports){
			    subs.themeHeadImports = helper.getHeadImports(this.visualEditor.theme);
			} else if(source.themeCssFiles) { // css files need to be added to doc before body content
				subs.themeCssFiles = '' +
				source.themeCssFiles.map(function(file) {
					return '<link rel="stylesheet" type="text/css" href="' + file + '">';
				}).join() +
				'';
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
					this._configDojoxMobile();

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
			dojo.connect(doc.documentElement, "onkeypress", function(e){
				if(e.charOrCode==8){
					window.davinciBackspaceKeyTime = win.davinciBackspaceKeyTime = Date.now();
				}
			});	
			/*win.onbeforeunload = function (e) {//The call in Runtime.js seems to take precedence over this one
				var time = new Date().getTime();
				var shouldDisplay = time - win.davinciBackspaceKeyTime < 100;
				if (shouldDisplay) {
					var message = "Careful! You are about to leave Maqetta.";
					// Mozilla/IE
					// Are you sure you want to navigate away from this page?
					// Careful! You will lose any unsaved work if you leave this page now.
					// Press OK to continue, or Cancel to stay on the current page.
					if (e = e || win.event) {
						e.returnValue = message;
					}
					// Webkit
					// Careful! You will lose any unsaved work if you leave this page now.
					// [Leave this Page] [Stay on this Page]
					return message;
				}
			};*/
		}
	},

	_continueLoading: function(data, callback, callbackData, scope) {
		var promise, failureInfo = {};
		try {
			if (callbackData instanceof Error) {
				throw callbackData;
			}

			promise = this._setSourceData(data).then(function() {
			}, function(error) {
				failureInfo.errorMessage = "Unable to parse HTML source.  See console for error.  Please switch to \"Display Source\" mode and correct the error."; // FIXME: i18n
				console.error(error.stack || error.message);
			});
		} catch(e) {
			// recreate the Error since we crossed frames
			failureInfo = new Error(e.message, e.fileName, e.lineNumber);
			lang.mixin(failureInfo, e);
		} finally {
			if (callback) {
				if (promise) {
					promise.then(function(){
						callback.call((scope || this), failureInfo);
					}.bind(this));
				} else {
					// FIXME: caller doesn't handle error data?
					callback.call((scope || this), failureInfo);
				}
			}
		}
	},

	_getLoaderPackages: function() {
		var libs = Library.getUserLibs(this.getBase()),
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
//		libs = libs.concat({ id: 'widgets', root: this._getWidgetFolder() });

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
		// XXX Also need to set the `async` flag to false.  Otherwise, we try to
		//     instantiate objects before the modules have loaded.
		lang.mixin(djConfig, config, {
			async: false,
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

        dojo.connect(this.getGlobal(), 'onload', this, function() {
            this.onload();
        });

		this.setHeader({
			title: data.title,
			scripts: data.scripts,
			modules: data.modules,
			styleSheets: data.styleSheets,
			//className: data.className,
			
			bodyClasses: data.bodyClasses,
			states: data.states,
			style: data.style
		});

		var content = data.content || "";
		
		var active = this.isActive();
		if(active){
			this.select(null);
			dojo.forEach(this.getTopWidgets(), this.detach, this);
		}
		var states = {},
		    containerNode = this.getContainerNode();
	
		if (data.states) {
			states.body = data.states;
		}
		dojo.forEach(this.getTopWidgets(), function(w){
			if(w.getContext()){
				w.destroyWidget();
			}
		});

		// remove all registered widgets
        this.getDijit().registry.forEach(function(w) {
              w.destroy();           
        });

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

		var removeEventAttributes = function(node) {
			if(node){
				dojo.filter(node.attributes, function(attribute) {
					return attribute.nodeName.substr(0,2).toLowerCase() == "on";
				}).forEach(function(attribute) {
					node.removeAttribute(attribute.nodeName);
				});
			}
		};

		removeEventAttributes(containerNode);
		dojo.query("*",containerNode).forEach(removeEventAttributes);

		// Convert all text nodes that only contain white space to empty strings
		containerNode.setAttribute('data-davinci-ws','collapse');
		var model_bodyElement = this._srcDocument.getDocumentElement().getChildElement("body");
		model_bodyElement.addAttribute('data-davinci-ws','collapse');

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
		// add the user activity monitoring to the document and add the connects to be 
		// disconnected latter
		this.editor.setDirty(this.hasDirtyResources());
		var newCons = [];
		newCons = newCons.concat(this._connects, UserActivityMonitor.addInActivityMonitor(this.getDocument()));
		this._connections = newCons;
	    dojo.publish('/davinci/ui/context/loaded', [this]);
	},

	/**
	 * Process dojoType, oawidget and dvwidget attributes on text content for containerNode
	 */
	_processWidgets: function(containerNode, attachWidgets, states, scripts) {
		var prereqs = [];
		dojo.forEach(dojo.query("*", containerNode), function(n){
			var type =  n.getAttribute("data-dojo-type") || n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			//doUpdateModelDojoRequires=true forces the SCRIPT tag with dojo.require() elements
			//to always check that scriptAdditions includes the dojo.require() for this widget.
			//Cleans up after a bug we had (7714) where model wasn't getting updated, so
			//we had old files that were missing some of their dojo.require() statements.
			this.loadRequires(type, false/*doUpdateModel*/, true/*doUpdateModelDojoRequires*/);
			prereqs.push(this._preProcess(n));
//			this.resolveUrl(n);
			this._preserveStates(n, states);
		}, this);
		var promise = new Deferred();
		new DeferredList(prereqs).then(function() {
			this.getGlobal()["require"]("dojo/ready")(function(){
				try {
					this.getGlobal()["require"]("dojo/parser").parse(containerNode);
					promise.resolve();
				} catch(e) {
					// When loading large files on FF 3.6 if the editor is not the active editor (this can happen at start up
					// the dojo parser will throw an exception trying to compute style on hidden containers
					// so to fix this we catch the exception here and add a subscription to be notified when this editor is seleected by the user
					// then we will reprocess the content when we have focus -- wdr
	
					console.error(e);
					// remove all registered widgets, some may be partly constructed.
					this.getDijit().registry.forEach(function(w){
						  w.destroy();			 
					});
		
					this._editorSelectConnection = dojo.subscribe("/davinci/ui/editorSelected",
							this, '_editorSelectionChange');
	
					promise.reject(e);
					throw e;
				}

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
			}.bind(this));
		}.bind(this));

		return promise;
	},
	
	_preProcess: function (node){
		//need a helper to pre process widget
		// also, prime the helper cache
        var type = node.getAttribute("dojoType") || node.getAttribute("data-dojo-type");
        return Widget.requireWidgetHelper(type).then(function(helper) {        	
	        if(helper && helper.preProcess){
	            helper.preProcess(node, this);
	        }
        }.bind(this));
    },
	    
	_editorSelectionChange: function(event){
		// we should only be here do to a dojo.parse exception the first time we tried to process the page
		// Now the editor tab container should have focus becouse the user selected it. So the dojo.processing should work this time
		if (event.editor.fileName === this.editor.fileName){
			dojo.unsubscribe(this._editorSelectConnection);
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

	_attachChildren: function (containerNode)
	{
		dojo.query("> *", containerNode).map(Widget.getWidget).forEach(this.attach, this);
		/*
		var currentStateCache = [];
		*/
		var rootWidget = containerNode._dvWidget;
		rootWidget._srcElement.visit({ visit: function(element){
			if (element.elementType=="HTMLElement") {
				var stateSrc=element.getAttribute(davinci.ve.states.ATTRIBUTE);
				if (stateSrc && stateSrc.length) {
					var id=element.getAttribute("id");
					var widget;
					if (id){
					  widget=Widget.byId(id);
					}else{
						if (element==rootWidget._srcElement){
							widget=rootWidget;
						}
					}	
					var states = davinci.states.deserialize(stateSrc);
					delete states.current; // FIXME: Always start in normal state for now, fix in 0.7
					
					/*
					var state = davinci.ve.states.getState();
					if (state) { // remember which widgets have state other than normal so we can trigger a set later to update styles of their children
						currentStateCache.push({ node: widget.domNode, state: state});
					}
					*/
				}
			}
		}});
		/*
		// Wait until after all states attributes are restored before setting states, so all child attributes are updated properly
		for (var i in currentStateCache) {
			var item = currentStateCache[i];
			davinci.ve.states.setState(item.node, item.state, true);
		}
		*/
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
		dojo.query("> *", this.rootNode).map(Widget.getWidget).forEach(function(widget){
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
		var oldStyleSheets,
			newStyleSheets,
			oldBodyClasses,
			newBodyClasses;
		if(this._header){
			oldStyleSheets = this._header.styleSheets || [];
			oldBodyClasses = this._header.bodyClasses;
		}else{
			oldStyleSheets = [];
		}
		if(header){
			newStyleSheets = header.styleSheets || [];
			newBodyClasses = header.bodyClasses;
			if(header.modules){
				dojo.forEach(header.modules, this._require, this);
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
				dojo.removeClass(containerNode, oldBodyClasses);
			}
			if(newBodyClasses){
				dojo.addClass(containerNode, newBodyClasses);
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
        // don't add if stylesheet is already loaded in the page
		var doc = this.getDocument();
		var dj = this.getDojo();
		var links = dj.query('link');
		var found = links.some(function(val) {
			return val.getAttribute('href') === url;
		});
		if (found) {
			return;
		}

		dojo.withDoc(doc, function() {
	        var link = dojo.create('link',
	            {
    	            rel: 'stylesheet',
    	            type: 'text/css',
    	            href: url
    	        }
	        );
	        // Make sure app.css is the after library CSS files, and content.css is after app.css
	        // FIXME: Shouldn't hardcode this sort of thing
	        var headElem = doc.getElementsByTagName('head')[0],
				isAppCss = url.indexOf('app.css') > -1,
				isContentCss = url.indexOf('content.css') > -1,
				appCssLink, contentCssLink, appCssIndex, contentCssIndex;
			for(var i=0; i<links.length; i++){
				if(links[i].href.indexOf('app.css') > -1){
					appCssLink = links[i];
					appCssIndex = i;
				}else if(links[i].href.indexOf('content.css') > -1){
					contentCssLink = links[i];
					contentCssIndex = i;
				}
			}
			var index,
				beforeChild;
			if(!isContentCss){
				if(isAppCss && contentCssLink){
					beforeChild = contentCssLink;
					index = contentCssIndex;
				}else{
					beforeChild = appCssLink;
					index = appCssIndex;
				}
			}
			if(beforeChild){
				headElem.insertBefore(link, beforeChild);
			}else{
		        headElem.appendChild(link);
			}
		});
	},

	/**
	 * Remove style sheet from page's DOM.
	 * @param url {string}
	 */
    unloadStyleSheet: function(url) {
        var self = this;
		var doc = this.getDocument();
		var dj = this.getDojo();
		var links = dj.query('link');
        links.some(function(val, idx) {
            if (val.getAttribute('href') === url) {
                dojo.destroy(val);
                return true; // break
            }
        });
    },

	addModeledStyleSheet: function(url, skipDomUpdate) {
		if (!skipDomUpdate) {
			this.loadStyleSheet(url);
		}
		if (!this.model.hasStyleSheet(url)) {
			// Make sure app.css is the last CSS file within the list of @import statements
	        // FIXME: Shouldn't hardcode this sort of thing
			var isAppCss = (url.indexOf('app.css') > -1);
			var appCssImport;
			var styleElem = this.model.find({'elementType':"HTMLElement",'tag':'style'}, true);
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
				dojo.connect(this.model._loadedCSS[css], 'onChange', this,
						'_themeChange');
			}
		}
	},

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
	maqTempClassCount: 0,
	maqTempClassPrefix: 'maqTempClass',

	// preserve states specified to node
	_preserveStates: function(node, cache){
		var states = davinci.ve.states.retrieve(node);
		if (node.tagName != "BODY" && states) {
			var tempClass = this.maqTempClassPrefix + this.maqTempClassCount;
			node.className = node.className + ' ' + tempClass;
			this.maqTempClassCount++;
			cache[tempClass] = {};
			cache[tempClass].states = states;
			if(node.style){
				cache[tempClass].style = node.style.cssText;
			}else{
				// Shouldn't be here
				debugger;
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
		/*
		var currentStateCache = [];
		*/
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
			var states = davinci.states.deserialize(node.tagName == 'BODY' ? cache[id] : cache[id].states);
			delete states.current; // FIXME: Always start in normal state for now, fix in 0.7
			davinci.ve.states.store(widget.domNode, states);
			if(node.tagName != 'BODY'){
				davinci.states.transferElementStyle(node, cache[id].style);
			}
			
			/*
			var state = davinci.ve.states.getState(widget.domNode);
			if (state) { // remember which widgets have state other than normal so we can trigger a set later to update styles of their children
				currentStateCache.push({ node: widget.domNode, state: state});
			}
			*/
		}
		/*
		// Wait until after all states attributes are restored before setting states, so all child attributes are updated properly
		for (var i in currentStateCache) {
			var item = currentStateCache[i];
			davinci.ve.states.setState(item.node, item.state, true);
		}
		*/
	},

	getDocument: function(){
		var container = this.getContainerNode();
		return container && container.ownerDocument;
	},

	getGlobal: function(){
		var doc = this.getDocument();
		return doc ? windowUtils.get(doc) : null;
	},

	getDojo: function(){
		var win = this.getGlobal();
		//FIXME: Aren't we asking for downstream bugs if we return "dojo", which is Maqetta's dojo
		//instead of the user document's dojo?
		return (win && win.dojo) || dojo;
	},

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
		var topWidgets=[];
		for(var node = this.rootNode.firstChild; node; node = node.nextSibling){
			if(node.nodeType == 1 && node._dvWidget){
				topWidgets.push(node._dvWidget);
			}
		}
		return topWidgets;
	},

	//FIXME: remove?
	getContentPosition: function(position){
		if(!position){
			return undefined;
		}
		if(position.target){ // event
			position = {x: position.pageX, y: position.pageY};
		}
		return position;
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
		if(!this.editor.isActiveEditor()){
			return;
		}
		var box, op, parent;

		if (!metadata.queryDescriptor(widget.type, "isInvisible")) {
			var node = widget.getStyleNode(),
				helper = widget.getHelper();
			if(helper && helper.getSelectNode){
				node = helper.getSelectNode(this) || node;
			}
			var box = GeomUtils.getMarginBoxPageCoords(node);

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
			
	},
	
	updateFocusAll: function(){
		var selection = this._selection;
		if(selection){
			for(var i=0; i<selection.length; i++){
				this.updateFocus(selection[i], i);			
			}
		}
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
				parent.selectChild(widget);
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
		if(this._selection){
			for(var i=this._selection.length-1; i>=0; i--){
				var widget = this._selection[i];
				var domNode = widget.domNode;
				while(domNode.tagName != 'BODY'){
					var computed_style_display = dojo.style(domNode, 'display');
					if(computed_style_display == 'none'){
						this.deselect(widget);
						break;
					}
					domNode = domNode.parentNode;
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
	 * Sees if (pageX,pageY) is within bounds of any of the selection rectangles
	 * If so, return the corresponding selected widget
	 */
	checkFocusXY: function(pageX, pageY){
		var selection = this.getSelection();
		for(var i=0; i<selection.length; i++){
			var box = this._focuses[i].getBounds();
			if(pageX >= box.l && pageX <= box.l + box.w &&
					pageY >= box.t && pageY <= box.t + box.h){
				return selection[i];
			}
		}
		return null;
	},
	
	// Hide all focus objects associated with current selection
	selectionHideFocus: function(){
		var selection = this.getSelection();
		for(var i=0; i<selection.length; i++){
			this._focuses[i].hide();
		}
	},
	
	// Show all focus objects associated with current selection
	selectionShowFocus: function(){
		var selection = this.getSelection();
		for(var i=0; i<selection.length; i++){
			this._focuses[i].show(selection[i]);
		}
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

		var containerNode = this.getContainerNode();

		if(state){
			if(state.box && state.op){
				if(!focus._connected){
					this._connects.push(dojo.connect(focus, "onExtentChange", this, "onExtentChange"));
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
				focus.show(w[windex],inline);
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
			for(var i = index; i < this._focuses.length; i++){
				focus = this._focuses[i];
				if(focus.domNode.parentNode == containerNode){
					focus.hide();
					containerNode.removeChild(focus.domNode);
				}
			}
		}
	},
	

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
	
	getFlowLayout: function() {
		var htmlElement = this.getDocumentElement(),
			bodyElement = htmlElement.getChildElement("body"),
			flowLayout = bodyElement.getAttribute(PREF_LAYOUT_ATTR);
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
		var htmlElement=this.getDocumentElement();
		var bodyElement=htmlElement.getChildElement("body");
		bodyElement.addAttribute(PREF_LAYOUT_ATTR,''+flowLayout);
		return flowLayout;
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
		connect.publish("/davinci/ve/activeToolChanged",[this, tool]);
	},
	
	// getter/setter for currently active drag/drop object
	getActiveDragDiv: function(){
		return(this._activeDragDiv);
	},
	setActiveDragDiv: function(activeDragDiv){
		this._activeDragDiv = activeDragDiv;
	},
	
	blockChange: function(shouldBlock){
			this._blockChange = shouldBlock;
	},
	
	/**
	 * Returns true if the given node is part of the focus (ie selection) chrome
	 */
	isFocusNode: function(node){
		if(this._selection){
			for(var i=0; i<this._selection.length; i++){
				if(this._focuses[i].isFocusNode(node)){
					return true;
				}
			}
		}
		return false;
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
			
			/*FIXME: Fix these lines. The store() method should be taking a widget/node,
				not a "data" object. Just happens to work, sort of by accident. */
			var states = bodyElement.getAttribute(davinci.ve.states.ATTRIBUTE);
			davinci.ve.states.store(data, states);

			/*this.setPreference("flowLayout", 
					bodyElement.getAttribute(PREF_LAYOUT_ATTR) !== 'false');*/
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
		// update focus
		dojo.forEach(this.getSelection(), function(w, i){
			if(i === 0){
				this.select(w);
			}else{
				this.select(w, true); // add
			}
		}, this);
		if (this.editor.editorID == 'davinci.ve.ThemeEditor'){
			var helper = Theme.getHelper(this.visualEditor.theme);
			if(helper && helper.onContentChange){
				helper.onContentChange(this, this.visualEditor.theme);
			} else if (helper && helper.then){ // it might not be loaded yet so check for a deferred
           	 helper.then(function(result){
        		 if (result.helper && result.helper.onContentChange){
        			 result.helper.onContentChange(this,  this.visualEditor.theme); 
    			 }
        	 }.bind(this));
          }
		}
		setTimeout(function(){
			// Invoke autoSave, with "this" set to Workbench
			Workbench._autoSave.call(Workbench);
		}, 0);
		
	},

	onSelectionChange: function(selection){
		// this method can be called from at the end of modifyRuleCommand, 
		// The publish causes the cascade, and properties in the palette to be updated to the selection
		// In the case od and undo or redo from the command stack. The reason the timeout is here is
		// in the case of multiple ModifyRulesCommands in a CompondCommand this gets called for each of
		// the modifies in the compond command, pounding the cascade and properties causing preoframnce issues
		// we really only need to sent one publish at the end, so we put the publish in a timeout. If we are indeeded 
		// getting called from a CompondCommand and the next request to publish comes in in less than the timeout
		// we replace the delay with a new one. efectivlly replacing a bunch of publishes with one at the end.
		if (this._delayedPublish) {
			window.clearTimeout(this._delayedPublish);
		}
		this._delayedPublish = window.setTimeout(function(){
			this._cssCache = {};
			delete this._delayedPublish;
			dojo.publish("/davinci/ui/widgetSelected",[selection]);
		}.bind(this),200); 
		
	},

	hotModifyCssRule: function(r){
		
		function updateSheet(sheet, rule){
			var fileName = rule.parent.getResource().getURL();
			var selectorText = rule.getSelectorText();
//			console.log("------------  Hot Modify looking  " + fileName + " ----------------:=\n" + selectorText + "\n");
			selectorText = selectorText.replace(/^\s+|\s+$/g,""); // trim white space
			//var rules = sheet.cssRules;
			var foundSheet = findSheet(sheet, fileName);
			if (foundSheet){
				var rules = foundSheet.cssRules;
				var r = 0;
				for (r = 0; r < rules.length; r++){
					if (rules[r] instanceof CSSStyleRule){
						if (rules[r].selectorText == selectorText) {
							/* delete the rule if it exists */
							foundSheet.deleteRule(r);
//							console.log("------------  Hot Modify delete " + foundSheet.href + "index " +r+" ----------------:=\n" + selectorText + "\n");
							
							break;
						}
					}
					
				}
				if (rule.properties.length > 0) { // only inser rule if it has properties
					var text = rule.getText({noComments:true});
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
			    // NOTE: For some reason the instanceof check does not work on Safari..
			    // So we are testing the constructor instead, but we have to test it as a string...
			    var x = '' + rules[r].constructor;
				if (rules[r] instanceof CSSImportRule || x === '[object CSSImportRuleConstructor]'){
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
		var sheets = this.getDocument().styleSheets;
		dojo.some(sheets, function(sheet) {
			return updateSheet(sheet, r);
		});
	},

	ruleSetAllProperties: function(rule, values){
		rule.removeAllProperties();
		for(i = 0;i<values.length;i++){
			rule.addProperty(values[i].name, values[i].value); // #23 all we want to put back is the values
		}
	},
	
	modifyRule: function(rule, values){
		var i,
			p,
			prop,
			existingProps = [];
		var removedProp = []; //#2166
		// Remove any properties within rule that are listed in the "values" parameter 
		for(i = 0;i<values.length;i++){
			for(var name in values[i]){
				var prop = rule.getProperty(name);
				if (prop) {
					removedProp.push(prop); //#2166
				}
				rule.removeProperty(name);
			}
		}
		// Create a merged list of properties from existing rule and "values" parameter
		for(p=0; p<rule.properties.length; p++){
			prop = rule.properties[p];
			var o = {};
			o[prop.name] = prop.value;
			existingProps.push(o);
		}
		var cleaned = existingProps.concat(dojo.clone(values));
		// return a sorted array of sorted style values.
		function indexOf(value){
			for(var i=0;i<cleaned.length;i++){
				if(cleaned[i].hasOwnProperty(value)){
					return i;
				}
			}
			return -1;
		}
		var shorthands = CSSModel.shorthand;
		var lastSplice = 0;
		/* re-order the elements putting short hands first */
		for(i=0;i<shorthands.length;i++) {
			var index = indexOf(shorthands[i][0]);
			if(index>-1) {
				var element = cleaned[index];
				cleaned.splice(index,1);
				cleaned.splice(lastSplice,0, element);
				lastSplice++;
			}
		}
		// Clear out all remaining prop declarations in the rule
		for(p=rule.properties.length-1; p>=0; p--){
			prop = rule.properties[p];
			if(prop){
				removedProp.push(rule.getProperty(prop.name)); //#2166
				rule.removeProperty(prop.name);
			}
		}
		// Add all prop declarations back in, in proper order
		for(i = 0;i<cleaned.length;i++){
			for(var name in cleaned[i]){
				if (cleaned[i][name] && cleaned[i][name] !== '') { 
					rule.addProperty(name, cleaned[i][name]);
					//#2166 find the old prop to grab comments if any
					for (var x = 0; x < removedProp.length; x++) {
						if (removedProp[x].name === name) {
							var newProp = rule.getProperty(name, cleaned[i][name]);
							if (removedProp[x].comment) { 
								// add back the comments before this prop from the old CSS file
								newProp.comment = removedProp[x].comment; 
							}
							if (removedProp[x].postComment) { 
								// add back the comments after this prop from the old CSS file
								newProp.postComment = removedProp[x].postComment; 
							}
							removedProp.splice(x,1); // trim out the prop so we don't process this more than once
							break;
						}
						
					}
					//#2166 find the old prop to grab comments if any
				}
			}
		}
		
		//this.hotModifyCssRule(rule); // #23 this get called by _themeChange
	},
	
	getRelativeMetaTargetSelector: function(target){
		
		var theme = this.getThemeMeta();
		if(!theme) {
			return [];
		}
		
		var state = davinci.ve.states.getState();
		
		if(!state) {
			state = "Normal";
		}
		
		var widget = this.getSelection();
		if(!widget.length){
			return [];
		}
		widget = widget[0];
		
		var widgetType = theme.loader.getType(widget);
	
		return theme.metadata.getRelativeStyleSelectorsText(widgetType, state, null, target);
		
	},
		
	getSelector: function(widget, target){
		// return rules based on metadata IE theme
		
		var theme = this.getThemeMeta();
		if(!theme){
			return [];
		}
		// Note: Let's be careful to not get confused between the states in theme metadata
		// and the user-defined interactive states that are part of a user-created HTML page
		// For theme editor, we need to use whatever state is selected in States palette
		// For page editor, always use "Normal"
		var state = "Normal";
		if (this.editor.editorID == 'davinci.ve.ThemeEditor'){
			state = davinci.ve.states.getState();
		}
		
		var widgetType = theme.loader.getType(widget),
			selectors = theme.metadata.getStyleSelectors(widgetType,state);

		if(selectors){
			for(var name in selectors){
				for(var i = 0; i < selectors[name].length; i++){
					for(var s = 0 ; s < target.length; s++) {
						if(target[s] == selectors[name][i]){
							return name;
						}
					}
				}
			}
		}
	},
	
	getMetaTargets: function(widget, target){
		var name = this.getSelector(widget, target),
			model = this.getModel();
		return model.getRule(name);
	},
	
	/* returns the top/target dom node for a widget for a specific property */
	
	getWidgetTopDom: function (widget,propertyTarget){
	
		var selector = this.getSelector(widget, propertyTarget);
		// find the DOM node associated with this rule.
		function findTarget(target, rule){
			if(rule.matches(target)) {
				return target;
			}
			for(var i = 0;i<target.children.length;i++){
				return findTarget(target.children[i], rule);
			}
		}
		if(selector){
			var rule = new CSSRule();
			rule.setText(selector + "{}");
			return findTarget(widget.domNode || widget, rule);
		}
		return null;
	},
	
	getSelectionCssRules: function(targetDomNode){
		this._cssCache = this._cssCache || {}; // prevent undefined exception in theme editor
		var hashDomNode = function (node) {
			return node.id + "_" + node.className;
		};
		var selection = this.getSelection();
		if (!targetDomNode && !selection.length) {
			return {rules:null, matchLevels:null};
		}
		
		var targetDom = targetDomNode || selection[0].domNode || selection[0],
			domHash = hashDomNode(targetDom);
		
		/*
		if(this._cssCache[domHash])
			return this._cssCache[domHash];
		*/
		
		if(selection.length){
			var match = this._cssCache[domHash] = this.model.getMatchingRules(targetDom, true);
			if (this.cssFiles) {
				this.cssFiles.forEach(function(file){
					file.getMatchingRules(targetDom, match.rules, match.matchLevels); // adds the dynamic rules to the match
				});
				//this.cssFiles[0].getMatchingRules(targetDom, match.rules, match.matchLevels); // adds the dynamic rules to the match
			}
			match.rules.forEach(function(rule) {
				/* remove stale elements from the cache if they change */
				var handle = dojo.hitch(rule, "onChange", this, function(){
					delete this._cssCache[domHash];
					dojo.unsubscribe(handle);
				});
			}, this);
			
			return match;
		}

		return {rules:null, matchLevels:null};
	},
	
	getStyleAttributeValues: function(widget){
		//FIXME: This totally seems to have missed the array logic
		var vArray = widget ? widget.getStyleValues() : [];
		
		var isNormalState = davinci.ve.states.isNormalState();
		if (!isNormalState) {
			var stateStyleValuesArray = davinci.ve.states.getStyle(widget.domNode);
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
		var isDojoJS = /\/dojo.js$/.test(url);
		// XXX HACK: Don't add dojo.js to the editor iframe, since it already has an instance.
		//	  Adding it again will overwrite the existing Dojo, breaking some things.
		//	  See bug 7585.
		if (!isDojoJS && !skipDomUpdate) {
			var context = this,
				absoluteUrl = (new dojo._Url(this.getDocument().baseURI, url)).toString();
			// This xhrGet() used to include `handleAs: "javascript"`, surrounded
			// by a `dojo.withGlobal`.  However, `dojo.eval` regressed in Dojo 1.7,
			// such that it no longer evals using `dojo.global` -- instead evaling
			// into the global context. To work around that, we do our own `eval` call.
			dojo.xhrGet({
				url: absoluteUrl,
				sync: true    // XXX -> async
			}).then(function(data) {
				context.getGlobal()['eval'](data);
			});
		}
		if (doUpdateModel) {				
			// update the script if found
			var head = this.getDocumentElement().getChildElement('head'),
				config = {
					async: true,
					parseOnLoad: true,
					packages: this._getLoaderPackages()
				},
				found = head.getChildElements('script').some(function(element) {
					var elementUrl = element.getAttribute("src");
					if (elementUrl && elementUrl.indexOf(baseSrcPath) > -1) {
						element.setAttribute("src", url);
						return true;
					}
				});
			if (found) {
				if (isDojoJS) {
					this._updateDojoConfig(config);
				}
			} else {
				if (isDojoJS) {
					// special case for dojo.js to provide config attribute
					// XXX TODO: Need to generalize in the metadata somehow.
					lang.mixin(config, this._configProps);
					this.addHeaderScript(url, {
						"data-dojo-config": JSON.stringify(config).slice(1, -1).replace(/"/g, "'")
					});
	
					// TODO: these two dependencies should be part of widget or library metadata
					this.addJavaScriptModule("dijit/dijit", true, true);
					this.addJavaScriptModule("dojo/parser", true, true);
				}else{
					this.addHeaderScript(url);
				}
			}
		}
	},

	_reRequire: /\brequire\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/,
	_reModuleId: /[\w.\/]+/g,

	addJavaScriptModule: function(mid, doUpdateModel, skipDomUpdate) {
		if (!skipDomUpdate) {
			this.getGlobal().require([mid]); //FIXME: needs to pass in async callback
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
					return;
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

		if (! scriptText) {
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
	 * Add element to <head> of document.  Modeled on dojo.create().
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
			dojo.create(tag, attrs, dojo.query('head')[0]);
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
			//dojo.destroy(dojo.query(queryStr)[0]);
			var n = dojo.query(queryStr)[0];
			if (n){ // throws exception if n is null
			    dojo.destroy(n);
			}
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

		// If `prop` has a value, copy it into djConfig, overwriting existing
		// value.  If `prop` is `null`, then delete from djConfig.
		for (var prop in data) {
			if (data[prop] === null) {
				delete djConfig[prop];
			} else {
				djConfig[prop] = data[prop];
			}
		}

		dojoScript.setAttribute('data-dojo-config',
				JSON.stringify(djConfig).slice(1, -1).replace(/"/g, "'"));
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

				this._themePath = new davinci.model.Path(this.visualEditor.fileName);
				// Connect to the css files, so we can update the canvas when
				// the model changes.
				this._getCssFiles().forEach(function(file) {
					dojo.connect(file, 'onChange', this, '_themeChange');
				}, this);

				break;
			}
		}
	},

	_configDojoxMobile: function() {
		// dojox.mobile.configDeviceTheme should run only the first time dojox.mobile.deviceTheme runs, to establish
		// monitoring of which stylesheets get loaded for a given theme

		var dm = lang.getObject("dojox.mobile", true, this.getGlobal());
		dm.configDeviceTheme = function() {
			var loadDeviceTheme = dm.loadDeviceTheme;

			dm.loadDeviceTheme = function(device) {
				var djConfig = this.getDojo().config,
					djConfigModel = this._getDojoJsElem().getAttribute('data-dojo-config'),
					ua = device || djConfig.mblUserAgent || 'none',
					themeMap,
					themeFiles;

				djConfigModel = djConfigModel ? require.eval("({ " + djConfigModel + " })", "data-dojo-config") : {};
				themeMap = djConfigModel.themeMap;
				themeFiles = djConfigModel.mblThemeFiles;

				// clear dynamic CSS
				delete this.themeCssFiles;
				delete this.cssFiles;

				// load CSS files specified by `themeMap`
				if (!themeMap) {
					// load defaults if not defined in file
					themeMap = Theme.getDojoxMobileThemeMap(this, dojo.clone(Theme.dojoMobileDefault));
					themeFiles = [];
				}
				this._addCssForDevice(ua, themeMap, this);

				// set/unset themeMap & themeFiles in VE DOM
				// XXX This won't work for Dojo 1.8, will need to set `themeMap` on
				//     Dojo config obj and reload VE iframe.
				dm.themeMap = themeMap;		// djConfig.themeMap = themeMap;
				if (themeFiles) {
					djConfig.mblThemeFiles = themeFiles;
				} else {
					delete djConfig.mblThemeFiles;
				}

				if (this._selection) {
					// forces style palette to update cascade rules
					this.onSelectionChange(this._selection);
				}

				loadDeviceTheme(device);
			}.bind(this);

			// This is a call-once function
			delete dm.configDeviceTheme;
		}.bind(this);

		// Set mobile device CSS files
		var mobileDevice = this.getMobileDevice();
		if (mobileDevice) {
			this.setMobileDevice(mobileDevice);
			this.visualEditor.setDevice(mobileDevice, true);
		}

		// Check mobile orientation
		var orientation = this.getMobileOrientation();
		if (orientation) {
			this.visualEditor.setOrientation(orientation);
		}
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
			eventTarget = params.eventTarget,
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
			if(params.widgets){
				if(params.widgets.indexOf(widget) >= 0){
					// Drag operations shouldn't apply to any of the widget being dragged
						return;
					}
				}
			
			var node = widget.domNode,
				dj = this.getDojo(),
				computed_style = dj.style(node);

			if(doSnapLinesX || doSnapLinesY){
				Snap.findSnapOpportunities(this, widget, computed_style, doSnapLinesX, doSnapLinesY);
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
	
	getThemeMetaDataByWidget: function(widget){
		
		var theme = this.getThemeMeta();
		if (!theme) {
			return null;
		}
		
		var widgetType = theme.loader.getType(widget);
		var meta = theme.loader.getMetaData(widgetType);
		if (!meta && this.cssFiles){
			// chack the dynamiclly added files
			for (var i = 0; i < this.cssFiles.length; i++){
				var dTheme = Theme.getThemeByCssFile(this.cssFiles[i]);
				if (dTheme) {
					var themeMeta = Library.getThemeMetadata(dTheme);
					// found a theme for this css file, check for widget meta data
					meta = themeMeta.loader.getMetaData(widgetType);
					if (meta){
						break;
					}
				}
			}
			
		}
		return meta;
	},
	
	registerSceneManager: function(sceneManager){
		if(!sceneManager || !sceneManager.id){
			return;
		}
		var id = sceneManager.id;
		if(!this.sceneManagers[id]){
			this.sceneManagers[id] = sceneManager;
			dojo.publish('/davinci/ui/context/registerSceneManager', [sceneManager]);
		}
	},
	
	getCurrentScenes: function(){
		var a = [];
		for(var id in this.sceneManagers){
			var sm = this.sceneManagers[id];
			var sceneId = sm.getCurrentScene ? sm.getCurrentScene() : null;
			if(sceneId){
				a.push({sm:sm, sceneId:sceneId});
			}
		}
		return a;
	},
	
	/**
	 * Returns an array holding the set of currently selected application states and (mobile) scenes
	 * @return {array}  array is an object of form {sm:{scenemanager}, sceneId:{string}},
	 *                   where sm is undefined or null for application states
	 */
	getStatesScenes: function() {
		var a = this.getCurrentScenes();
		var state = davinci.ve.states.getState();
		a.push({sceneId:state});
		return a;
	},
	
	/**
	 * Sets the current scene(s) and/or current application state
	 * @param {array}  array is an object of form {sm:{scenemanager}, sceneId:{string}},
	 *                   where sm is undefined or null for application states
	 */
	setStatesScenes: function(arr) {
		for(var i=0; i<arr.length; i++){
			var sm = arr[i].sm;
			var sceneId = arr[i].sceneId;
			if(sm){
				sm.selectScene({sceneId:sceneId});
			}else{
				davinci.ve.states.setState(sceneId);
			}
		}
	},

	onCommandStackExecute: function() {
	},
	
	/**
	 * Called by any commands that can causes widgets to be added or deleted.
	 * Looks at current document and decide if we need to update the document
	 * to include or exclude document.css
	 */
	widgetAddedOrDeleted: function(resetEverything){		
		// Hack for M6 release to include/exclude document.css.
		// Include only if at least one dijit widget and no dojox.mobile widgets.
		function checkWidgetTypePrefix(widget, prefix){
			if(widget.type.indexOf(prefix)===0){
				return true;
			}
			var children = widget.getChildren();
			for(var j=0; j<children.length; j++){
				var retval = checkWidgetTypePrefix(children[j], prefix);
				if(retval){
					return retval;
				}
			}
			return false;
		}
		var anyDojoxMobileWidgets = false;
		var topWidgets = this.getTopWidgets();
		for(var i=0; i<topWidgets.length; i++){
			anyDojoxMobileWidgets = checkWidgetTypePrefix(topWidgets[i], 'dojox.mobile.');
			if(anyDojoxMobileWidgets){
				break;
			}
		}
		// If the current document has changed from having zero dojox.mobile widgets to at least one
		// or vice versa, then either remove or add document.css.
		if(resetEverything || this.anyDojoxMobileWidgets !== anyDojoxMobileWidgets){
			var documentCssHeader, documentCssImport, themeCssHeader, themeCssImport;
			var header = dojo.clone( this.getHeader());
			for(var ss=0; ss<header.styleSheets.length; ss++){
				if(header.styleSheets[ss].indexOf('document.css') >= 0){
					documentCssHeader = header.styleSheets[ss];
				}
				if(header.styleSheets[ss].indexOf('themes/') >= 0){
					themeCssHeader = header.styleSheets[ss];
				}
			}
			var imports = this.model.find({elementType:'CSSImport'});
			for(var imp=0; imp<imports.length; imp++){
				if(imports[imp].url.indexOf('document.css') >= 0){
					documentCssImport = imports[imp];
				}
				if(imports[imp].url.indexOf('themes/') >= 0){
					themeCssImport = imports[imp];
				}
			}
			// If resetEverything flag is set, then delete all current occurrences
			// of document.css. If there are no dojoxmobile widgets, the next block
			// will add it back in.
			if(resetEverything || anyDojoxMobileWidgets){
				if(documentCssHeader){
					var idx = header.styleSheets.indexOf(documentCssHeader);
					if(idx >= 0){
						header.styleSheets.splice(idx, 1);
						this.setHeader(header);
					}
				}
				if(documentCssImport){
					var parent = documentCssImport.parent;
					parent.removeChild(documentCssImport);
					documentCssImport.close(); // removes the instance from the Factory
				}
				documentCssHeader = documentCssImport = null;
			}
			if(!anyDojoxMobileWidgets){
				if(!documentCssHeader && themeCssHeader){
					var themeCssRootArr = themeCssHeader.split('/');
					themeCssRootArr.pop();
					themeCssRootArr.pop();
					var documentCssFileName = themeCssRootArr.join('/') + '/' + this.theme.className + '/document.css';
					header = dojo.clone(header);
					header.styleSheets.splice(0, 0, documentCssFileName);
					this.setHeader(header);
				}
				if(!documentCssImport && themeCssImport){
					var themeCssRootArr = themeCssImport.url.split('/');
					themeCssRootArr.pop();
					themeCssRootArr.pop();
					var documentCssFileName = themeCssRootArr.join('/') + '/' + this.theme.className + '/document.css';
					var basePath = this.getFullResourcePath().getParentPath();
					var documentCssPath = basePath.append(documentCssFileName).toString();
					var documentCssFile = system.resource.findResource(documentCssPath);
					var parent = themeCssImport.parent;
					if(parent && documentCssFile){
						var css = new CSSImport();
						css.url = documentCssFileName;
						var args = {url:documentCssPath}
						var cssFile = Factory.getModel(args); //newHTML();
						css.cssFile = cssFile; //documentCssFile;
						parent.addChild(css,0);
					}
				}
			}
			this.anyDojoxMobileWidgets = anyDojoxMobileWidgets;
		}
	},
	
	getPageLeftTop: function(node){
		var leftAdjust = node.offsetLeft;
		var topAdjust = node.offsetTop;
		var pn = node.offsetParent;
		while(pn && pn.tagName != 'BODY'){
			leftAdjust += pn.offsetLeft;
			topAdjust += pn.offsetTop;
			pn = pn.offsetParent;
		}
		return {l:leftAdjust, t:topAdjust};
	},
	
	resizeAllWidgets: function () {
		this.getTopWidgets().forEach(function (widget) {
			if (widget.resize) {
				widget.resize();
			}
		});
	},
	
	hasDirtyResources: function(){
		var dirty = false;
		var visitor = {
			visit: function(node){
				if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){
					dirty = true;
				}
				return dirty;
			}
		};
		
		this.getModel().visit(visitor);
		if (dirty){
			return dirty;
		}
		
		dirty = this.dirtyDynamicCssFiles(this.cssFiles);
		return dirty;

	}
});

});
