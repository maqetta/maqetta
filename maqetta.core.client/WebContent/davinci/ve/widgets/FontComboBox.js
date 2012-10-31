define(["dojo/_base/declare",
        
        "dijit/form/ComboBox",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common"
        
       
],function(declare, ComboBox){
	return declare("davinci.ve.widgets.FontComboBox", ComboBox, {
		/*
		 *  dojo.form.ComboBox when used with a data store only uses the search attribute for 
		 *  setting the Name and Value fields of the comboBox in the case of FontDataStore the 
		 *  searchAttribute is name. But we want the to display to the user the name feild from the 
		 *  data store and use the date store item value field to set the css font. 
		 *  So we override the default behaviors of the getters and setters.
		 */	
		_getValueAttr: function(){
			/*
			 * Override to return the item field value from the data store instead of the combobox
			 * value 
			 *   example: combobox value is 'Comic Sans' which is what we want displayed in the combobox
			 *   to the user, but we want to return the data store item value which in this example 
			 *   would be "'Comic Sans MS',cursive". which is the value we want to set in the CSS
			 */
			if (this.store) {
				for (var i = 0; i < this.store._allValues.length; i++){
					var item = this.store._allValues[i];
					if (item.name[0] == this.value){
						return item.value[0];
					}
				}
			}
			return this.value;

		},
		_setValueAttr: function(v){
			/*
			 *  Override to set the cobmboBox value to the data store item name
			 *    example: the v being passed in to set is the font-family value from the CSS
			 *    in this example "'Comic Sans MS',cursive" , but that is not the value we want to 
			 *    display to the user in the comboBox so we sreach the data store for an item with the 
			 *    value == "'Comic Sans MS',cursive" when we find the item we call the comboBox._setValueAttr
			 *    with the item.name from the data store. if we can't find a match we just set it 
			 *    to the value that was passed in
			 */
			if (this.store && v) {
				this.store.fetch({query: {value: v}, 
					onComplete: function (items, request){
						if (items.length < 1){
							this.inherited("_setValueAttr", [v]); 
						} else {
							this.inherited("_setValueAttr",[items[0].name[0]]);
							this.item = items[0];
						}
					}.bind(this),
					onError: function(){
						this.inherited("_setValueAttr", [v]);
					}.bind(this)
				});
				
			} else {
				this.inherited("_setValueAttr", [v]);
			}
		}
	
		
	});

});


