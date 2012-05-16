define([
    "require"
//  "../Workbench"
], function(require) {

return {
    id: "davinci.ve",
    "davinci.view": [
        {
            id: "Palette",
            title: "Widgets",
            viewClass: "davinci/ve/palette/HtmlWidgets"
        },
        {
            id: "states",
            title: "Scenes",
            viewClass: "davinci/ve/views/StatesView"
        },
        /*
         * { id:"datastores", title:"DataStores", viewClass: "davinci/ve/views/DataStoresView" },
         */
        {
            id: "object",
            title: "Object",
            viewClass: "davinci/ve/views/ObjectView"
        },

        /* a style view that allows switching between other style views via the toolbar */

        {
            id: "style",
            title: "Properties",
            viewClass: "davinci/ve/views/SwitchingStyleView"
        }
    ],

    "davinci.perspective": [
        {
            id: "pageDesign",
            title: "Page Design",
            views: [
                {
                    viewID: "davinci.ve.Palette",
                    position: "left"
                },
                {
                    viewID: "davinci.ve.style",
                    position: "right"
                },
                {
                    viewID: "davinci.ui.comment",
                    position: "right"
                },
                {
                    viewID: "davinci.ui.navigator",
                    position: "left-bottom"
                },
                {
                    viewID: "davinci.review.reviewNavigator",
                    position: "left-bottom"
                },
                {
                    viewID: "davinci.ui.outline",
                    position: "left"
                },
                {
                    viewID: "davinci.ve.states",
                    position: "right-bottom"
                }
            /*
             * { viewID: "davinci.ve.datastores", position: "right" }, { viewID: "davinci.ui.problems", position: "right-bottom" }
             */
            ]
        },
        {
            id: "test",
            title: "test Page Design",
            views: []
        }
    ],

    "davinci.editor": [
        {
            id: "HTMLPageEditor",
            name: "HTML Visual Editor",
            extensions: ["html","htm", "php"],
            isDefault: true,
            // TODO implement icon : "",
            editorClass: "davinci/ve/PageEditor",
            palettesToTop: [
                "davinci.ve.Palette", //Widgets
                "davinci.ui.navigator", //Files
                "davinci.ve.style", //Properties
                "davinci.ve.states" //States(Scenes)
            ]
        },
        {
            id: "ThemeEditor",
            name: "Theme Editor",
            // extensions : ["css", "theme"],
            extensions: "theme",
            defaultContent: "./defaultContent.css",
            isDefault: true,
            // TODO implement icon : "",
            editorClass: "davinci/ve/themeEditor/ThemeEditor",
            palettesToTop: [
                "davinci.ve.style", //Properties
                "davinci.ui.navigator", //Files
                "davinci.ve.states" //States(Scenes)
            ]
        }
    ],
    "davinci.actionSets": [
        {
            id: "cutCopyPaste",
            visible: true,
            actions: [
                {
                    label: "Cut",
                    keySequence: "M1+X",
                    iconClass: "editActionIcon editCutIcon",
                    action: "davinci/ve/actions/CutAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    label: "Copy",
                    keySequence: "M1+C",
                    iconClass: "editActionIcon editCopyIcon",
                    action: "davinci/ve/actions/CopyAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    keySequence: "M1+V",
                    iconClass: "editActionIcon editPasteIcon",
                    label: "Paste",
                    action: "davinci/ve/actions/PasteAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    keySequence: "DEL",
                    iconClass: "editActionIcon editDeleteIcon",
                    label: "Delete",
                    action: "davinci/ve/actions/DeleteAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Select parent",
                    action: "davinci/ve/actions/SelectParentAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Select ancestor...",
                    action: "davinci/ve/actions/SelectAncestorAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Unselect all",
                    action: "davinci/ve/actions/UnselectAllAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;A&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;DIV&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;SPAN&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Insert column after",
                    action: "davinci/ve/actions/AddColumnAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Insert column before",
                    action: "davinci/ve/actions/AddColumnBeforeAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Remove column",
                    action: "davinci/ve/actions/RemoveColumnAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Insert row after",
                    action: "davinci/ve/actions/AddRowAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Insert row before",
                    action: "davinci/ve/actions/AddRowBeforeAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Remove row",
                    action: "davinci/ve/actions/RemoveRowAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Move to front",
                    action: "davinci/ve/actions/MoveToFrontAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Move to back",
                    action: "davinci/ve/actions/MoveToBackAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Move forward",
                    action: "davinci/ve/actions/MoveForwardAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Move backward",
                    action: "davinci/ve/actions/MoveBackwardAction",
                    menubarPath: "davinci.edit/cut"
                }
            ]
        },
        {
            id: "datastoreActions",
            visible: true,
            actions: [
                {
                    id: "davinci.ui.generateform",
                    label: "Generate Form",
                    run: function(){
                    	require("davinci/ve/views/DataStoresView").generateForm();
                    },
                    menubarPath: "newfile"
                },
                {
                    id: "davinci.ui.generateform",
                    label: "Generate Table",
                    run: function(){
                    	require("davinci/ve/views/DataStoresView").generateTable();
                    },
                    menubarPath: "newfile"
                }
            ]
        }
    ],
    "davinci.viewActions": [
        {
            viewContribution: {
                targetID: "davinci.ve.outline",
                actions: [
                    {
                        id: "design",
                        iconClass: 'designModeIcon editActionIcon',
                        radioGroup: "displayMode",
                        method: "switchDisplayMode",
                        // initialValue : true,
                        label: "Widgets",
                        toolbarPath: "displayMode"
                    },
                    {
                        id: "source",
                        iconClass: 'sourceModeIcon editActionIcon',
                        method: "switchDisplayMode",
                        radioGroup: "displayMode",
                        label: "Source",
                        toolbarPath: "displayMode"
                    }
                ]
            }
        },
        {
            viewContribution: {
                targetID: "davinci.ve.states",
                actions: [
					{
						id: "addState",
						iconClass: 'viewActionIcon addStateIcon',
						action: "davinci/ve/actions/AddState",
						label: "Add State",
						// menubarPath: "davinci.edit/cut",
						toolbarPath: "add"
					},
					{
						id: "removeState",
						iconClass: 'viewActionIcon removeStateIcon',
						action: "davinci/ve/actions/RemoveState",
						label: "Remove State",
						// menubarPath: "davinci.edit/cut",
						toolbarPath: "remove"
					}

                ]

            }
        }
    ],
    "davinci.actionSetPartAssociations": [
        {
            targetID: "davinci.ve.cutCopyPaste",
            parts: [
                "davinci.ve.visualEditor", "davinci.ve.VisualEditorOutline"
            ]
        }
    ],
    "davinci.editorActions": {
        editorContribution: {
            targetID: "davinci.ve.HTMLPageEditor",
            actions: [
                {
                    id: "cut",
                    label: "Cut",
                    keySequence: "M1+X",
                    iconClass: "editActionIcon editCutIcon",
                    action: "davinci/ve/actions/CutAction",
                    toolbarPath: "cutcopypaste"
                },
                {
                    id: "copy",
                    label: "Copy",
                    keySequence: "M1+C",
                    iconClass: "editActionIcon editCopyIcon",
                    action: "davinci/ve/actions/CopyAction",
                    toolbarPath: "cutcopypaste"
                },
                {
                    id: "paste",
                    keySequence: "M1+V",
                    iconClass: "editActionIcon editPasteIcon",
                    label: "Paste",
                    action: "davinci/ve/actions/PasteAction",
                    toolbarPath: "cutcopypaste"
                },
                {
                    id: "undo",
                    iconClass: 'undoIcon',
                    action: "davinci/actions/UndoAction",
                    label: "Undo",
                    toolbarPath: "undoredo"
                },
                {
                    id: "redo",
                    iconClass: 'redoIcon',
                    action: "davinci/actions/RedoAction",
                    label: "Redo",
                    toolbarPath: "undoredo"
                },
                {
                    id: "delete",
                    keySequence: "DEL",
                    iconClass: "editActionIcon editDeleteIcon",
                    label: "Delete",
                    action: "davinci/ve/actions/DeleteAction",
                    toolbarPath: "delete"
                },
                {
                    id: "openBrowser",
                    iconClass: 'openBrowserIcon',
                    run: function() {
                        require(['../Workbench'], function(workbench) {
                            var editor = workbench.getOpenEditor();
                            if (editor && editor.resourceFile) {
                                editor.previewInBrowser();
                            } else {
                                console.error("ERROR. Cannot launch browser window. No editor info.");
                            }
                        });
                    },
                    label: "Preview in Browser",
                    toolbarPath: "preview"
                },
                {
                    id: "save",
                    iconClass: 'saveIcon',
                    run: function() {
                        require(['../Workbench'], function(workbench) {
                            workbench.getOpenEditor().save();
                        });
                    },
                    isEnabled: function(context) {
                        return require('../Workbench').getOpenEditor();
                    },
                    label: "Save",
                    toolbarPath: "save"
                },
                {
                    id: "saveas",
                    iconClass: 'saveAsIcon',
                    run: function() {
                    	require("../ui/Resource").saveAs('html');
                    },
                    isEnabled: function(context) {
                        return require('../Workbench').getOpenEditor();
                    },
                    label: "Save As",
                    toolbarPath: "save"
                },
                // commenting out the 'save as widget' feature.
                //{
                //   id: "saveasdijit",
                //    iconClass: 'saveAsWidgetIcon',
                //    run: function(){
                //        davinci.de.resource.createDijiFromNewDialog();
                //    }
                //    isEnabled: function(context) {
                //        var isEnabled = davinci.Workbench.getOpenEditor();
                //        return isEnabled;

                //},
                //    label: "Save As Widget",
                //    toolbarPath: "save"
                //},
                // {
                // id: "saveaswidget",
                // iconClass: 'saveAsIcon', // XXX
                // action: "davinci/actions/SaveAsWidget",
                // isEnabled : function(context){
                // var isEnabled = davinci.Workbench.getOpenEditor();
                // return isEnabled;
                //                    
                // },
                // label: "Save As Widget",
                // toolbarPath: "save"
                // },
                {
                    id: "theme",
                    iconClass: 'selectThemeIcon',
                    action: "davinci/actions/SelectThemeAction",
                    label: "Switch theme",
                    toolbarPath: "theme"
                },
                {
                    id: "layout",
                    iconClass: 'selectLayoutIcon',
                    action: "davinci/actions/SelectLayoutAction",
                    label: "Switch layout",
                    toolbarPath: "layout"
                },
                {
                    id: "stickynote",
                    iconClass: 'stickynoteIcon',
                    action: "davinci/actions/StickyNoteAction",
                    label: "Add note",
                    toolbarPath: "stickynote"
                },
                {
                    id: "chooseDevice",
                    iconClass: 'deviceIcon',
                    action: "davinci/ve/actions/ChooseDeviceAction",
                    label: "Choose device",
                    toolbarPath: "chooseDevice"
                },
                {
                    id: "rotateDevice",
                    iconClass: 'rotateIcon',
                    action: "davinci/ve/actions/RotateDeviceAction",
                    label: "Rotate device",
                    toolbarPath: "rotateDevice"
                },
                {
                    id: "design",
                    iconClass: 'designModeIcon editActionIcon',
                    radioGroup: "displayMode",
                    method: "switchDisplayMode",
                    // initialValue : true,
                    label: "Display Design",
                    toolbarPath: "displayMode"
                },
                {
                    id: "source",
                    iconClass: 'sourceModeIcon editActionIcon',
                    method: "switchDisplayMode",
                    radioGroup: "displayMode",
                    label: "Display Source",
                    toolbarPath: "displayMode"
                },
                {
                    id: "splitVertical",
                    iconClass: 'splitVerticalIcon editActionIcon',
                    method: "switchDisplayMode",
                    radioGroup: "displayMode",
                    label: "Split Vertically",
                    toolbarPath: "displayMode"
                },
                {
                    id: "splitHorizontal",
                    iconClass: 'splitHorizontalIcon editActionIcon',
                    method: "switchDisplayMode",
                    radioGroup: "displayMode",
                    label: "Split Horizontally",
                    toolbarPath: "displayMode"
                }
            ]
        }
    },
    "davinci.preferences": [
        {
            name: "Visual Editor",
            id: "editorPrefs",
            category: "davinci.html.general",
            pane: "davinci/ve/prefs/HTMLEditPreferences",
            defaultValues: {
                "flowLayout": true,
                "snap": true,
				"showPossibleParents": false,
                "cssOverrideWarn": true,
                "absoluteWidgetsZindex": 900
            }
        }
    ],
    "davinci.dnd": [
        {
            parts: [
                "davinci.ui.navigator"
            ],
            dragSource: function(object) {
                if (object.elementType == 'File') {
                    return (/gif|jpeg|jpg|png|svg|json/i).test(object.getExtension());
                }
            },
            dragHandler: "davinci/ve/palette/ImageDragSource"
        }
    ],
    "davinci.fileType": [
        {
            extension: "theme",
            iconClass: "themeFileIcon",
            type: "text"
        }
    ],
    "davinci.defaultEditorActions": {
			editorContribution: {
				actions: [
					{
						id: "save",
						iconClass: 'saveIcon',
						run: function() {
							require('../Workbench').getOpenEditor().save();
						},
						isEnabled: function(context) {
							return true;
						},
						label: "Save",
						toolbarPath: "save"
					},
					{
						id: "saveas",
						iconClass: 'saveAsIcon',
						run: function() {
							require("../ui/Resource").saveAs('*');
						},
						isEnabled: function(context) {
							return require('../Workbench').getOpenEditor();
						},
						label: "Save As",
						toolbarPath: "save"
					}
				]
			}
		}
};

});