define([
	    "dojo/_base/declare"
], function(declare){
	
return declare("davinci.review.Color", null, {
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

davinci.review.colors = new davinci.review.Color();

});
