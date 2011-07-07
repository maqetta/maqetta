dojo.provide("davinci.ve.RebaseDownload");
dojo.require("davinci.ve.RebuildPage");

dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.tools.SelectTool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.util");
dojo.require("davinci.ve.Focus");
dojo.require("davinci.actions.SelectLayoutAction");
dojo.require("davinci.library");
dojo.require("davinci.ve.Context");

dojo.declare("davinci.ve.RebaseDownload", davinci.ve.RebuildPage, {
	
	/* libs should look like:
	 * [{id:'dojo', version '1.8' base:'http://blahblahblah/dojo/'}]
	 * this class will return the modified source
	 * 
	 */
	constructor: function(libs){
		this.libs = libs;
	},

	getLibraryBase : function(id, version){
		for(var name in this.libs){
			var item = this.libs[name];
			if(item['id']==id && item['version']==version)
				return item['base'];
		}
		return davinci.library.getLibRoot(id,version) || "";
	}
	
});