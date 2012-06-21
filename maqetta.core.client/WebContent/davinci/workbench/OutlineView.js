define([
	"dojo/_base/declare",
	"davinci/workbench/ViewPart",
	"davinci/Workbench",
	"davinci/ui/widgets/OutlineTree",
	"dijit/layout/ContentPane",
	"dojo/i18n!davinci/workbench/nls/workbench"
], function(declare, ViewPart, Workbench, OutlineTree, ContentPane, workbenchStrings){

return declare("davinci.workbench.OutlineView", ViewPart, {

	constructor: function(params, srcNodeRef){
		this.subscribe("/davinci/ui/editorSelected", this.editorChanged);
		//this.subscribe("/davinci/ui/selectionChanged", this.selectionChanged);
		//this.subscribe("/davinci/ui/modelChanged", this.modelChanged);
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
			
			/*if (this.outlineProvider.toolbarID) {
				this.toolbarID=this.outlineProvider.toolbarID;
				this._createToolbar();
			}*/

			this.createTree();
		} else {
			this.containerNode.innerHTML = workbenchStrings.outlineNotAvailable;
		}
	},

	createTree: function() {
		if (this.outlineTree) {
			this.removeContent();
		}
                       
		if (this.outlineProvider && this.outlineProvider.getModel) {
			this.outlineModel = this.outlineProvider.getModel(this.currentEditor);
		}

		var iconFunction = this.outlineProvider.getIconClass && dojo.hitch(this.outlineProvider,this.outlineProvider.getIconClass);
 
		// create tree
		var treeArgs = {
			context: this.currentEditor.getContext(),
			model: this.outlineModel,
			getIconClass: iconFunction,
			showRoot: this.outlineModel.showRoot,
			betweenThreshold: this.outlineModel.betweenThreshold,
			checkItemAcceptance: this.outlineModel.checkItemAcceptance,
			isMultiSelect: true,
			persist: false
		};

		// #2256 - dijit tree cannot have a null dndController
		if (this.outlineModel.dndController) {
			treeArgs.dndController = this.outlineModel.dndController;
		}

		this.outlineTree = new OutlineTree(treeArgs); 

		// BEGIN TEMPORARY HACK for bug 5277: Surround tree with content pane and subcontainer div overflow: auto set to workaround spurious dnd events.
		// Workaround should be removed after the following dojo bug is fixed: http://bugs.dojotoolkit.org/ticket/10585
		this.container = new ContentPane({style:"padding:0"});
		this.subcontainer = dojo.doc.createElement('div');
		this.subcontainer.id = "dvOutlineSubcontainer";
		this.subcontainer.appendChild(this.outlineTree.domNode);
		this.container.domNode.appendChild(this.subcontainer);
		this.setContent(this.container);
		// END HACK: Original code commented out below:

		this.outlineTree.startup();

		if (this.outlineProvider) {
			this.outlineProvider._tree = this.outlineTree;
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
			this.outlineModel.onChange(this.outlineProvider._rootItem);
		}
	}
});
});
