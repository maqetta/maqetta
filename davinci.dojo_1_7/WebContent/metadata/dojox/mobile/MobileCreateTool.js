dojo.provide("davinci.libraries.dojo.dojox.mobile.MobileCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dojox.mobile.MobileCreateTool", davinci.ve.tools.CreateTool, {
    // override CreateTool.create() to force the the update of the css files to the correct mobile theme
    create: function(args) {
        
        this.inherited(arguments);
        var mobileDevice = this._context.getMobileDevice();
		if (!mobileDevice) 
			mobileDevice = 'none'; // force to default
		this._context.setMobileTheme(mobileDevice);
    }
});