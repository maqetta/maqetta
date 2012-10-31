define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget"
], function(
	declare,
	CreateTool,
	Widget
) {

return declare(CreateTool, {
    // override CreateTool.create() to force the DataStore to the top of the HTML file under the root
    // this prevents the DataStore from being referenced before it has been instantiated
    create: function(args) {
        // insert at beginning of HTML
        args.index = 0;
        
        // force parent to be the HTML root node
        args.target = Widget.getEnclosingWidget(this._context.rootNode);
        
        this.inherited(arguments);
    }
});

});