define([
	"dojo/_base/declare",
	"davinci/workbench/ViewPart",
	"davinci/Workbench",
	"davinci/ui/widgets/ToggleTree",
	"dijit/layout/ContentPane",
	"dojo/i18n!davinci/workbench/nls/workbench"
], function(declare, ViewPart, Workbench, ToggleTree, ContentPane, workbenchStrings){

return declare("davinci.workbench.OutlineView", ViewPart, {

	constructor: function(params, srcNodeRef){
		this.subscribe("/davinci/ui/editorSelected", this.editorChanged);
		this.subscribe("/davinci/ui/selectionChanged", this.selectionChanged);
		this.subscribe("/davinci/ui/modelChanged", this.modelChanged);
	},
	
	editorChanged: function(changeEvent){
		var editor = changeEvent.editor;
	
		if (this.currentEditor) {
			if (this.currentEditor==editor) {
				return;
			}
//			this.currentEditor.removeChangeListener(this.modelStore);
			if (this.outlineTree) {
				this.removeContent();
				this.outlineTree.destroy();
			}
			delete this.outlineProvider;
			delete this.outlineTree;
			delete this._toolbarID;
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
		if (this.outlineProvider) {
			this.outlineProvider._outlineView = this;
			
			if (this.outlineProvider.toolbarID) {
				this.toolbarID=this.outlineProvider.toolbarID;
				this._createToolbar();
			}
			this.createTree();
		} else {
			this.containerNode.innerHTML = workbenchStrings.outlineNotAvailable;
		}
	},

	createTree: function() {
		if (this.outlineTree) 
			this.removeContent();

		iconFunction = this.outlineProvider.getIconClass && dojo.hitch(this.outlineProvider,this.outlineProvider.getIconClass);
		if (this.outlineProvider.getModel) {
			this.outlineModel = this.outlineProvider.getModel(this.currentEditor);
		} else {
			if (this.outlineProvider.getStore) {
				this.modelStore = this.outlineProvider.getStore();
			} else {
				console.log("FIXME: davinci.ui.ModelStore no longer exists");
				/*
				this.modelStore = new davinci.ui.ModelStore( {
					model: editor.model
				});
				*/
			}
			if (this.outlineProvider.getLabel) {
				this.modelStore.getLabel = dojo.hitch(this, function(item) {
					return this.outlineProvider.getLabel(item);
				});
			}

			if (this.outlineProvider.getChildren) {
				this.modelStore.getValues = dojo.hitch(this, function(item, attribute) {
					return this.outlineProvider.getChildren(item);
				});
			}

			this.outlineModel = new dijit.tree.TreeStoreModel( {
				store : this.modelStore,
				rootId : 'test.js',
				rootLabel : 'test.js',
				childrenAttrs : [ "children" ]
			});
		}
		this.outlineTree = new ToggleTree({
			showRoot: this.outlineModel.showRoot,
			dndController: this.outlineModel.dndController,
			betweenThreshold: this.outlineModel.betweenThreshold, 
			checkItemAcceptance: this.outlineModel.checkItemAcceptance, 
			model: this.outlineModel,
			getIconClass: iconFunction || ToggleTree.prototype.getIconClass,
			isMultiSelect: true 
		});
		
		this.outlineTree.notifySelect=dojo.hitch(this, function (item, ctrlKeyPressed) {
			this.publish("/davinci/ui/selectionChanged", [[{model:item, add:ctrlKeyPressed}], this.currentEditor]);
		});

//		editor.addSelectionListener(function (selection){
//			if (selection.model)
//				outlineTree.selectNode(selection.model);
//		});
		// BEGIN TEMPORARY HACK for bug 5277: Surround tree with content pane and subcontainer div overflow: auto set to workaround spurious dnd events.
		// Workaround should be removed after the following dojo bug is fixed: http://bugs.dojotoolkit.org/ticket/10585
		this.container = new ContentPane({style:"padding:0"});
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
		
		var outlineActionsID = (this.outlineProvider.getActionsID && this.outlineProvider.getActionsID()) || 'davinci.ui.outline';

		Workbench.createPopup({
			partID: outlineActionsID,
			domNode: this.outlineTree.domNode,
			openCallback: this.outlineTree.getMenuOpenCallback()
		});
	},

	_getViewContext: function () {
		return this.outlineProvider;
	},

	selectionChanged: function(selection) {
		if (!this.publishing["/davinci/ui/selectionChanged"] &&
				selection.length && selection[0].model && this.outlineTree) {
			this.outlineTree.selectNode([selection[0].model]);
		}
	},
	
	modelChanged: function(modelChanges) {
		if (this.outlineModel && this.outlineModel.refresh) {
			this.outlineModel.refresh();
		} else if (this.outlineProvider&&this.outlineProvider.getStore) {
			this.outlineModel.store=this.outlineProvider.getStore();
			this.outlineModel.onChange(this.outlineProvider._rootItem );
		}
	}
});
});
