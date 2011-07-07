/*
 * UI Dialog includes
 */

dojo.provide("davinci.ui.Dialogs");
dojo.provide("davinci.ui.DeployDialog");
dojo.require("davinci.ui.Download");
dojo.require("davinci.ui.DownloadSelected");
dojo.require("davinci.ui.UserLibraries");
dojo.require("davinci.ui.NewTheme");
dojo.require("davinci.actions.OpenThemeEditor");
dojo.require("davinci.ui.OpenThemeDialog");
dojo.require("davinci.ui.Resource");

if (!davinci)
	davinci={};

if (!davinci.ui)
	davinci.ui={};


davinci.ui.DeployAllDialog=function(){
	return new davinci.ui.Download();
	
	
}

davinci.ui.DeploySomeDialog=function(){
	return new davinci.ui.DownloadSelected();
	
	
}

davinci.ui.UserLibs=function(){
	
	return new davinci.ui.UserLibraries();
	
	
}
davinci.ui.OpenTheme=function(){
	return new davinci.actions.OpenThemeEditor();
	
	
}
davinci.ui.NewThemeDialog=function(){
	return new davinci.ui.NewTheme();
	
	
}
davinci.ui.OpenTheme=function(){
	return new davinci.ui.OpenThemeDialog();
	
	
}