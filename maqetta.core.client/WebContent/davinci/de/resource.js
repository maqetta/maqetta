define(["davinci/de/widgets/NewDijit",
        "davinci/Workbench",
        "davinci/workbench/Preferences",
        "system/resource",
        "davinci/Runtime",
        "davinci/de/DijitTemplatedGenerator",
        "davinci/library",
        "davinci/ui/Dialog",
        "davinci/ve/actions/ReplaceAction"
        
       
],function(NewDijit, Workbench, Preferences, Resource, Runtime, DijitTemplatedGenerator, dLibrary, Dialog, ReplaceAction){
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
			
			var openEditor = Workbench.getOpenEditor();
    		var context = openEditor.getContext();
    		var selection = context.getSelection();
    		if(!dt.validWidget(selection)){
    			Dialog.showModal("Invalid Selection.  Please select a single container widget to create a new Widget", "Error creating Widget...")
    			return;
    		}
    		
			Workbench.showModal(projectDialog, "Dijit Widget...", {height:160, width: 250}, function(){
		    	if (!projectDialog.cancel) {
		    		var widgetData = projectDialog.attr('value');
		    		dt.createDijit(widgetData, model, oldResource, context, selection);
		    		if(widgetData.replaceSelection){
		    			var ra = new ReplaceAction();
		    			ra.run(context, widgetData.group + "." + widgetData.name);
		    		}
		    	}
				return true;
			});
			
		},
		
		/* 
		 * returns true if the selection is valid for creating a new widget. only 
		 * support creating widgets from selected container widgets 
		 * 
		 * */
		validWidget : function(selection){
			/*
			 * 
			 * Need to check for dojo containers somehow..?
			 * 
			 */
			if (selection==null || selection.length!=1) return false;
			var widget = selection[0];
			return (widget.acceptsHTMLChildren);
		},
		
		_createNameSpace : function(name, parent){
			var namesplit = name.split(".");
			var base = Workbench.getProject();
			parent = parent || Resource.findResource(base);
			
			if(namesplit.length>1){
				for(var i=0;i<namesplit.length-1;i++){
					var folder = parent.getChildSync(namesplit[i]);
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
					
					var folder = parent.getChildSync(namesplit[i]);
					if(folder!=null){
						parent = folder;
					}else{
						parent = parent.createResource(namesplit[i],true);
					}
				}
				
			}
			return parent;
		},
		
		createDijit : function(widgetData, model, resource, context,selection){
			
			var qualifiedWidget = widgetData.group + "." + widgetData.name;
			
			
			var base = Workbench.getProject();
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			if(!prefs['widgetFolder']){
				prefs.widgetFolder = "./WebContent/custom";
				Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
			}
			
			
			var parent = dt._createFolder(prefs['widgetFolder']);
			
			var widgetNamespace = dt._createNameSpace(qualifiedWidget, parent);
			/*
			if(namesplit.length>1){
				widgetSingleName = namesplit[namesplit.length-1];
			}
			*/
			var customWidgets = widgetNamespace.getChildSync(widgetData.name + "_widgets.json");
			if(customWidgets==null){
				customWidgets = widgetNamespace.createResource(widgetData.name +"_widgets.json");
				
			}
			
			/* packages.json metadata */
			var customWidgetsJson = dojo.clone(dt.WIDGETS_JSON);
			
			
			customWidgetsJson.widgets.push({name:widgetData.name, 
											description: "Custom user widget " + widgetData.name, 
											type:qualifiedWidget/*.replace(/\./g,"/")*/, category:"custom", 
											iconLocal:true, icon:"app/davinci/img/maqetta.png" 
										   })
			customWidgets.setContents(dojo.toJson(customWidgetsJson));
	
			
			var widgetFolder = parent;
			
			var generator = new DijitTemplatedGenerator({});
			var content = generator.buildSource(model,qualifiedWidget,widgetData.name, false, context, selection);
			
			for(var type in content){
				
				switch(type){
					case 'amd':
						break;
					case 'html':
						var html = widgetNamespace.createResource(widgetData.name + ".html");
						html.setContents(content.html);
						break;
					case 'js':
						var widgetResource = widgetNamespace.createResource(widgetData.name + ".js");
						widgetResource.setContents(content.js);
						break;
					case 'metadata':
						var metaResource = widgetNamespace.createResource(widgetData.name + "_oam.json");
						metaResource.setContents(content.metadata);
						dLibrary.addCustomWidgets(base, customWidgetsJson);
						break;
				}
			
			}
			
			
		}
	
	}
	return dt;
});