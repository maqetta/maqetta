define([], function(){
	return {
		stopEvent: function(evt){
			if(evt && evt.stopPropagation && evt.preventDefault){
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		biSearch: function(arr, comp){
			var i = 0, j = arr.length, k;
			for(k = Math.floor((i + j) / 2); i + 1 < j; k = Math.floor((i + j) / 2)){
				if(comp(arr[k]) > 0){
					j = k;
				}else{
					i = k;
				}
			}
			return arr.length && comp(arr[i]) >= 0 ? i : j;
		}
	};
});
