define([
], function() {
	
return /** @scope davinci.ve.utils.StyleArray */ {

	/**
	 * Merge two styleArray structures set1 and set2 such that set1 overrides values in set2 
	 */
	mergeStyleArrays: function(set1, set2) {
		var oldValues = dojo.clone(set2);
		// Remove properties from oldValues that are in set1
		for(var i=0;i<set1.length;i++){
			for(var name1 in set1[i]){	// should only have one property
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
		var newValues = set1.concat(oldValues);
		return newValues;
	}
};
});
