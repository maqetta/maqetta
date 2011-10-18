dojo.provide("davinci.html.ui.HTMLEditor");
 
dojo.require("davinci.ui.ModelEditor");
dojo.require("davinci.html.HTMLModel");
dojo.require("davinci.html.ui.HTMLOutline");


dojo.declare("davinci.html.ui.HTMLEditor", davinci.ui.ModelEditor, {

    constructor : function (element) {
        this.htmlFile=davinci.model.Factory.newHTML();
        this.model=this.htmlFile;
//      this.inherited(arguments);
    },

    destroy : function () {
        this.htmlFile.close();
        this.inherited(arguments);


    },

    getOutline : function () {
        if (!this.outline)
            this.outline=new davinci.html.ui.HTMLOutline(this.model);
        return this.outline;
    },

    getDefaultContent : function () {
        return "<html>\n <head></head>\n <body></body>\n</html>";
    }

});


