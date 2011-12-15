dojo.provide("davinci.js.ui.JavaScriptEditor");
 
dojo.require("davinci.ui.ModelEditor");
dojo.require("davinci.js.JSModel");
dojo.require("davinci.js.ui.JavaScriptOutline");



dojo.declare("davinci.js.ui.JavaScriptEditor", davinci.ui.ModelEditor, {
    
    constructor : function (element) {
        this.jsFile=davinci.model.Factory.newJS();
        this.model=this.jsFile;
    },

    getOutline : function () {
        if (!this.outline)
            this.outline=new davinci.js.ui.JavaScriptOutline(this.model);
        return this.outline;
    },

    getDefaultContent : function () {
        return "function functionName ()\n{\n}\n";
    }
});


