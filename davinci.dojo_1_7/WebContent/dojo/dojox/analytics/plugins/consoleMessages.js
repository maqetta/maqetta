define(["dojo/_base/lang","../_base"], function(dojo,da){

		// summary:
		//	plugin to have analyitcs return the base info dojo collects
		this.addData = dojo.hitch(da, "addData", "consoleMessages");

		var lvls = dojo.config["consoleLogFuncs"] || ["error", "warn", "info", "rlog"];
		if(!console){
			console = {};
		}

		for(var i=0; i < lvls.length; i++){
			if(console[lvls[i]]){
				dojo.connect(console, lvls[i], dojo.hitch(this, "addData", lvls[i]));
			}else{
				console[lvls[i]] = dojo.hitch(this, "addData", lvls[i]);
			}
		}
	return dojox.analytics.plugins.consoleMessages;
});
