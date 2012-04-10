define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"../../core/_Module",
	"./Avatar",
	"./_Dnd"
], function(declare, array, lang, _Module, Avatar){

	return declare(_Module, {
		delay: 2,
	
		enabled: true,

		canRearrange: true,

		copyWhenDragOut: false,

		avatar: Avatar,

		preload: function(args){
			var dnd = this.grid.dnd._dnd;
			dnd.register(this.name, this);
			dnd.avatar = this.arg('avatar');
		},

		checkArg: function(name, arr){
			var arg = this.arg(name);
			return (arg && lang.isObject(arg)) ? array.some(arr, function(v){
				return arg[v];
			}) : arg;
		}
	});
});
