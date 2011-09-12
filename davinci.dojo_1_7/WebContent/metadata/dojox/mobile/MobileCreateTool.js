dojo.provide("davinci.libraries.dojo.dojox.mobile.MobileCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dojox.mobile.MobileCreateTool", davinci.ve.tools.CreateTool, {

    // override CreateTool.create() to force the the update of the css files to the correct mobile theme
    create: function(args) {
        this.inherited(arguments);

        var context = this._context,
            device = context.getMobileDevice() || 'none';
        if (device !== 'none' && device !== 'iphone') {
            this._whenIphoneCssLoaded(function() {
                context.setMobileTheme(device);
            });
        }
    },

    /**
     * Invoke the given callback function when the mobile CSS files are ready.
     *
     * If 'iphone.css' has just been added to the page, then 'callback' will
     * only be invoked when the style sheet is fully loaded. If there is no
     * such file (i.e. user is displaying a non-iphone device), 'callback' is
     * invoked immediately.
     *
     * @param callback {Function}
     */
    _whenIphoneCssLoaded: function(callback) {
        var doc = this._context.getDocument(),
            reIphoneCss = /\/iphone.css/;

        function poll() {
            try {
                dojo.some(doc.styleSheets, function(sheet) {
                    if (reIphoneCss.test(sheet.href)) {
                        sheet.cssRules;
                        return true; // break loop
                    }
                });

                // invoke callback
                try {
                    callback();
                } catch(e) {}
            } catch(e) {
                setTimeout(poll, 50);
            }
        }

        poll();
    }

});