(function() {

    return {
//        init: function(args) {
//        },
        
        onFirstAdd: function(type, context) {
            // XXX Should the version be queried from the lib's widgets.json
            //  file?  If so, how does this code get access to that code?
            // XXX The use of getPathRelativeToProject() is wrong. That function
            //   returns an absolute path, but we really want a path relative
            //   to dojo.js.
            var base = context.getLibraryBase('helloworld', '1.0'),
                path = context.getPathRelativeToProject(base); 
            context.addJavaScript(null,
                    'dojo.registerModulePath("helloworld", "' + path + '");', true);
//        },
//        
//        onAdd: function(type, context) {
//        },
//        
//        onLastRemove: function(type, context) {
//        },
//        
//        onRemove: function(type, context) {
        }
    };

})();
