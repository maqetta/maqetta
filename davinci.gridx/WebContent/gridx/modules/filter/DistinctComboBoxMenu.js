define([
"dojo/_base/declare",
'dijit/form/_ComboBoxMenu'
], function(declare, _ComboBoxMenu){
	return declare(_ComboBoxMenu, {
		createOptions: function(results, options, labelFunc){
			var hash = {};
			arguments[0] = results.filter(function(item){
				var label = labelFunc(item).label;
				if(hash[label]){return false;}
				else{return hash[label] = true;}
			});
			this.inherited(arguments);
		}
	});
});