define(["dojo/_base/html","./TextBox"], function(dhtml,TextBox){

	return dojo.declare("dojox.mobile.TextArea",dojox.mobile.TextBox,{
		// summary:
		//		Non-templated TEXTAREA widget.
		//
		// description:
		//		A textarea widget that wraps an HTML TEXTAREA element.
		//		Takes all the parameters (name, value, etc.) that a vanilla textarea takes.
		//
		// example:
		// |	<textarea dojoType="dojox.mobile.TextArea">...</textarea>

		baseClass: "mblTextArea",

		postMixInProperties: function(){
			 // Copy value from srcNodeRef, unless user specified a value explicitly (or there is no srcNodeRef)
			// TODO: parser will handle this in 2.0
			if(!this.value && this.srcNodeRef){
				this.value = this.srcNodeRef.value;
			}
			this.inherited(arguments);
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = dojo.create("textarea", {});
			}
			this.inherited(arguments);
		}
	});
});
