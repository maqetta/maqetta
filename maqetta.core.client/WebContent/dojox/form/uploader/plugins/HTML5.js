dojo.provide("dojox.form.uploader.plugins.HTML5");

dojo.declare("dojox.form.uploader.plugins.HTML5", [], {
	//
	// Version: 1.6
	//
	// summary:
	//		A plugin for dojox.form.Uploader that adds HTML5 multiple-file upload capabilities and
	//		progress events.
	//
	//	description:
	//		Add this plugin to have HTML5 capabilities in the Uploader. Note that it does not add
	//		these capabilities to browsers that don't support them. For IE or older browsers, add
	//		additional plugins: IFrame or Flash.
	//
	errMsg:"Error uploading files. Try checking permissions",

	// Overwrites "form" and could possibly be overwritten again by iframe or flash plugin.
	uploadType:"html5",

	postCreate: function(){
		this.connectForm();
		this.inherited(arguments);
		if(this.uploadOnSelect){
			this.connect(this, "onChange", "upload");
		}
	},

	/*************************
	 *	   Public Methods	 *
	 *************************/

	upload: function(/*Object ? */formData){
		// summary:
		// 		See: dojox.form.Uploader.upload
		//
		this.onBegin(this.getFileList());
		if(this.supports("FormData")){
			this.uploadWithFormData(formData);
		}else if(this.supports("sendAsBinary")){
			this.sendAsBinary(formData);
		}
	},

	submit: function(/* form Node ? */form){
		// summary:
		//		See: dojox.form.Uploader.submit
		//
		form = !!form ? form.tagName ? form : this.getForm() : this.getForm();
		var data = dojo.formToObject(form);
		console.log("form data:", data);
		this.upload(data);
	},

	sendAsBinary: function(/* Object */data){
		// summary:
		// 		Used primarily in FF < 4.0. Sends files and form object as binary data, written to
		// 		still enable use of $_FILES in PHP (or equivalent).
		// tags:
		// 		private
		//
		if(!this.getUrl()){
			console.error("No upload url found.", this); return;
		}

		// The date/number doesn't matter but amount of dashes do. The actual boundary
		// will have two more dashes than this one which is used in the header.
		var boundary = "---------------------------" + (new Date).getTime();
		var xhr = this.createXhr();

		xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

		// finally send the request as binary data
		// still accessed as $_FILES
		var msg = this._buildRequestBody(data, boundary);
		if(!msg){
			this.onError(this.errMsg);
		}else{
			xhr.sendAsBinary(msg);
		}
	},
	uploadWithFormData: function(/* Object */data){
		// summary
		// 		Used with WebKit and Firefox 4+
		// 		Upload files using the much friendlier FormData browser object.
		// tags:
		// 		private
		//
		if(!this.getUrl()){
			console.error("No upload url found.", this); return;
		}

		var fd = new FormData();
		dojo.forEach(this.inputNode.files, function(f, i){
			fd.append(this.name+"s[]", f);
		}, this);

		if(data){
			for(var nm in data){
				fd.append(nm, data[nm]);
			}
		}

		var xhr = this.createXhr();
		xhr.send(fd);
	},

	_xhrProgress: function(evt){
		if(evt.lengthComputable){
			var o = {
				bytesLoaded:evt.loaded,
				bytesTotal:evt.total,
				type:evt.type,
				timeStamp:evt.timeStamp
			};
			if(evt.type == "load"){
				// 100%
				o.percent = "100%",
				o.decimal = 1;
			}else{
				o.decimal = evt.loaded / evt.total;
				o.percent = Math.ceil((evt.loaded / evt.total)*100)+"%";
			}
			this.onProgress(o);
		}
	},

	createXhr: function(){
		var xhr = new XMLHttpRequest();
		var timer;
        xhr.upload.addEventListener("progress", dojo.hitch(this, "_xhrProgress"), false);
        xhr.addEventListener("load", dojo.hitch(this, "_xhrProgress"), false);
        xhr.addEventListener("error", dojo.hitch(this, function(evt){
			this.onError(evt);
			clearInterval(timer);
		}), false);
        xhr.addEventListener("abort", dojo.hitch(this, function(evt){
			this.onAbort(evt);
			clearInterval(timer);
		}), false);
        xhr.onreadystatechange = dojo.hitch(this, function() {
			if (xhr.readyState === 4) {
				console.info("COMPLETE")
				clearInterval(timer);
				this.onComplete(dojo.eval(xhr.responseText));
			}
		});
        xhr.open("POST", this.getUrl());

		timer = setInterval(dojo.hitch(this, function(){
			try{
				if(typeof(xhr.statusText)){} // accessing this error throws an error. Awesomeness.
			}catch(e){
				//this.onError("Error uploading file."); // not always an error.
				clearInterval(timer);
			}
		}),250);

		return xhr;
	},

	_buildRequestBody : function(data, boundary) {
		var EOL  = "\r\n";
		var part = "";
		boundary = "--" + boundary;

		var filesInError = [];
		dojo.forEach(this.inputNode.files, function(f, i){
			var fieldName = this.name+"s[]";//+i;
			var fileName  = this.inputNode.files[i].fileName;
			var binary;

			try{
				binary = this.inputNode.files[i].getAsBinary() + EOL;
				part += boundary + EOL;
				part += 'Content-Disposition: form-data; ';
				part += 'name="' + fieldName + '"; ';
				part += 'filename="'+ fileName + '"' + EOL;
				part += "Content-Type: " + this.getMimeType() + EOL + EOL;
				part += binary;
			}catch(e){
				filesInError.push({index:i, name:fileName});
			}
		}, this);

		if(filesInError.length){
			if(filesInError.length >= this.inputNode.files.length){
				// all files were bad. Nothing to upload.
				this.onError({
					message:this.errMsg,
					filesInError:filesInError
				});
				part = false;
			}
		}

		if(!part) return false;

		if(data){
			for(var nm in data){
				part += boundary + EOL;
				part += 'Content-Disposition: form-data; ';
				part += 'name="' + nm + '"' + EOL + EOL;
				part += data[nm] + EOL;
			}
		}


		part += boundary + "--" + EOL;
		return part;
	}

});
dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.HTML5);
