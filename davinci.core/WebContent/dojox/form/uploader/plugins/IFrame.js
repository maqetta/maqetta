dojo.provide("dojox.form.uploader.plugins.IFrame");

dojo.require("dojox.form.uploader.plugins.HTML5");
dojo.require("dojo.io.iframe");

dojo.declare("dojox.form.uploader.plugins.IFrame", [], {
	//
	// Version: 1.6
	//
	// summary:
	//		A plugin for dojox.form.Uploader that adds Ajax upload capabilities.
	//
	//	description:
	//		Only supported by IE, due to the specifc iFrame hack used. The
	//		dojox.form.uploader.plugins.HTML5 plugin should be used along with this to add HTML5
	//		capabilities to browsers that support them. Progress events are not supported.
	//		Inherits all properties from dojox.form.Uploader and dojox.form.uploader.plugins.HTML5.
	//

	force:"",

	postMixInProperties: function(){
		this.inherited(arguments);
		if(!this.supports("multiple")){
			this.uploadType = "iframe";
		}
	},

	upload: function(/*Object ? */data){
		// summary:
		//		See: dojox.form.Uploader.upload
		//
		if(!this.supports("multiple") || this.force =="iframe"){
			this.uploadIFrame(data);
			dojo.stopEvent(data);
			return;
		}
	},

	uploadIFrame: function(){
		// summary:
		//		Internal. You could use this, but you should use upload() or submit();
		//		which can also handle the post data.
		//
		var url = this.getUrl();
		var dfd = dojo.io.iframe.send({
			url: this.getUrl(),
			form: this.form,
			handleAs: "json",
			error: dojo.hitch(this, function(err){
				console.error("HTML Upload Error:" + err.message);
			}),
			load: dojo.hitch(this, function(data, ioArgs, widgetRef){
				this.onComplete(data);
			})
		});
	}
});

dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.IFrame);
