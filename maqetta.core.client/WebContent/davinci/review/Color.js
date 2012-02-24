define([
	    "dojo/_base/declare"
], function(declare){
	
var Color = declare("davinci.review.Color", null, {
	colors:[
	        "red",
	        "blue",
	        "green",
	        "purple",
			"orange",
	        "yellow",
	        "brown",
	        "darkgreen",
	        "cyan"
	        ]
});

return dojo.setObject("davinci.review.colors", new Color());

});
