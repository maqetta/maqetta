define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/Deferred",
	"dojo/_base/connect"
], function(declare, lang, array, Deferred, connect){
	
var isFunc = lang.isFunction,
	c = 'connect',	//To reduce code size

	moduleBase = declare(/*===== "gridx.core._Module", =====*/[], {
	/*=====
		// name: String
		//		The API set name of this module. This name represents the API set that this module implements, 
		//		instead of this module itself. Two different modules can have the same name, so that they provide
		//		two different implementations of this API set.
		//		For example, simple row selection and extended row selection are two modules implementing a same set of APIs.
		//		They can be used in two different grids in one page (maybe due to different requirements), 
		//		without worrying about conflicting with eachother. And any module of grid can be replaced by a new implementation
		//		without re-writing any other modules.
		//		This property is mandatary.
		name: "SomeModule",
		
		// forced: String[] 
		//		An array of module names. All these modules must exist, and have finished loading before this module loads.
		//		This property can be omitted.
		forced: [],
		
		// optional: String[] 
		//		An array of module names. These modules can be absent, but if they do exist, 
		//		they must be loaded before this module loads.
		//		This property can be omitted.
		optional: [],
		
		// required: []
		//		An array of module names. These modules must exist, but they can be loaded at any time.
		//		This property can be omitted.
		required: [],

		getAPIPath: function(){
			// summary: 
			//		This function defines how to access this module's methods from the grid object.
			// description:
			//		The returned object of this function will be "recursively" mixed into the grid object.
			//		That is, any property of object type in grid will be preserved. For example, if this function
			//		returns { abc: { def: 'ghi'} }, and the grid already has a property called "abc", and 
			//		grid.abc is { jkl: 'mno'}. Then after mixin, grid.abc will still have this jkl property:
			// |	{
			// |		abc: {
			// |			jkl: 'mno',
			// |			def: 'ghi'
			// |		}
			// |	}
			//		This mechanism makes it possible for different modules to provide APIs to a same sub-API object.
			//		Sub-API object is used to provide structures for grid APIs, so as to avoid API conflicts as much as possible.
			//		This function can be omitted.
			return {}
		},

		preload: function(args){
			// summary:
			//		Preload this module.
			// description:
			//		If this function exists, it is called after all modules are created ("new"-ed), but not yet loaded.
			//		At this time point, all the module APIs are already accessable, so all the mothods of those modules that
			//		do not need to load can be used here.
			//		Note that this function is not the "load" process, so the module dependancy is not honored. For example,
			//		if module A forcedly depends on module B, it is still possible that module A.preload is called before 
			//		module B.preload.
			//		This function can be omitted.
		},

		load: function(args, deferStartup){
			// summary: 
			//		Completely load this module.
			// description:
			//		This is the formal loading process of this module. This function will not be called until all the "forced"
			//		and existing "optional" modules are loaded. When the loading process of this module is finished (Note that
			//		this might be an async process), this.loaded.callback() must be called to tell any other modules that
			//		depend on this module.
			this.loaded.callback();
		},

		// grid: gridx.Grid
		//		Reference to the grid
		grid: null,
		
		// model: gridx.core.model.Model
		//		Reference to the grid model
		model: null,

		// loaded: dojo.Deferred
		//		Indicate when this module is completely loaded.
		loaded: null,
	=====*/
	
		constructor: function(grid, args){
			var t = this;
			t.grid = grid;
			t.model = grid.model;
			t.loaded = new Deferred;
			t._cnnts = [];
			t._sbscs = [];
			lang.mixin(t, args);
		},

		destroy: function(){
			var f = array.forEach;
			f(this._cnnts, connect.disconnect);
			f(this._sbscs, connect.unsubscribe);
		},

		arg: function(argName, defaultValue, validate){
			// summary:
			//		This method provides a normalized way to access module arguments.
			// description:
			//		There are two ways to provide module arguments when creating grid.
			//		One is to write them in the module declaration object:
			// |	var grid = new Grid({
			// |		......
			// |		modules: [
			// |			{
			// |				moduleClass: gridx.modules.Pagination,
			// |				initialPage: 1		//Put module arguments in module declaration object
			// |			}
			// |		],
			// |		......
			// |	});
			//		This way is straightforward, but quite verbose. And if user would like to set arguments 
			//		for pre-included core modules (e.g. Header, Body), he'd have to explictly declare the
			//		module. This would be too demanding for a grid user, so we need another approach.
			//		The other way is to treat them as grid arguments:
			// |	var grid = new Grid({
			// |		......
			// |		modules: [
			// |			gridx.modules.Pagination
			// |		],
			// |		paginationInitialPage: 1,	//Treat module arguments as grid arguments
			// |		......
			// |	});
			//		In this way, there's no need to provide a module declaration object, but one has to tell
			//		grid for which module the arguments is applied. One can simply put the module name at the
			//		front of every module argument:
			//			"pagination" -- module name
			//			"initialPage" -- module argument
			//			---------------------------------
			//			paginationInitialPage -- module argument treated as grid argument
			//		Note the first letter of the module arugment must be capitalized in the combined argument.
			//
			//		This "arg" method makes it possible to access module arguments without worring about where
			//		they are declared. The priority of every kinds of declarations are:
			//			Module argument > Grid argument > default value > Base class argument (inherited)
			//		After this method, the argument will automatically become module argument. But it is still
			//		recommended to alway access arguments by this.arg(...);
			// argName: String
			//		The name of this argument. This is the "short" name, not the name prefixed with module name.
			// defaultValue: anything?
			//		This value will by asigned to the argument if there's no user provided values.
			// validate: Function?
			//		This is a validation function and it must return a boolean value. If the user provided value
			//		can not pass validation, the default value will be used.
			//		Note if this function is provided, defaultValue must also be provided.
			// returns:
			//		The value of this argument.
			if(arguments.length == 2 && isFunc(defaultValue)){
				validate = defaultValue;
				defaultValue = undefined;
			}
			var t = this, g = t.grid, r = t[argName];
			if(!t.hasOwnProperty(argName)){
				var gridArgName = t.name + argName.substring(0, 1).toUpperCase() + argName.substring(1);
				if(g[gridArgName] === undefined){
					if(defaultValue !== undefined){
						r = defaultValue;
					}
				}else{
					r = g[gridArgName];
				}
			}
			t[argName] = (validate && !validate(r)) ? defaultValue : r;
			return r;	//anything
		},

		connect: function(obj, e, method, scope, flag){
			// summary:
			//		Connect an event handler to an event or function.
			// description:
			//		Similar to widget.connect, the scope of the listener will be default to this module.
			//		But in this API, the scope argument is placed behind the listener function, so as to
			//		avoid arguemnt checking logic.
			//		This method also allows conditional event firing using the flag argument.
			// obj: Object
			// e: String
			// method: String|Function
			// scope: Object?
			// flag: Anything
			//		If provided, the listener will only be triggered when grid._eventFlags[e] is set to flag.
			// returns:
			//		The connect handle
			var t = this, cnnt, g = t.grid, s = scope || t;
			if(obj === g && typeof e == 'string'){
				cnnt = connect[c](obj, e, function(){
					var a = arguments;
					if(g._eventFlags[e] === flag){
						if(isFunc(method)){
							method.apply(s, a);
						}else if(isFunc(s[method])){
							s[method].apply(s, a);
						}
					}
				});
			}else{
				cnnt = connect[c](obj, e, s, method);
			}
			t._cnnts.push(cnnt);
			return cnnt;	//Object
		},

		batchConnect: function(){
			// summary:
			//		Do a lot of connects in a batch.
			// description:
			//		This method is used to optimize code size.
			for(var i = 0, args = arguments, len = args.length; i < len; ++i){
				if(lang.isArrayLike(args[i])){
					this[c].apply(this, args[i]);
				}
			}
		},

		subscribe: function(topic, method, scope){
			// summary:
			//		Subscribe to a topic.
			// description:
			//		This is similar to widget.subscribe, except that the "scope" argument in this method is behind the listener function.
			// returns:
			//		The subscription handle
			var s = connect.subscribe(topic, scope || this, method);
			this._sbscs.push(s);
			return s;	//Object
		}
	}),
	mods = moduleBase._modules = {};
	
	moduleBase.register = function(modClass){
		var p = modClass.prototype;
		return mods[p.name || p.declaredClass] = modClass;
	};
	//! means not string, should be 'eval'ed.
	moduleBase._markupAttrs = ['id', 'name', 'field', 'width', 'dataType', '!formatter', '!decorator', '!sortable'];
	
	return moduleBase;
});
