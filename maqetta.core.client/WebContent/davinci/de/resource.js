define(["davinci/de/widgets/NewDijit",
        "davinci/Workbench",
        "davinci/workbench/Preferences",
        "system/resource",
        "davinci/de/DijitTemplatedGenerator",
        "davinci/library",
        "davinci/ui/Dialog",
        "davinci/ve/actions/ReplaceAction",
        "dojo/promise/all"
],function(NewDijit, Workbench, Preferences, Resource, DijitTemplatedGenerator, dLibrary, Dialog, ReplaceAction, all){

	// For developer notes on how custom widgets work in Maqetta, see:
	// https://github.com/maqetta/maqetta/wiki/Custom-widgets	
	
	var dt = {
		/* base packages.json metadata */
		WIDGETS_JSON : {version:"1.0", localPath:true, customWidgetSpec:1,
						"categories":{"custom":{name:"Custom widget", description:"Custom widget", widgetClass:"dijit"}}, widgets:[]},
		
		
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
    			Dialog.showModal("Invalid Selection.  Please select a single container widget to create a new Widget", "Error creating Widget...");
    			return;
    		}
    		
			Workbench.showModal(projectDialog, "Dijit Widget...", {height:60, width: 250}, function(){
		    	if (!projectDialog.cancel) {
		    		var widgetData = projectDialog.attr('value');
		    		dt.createDijit(widgetData, model, oldResource, context, selection).then(function(){
			    		if(widgetData.replaceSelection){
			    			new ReplaceAction().run(context, widgetData.group + "." + widgetData.name);
			    		}

			    		//FIXME: Force a browser refresh. This is the atom bomb approach.
				    	//Reason for doing this is that the custom palette list in widget palette
				    	//and all of the require/packages logic happens during application initialization.
				    	//It might be possible to prevent the reload without too much work, but for now we
				    	//do a browser refresh.
				    	window.location.reload(false);
		    		});
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
		
		createDijit : function(widgetData, model, resource, context, selection){
			var qualifiedWidgetDot = widgetData.name + "." + widgetData.name;
			var qualifiedWidgetSlash = widgetData.name + "/" + widgetData.name;
			
			var base = Workbench.getProject();
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			if(!prefs.widgetFolder){
				prefs.widgetFolder = "WebContent/custom";
				Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
			}
			
			
			var parent = dt._createFolder(prefs.widgetFolder);
			
			var widgetNamespace = dt._createNameSpace(qualifiedWidgetDot, parent);
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
			customWidgetsJson.name = widgetData.name;
			customWidgetsJson.longName = widgetData.name;
			
			var widgetsObj = {
				name:widgetData.name, 
				description: widgetData.name, 
				type:qualifiedWidgetSlash, 
				category:"custom", 
				iconLocal:true, 
				icon:"app/davinci/img/maqetta.png"
			};
			var topElementModel = selection[0]._srcElement;
			for(var i=0, atts=topElementModel.attributes, len=atts.length; i<len; i++){
				var att = atts[i];
				if(!att.noPersist){
					if(!widgetsObj.properties){
						widgetsObj.properties = {};
					}
					widgetsObj.properties[att.name] = att.value;
				}
			}
			customWidgetsJson.widgets.push(widgetsObj);
			var promises = [customWidgets.setContents(JSON.stringify(customWidgetsJson, undefined, '\t'))];
			var content = new DijitTemplatedGenerator({}).buildSource(model, qualifiedWidgetSlash, widgetData.name, false, context, selection);
			
			for(var type in content){
				switch(type){
					case 'amd':
						break;
					case 'html':
						var html = widgetNamespace.createResource(widgetData.name + ".html");
						promises.push(html.setContents(content.html));
						break;
					case 'js':
						var widgetResource = widgetNamespace.createResource(widgetData.name + ".js");
						promises.push(widgetResource.setContents(content.js));
						break;
					case 'metadata':
						var metaResource = widgetNamespace.createResource(widgetData.name + "_oam.json");
						promises.push(metaResource.setContents(content.metadata));
						dLibrary.addCustomWidgets(base, customWidgets, widgetNamespace.getPath(), customWidgetsJson);
						break;
				}
			}

			return all(promises);
		}
	};

	return dt;
});