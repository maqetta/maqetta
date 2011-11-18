dojo.provide("davinci.libraries.dojo.dojox.mobile.IconContainerCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.libraries.dojo.dojox.mobile.MobileCreateTool");

dojo.declare("davinci.libraries.dojo.dojox.mobile.IconContainerCreateTool", davinci.libraries.dojo.dojox.mobile.MobileCreateTool, {

    create: function(args) {
        debugger;
        for (var i = 0; i < this._data.children.length; i++){
            var icon = this._data.children[i].properties.icon;
            var parentFolder = new davinci.model.Path(this._context._srcDocument.fileName).relativeTo(icon, false); //.getParentPath().toString();
            var file = davinci.resource.findResource(icon, null, parentFolder); // relative so we have to get the absolute for the update of the store
            if (!file){
                alert('File: ' + this._url + ' does not exsist.');
                return;
            }
            url = file.getURL();
        }
       var parentFolder = new davinci.model.Path(this.context._srcDocument.fileName).relativeTo(icon, false); //.getParentPath().toString();
       //var x =  this.context._srcDocument
        
        // insert at beginning of HTML
        args.index = 0;
        
        // force parent to be the HTML root node
        args.target = davinci.ve.widget.getEnclosingWidget(this._context.rootNode);
        
        this.inherited(arguments);
    }
});