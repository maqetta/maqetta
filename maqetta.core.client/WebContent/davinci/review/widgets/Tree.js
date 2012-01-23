dojo.provide("davinci.review.widgets.Tree");

dojo.require("davinci.Workbench");
dojo.require("dijit.Tree");

//FIXME: should be able to override dijit.Tree directly?
dojo.require("davinci.ui.widgets.ToggleTree");

dojo.declare("davinci.review.widgets._TreeNode", davinci.ui.widgets._ToggleTreeNode, {
    postCreate: function(){
        this.inherited(arguments);

        var location = davinci.Workbench.location().match(/http:\/\/.*:\d+\//);
        console.debug("review Tree @ "+location);
        var divDom = dojo.create("img", { 
        	src: location + "maqetta/app/dojo/resources/blank.gif",
        	"class":"deleteImg"
        		});
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