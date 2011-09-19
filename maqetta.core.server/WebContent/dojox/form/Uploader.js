dojo.provide("dojox.form.Uploader");
dojo.experimental("dojox.form.Uploader");
dojo.require("dojox.form.uploader.Base");
dojo.require("dijit.form.Button");

	//
	// TODO:
	//		i18n
	//		label via innerHTML
	//		Doc and or test what can be extended.
	//		Doc custom file events
	//		Use new FileReader() for thumbnails
	//		flashFieldName should default to Flash
	//		get('value'); and set warning
	//

dojo.declare("dojox.form.Uploader", [dojox.form.uploader.Base], {
	//
	// Version: 1.6
	//
	// summary:
	//		A widget that creates a stylable file-input button, with optional multi-file selection,
	//		using only HTML elements. Non-HTML5 browsers have fallback options of Flash or an iframe.
	//
	//	description:
	//		A bare-bones, stylable file-input button, with optional multi-file selection. The list
	//		of files is not displayed, that is for you to handle by connecting to the onChange
	//		event, or use the dojox.form.uploader.FileList.
	//
	//		Uploader without plugins does not have any ability to upload - it is for use in forms
	//		where you handle the upload either by a standard POST or with Ajax using an iFrame. This
	//		class is for convenience of multiple files only. No progress events are available.
	//
	//		If the browser supports a file-input with the "multiple" attribute, that will be used.
	//		If the browser does not support "multiple" (ergo, IE) multiple inputs are used,
	//		one for each selection.
	//
	//
	//	uploadOnSelect: Boolean
	//		If true, uploads imediately after a file has been selected. If false,
	//		waits for upload() to be called.
	uploadOnSelect:false,
	//	tabIndex: Number|String
	//		The tab order in the DOM.
	tabIndex:0,
	//	multiple: Boolean
	//		If true and flash mode, multiple files may be selected from the dialog.
	multiple:false,
	//
	//	label: String
	//		The text used in the button that when clicked, opens a system Browse Dialog.
	label:"Upload...",
	//
	// url: String
	//		The url targeted for upload. An absolute URL is preferred. Relative URLs are
	//		changed to absolute.
	url:"",
	//
	//	name: String
	//		The name attribute needs to end with square brackets: [] as this is the standard way
	//		of handling an attribute "array". This requires a slightly different technique on the
	//		server.
	name:"uploadedfile",
	//
	//	flashFieldName: String
	//		If set, this will be the name of the field of the flash uploaded files that the server
	//		is expecting. If not set, "Flash" is appended to the "name" property.
	flashFieldName:"",
	//
	//	uploadType: String [readonly]
	//		The type of uploader being used. As an alternative to determining the upload type on the
	//		server based on the fieldName, this property could be sent to the server to help
	//		determine what type of parsing should be used.
	uploadType:"form",
	//
	_nameIndex:0,
	widgetsInTemplate:true,
	templateString:'<div class="dojoxFileInput"><div dojoType="dijit.form.Button" dojoAttachPoint="button">${label}</div></div>',

	postMixInProperties: function(){
		this._inputs = [];
		this._getButtonStyle(this.srcNodeRef);
		this.inherited(arguments);
	},
	postCreate: function(){
		var restore = false;
		var parent = this.domNode.parentNode;
		var position = this._getNodePosition(this.domNode);
		if(!this.btnSize.w || !this.btnSize.h) {
			dojo.body().appendChild(this.domNode);
			this._getButtonStyle(this.domNode);
			restore = true;
		}
		this._setButtonStyle();
		if(restore){
			dojo.place(this.domNode, position.node, position.pos)
		}
		this.inherited(arguments);
	},

	/*************************
	 *	   Public Events	 *
	 *************************/

	onChange: function(/* Array */fileArray){
		//	summary:
		// 		stub to connect
		// 		Fires when files are selected
		// 		Event is an array of last files selected
	},

	onBegin: function(/* Array */dataArray){
		// summary:
		// 		Fires when upload begins
	},

	onProgress: function(/* Object */customEvent){
		// summary:
		// 		Stub to connect
		// 		Fires on upload progress. Event is a normalized object of common properties
		// 		from HTML5 uploaders and the Flash uploader. Will not fire for IFrame.
		// customEvent:
		// 		bytesLoaded: Number
		// 			Amount of bytes uploaded so far of entire payload (all files)
		//		bytesTotal: Number
		//			Amount of bytes of entire payload (all files)
		//		type: String
		//			Type of event (progress or load)
		//		timeStamp: Number
		//			Timestamp of when event occurred
	},

	onComplete: function(/* Object */customEvent){
		// summary:
		// 		stub to connect
		// 		Fires when all files have uploaded
		// 		Event is an array of all files
		this.reset();
	},

	onCancel: function(){
		// summary:
		// 		Stub to connect
		// 		Fires when dialog box has been closed
		//		without a file selection
	},

	onAbort: function(){
		// summary:
		// 		Stub to connect
		// 		Fires when upload in progress was canceled
	},

	onError: function(/* Object or String */evtObject){
		// summary:
		//		Fires on errors
		//
		//FIXME: Unsure of a standard form of error events
	},

	/*************************
	 *	   Public Methods	 *
	 *************************/

	upload: function(/*Object ? */formData){
		// summary:
		// 		When called, begins file upload. Only supported with plugins.
	},

	submit: function(/* form Node ? */form){
		// summary:
		//		If Uploader is in a form, and other data should be sent along with the files, use
		//		this instead of form submit. Only supported with plugins.
	},

	reset: function(){
		// summary
		// 		Resets entire input, clearing all files.
		// 		NOTE:
		// 		Removing individual files is not yet supported, because the HTML5 uploaders can't
		// 		be edited.
		// 		TODO:
		// 		Add this ability by effectively, not uploading them
		//
		this._disconnectButton();
		dojo.forEach(this._inputs, dojo.destroy, dojo);
		this._inputs = [];
		this._nameIndex = 0;
		this._createInput();
	},

	getFileList: function(){
		// summary:
		// 		Returns a list of selected files.
		//
		var fileArray = [];
		if(this.supports("multiple")){
			dojo.forEach(this.inputNode.files, function(f, i){
				fileArray.push({
					index:i,
					name:f.name,
					size:f.size,
					type:f.type
				});
			}, this);
		}else{
			dojo.forEach(this._inputs, function(n, i){
				fileArray.push({
					index:i,
					name:n.value.substring(n.value.lastIndexOf("\\")+1),
					size:0,
					type:n.value.substring(n.value.lastIndexOf(".")+1)
				});
			}, this)

		}
		return fileArray; // Array
	},

	/*********************************************
	 *	   Private Property. Get off my lawn.	 *
	 *********************************************/

	_getValueAttr: function(){
		// summary:
		//		Internal. To get disabled use: uploader.get("disabled");
		return this.getFileList();
	},

	_setValueAttr: function(disabled){
		console.error("Uploader value is read only");
	},

	_getDisabledAttr: function(){
		// summary:
		//		Internal. To get disabled use: uploader.get("disabled");
		return this._disabled;
	},

	_setDisabledAttr: function(disabled){
		// summary:
		//		Internal. To set disabled use: uploader.set("disabled", true);
		if(this._disabled == disabled){ return; }
		this.button.set('disabled', disabled);
		dojo.style(this.inputNode, "display", disabled ? "none" : "block");
	},

	_getNodePosition: function(node){
		if(node.previousSibling){
			return {
				node:node.previousSibling,
				pos:"after"
			}
		}
		return {
			node:node.nextSibling,
			pos:"before"
		}
	},

	_getButtonStyle: function(node){
		if(!node){
			// we don't want this to happen. But if it does, try and display *something*.
			this.btnSize = {
				w:200,
				h:25
			};
		}else{
			this.btnSize = dojo.marginBox(node);
		}
	},

	_setButtonStyle: function(){
		var hasParent = true;
		if(!this.domNode.parentNode || !this.domNode.parentNode.tagName){
			document.body.appendChild(this.domNode);
			hasParent = false;
		}

		dojo.style(this.domNode, {
			width:this.btnSize.w+"px",
			height:(this.btnSize.h+4)+"px",
			overflow:"hidden",
			position:"relative"
		});

		this.inputNodeFontSize = Math.max(2, Math.max(Math.ceil(this.btnSize.w / 60), Math.ceil(this.btnSize.h / 15)));
		this._createInput();

		dojo.style(this.button.domNode, {
			margin:"0px",
			display:"block",
			verticalAlign:"top" // IE fix

		});

		dojo.style(this.button.domNode.firstChild, {
			margin:"0px",
			display:"block"
			//height:this.btnSize.h+"px"
		});

		if(!hasParent){
			document.body.removeChild(this.domNode);
		}
	},

	_createInput: function(){

		if(this._inputs.length){
			dojo.style(this.inputNode, {
				top:"500px"
			});
			this._disconnectButton();
			this._nameIndex++;
		}

		var name;
		if(this.supports("multiple")){
			// FF3.5+, WebKit
			name = this.name+"s[]";
		}else{
			// <=IE8
			name = this.name + (this.multiple ? this._nameIndex : "");
		}
		this.inputNode = dojo.create("input", {type:"file", name:name, className:"dojoxInputNode"}, this.domNode, "first");
		if(this.supports("multiple") && this.multiple){
			dojo.attr(this.inputNode, "multiple", true);
		}
		this._inputs.push(this.inputNode);


		dojo.style(this.inputNode, {
			fontSize:this.inputNodeFontSize+"em"
		});
		var size = dojo.marginBox(this.inputNode);

		dojo.style(this.inputNode, {
			position:"absolute",
			top:"-2px",
			left:"-"+(size.w-this.btnSize.w-2)+"px",
			opacity:0
		});
		this._connectButton();
	},

	_connectButton: function(){
		this._cons = [];
		var cs = dojo.hitch(this, function(nm){
			this._cons.push(dojo.connect(this.inputNode, nm, this, function(evt){
				this.button._cssMouseEvent({type:nm})
			}));
		});
		cs("mouseover");
		cs("mouseout");
		cs("mousedown");
		this._cons.push(dojo.connect(this.inputNode, "change", this, function(evt){
			this.onChange(this.getFileList(evt));
			if(!this.supports("multiple") && this.multiple) this._createInput();
		}));

		this.button.set('tabIndex', -1);
		if(this.tabIndex > -1){
			this.inputNode.tabIndex = this.tabIndex;
			var restoreBorderStyle = dojo.style(this.button.domNode.firstChild, "border");
			this._cons.push(dojo.connect(this.inputNode, "focus", this, function(){
				dojo.style(this.button.domNode.firstChild, "border", "1px dashed #ccc");
			}));
			this._cons.push(dojo.connect(this.inputNode, "blur", this, function(){
				dojo.style(this.button.domNode.firstChild, "border", restoreBorderStyle);
			}));
		}
	},

	_disconnectButton: function(){
		dojo.forEach(this._cons, dojo.disconnect, dojo);
	}
});

(function(){
	dojox.form.UploaderOrg = dojox.form.Uploader;
	var extensions = [dojox.form.UploaderOrg];
	dojox.form.addUploaderPlugin = function(plug){
		// summary:
		// 		Handle Uploader plugins. When the dojox.form.addUploaderPlugin() function is called,
		// 		the dojox.form.Uploader is recreated using the new plugin (mixin).
		//
		extensions.push(plug);
		dojo.declare("dojox.form.Uploader", extensions, {});
	}
})();
