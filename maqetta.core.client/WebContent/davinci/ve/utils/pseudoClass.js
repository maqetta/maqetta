define([], function(){
	var pseudoClass = 'maqettaPseudoClass';

	return {
		MAQETTA_PSEUDO_CLASS: pseudoClass,

		replace: function (selectorText) {
			return ['hover', 'link', 'visited', 'active', 'focus', 'first-letter', 'first-line', 'first-child', 'before', 'after']
				.reduce(function(text, pClass){
					return text.replace(
						new RegExp(':'+pClass,'g'),
							"." + pseudoClass
								+ pClass[0].toUpperCase() + pClass.slice(1));
			}, selectorText);
		}
	};
});
