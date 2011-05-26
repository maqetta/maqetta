define(["dojo/_base/kernel", "./_patches", "./Bind", "./StatefulModel", "./_DataBindingMixin"], function(dojo, patches, bind, model, dbmixin){
	// module:
	//		dojox/mvc/_base
	// summary:
	//		Pulls in essential MVC dependencies such as basic support for
	//		data binds, a data model and data binding mixin for dijits.
	dojo.getObject("mvc", true, dojox);
	dojo.experimental("dojox.mvc");

	return dojox.mvc;
});
