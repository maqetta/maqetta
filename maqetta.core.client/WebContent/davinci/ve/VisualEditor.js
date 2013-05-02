define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/promise/all",
	"dojo/text!./template.html",
	"../Runtime",
	"../Workbench",
	"../model/Path",
	"./metadata",
	"./Context",
	"preview/silhouetteiframe",
	"preview/loadIndicator",
	"../workbench/Preferences",
	"./widget",
	"../XPathUtils",
	"../html/HtmlFileXPathAdapter",
	"./utils/GeomUtils"
], function(
	declare,
	lang,
	connect,
	domClass,
	domConstruct,
	all,
	template,
	Runtime,
	Workbench,
	Path,
	Metadata,
	Context,
	SilhouetteIframe,
	loadIndicator,
	Preferences,
	widgetUtils,
	XPathUtils,
	HtmlFileXPathAdapter,
	GeomUtils
){

var VisualEditor = declare("davinci.ve.VisualEditor",  null,  {

	deviceName: 'none',
	_orientation: 'portrait',
	_subscriptions: [],
	
	constructor: function(element, pageEditor)	{
		this._pageEditor = pageEditor;
		this.contentPane = dijit.getEnclosingWidget(element);
		this.loadingDiv = domConstruct.create("div", {
			className: "loading",
			innerHTML: dojo.replace(
					'<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;{0}</td></tr></table>',
					["Loading..."]) // FIXME: i18n
			},
			this.contentPane.domNode.parentNode,
			"first");

		domClass.add(this.contentPane.domNode, "fullPane");
		var silhouette_div_container = domConstruct.create("div", {className: "silhouette_div_container"}, this.contentPane.domNode);
		domConstruct.create("span", {className: "silhouetteiframe_object_container"}, silhouette_div_container);
		this.silhouetteiframe = new SilhouetteIframe({
			rootNode: silhouette_div_container,
			margin: 20
		});
		var visualEditor = this;
		this.contentPane.connect(this.contentPane, 'resize', function(newPos){
			// "this" is the ContentPane dijit
			var iframe = dojo.query('.designCP iframe', this._pageEditor.domNode)[0];
			if(iframe && iframe.contentDocument && iframe.contentDocument.body){
				var bodyElem = iframe.contentDocument.body;
				visualEditor._resizeBody(bodyElem, newPos);
				// Wrapped in setTimeout because sometimes browsers are quirky about
				// instantly updating the size/position values for elements
				// and things usually work if you wait for current processing thread
				// to complete. Also, updateFocusAll() can be safely called within setTimeout.
				setTimeout(function() {
					var context = visualEditor.getContext();
					context.clearCachedWidgetBounds();
					context.updateFocusAll(); 
					visualEditor._registerScrollHandlers();
				}, 100); 
			}
		}.bind(this));
		this._pageEditor.deferreds = all(Metadata.getDeferreds());
		this._subscriptions.push(dojo.subscribe("/davinci/ui/editorSelected", this._editorSelected.bind(this)));
		this._subscriptions.push(dojo.subscribe("/davinci/ui/context/loaded", this._contextLoaded.bind(this)));
		
		var visualEditorBorder = document.getElementById('visualEditorBorder');
		if(!visualEditorBorder){
			var editorsStackContainer = document.getElementById('editorsStackContainer');
			visualEditorBorder = domConstruct.create('div', {id:'visualEditorBorder'}, editorsStackContainer);
			domConstruct.create('div', {id:'visualEditorBorderTopLeft'}, visualEditorBorder);
			domConstruct.create('div', {id:'visualEditorBorderTopRight'}, visualEditorBorder);
			domConstruct.create('div', {id:'visualEditorBorderTop'}, visualEditorBorder);
			domConstruct.create('div', {id:'visualEditorBorderRight'}, visualEditorBorder);
			domConstruct.create('div', {id:'visualEditorBorderLeft'}, visualEditorBorder);
		}
		
	},
	
	getDevice: function() {
		return this.deviceName;
	},
	
	setDevice: function(deviceName, deviceOnly) {
	    this.deviceName = deviceName;
	    var context = this.getContext();
	    context.setMobileMeta(deviceName);
	    if (!deviceOnly){
	    	context.setMobileTheme(deviceName);
	    }
	    
		//FIXME: Path shouldn't be hard-coded
	    var svgfilename = deviceName == 'none' ? null : "app/preview/images/" + deviceName + ".svg";
		this.silhouetteiframe.setSVGFilename(svgfilename);
		

		// #683 - When using mobile silhouette, add mobile <meta> tags to
		// document.
		
		context.clearCachedWidgetBounds();
		dojo.publish("/davinci/ui/deviceChanged", [deviceName]);
		dojo.publish('/davinci/ui/repositionFocusContainer', []);

	},

	toggleOrientation: function() {
		if(this.deviceName != 'none'){
			this.setOrientation(this._orientation == "landscape" ? "portrait" : "landscape");
		}
		this.getContext().clearCachedWidgetBounds();
	},

	getOrientation: function(orientation) {
		return this._orientation;
	},

	setOrientation: function(orientation) {
		if (this.deviceName != 'none' && this._orientation != orientation) {
			this._orientation = orientation;

			var editor = Workbench.getOpenEditor();
			if(editor.editorContainer && editor.editorContainer.updateToolbars){
				editor.editorContainer.updateToolbars();
			}
			var context = this.getContext();
			context.setMobileOrientation(this._orientation);
			this.silhouetteiframe.setOrientation(this._orientation);
			editor._visualChanged();
			// Wrapped in setTimeout because sometimes browsers are quirky about
			// instantly updating the size/position values for elements
			// and things usually work if you wait for current processing thread
			// to complete. Also, updateFocusAll() can be safely called within setTimeout.
			setTimeout(function() {
				context.clearCachedWidgetBounds();
				context.updateFocusAll(); 
			}, 100); 
		}
	},

	_objectPropertiesChange: function (event){
		if (!this.isActiveEditor()) {
			return;
		}
		var context = this.getContext();
		var command = event.command;
		var commandStack = context.getCommandStack();
		commandStack.execute(event.compoundCommand || command);
		if(command._newId){
			var widget = widgetUtils.byId(command._newId, context.getDocument());
			context.select(widget);
		}else{
			var selection = context.getSelection();
			var widget = selection.length ? selection[selection.length - 1] : undefined;
			if(selection.length > 1){
				context.select(widget);
			}
		}
		this._srcChanged();
	},

	isActiveEditor: function(){
		var currentEditor = Runtime.currentEditor;
		return currentEditor && currentEditor.declaredClass=="davinci.ve.PageEditor" && currentEditor.visualEditor == this;
	},
	
	/**
	 * Causes property changes on the currently selected widget.
	 * Right now, only operates on the first widget in the selection.
	 * Creates and executes an appropriate StyleCommand for the operation.
	 * @param {object} value
	 *		value.appliesTo {string|object} - either 'inline' or a CSSRule object
	 *		applyToWhichStates - controls whether style change is attached to Normal or other states:
	 *			"current" => apply to currently active state
	 *			[...array of strings...] => apply to these states (may not yet be implemented)
	 *			any other value (null/undefined/"Normal"/etc) => apply to Normal state
	 *		values [object]  Array of property values. Each item in array is an object with one property
	 *						<propname>:<propvalue>, where <propname> is name of styling property and <propvalue> is value string
	 */
	_stylePropertiesChange: function (value){
		if(!this.isActiveEditor() ){
			return;
		}
		var command = this.getContext().getCommandForStyleChange(value); //#23
		if(command){
			 this.getContext().getCommandStack().execute(command);
			if(command._newId){
				var widget = widgetUtils.byId(command._newId, context.getDocument());
				this.context.select(widget);
			}
			
			this._srcChanged();
			dojo.publish("/davinci/ui/widgetValuesChanged",[value]);
		}
	},

	_srcChanged: function(){
		this.isDirty = true;
	},
	
	getContext: function(){
		return this.context;
	},

	getTemplate: function(){
		return template;
	},
	
	destroy: function () {
		if(!this._handles){
			return;
		}
		if(this._focusPopup){
			this._focusPopup.destroyRecursive();			
		}
		delete this._focusPopup;
		this.context.destroy();
	    this._handles.forEach(dojo.disconnect);
	    if(this._iframeScrollHandler){
	    	dojo.disconnect(this._iframeScrollHandler);
	    	delete this._iframeScrollHandler;
	    }
	    if(this._designCPScrollHandler){
	    	dojo.disconnect(this._designCPScrollHandler);
	    	delete this._designCPScrollHandler;
	    }
	    this._subscriptions.forEach(dojo.unsubscribe);
	    this._subscriptions = [];
	},
	
	setContent: function (fileName, content, newHtmlParams){
		this._onloadMessages=[];	// List of messages to present to user after loading has completed
		this._setContent(fileName, content, newHtmlParams);
	},
	
	saveAs: function (newFileName, oldFileName, content){
		this._setContent(newFileName, content);
	},
	
	_setContent: function(filename,content, newHtmlParams){
		this._setContentRaw(filename, content, newHtmlParams);
	},
	
	_setContentRaw: function(filename, content, newHtmlParams){
		this.fileName = filename;
		this.basePath = new Path(filename);
	   
		if (!this.initialSet){
		   	var workspaceUrl = Runtime.getUserWorkspaceUrl();
		   	if(filename.indexOf("./")==0 ){
		   		filename = filename.substring(2,filename.length);
			}				
		   	var baseUrl=workspaceUrl+filename;

			this._handles=[];
			var containerNode = dojo.query('.silhouette_div_container',this.contentPane.domNode)[0];
			this.context = new Context({
				editor: this._pageEditor,
				visualEditor: this,
				containerNode: containerNode,
				model: content,
				baseURL: baseUrl,
				iframeattrs:{'class':'silhouetteiframe_iframe'}
			});

			this.context._commandStack=this._commandStack;
			this._commandStack._context=this.context;

			var prefs=Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());
			if (prefs) {
				this.context.setPreferences(prefs);
			}

//			this._handles.push(dojo.connect(this.context, "activate", this, this.update));
			this._handles.push(dojo.connect(this.context, "onContentChange", this, this.onContentChange));
//			this._handles.push(dojo.connect(this.context, "onSelectionChange",this, this.onContentChange));
		
			this.title = dojo.doc.title;

			this.context._setSource(content, this._connectCallback, this, newHtmlParams);
	   		// set flow layout on user prefs
			this.context.getFlowLayout(); // gets the current layout, but also sets to default if missing..
			this.initialSet=true;
		}else{
			this.context.setSource(content, this.context._restoreStates, this.context);
		}
	},

	_connectCallback: function(failureInfo) {
		try {
			if (failureInfo instanceof Error) {
				throw failureInfo;
			}

			var context = this.context,
				popup;

			this.savePoint = 0;
			context.activate();

			popup = Workbench.createPopup({
				partID: 'davinci.ve.visualEditor',
				domNode: context.getContainerNode(), 
				keysDomNode: context.getDocument(),
				context: context
			});
	
			popup.adjustPosition = function(event) {
				// Adjust for the x/y position of the visual editor's IFRAME relative to the workbench
				// Adjust for the scrolled position of the document in the visual editor, since the popup menu callback assumes (0, 0)
				var coords = dojo.position(context.frameNode);
				dojo.withDoc(context.getDocument(), function(){
					var scroll = dojo.docScroll();
					coords.x -= scroll.x;
					coords.y -= scroll.y;
				});
	
				return coords;
			};
			
			this._focusPopup = Workbench.createPopup({
				partID: 'davinci.ve.visualEditor',
				domNode: context.getFocusContainer(), 
				keysDomNode: context.getDocument(),
				context: context
			});
	
			// resize kludge to make Dijit visualEditor contents resize
			// seems necessary due to combination of 100%x100% layouts and extraneous width/height measurements serialized in markup
			context.getTopWidgets().forEach(function (widget) {
				if (widget.resize) {
					widget.resize();
				}
			});
			
			// At doc load time, call the routine that makes document adjustments each time
			// new widgets are added or widgets are deleted.
			context.anyDojoxMobileWidgets = undefined;
			// pagebuilt event triggered after converting model into dom for visual page editor
			dojo.publish('/davinci/ui/context/pagebuilt', [context]);
		} catch(e) {
			failureInfo = e;
		} finally {
			if (failureInfo.errorMessage) {
				this.loadingDiv.innerHTML = failureInfo.errorMessage || "(unknown)";
			} else if (failureInfo instanceof Error) {
				var message = "Uh oh! An error has occurred:<br><b>" + failureInfo.message + "</b>";
				if (failureInfo.fileName) {
					message += "<br>file: " + failureInfo.fileName + "<br>line: " + failureInfo.lineNumber;
				}
				if (failureInfo.stack) {
					message += "<br><pre>" + failureInfo.stack + "</pre>";
				}
				this.loadingDiv.innerHTML = message;
				domClass.add(this.loadingDiv, 'error');
			} else {
				if (this.loadingDiv.parentNode) {
					this.loadingDiv.parentNode.removeChild(this.loadingDiv);				
				}
				delete this.loadingDiv;
			}
		}
	},

	getSelectedWidget: function(){
		//if(this._selectedWidget)
		//	return this._selectedWidget;
		
		var context = this.getContext(),
			selection = context.getSelection(),
			widget = selection.length ? selection[selection.length - 1] : undefined;

		if(selection.length > 1){
			context.select(widget);
		}
		return widget;
	},

	getSelectedSubWidget: function(){
		return this._selectedSubWidget;
	},

	save: function (isAutoSave){
		if(!this.context){	// Sometimes we do lazy initialization of Context
			return;
		}

		var promises = [],
			model = this.context.getModel();
		model.setDirty(true);
		var visitor = {
			visit: function(node){
				if((node.elementType == "HTMLFile" || node.elementType == "CSSFile") && node.isDirty()){
					promises.push(node.save(isAutoSave));
				}
				return false;
			}
		};

		model.visit(visitor);
		promises = promises.concat(this.getContext().saveDynamicCssFiles(this.context.cssFiles, isAutoSave));
		if (promises.length) {
			this.savePromise = all(promises);
		} else {
			delete this.savePromise;
		}
		return this.savePromise;
	},

	removeWorkingCopy: function(){ 
		/*this.removeWorkingCopyDynamicCssFiles(this.getContext()._getCssFiles());
		var visitor = {
				visit: function(node){
					if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){
						var url = node.url || node.fileName;
						systemResource.findResource(url).removeWorkingCopy();
						// node.dirtyResource = false; someone else may be editing the resource
					}
					return false;
				}
			};
		var model = this.context.getModel();	
		model.visit(visitor);*/
		//this._pageEditor.resourceFile.removeWorkingCopy();
		//this.isDirty=false;
	},
	
	getDefaultContent: function() {
		return this.getTemplate();
	},
	
	previewInBrowser: function() {
		var deviceName = this.deviceName,
			fileURL = Workbench.getOpenEditor().resourceFile.getURL(),
			query = [];

		if(deviceName != 'none') {
			query = [
			    'preview=1',
			    'device=' + encodeURIComponent(deviceName),
			    'file=' + encodeURIComponent(fileURL)
			];
			fileURL = Workbench.location();
			if (this._orientation == 'landscape') {
				query.push('orientation=' + this._orientation);
			}
		}
		var useZazl = this.context.getPreference("zazl");
		if (useZazl) {
			query.push('zazl=true');
		}
		if (query.length) {
			fileURL += "?" + query.join("&");
		}

		var openPreview = function() {
			var preview = window.open(fileURL, "preview_" + fileURL); // TODO: cache busting needed?
			// Attach load indicator to window
			loadIndicator(preview, Runtime.location()
					+ require.toUrl("dojox/image/resources/images/loading.gif"), "gray");
		};

		// Make sure content has been saved to the server so preview is current
		if (this.savePromise) {
			this.savePromise.then(openPreview);
		} else {
			openPreview();
		}
	},

	/**
	 * Refresh the Visual Editor while keeping widget selection intact.
	 */
	refresh: function() {
		// save widget selection
		var context = this.context,
			xpath = XPathUtils.getXPath(context.getSelection()[0]._srcElement,
						HtmlFileXPathAdapter);

		// set new content
		context.setSource(context.model);

		// re-establish widget selection in VE
		var id = context.model.evaluate(xpath).getAttribute('id'),
			widget = widgetUtils.byId(id, context.getDocument());
		setTimeout(function() {
			// XXX Sometimes, after resetting the source, the DOM takes some time
			// to get set (#1102).  Unfortunately, I still haven't found an
			// event that I can attach/listen to to see if the DOM is ready.
			// Instead, just use a setTimeout.
			context.select(widget);
		},0);
	},
	
	_contextLoaded: function(context){
		if(context == this.getContext()){
			this._registerScrollHandlers();
		}
	},
	
	_editorSelected: function(event){
		var context = this.getContext();
		var focusContainer = context ? context.getFocusContainer() : null;
		if(event.oldEditor == this._pageEditor){
			if(focusContainer && this._focusPopup){
				this._focusPopup.unBindDomNode(focusContainer);
			}
		}
		if(event.editor == this._pageEditor){
			this._registerScrollHandlers();
			if(focusContainer && this._focusPopup){
				this._focusPopup.bindDomNode(focusContainer);
			}
		}
		var visualEditorBorder = document.getElementById('visualEditorBorder');
		if(visualEditorBorder){
			if(!event.editor || event.editor.declaredClass != "davinci.ve.PageEditor"){
				visualEditorBorder.style.display = 'none';
			}else{
				visualEditorBorder.style.display = 'block';
			}
		}
	},
	
	/* The following code provides a fix for #864: Drag/drop from widget palette
	 * not working if page canvas is scrolled. Possibly because of the funky stuff we do
	 * with width/height being 100% on HTML and BODY, both Mozilla and WebKit set
	 * the BODY height to the size of the IFRAME, and if scrolled, but (invisible)
	 * top of the BODY is shifted up off of the screen and the height of the BODY
	 * is equal to height of IFRAME, which causes an empty area at bottom of canvas
	 * where the browser will not send mouse events. To workaround this problem,
	 * extend the width/height of the BODY to be the size of the surrounding ContentPane
	 * adjusted by the amount the BODY is scrolled.
	 * 
	 * FIXME: This patch probably won't be necessary if we get rid of the "infinite canvas"
	 * and instead force user to pick a fixed-size canvas, in which case things will
	 * work like the mobile silhouettes, which don't have the problem.
	 */
	_resizeBody: function(bodyElem, size){
		var scrollLeft = GeomUtils.getScrollLeft(bodyElem);
		var scrollTop = GeomUtils.getScrollTop(bodyElem);
		if(scrollLeft > 0){
			bodyElem.style.width= (size.w + scrollLeft) + "px";
		}else{
			bodyElem.style.width = "100%";
		}
		if(scrollTop > 0){
			bodyElem.style.height=(size.h + scrollTop) + "px";
		}else{
			bodyElem.style.height = "100%";
		}
	},
	
	_scrollHandler: function(e){
	var iframe = dojo.query('.designCP iframe', this._pageEditor.domNode)[0];
	if(iframe && iframe.contentDocument && iframe.contentDocument.body){
		var bodyElem = iframe.contentDocument.body;
			this._resizeBody(bodyElem, {
				w: dojo.style(this.contentPane.domNode, 'width'),
				h: dojo.style(this.contentPane.domNode, 'height')
			});
			// (See setTimeout comment up in the constructor)
			setTimeout(function() {
				var context = this.getContext();
				context.clearCachedWidgetBounds();
				context.updateFocusAll(); 
			}.bind(this), 100); 
		}
	},

	_registerScrollHandlers: function(){
		// Note that scrolling happens on different nodes depending
		// on whether there is a mobile silhouette or not
		if(!this._iframeScrollHandler){
			var iframe = dojo.query('.designCP iframe', this._pageEditor.domNode)[0];
			if(iframe && iframe.contentDocument && iframe.contentDocument.body){
				var bodyElem = iframe.contentDocument.body;
				this._iframeScrollHandler = dojo.connect(bodyElem.ownerDocument, 'onscroll', this, this._scrollHandler);
			}
		}
		if(!this._designCPScrollHandler){
			var designCP = dojo.query('.designCP', this._pageEditor.domNode)[0];
			if(designCP){
				this._designCPScrollHandler = dojo.connect(designCP, 'onscroll', this, this._scrollHandler);
			}
		}
	}

});

return VisualEditor;

});
