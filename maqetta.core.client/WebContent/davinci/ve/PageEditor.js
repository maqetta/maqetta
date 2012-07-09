define([
	"dojo/_base/declare",
	"../ui/ModelEditor",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"../commands/CommandStack",
	"../html/ui/HTMLEditor",
	"../model/Path",
	"./VisualEditor",
	"./VisualEditorOutline",
	"./widget",
	"../Runtime"
], function(declare, ModelEditor, BorderContainer, ContentPane, CommandStack, HTMLEditor, Path, VisualEditor, VisualEditorOutline, widgetUtils){

return declare("davinci.ve.PageEditor", ModelEditor, {
	   
    constructor: function (element, fileName) {

        this._bc = new BorderContainer({}, element);

        this.domNode = this._bc.domNode;

        this._commandStack = new CommandStack(this);
        this.savePoint=0;

        this._designCP = new ContentPane({region:'center'});
        this._bc.addChild(this._designCP);


        this.visualEditor = new VisualEditor(this._designCP.domNode, this);
        this.currentEditor = this.visualEditor;
        this.currentEditor._commandStack = this._commandStack;

        this._srcCP = new dijit.layout.ContentPane({region: 'bottom', splitter: true, style: "height:50%"});

        // hack to get the source content page to resize itself
        var oldResize = this._srcCP.resize;
        this._srcCP.resize = function(changeSize, resultSize)
        {
            dojo.marginBox(this.domNode, resultSize);
            oldResize.apply(this, arguments);
        };

        this.htmlEditor = new HTMLEditor(this._srcCP.domNode, fileName, true);
        this.htmlEditor.setVisible(false);
        this.model = this.htmlEditor.model;

        this._displayMode = "design";

        this.model = this.htmlEditor.model;

        this._bc.startup();
        this._bc.resize(); // kludge: forces primary tab to display	


        this._connect(this.visualEditor,"onContentChange", "_visualChanged");
        this._connect(this.htmlEditor,"handleChange", "_srcChanged");
        this.subscribe("/davinci/ui/styleValuesChange",   this._stylePropertiesChange);
        this.subscribe("/davinci/ui/widgetSelected",   this._widgetSelectionChange);
        this.subscribe("/davinci/ui/selectionChanged",  this._modelSelectionChange);
//      this._connect(this.visualEditor.context, "onSelectionChange","_widgetSelectionChange");
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

	switchDisplayMode: function (newMode) {
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

		if (newMode!="design") {
			this.htmlEditor.editor.getTextView().resize();
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
	
	_visualChanged: function() {
		this._setDirty();
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
	}
});
}); 
