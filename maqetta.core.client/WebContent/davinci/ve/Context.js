dojo.provide("davinci.ve.Context");

dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.tools.SelectTool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.util");
dojo.require("davinci.ve.Focus");
dojo.require("davinci.actions.SelectLayoutAction");
dojo.require("davinci.library");
dojo.require("dojox.html._base");
dojo.require('preview.silhouetteiframe');
dojo.require('davinci.ve.ChooseParent');

dojo.declare("davinci.ve.Context", null, {

	// comma-separated list of modules to load in the iframe
	_bootstrapModules: "dijit/dijit",
	_configProps: {},

/*=====
	// keeps track of widgets-per-library loaded in context
	_widgets: null,
=====*/

	constructor: function(args) {
		if(!args) {
			args ={};
		}
		this._contentStyleSheet = davinci.Workbench.location() + dojo.moduleUrl("davinci.ve", "resources/content.css");
		this._id = "_edit_context_" + davinci.ve._contextCount++;
		this._editor = args.editor;
		this._visualEditor = args.visualEditor;
		this.widgetHash = {};
		
		dojo.mixin(this, args);

		if(dojo.isString(this.containerNode)){
			this.containerNode = dijit.byId(this.containerNode);
		}

		this.hostNode = this.containerNode;

		this._commandStack = new davinci.commands.CommandStack(this);
		this._defaultTool = new davinci.ve.tools.SelectTool();

		this._widgetIds = [];
		this._objectIds = [];
		this._widgets = [];
		this._links = [];
		this._chooseParent = new davinci.ve.ChooseParent({context:this});

	},

	    _configDojoxMobile: function() {
        // dojox.mobile.configDeviceTheme should run only the first time dojox.mobile.deviceTheme runs, to establish
        // monitoring of which stylesheets get loaded for a given theme

        var dm = this.getDojo().getObject("dojox.mobile", true);
        dm.configDeviceTheme = dojo.hitch(this, function() {
            var loadDeviceTheme = dm.loadDeviceTheme;

            dm.loadDeviceTheme = dojo.hitch(this, function(device) {
                var htmlElement = this._srcDocument.getDocumentElement();
                var head = htmlElement.getChildElement("head");
                var scriptTags=head.getChildElements("script");
                dojo.forEach(scriptTags, function (scriptTag){
                    var text=scriptTag.getElementText();
                    if (text.length) {
                        // Look for a dojox.mobile.themeMap in the document, if found set the themeMap 
                        var start = text.indexOf('dojox.mobile.themeMap');
                        if (start != -1) {
                            start = text.indexOf('=', start);
                            var stop = text.indexOf(';', start);
                            if (stop > start){
                                var themeMap = dojo.fromJson(text.substring(start+1,stop));
                                dm.themeMap = themeMap;
                            }
                        }
                     }
                }, this);
                loadDeviceTheme(device);
            });

            // This is a call-once function
            delete dm.configDeviceTheme;
        });

        // Set mobile device CSS files
        var mobileDevice = this.getMobileDevice();
        if (mobileDevice) {
            this.setMobileDevice(mobileDevice);
            this._visualEditor.setDevice(mobileDevice, true);
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
		return new davinci.model.Path(path);
	},


	
	activate: function(){
		if(this.isActive()){
			return;
		}

		this.loadStyleSheet(this._contentStyleSheet);
		this._attachAll();
		this._restoreStates();
		this._onLoadHelpers();

		var containerNode = this.getContainerNode();
		dojo.addClass(containerNode, "editContextContainer");
		
		this._connects = [
			dojo.connect(this._commandStack, "onExecute", this, "onContentChange"),
			dojo.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
			dojo.connect(containerNode, "ondblclick", this, "onDblClick"),
			dojo.connect(containerNode, "onmousedown", this, "onMouseDown"),
			dojo.connect(containerNode, "onmousemove", this, "onMouseMove"),
			dojo.connect(containerNode, "onmouseup", this, "onMouseUp"),
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

		widget.metadata = widget.metadata || davinci.ve.metadata.query(widget.type);
		widget._edit_context = this;
		
		widget.attach();

		if(widget.type.charAt(widget.type.lastIndexOf(".") + 1) == "_"){ //TODO: dijit-specific convention of "private" widgets
			widget.internal = true;
			// internal Dijit widget, such as _StackButton, _Splitter, _MasterTooltip
			return;
		}

		var id = widget.getId();
		if(id){
			davinci.ve._add(this._widgetIds, id);
		}
		var objectId = widget.getObjectId(widget);
		if(objectId){
			davinci.ve._add(this._objectIds, objectId);
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

	
	detach: function(widget){
		// FIXME: detaching context prevent destroyWidget from working
		//widget._edit_context = undefined;
		var id = widget.getId();
		if(id){
			davinci.ve._remove(this._widgetIds, id);
		}
		var objectId = widget.getObjectId();
		if(objectId){
			davinci.ve._remove(this._objectIds, objectId);
		}
		if (this._selection){
			davinci.ve._remove(this._selection,widget);
		}

        var library = davinci.ve.metadata.getLibraryForType(widget.type);
        if (library){
            var libId = library.name,
                data = [widget.type, this];

            // Always invoke the 'onRemove' callback.
            davinci.ve.metadata.invokeCallback(widget.type, 'onRemove', data);
            // If this is the last widget removed from page from a given library,
            // then invoke the 'onLastRemove' callback.
            this._widgets[libId] -= 1;
            if (this._widgets[libId] === 0) {
                davinci.ve.metadata.invokeCallback(widget.type, 'onLastRemove', data);
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
		return davinci.library.getLibRoot(id,version, this.getBase()) || "";
	},

	loadRequires: function(type, updateSrc, doUpdateModelDojoRequires, skipDomUpdate) {
		
		/* this method is used heavily in RebuildPage.js, so please watch out when changing  API! */
		if (!type) {
			return false;
		}
		
		var module = type.split(".")[0];
		/*
		if (module == "html") {
			// no require
			return true;
		}
		*/
		var requires = davinci.ve.metadata.query(type, "require");
		if (!requires) {
			return true;
		}

		return dojo.every(requires, function(r) {
		
			var src = r.src;
			if (src) {	// resource with URL
				if (r.$library) {
					// Since the metadata files are 'relocatable', we don't use the metadata's
					//  value for $library.src.  Instead, we find the base URL for the user's
					//  currently selected library.
					var libVer  = davinci.ve.metadata.getLibrary(r.$library).version;
						
					if (!libVer) {
						libVer = davinci.ve.metadata.query(type, "library")[r.$library].version;
					}
					var libRoot = this.getLibraryBase(r.$library, libVer);
					/*
					 * need to set the module path for custom user widgets 
					 */
					if(r.$library.indexOf("dojo") > -1){
						var fullLibPath = new davinci.model.Path(this.getBase()).append(libRoot).append(src);
						this._dojoModulePath = (new davinci.model.Path(this.getBase())).relativeTo(fullLibPath, true).toString();
					}
					
					if (libRoot == null /*empty string OK here, but null isn't. */) {
						console.warn("No library found for name = '" + r.$library +	"' version = '" + libVer + "'");
						return false;   // kill dojo.every loop
					}
					var fullLibPath = new davinci.model.Path(this.getBase()).append(libRoot).append(src);
					src = fullLibPath.relativeTo(this.getPath(),true).toString();				
				} else {
					console.warn("metadata resource does not specify 'library'");
				}
				src = src.toString();
			  
				switch (r.type) {
					case "javascript":
						this.addJavaScript(src, null, updateSrc, false, r.src,skipDomUpdate);
						break;
					case "css":
						updateSrc ? this.addModeledStyleSheet(src, r.src, skipDomUpdate) : this.loadStyleSheet(src);
						break;
					default:
						console.warn("Unhandled metadata resource type '" + r.type +
								"' for widget '" + type + "'");
				}
			} else {  // resource with text content
				switch (r.type) {
					case "javascript":
						this.addJavaScript(null, r.$text, updateSrc, doUpdateModelDojoRequires, null, skipDomUpdate);
						break;
					default:
						console.warn("Unhandled metadata resource type '" + r.type +
								"' for widget '" + type + "'");
				}
			}
			return true;
		}, this);
	},

	_getWidgetFolder: function(){
		
		var base = this.getBase();
		var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs.widgetFolder){
			prefs.widgetFolder = "WebContent/widgets";
			davinci.workbench.Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
	
		var folder = prefs.widgetFolder;
		while(folder.length>1 && (folder.charAt(0)=="." || folder.charAt(0)=="/")) {
			folder = folder.substring(1);
		}
		return folder;
	},

	//FIXME: remove accessor
	_getDojoModulePath: function(){
		return this._dojoModulePath;
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
        return bodyElement.getAttribute(davinci.ve.Context.MOBILE_DEV_ATTR);
    },

    /**
     * Sets mobile device in Model.
     * @param device {?string} device name
     */
    setMobileDevice: function(device) {
    	this.getDojo().config.mblUserAgent = /* remove this line for Dojo 1.7 final */
    	this.getGlobal()["require"](["dojo/_base/config"]).mblUserAgent = preview.silhouetteiframe.getMobileTheme(device + '.svg');
    	var bodyElement = this.getDocumentElement().getChildElement("body");
        if (! device || device === 'none') {
            bodyElement.removeAttribute(davinci.ve.Context.MOBILE_DEV_ATTR, device);
        } else {
            bodyElement.addAttribute(davinci.ve.Context.MOBILE_DEV_ATTR, device);
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

        this.setMobileDevice(device);

		// dojox.mobile specific CSS file handling

        var dm = this.getDojo().getObject("dojox.mobile");
        if(dm && dm.loadDeviceTheme) {
        	dm.loadDeviceTheme(preview.silhouetteiframe.getMobileTheme(device + '.svg'));
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
			if (style && style.length > 0) {
				changed = false;
			}
		}
		if(changed){
			this.theme = null;
			this._themeMetaCache = null;
		}
	},
	
	getTheme: function(){
        if (! this.theme) {
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

		var ro = davinci.ve.metadata.loadThemeMeta(model);
		//this._editor._visualChanged(); // do not know why we are calling this handler method inline
		return ro;
	},
	
	setSource: function(source, callback, scope, initParams){
		dojo.withDoc(this.getDocument(), "_setSource", this, [source, callback, scope, initParams]);
	},

	getDojoUrl: function(){
		var loc=davinci.Workbench.location();
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
		if(davinci.Runtime.singleProjectMode()) {
			return davinci.Runtime.getProject();
		}
	},
	
	getFullResourcePath: function() {
		var filename = this.getModel().fileName;
		return new davinci.model.Path(filename);
	},
	
	/**
	 * Get a full path for the given resource relative to the project base.
	 * @param resource {string} resource path segment
	 * @returns {davinci.model.Path} full path of resource
	 */
    getPathRelativeToProject: function(resource) {
		var fullLibPath = new davinci.model.Path(resource.getPath());
		return fullLibPath.relativeTo(this.getPath(),true).toString();	
    },

    /* ensures the file has a valid theme.  Adds the users default if its not there alread */
    loadTheme: function(){
    	/* 
    	 * Ensure the model has a default theme.  Defaulting to Claro for now, should
    	 * should load from prefs 
    	 * 
    	 * */
    	var model = this.getModel();
    	var defaultThemeName="claro";
    	var dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
        if (!dojoThemeSets){ 
            dojoThemeSets =  davinci.theme.dojoThemeSets;
            davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(),dojoThemeSets);
            
        }
        for (var i = 0; i < dojoThemeSets.themeSets.length; i++){
            if (dojoThemeSets.themeSets[i].name === davinci.theme.desktop_default){
                defaultThemeName = dojoThemeSets.themeSets[i].desktopTheme;
            }
        }
    	var imports = model.find({elementType:'CSSImport'});
		
		
		/* remove the .theme file, and find themes in the given base location */
		var allThemes = davinci.library.getThemes(davinci.Runtime.getProject());
		var themeHash = {};
		var defaultTheme;
		
		for(var i=0;i<allThemes.length;i++){
			
			if(allThemes[i].name==defaultThemeName) {
				defaultTheme = allThemes[i];
			}
			
			if (allThemes[i].files){ // #1024 some theme's may not contain files, themeMaps
			  //FIXME: this can't be right...
    			for(var k=0;k<allThemes[i].files.length;k++){
    			        themeHash[allThemes[i].files] = allThemes[i];
    			}
            }
		}
		/* check the header file for a themes CSS.  
		 * 
		 * TODO: This is a first level check, a good second level check
		 * would be to grep the body classes for the themes className. this would be a bit safer.
		 */
		
		for(var i=0;i<imports.length;i++){
			var url = imports[i].url;
			/* trim off any relative prefix */
			for(var themeUrl in themeHash){
				if(url.indexOf(themeUrl)  > -1){
					// theme already exists
					return true;
				}
			}
		}
		
		if (this._loadThemeDojoxMobile(this)){
            return;
        }
		var body = model.find({elementType:'HTMLElement', tag:'body'},true);
		body.setAttribute("class", defaultTheme.className);
		/* add the css */
		for(var i=0;i<defaultTheme.files.length;i++){
			var url = new davinci.model.Path(defaultTheme.file.getPath()).removeLastSegments(1).append(defaultTheme.files[i]).relativeTo(this.getPath(),true);
			this.addModeledStyleSheet(url.toString(), null, true);
		}
    },
    
// FIXME this bit of code should be moved to toolkit specific //////////////////////////////   
    _loadThemeDojoxMobile: function(context){
      
        var htmlElement = context._srcDocument.getDocumentElement();
        var head = htmlElement.getChildElement("head");
        var scriptTags=head.getChildElements("script");
        return dojo.some(scriptTags, function(tag) {
            var text=tag.getElementText();
                // Look for a dojox.mobile.themeMap in the document, if found set the themeMap 
               // var start = text.indexOf('dojox.mobile.themeMap');
            return text.length && text.indexOf('dojox.mobile.deviceTheme') != -1;
        });
    },
//////////////////////////////////////////////////////////////////////////////////////////////     
    
	_setSource: function(source, callback, scope, newHtmlParams){
		
		this._srcDocument=source;
		
		/* determinte if its the theme editor loading */
		if(!source.themeCssfiles){ // css files need to be added to doc before body content
			this.loadTheme();
			this.loadRequires("html.body", true/*doUpdateModel*/, false, true /* skip UI load */ );
		}
		/* ensure the top level body deps are met (ie. maqetta.js, states.js and app.css) */
		/* make sure this file has a valid/good theme */
		
		
		if (this.rootWidget){
			this.rootWidget._srcElement=this._srcDocument.getDocumentElement().getChildElement("body");
			this.rootWidget._srcElement.setAttribute("id", "myapp");
		}

		//FIXME: Need to add logic for initial themes and device size.
		if(newHtmlParams){
			var modelBodyElement = source.getDocumentElement().getChildElement("body");
			modelBodyElement.setAttribute(davinci.ve.Context.MOBILE_DEV_ATTR, newHtmlParams.device);
			modelBodyElement.setAttribute(davinci.preference_layout_ATTRIBUTE, newHtmlParams.flowlayout);
		}

		var data = this._parse(source);
		this._scriptAdditions=data.scriptAdditions;
		//debugger;
		if(!this.frameNode){
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
				dojo.some(davinci.library.getUserLibs(resourceBase.toString()), function(lib) {
					if (lib.id === "dojo") {
						
						var fullDojoPath = new davinci.model.Path(this.getBase()).append(lib.root).append("dojo/dojo.js");
						dojoUrl = fullDojoPath.relativeTo(this.getPath(),true).toString();
						//dojoUrl = new davinci.model.Path(this.relativePrefix).append(lib.root).append("dojo/dojo.js").toString();
						return true;
					}
					return false;
				}, this);
				// if still not defined, use app's Dojo (which may cause other issues!)
				if (!dojoUrl) {
					dojoUrl = this.getDojoUrl();
					console.warn("WARNING: Falling back to use workbench's Dojo in the editor iframe");
				}
			}
			
			var containerNode = this.containerNode;
			containerNode.style.overflow = "hidden";
			var frame = dojo.create("iframe", this.iframeattrs, containerNode);
			frame.dvContext = this;
//			/* this defaults to the base page */
			var realUrl = davinci.Workbench.location() + "/" ;
			
			/* change the base if needed */
			
			if(this.baseURL){
				realUrl = this.baseURL;
			}

// TODO: This needs to be more flexible to allow things like HTML5 DOCTYPE's (should be based on a preference)
			var doc = frame.contentDocument || frame.contentWindow.document,
				win = dijit.getDocumentWindow(doc),
				head = "<!DOCTYPE html>";
// TODO: margin:0 is a temporary hack. In previous releases, we always included dojo.css
// which set margin:0, but we now only include dojo.css with the first Dojo widget
// added to the page. That causes scrollbars when page was loaded initially,
// which went want when first Dojo widget was added.
// Need to rethink this whole business of width:100%;height:100%;margin:0
			head += "<html style=\"height: 100%; width: 100%; margin:0;\"><head><base href=\"" + realUrl + "\"/>";

			// XXX Must load dojo.js here;  we cannot wait to add it when first Dojo/Dijit widget
			//   is dropped on page.  The reason is that dojo.js from the SDK (which is what we use
			//   when developing) cannot be dynamically inserted into a page -- only built versions
			//   of Dojo can do so.  For that reason, we load it here.  Also, Phil says that Dojo
			//   may be required for doing some things in the editor iframe, such as the focus
			//   rectangles.  This means that Dojo will always have to be available in the iframe
			//   (even if user hasn't selected the Dojo lib) until those dependencies are removed.
			//   See bug 7585.
			if (dojoUrl) {
				// XXX Invoking callback when dojo is loaded.  This should be refactored to not
				//  depend on dojo any more.  Once issue, though, is that the callback function
				//  makes use of dojo and thusly must be invoked only after dojo has loaded.  Need
				//  to remove Dojo dependencies from callback function first.
				var baseUserWorkspace = system.resource.getRoot().getURL() + "/" + this._getWidgetFolder();
				var config = {
					modulePaths: {widgets: baseUserWorkspace}
				};
				dojo.mixin(config, this._configProps);

				var requires = this._bootstrapModules.split(","),
					dependencies = ['dojo/parser', 'dojox/html/_base', 'dojo/domReady!'];
				dependencies = dependencies.concat(requires);  // to bootstrap references to base dijit methods in container

				head += "<script type=\"text/javascript\" src=\"" + dojoUrl + "\" data-dojo-config=\"" + JSON.stringify(config).slice(1, -1) + "\"></script>"
					+ "<script type=\"text/javascript\">require(" + JSON.stringify(dependencies) + ", top.loading" + this._id + ");</script>";
			}
			var helper = davinci.theme.getHelper(this._visualEditor.theme);
			if (helper && helper.getHeadImports){
			    head += helper.getHeadImports(this._visualEditor.theme);
			} else if(source.themeCssfiles) { // css files need to be added to doc before body content
				head += '<style type="text/css">'
					+ source.themeCssfiles.map(function(file) { return '@import "' + file + '";'; }).join();
					+ '</style>';
			}
			/*
			else{
				this.loadTheme();
			}
			*/
			//head += '<style type="text/css">@import "claro.css";</style>';
			head += "</head><body></body></html>";

			var context = this;
			window["loading" + context._id] = function(parser, htmlUtil) { //FIXME: should be able to get doc reference from domReady! plugin?
				delete window["loading" + context._id];
				var callbackData = context;
			try {
					var win = dijit.getDocumentWindow(doc),
					 	body = (context.rootNode = doc.body);
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

					body._edit_context = context; // TODO: find a better place to stash the root context
					context._configDojoxMobile();

					var requires = context._bootstrapModules.split(",");
					if (requires.indexOf('dijit/dijit-all') != -1){
						win.dojo._postLoad = true; // this is needed for FF4 to keep dijit._editor.RichText from throwing at line 32 dojo 1.5						
					}

					context.frameNode = frame;
					// see Dojo ticket #5334
					// If you do not have this particular dojo.isArray code, DataGrid will not render in the tool.
					// Also, any array value will be converted to {0: val0, 1: val1, ...}
					// after swapping back and forth between the design and code views twice. This is not an array!
					win.require("dojo/_base/lang").isArray = win.dojo.isArray=function(it){
						return it && Object.prototype.toString.call(it)=="[object Array]";
					};
				} catch(e) {
					console.error(e);
					// recreate the Error since we crossed frames
					callbackData = new Error(e.message, e.fileName, e.lineNumber);
					dojo.mixin(callbackData, e);
				}

				context._continueLoading(data, callback, callbackData, scope);
			};

			doc.open();
			doc.write(head);
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

		}else{
			if(!this.getGlobal()){
				console.warn("Context._setContent called during initialization");
			}
			// frame has already been initialized, changing content (such as changes from the source editor)
			this._continueLoading(data, callback, this, scope);
		}
	},

	_continueLoading: function(data, callback, callbackData, scope) {
		var loading;
		try {
			loading = dojo.create("div",
					{innerHTML: dojo.replace('<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;{0}</td></tr></table>', ["Loading..."])}, // FIXME: i18n
					this.frameNode.parentNode,
					"first");
			dojo.addClass(loading, 'loading');

			if (callbackData instanceof Error) {
				throw callbackData;
			}

			var promise = this._setSourceData(data);

			loading.parentNode.removeChild(loading); // need to remove loading for silhouette to display
		} catch(e) {
			// recreate the Error since we crossed frames
			callbackData = new Error(e.message, e.fileName, e.lineNumber);
			dojo.mixin(callbackData, e);
			loading.innerHTML = "Uh oh! An error has occurred:<br><b>" + e.message + "</b><br>file: " + e.fileName + "<br>line: "+e.lineNumber; // FIXME: i18n
			dojo.addClass(loading, 'error');
		}
		if (callback) {
			promise.then(function(){
				callback.call((scope || this), callbackData); // FIXME: use hitch?  use errback for the error case?
			}.bind(this));
		}
	},

	_setSourceData: function(data){
		
		/* cache the theme metadata */	
		this.themeChanged();
		var theme = this.getThemeMeta();
		if(theme && theme.usingSubstituteTheme){
			var oldThemeName = theme.usingSubstituteTheme.oldThemeName;
			var newThemeName = theme.usingSubstituteTheme.newThemeName;
			for(var ss=0;ss<data.styleSheets.length; ss++){
				var sheet=data.styleSheets[ss];
				data.styleSheets[ss] = sheet.replace(new RegExp("/"+oldThemeName,"g"),"/"+newThemeName);
			}
			data.bodyClasses = data.bodyClasses.replace(new RegExp("\\b"+oldThemeName+"\\b","g"),newThemeName);
			//FIXME: Needs to be globalized
			if(this._editor && this._editor.visualEditor && this._editor.visualEditor._onloadMessages){
				this._editor.visualEditor._onloadMessages.push("Warning. File refers to CSS theme '"+oldThemeName+"' which is not in your workspace. Using CSS theme '"+newThemeName+" instead.");
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
	    dojo.publish('/davinci/ui/context/loaded', [this]);
	},

	/**
	 * Process dojoType, oawidget and dvwidget attributes on text content for containerNode
	 */
	_processWidgets: function(containerNode, attachWidgets, states, scripts) {
		dojo.forEach(dojo.query("*", containerNode), function(n){
			var type = n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			//doUpdateModelDojoRequires=true forces the SCRIPT tag with dojo.require() elements
			//to always check that scriptAdditions includes the dojo.require() for this widget.
			//Cleans up after a bug we had (7714) where model wasn't getting updated, so
			//we had old files that were missing some of their dojo.require() statements.
			this.loadRequires(type, false/*doUpdateModel*/, true/*doUpdateModelDojoRequires*/);
			this.preProcess(n);
//			this.resolveUrl(n);
			this._preserveStates(n, states);

		}, this);
		var promise = new dojo.Deferred();
		this.getGlobal()["require"]("dojo/ready")(function(){
			try {
				this.getGlobal()["require"]("dojo/parser").parse(containerNode);
				promise.callback();
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

				promise.errback();
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

		return promise;
	},
	
   preProcess: function (node){
         //need a helper to pre process widget
        var type = node.getAttribute("dojoType");
        var helper = davinci.ve.widget.getWidgetHelper(type);
        if(helper && helper.preProcess){
            helper.preProcess(node, this);
        }
        
    },
	    
	_editorSelectionChange: function(event){
		// we should only be here do to a dojo.parse exception the first time we tried to process the page
		// Now the editor tab container should have focus becouse the user selected it. So the dojo.processing should work this time
		if (event.editor.fileName === this._editor.fileName){
			dojo.unsubscribe(this._editorSelectConnection);
			delete this._editorSelectConnection;
			this._setSource(this._srcDocument, null, null, null);
		}
	},

	_attachAll: function()
	{
		var rootWidget=this.rootWidget=new davinci.ve.HTMLWidget({},this.rootNode);
		rootWidget._edit_context=this;
		rootWidget.isRoot=true;
		rootWidget._srcElement=this._srcDocument.getDocumentElement().getChildElement("body");
		rootWidget._srcElement.setAttribute("id", "myapp");
		this._attachChildren(this.rootNode);
	},

	_attachChildren: function (containerNode)
	{
		dojo.query("> *", containerNode).map(davinci.ve.widget.getWidget).forEach(this.attach, this);
		var currentStateCache = [];
		var rootWidget = containerNode._dvWidget;
		rootWidget._srcElement.visit({ visit: function(element){
			if (element.elementType=="HTMLElement")
			{
				var stateSrc=element.getAttribute(davinci.ve.states.ATTRIBUTE);
				if (stateSrc && stateSrc.length>0)
				{
					var id=element.getAttribute("id");
					var widget;
					if (id){
					  widget=davinci.ve.widget.byId(id);
					}else{
						if (element==rootWidget._srcElement){
							widget=rootWidget;
						}
					}	
					var states = davinci.states.deserialize(stateSrc);
					delete states.current; // FIXME: Always start in normal state for now, fix in 0.7
					
					var state = davinci.ve.states.getState(widget);
					if (state) { // remember which widgets have state other than normal so we can trigger a set later to update styles of their children
						currentStateCache.push({ widget: widget, state: state});
					}
				}
			}
		}});
		// Wait until after all states attributes are restored before setting states, so all child attributes are updated properly
		for (var i in currentStateCache) {
			var item = currentStateCache[i];
			davinci.ve.states.setState(item.widget, item.state, true);
		}
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
		dojo.query("> *", this.rootNode).map(davinci.ve.widget.getWidget).forEach(function(widget){
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
		var values = (davinci.ve.widget.parseStyleValues(style));
		if(this._header){
			var oldValues = davinci.ve.widget.parseStyleValues(this._header.style);
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
//		davinci.ve.widget.setStyleValues(this.container, values); //TODO
	},

	/**
	 * Load the style sheet into the page's DOM.
	 * @param url {string}
	 */
	loadStyleSheet: function(url) {
        // don't add if stylesheet is already loaded in the page
		var links = this._links,
		    doc = this.getDocument();
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
    	        },
	            doc.getElementsByTagName('head')[0]
	        );
	        
	        links.push(link);
		});
	},

	/**
	 * Remove style sheet from page's DOM.
	 * @param url {string}
	 */
    unloadStyleSheet: function(url) {
        var self = this;
        this._links.some(function(val, idx) {
            if (val.getAttribute('href') === url) {
                self._links.splice(idx, 1);
                dojo.destroy(val);
                return true; // break
            }
        });
    },

	addModeledStyleSheet: function(url, libBasePath, skipDomUpdate) {
		if(!skipDomUpdate) this.loadStyleSheet(url);
		if (!this.model.hasStyleSheet(url)) {
			this.model.addStyleSheet(url);
			for (var css in this.model._loadedCSS) {
				dojo.connect(this.model._loadedCSS[css], 'onChange', this,
						'_themeChange');
			}
		}
	},

	_themeChange: function(e){
		if (e && e.elementType === 'CSSRule'){
			this.hotModifyCssRule(e);
		}
	},

// XXX no 'getRealUrl()' exists in this class
//	resolveUrl: function(node){
//		if(!node){
//			return;
//		}
//		var type = (node.getAttribute("dvwidget") || node.getAttribute("oawidget") || node.getAttribute("dojoType") || "html." + node.nodeName.toLowerCase());
//		var metadata = davinci.ve.metadata.getMetadata(type);
//		if(!metadata.resolveUrl){
//			return;
//		}
//		var properties = metadata.properties;
//		if(!properties){
//			return;
//		}
//
//// SHOULDN'T be necessary to do this, urls should already be relative (or absolute), no need to remap them		
////		for(var name in properties){
////			var property = properties[name];
////			if(property.type == "url"){
////				var value = node.getAttribute(name);
////				if(value){
////					value = this.getRealUrl(value);
////					node.setAttribute(name, value);
////				}
////			}
////		}
//	},
	
	// preserve states specified to node
	_preserveStates: function(node, cache){
		var states = davinci.ve.states.retrieve(node);
		if (states) {
			cache[node.id] = states;
		}
	},

	// restore states into widget
	_restoreStates: function(){
		var cache = this._loadFileStatesCache;
		if(!cache){
			console.error('Context._restoreStates: this._loadFileStatesCache missing');
			return;
		}
		var currentStateCache = [];
		for(var id in cache){
			//FIXME: This logic depends on the user never add ID "body" to any of his widgets.
			//That's bad. We should find another way to achieve special case logic for BODY widget.
			var node = id == "body" ? this.getContainerNode() : this.getDocument().getElementById(id);
			var widget = davinci.ve.widget.getWidget(node);
			var states = cache[id];
			states = davinci.states.deserialize(states);
			delete states.current; // FIXME: Always start in normal state for now, fix in 0.7
			davinci.ve.states.store(widget, states);
			
			var state = davinci.ve.states.getState(widget);
			if (state) { // remember which widgets have state other than normal so we can trigger a set later to update styles of their children
				currentStateCache.push({ widget: widget, state: state});
			}
		}
		// Wait until after all states attributes are restored before setting states, so all child attributes are updated properly
		for (var i in currentStateCache) {
			var item = currentStateCache[i];
			davinci.ve.states.setState(item.widget, item.state, true);
		}
	},

	getDocument: function(){
		var container = this.getContainerNode();
		return container && container.ownerDocument;
	},

	getGlobal: function(){
		return dijit.getDocumentWindow(this.getDocument());
	},

	getDojo: function(){
		var win = this.getGlobal();
		return win.dojo || dojo;
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
/*
		var containerNode = this.getContainerNode();
		var x = position.x + containerNode.scrollLeft;
		var y = position.y + containerNode.scrollTop;
		return {x: x, y: y};
*/
		return position;
	},

	getCommandStack: function(){
		return this._commandStack;
	},

	getSelection: function(){
		if(!this._selection){
			return [];
		}
		return this._selection;
	},
	
	updateFocus: function(widget, index, inline){
		var box, op, parent;

		if (!davinci.ve.metadata.queryDescriptor(widget.type, "isInvisible")) {
			var node = widget.getStyleNode(),
				helper = widget.getHelper();
			if(helper && helper.getSelectNode){
				node = helper.getSelectNode(this) || node;
			}
			box = this.getDojo().position(node, true);
			box.l = box.x;
			box.t = box.y;

			parent = widget.getParent();
			op = {move: !(parent && parent.isLayout())};

			//FIXME: need to consult metadata to see if layoutcontainer children are resizable, and if so on which axis
			var resizable = (parent && parent.isLayout() ) ?
					"none" : davinci.ve.metadata.queryDescriptor(widget.type, "resizable");
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
			hasLayout: widget.isLayout(),
			isChild: parent && parent.isLayout()
		}, index, inline);
			
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
			var helper = this._needsTearDown && this._needsTearDown.getHelper();
			if(helper && helper.tearDown){
				if(helper.tearDown(this._needsTearDown, widget)){
					delete this._needsTearDown;
				}
			}

			helper = widget.getHelper();			
			if(helper && helper.popup){
				helper.popup(this._needsTearDown = widget);
			}

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

		var helper = this._needsTearDown && this._needsTearDown.getHelper();
		if(helper && helper.tearDown){
			if(helper.tearDown(this._needsTearDown, widget)){
				delete this._needsTearDown;
			}
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
	
	focus: function(state, index, inline){
		if(!this._focuses){
			this._focuses = [];
		}
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
				focus = new davinci.ve.Focus();
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
				focus.allow(state.op);
				if(focus.domNode.parentNode != containerNode){
					containerNode.appendChild(focus.domNode);
				}
				focus.show(w[0],inline);
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
		return dojo.mixin({}, davinci.ve._preferences);
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
			flowLayout = bodyElement.getAttribute(davinci.preference_layout_ATTRIBUTE);
		if (!flowLayout){ // if flowLayout has not been set in the context check the edit prefs
			var editorPrefs = davinci.workbench.Preferences.getPreferences('davinci.ve.editorPrefs', davinci.Runtime.getProject());
			flowLayout = editorPrefs.flowLayout;
			this.setFlowLayout(flowLayout);
		} else {
			flowLayout = (flowLayout === 'true');
		}
		return flowLayout;
	},
	
	setFlowLayout: function(flowLayout){
		var htmlElement=this.getDocumentElement();
		var bodyElement=htmlElement.getChildElement("body");
		bodyElement.addAttribute(davinci.preference_layout_ATTRIBUTE,''+flowLayout);
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

	onMouseDown: function(event){
		if(this._activeTool && this._activeTool.onMouseDown && !this._blockChange){
			this._activeTool.onMouseDown(event);
		}
		this.blockChange(false);
	},
	
	onDblClick: function(event){
		if(this._activeTool && this._activeTool.onDblClick && !this._blockChange){
			this._activeTool.onDblClick(event);
		}
		this.blockChange(false);
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
		this.getContainerNode().focus();
	},

	onMouseOut: function(event){
		if(this._activeTool && this._activeTool.onMouseOut){
			this._activeTool.onMouseOut(event);
		}
		
	},
	
	onExtentChange: function(focus, box, cursorOnly){
		if(this._activeTool && this._activeTool.onExtentChange && !this._blockChange){
			var index = dojo.indexOf(this._focuses, focus);
			if(index >= 0){
				this._activeTool.onExtentChange(index, box, cursorOnly);
			}
		}
		this.blockChange(false);
	},

	_parse: function(source){
		var data = {metas: [], scripts: [], modules: [], styleSheets: []},
		 	htmlElement = source.getDocumentElement(),
		 	head = htmlElement.getChildElement("head"),
		 	bodyElement = htmlElement.getChildElement("body");

		this._uniqueIDs = {};
		if (bodyElement)
		{
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
			data.content = bodyElement.getElementText({includeNoPersist:true});
			var states = bodyElement.getAttribute(davinci.ve.states.ATTRIBUTE);
			davinci.ve.states.store(data, states);

			this.setPreference("flowLayout", 
					bodyElement.getAttribute(davinci.preference_layout_ATTRIBUTE) !== 'false');
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

				//TODO: grab AMD dependencies

				data.scriptAdditions=scriptTag;
			}
			
			// XXX Bug 7499 - (HACK) See comment in addHeaderScript()
			if (/.*(\/)*maqetta\/States.js$/.test(value)) {
				this._statesJsScriptTag = scriptTag;
			}
		}, this);
		if (!this._statesJsScriptTag) {   // XXX Bug 7499
			console.warn("Failed to find States.js script tag.  States and dojox.mobile widgets may not work properly");
		}
		var styleTags=head.getChildElements("style");
		dojo.forEach(styleTags, function (styleTag){
			dojo.forEach(styleTag.children,function(styleRule){
				if (styleRule.elementType=="CSSImport")
					data.styleSheets.push(styleRule.url);
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
		if(this._actionGroups){
			dojo.forEach(this._actionGroups, function(g){
				var action = g.getAction(event, this);
				if(action){
					action.run(this);
				}
			}, this);
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
	},

	onSelectionChange: function(selection){
		this._cssCache = {};
		
		dojo.publish("/davinci/ui/widgetSelected",[selection]);
	},

	hotModifyCssRule: function(r){
		
		function updateSheet(sheet, rule){
			
			var fileName = rule.parent.getResource().getURL();
			var selectorText = rule.getSelectorText();
			selectorText = selectorText.replace(/^\s+|\s+$/g,""); // trim white space
			var rules = sheet.cssRules;
			var foundSheet = findSheet(sheet, fileName);
			if (foundSheet){
				rules = foundSheet.cssRules;
				var r;
				for (r = 0; r < rules.length; r++){
					if (rules[r] instanceof CSSStyleRule){
						if (rules[r].selectorText == selectorText) {
							/* delete the rule if it exists */
							foundSheet.deleteRule(r);
							//console.log("------------  Hot Modify " + foundSheet.href + " ----------------:=\n" + text + "\n");
							break;
						}
					}
				}
				var text = rule.getText({noComments:true});
				foundSheet.insertRule(text, r);
				return true;
			}
			return false;
			
		}
		
		function findSheet(sheet, sheetName){
			if (sheet.href == sheetName){
				return sheet;
			}
			var foundSheet;
			var rules = sheet.cssRules;
			for (var r = 0; r < rules.length; r++){
				if (rules[r] instanceof CSSImportRule){
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
		
		var document = this.getDocument();
		var sheets = document.styleSheets; 
		for (var i=0; i < sheets.length; i++){
			if (updateSheet(sheets[i],r)){
				break;
			}
		}
	},

	modifyRule: function(rule, values){
		var shorthands = davinci.html.css.shorthand;
		var cleanValues = [];
		
		/* re-order properties */
		
		for(var j=0;j<shorthands.length;j++){
			for(var i=0;i<shorthands[j].length;i++){
					var prop = rule.getProperty(shorthands[j][i]);
					if(shorthands[j][i] in values){
						cleanValues.push({name:shorthands[j][i], value:values[shorthands[j][i]]});
						delete values[shorthands[j][i]];
					}else if(prop){
						cleanValues.push({name:shorthands[j][i], value:prop.getValue()});
					}
				if(prop){
					rule.removeProperty(shorthands[j][i]);
				}
			}
		}
		
		for(var i = 0;i<cleanValues.length;i++){
			if(cleanValues[i].value){
				rule.addProperty(cleanValues[i].name, cleanValues[i].value);
			}
		}
		
		for(var name in values){
			rule.setProperty(name, values[name]);
		}
		
		this.hotModifyCssRule(rule); 
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
		if(widget.length>0)
			widget = widget[0];
		
		var widgetType = theme.loader.getType(widget);
		var selector = [];
		for(var i =0;i<target.length;i++) {
			selector = selector.concat( theme.metadata.getRelativeStyleSelectorsText(widgetType,state,null,target));
		}
		
		return selector;
	},
	getSelector: function( widget, target){
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
		if (this._editor.editorID == 'davinci.ve.ThemeEditor'){
			state = davinci.ve.states.getState();
		}
		
		var widgetType = theme.loader.getType(widget);
		
		var metadata = theme.metadata.getStyleSelectors(widgetType,state);
		if(metadata){
			for(var name in metadata){
				var found = false;
				for(var i=0;i<metadata[name].length;i++){
					for(var s = 0;s<target.length;s++)
						if(target[s]==metadata[name][i]){
							return name;
						}
				}
	
			}
		}
		
	},
	
	getMetaTargets: function(widget, target){
		var name = this.getSelector(widget,target);
		var model = this.getModel();
		return model.getRule(name);
		
	},
	
	/* returns the top/target dom node for a widget for a specific property */
	
	getWidgetTopDom: function (widget,propertyTarget){
	
		var selector = this.getSelector(widget, propertyTarget);
		// find the DOM node associated with this rule.
		function findTarget(target, rule){
			if(rule.matches(target))
				return target;
			for(var i = 0;i<target.children.length;i++){
				return findTarget(target.children[i], rule);
			}
		}
		if(selector){
			var rule = new davinci.html.CSSRule();
			rule.setText(selector + "{}");
			return findTarget(widget.domNode || widget, rule);
		}
		return null;
	},
	
	getSelectionCssRules: function(targetDomNode){
		if (!this._cssCache) { this._cssCache = {}; } // prevent undefined exception in theme editor
		var hashDomNode = function (node) {
			return node.id + "_" + node.className;
			
		}
		var selection = this.getSelection();
		if(!targetDomNode && selection.length==0){
			return {rules:null, matchLevels:null};
		}
		
		var targetDom = targetDomNode || selection[0].domNode || selection[0];
		
		var domHash = hashDomNode(targetDom);
		
		/*
		if(this._cssCache[domHash])
			return this._cssCache[domHash];
		*/
		
		if(selection.length){
			
			var matchLevels = [];
			this._cssCache[domHash] =  this.model.getMatchingRules(targetDom, true);
			
			
			for(var i =0;i<this._cssCache[domHash].rules.length;i++){
				/* remove stale elements from the cache if they change */
				var handle = dojo.hitch(this._cssCache[domHash].rules[i],"onChange",this,function(){
					delete this._cssCache[domHash];
					dojo.unsubscribe(handle);
				});
			}
			
			return this._cssCache[domHash];
		}

		return {rules:null, matchLevels:null};
	},
	
	getStyleAttributeValues: function(widget){
		var v = widget ? widget.getStyleValues() : {};
		
		var isNormalState = davinci.ve.states.isNormalState();
		if (!isNormalState) {
			var stateStyleValues = davinci.ve.states.getStyle(widget);
			dojo.mixin(v, stateStyleValues);
		}
		
		return v;
	},
	
	 getUniqueID: function(node, persist, idRoot) {
		 var id = node.getAttribute("id");
		 if (!id) {
			 var userDoc = this.rootWidget ? this.rootWidget.domNode.ownerDocument : null,
			 	root = idRoot || node.tag,
			 	num;

			 while(1){
				 if (!this._uniqueIDs.hasOwnProperty(root)) {
					 num = this._uniqueIDs[root]=0;
				 } else {
					 num=++this._uniqueIDs[root];
				 }
				 id=root+"_"+num;	
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
			 var noPersist = !persist;
			 node.addAttribute("id",id,noPersist);	 
		 }
		 return id;
	},

	addJavaScript: function(url, text, doUpdateModel, doUpdateModelDojoRequires, baseSrcPath,skipDomUpdate) {
		
		if (url) {
			var isDojoJS = /\/dojo.js$/.test(url);
			// XXX HACK: Don't add dojo.js to the editor iframe, since it already has an instance.
			//	  Adding it again will overwrite the existing Dojo, breaking some things.
			//	  See bug 7585.
			if (!isDojoJS && !skipDomUpdate) {
				var absoluteUrl = (new dojo._Url(this.getDocument().baseURI, url)).toString();
				dojo.withGlobal(this.getGlobal(),
						function() {
							dojo.xhrGet({
								url: absoluteUrl,
								sync: true,
								handleAs: "javascript"
							});
						});
			}
			if (doUpdateModel) {
				
				/* update the script if found */
				var elements = this._srcDocument.find({elementType:"HTMLElement", tag: 'script'});
				for(var i=0;i<elements.length;i++){
					var n = elements[i];
					var elementUrl = n.getAttribute("src");
					if(elementUrl && elementUrl.indexOf(baseSrcPath) > -1){
						n.setAttribute("src", url);
						return;
					}
				}
				
				
				if (isDojoJS) {
					// XXX Nasty nasty nasty special case for dojo attribute thats
					// required. Need to generalize in the metadata somehow.
					var fullPath = new davinci.model.Path(system.resource.getRoot().getPath());
					var urlPath = new davinci.model.Path(url);
					var relativeUrl = urlPath.relativeTo(fullPath);

					var config = {
						parseOnLoad: true,
						modulePaths: { widgets: this._dojoModulePath + "/" + this._getWidgetFolder() }
					};
					dojo.mixin(config, this._configProps);
					this.addHeaderScript(url, {
						"data-dojo-config": JSON.stringify(config).slice(1, -1)
					});
				}else{
					this.addHeaderScript(url);
				}
			}
		} else if (text) {
			/* run the requires if there is an iframe */
			if(!skipDomUpdate) { this.getGlobal()['eval'](text); }
		//	dojo.eval(text);
			if (doUpdateModel || doUpdateModelDojoRequires) {
				this._scriptAdditions = this.addHeaderScriptSrc(text, this._scriptAdditions,this.getDocumentElement().getChildElement('head'),this._statesJsScriptTag);
			}
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
		
		var script = new davinci.html.HTMLElement('script');
		script.addAttribute('type', 'text/javascript');
		script.addAttribute('src', url);
		
		if (attributes) {
			for (var name in attributes) {
				script.addAttribute(name, attributes[name]);		
			}
		}
		
		var head =  this._srcDocument.find({elementType: 'HTMLElement', tag: 'head'}, true);
		// XXX Bug 7499 - (HACK) States.js needs to patch Dojo loader in order to make use of
		//	"dvStates" attributes on DOM nodes.  In order to do so, make sure State.js is one of
		//	the last scripts in <head>, so it is after dojo.js and other dojo files.  This code
		//	inserts all scripts before States.js.
		//	First, make sure that we've properly saved the location of States.js.  If, for
		//	whatever reason, this is not the case, then fall back to the original code of
		//	appending script to <head>.
		if (this._statesJsScriptTag) {
			head.insertBefore(script, this._statesJsScriptTag);
		} else {
			head.addChild(script);
		}
		
		//this.getHeader().scripts.push(url);
	},


	// add JS to HEAD
	addHeaderScriptSrc: function(text, scriptAdditions, head, statesJsScriptTag){
		
		var oldText = '';
		
		if (scriptAdditions){
			var scriptText = scriptAdditions.find({elementType: 'HTMLText'}, true);
			if(scriptText){
				oldText = scriptText.getText();
				if (oldText.indexOf(text)>0){
					return scriptAdditions;  // already in the header
				}
				scriptAdditions.parent.removeChild(scriptAdditions);
				}
			scriptAdditions = null;
		}
		// create a new script element
		var script = new davinci.html.HTMLElement('script');
		script.addAttribute('type', 'text/javascript');
		script.script = "";
	
		// XXX Bug 7499 - (HACK) See comment in addHeaderScript()
		if (statesJsScriptTag) {
			head.insertBefore(script, statesJsScriptTag);
		} else {
			head.addChild(script);
		}
		var newScriptText = new davinci.html.HTMLText();
		newScriptText.setText(oldText + "\n" + text); //wdr
		script.addChild(newScriptText); //wdr
		return script;
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
		var head = this._srcDocument.find({elementType: 'HTMLElement', tag: 'head'}, true);
		
		if (! allowDup) {
			// Does <head> already have an element that matches the given
			// element?  Only match based on significant attribute.  For
			// example, a <script> element will match if its 'src' attr is the
			// same as the incoming attr.  Same goes for <meta> and its 'name'
			// attr.
			var sigAttr = this._significantAttrs[tag] || 'src';
			var found = head.find({ elementType: 'HTMLElement', tag: tag })
					.some(function(elem) {
						return elem.getAttribute(sigAttr) === attrs[sigAttr];
					});
			if (found) {
				return;
			}
		}
		
		// add to Model...
		var elem = new davinci.html.HTMLElement(tag);
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
		var head = this._srcDocument.find({elementType: 'HTMLElement', tag: 'head'}, true);
		
		// remove from Model...
		head.find({ elementType: 'HTMLElement', tag: tag }).some(function(elem) {
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
			for (var name in attrs) if (attrs.hasOwnProperty(name)) {
				queryStr += '[' + name + '="' + attrs[name] + '"]';
			}
			//dojo.destroy(dojo.query(queryStr)[0]);
			var n = dojo.query(queryStr)[0];
			if (n){ // throws exception if n is null
			    dojo.destroy(n);
			}
		});
	},
	
	/**
	 * Perform any visual updates in response to mousemove event while performing a
	 * drag operation on the visual canvas.
	 * @param {object} params  object with following properties:
	 *      {object|array{object}} data  For widget being dragged, either {type:<widgettype>} or array of similar objects
	 *      {object} eventTarget  Node (usually, Element) that is current event.target (ie, node under mouse)
	 *      {object} position x,y properties hold current mouse location
	 * 		{object} rect  l,t,w,h properties define rectangle being dragged around
	 * 		{boolean} doSnapLines  whether to show dynamic snap lines
	 * 		{boolean} doFindParentsXY  whether to show candidate parent widgets
	 */
	dragMoveUpdate: function(params) {
		var context = this;
		var cp = this._chooseParent;
		var data = params.data;
		var eventTarget = params.eventTarget;
		var position = params.position;
		var rect = params.rect;
		var doSnapLines = params.doSnapLines;
		var doFindParentsXY = params.doFindParentsXY;
		var widgetType = dojo.isArray(data) ? data[0].type : data.type;

		// inner function that gets called recurively for each widget in document
		// The "this" object for this function is the Context object
		_updateThisWidget = function(widget){
			var node = widget.domNode;
			var dj = this.getDojo();
			var computed_style = dj.style(node);
			if(doSnapLines){
				davinci.ve.Snap.findSnapOpportunities(this, widget, computed_style);
			}
			if(doFindParentsXY){
				// Two steps: (1) compute allowed parents at current (x,y)...
				cp.findParentsXY(data, widget, position);
				// (2) Update visual presentation of allowed parents at current (x,y)
				cp.dragUpdateCandidateParents(widgetType, doFindParentsXY);
			}
			// Recurse through this widget's children
			dojo.forEach(widget.getChildren(), function(w){
				_updateThisWidget.apply(context, [w]);
			});
		};
		
		if(doSnapLines || doFindParentsXY){
			if(doSnapLines){
				doSnapLines = davinci.ve.Snap.updateSnapLinesBeforeTraversal(this, rect);
			}
			if(doFindParentsXY){
				doFindParentsXY = cp.findParentsXYBeforeTraversal(params);
				// Call dragUpdateCandidateParents so that (usually) "BODY" will show as initial list of parent widgets
				cp.dragUpdateCandidateParents(widgetType, doFindParentsXY);
			}
			// Traverse all widgets, which will result in updates to snap lines and to 
			// the visual popup showing possible parent widgets 
			dojo.forEach(this.getTopWidgets(), function(w){
				_updateThisWidget.apply(context, [w]);
			});
			if(doSnapLines){
				davinci.ve.Snap.updateSnapLinesAfterTraversal(this);
			}
			if(doFindParentsXY){
				cp.findParentsXYAfterTraversal();
			}
		}

	},
	
	/**
	 * Cleanups after completing drag operations.
	 */
	dragMoveCleanup: function() {
		davinci.ve.Snap.clearSnapLines(this);
		this._chooseParent.cleanup(this);
	}
});

davinci.ve._contextCount = 0;
davinci.ve._preferences = {};
davinci.ve.Context.MOBILE_DEV_ATTR = 'data-maqetta-device';
