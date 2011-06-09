var repeatModel, setRef, nextIndexToAdd, selectedIndex;
var setRef, setDetailsContext, insertResult, updateView, updateModel;

require([
	'dojox/mobile/parser',
	'dojox/mvc',
	'dojox/mobile',
	'dojox/mobile/ScrollableView',
	'dojox/mobile/Button',
	'dojox/mobile/TextArea',
	'dojox/mvc/Group',
	'dojox/mvc/Generate',
	'dojox/mvc/Repeat',
	'dojox/mobile/TextBox',
	'dojox/mobile/ViewController',
	'dojox/mobile/FixedSplitter',
	'dojox/mobile/EdgeToEdgeList',
	'dojox/mobile/EdgeToEdgeCategory',
	'dojox/mobile/deviceTheme',
	'dojox/mobile/RoundRectCategory',
	'dojox/mobile/Heading'
], function(){
	require([
	         "dojox/mobile/compat"
	]);

	var names = {
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
};

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

model = dojox.mvc.newStatefulModel({ data : names });
repeatmodel = dojox.mvc.newStatefulModel({ data : repeatData });
nextIndexToAdd = repeatmodel.data.length;

 // used in the Ship to - Bill to demo
setRef = function(id, addrRef) {
	var widget = dijit.byId(id);
	widget.set("ref", addrRef);
}

// used in the Repeat Data binding demo
setDetailsContext = function(index){
	selectedIndex = index;
	var groupRoot = dijit.byId("detailsGroup");
	groupRoot.set("ref", index);
}

// used in the Repeat Data binding demo
insertResult = function(index){
	if (repeatmodel[index-1].First.value !== ""){ // TODO: figure out why we are getting called twice for each click
		var insert = dojox.mvc.newStatefulModel({ "data" : {
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
		var modeldata = dojo.fromJson(dojo.byId("modelArea").value);
		genmodel = dojox.mvc.newStatefulModel({ data : modeldata });
		dijit.byId("view").set("ref", genmodel);
		dojo.byId("outerModelArea").style.display = "none";
		dojo.byId("viewArea").style.display = "";              		
	}catch(err){
		console.error("Error parsing json from model: "+err);
	}
};

// used in the Generate View demo
updateModel = function() {
	dojo.byId("outerModelArea").style.display = "";
	try {
		dojo.byId("modelArea").focus(); // hack: do this to force focus off of the textbox, bug on mobile?
		dojo.byId("viewArea").style.display = "none";
		dijit.byId("modelArea").set("value",(dojo.toJson(genmodel.toPlainObject(), true)));
	} catch(e) {
		console.log(e);
	};
};


// The dojox.mvc.StatefulModel class creates a data model instance
// where each leaf within the data model is decorated with dojo.Stateful
// properties that widgets can bind to and watch for their changes.

require(['dojo/domReady!'], function(){
			dojox.mobile.parser.parse();
		});

dojo.addOnLoad(function() {
			dojo.byId("wholepage").style.display = "";
});

}); // end function

