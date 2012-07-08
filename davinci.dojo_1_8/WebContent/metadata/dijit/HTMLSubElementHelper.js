define([],
function(){

var HTMLSubElementHelper = function() {};
HTMLSubElementHelper.prototype = {
	
	/* We're getting some widgets (and likely will get more) that contain HTML elements that
	 * need to be part of the child data. For example: dijit.Tree, dojo.store.Memory, and 
	 * gridx.GridX. In light of that, creating a single place from which such widget helpers 
	 * can access and reuse these routines.
	 */
		
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget || !widget._srcElement){
			return undefined;
		}
		
		var children = [];
		dojo.forEach(widget._srcElement.children, function(child) {
			this._getChildrenDataHelper(child, children);
		}.bind(this));

		return children;
	},
	
	_getChildrenDataHelper: function(element, children) {
		var elementData = this._getElementData(element);
		if (elementData) {
			children.push(elementData);
			dojo.forEach(element.children, function(child) {
				this._getChildrenDataHelper(child, elementData.children);
			}.bind(this));
		}
	},
	
	_getElementData: function(element) {
		var elementData = null;
		
		if (element.elementType == "HTMLElement") {
			//Create a base data structure
			elementData = {
					type: "html." + element.tag,
					properties: {},
					children: []
				};
			
			//Get the element attributes and add to data structure
			dojo.forEach(element.attributes, function(attribute) {
				if (!attribute.noPersist) {
					elementData.properties[attribute.name] = attribute.value;
				}
			});
		} else if (element.elementType == "HTMLText") {
			elementData = element.value.trim();
		}
		
		return elementData;
	}
};

return HTMLSubElementHelper;

});