define(["dojo/_base/declare", "./RebuildPage", "../library"], function(declare, RebuildPage, library){

return declare(RebuildPage, {
	
	/* libs should look like:
	 * [{id:'dojo', version '1.8' base:'http://blahblahblah/dojo/'}]
	 * this class will return the modified source
	 * 
	 */
	constructor: function(libs){
		this.libs = libs;
	},

	getLibraryBase: function(id, version){
		for(var name in this.libs){
			var item = this.libs[name];
			if (item.id==id && item.version==version) {
				var d = new Deferred();
				d.resolve(item.root);
				return d;
			}
		}
		return library.getLibRoot(id,version) || "";
	}
	
});
});

