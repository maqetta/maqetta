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
            hide:true,	//FIXME: temporarily don't show project setting preferences. See #3657, #3658
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
                position: "left-bottom"
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
                       "newApp", true, "newSketch", true, "newFolder", true, "newTheme", true, "newProject", true, "additions", true
                   ]
               },
               {
                   label: "Open",
                   path: "open",
                   id: "davinci.open",
                   separator: [
                       "openFile", true, "openTheme", true, "openOrion", true, "additions", false
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
                     iconClass: "newOpenMenuItem newMobileAppMenuItem",
                     label: "Mobile Application...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newApp"
                 },
                 {
                     id: "newHTMLDesktop",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLDesktop();
                         });
                     },
                     iconClass: "newOpenMenuItem newDesktopAppMenuItem",
                     label: "Desktop Application...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newApp"
                 },
                 {
                     id: "newHTMLSketchHiFi",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLSketchHiFi();
                         });
                     },
                     iconClass: "newOpenMenuItem newSketchHiFiMenuItem",
                     label: "Sketch (high-fidelity)...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newSketch"
                 },
                 {
                     id: "newHTMLSketchLoFi",
                     // icon: 'davinci/img/add.gif',
                     run: function() {
                         require(['./ui/Resource'], function(r) {
                             r.newHTMLSketchLoFi();
                         });
                     },
                     iconClass: "newOpenMenuItem newSketchLoFiMenuItem",
                     label: "Sketch (low-fidelity)...",
                     // toolbarPath: "davinci.toolbar.main/edit",
                     menubarPath: "davinci.new/newSketch"
                 },
                 {
                     id: "newFolder",
                     run: function() {
                     	require(['./ui/Resource'], function(r) {
                     		r.newFolder();
                     	});
                     },
                     iconClass: "newOpenMenuItem newFolderMenuItem",
                     label: "Folder...",
                     menubarPath: "davinci.new/newFolder"
                 },
                {
                   id: "newCSS",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newCSS();
                   	});
                   },
                   iconClass: "newOpenMenuItem newCSSMenuItem",
                   label: "CSS File...",
                   menubarPath: "davinci.new/newFolder"
               },
               {
                   id: "newJS",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newJS();
                   	});
                   },
                   iconClass: "newOpenMenuItem newJSMenuItem",
                   label: "JavaScript File...",
                   menubarPath: "davinci.new/newFolder"
               },
               {
                   id: "newTheme",                                     
                   run: function() {
                   	require(['davinci/Workbench', 'davinci/ui/NewTheme'], function(Workbench, NewTheme){
                   			Workbench.showModal(new NewTheme(), 'New Theme', {width: 300}, null, true);
                   	});
                   },
                   iconClass: "newOpenMenuItem newThemeMenuItem",
                   label: "Theme...",
                   menubarPath: "davinci.new/newTheme"
               },
               {
                   id: "newProject",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.newProject();
                   	});
                   },
                   iconClass: "newOpenMenuItem newProjectMenuItem",
                   label: "Project...",
                   menubarPath: "davinci.new/newProject"
               },
               {
                   id: "openFile",
                   run: function() {
                   	require(['./ui/Resource'], function(r) {
                   		r.openFile();
                   	});
                   },
                   iconClass: "newOpenMenuItem openFileMenuItem",
                   label: "File...",
                   toolbarPath: "davinci.toolbar.main/edit",
                   menubarPath: "davinci.open/openFile",
                   keyBinding: {accel: true, charOrCode: "o"}
               },
               {
                   id: "openThemeEditor",
                   run: function() {
                   	require(['davinci/Workbench', 'davinci/ui/OpenThemeDialog'], function(Workbench, OpenThemeDialog){
                   			Workbench.showModal(new OpenThemeDialog(), 'Open Theme', {width: 200}, null, true);
                   	});
                   },
                   iconClass: "newOpenMenuItem openThemeMenuItem",
                   label: "Theme Editor...",
                   menubarPath: "davinci.open/openTheme"
               },
               {
                   id: "openReview",
                   run: function() {
                	   
                   	require(['./ui/Resource'], function(r) {
                   		r.openFile();
                   	});
                   },
                   run: function() {
                      	require(['davinci/Workbench', 'davinci/review/widgets/OpenReviewDialog'], function(Workbench, OpenReviewDialog){
                      		Workbench.showModal(new OpenReviewDialog(), 'Open Review', {width: 350, height: 250});
                      	});
                   },
                   iconClass: "newOpenMenuItem openReviewMenuItem",
                   label: "Review...",
                   menubarPath: "davinci.open/openTheme"
               },
               {
                   id: "orionNavigator",
                   run: function() {
                     window.open("../navigate/table.html#", '_blank');
                     window.focus();
                   },
                   iconClass: "newOpenMenuItem orionIcon",
                   label: "Orion Navigator",
                   menubarPath: "davinci.open/openOrion"
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
                    label: "User settings",
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
                    	window.open('app/docs/index.html#tutorials/tutorials', 'MaqettaTutorials');
                    },
                    label: "Tutorials",
                    menubarPath: "davinci.help/help"
                },
                {
                    id: "showVideos",
                    run: function() {
                    	window.open('http://www.youtube.com/user/Maqetta/', 'MaqettaVideos');
                    },
                    label: "Videos",
                    menubarPath: "davinci.help/help"
                },
                {
                    id: "showCheatSheets",
                    run: function() {
                    	window.open('app/docs/index.html#cheatsheets/cheatsheets', 'MaqettaCheatSheets');
                    },
                    label: "Cheat sheets",
                    menubarPath: "davinci.help/help"
                },
                {
                    id: "showHowTo",
                    run: function() {
                    	window.open('https://www.ibm.com/search/csass/search/?sn=dw&en=utf&hpp=20&dws=dw&q=maqetta&Search=Search', 'MaqettaHowTo');
                    },
                    label: "How-to articles",
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
                        window.open("../settings/settings.html", '_blank');
                        window.focus();
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
                    iconClass: "deleteIcon",
                    isEnabled: function(item) {
                        return require('./ui/Resource').canModify(item);
                    },
                    run: function() {
                    	require(['./ui/Resource'], function(r) {
                    		r.deleteAction();
                    	});
                    },
                    menubarPath: "delete",
                    keyBinding: {charOrCode: [dojo.keys.DELETE, dojo.keys.BACKSPACE]}
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
	                    id: "davinci.ui.newfile",
	                    label: "New folder...",
	                    iconClass:"newFolderIcon",
	                    className: "FilesToolbarNewFolder",
	                    run: function() {
	                    	require(['./ui/Resource'], function(r) {
	                    		r.newFolder();
	                    	});
	                    },
                        toolbarPath: "download"
	                },
	                {
	                    id: "davinci.ui.deletefile",
	                    label: "Delete file...",
	                    iconClass:"FilesToolbarDeleteFileIcon",
	                    className: "FilesToolbarDeleteFile",
	                    run: function() {
	                    	require(['./ui/Resource'], function(r) {
	                    		r.deleteAction();
	                    	});
	                    },
                        toolbarPath: "download"
	                },
	                {
	                    id: "davinci.ui.renamefile",
	                    label: "Rename file...",
	                    iconClass:"FilesToolbarRenameFileIcon",
	                    className: "FilesToolbarRenameFile",
	                    run: function() {
	                    	require(['./ui/Resource'], function(r) {
	                    		r.renameAction();
	                    	});
	                    },
                        toolbarPath: "download"
	                },
                    {
                        id: "davinci.ui.addFiles",
                        label: "Upload and Extract ZIP file...",
                        iconClass:"uploadZipIcon",
	                    className: "FilesToolbarUploadZip",
                        run: function() {
                        	require(['./ui/Resource'], function(r) {
                        		r.addFilesZip();
                        	});
                        },
                        isEnabled: function(item) {
                            return !item || require('./ui/Resource').canModify(item);
                        },
                        toolbarPath: "download"
                    },
                    {
                        id: "davinci.ui.addFiles",
                        label: "Upload files...",
                        iconClass:"uploadIcon",
	                    className: "FilesToolbarUploadFiles",
                        run: function() {
                        	require(['./ui/Resource'], function(r) {
                        		r.addFiles();
                        	});
                        },
                        isEnabled: function(item) {
                            return !item || require('./ui/Resource').canModify(item);
                        },
                        toolbarPath: "download"
                    },
                    {
                        id: "download",
                        iconClass: 'downloadSomeIcon',
	                    className: "FilesToolbarDownloadSelected",
                        run: function() {
                            require(['./Workbench', './ui/DownloadSelected'],
                                function(workbench, DownloadSelected) {
                                	workbench.showModal(new DownloadSelected(), "Download", {width: 440});
                                }
                            );
                        },
                        label: "Download Selected Files",
                        toolbarPath: "download"
                    },
                    {
                        id: "download",
                        iconClass: 'downloadAllIcon',
	                    className: "FilesToolbarDownloadAll",
                        run: function() {
                            require(['./Workbench', './ui/Download'],
                                function(workbench, Download) {
                                	workbench.showModal(new Download(), "Download", {width: 440});
                                }
                            );
                        },
                        label: "Download Entire Project",
                        toolbarPath: "download"
                    }
                ]
            }
        }
    ]
};

});