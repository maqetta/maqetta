define([
	"dojo/_base/declare",
	"../ui/ModelEditor",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dojo/dnd/Moveable",
	"../Runtime",
	"../commands/CommandStack",
	"../html/ui/HTMLEditor",
	"../model/Path",
	"./VisualEditor",
	"./VisualEditorOutline",
	"./widget",
	"./utils/GeomUtils",
	"dojo/i18n!./nls/ve"
], function(declare, ModelEditor, BorderContainer, ContentPane, Runtime, Moveable, CommandStack, HTMLEditor, Path, VisualEditor, VisualEditorOutline, widgetUtils, GeomUtils, veNls){

return declare("davinci.ve.PageEditor", ModelEditor, {

	_latestSourceMode: "source",
	_latestLayoutMode: "flow",

    constructor: function (element, fileName) {

        this._bc = new BorderContainer({}, element);

        this.domNode = this._bc.domNode;

        this._commandStack = new CommandStack(this);
        this.savePoint=0;

        this._designCP = new ContentPane({'class':'designCP',region:'center'});
        this._bc.addChild(this._designCP);


        this.visualEditor = new VisualEditor(this._designCP.domNode, this);
        this.currentEditor = this.visualEditor;
        this.currentEditor._commandStack = this._commandStack;

        try {
	        this._srcCP = new ContentPane({region: 'bottom', splitter: true, style: "height:50%"});
	
	        // hack to get the source content page to resize itself
	        var oldResize = this._srcCP.resize;
	        this._srcCP.resize = function(changeSize, resultSize) {
	            dojo.marginBox(this.domNode, resultSize);
	            oldResize.apply(this, arguments);
				if(htmlEditor.editor && htmlEditor.editor.getTextView()) {
					htmlEditor.editor.getTextView().resize();
				}
	        };
	
	        var htmlEditor = this.htmlEditor = new HTMLEditor(this._srcCP.domNode, fileName, true);
	        htmlEditor.setVisible(false);
	        this.model = htmlEditor.model;
	
	        this._displayMode = "design";
	
	        this._bc.startup();
	        this._bc.resize(); // kludge: forces primary tab to display	
	
	        this._connect(this.visualEditor,"onContentChange", "_visualChanged");
	        this._connect(this.htmlEditor,"handleChange", "_srcChanged");
	        this.subscribe("/davinci/ui/styleValuesChange",   this._stylePropertiesChange);
	        this.subscribe("/davinci/ui/widgetSelected",   this._widgetSelectionChange);
	        this.subscribe("/davinci/ui/selectionChanged",  this._modelSelectionChange);
	//      this._connect(this.visualEditor.context, "onSelectionChange","_widgetSelectionChange");
			this.subscribe("/davinci/ui/editorSelected", this._editorSelected.bind(this));
			this.subscribe("/davinci/ui/context/loaded", this._contextLoaded.bind(this));
			this.subscribe("/davinci/ui/deviceChanged", this._deviceChanged.bind(this));
        } catch(e) {
        	this.visualEditor._connectCallback(e);
        }
    },
	
	setRootElement: function(rootElement){
    	this._rootElement = rootElement;
	},

	supports: function (something){
		// Note: the propsect_* values need to match the keys in SwitchingStyleView.js
		var regex = /^palette|properties|style|states|inline-style|MultiPropTarget|propsect_common|propsect_widgetSpecific|propsect_events|propsect_layout|propsect_paddingMargins|propsect_background|propsect_border|propsect_fontsAndText|propsect_shapesSVG$/;
		return something.match(regex);
	},

	focus: function() {
//		if(this.currentEditor==this.visualEditor)
//			this.visualEditor.onContentChange();
	},
	
	_editorSelected: function(event){
		var context = this.getContext();
		if(this == event.oldEditor){
			context.hideFocusAll();
		}
		if(event.editor && event.editor.editorContainer && 
				(event.editor.declaredClass == 'davinci.ve.PageEditor' ||
				event.editor.declaredClass == 'davinci.ve.themeEditor.ThemeEditor')){
			if(this == event.editor){
				var flowLayout = context.getFlowLayout();
				var layout = flowLayout ? 'flow' : 'absolute';
				this._updateLayoutDropDownButton(layout);
				context.clearCachedWidgetBounds();
				if (this.editorContainer){
					this.editorContainer.updateToolbars();
				}
			}
		}
	},
	
	_contextLoaded: function(){
		if(davinci.Runtime.currentEditor == this && this.editorContainer){
			this.editorContainer.updateToolbars();
		}
	},
	
	_deviceChanged: function(){
		if(davinci.Runtime.currentEditor == this && this.editorContainer){
			var context = this.getContext();
			if(context && context.updateFocusAll){
				// setTimeout is fine to use for updateFocusAll
				// Need to insert a delay because new geometry
				// isn't ready right away.
				// FIXME: Should figure out how to use deferreds or whatever
				// to know for sure that everything is all set and we
				// can successfully redraw focus chrome
				setTimeout(function(){
					context.updateFocusAll();					
				},1000);
			}
		}
	},

	_updateLayoutDropDownButton: function(newLayout){
		var layoutDropDownButtonNode = dojo.query('.maqLayoutDropDownButton');
		if(layoutDropDownButtonNode && layoutDropDownButtonNode[0]){
			var layoutDropDownButton = dijit.byNode(layoutDropDownButtonNode[0]);
			if(layoutDropDownButton){
				layoutDropDownButton.set('label', veNls['LayoutDropDownButton-'+newLayout]);
			}
		}

	},
	
	_selectLayout: function(layout){
		this._latestLayoutMode = layout;
		require(["davinci/actions/SelectLayoutAction"], function(ActionClass){
			var SelectLayoutAction = new ActionClass();
			SelectLayoutAction._changeLayoutCommand(layout);
		});
		this._updateLayoutDropDownButton(layout);
	},
	selectLayoutFlow: function(){
		this._selectLayout('flow');
	},
	selectLayoutAbsolute: function(){
		this._selectLayout('absolute');
	},

	getDisplayMode: function(){
		return this._displayMode;
	},
	getSourceDisplayMode: function(){
		return this._latestSourceMode;
	},
	_switchDisplayModeSource: function (newMode) {
		this._latestSourceMode = newMode;
		this.switchDisplayMode(newMode);
	},
	switchDisplayModeSource: function () {
		this._switchDisplayModeSource("source");
	},
	switchDisplayModeSplitVertical: function () {
		this._switchDisplayModeSource("splitVertical");
	},
	switchDisplayModeSplitHorizontal: function () {
		this._switchDisplayModeSource("splitHorizontal");
	},
	switchDisplayModeSourceLatest: function () {
		this.switchDisplayMode(this._latestSourceMode);
	},
	switchDisplayModeDesign: function () {
		this.switchDisplayMode("design");
	},
	switchDisplayMode: function (newMode) {
		var context = this.getContext();
		if (this._displayMode!="design") {
			this._bc.removeChild(this._srcCP);
			this.htmlEditor.setVisible(false);
		}

		// reset any settings we have used
		this._designCP.set("region", "center");
		delete this._designCP.domNode.style.width;
		delete this._srcCP.domNode.style.width;

		switch (newMode) {
			case "design":
				break;
			case "source":
				// we want to hide the design mode.  So we set the region to left
				// and manually set the width to 0.
				this._designCP.set("region", "left");
				this._designCP.domNode.style.width = 0;
				this._srcCP.set("region", "center");
				break;
			case "splitVertical":
				this._designCP.domNode.style.width = "50%";
				this._srcCP.set("region", "right");
				this._srcCP.domNode.style.width = "50%";
				this._bc.set("design", "sidebar");
				break;
			case "splitHorizontal":
				this._designCP.domNode.style.height = "50%";
	
				this._srcCP.set("region", "bottom");
				this._srcCP.domNode.style.height = "50%";
	
				this._bc.set("design", "headline");
		}

		if (newMode!="design") {
			this._bc.addChild(this._srcCP);
			this.htmlEditor.setVisible(true);
		}

		this._displayMode=newMode;

		// now lets relayout the bordercontainer
		this._bc.layout();

		if (this.editorContainer){
			this.editorContainer.updateToolbars();
		}

		dojo.publish('/davinci/ui/repositionFocusContainer', []);

		if (newMode == "source") {
			context.hideFocusAll();			
		}else{
			context.clearCachedWidgetBounds();
			context.updateFocusAll();
		}
	},

	_modelSelectionChange: function (selection) {
	    /*
	     * we do not want to drive selection on the view editor unless:
	     *     - we are in an editor mode which has a view editor (not source mode)
	     *     - we are the current editor
	     */
		if( this._displayMode == "source" || davinci.Runtime.currentEditor !== this ) {
			return;
		}
		
		this._selectionCssRules = null;
		if ( selection.length ) {
			var htmlElement = selection[0].model;
			if ( htmlElement && htmlElement.elementType == "HTMLElement" ) {
				var id = htmlElement.getAttribute("id");
				if ( id && this._displayMode!="source" ) {
					var widget = widgetUtils.byId(id, this.visualEditor.context.getDocument());
					this.visualEditor.context.select(widget);
				}
			}
		}
	},
	
	_widgetSelectionChange: function (selection) {
		if(!this.visualEditor.context ||
				(selection && selection.length && selection[0]._edit_context != this.visualEditor.context)){
			return;
		}
		var selection = this.visualEditor.context.getSelection();
		if (selection && selection.length){
			if (this._displayMode != "design"){
				this.htmlEditor.selectModel([{model:selection[0]._srcElement}]);
			}
		}
	},

	_stylePropertiesChange: function (value) {
		this.visualEditor._stylePropertiesChange(value);
//		this._srcChanged();
	},
	
	_setDirty: function() {
		this.setDirty(true);
	},
	
	setDirty: function(isDirty){
		this.isDirty=isDirty;
		if (isDirty){
			this.lastModifiedTime=Date.now();
		}
		if (this.editorContainer){
			this.editorContainer.setDirty(isDirty);
		}
	},
	
	_visualChanged: function(skipDirty) {
		if (!skipDirty) {
			this._setDirty();
		}
		this.htmlEditor.setValue(this.model.getText(),true);
	},
	
	_srcChanged: function() {
		var wasTyping = this.htmlEditor.isTyping;
		if(wasTyping) {
			this.visualEditor.skipSave = true;
		}
		var context = this.visualEditor.context,
			statesScenes = context ? context.getStatesScenes() : undefined;
		this.visualEditor.setContent(this.fileName, this.htmlEditor.model);
		dojo.publish('/davinci/ui/context/pagerebuilt', [context]);
		if(statesScenes){
			context.setStatesScenes(statesScenes);
		}
		delete this.visualEditor.skipSave;
		this._setDirty();
	},
	
	getContext: function() {
		return this.visualEditor.context;
	},
	
	getOutline: function() {
		if (!this.outline) {
			this.outline = new VisualEditorOutline(this);
		}
		return this.outline;
	},
	
	getPropertiesView: function() {
		return this.currentEditor.getPropertiesView();
	},
	
	
	setContent: function (filename, content, newHtmlParams) {
		
		/*// clear the singletons in the Factory
		this.htmlEditor.htmlFile.visit({visit:function(node) {
			if (node.elementType == "CSSImport") {
				node.close();
			}
		}});*/
	    this.fileName = filename;
	    this.htmlEditor.setContent(filename,content);
		this.visualEditor.setContent(filename, this.htmlEditor.model, newHtmlParams);
		this._connect(this.htmlEditor.model,"onChange", "_themeChange");
		// update the source with changes which may have been made during initialization without setting dirty bit
		this.htmlEditor.setValue(this.model.getText(), true);
	},
	
	_themeChange: function(e) {
		if (e && e.elementType === 'CSSRule') {
			this.setDirty(true); // a rule change so the CSS files are dirty. we need to save on exit
			this.visualEditor.context.hotModifyCssRule(e);
		}
	}, 
	
	getDefaultContent: function() {
		this._isNewFile=true;
		return this.visualEditor.getDefaultContent();
	},

	selectModel: function (selection, editor) {
		if (this.publishingSelect || (editor && this != editor)) {
			return;
		}
		var selectionItem= selection && selection[0];
		if (!selectionItem) {
			return;
		}
		if (selectionItem.elementType) {
			this.htmlEditor.selectModel(selection);
		} else if (selectionItem.model && selectionItem.model.isWidget) {
			this.visualEditor.context.select(selectionItem.model,selectionItem.add);
		}
	},
	
	save: function (isAutoSave) {
	//	this.inherited(arguments);

		if (isAutoSave) {
			if (system.resource.findResource(this.fileName).readOnly()) {
				// disable autosaving for readonly files
				return;
			}
		}

		this.savePoint=this._commandStack.getUndoCount();
		this.visualEditor.save(isAutoSave);
		
		this.isDirty= this.isDirty && isAutoSave;
		if (this.editorContainer) {
			this.editorContainer.setDirty(isAutoSave);
		}
	},
	
	removeWorkingCopy: function(){ //wdr
		//this.visualEditor.removeWorkingCopy();
	},

	previewInBrowser: function () {
		this.visualEditor.previewInBrowser();
	},

	destroy: function () {
		this.inherited(arguments);
		this.visualEditor.destroy();
		this.htmlEditor.destroy();
	},
	
	getText: function () {
		return this.htmlEditor.getText();
	},
	
	onResize: function() {
		var context = this.getContext();
		var selections = context.getSelection();
		for (var i = 0; i < selections.length; i++) {
			var add = (i != 0);
			context.select(selections[i], add); 
		}
	},

	// dummy handler
	handleKeyEvent: function(e) {
	},
	
	getDisplayMode: function(){
		return this._displayMode;
	},
	
	/**
	 * Return clipping bounds for focusContainer node, whose main purpose is to
	 * clip the selection chrome so it doesn't impinge on other parts of the UI
	 */
	getFocusContainerBounds: function(){
		if(this._displayMode == 'source'){
			return {l:0, t:0, w:0, h:0};
		}else{
			var clipTo = this._designCP.domNode;
			var box = GeomUtils.getBorderBoxPageCoords(clipTo);
/*FIXME: See #2951. This isn't working in all cases yet, so commenting out.
  When a silhouette is active, need to check for an active scroll bar on this._designCP.domNode
  but when no silhouette, need to check the HTML node on the user's document within iframe.
  Code below only deals with this._designCP.domNode.
			// Back off selection chrome in case this._designCP has scrollbar(s)
			if(clipTo.scrollWidth > clipTo.clientWidth && (clipTo.clientWidth - scrollbarWidth) < box.w){
				box.w = clipTo.clientWidth - scrollbarWidth;
			}
			if(clipTo.scrollHeight > clipTo.clientHeight && (clipTo.clientHeight - scrollbarWidth) < box.h){
				box.h = clipTo.clientHeight - scrollbarWidth;
			}
*/
			// Make the clip area 8px bigger in all directions to make room
			// for selection chrome, which is placed just outside bounds of widget
			box.l -= 8;
			box.t -= 8;
			var device = (this.visualEditor && this.visualEditor.getDevice) ? this.visualEditor.getDevice() : 'none';
			if(device == 'none'){
				box.w += (this._displayMode == 'splitVertical' ? 8 : 16);
				box.h += (this._displayMode == 'splitHorizontal' ? 8 : 16);
			}else{
				box.w += 8;
				box.h += 8;
			}
			return box;
		}
	},
	
	getCommandStack: function(){
		var context = this.getContext();
		return context.getCommandStack();
	}
});
}); 
