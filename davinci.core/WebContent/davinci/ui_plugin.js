( 
{
	id: "davinci.ui", 
	css: "./ui.css",
	"davinci.view":
	[
		{
			id:"navigator",
			title:"Files",
			viewClass: "davinci.workbench.Explorer"
//			startup : function(){		 
//				dojo.require("dijit.Tree");
//				dojo.require("dojo.data.ItemFileReadStore");
//			}
		},
		{
			id:"hierarchy",
			title:"Hierarchy"
		},
		{
			id:"outline",
			title:"Outline",
			viewClass: "davinci.workbench.OutlineView"
		},
		
		{
			id:"scope",
			title:"Scope"
		},
		{
			id:"properties",
			title:"Properties",
			viewClass: "davinci.workbench.PropertyEditor"
		},
		{
			id:"problems",
			title:"Problems",
			viewClass: "davinci.workbench.ProblemsView"
		},
		{
			id:"console",
			title:"Console"
		},
		{
			id:"history",
			title:"History"
		},
		{
			id:"search",
			title:"Search"
		}
		
	],
	
	"davinci.perspective":
		 {
			 id:"main",
			 title:"AJAX IDE",
			 views: [
			   {
				   viewID: "davinci.ui.navigator",
				   position: "left"
				},
				
//				{
//					   viewID: "davinci.ui.problems",
//					   position: "bottom"
//				},
				{
					   viewID: "davinci.ui.outline",
					   position: "right"
				},
				{
					   viewID: "davinci.ui.properties",
					   position: "right-bottom"
				}
			 ]
		 },
	"davinci.actionSets":
	[
	 {
		 id: "main",
		 visible:true,
		 menu: [
				 { 
					 __mainMenu : true,
					 separator :
						  [ "new",false,
							"open",false,
							"settings",false,
							"additions",false,
							"help",false
						  ]
				 },
				 { 
					 label : "New",
					 path : "new",
					 id : "davinci.new",
					 separator :
						  [ "new",true,
							"new2",true,
							"additions",true
						  ]
				 },
				 { 
					 label : "Open",
					 path : "open",
					 id : "davinci.open",
					 separator :
						  [ "open",true,
							"open2",true,
							"additions",false
						  ]
				 },
				 { 
					 label : "Settings",
					 path : "settings",
					 id : "davinci.settings",
					 separator :
						  [ "settings",true,
							"additions",false
						  ]
				 },
				 { 
					 label : "Help",
					 path : "help",
					 id : "davinci.help",
					 separator :
						  [ 
						    "help",true,
						    "about",false,
							"additions",false
						  ]
				 }
/*
				 ,
				 { 
//					 label : "Window",
					 label : "",
					 path : "window",
					 id : "davinci.window",
					 separator :
						  [ "open.perspective",true,
							"show.view",true,
							"group",true,
							"open.preferences",true
						  ]
				 }, 
				 { 
					 label : "Open Perspective",
					 path : "davinci.window/open.perspective",
					 id : "open.perspective",
					 populate : function () {return davinci.Workbench._populatePerspectivesMenu();},
					 separator :
						  [ "additions",true]
				 },
				 { 
					 label : "Show View",
					 path : "davinci.window/show.view",
					 id : "show.view",
					 populate : function () {return davinci.Workbench._populateShowViewsMenu();},
					 separator :
						  [ "additions",true]
				 }
	*/			 
		 ], 
		actions: [
					{
						id: "newHTML",
//						icon: './davinci/img/add.gif',
						run: "davinci.ui.Resource.fileDialog('newhtml')",
						label: "HTML File...",
//						toolbarPath: "davinci.toolbar.main/edit",
						menubarPath: "davinci.new/new"	  
					},
					
					{
						id: "newCSS",
						run: "davinci.ui.Resource.fileDialog('newcss')",
						label: "CSS File...",
						menubarPath: "davinci.new/new"	  
					},
					
					{
						id: "newJS",
						run: "davinci.ui.Resource.fileDialog('newjs')",
						label: "JavaScript File...",
						menubarPath: "davinci.new/new"	  
					},
					
					{
						id: "newFile",
						run: "davinci.ui.Resource.fileDialog('newfile')",
						label: "File...",
						menubarPath: "davinci.new/new"	  
					},
					
					{
						id: "newFolder",
						run: "davinci.ui.Resource.fileDialog('newfolder')",
						label: "Folder...",
						menubarPath: "davinci.new/new2"	  
					},
					
					{
						id: "openFile",
						run: "davinci.ui.Resource.fileDialog('openfile')",  
						label: "File...",
						toolbarPath: "davinci.toolbar.main/edit",
						menubarPath: "davinci.open/open"	  
					},
					
					{
						id: "openThemeEditor",
						run: "davinci.Workbench.showModal(davinci.ui.OpenTheme(), 'Open Theme', 'height:100px;width: 200px')", 
						label: "Theme Editor",
						menubarPath: "davinci.open/open2"	  
					},
					
					{
						id: "editPreferences",
						run: "davinci.workbench.Preferences.showPreferencePage()",  
						label: "Preferences...",
						menubarPath: "davinci.settings/settings"	  
					},
					{
						id: "newTheme",
						run: "davinci.Workbench.showModal(davinci.ui.NewThemeDialog(), 'New Theme', 'height:135px;width: 300px')",
						label: "Theme...",
						menubarPath: "davinci.new/new"	  
					},
					{
						id: "showHelp",
						run: "window.open('app/docs/index.html')",  
						label: "Documentation",
						menubarPath: "davinci.help/help"	  
					},					
					{
						id: "showTutotials",
						run: "window.open('app/docs/index.html#tutorials/tutorials')",  
						label: "Tutorials",
						menubarPath: "davinci.help/help"	  
					},					
				
					{
						id: "about",
						run: "davinci.ui.about()",  
						label: "About Maqetta",
						menubarPath: "davinci.help/about"	  
					}					
		]
	 },
	 {
		 id: "explorerActions",
		 visible:true,
		actions: [
					 {
						    id: "davinci.ui.newfile",
						    label: "New file...",
							run: "davinci.ui.Resource.fileDialog('newfile')",
								menubarPath: "newfile"
									
					 },
					 {
						    id: "davinci.ui.newfile",
						    label: "New folder...",
							run: "davinci.ui.Resource.fileDialog('newfolder')",
								menubarPath: "newfolder"
									
					 },
					 {
						    id: "davinci.ui.addFiles",
						    label: "Upload file",
							run: "davinci.ui.Resource.addFiles()",
								menubarPath: "addFiles"
									
					 },
				 {
					    id: "davinci.ui.delete",
					    label: "Delete resource",
						run: "davinci.ui.Resource.deleteAction()",
							menubarPath: "delete"		
								
				 },
				 {
					    id: "davinci.ui.addLink",
					    action: "davinci.actions.AddLinkAction",
					    label: "Add link",
							menubarPath: "delete"		
								
				 },
				 {
					    id: "davinci.ui.download",
					    action: "davinci.actions.DownloadAction",
					    label: "Download",
							menubarPath: "delete"		
								
				 }
		          ]	 
	 } 
	],
	"davinci.actionSetPartAssociations" :
		[
			 {
					 targetID: "davinci.ui.explorerActions",
					 parts : [ "davinci.ui.navigator"] 
					 
			 } 
		],
	"davinci.viewActions":[{
		  viewContribution: {
		  targetID : "davinci.ui.problems",
		  actions: [
						{
							id: "Copy2",
							iconClass: 'copyIcon',
							run: function (){alert("view toolbar")},
							label: "Copy",
							toolbarPath: "davinci.toolbar.main/edit",
							menubarPath: "davinci.edit/cut"
						}
			]
			 
		  }
	 },
	 
	 /* deployment icon in the file explorer toolbar */
	 {
		  viewContribution: {
		  targetID : "workbench.Explorer",
		  actions: [
						
							 {
				 				 id: "download",
				 				 iconClass: 'downloadAllIcon',
				 				 run : function(){
								 	davinci.Workbench.showModal(davinci.ui.DeployAllDialog(), "Download", "width: 400px");
							 	 },
				 				 radioGroup : "displayMode",
				 			 	 label: "Download Entire Workspace",
				 			 	 toolbarPath: "download"
				 			 },
				 			 {
				 				 id: "download",
				 				 iconClass: 'downloadSomeIcon',
				 				 run : function(){
								 	davinci.Workbench.showModal(davinci.ui.DeploySomeDialog(), "Download", "width: 400px");
							 	 },
				 				 radioGroup : "displayMode",
				 			 	 label: "Download Selected Files",
				 			 	 toolbarPath: "download"
				 			 },
				 			 {
				 				 id: "userlibs",
				 				 iconClass: 'userLibIcon',
				 				 run : function(){
								 	davinci.Workbench.showModal(davinci.ui.UserLibs(), "User Libraries", "width: 400px");
							 	 },
				 				 radioGroup : "displayMode",
				 			 	 label: "Modify Libraries",
				 			 	 toolbarPath: "download"
				 			 }
						
			]
			 
		  }
	 }
	 
	 
	 
	 
	 ]	         
}
)