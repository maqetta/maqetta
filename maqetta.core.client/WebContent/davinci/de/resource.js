define(["davinci/de/widgets/NewDijit",
        "davinci/Workbench",
        "davinci/workbench/Preferences",
        "system/resource",
        "davinci/Runtime",
        "davinci/de/DijitTemplatedGenerator",
        "davinci/library"
        
       
],function(NewDijit, Workbench, Preferences, Resource, Runtime, DijitTemplatedGenerator, dLibrary){
	var dt= {
		/* base packages.json metadata */
		WIDGETS_JSON : {"name":"custom", 
						longName:"Custom Widgets", 
						version:"1.0", localPath:true, 
						"categories":{"custom":{name:"User Widgets", description:"User Widgets", widgetClass:"dijit"}}, widgets:[]},
		
		
		createDijiFromNewDialog : function(){
			var projectDialog = new NewDijit({});
			var oldEditor = Workbench.getOpenEditor();
			var oldFileName = oldEditor.fileName;
			var oldResource = Resource.findResource(oldFileName);
	        var model = oldEditor.model;
	     
			Workbench.showModal(projectDialog, "Dijit Widget...", 'height:160px;width: 250px', function(){
				
				var widgetName = projectDialog.attr('value');
				dt.createDijit(widgetName, model, oldResource);	
				return true;
			});
			
		},
		
		_createNameSpace : function(name, parent){
			var namesplit = name.split(".");
			var base = Workbench.getProject();
			parent = parent || Resource.findResource(base);
			
			if(namesplit.length>1){
				for(var i=0;i<namesplit.length-1;i++){
					var folder = parent.getChild(namesplit[i]);
					if(folder!=null){
						parent = folder;
					}else{
						parent = parent.createResource(namesplit[i],true);
					}
				}
				
			}
			return parent;
		},
		
		_createFolder : function(name, parent){
			var namesplit = name.split("/");
			var base = Workbench.getProject();
			parent = parent || Resource.findResource(base);
			
			if(namesplit.length){
				for(var i=0;i<namesplit.length;i++){
					
					if(namesplit[i]==".") continue;
					
					var folder = parent.getChild(namesplit[i]);
					if(folder!=null){
						parent = folder;
					}else{
						parent = parent.createResource(namesplit[i],true);
					}
				}
				
			}
			return parent;
		},
		
		createDijit : function(name, model, resource){
			
			var qualifiedWidget = "widgets." + name;
			
			
			var base = Workbench.getProject();
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			if(!prefs['widgetFolder']){
				prefs.widgetFolder = "./WebContent/widgets";
				Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
			}
			
			var namesplit = name.split(".");
			var widgetSingleName = name;
			
			var parent = dt._createFolder(prefs['widgetFolder']);
			
			var widgetNamespace = dt._createNameSpace(name, parent);
			if(namesplit.length>1){
				widgetSingleName = namesplit[namesplit.length-1];
			}
			
			var customWidgets = parent.getChild(name + "_widgets.json");
			if(customWidgets==null){
				customWidgets = parent.createResource(name +"_widgets.json");
				
			}
			
			/* packages.json metadata */
			var customWidgetsJson = dojo.clone(dt.WIDGETS_JSON);
			
			
			customWidgetsJson.widgets.push({name:name, 
											description: "Custom user widget " + name, 
											type:qualifiedWidget/*.replace(/\./g,"/")*/, category:"custom", 
											iconLocal:true, icon:"app/davinci/img/maqetta.png" 
										   })
			customWidgets.setContents(dojo.toJson(customWidgetsJson));
	
			
			var widgetFolder = parent;
			
			var generator = new DijitTemplatedGenerator({});
			var content = generator.buildSource(model,name,false);
			
			for(var type in content){
				
				switch(type){
					case 'amd':
						break;
					case 'html':
						var html = widgetNamespace.createResource(widgetSingleName + ".html");
						html.setContents(content.html);
						break;
					case 'js':
						var widgetResource = widgetNamespace.createResource(widgetSingleName + ".js");
						widgetResource.setContents(content.js);
						break;
					case 'metadata':
						var resource = dt._createNameSpace(qualifiedWidget, widgetFolder);
						
						var metaResource = resource.createResource(widgetSingleName + "_oam.json");
						metaResource.setContents(content.metadata);
						dLibrary.addCustomWidgets(base, customWidgetsJson);
						break;
				}
			
			}
			
			
		}
	
	}
	return dt;
});