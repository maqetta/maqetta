define(["dojo/_base/declare","davinci/ve/utils/URLRewrite"], function(declare,URLRewrite) {

return declare("davinci.ve.themeEditor.metadata.query", null, {
	
	constructor : function(files,modules){
		this.files = files;
		this.cache = {};
		this.lastLoaded = -1;
		this.modules = modules;
		this.modulePrefix = null;
		this.modulePrefix = ".";
		if(modules){
			for(var i = 0;i<modules.length;i++){
				
				this.modulePrefix += "/" + modules[i];
			}
		}
	},
	getType : function (widget){
		var type = null;
		if(widget.declaredClass){
			type=widget.type;
		}else{ // string
			type = widget;
			if(type.substring(0, 5) == "html."){
				tagName = type.substring(5);
	
			}
		}
		return type;
	},
	_loadNextFile : function (){
		var currentFile = this.files[++this.lastLoaded];
		var _URL = null;
		if(currentFile.getURL){
			_URL = URLRewrite.encodeURI(currentFile.getURL());
		}else{
			_URL = this.modulePrefix + currentFile;
			
		}
		var md = null;
		dojo.xhrGet({
			url: _URL,
			handleAs: "json",
			sync: true,
			load: function(result){md = result;} 
		});
		return md;
	},
	_fullyLoaded : function (){
		return this.files.length <= (this.lastLoaded+1);
		
	},
	_cacheNext : function(){
			var metadata = this._loadNextFile();
			dojo.mixin(this.cache, metadata);
	},
	
	getMetaData : function(type){

		var path = type.split(/[\.\/]/);
			
			/*
			 * (12/1/2010)
			(12:34:43 PM) Bradley Childs: shoudln't we have the full type path in the JSON ?
			(12:35:00 PM) Bradley Childs: there may be a dijit.form2.button
			(12:35:03 PM) Bill Reed: yes, we removed the full path.. layout is the same way
			(12:35:32 PM) Bradley Childs: so we ignore any of the middle parts?
			(12:35:40 PM) Bradley Childs: if its dijit.1.2.3.4.button
			(12:35:41 PM) Bill Reed: yup
			(12:35:48 PM) Bradley Childs: all the parts we care about its dijit and button?
			(12:35:58 PM) Bill Reed: correct
			(12:36:00 PM) Bradley Childs: ok
			(12:36:06 PM) Bradley Childs: is that by design?
			(12:36:17 PM) Bill Reed: yes, Jon
			 * 
			 * 
			 * so we only looking for front and back pieces, ignoring the middle bits.
			 */
			
			var front = path.length>=0 ? path[0] : path;
			var back = path.length>=0 ? path[path.length-1] : path;
			var metadata = this.cache[front] ; 
			if(metadata && metadata[back])
				return metadata[back];
			
			if(!this._fullyLoaded()){
				this._cacheNext();
				return this.getMetaData(type);
			}
			return null;
	}
});

});