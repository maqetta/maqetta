define([
	'require'
//	'../../Workbench'
], function(require) {

return {
	id: "davinci.themeEdit", 
	"davinci.perspective": {
		id:"themeEdit",
		title:"Theme Editor",
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
                selected: true
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
	},
	"davinci.editor": {
		id:"ThemeEditor",
		name:"Theme Editor",
		//extensions : ["css", "theme"],
		extensions : "theme",
		defaultContent : "./defaultContent.css",
		isDefault : true,
		//TODO implement		 icon : "",
		editorClass: "davinci/ve/themeEditor/ThemeEditor",
		palettePerspective: "davinci.themeEdit.themeEdit",
        expandPalettes: ["right"]
	},
	"davinci.editorActions": {
		editorContribution: {
			targetID: "davinci.ve.ThemeEditor",
			actions: [
				{
                	id: "undo",
                    //iconClass: 'undoIcon',
                    action: "davinci/actions/UndoAction",
                    label: "Undo",
                    className: "maqLabelButton",
                    showLabel: true,
                    toolbarPath: "undoredo",
                    keyBinding: {accel: true, charOrCode: "z"}
                },
                {
                    id: "redo",
                    //iconClass: 'redoIcon',
                    action: "davinci/actions/RedoAction",
                    className: "maqLabelButton",
                    showLabel: true,
                    label: "Redo",
                    toolbarPath: "undoredo",
                    keyBinding: {accel: true, shift: true, charOrCode: "z"}
                },
                {
                    id: "save",
                    className: "maqLabelButton",
                    showLabel: true,
                    label: "Save",
                    toolbarPath: "save",
					run: function() {
						require('../../Workbench').getOpenEditor().save();
					},
					isEnabled: function(context) {
						return require('../../Workbench').getOpenEditor();
					}
				}
	/*,
					{
						id: "saveas",
						iconClass: 'saveAsIcon',
						run: function() {
							require("../../ui/Resource").saveAs();
						},
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
};

});