/**
 * @class davinci.html.HTMLAttribute
 * @constructor
 * @extends davinci.html.HTMLItem
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLItem"
], function(declare, HTMLItem) {

return declare("davinci.html.HTMLAttribute", HTMLItem, {

	constructor: function() {
		this.elementType = "HTMLAttribute";
		this.name = "";
		this.value = "";
	},

	getText: function(context) {
		if (this.noPersist && !context.includeNoPersist)
			return "";
		var s = this.name;
		var bool = {checked: 1, selected: 1, disabled: 1, readonly: 1, multiple: 1, ismap: 1, autofocus: 1, 
				autoplay: 1, controls: 1, formnovalidate: 1, loop: 1, muted: 1, required: 1
		};
		if (bool[this.name.toLowerCase()]) {
			/*
			 * dojox.form.TriStateCheckbox checked attribute any value other than 'mixed' is treaded as checked(true)
			 * checked='mixed' is treated as mixed and of course if checked is absent then the checkbox is false
			 * So do to this widget and maybe others overriding the HTML standard behavior of boolean attributes 
			 * We should just pass any value other than false through..
			 */
			if (!this.value || this.value === "false") { 
				s = ""; 
			}else {
				s += '="' + this.value + '"';
			}
		} else if (!this.noValue) {
			s = s + '="' + davinci.html.escapeXml(String(this.value)) + '"';
		}
		return s;
	},


	setValue: function(value) {
		this.value = davinci.html.unEscapeXml(value);
		this.onChange();
	}

});
});
