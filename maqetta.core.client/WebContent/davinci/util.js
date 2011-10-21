/**
 * Utility methods.
 */
define(function() {

    function _mixin(dest, srcs) {
        dest = dest || {};
        for (var i = 1, l = arguments.length; i < l; i++) {
            var src = arguments[i],
                name,
                val;
            for (name in src) {
                if (src.hasOwnProperty(name)) {
                    val = src[name];
                    if (!(name in dest) || (typeof val !== 'object' && dest[name] !== val)) {
                        dest[name] = val;
                    } else {
                        _mixin(dest[name], val);
                    }
                }
            }
        }
        return dest;
    }

    return {
        /**
         * Copies/adds all properties of one or more sources to dest; returns dest.
         * Similar to dojo.mixin(), except this function does a deep merge.
         * 
         * @param  {Object} dest
         *          The object to which to copy/add all properties contained in source. If dest is
         *          falsy, then a new object is manufactured before copying/adding properties
         *          begins.
         * @param  {Object} srcs
         *          One of more objects from which to draw all properties to copy into dest. Srcs
         *          are processed left-to-right and if more than one of these objects contain the
         *          same property name, the right-most value "wins".
         * @return {Object}
         *          dest, as modified
         */
        mixin: _mixin,

        /**
         * Remove item from array.
         *
         * @param  {array} array
         * @param  {*} item Item to remove from array
         */
        arrayRemove: function(array, item) {
            var idx = array.indexOf(item);
            if (idx > -1) {
                array.splice(idx, 1);
            }
        },

        /**
         * Push item into array if it is not already a member.
         * 
         * @param  {Array} array
         * @param  {*} item  Item to add to array
         */
        arrayAddOnce: function(array, item) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        }
    };

});