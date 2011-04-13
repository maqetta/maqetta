dojo.provide("dojox.dtl.Inline");
dojo.require("dojox.dtl._base");

dojo.require("dijit._Widget");

dojox.dtl.Inline = dojo.extend(function(args, node){
	this.create(args, node);
},
dijit._Widget.prototype,
{
	context: null,
	render: function(/*Object|dojox.dtl.Context?*/ context){
		this.context = context || this.context;
		this.postMixInProperties();
		dojo.query("*", this.domNode).orphan();
		this.domNode.innerHTML = this.template.render(this.context);
	},
	declaredClass: "dojox.dtl.Inline",
	buildRendering: function(){
		var div = this.domNode = document.createElement("div");
		var node = this.srcNodeRef;
		if(node.parentNode){
			node.parentNode.replaceChild(div, node);
		}

		this.template = new dojox.dtl.Template(dojo.trim(node.text), true);
		this.render();
	},
	postMixInProperties: function(){
		this.context = (this.context.get === dojox.dtl._Context.prototype.get) ? this.context : new dojox.dtl._Context(this.context);
	}
});