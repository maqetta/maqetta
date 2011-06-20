(
{
	id: "davinci.js", 
 

"davinci.editor" :
		 {
			 id:"JSEditor",
			 name:"JavaScript Editor",
			 extensions : "js",
			 isDefault : true,
//TODO implement		 icon : "",
				requires : "davinci.js.ui.JavaScriptEditor",
				editorClass : "davinci.js.ui.JavaScriptEditor"
		 },
	"davinci.actionSets" :
			[
			 {
					 id: "jsSource",
					 visible:true,
					 menu : [
/*
					         { 
					        	 label : "Source",
					        	 path : "edit",
					        	 id : "davinci.js.source",
					        	 separator :
					        		  [ "commentGroup",true,
					        		    "editGroup",true,
					        		    "codeGroup",true,
					        		    "additions",false
					        		  ]
					         }
*/
					         
					 ], 
					actions: [
/*
							 {
								    id: "davinci.js.comment",
								    icon: null,
									run: function (){
								 		
								 		alert("toggle comment");
							 	 
							 		},
								    label: "Toggle Comment",
								    menubarPath: "davinci.js.source/commentGroup"	  
							  }
*/
					          ]	 
				 }, 
			 {
				 id: "jsEdit",
				 visible:true,
				actions: [
						 {
							    id: "davinci.js.cut",
							    icon: null,
							    label: "cut",
							    commandID : "davinci.js.cut",
							    menubarPath: "davinci.edit/cut"	  
						  },
						  {
							    id: "davinci.js.add",
							    icon: null,
							    label: "add",
							    commandID : "davinci.js.add",
							    menubarPath: "davinci.edit/add"	  
						  },
						  {
							    id: "davinci.js.delete",
							    icon: null,
							    label: "delete",
							    commandID : "davinci.js.delete",
							    menubarPath: "davinci.edit/delete"	  
						  }
				          ]	 
			 } 
				],
				"davinci.actionSetPartAssociations" :
				[
					 {
							 targetID: "davinci.js.jsEdit",
							 parts : [ "davinci.ui.outline","davinci.js.JSEditor"] 
							 
					 } 
				],
				"davinci.editorActions" :
				{
			 		editorContribution : 
			 		{
			 			targetID: "davinci.js.JSEditor",
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
							},			 			 {
			 				 id: "format",
			 				 iconClass: 'formatIcon',
			 				 run: function (){
			 				 	var editor = davinci.Workbench.getOpenEditor();
			 				 	if(editor /*openEditorId && window['editAreas']&& window['editAreas'][openEditorId + ".text"] && window['editAreas'][openEditorId + ".text"]['edit_area']*/){
			 				 		var jsFile = new davinci.js.JSFile();
			 				 		var text = davinci.js.format(editor.jsFile);
			 				 		editor.component.setContent(text);
			 				 	}
			 			 	  },
			 			 	  label: "Format",
			 			 	  toolbarPath: "davinci.toolbar.main/edit"
			 			 }
				
			 			]
			 		}
				},
				"davinci.commands" :
					[
						 {
								 id: "cut",
								 run : function (){ console.log('cut:', this, arguments); console.trace(); } 
								 
						 },
						 {
								 id: "add",
								 run : function (){ console.log('add:', this, arguments); console.trace(); } 
								 
						 },
						 {
								 id: "delete",
								 run : function (){ console.log('delete:', this, arguments); console.trace(); } 
								 
						 } 
					],
//  win32:  M1=CTRL,    M2=SHIFT, M3=ALT, M4=-
//	   carbon: M1=COMMAND, M2=SHIFT, M3=ALT, M4=CTRL 
	
					"davinci.keyBindings" :
					[
							 {
			/*???*/            platform : "win",
								 sequence: "M1+C",
								commandID : "davinci.js.copy" ,
								contextID : "davinci.js.JSEditor"	 
							 } 
						],
						
						"davinci.preferences" : [
							                 {name:"JavaScript", id:"general", category:""
							                 },
							                 {name:"Formatting", id:"format", category:"davinci.js.general",
							                	 pane:"davinci.js.ui.FormatOptions",
							                	defaultValues: {
							                	    blockNewLine:false,
							         		    	blockIndent:3,
							         		    	functionNewLine:false,
							         		    	functionIndent:5,
							         		    	functionParamSpaceing:1,
							         		    	labelSpace:1,
							         		    	forParamSpacing:0,
							         		    	breakOnLabel:true,
							         		    	ifStmtSpacing:0,
							         		    	varAssignmentSpaceing:0,
							         		    	switchSpacing:3,
							         		    	objectLitFieldSpace:1
							         		    }
							                 }
						                 	 ],
						
				
     "davinci.fileType" : [
                       {  extension : "js",
                     	  iconClass : "jsFileIcon",
                     	  type : "text"
                       },
                       {  extension : "json",
                           iconClass : "jsFileIcon",
                           type : "text"
                       }
                       ]	
}
)