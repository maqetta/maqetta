/**
 * This routine is a companion to DataStoreView, which is not
 * used by the product at the time this comment was written.
 */

define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ui/dnd/DragManager",
	"davinci/Workbench",
	"davinci/ve/widgets",
	"davinci/ve/views/DataStoresView"
], function(declare, CreateTool, dragManager, Workbench, widgetUtils, DataStoresView){

return declare("davinci.ve.palette.DataStoreDragSource", null, {
	
    constructor: function(data) {
        // data from the item being dragged
        this.data = data;
        // to be set when in dragEnd
        this.dropTarget = null;
    },
        
    initDrag: function() {
        var editor = this.editor = Workbench.getOpenEditor();
        if (editor && editor.currentEditor && editor.currentEditor.context)
        {
            this.context = editor.currentEditor.context;
            dragManager.document = this.context.getDocument();
            var frameNode = this.context.frameNode;
            if(frameNode){
                var coords = dojo.coords(frameNode);
                var containerNode = this.context.getContainerNode();
                dragManager.documentX = coords.x - containerNode.scrollLeft;
                dragManager.documentY = coords.y - containerNode.scrollTop
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
            dropTarget = widgetUtils.getWidget(dropTarget);
            this._setTargetAttributes(dropTarget);
        }
    },
    _setTargetAttributes: function(dropTarget) {
        DataStoresView.bindDS(dropTarget, this.data.dsId, this.data.attrId);
    }
});
});