define(["dojo/_base/kernel"], function(dojo){
	dojo.getObject("dtl.contrib.objects", true, dojox);

	dojo.mixin(dojox.dtl.contrib.objects, {
		key: function(value, arg){
			return value[arg];
		}
	});

	dojox.dtl.register.filters("dojox.dtl.contrib", {
		"objects": ["key"]
	});
	return dojox.dtl.contrib.objects;
});