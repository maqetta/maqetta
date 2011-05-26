define(["dojo/_base/lang","../_base"], function(dojo,dxa){
	dojo.getObject("analytics.plugins", true, dojox);

	dojox.analytics.plugins.dojo = new (function(){
		// summary:
		//	plugin to have analyitcs return the base info dojo collects
		this.addData = dojo.hitch(dxa, "addData", "dojo");
		dojo.addOnLoad(dojo.hitch(this, function(){
			var data = {};
			for(var i in dojo){
				if ((i=="version") || ((!dojo.isObject(dojo[i]))&&(i[0]!="_"))){
					data[i]=dojo[i];
				}
			}

			if (dojo.config){data.djConfig=dojo.config}
			this.addData(data);
		}));
	})();
	return dojox.analytics.plugins.dojo;
});
