define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/Workbench",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "dijit/Menu",
        "dijit/MenuItem",
        "davinci/model/Path",
        "davinci/ui/Rename",
        "dijit/form/DropDownButton",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/projectToolbar.html",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton",
        "dijit/layout/ContentPane",
        "davinci/ui/widgets/ProjectSelection",
        "dijit/Tree"

],function(declare, _Templated, _Widget,  Workbench, Library, Resource,  Preferences, Runtime,  Menu, MenuItem, Path, Rename, DropDownButton, uiNLS, commonNLS, templateString){
	
	return declare("davinci.ui.widgets.ProjectToolbar",   [_Widget, _Templated], {

		templateString: templateString,
		widgetsInTemplate: true,
		_projectSelection : null,
		invalid : [],
		
		postCreate : function(){
			this.connect(this._projectSelection, "onChange", this._projectSelectionChanged);
			this._currentProject = this._projectSelection.attr("value");
			
		},
		
		onChange : function(){
			
		},
		
		_projectSelectionChanged : function(){
			
			var newProject = this._projectSelection.attr("value");
			if(newProject==this._currentProject) return;
			Runtime.loadProject(newProject);
			
		},
		
		_delete : function(){
			var allProjects = this._projectSelection.attr("projects");
			if(allProjects.length < 2){
				alert("You can't delete the only project in your workspace!");
				return;
			}
			var changeToProject = null;
			var project = this._projectSelection.attr("value");
			for(var i=0;!changeToProject && i<allProjects.length;i++){
				if(allProjects[i]!=project)
					changeToProject = allProjects[i];
			}
			var resource = system.resource.findResource(project);
			resource.deleteResource();
			davinci.Runtime.loadProject(changeToProject);
		},
		
		_rename : function(){
			var oldProject = Runtime.getProject();
			var renameDialog = new Rename({value:oldProject, invalid: this._projectSelection.attr("projects")});
			
			Workbench.showModal(renameDialog, 'Rename Project To....', 'height:110px;width: 200px',function(){
				
				var cancel = renameDialog.attr("cancel");
				if(!cancel){
					var newName = renameDialog.attr("value");
					if(newName==oldProject) return;
					
					var resource = Resource.findResource(oldProject);
					resource.rename(newName);
					Runtime.loadProject(newName);
				}
			});
			
			
		}
		
	});
});