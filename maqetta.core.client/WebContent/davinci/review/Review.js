define([
	"davinci/Runtime",
	"./Color"
], function(Runtime, Color) {

return {
	getColor: function(/*string*/ name) {
		var index;
		dojo.some(Runtime.reviewers, function(item, n) {
			if (item.name == name) {
				index = n;
				return true;
			}
			return false;
		});
		return Color.colors[index];
	}
};
});