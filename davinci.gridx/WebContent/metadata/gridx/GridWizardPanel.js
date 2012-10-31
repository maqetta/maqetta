define(
[
	"dojo/_base/declare"
],
function(declare) {

return declare(null, {
	getStepLabel: function() {
		return null;
	},
	populate: function(context) {  
		//Mark as populated
		this._isPopulated = true;
	},
	
	unpopulate: function() {  
		//Mark as unpopulated
		this._isPopulated = false;
	},
	
	isPopulated: function() {
		return this._isPopulated;
	},
	
	isValid: function() {
		return true;
	},
	
	isDirty: function() {
		return false;
	},
	
	_checkValidity: function() {
		var result = true;
		var paneValidity = this.isValid();
		switch(typeof paneValidity){
			case "boolean":
				valid = paneValidity;
				break;
			case "string":
				result = false;
				break;
		}
		return result;
	},
});
});