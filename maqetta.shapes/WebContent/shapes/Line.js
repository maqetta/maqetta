define([
    	"dojo/_base/declare",
    	"shapes/_Shape",
    	"shapes/_PathMixin"
], function(declare, _Shape, _PathMixin){
	
	return declare("shapes.Line", [_Shape, _PathMixin], {
			
		points:'0,0,100,0',
		startarrow:'none',
		endarrow:'none',	

		buildRendering: function(){
			this.inherited(arguments);
			
			var default_arr = [0,0,100,0];
			var comma_to_space = this.points.replace(/,/g,' ');
			var arr = comma_to_space.split(' ');
			if(arr.length<4){
				console.error('invalid points array - at least 4 values required');
				arr = default_arr;
			}
			this._points = [];
			for(var i=0,j=0; i<(arr.length-1); i+=2,j++){
				this._points[j]={x:arr[i]-0,y:arr[i+1]-0}; // -0 to convert to number
			}	
			
			//this.createGraphics();
		}

	});
});
