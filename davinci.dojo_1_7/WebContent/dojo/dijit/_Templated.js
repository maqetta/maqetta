define([
	"dojo",
	".",
	"./_WidgetBase",
	"./_TemplatedMixin",
	"./_WidgetsInTemplateMixin",
	"dojo/string",
	"dojo/parser",
	"dojo/cache"], function(dojo, dijit){

	// module:
	//		dijit/_Templated
	// summary:
	//		Deprecated mixin for widgets that are instantiated from a template.

	dojo.declare("dijit._Templated", [dijit._TemplatedMixin, dijit._WidgetsInTemplateMixin], {
		// summary:
		//		Deprecated mixin for widgets that are instantiated from a template.
		//		Widgets should use _TemplatedMixin plus if necessary _WidgetsInTemplateMixin instead.

		// widgetsInTemplate: [protected] Boolean
		//		Should we parse the template to find widgets that might be
		//		declared in markup inside it?  False by default.
		widgetsInTemplate: false,

		constructor: function(){
			dojo.deprecated(this.declaredClass + ": dijit._Templated deprecated, use dijit._TemplatedMixin and if necessary dijit._WidgetsInTemplateMixin", "", "2.0");
		},

		_attachTemplateNodes: function(rootNode, getAttrFunc){

			this.inherited(arguments);

			// Do deprecated waiRole and waiState
			var nodes = dojo.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
			var x = dojo.isArray(rootNode) ? 0 : -1;
			for(; x<nodes.length; x++){
				var baseNode = (x == -1) ? rootNode : nodes[x];

				// waiRole, waiState
				var role = getAttrFunc(baseNode, "waiRole");
				if(role){
					dijit.setWaiRole(baseNode, role);
				}
				var values = getAttrFunc(baseNode, "waiState");
				if(values){
					dojo.forEach(values.split(/\s*,\s*/), function(stateValue){
						if(stateValue.indexOf('-') != -1){
							var pair = stateValue.split('-');
							dijit.setWaiState(baseNode, pair[0], pair[1]);
						}
					});
				}
			}
		}
	});

	// These arguments can be specified for widgets which are used in templates.
	// Since any widget can be specified as sub widgets in template, mix it
	// into the base widget class.  (This is a hack, but it's effective.)
	dojo.extend(dijit._WidgetBase, {
		waiRole: "",
		waiState:""
	});

	return dijit._Templated;
});
