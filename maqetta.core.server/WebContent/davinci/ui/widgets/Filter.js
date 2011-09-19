dojo.provide("davinci.ui.widgets.Filter");


dojo.declare("davinci.ui.widgets.Filter", null, {
	// return true if item should be filtered out
	//    purposely commented out so filter object doesnt need to have this method
	// filterItem : function (item) {return false;}
	
	// return a filtered list
	//    purposely commented out so filter object doesnt need to have this method
	// filterList : function (list) {return list;}
	onFilterChange : function ()
	{}
});

davinci.ui.widgets.Filter.alphabeticalFilter = {
     filterList : function(list)
    {
	    return list.sort();
    }
}