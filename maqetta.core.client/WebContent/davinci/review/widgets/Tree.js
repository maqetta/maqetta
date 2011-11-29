dojo.provide("davinci.review.widgets.Tree");

dojo.require("dijit.Tree");

//FIXME: should be able to override dijit.Tree directly?
dojo.require("davinci.ui.widgets.ToggleTree");

dojo.declare("davinci.review.widgets._TreeNode", davinci.ui.widgets._ToggleTreeNode, {
    postCreate: function(){
        this.inherited(arguments);

        var divDom = dojo.create("img", { src:"maqetta/app/dojo/resources/blank.gif","class":"deleteImg"});
        dojo.connect(divDom,"onclick",this,dojo.hitch(this,function(){
            dojo.publish("/davinci/review/deleteReviewFile",[this.item]);
        }));
        dojo.place(divDom, this.rowNode, "first");
        //this.rowNode.appendChild(divDom);
        dojo.style(this.rowNode,{width:"99%"});
    }
});

dojo.declare("davinci.review.widgets.Tree", davinci.ui.widgets.ToggleTree, {
    _createTreeNode: function(/*Object*/ args){
         return new davinci.review.widgets._TreeNode(args);
    }
});