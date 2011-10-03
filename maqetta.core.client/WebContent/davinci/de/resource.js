dojo.provide("davinci.de.resource");


dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

dojo.require("davinci.de.widgets.NewDijit");

dojo.require("davinci.de.DijitTemplatedGenerator");
dojo.mixin(davinci.de.resource, {
	
	createDijiFromNewDialog : function(){
		var projectDialog = new davinci.de.widgets.NewDijit({}),
		langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		
		var oldEditor = davinci.Workbench.getOpenEditor();
		var oldFileName = oldEditor.fileName;
		var oldResource = davinci.resource.findResource(oldFileName);
        var model = oldEditor.model;
       
		davinci.Workbench.showModal(projectDialog, "Dijit Widget...", 'height:160px;width: 250px', function(){
			
			var widgetName = projectDialog.attr('value');
			davinci.de.resource.createDijit(widgetName, model, oldResource);	
		});
		
	},

	createDijit : function(name, model, resource){
	
		var base = davinci.Runtime.getProject();
		var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs['widgetFolder']){
			prefs.widgetFolder = "./WebContent/widgets";
			davinci.workbench.Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
		var widgetFolderSetting = (new davinci.model.Path(base).append(prefs['widgetFolder']));
		
		
		var fullPath = widgetFolderSetting.getSegments();
		var parent = davinci.resource.findResource(fullPath[0]);
		for(var i=1;i<fullPath.length;i++){
			var folder = parent.getChild(fullPath[i]);
			if(folder!=null){
				parent = folder;
			}else{
				parent = parent.createResource(fullPath[i],true);
			}
		}

		
		var widgetFolder = parent;
		
		var generator = new davinci.de.DijitTemplatedGenerator({});
		var content = generator.buildSource(model, name);
		
		for(var extension in content){
			var newResource = widgetFolder.createResource(name + "." + extension);
			newResource.setContent(content[extension]);
		}
		
		
	}

});