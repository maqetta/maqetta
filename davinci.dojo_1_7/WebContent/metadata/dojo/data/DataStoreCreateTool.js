dojo.provide("davinci.libraries.dojo.dojo.data.DataStoreCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dojo.data.DataStoreCreateTool", davinci.ve.tools.CreateTool, {
    // override CreateTool.create() to force the DataStore to the top of the HTML file under the root
    // this prevents the DataStore from being referenced before it has been instantiated
    create: function(args) {
        // insert at beginning of HTML
        args.index = 0;
        
        // force parent to be the HTML root node
        args.target = davinci.ve.widget.getEnclosingWidget(this._context.rootNode);
        
        this.inherited(arguments);
    }
});