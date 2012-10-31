define([
	"dojo/_base/declare",
	"./ViewPart",
	"../Workbench",
	"../ui/widgets/OutlineTree",
	"dijit/layout/ContentPane",
	"dojo/i18n!./nls/workbench"
], function(declare, ViewPart, Workbench, OutlineTree, ContentPane, workbenchStrings){

return declare(ViewPart, {

	constructor: function(params, srcNodeRef){
		this.subscribe("/davinci/ui/editorSelected", this.editorChanged);
		//this.subscribe("/davinci/ui/selectionChanged", this.selectionChanged);
		//this.subscribe("/davinci/ui/modelChanged", this.modelChanged);
		this.subscribe("/davinci/ui/context/pagerebuilt", this._pageRebuilt);
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

		if (this.popup) {
			this.popup.destroyRecursive();
		}
                       
		if (this.outlineProvider && this.outlineProvider.getModel) {
			this.outlineModel = this.outlineProvider.getModel(this.currentEditor);
		}

		// create tree
		var treeArgs = {
			model: this.outlineModel,
			showRoot: this.outlineModel.showRoot,
			betweenThreshold: this.outlineModel.betweenThreshold,
			checkItemAcceptance: this.outlineModel.checkItemAcceptance,
			isMultiSelect: true,
			persist: false
		};

		if (this.outlineProvider.getIconClass) {
			treeArgs.getIconClass = this.outlineProvider.getIconClass;
		}

		if (this.currentEditor.getContext) {
			treeArgs.context = this.currentEditor.getContext()
		}

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
		this.attachToolbar();
		// END HACK: Original code commented out below:

		this.outlineTree.startup();

		if (this.outlineProvider) {
			this.outlineProvider._tree = this.outlineTree;
		}

		var outlineActionsID = (this.outlineProvider.getActionsID && this.outlineProvider.getActionsID()) || 'davinci.ui.outline';

		this.popup = Workbench.createPopup({
			partID: outlineActionsID,
			domNode: this.outlineTree.domNode,
		  openCallback: this.outlineTree.getMenuOpenCallback ? this.outlineTree.getMenuOpenCallback() : null
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

	_pageRebuilt: function() {
		if (this.outlineTree) {
			var paths = this.outlineTree.get("paths");
			this.createTree();
			this.outlineTree.set("paths", paths);
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
