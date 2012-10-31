define([
	"davinci/Runtime",
	"./Color"
], function(Runtime, Color) {

return {
	getColor: function(/*string*/ email) {
		var index;
		dojo.some(Runtime.reviewers, function(item, n) {
			if (item.email == email) {
				index = n;
				return true;
			}
			return false;
		});
		return Color.colors[index];
	}
};
});