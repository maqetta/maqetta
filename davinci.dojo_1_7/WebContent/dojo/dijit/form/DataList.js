define([
	"dojo/_base/kernel",
	"..",
	"dojo/store/Memory", // dojo.store.Memory
	"dojo/_base/NodeList", // .map
	"dojo/_base/declare", // dojo.declare
	"dojo/_base/html", // dojo.byId
	"dojo/_base/lang", // dojo.trim
	"dojo/query" // dojo.query
], function(dojo, dijit){

	// module:
	//		dijit/form/DataList
	// summary:
	//		Inefficient but small data store specialized for inlined data via OPTION tags

	function toItem(/*DOMNode*/ option){
		// summary:
		//		Convert <option> node to hash
		return {
			id: option.value,
			value: option.value,
			name: dojo.trim(option.innerText || option.textContent || '')
		};
	}

	dojo.declare("dijit.form.DataList", dojo.store.Memory, {
		// summary:
		//		Inefficient but small data store specialized for inlined data via OPTION tags
		//
		// description:
		//		Provides a store for inlined data like:
		//
		//	|	<datalist>
		//	|		<option value="AL">Alabama</option>
		//	|		...

		constructor: function(/*Object?*/ params, /*DomNode|String*/ srcNodeRef){
			// store pointer to original DOM tree
			this.domNode = dojo.byId(srcNodeRef);

			dojo._mixin(this, params);
			if(this.id){
				dijit.registry.add(this); // add to registry so it can be easily found by id
			}
			this.domNode.style.display = "none";

			this.inherited(arguments, [{
				data: dojo.query("option", this.domNode).map(toItem)
			}]);
		},

		destroy: function(){
			dijit.registry.remove(this.id);
		},

		fetchSelectedItem: function(){
			// summary:
			//		Get the option marked as selected, like `<option selected>`.
			//		Not part of dojo.data API.
			var option = dojo.query("> option[selected]", this.domNode)[0] || dojo.query("> option", this.domNode)[0];
			return option && toItem(option);
		}
	});

	return dijit.form.DataList;
});
