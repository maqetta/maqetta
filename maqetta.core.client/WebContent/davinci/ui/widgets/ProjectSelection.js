define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "system/resource",
		"davinci/ui/widgets/ProjectDataStore",
		"dijit/form/ComboBox",
		"davinci/Workbench"
  ],function(declare, _WidgetBase, Resource, ProjectDataStore, ComboBox, Workbench){

	return declare("davinci.ui.widgets.ProjectSelection", _WidgetBase, {

		postCreate: function(){
			this._store = new ProjectDataStore({});

			Resource.listProjects().then(dojo.hitch(this, function(projects){
				this._store.setValues(projects);
				this.value = Workbench.getProject();
				this._allProjects = projects.map(function(project){ return project.name; });
				this.combo.set('value', this.value);
			}));

			this.domNode.removeAttribute("dojoType");
			this.combo = new ComboBox({store: this._store, required: false, style: "width:100%"});
			this.domNode.appendChild(this.combo.domNode);
		
			dojo.connect(this.combo, "onChange", this, "_onChange");
		},
		
		onChange: function(){
			
		},
		
		_onChange: function(){
			var comboValue = dojo.attr(this.combo, "value");
			if(this.value!=comboValue){
				this.value = comboValue;
				this.onChange();
			}
		},
		
		_getValueAttr: function(){
			return this.value;
		},
		
		_getSizeAttr: function(){
			return this._allProjects.length;
		},
		
		_getProjectsAttr: function(){
			return this._allProjects;
		}
	});
});
