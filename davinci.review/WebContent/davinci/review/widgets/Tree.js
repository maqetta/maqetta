dojo.provide("davinci.review.widgets.Tree");

dojo.require("dijit.Tree");
//TODO:  use dojo DND instead
dojo.require("davinci.ui.dnd.DragSource");
dojo.require("davinci.ui.widgets.Filter");
dojo.require("davinci.ui.widgets.Tree");
dojo.declare("davinci.review.widgets._TreeNode", davinci.ui.widgets._TreeNode, {
	postCreate: function(){
		this.inherited(arguments);
		
		if (this.tree.model.useRichTextLabel) {
			this.labelNode.innerHTML = this.label;
		}

		if(!this.tree.model.toggleMode || !this.shouldShowElement('toggleNode', this.item)) {
			dojo.addClass(this.toggleNode, "dijitHidden");
		} else {
			if (this.tree.model.isToggleOn(this.item)) {
				this._setToggleAttr(true);
			}
 		}
		if (this.tree.model.postCreate) {
			this.tree.model.postCreate(this);
		}
		var divDom = dojo.create("img", { src:"app/dojo/resources/blank.gif","class":"deleteImg"});
		dojo.connect(divDom,"onclick",this,dojo.hitch(this,function(){
			dojo.publish("/davinci/review/deleteReviewFile",[this.item]);
		}));
		dojo.place(divDom, this.rowNode, "first");
		//this.rowNode.appendChild(divDom);
		dojo.style(this.rowNode,{width:"99%"});
	}

	
});

dojo.declare("davinci.review.widgets.Tree", davinci.ui.widgets.Tree, {
	_createTreeNode: function(/*Object*/ args){
 		var treeNode=new davinci.review.widgets._TreeNode(args);
 		if (this.dragSources && args.item)
 		{
 			for (var i=0;i<this.dragSources.length;i++)
 				if (this.dragSources[i].dragSource(args.item))
 				{
 					var ds = new davinci.ui.dnd.DragSource(treeNode.domNode, "component", treeNode);
 					ds.targetShouldShowCaret = true;
 					ds.returnCloneOnFailure = false;
 					dojo["require"](this.dragSources[i].dragHandler);
 					var dragHandlerClass= dojo.getObject(this.dragSources[i].dragHandler); 
 					ds.dragHandler=new dragHandlerClass(args.item);
 					this.connect(ds, "initDrag", function(){if (ds.dragHandler.initDrag) ds.dragHandler.initDrag()}); // move start
 					this.connect(ds, "onDragStart", function(){ds.dragHandler.dragStart()}); // move start
 					this.connect(ds, "onDragEnd", function(){ds.dragHandler.dragEnd()}); // move end
	
 				}
 
 		}
 		return treeNode;
	}
});