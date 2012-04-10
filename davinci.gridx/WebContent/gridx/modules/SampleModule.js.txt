define('dojox/grid/gridx/modules/TestMod', [
'dojo',
'dojox/grid/gridx/core/_Module'
//Add more requirements here
], function(dojo, _Module){

//If there is some oppotunity that this module could be depended on by some other module (e.g.: moduleB),
//then it's recommended to register it, so that users won't need to explictly declare this module
//when he is declaring that moduleB.
return gridx.core.register(
//Note there's a little trick here: dojo.declare returns the class function itself

dojo.declare('gridx.modules.TestMod', _Module, {
	// [Module Dependency Management] --------------------------------------------
	
	//Every module needs a name. 
	//It could be the same as another module's, which means that module's public API is the same as this one's.
	//If this name is omitted, the long class name will be used ('gridx.modules.TestMod' in this case),
	name: 'myTestMod',	
	
	//Forced dependency modules must also exist if this module exists. 
	//They also need to be loaded before this module. 
	forced: ['header'],
	
	//Required dependency modules must also exist if this module exists.
	//But they don't need to finish loading before this one.
	required: ['vLayout'],
	
	//Optional dependency modules do not need to exist if this module exists.
	//But if they do exist, they must be loaded before this one.
	optional: ['someCoolMod'],
	
	// [Module API Management] ---------------------------------------------------
	
	getAPIPath: function(){
		//This method defines how to access this module's API from the grid widget.
		//Anything returned from this function is 'deeply' mixed into grid.
		//For this example, we'll be able to call:
		//		grid.testMod.testRow('someRowID');
		
		//If some other module needs to extend the APIs in namespace grid.testMode,
		//it can also provide this method in exact the same way, because the mixing in
		//process is performed layer by layer (deeply).
		
		//You can even directly add methods to grid: 
		//		return {
		//			newMethodForGrid: function(){...}
		// 		};
		
		return {
			testMod: this
		};
	},
	
	rowMixin: {
		//WARNING! This is (usually) a class level object instead of a function.
		//This object should only contain functions.
		//This object will be mixed into the row object created by grid.row(),
		//so that users can benifit from this module by grid.row(0).test();
		test: function(){
			//WARNING! This method is run in the scope of the row object, instead of this module.
			//Calling this module's public API is recommended, which also ensures the consistency of
			//the API set.
			this.grid.testMod.testRow(this.id);
			
			//Returning this row object makes function chain possible.
			return this;
		}
	},
	
	columnMixin: {
		//Same things can be done for column objects. Note as long as the grid has a method that returns
		//some kind of object, that method's name (e.g.: foo) can be used here as a 'fooMixin'.  
		test: function(){
			this.grid.testMod.testColumn(this.id);
			return this;
		}
	},
	
	// [Module Lifetime Management] -----------------------------------------------
	preload: function(args){
		//This is called after all modules are created, but not loaded yet. Dependancy sequence is not hornored here.
	},

	load: function(args, deferStartup){
		//do something in grid's postCreate
		//All grid methods and all existing module methods are available here, 
		//although some modules have not been bootstraped.
		
		//Call the register method of module 'layout'.
		//This statement can be read as: 
		//		When this module is loaded, hook this.domNode to grid.headerNode with priority 5
		//Note the priority of the header module is 0, so this UI will be after the header.
		//If priority is negative, then the node will be before the header.
		this.grid.layout.register(this, 'domNode', 'headerNode', 5);
		
		//Also, we can hook another node to another hook point.
		this.grid.layout.register(this, 'anotherNode', 'footerNode', -5);
		
		//Feel free to connect any mouse events here:
		this.connect(this.grid, 'onHeaderCellDblClick', function(e){
			this.testColumn(e.columnId);
		});
		
		//Even the event relates to some module that is not in our dependency list!
		this.connect(this.grid, 'onRowDblClick', function(e){
			this.testColumn(e.rowId);
		});
		
		var node = this.domNode = dojo.create('div');
		//do something to initialize the 'node' here.
		node.innerHTML = "Test Module!";
		
		var _this = this;
		deferStartup.then(function(){
			//do something after grid is started up. 
			//Now the grid's domNode is already in DOM tree,
			//and all the modules (even those that are not in our dependency list) 
			//that can be initialized before grid startup have been totally ready.
			
			//Also, you can do some other things to initialize the 'node' here.
			
			//Hey! I'm done! I've fully loaded myself!
			_this.loaded.callback();
		});
	},
	
	destroy: function(){
		this.inherited(arguments);
		//do something to tear me down here.
		//e.g.: dojo.destroy(this.domNode);
	},
	
	// [Public API] --------------------------------------------------------
	testRow: function(id){
		//Do actual work here
		console.log("testing row: ", id);
	},
	
	testColumn: function(id){
		//Do actual work here
		console.log("testing column: ", id);
	}
	
	// [Private methods] -------------------------------------------------------
	//.......
}));	
});
