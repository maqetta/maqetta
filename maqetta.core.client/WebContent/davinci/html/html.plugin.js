define([
	'require'
//	'../Workbench'
], function(require) {

return {
	id: "davinci.html",
	"davinci.editor": [
		{
			id: "HTMLEditor",
			name: "HTML Editor",
			extensions: "html",
			isDefault: false,
			//TODO implement		 icon: "",
			editorClass: "davinci/html/ui/HTMLEditor",
			palettePerspective: "davinci.html.htmlEditor",
            expandPalettes: ["left"]
		},
		{
			id: "CSSEditor",
			name: "CSS Editor",
			extensions: "css",
			isDefault: true,
			//TODO implement		 icon: "",
			editorClass: "davinci/html/ui/CSSEditor",
			palettePerspective: "davinci.html.htmlEditor",
            expandPalettes: ["left"]
		},
		{
			id: "ImageViewer",
			name: "Image Viewer",
			extensions: "jpg,gif,jpeg,png",
			isDefault: true,
			//TODO implement		 icon: "",
			editorClass: "davinci/html/ui/ImageViewer",
			palettePerspective: "davinci.html.htmlEditor",
            expandPalettes: ["left"]
		}
	],
	"davinci.editorActions": {
		editorContribution: {
			targetID: "davinci.html.CSSEditor",
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
			]
		}
	},
	"davinci.preferences": [
		{
			name: "HTML",
			id: "general",
			category: ""
		}
	],
	"davinci.fileType": [
		{
			extension: "html",
			iconClass: "htmlFileIcon",
			type: "text"
		},
		{
			extension: "css",
			iconClass: "cssFileIcon",
			type: "text"
		},
		{
			extension: "jpeg",
			iconClass: "imageFileIcon",
			type: "image"
		},
		{
			extension: "jpg",
			iconClass: "imageFileIcon",
			type: "image"
		},
		{
			extension: "png",
			iconClass: "imageFileIcon",
			type: "image"
		},
		{
			extension: "gif",
			iconClass: "imageFileIcon",
			type: "image"
		}
	],
	
	"davinci.perspective": [
        {
            id: "htmlEditor",
            title: "HTML Editor",
            views: [
                {
                    viewID: "davinci.ve.Palette",
                    position: "left",
                    hidden: true
                },
                {
                    viewID: "davinci.ui.outline",
                    position: "left",
                    hidden: true
                },
                {
                    viewID: "davinci.ve.style",
                    position: "right"
                },
                {
                    viewID: "davinci.ui.comment",
                    position: "right",
                    hidden: true
                },
                {
                    viewID: "davinci.ve.states",
                    position: "right-bottom",
                    hidden: true
                },
                {
                    viewID: "davinci.ui.navigator",
                    position: "left-bottom",
                    selected: true
                },
                {
                    viewID: "davinci.review.reviewNavigator",
                    position: "left"
                }
            ]
        }
    ]
};

});