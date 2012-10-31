define(["dojo/_base/declare",
        
        "dojo/data/ItemFileReadStore",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common"
        
       
],function(declare, ItemFileReadStore){

	var fontStore = declare("davinci.ve.widgets.FontDataStore", ItemFileReadStore, {
		_allValues : [],
		
		
		
		constructor: function(args){
		
			this.setValues(args.values || davinci.ve.widgets.FontDataStore.fonts);
		},
	
		setValues: function(values){
			
			this._allValues = this._allValues.concat(values);
		
			this._jsonData = {label: "name", identifier:"value", items: this._allValues};
			
			this._loadFinished = false;
		},
		
		contains : function(value){
			for(var i = 0;i<this._allValues.length;i++){
				
				if(this._allValues[i].value  == value)
					return i;
				
				if(this._allValues[i].name  == value)
					return i;
				
			}
			return false;
		},
			clearValues : function(){
			this._allValues = [];
			this._loadFinished = false;
			
		},
		
		lookupValue : function (itemName){
			var index = this.contains(itemName);
			return this._allValues[index].value[0];
		}
	
		
	});
	return dojo.mixin(fontStore, {fonts :

	[	{name:"", value:""},
		{name:"Arial,Helvetica,sans-serif", value:"Arial,Helvetica,sans-serif"},
		{name:"'Arial Black,Gadget',sans-serif", value:"'Arial Black,Gadget',sans-serif"},
		{name:"'Comic Sans MS',cursive", value:"'Comic Sans MS',cursive"},
		{name:"'Courier New',Courier,monospace", value:"'Courier New',Courier,monospace"},
		{name:"Geneva,Tahoma,sans-serif", value:"Geneva,Tahoma,sans-serif"},
		{name:"Georgia,serif", value:"Georgia,serif"},
		{name:"'Helvetica,Trebuchet MS',sans-serif", value:"'Helvetica,Trebuchet MS',sans-serif"},
		{name:"Impact,Charcoal,sans-serif", value:"Impact,Charcoal,sans-serif"},
		{name:"'Lucida Console',Monaco,monospace", value:"'Lucida Console',Monaco,monospace"},
		{name:"'Lucida Sans Unicode','Lucida Grande',sans-serif", value:"'Lucida Sans Unicode','Lucida Grande',sans-serif"},
		{name:"'Lucida Console', Monaco, monospace", value:"'Lucida Console', Monaco, monospace"},
		{name:"'Palatino Linotype','Book Antiqua',Palatino,serif", value:"'Palatino Linotype','Book Antiqua',Palatino,serif"},
		{name:"Symbol", value:"Symbol"},
		{name:"Tahoma,Geneva,sans-serif", value:"Tahoma,Geneva,sans-serif"},
		{name:"'Times New Roman',Times,serif", value:"'Times New Roman',Times,serif"},
		{name:"'Trebuchet MS',Helvetica,sans-serif", value:"'Trebuchet MS',Helvetica,sans-serif"},
		{name:"Verdana,Geneva,sans-serif", value:"Verdana,Geneva,sans-serif"},
		{name:"Webdings", value:"Webdings"},
		{name:"Wingdings, 'Zapf Dingbats'", value:"Wingdings, 'Zapf Dingbats'"},
		{name:"'Zapf Dingbats', Wingdings", value:"'Zapf Dingbats', Wingdings"},
		{name:"sans-serif", value:"sans-serif"},
		{name:"serif", value:"serif"},
		{name:"monospace", value:"monospace"},
		{name:"cursive", value:"cursive"}
	]})
});


