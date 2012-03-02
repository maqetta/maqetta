define([
    "dojo/_base/declare",
    "davinci/ui/ModelEditor",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "davinci/review/editor/Context",
	"davinci/Runtime",
	"preview/silhouetteiframe"
], function(declare, ModelEditor, BorderContainer, ContentPane, Context, Runtime, SilhouetteIframe) {
	
return declare("davinci.review.editor.ReviewEditor", ModelEditor, {

	isReadOnly: true,

	constructor: function(element) {
		this._bc = new dijit.layout.BorderContainer({}, element);
		this.domNode = this._bc.domNode;
		this._designCP = new dijit.layout.ContentPane({region:'center'});
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
				var node = davinci.review.model.resource.root.findFile(version.timeStamp,
						this.resourceFile.name);
				this.resourceFile = node;
			}

		});
	},

	supports : function(something) {
		return something=="states";
	},

	focus : function() {
		var cv = dijit.byId("davinci.ui.comment");
		cv && cv.getParent().selectChild(cv);
	},


	getContext : function() {
		return this.context;
	},

	setContent : function(filename, content) {
		this.fileName = filename;
		this.basePath = new davinci.model.Path(filename);
		// URL will always be http://localhost:8080/davinci/review without / at the end at present
		var locationPath = new davinci.model.Path(davinci.Workbench.location());
		locationPath = locationPath.removeLastSegments().append("review"); // delete /maqetta
		var baseUrl;

		var designerName = Runtime.commenting_designerName || dojo.byId('davinci_user').innerHTML;
		// Compose a URL like http://localhost:8080/davinci/review/user/heguyi/ws/workspace/.review/snapshot/20100101/folder1/sample1.html
		baseUrl = locationPath.append("user").append(designerName)
		.append("ws").append("workspace").append(filename).toString();

		var containerNode = dojo.query('.silhouette_div_container',this._designCP.domNode)[0];
		this.context = new Context({
			containerNode: containerNode,
			baseURL : baseUrl,
			fileName : this.fileName,
			resourceFile: this.resourceFile,
			containerEditor:this,
			iframeattrs:{'class':'silhouetteiframe_iframe'}
		});

		this.title = dojo.doc.title;
		this.context.setSource();
	},

	destroy : function() {
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
	}

});
});
