dojo.provide("davinci.libraries.dojo.dijit.form.DataListCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dijit.form.DataListCreateTool", davinci.ve.tools.CreateTool, {
    // override CreateTool.create() to force the DataList to the top of the HTML file under the root
    // this prevents the DataList from being referenced before it has been instantiated
    create: function(args) {
    	debugger;
        // insert at beginning of HTML
        args.index = 0;
        
        // force parent to be the HTML root node
        args.target = davinci.ve.widget.getEnclosingWidget(this._context.rootNode);
        
        this.inherited(arguments);
    }
});