dojo.provide("davinci.ve.widgets.BorderRadius");
dojo.require("davinci.ve.widgets.Trblbox");

dojo.declare("davinci.ve.widgets.BorderRadius", [davinci.ve.widgets.Trblbox], {
	
	shorthand : null,
	
	values :  null,
	
	alias : null,
	
	buildRendering: function(){
		
		if(this.values==null)
			this.values = ['', '0px', '1em'];
			               
		this.pageTemplate = [{display:"<b>(border-radius)</b>", type:"multi", target:['border-radius','-moz-border-radius'],  values:this.values},
		                     {display:"show details", type:"boolean"},
		                     {display:"border-top-left-radius", type:"multi", target:["border-top-left-radius",'-moz-border-radius-topleft'], values:this.values},
		                     {display:"border-top-right-radius", type:"multi", target:['border-top-right-radius','-moz-border-radius-topright'] , values:this.values},
		                     {display:"border-bottom-right-radius", type:"multi", target:['border-bottom-right-radius','-moz-border-radius-bottomright'] , values:this.values},
		                     {display:"border-bottom-left-radius", type:"multi", target:['border-bottom-left-radius','-moz-border-radius-bottomleft'] , values:this.values}

		                     ],
	
	
		this.inherited(arguments);
	}	
	
		
	
});