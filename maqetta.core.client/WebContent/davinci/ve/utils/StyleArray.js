define([
], function() {
	
return /** @scope davinci.ve.utils.StyleArray */ {

	/**
	 * Merge two styleArray structures set1 and set2 such that set2 overrides values in set1 
	 */
	mergeStyleArrays: function(set1, set2) {
		if(!set1){
			set1 = [];
		}
		if(!set2){
			set2 = [];
		}
		var oldValues = dojo.clone(set1);
		// Remove properties from oldValues that are in set1
		for(var i=0;i<set2.length;i++){
			for(var name1 in set2[i]){	// should only have one property
				for(j=oldValues.length-1; j>=0; j--){
					var oldItem = oldValues[j];
					for(var name2 in oldItem){	// should only have one property
						if(name1==name2){
							oldValues.splice(j, 1);
							break;
						}
					}
				}
			}
		}
		//FIXME: need to sort values, taking shorthands into account
		var newValues = oldValues.concat(set2);
		return newValues;
	}
};
});
