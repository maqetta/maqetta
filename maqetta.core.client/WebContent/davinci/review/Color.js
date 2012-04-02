define([
	"dojo/_base/declare"
], function(declare){

var Color = declare("davinci.review.Color", null, {
	colors:[
	        "firebrick",
	        "darkblue",
	        "darkgreen",
	        "purple",
	        "darkorange",
	        "darkgoldenrod",
	        "brown",
	        "darkgreen",
	        "darkcyan",
	        "deeppink"
	        ]
});

return dojo.setObject("davinci.review.colors", new Color());

});
