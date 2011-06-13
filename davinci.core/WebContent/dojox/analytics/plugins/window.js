dojo.require("dojox.analytics._base");
dojo.provide("dojox.analytics.plugins.window");

// window startup data
dojox.analytics.plugins.window = new (function(){
	this.addData = dojo.hitch(dojox.analytics, "addData", "window");
	this.windowConnects = dojo.config["windowConnects"] || ["open", "onerror"];

	for(var i=0; i<this.windowConnects.length;i++){
		dojo.connect(window, this.windowConnects[i], dojo.hitch(this, "addData", this.windowConnects[i]));
	}

	dojo.addOnLoad(dojo.hitch(this, function(){
		var data = {};
		for(var i in window){
			if (dojo.isObject(window[i])){
				switch(i){
					case "location":
					case "console":
						data[i]=window[i];
						break;
					default:
						break;
				}
			}else{
				data[i]=window[i];
			}
		}
		this.addData(data);
	}));
})();
