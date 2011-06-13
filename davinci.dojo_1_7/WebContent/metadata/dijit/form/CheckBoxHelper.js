dojo.provide("davinci.libraries.dojo.dijit.form.CheckBoxHelper");

dojo.declare("davinci.libraries.dojo.dijit.form.CheckBoxHelper", null, {

	getPropertyValue: function(/*Widget*/ widget, /*String*/ name){
		// summary:
		//		Overriden to return the checkbox's value directly instead of calling attr("value")
		//
		if(!widget){
			return undefined;
		}

		if(name == "value"){
			return widget.dijitWidget.value;
		}else{
			return widget._getPropertyValue(  name);
		}		
	}

});