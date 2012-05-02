define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/json",
	"dojo/_base/unload",
	"dojo/cookie",
	"../../static/lib/gridx/1.0/modules/Persist",
	"../../static/lib/gridx/1.0/core/_Module"
], function(declare, array, lang, json, unload, cookie, Persist, _Module){

	return _Module.register(
	declare(Persist, {
		_persistedValue: null,
		
		put: function(key, value, options){
			// summary:
			//		This is NOT a public method, but GridX docs say we can override. This function 
			//		is called when finally saving things into some kind of storage. But, we don't have
			//		a need (or desire) to place this value in a cookie like superclass does.
			// key: String
			//		The persist key of this grid.
			// value: Object
			//		A JSON object, containing everything we want to persist for this grid.
			
			//We're not persisting this into any kind of store, so don't care about the key
			this.persistedValue = value;
		},
	
		get: function(key){
			// summary:
			//		This is NOT a public method, but GridX docs say we can override. This 
			//		function is called when loading things from storage. In our case, we're
			//		not using persistence, so we don't have to load from anywhere.
			// return: Object
			//		The value stored before.

			//We're not retrieving this from any kind of store, so don't care about the key
			return this.persistedValue;
		}
	}));
});
