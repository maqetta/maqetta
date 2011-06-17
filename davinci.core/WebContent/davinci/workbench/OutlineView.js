dojo.provide("davinci.workbench.OutlineView");

dojo.require("dijit.layout.TabContainer");
dojo.require("davinci.Workbench");
dojo.require("davinci.workbench.ViewPart");
//dojo.require("davinci.ui.ModelStore");
dojo.require("davinci.ui.widgets.Tree");
dojo.require("davinci.workbench.OutlineProvider");

dojo.declare("davinci.workbench.OutlineView", davinci.workbench.ViewPart, {
	
	outlineProvider:null,
	
	constructor: function(params, srcNodeRef){
		this.subscribe("/davinci/ui/editorSelected", this.editorChanged);
		this.subscribe("/davinci/ui/selectionChanged", this.selectionChanged);
		this.subscribe("/davinci/ui/modelChanged", this.modelChanged);
	},
	
	editorChanged : function(changeEvent){
	
		try {
			var editor=changeEvent.editor;
		
			if (this.currentEditor)
			{
				if (this.currentEditor==editor) {
					return;
				}
	//			this.currentEditor.removeChangeListener(this.modelStore);
				if (this.outlineTree) {
					this.removeContent();
					this.outlineTree.destroy();
				}
				this.outlineProvider=this.outlineTree=null;
				this._toolbarID=undefined;
			}
			this.currentEditor=editor;
			if (!editor) {
				return;
			}
		
			if (editor.getOutline) {
				this.outlineProvider=editor.getOutline();
			}
			var iconFunction;
			this.toolbarDiv.innerHTML="";
			if (this.outlineProvider)
			{
				this.outlineProvider._outlineView=this;
				
				if (this.outlineProvider.toolbarID)
				{
					this.toolbarID=this.outlineProvider.toolbarID;
					this._createToolbar();
				}
				this.createTree();
			}
			else
			{
				this.containerNode.innerHTML="An outline is not available";
				return;
			}
			
		}catch(e){
			console.log("FIXME: outline view replace failed, error: " + e);
		}
	},

	createTree : function() {
		if (this.outlineTree) 
			this.removeContent();

		iconFunction = this.outlineProvider.getIconClass && dojo.hitch(this.outlineProvider,this.outlineProvider.getIconClass);
		if (this.outlineProvider.getModel) {
			this.outlineModel = this.outlineProvider
					.getModel(this.currentEditor);
		} else {
			if (this.outlineProvider.getStore) {
				this.modelStore = this.outlineProvider
						.getStore();
			} else {
				this.modelStore = new davinci.ui.ModelStore( {
					model : editor.model
				});
			}
			if (this.outlineProvider.getLabel) {
				this.modelStore.getLabel = dojo.hitch(this,
						function(item) {
							return this.outlineProvider
									.getLabel(item);
						});
			}

			if (this.outlineProvider.getChildren) {
				this.modelStore.getValues = dojo.hitch(this,
						function(item, attribute) {
							return this.outlineProvider
									.getChildren(item);
						});
			}


			this.outlineModel = new dijit.tree.TreeStoreModel( {
				store : this.modelStore,
				rootId : 'test.js',
				rootLabel : 'test.js',
				childrenAttrs : [ "children" ]
			});
		}
		this.outlineTree = new davinci.ui.widgets.Tree({
			
			showRoot: this.outlineModel.showRoot,
			dndController: this.outlineModel.dndController,
			betweenThreshold: this.outlineModel.betweenThreshold, 
			checkItemAcceptance: this.outlineModel.checkItemAcceptance, 
			model: this.outlineModel,
			getIconClass: iconFunction || davinci.ui.widgets.Tree.prototype.getIconClass,
			isMultiSelect : true 
		});
		
		this.outlineTree.notifySelect=dojo.hitch(this, function (item, ctrlKeyPressed) 
		{

			this.publish("/davinci/ui/selectionChanged",[[{model:item, add:ctrlKeyPressed}],this]);

		});

//		editor.addSelectionListener(function (selection){
//			if (selection.model)
//				outlineTree.selectNode(selection.model);
//		});
		// BEGIN TEMPORARY HACK for bug 5277: Surround tree with content pane and subcontainer div overflow: auto set to workaround spurious dnd events.
		// Workaround should be removed after the following dojo bug is fixed: http://bugs.dojotoolkit.org/ticket/10585
		this.container =  new dijit.layout.ContentPane({style:"padding:0"});
		this.subcontainer = dojo.doc.createElement('div');
		this.subcontainer.id = "dvOutlineSubcontainer";
		this.subcontainer.appendChild(this.outlineTree.domNode);
		this.container.domNode.appendChild(this.subcontainer);
		this.setContent(this.container);
		// END HACK: Original code commented out below:
		// this.setContent(this.outlineTree);
		this.outlineTree.startup();
		
		if (this.outlineProvider) {
			this.outlineProvider._tree=this.outlineTree;
		}
		
		var outlineActionsID= (this.outlineProvider.getActionsID && this.outlineProvider.getActionsID()) ||'davinci.ui.outline';

		var popup=davinci.Workbench.createPopup(
				{partID:outlineActionsID, domNode : this.outlineTree.domNode
				,openCallback : this.outlineTree.getMenuOpenCallback()}
		);
		
		},

	_getViewContext : function ()
	{
		return this.outlineProvider;
	},
	selectionChanged : function(selection)
	{
		if (this.publishing["/davinci/ui/selectionChanged"]){
			return;
		}
		if (selection.length>0)
		{
			if (selection[0].model && this.outlineTree)
				this.outlineTree.selectNode([selection[0].model]);
		}

	},
	
	modelChanged : function(modelChanges)
	{
		if (this.outlineModel && this.outlineModel.refresh)
			this.outlineModel.refresh();
		else
		{
			if (this.outlineProvider&&this.outlineProvider.getStore)
			{
				this.outlineModel.store=this.outlineProvider.getStore();
//				debugger;
				this.outlineModel.onChange(this.outlineProvider._rootItem );
				
			}
		}
	}
	
	
});





