dojo.provide("davinci.project");



/* returns the users hopeful location of web content in a project.  
 * generally ".", but could be ./WebContent in Eclipse, or other for different tooling.  These are more
 * preferences than hard/fast rules.
 */


davinci.project.settings = {
		defaultValues : {
			"Themes Folder":"./theme",
			"Web Content":"."
			
		}
};




davinci.project.getContentRoot=function(base, type){
	switch(type){
		case "theme" : return davinci.project._getThemeRoot(base);
		case "default" :return davinci.project._getWebRoot(base);
	}
	
}
/* private method to determine the default location for web content.  "WebContent" is standard in Eclipse,*/
davinci.project._getWebRoot = function(base){
	
}

/* root directory for themes */
davinci.project._getThemeRoot(base){
	
	
}