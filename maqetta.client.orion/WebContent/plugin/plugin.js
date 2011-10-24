  define(["system/resource"
       ],function(resource){
			  var serviceProperties = { 
		         name: "Launch Maqettat",
		         key: ["m", true, true] // Ctrl+Shift+e
		      };

			 var provider = new eclipse.PluginProvider({postInstallUrl:"/plugin/list.html"});
			 provider.registerServiceProvider("orion.navigate.command", {
				run : function(item) {
					
					//window.alert("Running code on: " + item.Location);
					window.open('../../maqetta/?base=' + item.location);
				
				}},{
						image: "../maqetta/plugin/maqetta.png",
						name: "Open in Maqetta",
						id: "maqetta.open.item",
						forceSingleItem: true,
						tooltip: "Open this folder in Maqetta Web Designer"
				}, serviceProperties);
		    provider.connect();
		   	var split = "maqetta.system.resource".split(".");
		   	var p = window;
		   	for(var i=0;i<split.length;i++){
		   		if(p[split[i]]==null){
		   			p[split[i]] = {};
		   		}
		   		p = p[split[i]] ;
		   	}
  			/* poke maqetta resource handler into global scope, */
		   	window.maqetta.system.resource = resource;
  			
       });