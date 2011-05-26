define(['dojo', 'dojo/io/iframe', 'dojox/form/uploader/plugins/HTML5'],function(dojo){
	

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
		if(!this.supports("multiple") || this.force =="iframe"){
			this.uploadType = "iframe";
			this.upload = this.uploadIFrame;
			this.submit = this.submitIFrame;
		}
	},

	submitIFrame: function(data){
		this.uploadIFrame(data);
	},

	uploadIFrame: function(data){
		// summary:
		//		Internal. You could use this, but you should use upload() or submit();
		//		which can also handle the post data.
		//
		var form, destroyAfter = false;
		if(!this.getForm()){
			form = dojo.create('form', {enctype:"multipart/form-data", method:"post"}, this.domNode);
			dojo.forEach(this._inputs, function(n, i){
				if(n.value) form.appendChild(n);
			}, this);
			destroyAfter = true;
		}else{
			form = this.form;
		}

		var url = this.getUrl();

		var dfd = dojo.io.iframe.send({
			url: url,
			form: form,
			handleAs: "json",
			error: dojo.hitch(this, function(err){
				if(destroyAfter){ dojo.destroy(form); }
				this.onError(err);
			}),
			load: dojo.hitch(this, function(data, ioArgs, widgetRef){
				if(destroyAfter){ dojo.destroy(form); }
				if(data["ERROR"] || data["error"]){
					this.onError(data);
				}else{
					this.onComplete(data);
				}
			})
		});
	}
});

dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.IFrame);

return dojox.form.uploader.plugins.IFrame;
});
