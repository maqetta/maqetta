define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "system/resource",
        "davinci/Workbench",
        "../Rename",
        "dojo/text!./templates/projectToolbar.html",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton",
        "dijit/layout/ContentPane",
        "./ProjectSelection"
],function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, systemResource, Workbench, Rename, templateString){
	
	return declare("davinci.ui.widgets.ProjectToolbar",   [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: templateString,

		postCreate: function(){
			this.connect(this._projectSelection, "onChange", this._projectSelectionChanged);
			this._currentProject = this._projectSelection.get("value");
		},
		
		onChange: function(){
		},

		_projectSelectionChanged: function(){
			var newProject = this._projectSelection.get("value");
			if(newProject==this._currentProject) {
				return;
			}
			Workbench.loadProject(newProject);
		},
		
		_delete : function(){
			var allProjects = this._projectSelection.get("projects");
			if(allProjects.length < 2){
				alert("You can't delete the only project in your workspace!");
				return;
			}
			var changeToProject = null;
			var project = this._projectSelection.get("value");
			for(var i=0;!changeToProject && i<allProjects.length;i++){
				if(allProjects[i]!=project) {
					changeToProject = allProjects[i];
				}
			}
			var resource = systemResource.findResource(project);
			resource.deleteResource();
			Workbench.loadProject(changeToProject);
		},
		
		_rename : function(){
			var oldProject = Workbench.getProject();
			var renameDialog = new Rename({value:oldProject, invalid: this._projectSelection.get("projects")});
			
			Workbench.showModal(renameDialog, 'Rename Project To....', 'height:110px;width: 200px',function(){ //FIXME: i18n
				
				var cancel = renameDialog.get("cancel");
				if(!cancel){
					var newName = renameDialog.get("value");
					if(newName==oldProject) {
						return;
					}

					var resource = systemResource.findResource(oldProject);
					resource.rename(newName);
					Workbench.loadProject(newName);
				}
			});
			
			
		}
		
	});
});