define([
    "dojo/_base/declare",
    "davinci/ui/ModelEditor",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "./Context",
	"davinci/Runtime",
	"davinci/model/Path",
	"preview/silhouetteiframe",
	"dojo/i18n!./nls/review",
], function(declare, ModelEditor, BorderContainer, ContentPane, Context, Runtime, Path, SilhouetteIframe, reviewNls) {
	
return declare("davinci.review.editor.ReviewEditor", ModelEditor, {

	isReadOnly: true,

	constructor: function(element) {
		this._bc = new BorderContainer({}, element);
		this.domNode = this._bc.domNode;
		this._designCP = new ContentPane({region:'center'});
		this._bc.addChild(this._designCP);
		var content = '<div class="silhouette_div_container">'+
			'<span class="silhouetteiframe_object_container"></span>'+
			'</div>';
		this._designCP.set('content', content);
		var silhouette_div_container=dojo.query('.silhouette_div_container',this._designCP.domNode)[0];
		this.silhouetteiframe = new SilhouetteIframe({
			rootNode:silhouette_div_container,
			margin:20
		});

		this._bc.startup();
		this._bc.resize();
		this.isReadOnly = true;
		dojo.subscribe("/davinci/review/resourceChanged", this, function(arg1,arg2,arg3) {
			if (arg2!="open"&&arg2!="closed" || !this.resourceFile) {
				return;
			}
			var version = this.resourceFile.parent;
			if (version.timeStamp == arg3.timeStamp) {
				davinci.review.model.resource.root.findFile(version.timeStamp, this.resourceFile.name).then(function(node) {
					this.resourceFile = node;
				}.bind(this));
			}

		});
	},
	save: function(){
		// no-op.  editor not saved, comments are submitted
	},
	supports: function(something) {
		return something=="states";
	},

	getContext: function() {
		return this.context;
	},

	setContent: function(filename, content) {
		
		this.fileName = filename;
		this.basePath = new Path(filename);
		// URL will always be http://localhost:8080/davinci/review without / at the end at present
		var locationPath = new Path(Runtime.location());

		var designerName = this.resourceFile.parent.designerId;
		// Compose a URL like http://localhost:8080/davinci/review/user/heguyi/ws/workspace/.review/snapshot/20100101/folder1/sample1.html
		var baseUrl = locationPath.append("user").append(designerName)
			.append("ws").append("workspace").append(filename.replace(/:/g, "%3A")).toString();

		var containerNode = dojo.query('.silhouette_div_container',this._designCP.domNode)[0];
		this.context = new Context({
			containerNode: containerNode,
			baseURL: baseUrl,
			fileName: this.fileName,
			resourceFile: this.resourceFile,
			containerEditor: this,
			iframeattrs: {'class': 'silhouetteiframe_iframe'}
		});

		this.title = dojo.doc.title;
		this.context.setSource();
	},

	destroy: function() {
		 //Clear any pending comment from view cache
		if (this.context){
			if(this.context._commentView) {
				this.context._commentView._setPendingEditComment(this, null);
			}
			if(this.context.destroy){
				this.context.destroy();
			}
		}
		this.inherited(arguments);
	},

	onResize: function() {

	},
	
	getFileNameToDisplay: function() {
		var newFileName = this.fileName;
		var parts = newFileName.split('/');
		if(parts.length > 3){
			// Remove leading .review/snapshots/NNNNN/
			parts.splice(0, 3);
			newFileName = parts.join('/');
		}
		//FIXME: Shouldn't hard-code, instead should pull from plugin file
		return newFileName+'.rev';
	},

	/* Gets called before browser page is unloaded to give 
	 * editor a chance to warn the user they may lose data if
	 * they continue. Should return a message to display to the user
	 * if a warning is needed or null if there is no need to warn the
	 * user of anything. In browsers such as FF 4, the message shown
	 * will be the browser default rather than the returned value.
	 * 
	 * NOTE: With auto-save, _not_ typically needed by most editors.
	 */
	getOnUnloadWarningMessage: function() {
		var message = null;
		if (this.isDirty) {
			message = dojo.string.substitute(reviewNls.unsavedComment, [
				this.editorContainer._getTitle()
			]);
		}
		return message;
	}
});
});
