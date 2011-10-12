dojo.provide("davinci.libraries.helloworld.helloworld.HelloCreateTool");
dojo.require("davinci.ve.tools.CreateTool");
dojo.declare("davinci.libraries.helloworld.helloworld.HelloCreateTool", davinci.ve.tools.CreateTool, {
	constructor: function(data){
	},
	
    _create: function(args) {
    	this.inherited(arguments);
    	var context = this._context;
    	// setTimeout hack to update selection box one second after loading
    	// because image is loaded asynchronously by browser and
    	// initial selection rectangle will be incorrect.
    	// More robust way to implement this would be to add an onload handler
    	// to <img> element and then update focus when that event occurs
    	setTimeout(function(){
    		var selection = context.getSelection();
    		if(selection.length >0){
    			context.updateFocus(selection[0],0);
    		}

    	},1000);
    }

});
