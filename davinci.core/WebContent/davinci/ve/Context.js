dojo.provide("davinci.ve.Context");

dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.tools.SelectTool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.util");
dojo.require("davinci.ve.Focus");
dojo.require("davinci.actions.SelectLayoutAction");
dojo.require("davinci.library");


dojo.declare("davinci.ve.Context", null, {

//	urlResolver: null,   // XXX not used
	moduleLoader: null,
	immediatePropertyUpdates: false,
	
	_subscriptions : [],
	_contentStyleSheet: document.baseURI + dojo.moduleUrl("davinci.ve", "resources/content.css"),
	// comma-separated list of modules to load in the iframe
	_bootstrapModules: "dijit.dijit",

	constructor: function(args){
		this._id = "_edit_context_" + davinci.ve._contextCount++;
		this._editor = args.editor;
		this._visualEditor = args.visualEditor;
		
		dojo.mixin(this, args);

		if(dojo.isString(this.containerNode)){
			this.containerNode = dijit.byId(this.containerNode);
		}

		this.hostNode = this.containerNode;

		this._commandStack = new davinci.commands.CommandStack(this);
		this._defaultTool = new davinci.ve.tools.SelectTool();

		this._widgetIds = [];
		this._objectIds = [];

		this.relativePrefix = this.relativePrefix || "";
		
//		this._subscriptions.push(dojo.subscribe("/davinci/ui/widget/replaced",
//				dojo.hitch(this,function(newWidget, widget){
//					if (this._selection)
//					{
//						var index=dojo.indexOf(this._selection,widget);
//						if(index >= 0){
//							this._selection[index]=newWidget;
//						}
//					}
//				})));
	},
	

	isActive: function(){
		return !!this._activeTool;
	},

	//FIXME: accessor func is unnecessary?
	getModel: function(){
		return this.model;
	},

	activate: function(){
		if(this.isActive()){
			return;
		}

		this.loadStyleSheet(this._contentStyleSheet);
		this._attachAll();

		var containerNode = this.getContainerNode();
		dojo.addClass(containerNode, "editContextContainer");
		if(this.getPreference("showLayoutGrid")){
			dojo.addClass(containerNode, "editLayoutGrid");
		}

		this._connects = [
			dojo.connect(this._commandStack, "onExecute", this, "onContentChange"),
			dojo.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
			dojo.connect(containerNode, "ondblclick", this, "onDblClick"),
			dojo.connect(containerNode, "onmousedown", this, "onMouseDown"),
			dojo.connect(containerNode, "onmousemove", this, "onMouseMove"),
			dojo.connect(containerNode, "onmouseup", this, "onMouseUp"),
			dojo.connect(containerNode, "onmouseout", this, "onMouseOut"),
			// When dragging from the top window to the editor, Safari only gets mouse events on the top document
			dojo.connect(this.hostNode, "onmousedown", this, "onMouseDown"),
			dojo.connect(this.hostNode, "onmousemove", this, "onMouseMove"),
			dojo.connect(this.hostNode, "onmouseup", this, "onMouseUp"),
			dojo.connect(this.hostNode, "onmouseout", this, "onMouseOut")
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
			this._activeTool = undefined;
		}
		var containerNode = this.getContainerNode();
		this._menu.unBindDomNode(containerNode);

		this.select(null);
		dojo.removeClass(containerNode, "editContextContainer");
		if(this.getPreference("showLayoutGrid")){
			dojo.removeClass(containerNode, "editLayoutGrid");
		}
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
				var tagName = widget.getTagName();
				widget.type = "html." + tagName;
//			}else if(widget.isOpenAjaxWidget){
//				widget.type = widget.domNode.getAttribute('oawidget');
			}else if(widget.isGenericWidget){
				widget.type = widget.domNode.getAttribute('dvwidget');
			}else if(widget.isObjectWidget){
				widget.type = widget.getObjectType();
			}else{
				widget.type = widget.declaredClass;
			}
		}

        widget.metadata = widget.metadata || davinci.ve.metadata.query(widget.type);
		var isContainer = davinci.ve.metadata.queryDescriptor(widget.type, "isContainer");
		
		widget.attach();
		
		if(type.substring(type.lastIndexOf(".") + 1).charAt(0) == "_"){  
			// internal widget, such as _StackButton, _Splitter
			return;
		}

		widget._edit_context = this;

		var id = widget.getId();
		if(id){
			davinci.ve._add(this._widgetIds, id);
		}
		var objectId = widget.getObjectId(widget);
		if(objectId){
			davinci.ve._add(this._objectIds, objectId);
		}

		if(widget.isHtmlWidget || widget.acceptsHTMLChildren || (isContainer && (widget.isGenericWidget || widget.isOpenAjaxWidget))){ //TODO: need a better test for ContentPane
				// Plain HTML content here.  Recurse on all tags
				dojo.query("> *", widget.containerNode ||widget.domNode).map(davinci.ve.widget.getWidget).forEach(this.attach, this);
		}else{
				// Recurse down widget hierarchy
				dojo.forEach(widget.getChildren(true), this.attach, this);
		}
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
		return davinci.model.Resource.findResource(this.getDocumentLocation());
	},

	loadRequires: function(type, updateSrc, doUpdateModelDojoRequires) {
		if (!type) {
			return false;
		}

		var module = type.split(".")[0];
		if (module == "html") {
			// no require
			return true;
		}
		
		var requires = davinci.ve.metadata.query(type, "require");
		if (!requires) {
		    return true;
		}
		
		var relativePath = new davinci.model.Path(this.relativePrefix);
		return dojo.every(requires, function(r) {
		    var src = r.src;
		    if (src) {    // resource with URL
                if (r.$library) {
                    // Since the metadata files are 'relocatable', we don't use the metadata's
                    //  value for $library.src.  Instead, we find the base URL for the user's
                    //  currently selected library.
                    var libVer = davinci.ve.metadata.getLibrary(r.$library).version;
                    if (!libVer) {
                    	libVer = davinci.ve.metadata.query(type, "library")[r.$library].version;
                    }
                    var libRoot = davinci.library.getLibRoot(r.$library, libVer);
                    if (!libRoot) {
                        console.warn("No library found for name = '" + r.$library +
                                "' version = '" + libVer + "'");
                        return false;   // kill dojo.every loop
                    }
                    src = relativePath.append(libRoot).append(src);
                } else {
                    console.warn("metadata resource does not specify 'library'");
                }
                src = src.toString();
                
                switch (r.type) {
                    case "javascript":
                        this.addJavaScript(src, null, updateSrc);
                        break;
                    case "css":
                        updateSrc ? this.addModeledStyleSheet(src) : this.loadStyleSheet(src);
                        break;
                    default:
                        console.warn("Unhandled metadata resource type '" + r.type +
                                "' for widget '" + type + "'");
                }
		    } else {  // resource with text content
		        switch (r.type) {
		            case "javascript":
		                this.addJavaScript(null, r.$text, updateSrc, doUpdateModelDojoRequires);
		                break;
		            default:
                        console.warn("Unhandled metadata resource type '" + r.type +
                                "' for widget '" + type + "'");
		        }
		    }
		    return true;
		}, this);
	},

	_require: function(module){
		try{
			this.getDojo()["require"](module);
		}catch(e){
			console.warn("FAILED: Context.js _require failure for module="+module);
		}
	},

	themeChanged : function(){
		var changed = true;
		// check for false alarms to avoid reloading theme
		var model = this.getModel();
		if(this._themeUrl){
			var style = model.find({'elementType':'CSSImport', 'url':this._themeUrl},true);
			if(style!=null && style.length!=0)
				changed = false;
		}
		if(changed){
			this._theme = null;
			this._themeMetaCache = null;
		}
	},
	
	getTheme : function(){
		
		if(this._theme==null)
			this.getThemeMeta();
		return this._theme;
	}, 
	
	getThemeMeta: function(){
		// try to find the theme using path magic
		if(this._themeMetaCache)
			return this._themeMetaCache;
		
		var model = this.getModel();
		var style = model.find({'elementType':'HTMLElement', 'tag':'style'});
		var imports = [];
		for(var z=0;z<style.length;z++){
			for(var i=0;i<style[z].children.length;i++){
				if(style[z].children[i]['elementType']== 'CSSImport')
					imports.push(style[z].children[i]);
			}
		}
		var allThemes = davinci.library.getThemes();
		var themeHash = {};
		for(var i=0;i<allThemes.length;i++){
			var themePath = new davinci.model.Path(allThemes[i]['file'].getPath());
			themePath.removeLastSegments(1);
			for(var k=0;k<allThemes[i]['files'].length;k++){
				var cssUrl = themePath.append( new davinci.model.Path(allThemes[i]['files']));
				themeHash[cssUrl] = allThemes[i];
			}
		}
		for(var i=0;i<imports.length;i++){
			var url = imports[i].url;
			/* trim off any relative prefix */
			while(url.substring(0)=='.' || url.substring(0)=='/')
				url = url.substring(1);
			if(themeHash[url]){
				this._themeUrl = url;
				this._themeMetaCache =  davinci.library.getMetaData(themeHash[url]);
				this._theme = themeHash[url];
				return this._themeMetaCache;
			}
		}
	},
	
	setSource: function(source, callback, scope){
		dojo.withDoc(this.getDocument(), "_setSource", this, [source, callback, scope]);
	},

	getDojoUrl : function(){
		 var loc=location.href;
			if (loc.charAt(loc.length-1)=='/')
				loc=loc.substring(0,loc.length-1);
			
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
					break; // "first Dojo wins"
				}
			}
		}	
		
	},
	
	
	_setSource: function(source, callback, scope){
		
		this._srcDocument=source;
		if (this.rootWidget){
			this.rootWidget._srcElement=this._srcDocument.getDocumentElement().getChildElement("body");
			this.rootWidget._srcElement.setAttribute("id", "myapp");
		}
		var data = this._parse(source);
		this._scriptAdditions=data.scriptAdditions;
//		if(this.urlResolver){	   // XXX not used
//			data.scripts = dojo.map(data.scripts, this.getRealUrl, this);
//			data.styleSheets = dojo.map(this._checkSheets(data), this.getRealUrl, this);
//		}

		if(!this._frameNode){ // initialize frame
			var dojoUrl;
			
			dojo.some(data.scripts, function(url){
				if(url.indexOf("/dojo.js") != -1){
					dojoUrl = url;
					return true;
				}
				return false;
			});
			
			if (!dojoUrl) {
			    // pull Dojo path from installed libs, if available
			    dojo.some(davinci.library.getUserLibs(), function(lib) {
			        if (lib.id === "dojo") {
			            dojoUrl = new davinci.model.Path(this.relativePrefix).append(lib.root)
			                    .append("dojo/dojo.js").toString();
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
			var realUrl = dojo.global.location.href + "/" ;
			
			/* change the base if needed */
			
			if(this.baseURL){
				realUrl = this.baseURL;
			}

// TODO: This needs to be more flexible to allow things like HTML5 DOCTYPE's (should be based on a preference)
			var doc = (frame.contentDocument || frame.contentWindow.document);
			var win = dijit.getDocumentWindow(doc);
			var head = "<!DOCTYPE html>";
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
				var inx=dojoUrl.lastIndexOf('/');
				// XXX Invoking callback when dojo is loaded.  This should be refactored to not
				//  depend on dojo any more.  Once issue, though, is that the callback function
				//  makes use of dojo and thusly must be invoked only after dojo has loaded.  Need
				//  to remove Dojo dependencies from callback function first.
				head += "<script>djConfig={addOnLoad:top.loading" + this._id + ", baseUrl:'"+dojoUrl.substr(0,inx+1)+"' }</script>";
				head += "<script type=\"text/javascript\" src=\"" + dojoUrl + "\"></script>";
			}

			if(source.themeCssfiles){ // css files need to be added to doc before body content
				head += '<style type="text/css">';
				for(var i = 0;i < source.themeCssfiles.length;i++){
					head += '@import "'+ source.themeCssfiles[i] + '";\n';
				}
				head += '</style>';
			}
			//head += '<style type="text/css">@import "claro.css";</style>';
            head += "</head><body>";
            if (dojoUrl) {
                // Since this document was created from script, DOMContentLoaded and window.onload never fire.
                // Call dojo._loadInit manually to trigger the Dojo onLoad events for Dojo < 1.7
                head += "<script>if(dojo._loadInit)dojo._loadInit();</script>";
            }
            head += "</body></html>";

            var context = this;
			window["loading" + this._id] = function() {
				delete window["loading" + this._id];
				var callbackData = context;
				try {
    				var win = dijit.getDocumentWindow(doc);
                    var body = (context.rootNode = doc.body);
    				body.id = "myapp";

    				// Kludge to enable full-screen layout widgets, like BorderContainer.
    				// What possible side-effects could there be setting 100%x100% on every document?
    				// See note above about margin:0 temporary hack
    				body.style.width = "100%";
    				body.style.height = "100%";
    				body.style.margin = "0";

    				body._edit_context = context; // TODO: find a better place to stash the root context
    				context._bootstrapModules.split(",").forEach(function(module){
    																if (module === 'dijit.dijit-all')
    																	win.dojo._postLoad=true; // this is neede for FF4 to keep dijit._editor.RichText from throwing at line 32 dojo 1.5									
    																win.dojo["require"](module);
    															}); // to bootstrap references to base dijit methods in container
    				context._frameNode = frame;
    				// see Dojo ticket #5334
    				// If you do not have this particular dojo.isArray code, DataGrid will not render in the tool.
    				// Also, any array value will be converted to {0: val0, 1: val1, ...}
    				// after swapping back and forth between the design and code views twice. This is not an array!
    				win.dojo.isArray=function(it){
    					return it && Object.prototype.toString.call(it)=="[object Array]";
    				};
console.info("Content Dojo version: "+ win.dojo.version.toString());
					context._setSourceData(data);
				} catch(e) {
					// recreate the Error since we crossed frames
					callbackData = new Error(e.message, e.fileName, e.lineNumber);
					dojo.mixin(callbackData, e);
                    // XXX setSource() currently called without callback; log error to console
                    if (!callback) {
                        console.error(e);
                    }
				}

				if(callback){
					callback.call((scope || context), callbackData);
				}
			};

			doc.open();
			doc.write(head);
            doc.close();

            // intercept BS key - prompt user before navigating backwards
			dojo.connect(doc.documentElement, "onkeypress", function(e){
				if(e.charOrCode==8){
					window.davinciBackspaceKeyTime = win.davinciBackspaceKeyTime = new Date().getTime();
				}
			});	
			win.onbeforeunload = function (e) {
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
			};

		}else{
			var callbackData = this;
			try {
				this._setSourceData(data);
			} catch(e) {
				// recreate the Error since we crossed frames
				callbackData = new Error(e.message, e.fileName, e.lineNumber);
				dojo.mixin(callbackData, e);
			}
			
			if(callback){
				callback.call((scope || this), callbackData);
			}
		}
		
	},

	_setSourceData: function(data){
		
		var frame = this.getFrameNode();
		var loading = dojo.create("div",null, frame.parentNode, "first");
//		dojo.style(loading, 'backgroundColor','red');
/*		dojo.style(loading, 'position','absolute');
		dojo.style(loading, 'left',containerNode.parentNode.clientLeft);
		dojo.style(loading, 'top',containerNode.parentNode.clientTop);
		dojo.style(loading, 'height',containerNode.parentNode.clientHeight);
		dojo.style(loading, 'width',containerNode.parentNode.clientWidth);
		dojo.style(loading, 'zIndex','110');*/
		
		loading.innerHTML='<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;Loading...</td></tr></table>';
		dojo.addClass(loading, 'loading');
		
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
		
		
		/* cache the theme metadata */
		
		this.themeChanged();
		this.getThemeMeta();
		
		var containerNode = this.getContainerNode();
	
		
		var active = this.isActive();
		if(active){
			this.select(null);
			dojo.forEach(this.getTopWidgets(), this.detach, this);
		}
		var escapees = [],
			scripts = {},
			states = {},
			properties = {},
			containerNode = this.getContainerNode();
	
		if (data.states) {
			states["body"] = data.states;
		}
		dojo.forEach(this.getTopWidgets(), function(w){
			if(w.getContext()){
				w.destroyWidget();
			}
		});
		containerNode.innerHTML = content;
		
		// Remove "on*" event attributes from editor DOM.
		// They are already in the model. So, they will not be lost.
		this._removeEventAttributes(containerNode);
		var descendantNodes = dojo.query("*",containerNode);
		for(var n=0;n<descendantNodes.length;n++){
			this._removeEventAttributes(descendantNodes[n]);
		}

		// Convert all text nodes that only contain white space to empty strings
		containerNode.setAttribute('data-davinci-ws','collapse');
		var model_bodyElement = this._srcDocument.getDocumentElement().getChildElement("body");
		model_bodyElement.addAttribute('data-davinci-ws','collapse');

		// Collapses all text nodes that only contain white space characters into empty string.
		// Skips certain nodes where whitespace does not impact layout and would cause unnecessary processing.
		// Similar to features that hopefully will appear in CSS3 via white-space-collapse.
		// Code is also injected into the page via workbench/davinci/davinci.js to do this at runtime.
		var skip = {"SCRIPT":1, "STYLE":1},
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

		this._processWidgets(containerNode, active, states);

		loading.parentNode.removeChild(loading);
		dojo.publish("/davinci/ui/context/loaded", [this]);
	},

	/**
	 * Remove all attributes from 'node' that start with string "on".
	 */
	_removeEventAttributes: function(node) {
		if(node){
			var attributes=node.attributes;
			var removeList=[];
			for(var i=0; i<attributes.length; i++){
				var attrName = attributes[i].nodeName;

				if( attrName.substr(0,2).toLowerCase()=="on" ) {
					removeList.push(attrName);
				}
			}
			for(var i=0; i<removeList.length; i++){
				node.removeAttribute(removeList[i]);
			}
		}

	},

	/**
	 * Process dojoType, oawidget and dvwidget attributes on text content for containerNode
	 */
	_processWidgets: function(containerNode, attachWidgets, states) {
		dojo.forEach(dojo.query("*", containerNode), function(n){
			var type = n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			//doUpdateModelDojoRequires=true forces the SCRIPT tag with dojo.require() elements
			//to always check that scriptAdditions includes the dojo.require() for this widget.
			//Cleans up after a bug we had (7714) where model wasn't getting updated, so
			//we had old files that were missing some of their dojo.require() statements.
			this.loadRequires(type, false/*doUpdateModel*/, true/*doUpdateModelDojoRequires*/);
//			this.resolveUrl(n);
			this._preserveStates(n, states);

		}, this);
		try {
			var dj = this.getDojo();
			dj["require"]("dojo.parser");
			dj.parser.parse(containerNode);
		} catch(e){
			// When loading large files on FF 3.6 if the editor is not the active editor (this can happen at start up
			// the dojo parser will throw an exception trying to compute style on hidden containers
			// so to fix this we catch the exception here and add a subscription to be notified when this editor is seleected by the user
			// then we will reprocess the content when we have focus -- wdr
			
			// remove all registered widgets, some may be partly constructed.
			var localDijit = this.getDijit();
			localDijit.registry.forEach(function(w){
                  w.destroy();             
			});
			this._editorSelectConnection = dojo.subscribe("/davinci/ui/editorSelected",  dojo.hitch(this, this._editorSelectionChange));
		}
	
		this._restoreStates(states);
		if(attachWidgets){
			this._attachAll();
		}

		// bind overlay widgets to corresponding davinci states
		davinci.states.subscribe("/davinci/states/state/changed", dojo.hitch(this, function(args){
			if(this.getDojo().doc.body != args.widget.containerNode){
				// ignore event coming from another window
				return;
			}
			var prefix = "_show:", widget, dvWidget, helper;
			if(args.newState && !args.newState.indexOf(prefix)){
				widget = this.getDijit().byId(args.newState.substring(6));
//				widget && widget.show();
				dvWidget = davinci.ve.widget.getWidget(widget.domNode);
				helper = dvWidget.getHelper();
				helper && helper.popup && helper.popup(dvWidget);
			}
			if(args.oldState && !args.oldState.indexOf(prefix)){
				widget = this.getDijit().byId(args.oldState.substring(6));
//				widget && widget.hide();
				dvWidget = davinci.ve.widget.getWidget(widget.domNode);
				helper = dvWidget.getHelper();
				helper && helper.tearDown && helper.tearDown(dvWidget);
			}
		}));
	},
	
	_editorSelectionChange: function(event){
		// we should only be here do to a dojo.parse exception the first time we tried to process the page
		// Now the editor tab container should have focus becouse the user selected it. So the dojo.processing should work this time
		if (event.editor.fileName === this._editor.fileName){
			dojo.unsubscribe(this._editorSelectConnection);
			delete this._editorSelectConnection;
			this._setSource(this._srcDocument, null, null);
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
					davinci.ve.states.store(widget, states);
					
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

	getHeader: function(){
		return (this._header || {});
	},
	

	
	setHeader: function(header){
		
		var oldStyleSheets,
		
			newStyleSheets,
			oldBodyClasses,
			newBodyClasses;
		if(this._header){
			oldStyleSheets = (this._header.styleSheets || []);
			oldBodyClasses = this._header.bodyClasses;
		}else{
			oldStyleSheets = [];
		}
		if(header){
			newStyleSheets = (header.styleSheets || []);
			newBodyClasses = header.bodyClasses;
			if(header.modules){
				dojo.forEach(header.modules, this._require, this);
			}

			if(header.className){
				var classes = header.className.split(' ');
				dojo.some(classes, function(clasz, index){
						
						classes.splice(index, 1)
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

		this.setStyle((header ? header.style : undefined));

		this._header = header;
	},
	
	getStyle: function(){
		return (this._header ? this._header.style : undefined);
	},

	setStyle: function(style){
		var values = (davinci.ve.widget.parseStyleValues(style) );
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

	loadStyleSheet : function(url) {
		if (!url) {
			return;
		}
		
		if (!this._links) {
			this._links = [];
		}
		var found = dojo.some(this._links, function(val) {
			return val.getAttribute('href') == url;
		});
		if (found) {
			return;
		}
		
		var doc = this.getDocument();
		var head = doc.getElementsByTagName("head")[0];
		var link = doc.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute("href", url);
		
		head.appendChild(link);
		
		this._links.push(link);
	},

	addModeledStyleSheet : function(url) {
		this.loadStyleSheet(url);
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

	unloadStyleSheet: function(url){
		if(!url){
			return;
		}

		var link = undefined;
		if(this._links){
			for(var i = 0; i < this._links.length; i++){
				var href = this._links[i].getAttribute("href");
				if(href == url){
					link = this._links[i];
					this._links.splice(i, 1);
					break;
				}
			}
		}
		if(link){
			link.parentNode.removeChild(link);
			dojo._destroyElement(link);
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
			if (!node.id) {
				debugger; // should not happen
//				node.id = davinci.ve.widget.getTemporaryId(node);
			}
			cache[node.id] = states;
		}
	},

	// restore states into widget
	_restoreStates: function(cache){
		var dijit = this.getDijit();
		var currentStateCache = [];
		for(var id in cache){
			var widget = id == "body" ? this.getContainerNode() : dijit.byId(id);
			if (!widget) {
				var node = this.getDocument().getElementById(id);
				widget = davinci.ve.widget.getWidget(node);
//				if (!widget) {
//					var c = davinci.ve.widget.loadHtmlWidget(node);
//					widget = new c({}, node); 
//				}
			}
			var states = cache[id];
			states = davinci.states.deserialize(states);
			delete states["current"]; // FIXME: Always start in normal state for now, fix in 0.7
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
		return (win.dojo || dojo);
	},

	getDijit: function(){
		var win = this.getGlobal();
		return (win && win.dijit || dijit);
	},

	//FIXME: accessor func is unnecessary?  Make _frameNode public instead?
	getFrameNode: function(){
		return this._frameNode;
	},

	//FIXME: accessor func is unnecessary?
	getContainerNode: function(){
		return this.rootNode;
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

		var containerNode = this.getContainerNode();
		var x = position.x + containerNode.scrollLeft;
		var y = position.y + containerNode.scrollTop;
		return {x: x, y: y};
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
	
	select: function(widget, add, inline){
		if(!widget || widget==this.rootWidget){
			if(!add){
				this.deselect(); // deselect all
			}
			return;
		}

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

		var selection, index; 
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
			// re-run this after the animations take place. Could hook the remaining code to an onEnd event?
//			if(!widget._refocus){
//				widget._refocus = true;
//				var w=widget;
//				setTimeout(
//					dojo.hitch(this, function(){this.select(w); delete w._refocus;
//				}), 1000);
//				return;
//			}
		}

		var box, op;

		if (!davinci.ve.metadata.queryDescriptor(widget.type, "isInvisible")) {
			var node = widget.getStyleNode();
			if(helper && helper.getSelectNode){
				node = helper.getSelectNode(this) || node;
			}
			box = this.getDojo().position(node, true);
/*
			// Adjust dimensions from border-box to content-box
			var e = dojo._getPadBorderExtents(node);
			box.l = Math.round(box.x + e.l);
			box.t = Math.round(box.y + e.t);
			box.w -= e.w;
			box.h -= e.h;
*/
			box.l = box.x;
			box.t = box.y;

			op = {move: !(parent && parent.isLayout())};
//			op = {move: true};
//			op = {move: (node.style.position == "absolute")};

			//FIXME: need to consult metadata to see if layoutcontainer children are resizable, and if so on which axis
			var resizable = (parent && parent.isLayout() /*&& parent.declaredClass != "dijit.layout.BorderContainer"*/) ?
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
		
		if(!this._selection || this._selection.length > 1 || selection.length > 1 || this.getSelection() != widget){
			this._selection = selection;
			this.onSelectionChange(selection, add); 
		}

		this.focus({
			box: box,
			op: op,
			hasLayout: widget.isLayout(),
			isChild: parent && parent.isLayout()
		}, index, inline);
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

		if(widget && this._selection.length > 0){ // undo of add got us here some how.
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
		}else{ // deselect all
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
		var focus = undefined;
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
				focus.resize(state.box);
				focus.allow(state.op);
				if(focus.domNode.parentNode != containerNode){
					containerNode.appendChild(focus.domNode);
				}
				var w = this.getSelection();
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
				var focus = this._focuses[i];
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
			if(name == "showLayoutGrid"){
				var containerNode = this.getContainerNode();
				if(value){
					dojo.addClass(containerNode, "editLayoutGrid");
				}else{
					dojo.removeClass(containerNode, "editLayoutGrid");
				}
			}
		}
	},

	setPreferences: function(preferences){
		if(preferences){
			for(var name in preferences){
				this.setPreference(name, preferences[name]);
			}
		}
	},
	
	getFlowLayout: function(){
		var htmlElement=this.getDocumentElement();
		var bodyElement=htmlElement.getChildElement("body");
		flowLayout = bodyElement.getAttribute(davinci.preference_layout_ATTRIBUTE);
		if (!flowLayout){ // if flowLayout has not been set in the context check the edit prefs
			var editorPrefs = davinci.workbench.Preferences.getPreferences('davinci.ve.editorPrefs');
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
		var _getValue = function(source, index){
			if(!source){
				return undefined;
			}

			var quotechar = "\""; // first look for double-quote
			var begin = source.indexOf(quotechar, index);
			if(begin < 0){
				quotechar = "\'"; // then look for single-quote
				begin = source.indexOf(quotechar, index);
			}
			if(begin < 0){
				return undefined;
			}
			begin++;
			var end = source.indexOf(quotechar, begin); 
			if(end < 0){
				return undefined;
			}
			return source.substring(begin, end);
		};

		var data = {metas: [], scripts: [], modules: [], styleSheets: []};
		var htmlElement=source.getDocumentElement();
		var head=htmlElement.getChildElement("head");
		var bodyElement=htmlElement.getChildElement("body");
		this._uniqueIDs={};
		var self=this;
		if (bodyElement)
		{
			bodyElement.visit({ visit: function(element){
				if (element.elementType=="HTMLElement" && element!=bodyElement)
				{
					self.getUniqueID(element);
				}
			}});
			var classAttr=bodyElement.getAttribute("class");
			if (classAttr)
			{
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
			data.style=bodyElement.getAttribute("style");
			data.content=bodyElement.getElementText({includeNoPersist:true});
			var states=bodyElement.getAttribute(davinci.ve.states.ATTRIBUTE);
			davinci.ve.states.store(data, states);
			var flowLayout =bodyElement.getAttribute(davinci.preference_layout_ATTRIBUTE); // wdr flow
			var layout = true;
			if (flowLayout && flowLayout === 'false'){
				layout = false;
			}
			this.setPreference("flowLayout",layout); // wdr flow
			
		}
		
		var titleElement=head.getChildElement("title");
		if (titleElement){
			data.title=titleElement.getElementText();
		}
		
		var scriptTags=head.getChildElements("script");
		dojo.forEach(scriptTags, function (scriptTag){
			var value=scriptTag.getAttribute("src");
			if (value)
				data.scripts.push(value);
			var text=scriptTag.getElementText();
			if (text.length>0)
			{
				var func = text.indexOf("dojo" + ".require(");
				while(func >= 0){
					value =  _getValue(text, func + 13);
					data.modules.push(value);
					var nl = text.indexOf("\n", func + 13);
					if(nl > 0){
						text = text.substring(0, func) + text.substring(nl + 1); // remove line
						func = text.indexOf("dojo" + ".require(", func);
					}else{
						text = text.substring(0, func); // remove rest
						break;
					}
				}
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
			var foundSheet;
			foundSheet = findSheet(sheet, fileName);
			if (foundSheet){
				var rules = foundSheet.cssRules;
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
	getSelector : function( widget, target){
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
	
	getMetaTargets: function(target){
		// return rules based on metadata IE theme
	
		
		var widget = this.getSelection();
		if(widget.length>0){
			widget = widget[0];
		}
		
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
		var rule = new davinci.html.CSSRule();
		rule.setText(selector + "{}");
		return findTarget(widget.domNode || widget, rule);
	},
	
	getSelectionCssRules: function(targetDomNode){
		if (!this._cssCache)this._cssCache = {}; // prevent undefined exception in theme editor
		function hashDomNode(node){
			return node.id + "_" + node.className;
			
		}
		var selection = this.getSelection();
		
		var targetDom = targetDomNode || selection[0].domNode || selection[0];
		
		var domHash = hashDomNode(targetDom);
		
		/*
		if(this._cssCache[domHash])
			return this._cssCache[domHash];
		*/
		
		if(selection.length > 0){
			
			var matchLevels = [];
			this._cssCache[domHash] =  this.model.getMatchingRules(targetDom, true);
			
			
			for(var i =0;i<this._cssCache[domHash]['rules'].length;i++){
				/* remove stale elements from the cache if they change */
				var handle = dojo.hitch(this._cssCache[domHash]['rules'][i],"onChange",this,function(){
					
										delete this._cssCache[domHash];
										dojo.unsubscribe(handle);
				});
			}
			
			return this._cssCache[domHash];
		}else{
			return {'rules':null,'matchLevels':null};
		}
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
	
	 getUniqueID: function(node) {
		 var id = node.getAttribute("id");
		 if (!id) {
			 if (!this._uniqueIDs.hasOwnProperty(node.tag)) {
				 id = this._uniqueIDs[node.tag]=0;
			 }
			 else {
				 id=++this._uniqueIDs[node.tag];
			 }
			id=node.tag+"_"+id;
			node.addAttribute("id",id,true);	 
		 }
		 return id;
	},

    // XXX see addJavaScript() and addHeaderScript()
    _reDojoJS: new RegExp(".*/dojo.js$"),
    
    addJavaScript: function(url, text, doUpdateModel, doUpdateModelDojoRequires) {
        if (url) {
            var isDojoJS = this._reDojoJS.test(url);
            // XXX HACK: Don't add dojo.js to the editor iframe, since it already has an instance.
            //      Adding it again will overwrite the existing Dojo, breaking some things.
            //      See bug 7585.
            if (!isDojoJS) {
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
                if (isDojoJS) {
                    // XXX Nasty nasty nasty special case for dojo attribute thats
                    // required. Need to generalize in the metadata somehow.
                    this.addHeaderScript(url, {
                        'djConfig' : "parseOnLoad: true"
                    });
                }
                this.addHeaderScript(url);
            }
        } else if (text) {
            this.getGlobal()['eval'](text);
            if (doUpdateModel || doUpdateModelDojoRequires) {
                this.addHeaderScriptSrc(text);
            }
        }
    },

	// add script URL to HEAD
	addHeaderScript: function(url, attributes) {
	    // look for duplicates
		var found = dojo.some(this.getHeader().scripts, function(val) {
			return val === url;
		});
		if (found) {
			return;
		}
		
		var script = new davinci.html.HTMLElement('script');
		script.addAttribute('type', 'text/javascript');
		script.addAttribute('src', url);
		
		if (attributes) {
			for (var name in attributes) {
				script.addAttribute(name, attributes[name]);		
			}
		}
		
        var head = this.getDocumentElement().getChildElement('head');
		// XXX Bug 7499 - (HACK) States.js needs to patch Dojo loader in order to make use of
		//    "dvStates" attributes on DOM nodes.  In order to do so, make sure State.js is one of
		//    the last scripts in <head>, so it is after dojo.js and other dojo files.  This code
		//    inserts all scripts before States.js.
		//    First, make sure that we've properly saved the location of States.js.  If, for
		//    whatever reason, this is not the case, then fall back to the original code of
		//    appending script to <head>.
		if (this._statesJsScriptTag) {
		    head.insertBefore(script, this._statesJsScriptTag);
		} else {
		    head.addChild(script);
		}
		
		this.getHeader().scripts.push(url);
	},

	// add JS to HEAD
	addHeaderScriptSrc: function(text){
		var oldText = '';
		if (this._scriptAdditions){
			var scriptText = this._scriptAdditions.find({'elementType':'HTMLText'}, true);
			oldText = scriptText.getText();
			if (oldText.indexOf(text)>0){
				return;  // already in the header
			}
			this._scriptAdditions.parent.removeChild(this._scriptAdditions);
			this._scriptAdditions = null;
		}
		// create a new script element
		var script = new davinci.html.HTMLElement('script');
		script.addAttribute('type', 'text/javascript');
		script.script = "";
		var head = this.getDocumentElement().getChildElement('head');
		// XXX Bug 7499 - (HACK) See comment in addHeaderScript()
		if (this._statesJsScriptTag) {
		    head.insertBefore(script, this._statesJsScriptTag);
		} else {
		    head.addChild(script);
		}
		var newScriptText = new davinci.html.HTMLText();
		newScriptText.setText(oldText + "\n" + text); //wdr
		script.addChild(newScriptText); //wdr
		this._scriptAdditions = script;


	}
});

davinci.ve._contextCount = 0;

davinci.ve._preferences = {};
