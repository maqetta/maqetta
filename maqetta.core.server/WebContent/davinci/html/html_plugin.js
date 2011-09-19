(
{
	id: "davinci.html", 
 

	"davinci.editor":
		[
			{
				id:"HTMLEditor",
				name:"HTML Editor",
				extensions: "html",
				isDefault: false,
	//TODO implement		 icon: "",
				requires: "davinci.html.ui.HTMLEditor",
				editorClass: "davinci.html.ui.HTMLEditor"
			}
			,{
				id:"CSSEditor",
				name:"CSS Editor",
				extensions: "css",
				isDefault: true,
	//TODO implement		 icon: "",
				requires: "davinci.html.ui.CSSEditor",
				editorClass: "davinci.html.ui.CSSEditor"
			}
			,{
				id:"ImageViewer",
				name:"Image Viewer",
				extensions: "jpg,gif,jpeg,png",
				isDefault: true,
	//TODO implement		 icon: "",
				requires: "davinci.html.ui.ImageViewer",
				editorClass: "davinci.html.ui.ImageViewer"
			}			
		],
		"davinci.editorActions" :
		{
	 		editorContribution : 
	 		{
	 			targetID: "davinci.html.CSSEditor",
	 			actions:
	 			[
		 			{
						id: "save",
						iconClass: 'saveIcon',
						run: function (){
							davinci.Workbench.getOpenEditor().save();
				 		},
				 		isEnabled : function(context){
				 			return true;
				 			
				 		},
						label: "Save",
						toolbarPath: "save"
					},
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
					}
	 			]
	 		}
		},
	"davinci.preferences": [
		{
			name:"HTML",
			id:"general",
			category:"",
			pageContent:"HTML preferences content here"
		}
	],
    "davinci.fileType" : [
                      {  extension : "html",
                    	  iconClass : "htmlFileIcon",
                    	  type : "text"
                      },
                      {  extension : "css",
                    	  iconClass : "cssFileIcon",
                    	  type : "text"
                      },
                      {  extension : "jpeg",
                    	  iconClass : "imageFileIcon",
                    	  type : "image"
                      },
                      {  extension : "jpg",
                    	  iconClass : "imageFileIcon",
                    	  type : "image"
                      },
                      {  extension : "png",
                    	  iconClass : "imageFileIcon",
                    	  type : "image"
                      },
                      {  extension : "gif",
                    	  iconClass : "imageFileIcon",
                    	  type : "image"
                      }
                      ]		
}
)