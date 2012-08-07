define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "dijit/Tree",
        "davinci/review/view/CommentExplorerView",
        "davinci/review/model/ReviewTreeModel",
        "davinci/Workbench",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/OpenReviewDialog.html",
        "dijit/form/Button", //used in template
        "dijit/layout/ContentPane" //used in template
        
],function(declare, _Templated, _Widget, Tree, CommentExplorerView, ReviewTreeModel, Workbench, uiNLS, commonNLS, templateString){
	return declare("davinci.ui.widgets.OpenFile",   [_Widget, _Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		
		fileDialogFileName : null,
		fileDialogParentFolder: null,
		
		postMixInProperties: function() {
			dojo.mixin(this, uiNLS);
			dojo.mixin(this, commonNLS);
			if (!this.finishButtonLabel) {
				this.finishButtonLabel = uiNLS.open;
			}
			this.inherited(arguments);
		},
		
		postCreate: function(){
			this.inherited(arguments);
			
			//Create the tree
			var model= new ReviewTreeModel();
			this.model = model;
			var tree = this.tree = new Tree({
				id: "openReviewDialogTree",
				persist: false,
				showRoot: false,
				model: model,
				labelAttr: "name", 
				childrenAttrs: "children",
				getIconClass: CommentExplorerView.getIconClass,
				getLabelClass: CommentExplorerView.getLabelClass,
				transforms: CommentExplorerView.getSortTransforms()
			});
			
			//Add tree to dialog
			this.treeContentPane.set("content", tree);
		
			//Watch for selection changes on tree
			tree.watch("selectedItems", dojo.hitch(this, this._updateFields));
		},
	
		startup: function() {		
			this.tree.startup();
		},
		
		_updateFields: function(){
			//Clear out old values
			this.okButton.set("disabled", true);
			this._selectedResource = null;
			
			//Get selected items
			var resources = this.tree.get('selectedItems');
			
			//Determine if we have one valid item selected
			if (resources && resources.length == 1) {
				var resource = resources[0];
				if (resource.elementType == "ReviewFile") {
					this.okButton.set("disabled", false);
					this._selectedResource = resource;
				}
			}	
		},

		_okButton: function(){
			if (this._selectedResource) {
				//Open editor
				var item = this._selectedResource;
				davinci.Workbench.openEditor({
					fileName: item,
					content: item.getText()
				});
				
				this.cancel = false;
			}
		},
		
		_cancelButton: function(){
			this.onClose();
		},

		resize: function(coords) {
			this.treeContentPane.resize(coords);
		},
		
		onClose: function() {

		}
	});
});