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
            viewClass: "davinci/ve/palette/HtmlWidgets",
            iconClass: "paletteIcon paletteIconWidgets"
        },
        {
            id: "states",
            title: "Scenes",
            viewClass: "davinci/ve/views/StatesView",
            iconClass: "paletteIcon paletteIconStates"
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
                    viewID: "davinci.ui.outline",
                    position: "left"
                },
                {
                    viewID: "davinci.ui.comment",
                    position: "left"
                },
                {
                    viewID: "davinci.ve.states",
                    position: "left-bottom"
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
                    viewID: "davinci.ve.style",
                    position: "dynamic"
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
                "davinci.ve.states", //Files
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
                    iconClass: "editActionIcon editDuplicateIcon",
                    label: "Duplicate",
                    action: "davinci/ve/actions/DuplicateAction",
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
                    surroundWithTagName:'a',
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;DIV&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    surroundWithTagName:'div',
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;SPAN&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    surroundWithTagName:'span',
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
                },
                {
                    iconClass: "editActionIcon",
                    label: "Application States...",
                    action: "davinci/ve/actions/EnableApplicationStates",
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
						toolbarPath: "states1"
					},
					{
						id: "removeState",
						iconClass: 'viewActionIcon removeStateIcon',
						action: "davinci/ve/actions/RemoveState",
						label: "Remove State",
						toolbarPath: "states1"
					},
					{
						id: "modifyState",
						iconClass: 'viewActionIcon modifyStateIcon',
						action: "davinci/ve/actions/ModifyState",
						label: "Modify State",
						toolbarPath: "states1"
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
                    id: "edit",
                    className: "maqLabelButton",
                    showLabel: true,
                    label: "Edit",
                    toolbarPath: "undoredo",
                    type:'DropDownButton',
                    menu:[
                        {
                            label: "Cut",
                            iconClass: "editActionIcon editCutIcon",
                            action: "davinci/ve/actions/CutAction",
                    		keyBinding: {accel: true, charOrCode: "x"}
                        },
                        {
                            label: "Copy",
                            iconClass: "editActionIcon editCopyIcon",
                            action: "davinci/ve/actions/CopyAction",
                   			keyBinding: {accel: true, charOrCode: "c"}
                        },
                        {
                            iconClass: "editActionIcon editPasteIcon",
                            label: "Paste",
                            action: "davinci/ve/actions/PasteAction",
                    		keyBinding: {accel: true, charOrCode: "v"}
                        },
                        {
                            iconClass: "editActionIcon editDeleteIcon",
                            label: "Delete",
                            action: "davinci/ve/actions/DeleteAction",
                    		keyBinding: {charOrCode: [dojo.keys.DELETE, dojo.keys.BACKSPACE]}
                        }
                    ]
                },
                {
                    id: "savecombo",
                    className: "maqLabelButton",
                    showLabel: true,
                    label: "Save",
                    toolbarPath: "undoredo",
                    type:'ComboButton',
                    run: function() {
                        require(['../Workbench'], function(workbench) {
                            workbench.getOpenEditor().save();
                        });
                    },
                    isEnabled: function(context) {
                        return require('../Workbench').getOpenEditor();
                    },
                    menu:[
                       {
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
                        },
                        {
                            id: "saveasdijit",
                            iconClass: 'saveAsDijitIcon',
                            run: function(){
                                return require(['davinci/de/resource'], function(r){
                                  	r.createDijiFromNewDialog();
                                })
                            },
                            isEnabled: function(context) {
                                return require('../Workbench').getOpenEditor();
                             },
                             label: "Save As Widget"
                         },
                    ]
                },
                {
                    id: "openBrowser",
                    iconClass: 'openBrowserIcon',
                    className: 'davinciFloatRight openBrowser',
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
                    toolbarPath: "undoredo",
                    keyBinding: {accel: true, charOrCode: "0", allowGlobal: true}
                },
                {
                    id: "documentSettings",
                    iconClass: 'documentSettingsIcon',
                    className: 'documentSettings davinciFloatRight',
                    label: "Document settings",
                    toolbarPath: "undoredo",
                    type:'DropDownButton',
                    menu:[
                       {
                           id: "theme",
                           iconClass: 'selectThemeIcon',
                           className: "davinciFloatRight",
                           action: "davinci/actions/SelectThemeAction",
                           label: "Switch theme"
                        },
                       {
                           id: "chooseDevice",
                           iconClass: 'deviceIcon',
                           className: "davinciFloatRight",
                           action: "davinci/ve/actions/ChooseDeviceAction",
                           label: "Choose device"
                       },
                       {
                           id: "rotateDevice",
                           iconClass: 'rotateIcon',
                           className: "davinciFloatRight",
                           action: "davinci/ve/actions/RotateDeviceAction",
                           label: "Rotate device"
                       }
                    ]
                },
                {
                    id: "stickynote",
                    iconClass: 'stickynoteIcon',
                    className: 'davinciFloatRight',
                    action: "davinci/actions/StickyNoteAction",
                    label: "Add note",
                    toolbarPath: "undoredo"
                },
                {
                    id: "layout",
                    className: "maqLabelButton davinciFloatRight maqLayoutDropDownButton",
                    showLabel: true,
                    label: "Flow",	// will be updated by code
                    toolbarPath: "undoredo",
                    type:'DropDownButton',
                    menu:[
                        {
                            label: "Flow",
                            iconClass: "selectLayoutIcon",
                            method: "selectLayoutFlow"
                        },
                        {
                            label: "Absolute",
                            iconClass: "selectLayoutIcon",
                            method: "selectLayoutAbsolute"
                        }
                   ]
                 },
                {
                    id: "sourcecombo",
                    className: "maqLabelButton davinciFloatRight maqSourceComboButton",
                    showLabel: true,
                    label: "Source",
                    method: "switchDisplayModeSourceLatest",
                    toolbarPath: "undoredo",
                    type:'ComboButton',
                    menu:[
                       {
                            keyBinding: {accel: true, charOrCode: "2", allowGlobal: true},
                            iconClass: 'editActionIcon sourceModeIcon',
                            method: "switchDisplayModeSource",
                            label: "Source only"
                        },
                        {
                            keyBinding: {accel: true, charOrCode: "3", allowGlobal: true},
                            iconClass: 'editActionIcon splitVerticalIcon',
                            method: "switchDisplayModeSplitVertical",
                            label: "Split Vertically"
                        },
                        {
                            keyBinding: {accel: true, charOrCode: "4", allowGlobal: true},
                            iconClass: 'editActionIcon splitHorizontalIcon',
                            method: "switchDisplayModeSplitHorizontal",
                            label: "Split Horizontally"
                        }
                    ]
                },
                {
                    id: "design",
                    //iconClass: 'designModeIcon editActionIcon',
                    showLabel: true,
                    className: 'maqLabelButton davinciFloatRight',
                    method: "switchDisplayModeDesign",
                    // initialValue : true,
                    label: "Design",
                    toolbarPath: "undoredo",
                    keyBinding: {accel: true, charOrCode: "1", allowGlobal: true}
                },
				{
                    id: "editproperties",
                    iconClass: "editActionIcon editPropertiesIcon",
                    className: "editProperties",
                    label: "Edit properties",
                    action: "davinci/ve/actions/EditPropertiesAction",
                    actionbarPath: "editvalue"
                },
				{
				    id: "cut",
				    label: "Cut",
				    iconClass: "editActionIcon editCutIcon",
				    action: "davinci/ve/actions/CutAction",
				    actionbarPath: "cutcopypaste",
				    keyBinding: {accel: true, charOrCode: "x"}
				
				},
				{
				    id: "copy",
				    label: "Copy",
				    iconClass: "editActionIcon editCopyIcon",
				    action: "davinci/ve/actions/CopyAction",
				    actionbarPath: "cutcopypaste",
				    keyBinding: {accel: true, charOrCode: "c"}
				},
                {
                    label: "Paste",
                    iconClass: "editActionIcon editPasteIcon",
                    action: "davinci/ve/actions/PasteAction",
				    actionbarPath: "cutcopypaste"
                },
				{
                    id: "delete",
                    iconClass: "editActionIcon editDeleteIcon",
                    label: "Delete",
                    action: "davinci/ve/actions/DeleteAction",
                    actionbarPath: "delete",
                    keyBinding: {charOrCode: dojo.keys.DELETE}
                },
				{
                    id: "duplicate",
                    iconClass: "editActionIcon editDuplicateIcon",
                    label: "Duplicate",
                    action: "davinci/ve/actions/DuplicateAction",
                    actionbarPath: "delete"
                },
				{
                    id: "editvalue",
                    iconClass: "editActionIcon editValueIcon",
                    label: "Edit value",
                    action: "davinci/ve/actions/EditValueAction",
                    actionbarPath: "editvalue"
                },
				{
                    id: "selectCommands",
                    iconClass: "editActionIcon selectCommandsIcon",
                    label: "Select commands",
                    actionbarPath: "arrange",
                    type:'ComboButton',
                    action: "davinci/ve/actions/SelectParentAction",
                    menu:[
                          {
                              iconClass: "editActionIcon",
                              label: "Select parent",
                              action: "davinci/ve/actions/SelectParentAction"
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Select ancestor...",
                              action: "davinci/ve/actions/SelectAncestorAction"
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Unselect all",
                              action: "davinci/ve/actions/UnselectAllAction"
                          }
                    ]

                },
				{
                    id: "arrangeCommands",
                    iconClass: "editActionIcon arrangeCommandsIcon",
                    label: "Arrange commands",
                    action: "davinci/ve/actions/ArrangeAction",
                    actionbarPath: "arrange",
                    type:'DropDownButton',
                    menu:[
                          {
                              iconClass: "editActionIcon",
                              label: "Move to back",
                              action: "davinci/ve/actions/MoveToBackAction"
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Move forward",
                              action: "davinci/ve/actions/MoveForwardAction"
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Move backward",
                              action: "davinci/ve/actions/MoveBackwardAction"
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Move to front",
                              action: "davinci/ve/actions/MoveToFrontAction"
                          }
                    ]

                },
				{
                    id: "otherCommands",
                    iconClass: "editActionIcon otherCommandsIcon",
                    label: "Other commands",
                    action: "davinci/ve/actions/OtherAction",
                    actionbarPath: "other",
                    type:'DropDownButton',
                    menu:[
                          {
                              iconClass: "editActionIcon",
                              label: "Surround with &lt;A&gt;",
                              action: "davinci/ve/actions/SurroundAction",
                              surroundWithTagName:'a'
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Surround with &lt;DIV&gt;",
                              action: "davinci/ve/actions/SurroundAction",
                              surroundWithTagName:'div'
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Surround with &lt;SPAN&gt;",
                              action: "davinci/ve/actions/SurroundAction",
                              surroundWithTagName:'span'
                          },
                          {
                              iconClass: "editActionIcon",
                              label: "Application States...",
                              action: "davinci/ve/actions/EnableApplicationStates"
                          }
                     ]

                },
                {
                    id: "closeactiveeditor",
                    run: function() {
                        require(['../Workbench'], function(workbench) {
                            workbench.closeActiveEditor();
                        });
                    },
                    keyBinding: {accel: true, shift: true, charOrCode: "w", allowGlobal: true}
                },
                {
                    id: "showWidgetsPalette",
                    run: function() {
                    	var tab = dijit.byId("davinci.ve.Palette");
                    	if (tab) {
                    		var tabContainer = tab.getParent();
                    		// Select tab
                    		if (tabContainer) {
                    			tabContainer.selectChild(tab);
                    		}
                    	} 
                    },
                    keyBinding: {meta: true, charOrCode: "p", allowGlobal: true}
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
						toolbarPath: "save",
						keyBinding: {accel: true, charOrCode: "s"}
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
						toolbarPath: "save",
						keyBinding: {accel: true, shift: true, charOrCode: "s"}
					}
				]
			}
		}
};

});