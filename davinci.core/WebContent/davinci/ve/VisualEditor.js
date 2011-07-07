dojo.provide("davinci.ve.VisualEditor");
 
dojo.require("davinci.ve.Context");
//dojo.require("davinci.ve.actions.ContextActions");
//dojo.require("davinci.ve.actions.ChildActions");
dojo.require("davinci.Workbench");
dojo.require("davinci.ve.VisualEditorOutline"); //FIXME: not referenced
dojo.require("davinci.ve.States"); //FIXME: not referenced
dojo.require("davinci.html.CSSModel"); //FIXME: not referenced
dojo.require("davinci.html.HTMLModel"); //FIXME: not referenced
dojo.require("davinci.ve.commands.ModifyRuleCommand");

dojo.require("davinci.ve.actions.DeviceActions");
dojo.require("preview.silhouetteiframe");

dojo.declare("davinci.ve.VisualEditor", null, {

	deviceName: 'none',
	_orientation: 'portrait',
	
	constructor : function(element, pageEditor)	{
		this._pageEditor = pageEditor;
		this.contentPane = dijit.getEnclosingWidget(element);
		dojo.addClass(this.contentPane.domNode, "fullPane");
		var content = '<div class="silhouette_div_container">'+
			'<span class="silhouetteiframe_object_container"></span>'+
			'</div>';
		this.contentPane.attr('content', content);
		var silhouette_div_container=dojo.query('.silhouette_div_container',this.contentPane.domNode)[0];
		this.silhouetteiframe = new preview.silhouetteiframe({
			rootNode:silhouette_div_container,
			margin:20
		});
		this._subscriptions = [];
		dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, function(containerWidget, newState, oldState) { 
			if ((top.davinci && davinci.Runtime.currentEditor && davinci.Runtime.currentEditor.declaredClass) == "davinci.ve.VisualEditor") {
				return; // ignore updates in theme editor
			}
			this.onContentChange();
		}));	
		//dojo.subscribe("/davinci/ui/styleValuesChange", dojo.hitch(this, this._stylePropertiesChange));
		dojo.subscribe("/davinci/ui/widgetPropertiesChanges",  dojo.hitch(this, this._objectPropertiesChange));
	},
	
	setDevice : function(deviceName) {
	    this.deviceName = deviceName;
	    var svgfilename;
	    if(deviceName=='none'){
	    	svgfilename=null;
	    }else{
			//FIXME: Path shouldn't be hard-coded
	    	svgfilename = "app/preview/images/"+deviceName+".svg";
	    }
		this.silhouetteiframe.setSVGFilename(svgfilename);
	},
	
	toggleOrientation : function() {
		if(this._orientation == 'landscape'){
			this._orientation = 'portrait';
		}else{
			this._orientation = 'landscape';			
		}
		this.silhouetteiframe.setOrientation(this._orientation)	;
	},

	_objectPropertiesChange : function (event){

		if(!this.isActiveEditor() )
			return;
		var context = this.getContext();
		var command = event.command;	
		command.setContext(context);
		context.getCommandStack().execute(command);
		if(command._newId){
			var widget = davinci.ve.widget.byId(command._newId, context.getDocument());
			context.select(widget);
		}else{
			var selection = context.getSelection();
			var widget = (selection.length > 0 ? selection[selection.length - 1] : undefined);
			if(selection.length > 1){
				context.select(widget);
			}
		}
		//context.onSelectionChange(context.getSelection());
		this._srcChanged();
	},
	

	isActiveEditor : function(){
		return  (davinci.Runtime.currentEditor && davinci.Runtime.currentEditor.declaredClass=="davinci.ve.PageEditor" && davinci.Runtime.currentEditor.visualEditor == this);
	},
	
	_stylePropertiesChange : function (value){
		
		if(!this.isActiveEditor() ){
			return;
		}
		
		var context = this.getContext();
		var selection = context.getSelection();
		var widget = (selection.length > 0 ? selection[selection.length - 1] : undefined);

		if(selection.length > 1){
			context.select(widget);
		}
		
		var command = null;
		
		if(value.appliesTo=="inline"){
			var allValues = {};
			/* rewrite any URLs found */
			
			var filePath = new davinci.model.Path(this.fileName);
			
			for(var name in value.values){
				if(davinci.ve.utils.URLRewrite.containsUrl(value.values[name])){
					
					var oldUrl = new davinci.model.Path(davinci.ve.utils.URLRewrite.getUrl(value.values[name]));
					if(!oldUrl.isAbsolute){
						var newUrl = oldUrl.relativeTo(filePath).toString();
						var newValue = davinci.ve.utils.URLRewrite.replaceUrl(value.values[name], newUrl)
						allValues[name]=newValue;
					}else{
						allValues[name]=value.values[name];
					}
				}else{
					allValues[name]=value.values[name];
					
				}
			}
			
			command = new davinci.ve.commands.StyleCommand(widget, allValues, value.applyToWhichStates);	
		}else{
			var rule=null;
			
			// if type=="proposal", the user has chosen a proposed new style rule
			// that has not yet been added to the given css file (right now, app.css)
			if(value.appliesTo.type=="proposal"){

				//FIXME: Not included in Undo logic
				var cssFile = this.context.model.find({'elementType':'CSSFile', 'url': value.appliesTo.targetFile}, true );
				if(!cssFile){
					console.log("Cascade._changeValue: can't find targetFile");
					return;
				}
				var rule = cssFile.addRule(value.appliesTo.ruleString+" {}");
			}else{
				rule = value.appliesTo.rule;
			}
			
			/* update the rule */
			var command = new davinci.ve.commands.ModifyRuleCommand(rule, value.values);
		}
		if(command){
			context.getCommandStack().execute(command);
			if(command._newId){
				var widget = davinci.ve.widget.byId(command._newId, context.getDocument());
				this.context.select(widget);
			}
			
			this._srcChanged();
			dojo.publish("/davinci/ui/widgetValuesChanged",[value]);
		}
	},
	_srcChanged : function(){
		this.isDirty = true;
	},
	
	getContext : function(){
		return this.context;
	},

	getTemplate: function(){
		//FIXME: use dojo.cache?
		if(!this.template){
			dojo.xhrGet({
				url: dojo.moduleUrl("davinci.ve")+"template.html",
				handleAs: "text",
				sync: true
			}).addCallback(dojo.hitch(this, function(result){
				this.template = result;
			}));
		}
		return this.template;
	},
	destroy : function (){
		dojo.forEach(this._handles,dojo.disconnect);
	},
	
	setContent : function (fileName, content){
		this._setContent(fileName, content);
	},
	
	saveAs : function (newFileName, oldFileName, content){
		
		this._setContent(newFileName, content);
	},
	
	_setContent : function(filename,content){
		var relativePrefix="";
		var folderDepth=new davinci.model.Path(filename).getSegments().length-1;
		if (folderDepth){
			for (var i=0;i<folderDepth;i++){
				relativePrefix+="../";
			}
		}
		this._setContentRaw(filename, relativePrefix, content);
	},
	
	_setContentRaw : function(filename,relativePrefix, content){
		this.fileName=filename;
		this.basePath=new davinci.model.Path(filename);
	   
		if (!this.initialSet){
			
			var loc=location.href;
			if (loc.charAt(loc.length-1)=='/'){
				loc=loc.substring(0,loc.length-1);
			}
		   	while(filename.indexOf(".")==0 || filename.indexOf("/")==0){
		   		filename = filename.substring(1,filename.length);
			}				
			var baseUrl=loc+'/user/'+davinci.Runtime.userName+'/ws/workspace/'+filename;

			this._handles=[];
			var containerNode = dojo.query('.silhouette_div_container',this.contentPane.domNode)[0];
			this.context = new davinci.ve.Context({
				editor: this._pageEditor,
				visualEditor: this,
				containerNode: containerNode,
				immediatePropertyUpdates: true,
				model: content,
				baseURL: baseUrl,
				relativePrefix: relativePrefix,
				iframeattrs:{'class':'silhouetteiframe_iframe'}
			});

			this.context._commandStack=this._commandStack;
			this._commandStack._context=this.context;
//			this.context.addActionGroup(new davinci.ve.actions.ContextActions());
//			this.context.addActionGroup(new davinci.ve.actions.ChildActions());

			var prefs=davinci.workbench.Preferences.getPreferences('davinci.ve.editorPrefs');
			if (prefs) {
				this.context.setPreferences(prefs);
			}

//			this._handles.push(dojo.connect(this.context, "activate", this, this.update));
			this._handles.push(dojo.connect(this.context, "onContentChange", this,this.onContentChange));
//			this._handles.push(dojo.connect(this.context, "onSelectionChange",this, this.onContentChange));
		
			this.title = dojo.doc.title;

			this.context._setSource(content, dojo.hitch(this, function(){
				this.savePoint = 0;
				this.context.activate();
				var popup=davinci.Workbench.createPopup({partID:'davinci.ve.visualEditor',
					domNode:this.context.getContainerNode(), 
					keysDomNode: this.context.getDocument(), context:this.context});
				var context=this.context;
				popup.adjustPosition=function (event)
				{
					var frameNode = context.getFrameNode();
					var coords = context.getDojo().position(frameNode),
						containerNode = context.getContainerNode();
					return {
						x: (coords.x - containerNode.parentNode.scrollLeft),
						y: (coords.y - containerNode.parentNode.scrollTop)
					};
				};
			}));
	   		// set flow layout on user prefs
			var flow = this.context.getFlowLayout(); // gets the current layout, but also sets to default if missing..
			this.initialSet=true;
		}else{
			this.context.setSource(content);
		}
	},

	supports : function (something){
		return ( something == "palette" || something =="properties" || something =="style"|| something == "states" || something=="inline-style" || something=="MultiPropTarget");
	},
	
	getIsDirty : function(){
		var dirty = (this.context.getCurrentPoint() != this.savePoint);
	},

	getSelectedWidget : function(){
		//if(this._selectedWidget)
		//	return this._selectedWidget;
		
		var context = this.getContext();
		
		var selection = context.getSelection();
		var widget = (selection.length > 0 ? selection[selection.length - 1] : undefined);
		if(selection.length > 1){
			context.select(widget);
		}
		return widget;
	},
	getSelectedSubWidget : function(){
		if(this._selectedSubWidget){
			return this._selectedSubWidget;
			
		}
	},
	getDefaultContent : function (){
		return null;
	},

	saved : function(){
		this.save();
	},
	getFileEditors : function(){
		debugger;
	},
	
	save : function (isAutoSave){
		var model = this.context.getModel();
		model.setDirty(true);
		var visitor = {
			visit: function(node){
				if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){
					node.save(isAutoSave);
				}
				return false;
			}
		};
		
		model.visit(visitor);
		this.isDirty=isAutoSave;
	},
	
	getDefaultContent : function (){
		return this.getTemplate();
	},
	
	previewInBrowser : function(){
		var deviceName = this.deviceName;
		var editor = davinci.Workbench.getOpenEditor();
		var fileURL = editor.resourceFile.getURL();
		// FIXME. Phil, is there a URL to the working copy of the current file that we can use
		// Right now I am doing an auto-save which is not right.
		// Either we should prompt user "You must save before you can preview in browser. OK to save?"
		// or we should preview the working copy instead of the permanent file.
		editor.save();
		if(deviceName && deviceName.length>0 && deviceName!='none'){
			var orientation_param = (this._orientation == 'landscape') ? '&orientation='+this._orientation : "";
			var url = window.location.href+'?preview=1&device='+encodeURI(deviceName)+'&file='+encodeURI(fileURL)+orientation_param;
			window.open(url);
		}else{
			window.open(fileURL);
		}
	}
});

davinci.ve.VisualEditor.EDITOR_ID="davinci.ve.HTMLPageEditor";
