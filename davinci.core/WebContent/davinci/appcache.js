dojo.provide("davinci.appcache");

dojo.require("dojox.widget.Toaster");

if(typeof applicationCache != "undefined" && window.location.search.indexOf("nocache") == -1){
	dojo.addOnLoad(function(){
		var topic = "davinci-appcache";
		new dojox.widget.Toaster({
			position: "br-left",
			duration: 4000,
			messageTopic: topic
		});
	
		applicationCache.addEventListener("cached", function(x){
			dojo.publish(topic, [{message:"Application cached", type:"message"}])
		}, false);
		
		applicationCache.addEventListener("progress", function(x){
	//		dojo.publish(topic, [{message:"Progress...", type:"warning"}]) //TODO: loaded and total properties unimplemented?
			console.log("AppCache progress...")
			console.dir(x);
		}, false);
		
		applicationCache.addEventListener("checking", function(x){
			dojo.publish(topic, [{message:"Checking for updates to application cache", type:"warning"}])
		}, false);
		
		applicationCache.addEventListener("downloading", function(x){
			dojo.publish(topic, [{message:"Downloading cache...", type:"warning"}])
		}, false);
		
		applicationCache.addEventListener("error", function(x){
			dojo.publish(topic, [{message:"Error loading cache", type:"error"}])
			console.dir(x);
		}, false);
		
		applicationCache.addEventListener("obsolete", function(x){
			dojo.publish(topic, [{message:"Manifest missing", type:"error"}])
		}, false);
		
		applicationCache.addEventListener("noupdate", function(x){
			dojo.publish(topic, [{message:"No updates to application cache", type:"message"}])
		}, false);
		
		applicationCache.addEventListener("updateready", function(x){
			applicationCache.swapCache();
			dojo.publish(topic, [{message:"Application cache update ready", type:"message"}])
		}, false);

		var rev = function(str){ var r = (str||"").match(/Revision: (\d+)\|/); return r && r[1]; };
		if (rev(davinci.repositoryInfoLive) != rev(davinci.repositoryInfo)) {
			try{
				applicationCache.update();
				dojo.publish(topic, [{message:"Update available", type:"warning"}])
			} catch(e) {
				console.error(e);
			}
		}
	});
}
