/**
 * This routine is a companion to DataStoreView, which is not
 * used by the product at the time this comment was written.
 */

define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ui/dnd/DragSource"
], function(declare, CreateTool, DragSource){

return declare("davinci.ve.palette.DataStoreDragSource", null, {
	
    constructor: function(data) {
        // data from the item being dragged
        this.data = data;
        // to be set when in dragEnd
        this.dropTarget = null;
    },
        
    initDrag: function() {
        var editor = this.editor = davinci.Workbench.getOpenEditor();
        if (editor && editor.currentEditor && editor.currentEditor.context)
        {
            this.context = editor.currentEditor.context;
            davinci.ui.dnd.dragManager.document = this.context.getDocument();
            var frameNode = this.context.frameNode;
            if(frameNode){
                var coords = dojo.coords(frameNode);
                var containerNode = this.context.getContainerNode();
                davinci.ui.dnd.dragManager.documentX = coords.x - containerNode.scrollLeft;
                davinci.ui.dnd.dragManager.documentY = coords.y - containerNode.scrollTop
            }
        }
        else 
            this.context = null;
    },
    dragStart: function() {
        // nothing to do
    },
    dragEnd: function(e) {
        if (this.context) {
            var dropTarget = e.target.className !== 'editFeedback' ? e.target : this.context._activeTool._target;
            dropTarget = dropTarget.domNode || dropTarget;
            while (!dropTarget._dvWidget && dropTarget.parentNode && dropTarget !== this.context.rootNode) {
                dropTarget = dropTarget.parentNode;
            }
            if (dropTarget === this.context.rootNode) {
                return;
            }
            dropTarget = davinci.ve.widget.getWidget(dropTarget);
            this._setTargetAttributes(dropTarget);
        }
    },
    _setTargetAttributes: function(dropTarget) {
        davinci.ve.views.DataStoresView.bindDS(dropTarget, this.data.dsId, this.data.attrId);
    }
});
});