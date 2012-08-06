define([
    "require",
//    "./ui/Resource",
//    "./Workbench",
//    "./ui/Download",
//    "./ui/DownloadSelected",
//    "./ui/UserLibraries",
    "davinci/css!./ui.css"    // load css; no return
], function(require) {

return {
    id: "davinci.ui",
    "davinci.view": [
        {
            id: "navigator",
            title: "Files",
            viewClass: "davinci/workbench/Explorer",
            iconClass: "paletteIcon paletteIconFiles"
        },
        {
            id: "hierarchy",
            title: "Hierarchy"
        },
        {
            id: "outline",
            title: "Outline",
            viewClass: "davinci/workbench/OutlineView",
            iconClass: "paletteIcon paletteIconOutline"
        },
		{
			id: "comment",
			title: "Comments",
			viewClass: "davinci/review/view/CommentView",
            iconClass: "paletteIcon paletteIconComments"
		},
        {
            id: "scope",
            title: "Scope"
        },
        {
            id: "properties",
            title: "Properties",
            viewClass: "davinci/workbench/PropertyEditor"
        },
        {
            id: "problems",
            title: "Problems",
            viewClass: "davinci/workbench/ProblemsView"
        },
        {
            id: "console",
            title: "Console"
        },
        {
            id: "history",
            title: "History"
        },
        {
            id: "search",
            title: "Search"
        }
    ],
    "davinci.preferences": [
        {
            name: "Project",
            id: "project",
            category: "",
            pageContent: "Project Settings here"
        },
        {
            name: "Project Settings",
            id: "ProjectPrefs",
            category: "davinci.ui.project",

            pane: "davinci/ui/ProjectPreferences",
            defaultValues: {
                "webContentFolder": "",
                "themeFolder": "themes",
                "widgetFolder": "lib/custom"
            }
        }
    ],
    "davinci.perspective": {
        id: "main",
        title: "AJAX IDE",
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
                viewID: "davinci.ui.properties",
                position: "right-bottom"
            }
        ]
    },
    "davinci.actionSets": [
       {
           id: "editorActions",
           visible: true,
           menu: [
               {
                   __mainMenu: true,
                   separator: [
                       "new", false, "open", false
                   ]
               },
               {
                   label: "Create",
                   path: "new",
                   id: "davinci.new",
                   separator: [
                       "newApp", true, "newSketch", true, "new", true, "new2", true, "additions", true
                   ]
               },
               {
                   label: "Open",
                   path: "open",
                   id: "davinci.open",
                   separator: [
                       "open", true, "open2", true, "additions", false
                   ]
               }
           ],
           actions: [
                 {
                     id: "newHTMLMobile",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLMobile();
                         });
                     },
                     label: "Mobile Application...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newApp",
                     keyBinding: {accel: true, charOrCode: "n"}
                 },
                 {
                     id: "newHTMLDesktop",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLDesktop();
                         });
                     },
                     label: "Desktop Application...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newApp",
                     keyBinding: {accel: true, charOrCode: "n"}
                 },
                 {
                     id: "newHTMLSketchHiFi",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLSketchHiFi();
                         });
                     },
                     label: "Sketch (high-fidelity)...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newSketch",
                     keyBinding: {accel: true, charOrCode: "n"}
                 },
                 {
                     id: "newHTMLSketchLoFi",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLSketchLoFi();
                         });
                     },
                     label: "Sketch (low-fidelity)...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newSketch",
                     keyBinding: {accel: true, charOrCode: "n"}
                 },
                 {
                   id: "newCSS",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newCSS();
                   	});
                   },
                   label: "CSS File...",
                   menubarPath: "davinci.new/new"
               },
               {
                   id: "newJS",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newJS();
                   	});
                   },
                   label: "JavaScript File...",
                   menubarPath: "davinci.new/new"
               },
               {
                   id: "newProject",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newProject();
                   	});
                   },
                   label: "Project...",
                   menubarPath: "davinci.new/new"
               },
               {
                   id: "newFolder",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newFolder();
                   	});
                   },
                   label: "Folder...",
                   menubarPath: "davinci.new/new2"
               },
               {
                   id: "openFile",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.openFile();
                   	});
                   },
                   label: "File...",
                   toolbarPath: "davinci.toolbar.main/edit",
                   menubarPath: "davinci.open/open",
                   keyBinding: {accel: true, charOrCode: "o"}
               },
               {
                   id: "openThemeEditor",
                   run: function() {
                   	require(['davinci/Workbench', 'davinci/ui/OpenThemeDialog'], function(Workbench, OpenThemeDialog){
                   		Workbench.showModal(new OpenThemeDialog(), 'Open Theme', 'width: 200px');
                   	});
                   },
                   label: "Theme Editor...",
                   menubarPath: "davinci.open/open2"
               },
               {
                   id: "newTheme",
                   run: function() {
                   	require(['davinci/Workbench', 'davinci/ui/NewTheme'], function(Workbench, NewTheme){
                   		Workbench.showModal(new NewTheme(), 'New Theme', 'width: 300px');
                   	});
                   },
                   label: "Theme...",
                   menubarPath: "davinci.new/new"
               }
           ]
        },
        {
            id: "main",
            visible: true,
            menu: [
                {
                    __mainMenu: true,
                    separator: [
                        "usersettings", false, "settings", false, "additions", false, "help",
                        false
                    ]
                },
                {
                    label: "UserSettings",
                    path: "usersettings",
                    id: "davinci.usersettings",
                    className: 'userSettingsMenu',
                    iconClass: 'userSettingsMenuIcon',
                    showLabel:false,
                    separator: [
                        "username", true, "logout", true, "additions", false
                    ]
                },
                {
                    label: "Settings",
                    path: "settings",
                    id: "davinci.settings",
                    className: 'appSettingsMenu',
                    iconClass: 'appSettingsMenuIcon',
                    showLabel:false,
                    separator: [
                        "settings", true, "additions", false
                    ]
                },
                {
                    label: "Help",
                    path: "help",
                    id: "davinci.help",
                    className: 'helpMenu',
                    iconClass: 'helpMenuIcon',
                    showLabel:false,
                    separator: [
                        "help", true, "about", false, "additions", false
                    ]
                }
            ],
            actions: [
                {
                    id: "editPreferences",
                    run: function() {
                    	require(['davinci/workbench/Preferences'], function(Preferences) {
                    		Preferences.showPreferencePage();
                    	});
                    },
                    label: "Preferences...",
                    menubarPath: "davinci.settings/settings"
                },
                {
                    id: "editThemeSets",
                    run: function() {
                    	require(['davinci/ui/ThemeSetsDialog'], function(ThemeSetsDialog){
                    		ThemeSetsDialog();
                    	});
                    },
                    label: "Theme sets...",
                    menubarPath: "davinci.settings/settings"
                },
                {
                    id: "showHelp",
                    run: function() {
                    	window.open('app/docs/index.html', 'MaqettaDocumentation');
                    },
                    label: "Documentation",
                    menubarPath: "davinci.help/help",
                    keyBinding: {charOrCode: dojo.keys.F1}
                },
                {
                    id: "showTutotials",
                    run: function() {
                    	window.open('app/docs/index.html#tutorials/tutorials', 'MaqettaTutotials');
                    },
                    label: "Tutorials",
                    menubarPath: "davinci.help/help"
                },
                {
                    id: "about",
                    run: function() {
                    	require(['davinci/ui/about'], function(about) {
                    		about.show();
                    	});
                    },
                    label: "About Maqetta",
                    menubarPath: "davinci.help/about"
                },
                {
                    id: "username",
                    action: "davinci/actions/UserNameAction",
                    run: function() {
                    	// do monthing - purely informational
                    },
                    label: "{user}",	// Filled in programmatically by UserNameAction class
                    menubarPath: "davinci.usersettings/username"
                },
                {
                    id: "logout",
                    action: "davinci/actions/LogoutAction",
                    label: "Logout",
                    menubarPath: "davinci.usersettings/logout"
                }
            ]
        },
        {
            id: "explorerActions",
            visible: true,
            actions: [
                {
                    id: "davinci.ui.newfile",
                    label: "New folder...",
                    run: function() {
                    	require(['./ui/Resource'], function(r) {
                    		r.newFolder();
                    	});
                    },
                    isEnabled: function(item) {
                        return require('./ui/Resource').canModify(item);
                    },
                    menubarPath: "newfolder"
                },
                {
                    id: "davinci.ui.addFiles",
                    label: "Upload files...",
                    run: function() {
                    	require(['./ui/Resource'], function(r) {
                    		r.addFiles();
                    	});
                    },
                    isEnabled: function(item) {
                        return require('./ui/Resource').canModify(item);
                    },
                    menubarPath: "addFiles"
                },
                {
                    id: "davinci.ui.rename",
                    label: "Rename...",
                    iconClass:"renameIcon",
                    run: function() {
                    	require(['./ui/Resource'], function(r) {
                    		r.renameAction();
                    	});
                    },
                    isEnabled: function(item) {
                        return require('./ui/Resource').canModify(item);
                    },
                    menubarPath: "addFiles"
                },
                {
                    id: "davinci.ui.delete",
                    label: "Delete",
                    iconClass: "editActionIcon editDeleteIcon",
                    isEnabled: function(item) {
                        return require('./ui/Resource').canModify(item);
                    },
                    run: function() {
                    	require(['./ui/Resource'], function(r) {
                    		r.deleteAction();
                    	});
                    },
                    menubarPath: "delete",
                    keyBinding: {charOrCode: dojo.keys.DELETE}
                },
                {
                    id: "davinci.ui.download",
                    label: "Download",
                    iconClass: "downloadSomeIcon",
                    action: "davinci/actions/DownloadAction",
                    isEnabled: function(item) {
                        return require('./ui/Resource').canModify(item);
                    },
                    menubarPath: "delete"
                }
                
                
            ]
        }
    ],
    "davinci.actionSetPartAssociations": [
        {
            targetID: "davinci.ui.editorActions",
            parts: [
                "davinci.ui.editorMenuBar"
            ]
        },
        {
            targetID: "davinci.ui.explorerActions",
            parts: [
                "davinci.ui.navigator"
            ]
        }
    ],
    "davinci.viewActions": [
        {
            viewContribution: {
                targetID: "davinci.ui.problems",
                actions: [
                    {
                        id: "Copy2",
                        iconClass: 'copyIcon',
                        run: function() {
                            alert("view toolbar");
                        },
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
                targetID: "workbench.Explorer",
                actions: [
                    {
                        id: "download",
                        iconClass: 'downloadAllIcon',
                        run: function() {
                            require(['./Workbench', './ui/Download'],
                                function(workbench, Download) {
                                    workbench.showModal(new Download(), "Download", "width: 400px");
                                }
                            );
                        },
                        radioGroup: "displayMode",
                        label: "Download Entire Workspace",
                        toolbarPath: "download"
                    },
                    {
                        id: "download",
                        iconClass: 'downloadSomeIcon',
                        run: function() {
                            require(['./Workbench', './ui/DownloadSelected'],
                                function(workbench, DownloadSelected) {
                                    workbench.showModal(new DownloadSelected(), "Download", "width: 400px");
                                }
                            );
                        },
                        radioGroup: "displayMode",
                        label: "Download Selected Files",
                        toolbarPath: "download"
                    },
                    {
                        id: "userlibs",
                        iconClass: 'userLibIcon',
                        run: function() {
                            require(['./Workbench', './ui/UserLibraries'],
                                function(workbench, UserLibraries) {
                                    workbench.showModal(new UserLibraries(), "User Libraries", "width: 400px");
                                }
                            );
                        },
                        radioGroup: "displayMode",
                        label: "Modify Libraries",
                        toolbarPath: "download"
                    },
                    
                    
                    
                    {
                        id: "davinci.ui.orion",
                        
                        iconClass: "orionIcon",
                        run: function() {
                        	location.href = "/navigate/table.html#";
                        },
                        radioGroup: "displayMode",
                        label: "Resource Control w/Orion",
                        toolbarPath: "download"
                    }
                ]
            }
        }
    ]
};

});