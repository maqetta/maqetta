dojo.provide("davinci.libraries.dojo.dojox.grid.DataPropertyHelper");

dojo.declare("davinci.libraries.dojo.dojox.grid.DataPropertyHelper", null, {

	getPropertyValue: function(/*Widget*/ widget, /*String*/ name){
		// FIXME: doesn't this function duplicate the default getPropertyValue?
		if(!widget){
			return undefined;
		}
		return widget[name];
	}

});