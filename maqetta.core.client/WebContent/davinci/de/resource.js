dojo.provide("davinci.de.resource");

dojo.require("davinci.de.widgets.NewDijit");
dojo.require("davinci.de.DijitTemplatedGenerator");
dojo.mixin(davinci.de.resource, {
	
	WIDGETS_JSON : {"name":"custom", longName:"Custom Widgets", version:"1.0", localPath:true, "categories":{"custom":{name:"User Widgets", description:"User Widgets", widgetClass:"dijit"}}, widgets:[]},
	
	
	createDijiFromNewDialog : function(){
		var projectDialog = new davinci.de.widgets.NewDijit({});
		var oldEditor = davinci.Workbench.getOpenEditor();
		var oldFileName = oldEditor.fileName;
		var oldResource = davinci.resource.findResource(oldFileName);
        var model = oldEditor.model;
       
		davinci.Workbench.showModal(projectDialog, "Dijit Widget...", 'height:160px;width: 250px', function(){
			
			var widgetName = projectDialog.attr('value');
			davinci.de.resource.createDijit(widgetName, model, oldResource);	
		});
		
	},
	
	_createNameSpace : function(name, parent){
		var namesplit = name.split(".");
		var base = davinci.Runtime.getProject();
		parent = parent || davinci.resource.findResource(base);
		
		if(namesplit.length>1){
			widgetSingleName = namesplit[namesplit.length-1];
			
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
	
	createDijit : function(name, model, resource){
		
		name = "widgets." + name;
		
		var base = davinci.Runtime.getProject();
		var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs['widgetFolder']){
			prefs.widgetFolder = "./WebContent/widgets";
			davinci.workbench.Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
		
		var namesplit = name.split(".");
		var widgetSingleName = name;
		var parent = davinci.resource.findResource(base);
		
		var widgetNamespace = this._createNameSpace(name, parent);
		if(namesplit.length>1){
			widgetSingleName = namesplit[namesplit.length-1];
		}
		
		
		
		var widgetFolderSetting = (new davinci.model.Path(base).append(prefs['widgetFolder']));
		var fullPath = widgetFolderSetting.getSegments();
		parent = davinci.resource.findResource(fullPath[0]);
		for(var i=1;i<fullPath.length;i++){
			var folder = parent.getChild(fullPath[i]);
			if(folder!=null){
				parent = folder;
			}else{
				parent = parent.createResource(fullPath[i],true);
			}
		}
		
		var cleanName = name.substring("widgets.".length);
		
		var customWidgets = parent.getChild(cleanName + "_widgets.json");
		if(customWidgets==null){
			customWidgets = parent.createResource(cleanName +"_widgets.json");
			
		}
		
		var customWidgetsJson = dojo.clone(davinci.de.resource.WIDGETS_JSON);
		
		
		customWidgetsJson.widgets.push({name:cleanName, description: "Custom user widget " + cleanName, type:name, category:"custom", iconLocal:true, icon:"app/davinci/img/maqetta.png" })
		customWidgets.setContents(dojo.toJson(customWidgetsJson));

		
		var widgetFolder = parent;
		
		var generator = new davinci.de.DijitTemplatedGenerator({});
		var content = generator.buildSource(model, name);
		
		for(var type in content){
			
			switch(type){
			
				case 'html':
					var html = widgetNamespace.createResource(widgetSingleName + ".html");
					html.setContents(content.html);
					break;
				case 'js':
					var widgetResource = widgetNamespace.createResource(widgetSingleName + ".js");
					widgetResource.setContents(content.js);
					break;
				case 'metadata':
					var resource = this._createNameSpace(name, widgetFolder);
					
					var metaResource = resource.createResource(widgetSingleName + "_oam.json");
					metaResource.setContents(content.metadata);
					davinci.library.addCustomWidgets(base, customWidgetsJson);
					break;
			}
		
		}
		
		
	}

});