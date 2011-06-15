dojo.provide("davinci.workbench.ProblemsView");

dojo.require("davinci.Workbench");
dojo.require("davinci.workbench.ViewPart");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.declare("davinci.workbench.ProblemsView", davinci.workbench.ViewPart, {
	
	outlineProvider:null,

	postCreate: function()
	{
		this.inherited(arguments);

		this.subscribe("/davinci/resource/resourceChanged", this.resourceChanged);

		var problemsJson={
			items: this._getProblems()
//			      [	 { text:"some Problem", resource:"test.js",
//		path:"",line:2, type:"JavaScript Problem"} ]
		};
	
		this.dataStore= new dojo.data.ItemFileWriteStore({
			 data:problemsJson, jsId: "problemsDataStore" 
		});
	
		var grid = new dojox.grid.DataGrid({
			id: "problemsViewGrid",
			store: this.dataStore,
			structure: [
               { field: 'text', name: 'Description' ,width: "300px" },
               { field: 'fileName', name: 'File Name'},
               { field: 'path', name: 'Path'},
               { field: 'line', name: 'Line', width: "50px" },
               { field: 'type', name: 'Type', width: "150px" }
	        ]
		});

		dojo.connect(grid, 'onRowDblClick', dojo.hitch(this, function(e){
			var item = e.grid.getItem(e.rowIndex),
				line = this.dataStore.getValue(item, "line"),
				resource = this.dataStore.getValue(item, "resource");
		
			davinci.Workbench.openEditor({fileName:resource, startLine: line});
		}));

		this.setContent(grid);
		grid.startup();
	},

	destroy: function(){
		this.inherited(arguments);
		this.unsubscribe("/davinci/resource/resourceChanged");
		delete this.dataStore;
	},

	_getProblems: function()
	{
		this._currentProblems=[];
		var markers=davinci.resource.root.getMarkers(['problem','warning'],true);
		dojo.forEach(markers,function (marker){
			this._currentProblems.push(this._createProblem(marker));
		}, this);
		return this._currentProblems;
	},

	_createProblem: function(marker)
	{
		return {
			text:marker.text,
			fileName: marker.resource.getName(),
			path: marker.resource.parent.getPath(),
			resource: marker.resource,
			line:marker.line,
			type:marker.type
		};
	},
	
	resourceChanged : function(type,resourceChanges)
	{
		var items, changedResource=resourceChanges;
		this.dataStore.fetch({
 			query: { resource: changedResource },
			onComplete: dojo.hitch(this, function (result) {
 				dojo.forEach(result, function (item){
 					this.dataStore.deleteItem(item);
 				}, this);
 			})
		});

		
	    var markers = changedResource.getMarkers(['error','warning']);
		dojo.forEach(markers, function (marker){
			var problem = this._createProblem(marker);
//			this._currentProblems.push(problem);
			this.dataStore.newItem(problem, null);
		}, this);
	}
});
