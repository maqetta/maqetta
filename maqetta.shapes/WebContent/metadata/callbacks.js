(function() {

    return {
//        init: function(args) {
//        },
        
        onFirstAdd: function(type, context) {
            // XXX Might be able to replace this with some use of package.json's
            //   'main' element (points to a library's main JS file).  That way,
            //   when loading a library (A) that depends on another library (B),
            //   Maqetta would first load B's main JS file before loading A's
            //   first widget.
            var shapesBase = context.getLibraryBase('shapes', '1.0'),
                shapesPath = new davinci.model.Path(shapesBase),
                dojoBase = context.getLibraryBase('dojo', '1.7'),
                dojoPath = new davinci.model.Path(dojoBase).append('dojo/dojo.js'),
                path = shapesPath.relativeTo(dojoPath, true). toString();
            context.addJavaScriptText('require({ paths: { "shapes": "' + path + '" } });', true);
            return;
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
