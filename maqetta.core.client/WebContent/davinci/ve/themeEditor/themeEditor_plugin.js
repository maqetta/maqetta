({
	id: "davinci.themeEdit", 

	"davinci.perspective":
			 {
				 id:"themeEdit",
				 title:"Theme Editor",
				 views: [
					{
						   viewID: "davinci.ui.navigator",
						   position: "left"
					},
					{
						   viewID: "davinci.ui.outline",
						   position: "right"
					},
					{
						   viewID: "davinci.ui.problems",
						   position: "bottom"
					},
					{
						   viewID: "davinci.ve.Palette",
						   position: "left-bottom"
					},		
					{
						   viewID: "davinci.ve.properties",
						   position: "right-bottom"
					},
					{
						   viewID: "davinci.ve.style",
						   position: "right-bottom"
					}/*
					,
					{
						   viewID: "davinci.ve.TopProps",
						   position: "right-bottom"
					}*/
				 ]
			 },
			 

	"davinci.editor" :
		 {
			 id:"ThemeEditor",
			 name:"Theme Editor",
			 //extensions : ["css", "theme"],
			 extensions : "theme",
			 defaultContent : "./defaultContent.css",
			 isDefault : true,
			 //TODO implement		 icon : "",
				requires : "davinci.ve.themeEditor.ThemeEditor",
				editorClass : "davinci.ve.themeEditor.ThemeEditor"
		 },
		 
		 "davinci.editorActions" :
			{
		 		editorContribution : 
		 		{
		 			targetID: "davinci.ve.ThemeEditor",
		 			actions:
		 			[
					 	{
							id: "undo",
							iconClass: 'undoIcon',
							action : "davinci.actions.UndoAction",
							label: "Undo",
							toolbarPath: "undoredo"
						},
						{
							id: "redo",
							iconClass: 'redoIcon',
							action : "davinci.actions.RedoAction",
							label: "Redo",
							toolbarPath: "undoredo"
						},
		 			{
						id: "save",
						iconClass: 'saveIcon',
						run: function (){
							davinci.Workbench.getOpenEditor().save();
				 		},
				 		isEnabled : function(context){
				 			var isEnabled =  davinci.Workbench.getOpenEditor();
				 			return isEnabled;
				 			
				 		},
						label: "Save",
						toolbarPath: "save"
					}/*,
					{
						id: "saveas",
						iconClass: 'saveAsIcon',
						run: "davinci.ui.Resource.fileDialog('saveas')",
				 		isEnabled : function(context){
				 			var isEnabled =  davinci.Workbench.getOpenEditor();
				 			return isEnabled;
				 			
				 		},
						label: "Save As",
						toolbarPath: "save"
					}*/


			
		 			]
		 		}
			}
})