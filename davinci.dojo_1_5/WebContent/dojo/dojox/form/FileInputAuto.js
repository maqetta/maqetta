dojo.provide("dojox.form.FileInputAuto");

dojo.require("dojox.form.FileInput");
dojo.require("dojo.io.iframe"); 

dojo.declare("dojox.form.FileInputAuto",
	dojox.form.FileInput,
	{
	// summary: An extension on dojox.form.FileInput providing background upload progress
	//
	// description: An extended version of FileInput - when the user focuses away from the input
	//	the selected file is posted via dojo.io.iframe to the url. example implementation
	//	comes with PHP solution for handling upload, and returning required data.
	//	
	// notes: the return data from the io.iframe is used to populate the input element with 
	//	data regarding the results. it will be a JSON object, like:
	//	
	//	results = { size: "1024", filename: "file.txt" }
	//	
	//	all the parameters allowed to dojox.form.FileInput apply

	// url: String
	// 	the URL where our background FileUpload will be sent
	url: "",

	// blurDelay: Integer
	//	time in ms before an un-focused widget will wait before uploading the file to the url="" specified
	//	default: 2 seconds
	blurDelay: 2000,

	// duration: Integer
	//	The time in ms to use as the generic timing mechanism for the animations
	//	set to 1 or 0 for "immediate respose"
	duration: 500,

	// uploadMessage: String
	//	
	//	FIXME: i18n somehow?
	uploadMessage: "Uploading ...", 
	
	// triggerEvent: String
	//		Event which triggers the upload. Defaults to onblur, sending the file selected
	//		'blurDelay' milliseconds after losing focus. Set to "onchange" with a low blurDelay
	// 		to send files immediately after uploading.
	triggerEvent: "onblur",
	
	_sent: false,
	
	// small template changes, new attachpoint: overlay
	templateString: dojo.cache("dojox.form","resources/FileInputAuto.html"),
	
	onBeforeSend: function(){
		// summary: Called immediately before a FileInput sends it's file via io.iframe.send. 
		//		The return of this function is passed as the `content` member in the io.iframe IOArgs
		//		object.
		return {};
	},
	
	startup: function(){
		// summary: add our extra blur listeners
		this._blurListener = this.connect(this.fileInput, this.triggerEvent, "_onBlur");
		this._focusListener = this.connect(this.fileInput, "onfocus", "_onFocus"); 
		this.inherited(arguments);
	},

	_onFocus: function(){
		// summary: clear the upload timer
		if(this._blurTimer){ clearTimeout(this._blurTimer); }
	},

	_onBlur: function(){
		// summary: start the upload timer
		if(this._blurTimer){ clearTimeout(this._blurTimer); }
		if(!this._sent){
			this._blurTimer = setTimeout(dojo.hitch(this,"_sendFile"),this.blurDelay);		
		}
	},

	setMessage: function(/*String*/title){
		// summary: set the text of the progressbar
		
		// innerHTML throws errors in IE! so use DOM manipulation instead
		//this.overlay.innerHTML = title;
		this.overlay.removeChild(this.overlay.firstChild);
		this.overlay.appendChild(document.createTextNode(title));
	},
	
	_sendFile: function(/* Event */e){
		// summary: triggers the chain of events needed to upload a file in the background.
		if(this._sent || this._sending || !this.fileInput.value){ return; }

		this._sending = true;

		dojo.style(this.fakeNodeHolder,"display","none");
		dojo.style(this.overlay,{
			opacity:0,
			display:"block"
		});

		this.setMessage(this.uploadMessage);

		dojo.fadeIn({ node: this.overlay, duration:this.duration }).play();

		var _newForm; 
		if(dojo.isIE){
			// just to reiterate, IE is a steaming pile of code. 
			_newForm = document.createElement('<form enctype="multipart/form-data" method="post">');
			_newForm.encoding = "multipart/form-data";
			
		}else{
			// this is how all other sane browsers do it
			_newForm = document.createElement('form');
			_newForm.setAttribute("enctype","multipart/form-data");
		}
		_newForm.appendChild(this.fileInput);
		dojo.body().appendChild(_newForm);
	
		dojo.io.iframe.send({
			url: this.url,
			form: _newForm,
			handleAs: "json",
			handle: dojo.hitch(this,"_handleSend"),
			content: this.onBeforeSend()
		});
	},
	
	_handleSend: function(data,ioArgs){
		// summary: The callback to toggle the progressbar, and fire the user-defined callback

		// innerHTML throws errors in IE! so use DOM manipulation instead
		this.overlay.removeChild(this.overlay.firstChild);
		
		this._sent = true;
		this._sending = false;
		dojo.style(this.overlay,{
			opacity:0,
			border:"none",
			background:"none"
		}); 

		this.overlay.style.backgroundImage = "none";
		this.fileInput.style.display = "none";
		this.fakeNodeHolder.style.display = "none";
		dojo.fadeIn({ node:this.overlay, duration:this.duration }).play(250);

		this.disconnect(this._blurListener);
		this.disconnect(this._focusListener);

		//remove the form used to send the request
		dojo.body().removeChild(ioArgs.args.form);
		this.fileInput = null;

		this.onComplete(data,ioArgs,this);
	},

	reset: function(e){
		// summary: accomodate our extra focusListeners
		if(this._blurTimer){ clearTimeout(this._blurTimer); }

		this.disconnect(this._blurListener);
		this.disconnect(this._focusListener);

		this.overlay.style.display = "none";
		this.fakeNodeHolder.style.display = "";
		this.inherited(arguments);
		this._sent = false;
		this._sending = false;
		this._blurListener = this.connect(this.fileInput, this.triggerEvent,"_onBlur");
		this._focusListener = this.connect(this.fileInput,"onfocus","_onFocus"); 
	},

	onComplete: function(data,ioArgs,widgetRef){
		// summary: stub function fired when an upload has finished. 
		// data: the raw data found in the first [TEXTAREA] tag of the post url
		// ioArgs: the dojo.Deferred data being passed from the handle: callback
		// widgetRef: this widget pointer, so you can set this.overlay to a completed/error message easily
	}
});

dojo.declare("dojox.form.FileInputBlind",
	dojox.form.FileInputAuto,
	{
	// summary: An extended version of dojox.form.FileInputAuto
	//	that does not display an input node, but rather only a button
	// 	and otherwise behaves just like FileInputAuto
	
	startup: function(){
		// summary: hide our fileInput input field
		this.inherited(arguments);
		this._off = dojo.style(this.inputNode,"width");
		this.inputNode.style.display = "none";
		this._fixPosition();
	},
	
	_fixPosition: function(){		
		// summary: in this case, set the button under where the visible button is 
		if(dojo.isIE){
			dojo.style(this.fileInput,"width","1px");
		}else{
			dojo.style(this.fileInput,"left","-"+(this._off)+"px");
		}
	},

	reset: function(e){
		// summary: onclick, we need to reposition our newly created input type="file"
		this.inherited(arguments);
		this._fixPosition(); 
	}
});
