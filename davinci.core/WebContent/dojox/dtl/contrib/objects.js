dojo.provide("dojox.dtl.contrib.objects");

dojo.mixin(dojox.dtl.contrib.objects, {
	key: function(value, arg){
		return value[arg];
	}
});

dojox.dtl.register.filters("dojox.dtl.contrib", {
	"objects": ["key"]
});