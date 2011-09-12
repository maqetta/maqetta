dojo.provide("davinci.ve.PageEditor");
 
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.html.ui.HTMLEditor");
dojo.require("davinci.model.Path");
dojo.require("davinci.ve.VisualEditor");
dojo.require("davinci.ve.VisualEditorOutline");
dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.utils.URLRewrite");

dojo.declare("davinci.ve.PageEditor", davinci.ui.ModelEditor, {
	   

    constructor: function (element, rootElement) {

    	this._rootElement = rootElement;
        this._bc = new dijit.layout.BorderContainer({}, element);

        this.domNode = this._bc.domNode;

        this._commandStack = new davinci.commands.CommandStack(this);
        this.savePoint=0;

        this._designCP = new dijit.layout.ContentPane({region:'center'});
        this._bc.addChild(this._designCP);


        this.visualEditor=new davinci.ve.VisualEditor(this._designCP.domNode, this);
        this.currentEditor=this.visualEditor;
        this.currentEditor._commandStack=this._commandStack;

        this._srcCP = new dijit.layout.ContentPane({region:'bottom',splitter:true,style: "height:50%"});

        // hack to get the source content page to resize itself
        var oldResize=this._srcCP.resize;
        this._srcCP.resize = function(changeSize, resultSize)
        {
            dojo.marginBox(this.domNode, resultSize);
            oldResize.apply(this, arguments);
        };

        this.htmlEditor=new davinci.html.ui.HTMLEditor(this._srcCP.domNode,true);
        this.htmlEditor.setVisible(false);
        this.model=this.htmlEditor.model;

        this._displayMode="design";

        this.model=this.htmlEditor.model;

        this._bc.startup();
        this._bc.resize(); // kludge: forces primary tab to display	


        this._connect(this.visualEditor,"onContentChange", "_visualChanged");
        this._connect(this.htmlEditor,"handleChange", "_srcChanged");
        this.subscribe("/davinci/ui/styleValuesChange",   this._stylePropertiesChange);
        this.subscribe("/davinci/ui/widgetSelected",   this._widgetSelectionChange);
        this.subscribe("/davinci/ui/selectionChanged",  this._modelSelectionChange);
//      this._connect(this.visualEditor.context, "onSelectionChange","_widgetSelectionChange");
    },
	
	supports: function (something){
	    return /^\s*(palette|properties|style|states|inline-style|MultiPropTarget)\s*$/.test(something);
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
		this._bc.getParent().resize();
		var box=dojo.marginBox(this._bc.domNode);
		var dim;
		switch (newMode)
		{
		case "design":
			dim = 1;
			break;
		case "source":
			this._srcCP.region="right";
			dim = box.w-5;
			break;
		case "splitVertical":
			this._srcCP.region="right";
			this._bc.design="sidebar";
			dim = box.w/2;
			break;
		case "splitHorizontal":
			this._srcCP.region="bottom";
			this._bc.design="headline";
			dim = box.h/2;
		}
		if (newMode!="design") {
			this._bc.addChild(this._srcCP);
			this.htmlEditor.setVisible(true);
		}
		this._displayMode=newMode;
		this._bc._layoutChildren(this._srcCP.id, dim-1); // kludge: have to resize twice to get src to draw on some browsers
		this._bc._layoutChildren(this._srcCP.id, dim);
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
					var widget = davinci.ve.widget.byId(id, this.visualEditor.context.getDocument());
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
		this.isDirty=true;
		this.lastModifiedTime=Date.now();
		if (this.editorContainer){
			this.editorContainer.setDirty(true);
		}
	},
	
	_visualChanged: function() {
		this._setDirty();
		this.htmlEditor.setValue(this.model.getText(),true);
	},
	
	_srcChanged: function() {
		if (!this._updateDesignTimer) {
			var self=this;
			this._updateDesignTimer=setTimeout(function (){
				self.visualEditor.setContent(self.fileName,self.htmlEditor.model);
				self._setDirty();
				delete self._updateDesignTimer;
			},700);
		}
		this.isDirty=true;
		this.lastModifiedTime=Date.now();
	},
	
	getContext: function() {
		return this.visualEditor.context;
	},
	
	getOutline: function() {
		if (!this.outline) {
			this.outline=new davinci.ve.VisualEditorOutline(this);
		}
		return this.outline;
	},
	
	getPropertiesView: function() {
		return this.currentEditor.getPropertiesView();
	},
	
	
	setContent: function (filename, content) {

	    this.fileName=filename;
	    this.htmlEditor.setContent(filename,content);
	    if (this._isNewFile && this.resourceFile.parent!=davinci.resource.getRoot()) {
	        var rootPath=new davinci.model.Path([]);
	        var newPath=new davinci.model.Path(this.resourceFile.getPath()).getParentPath();
	        function updatePath(src) {
	            var fullPath=rootPath.append(src);
	            var newSrc=fullPath.relativeTo(newPath);
	            return newSrc.toString();
	        }
	        var visitor={visit: function (element) {
	            if (element.elementType=="HTMLElement") {
	                if (element.tag=="script") {
	                    var src=element.getAttribute("src");
	                    if (src) {
	                        element.addAttribute("src",updatePath(src));
	                    }
	                }
	            } else if (element.elementType=="CSSImport") {
	                var newPath=updatePath(element.url);
	                element.url=newPath;
	            }
	        }
	        };
	        this.htmlEditor.model.visit(visitor);
	    }
//		console.log(this.htmlEditor.model.getText());
		this.visualEditor.setContent(filename,this.htmlEditor.model);
		dojo.connect(this.htmlEditor.model, "onChange", this, '_themeChange');
//		this._visualChanged();
		// update the source with changes which may have been made during initialization without setting dirty bit
		this.htmlEditor.setValue(this.model.getText(), true);

	},
	
	_themeChange: function(e) {
		//debugger;
		if (e && e.elementType === 'CSSRule') {
			this.visualEditor.context.hotModifyCssRule(e);
		}
	},
	
	getDefaultContent: function() {
		this._isNewFile=true;
		return this.visualEditor.getDefaultContent();
	},

	selectModel: function (selection, editor) {
		if (this.publishingSelect || this != editor) {
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
