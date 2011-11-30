define({ root:
{
		//DocileDialog.js
		"dontShowAgain":"Don't show again",
	
		//FileFieldDialog.js
		"selectFile":"Select a file",
		
		//OpenFileDialog.js
		"openFile":"Open File",//used in Resource.js as well
		
		//about.js
		"aboutMaqetta":"About Maqetta",
		"productVersion":"Version: ${0}",
		"productDate":"Date: ${0}",
		//"build":"Build: <a href='https://github.com/maqetta/maqetta/commit/${0}'> ${1}...</a> ",
		"build":"Build: ${0}",
		
		//Download.js
		"library":"Library",//used in UserLibraries.js as well
		"version":"Version",//used in UserLibraries.js as well
		"include":"Include",
		"source":"Source",
		"baseLocation":"Base Location",
		
		//DownloadSelected.js
		"selectedFiles":"Selected Files",
		"noFilesSelected":"No files selected!",
		
		//NewTheme.js
		"themeAlreadyExists":"Theme already Exists!",
		"invalidThemeName": "Invalid theme name",
		
		//OpenThemeDialog.js
		"noUserThemes":"No user themes found in workspace. Please create a new theme before editing.",
		
		//ThemeSetsDialog.js and widgets/ThemeSetSelection.js
		"themeSetsDialog":"Manage theme sets",
		"renameThemeSet":"Rename theme set",
		"themeSets":"Theme sets:",
		"currentlySelectedThemeSet":"Currently selected theme set:",
		"themeSetName":"Name:",
		"desktopTheme":"Dojo desktop 1.7 theme:",
		"mobileTheme":"Dojo mobile 1.7 theme:",
		"android":"Android:",
		"blackberry":"Blackberry:",
		"ipad":"iPad:",
		"iphone":"iPhone:",
		"other":"Other:",
		"selectTheme":"Select theme",
		"themeSet":"Theme set:",
	    "themeVersionMessage": "Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.",

		
		//SaveAsWidgetForm.js
		//right now it has its own nls file called "common." 
		//Globalize later once it is completed
			
		//UserLibraries.js
		//"library":"Library",
		//"version":"Version",
		"workspaceLocation":"Workspace Location",
		
		//Resource.js
		
		//doItLabels
		"create":"Create",
		"open":"Open",
		"save":"Save",
		"ok":"Ok",
		"cancel":"Cancel",
		
		//fileDialog
		"fileName":"File name",//used in templates/download.html
		"folderName":"Folder name",
		"parentFolder":"Parent folder: ",//used in add files as well
		"newFolderLabel":"New folder",
		"cancelButtonLabel":"Cancel",
		
		//dialog titles
		"createNewFile":"Create New File",
		"createNewHTMLFile":"Create New HTML File",
		"createNewCSSFile":"Create New CSS File",
		"createNewJSFile":"Create New JavaScript File",
		//"openFile":"Open File",
		"createNewFolder":"Create New Folder",
		"saveFileAs":"Save File As",
		
		//addFiles
		"selectFiles":"Select Files...",
		"upload":"Upload",
		"addFiles":"Upload Files",
		"uploading":"Uploading...",
		"completed":"completed: ${0} \n",
		"done":"Done",
		
		//checkFileName
		"mustEnterFileName":"You must enter a file name.",
		"cannotSelect":"Cannot select ${0}. It is a folder.",
		"fileAlreadyExistsOverwrite":"File ${0} already exists. OK to overwrite?",
		"cannotCreate":"Cannot create ${0}. It already Exists.",
		"fileNameSlashCharacter":"File names cannot contain a slash character (/). Your file name is: ${0}",
		"doesNotHaveExtension":"The name ${0} does not have an extension (e.g., .html, .css or .js) and will be treated as a plain text file. OK to proceed?",
		
		//deleteAction
		"areYouSureDelete":"Are you sure you want to delete ${0}?",
		"noResourcesSelected":"No resources are currently selected.",
		
		/*Templates*/
		//download.html -- see above for file name
		
		//newtheme.html
		"themeToClone":"Theme to clone",
		"newName":"New Name",
		
		//OpenThemeDialog.html
		"selectTheme":"Select a Theme",

		"newProject":"New Project",
		
		//NewFile.html
		"newFileShowFiles":"Show file picker",
		"newFileHideFiles":"Hide file picker",
		
		//NewHTMLFileOptions.html - Composition type strings
		"nhfoCompositionType":"Composition type:",
		"nhfoCTMenu_desktop":"Desktop",
		"nhfoCTTitle_desktop":"desktop browser, flow layout, production theme",
		"nhfoCTMenu_mobile":"Mobile",
		"nhfoCTTitle_mobile":"mobile device, flow layout, production theme",
		"nhfoCTMenu_sketch":"Sketch",
		"nhfoCTTitle_sketch":"desktop browser, absolute layout, production theme",
		"nhfoCTMenu_wireframe":"Wireframe",
		"nhfoCTTitle_wireframe":"desktop browser, absolute layout, wireframe theme",
		"nhfoCTMenu_custom":"Custom",
		"nhfoCTTitle_custom":"custom settings",
		"nhfoShowDetails":"Show details",
		"nhfoHideDetails":"Hide details",
		
		//NewHTMLFileOptions.html - Device strings
		"nhfoDevice":"Device:",
		"nhfoDVMenu_desktop":"Desktop",
		
		//NewHTMLFileOptions.html - Layout strings
		"nhfoLayout":"Layout:",
		"nhfoLAMenu_flow":"flow",
		"nhfoLAMenu_absolute":"absolute",
		
		//NewHTMLFileOptions.html - Theme strings
		"nhfoTheme":"Theme or theme set:",
		"nhfoTHMenu_devicespecific":"(device-specific)"
}
});
