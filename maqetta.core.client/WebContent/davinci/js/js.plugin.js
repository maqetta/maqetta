define([
	'require'
//	'../Workbench'
], function(require) {

return {
	id: "davinci.js",
	"davinci.editor": {
		id: "JSEditor",
		name: "JavaScript Editor",
		extensions: "js,json",
		isDefault: true,
		//TODO implement		 icon : "",
		editorClass: "davinci/js/ui/JavaScriptEditor",
		palettePerspective: "davinci.html.htmlEditor",
        expandPalettes: ["left"]
	},
	"davinci.actionSets": [
/*		{
			id: "jsSource",
			visible: true,
			menu: [

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


			],
			actions: [
				 {
					id: "davinci.js.comment",
					icon: null,
					run: function (){
						
						alert("toggle comment");
				 
					},
					label: "Toggle Comment",
					menubarPath: "davinci.js.source/commentGroup"	  
				  }
			]
		},
*/
		{
			id: "jsEdit",
			visible: true,
			actions: [
				{
					id: "davinci.js.cut",
					icon: null,
					label: "cut",
					commandID: "davinci.js.cut",
					menubarPath: "davinci.edit/cut"
				},
				{
					id: "davinci.js.add",
					icon: null,
					label: "add",
					commandID: "davinci.js.add",
					menubarPath: "davinci.edit/add"
				},
				{
					id: "davinci.js.delete",
					icon: null,
					label: "delete",
					commandID: "davinci.js.delete",
					menubarPath: "davinci.edit/delete"
				}
			]
		}
	],
	"davinci.actionSetPartAssociations": [
		{
			targetID: "davinci.js.jsEdit",
			parts: ["davinci.ui.outline", "davinci.js.JSEditor"]
		}
	],
	"davinci.editorActions": {
		editorContribution: {
			targetID: "davinci.js.JSEditor",
			actions: [
		              {
		                  id: "savecombo",
		                  className: "maqLabelButton",
		                  showLabel: true,
		                  label: "Save",
		                  toolbarPath: "save",
		                  type:'ComboButton',
		                  run: function() {
		                      require(['../Workbench'], function(workbench) {
		                      		require("../ui/Resource").save();
		                      });
		                  },
		                  isEnabled: function(context) {
		                      return require('../Workbench').getOpenEditor();
		                  },
		                  menu:[
		                     {
		                          iconClass: 'saveIcon',
		                          run: function() {
		                          		require("../ui/Resource").save();
		                          },
		                          isEnabled: function(context) {
		                              return require('../Workbench').getOpenEditor();
		                          },
		                          label: "Save",
		                  		keyBinding: {accel: true, charOrCode: "s", allowGlobal: true}
		                      },
		                      {
		                          iconClass: 'saveAsIcon',
		                          run: function() {
		                              require("../ui/Resource").saveAs('html');
		                          },
		                          isEnabled: function(context) {
		                              return require('../Workbench').getOpenEditor();
		                          },
		                          label: "Save As",
		                  		keyBinding: {accel: true, shift: true, charOrCode: "s", allowGlobal: true}
		                      }
		                  ]
		              }
/* XXX not working
				{
					id: "format",
					iconClass: 'formatIcon',
					run: function() {
						var editor = require('../Workbench').getOpenEditor();
						if (editor) {
							var jsFile = new JSFile();
							var text = Format.format(editor.jsFile);
							editor.component.setContent(text);
						}
					},
					label: "Format",
					toolbarPath: "davinci.toolbar.main/edit"
				}
*/
			]
		}
	},
	"davinci.commands": [
		{
			id: "cut",
			run: function() {
				console.log('cut:', this, arguments);
				console.trace();
			}

		},
		{
			id: "add",
			run: function() {
				console.log('add:', this, arguments);
				console.trace();
			}

		},
		{
			id: "delete",
			run: function() {
				console.log('delete:', this, arguments);
				console.trace();
			}

		}
	],
	//  win32:  M1=CTRL,    M2=SHIFT, M3=ALT, M4=-
	//	   carbon: M1=COMMAND, M2=SHIFT, M3=ALT, M4=CTRL 
	"davinci.keyBindings": [
		{ /*???*/
			platform: "win",
			sequence: "M1+C",
			commandID: "davinci.js.copy",
			contextID: "davinci.js.JSEditor"
		}
	],
	"davinci.preferences": [
/*		{
			name: "JavaScript",
			id: "general",
			category: ""
		},
		{
			name: "Formatting",
			id: "format",
			category: "davinci.js.general",
			pane: "davinci/js/ui/FormatOptions",
			defaultValues: {
				blockNewLine: false,
				blockIndent: 3,
				functionNewLine: false,
				functionIndent: 5,
				functionParamSpaceing: 1,
				labelSpace: 1,
				forParamSpacing: 0,
				breakOnLabel: true,
				ifStmtSpacing: 0,
				varAssignmentSpaceing: 0,
				switchSpacing: 3,
				objectLitFieldSpace: 1
			}
		} 
*/
	],
	"davinci.fileType": [
		{
			extension: "js",
			iconClass: "jsFileIcon",
			type: "text"
		},
		{
			extension: "json",
			iconClass: "jsFileIcon",
			type: "text"
		}
	]
};

});