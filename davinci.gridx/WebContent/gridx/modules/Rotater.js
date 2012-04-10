define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-geometry",
	"../core/_Module"
], function(kernel, declare, domGeometry, _Module){
	kernel.experimental('gridx/modules/Rotater');
	return _Module.register(
	declare( _Module, {
		name: "rotater",
		
		getAPIPath: function(){
			return {
				rotater: this
			};
		},

		constructor: function(){
			this.connect(this.grid, "resize", this.resize);
		},

		resize: function(size){
			var grid = this.grid;
			if(size){
				// TODO: basic resize function should be in Grid itself?
				domGeometry.setMarginBox(grid.domNode, size);
			}else{
				size = domGeometry.getMarginBox(grid.domNode);
			}
			if(size.w){
				domGeometry.setMarginBox(grid.bodyNode, {w: size.w});
			}

			var landscape = size.w && size.h && size.w > size.h;
			if(grid.landscapeStructure && this._landscape != landscape){
				this._landscape = landscape;
				var structure = landscape ? grid.landscapeStructure : grid.structure;
				grid.setColumns(structure);
				grid.header.refresh();
				grid.body.refresh();
			}
		}
	}));
});
