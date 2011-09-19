dojo.provide("davinci.ve.util");


davinci.ve._add = function(array, value){
	var index = dojo.indexOf(array, value);
	if(index < 0){
		array.push(value);
	}
};

davinci.ve._remove = function(array, value){
	var index = dojo.indexOf(array, value);
	if(index >= 0){
		array.splice(index, 1);
	}
};

davinci.ve._equals = function(array1, array2, func){
	if(array1 == array2){
		return true;
	}
	if(!array1 || !array2){
		return false;
	}
	if(array1.length != array2.length){
		return false;
	}
	for(var i = 0; i < array1.length; i++){
		if(func){
			if(!func(array1[i], array2[i])){
				return false;
			}
		}else{
			if(array1[i] != array2[i]){
				return false;
			}
		}
	}
	return true;
};
