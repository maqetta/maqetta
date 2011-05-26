define(["dojo", "dijit", "dijit/_WidgetBase"], function(dojo, dijit){
	return dojo.declare("dojox.mvc.Group", [dijit._WidgetBase], {
		// summary:
		//		A simple model-bound container widget with single-node binding to a data model.
		//
		// description:
		//		A group is usually bound to an intermediate dojo.Stateful node in the data model.
		//		Child dijits or custom view components inside a group inherit their parent
		//		data binding context from it.
	});
});
