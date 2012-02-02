system.resource.alphabeticalSort = function(items){
	return items.sort(function(a,b) {
		a = a.name.toLowerCase();
		b = b.name.toLowerCase();
		return a < b ? -1 : (a > b ? 1 : 0);
	});
};