var listCtl, repeatModel, setRef, nextIndexToAdd, selectedIndex, nameCtl;
var setRef, setDetailsContext, insertResult, updateView, updateModel, addEmpty, remove;

require(['dojo/has',
	'dojox/mobile/parser',
	//'dojo/parser',
	'dojo/ready',
	'dijit/registry', 
	'dojox/mvc/at',
	'dojox/mvc',
	'dojox/mvc/getStateful',
	'dojox/mvc/EditStoreRefListController',
	'dojox/mvc/EditStoreRefController',
	"dojo/store/Memory",
	"dojo/when",
	'dojox/mobile',
	'dojox/mobile/ScrollableView',
	'dojox/mobile/Button',
	'dojox/mobile/TextArea',
	'dojox/mvc/Group',
	'dojox/mvc/Output',
	'dojox/mvc/Generate',
	'dojox/mvc/Repeat',
	'dojox/mobile/TextBox',
	'dojox/mobile/CheckBox',
	'dojox/mobile/ViewController',
	'dojox/mobile/FixedSplitter',
	'dojox/mobile/EdgeToEdgeList',
	'dojox/mobile/EdgeToEdgeCategory',
	'dojox/mobile/deviceTheme',
	'dojox/mobile/RoundRectCategory',
	'dojox/mobile/Heading',
	'dojo/_base/json',
	'dojo/dom'
], function(has, parser, ready, registry, at, mvc, getStateful, EditStoreRefListController, 
		EditStoreRefController, Memory, when, mobile, ScrollableView, Button, 
		TextArea, Group, Output, Generate, Repeat, TextBox, CheckBox, ViewController,
		FixedSplitter, EdgeToEdgeList, EdgeToEdgeCategory, deviceTheme, RoundRectCategory, 
		Heading, json, dom){

	if(!has("webkit")){
		require(["dojox/mobile/compat"]);
	}

	window.at = at;
	
	var names = [{
	"id" 	 : "360324",
	"Serial" : "360324",
	"First"  : "John",
	"Last"   : "Doe",
	"Email"  : "jdoe@us.ibm.com",
	"ShipTo" : {
		"Street" : "123 Valley Rd",
		"City"   : "Katonah",
		"State"  : "NY",
		"Zip"    : "10536"
	},
	"BillTo" : {
		"Street" : "17 Skyline Dr",
		"City"   : "Hawthorne",
		"State"  : "NY",
		"Zip"    : "10532"
	}
}];

// Initial repeat data used in the Repeat Data binding demo
var repeatData = [ 
	{
		"First"   : "Chad",
		"Last"    : "Chapman",
		"Location": "CA",
		"Office"  : "1278",
		"Email"   : "c.c@test.com",
		"Tel"     : "408-764-8237",
		"Fax"     : "408-764-8228"
	},
	{
		"First"   : "Irene",
		"Last"    : "Ira",
		"Location": "NJ",
		"Office"  : "F09",
		"Email"   : "i.i@test.com",
		"Tel"     : "514-764-6532",
		"Fax"     : "514-764-7300"
	},
	{
		"First"   : "John",
		"Last"    : "Jacklin",
		"Location": "CA",
		"Office"  : "6701",
		"Email"   : "j.j@test.com",
		"Tel"     : "408-764-1234",
		"Fax"     : "408-764-4321"
	}
];

	selectedIndex = 0;

	//model = getStateful(names );
	//nameCtl = new EditStoreRefController({store: new Memory({data: names})});
	nameCtl = new EditStoreRefListController({store: new Memory({data: names})});
	//nameCtl.queryStore();
	nameCtl.getStore("360324");
	model = nameCtl.model;
	
	//listCtl = new EditStoreRefListController({model: getStateful(repeatData ), cursorIndex: 0});
	listCtl = new EditStoreRefListController({store: new Memory({data: repeatData}), cursorIndex: 0});
	when(listCtl.queryStore(), function(model){
		//repeatmodel = listCtl.model;
		repeatmodel = model;
		nextIndexToAdd = repeatmodel.length;
	});
	
	


	// used in the Repeat Data binding demo
	setDetailsContext=function(index){
		listCtl.set("cursorIndex", index);
		registry.byId("firstInput").focus();
	};


	addEmpty = function(){
		var data = {id:Math.random(), "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "",
					"Tel": "", "Fax": ""};
		repeatmodel.push(new getStateful(data));
		var r = registry.byId("repeat");
		r.performTransition("repeatdetails", 1, "none");
		setDetailsContext(repeatmodel.length-1);
	},

	remove = function(idx){
		repeatmodel.splice(idx, 1);
		if(listCtl.get("cursorIndex") > repeatmodel.length-1){
			listCtl.set("cursorIndex", repeatmodel.length - 1);
		}
	},

	
	// used in the Repeat Data binding demo
	insertResult = function(index){
		if (repeatmodel[index-1].First.value !== ""){ // TODO: figure out why we are getting called twice for each click
			var insert = mvc.newStatefulModel({ "data" : {
			"First"   : "",
			"Last"    : "",
			"Location": "CA",
			"Office"  : "",
			"Email"   : "",
			"Tel"     : "",
			"Fax"     : ""} 
			});
			repeatmodel.add(index, insert);
			setDetailsContext(index);
			nextIndexToAdd++;
		}else{
			setDetailsContext(index-1);                 
		}
	};

	// used in the Generate View demo
	var genmodel;
	updateView = function() {
		try {
			registry.byId("view").set("children", at('widget:modelArea', 'value').direction(at.from).transform({format: dojo.fromJson}));
			dom.byId("outerModelArea").style.display = "none";
			dom.byId("viewArea").style.display = "";              		
		}catch(err){
			console.error("Error parsing json from model: "+err);
		}
	};

	// used in the Generate View demo
	updateModel = function() {
		dom.byId("outerModelArea").style.display = "";
		try {
			dom.byId("modelArea").focus(); // hack: do this to force focus off of the textbox, bug on mobile?
			dom.byId("viewArea").style.display = "none";
			var test = registry.byId("view");
			registry.byId("modelArea").set("value",(json.toJson(test.get("children"), true)));
		} catch(e) {
			console.log(e);
		};
	};


	// when "dojo/ready" is ready call parse
	ready(function(){
		parser.parse();
	});

	// when domReady! is ready show the page 
	require(['dojo/domReady!'], function(){
		dom.byId("wholepage").style.display = "";
	});

}); // end function

function setRef(id, model, attr) {
	require([
	         "dijit/registry",
	         "dojox/mvc/at"
	         ], function(registry, at){
					var widget = registry.byId(id);
					widget.set("target", at(model,attr));
				});
};
