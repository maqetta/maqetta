define(["dojo/_base/lang","./_base","dijit/_Widget"], function(dojo,dd,djw){

	dd.Inline = dojo.extend(function(args, node){
		this.create(args, node);
	},
	djw.prototype,
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

			this.template = new dd.Template(dojo.trim(node.text), true);
			this.render();
		},
		postMixInProperties: function(){
			this.context = (this.context.get === dd._Context.prototype.get) ? this.context : new dd._Context(this.context);
		}
	});
	return dojox.dtl.Inline;
});