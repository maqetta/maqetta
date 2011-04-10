dojo.provide("davinci.review.widgets.CommentForm");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.DropDownButton");
dojo.require("dojo._base.Color");
dojo.require("dojo.colors");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("davinci.review.widgets.Comment");
dojo.require("dojo.fx");

dojo.declare("davinci.review.widgets.CommentForm",[dijit._Widget, dijit._Templated],{
	templateString: dojo.cache("davinci", "review/widgets/templates/CommentForm.html"),
	
	postCreate: function(){
		this.subject = new dijit.form.TextBox({
			placeHolder: "Subject",
			style: "width: 100%"
		}, this.subjectNode);
		this.content = new dijit.form.SimpleTextarea({
			rows: 4,
			style: "width: 100%; margin: 2px 0px 2px 0px;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:100%;"
		}, dojo.create("div"));
		this.contentNode.appendChild(this.content.domNode);
		this._constructCommentTypes();
		this._constructSeverities();
		var submitButton = new dijit.form.Button({
			label: "Submit", 
			onClick: dojo.hitch(this, "_submit")
		}, this.submitNode);
		
		this.replyTo = 0;
		this.connect(this.cancelNode, "click", "hide");
		this.connect(this.content, "onFocus", "hidePlaceHolder");
		this.connect(this.content, "onBlur", "showPlaceHolder");
		this.connect(this.placeHolder, "click", function(){
			this.hidePlaceHolder();
			this.content.focus();
		});
		
		var viewActions=this._getActions();
		var tb=dojo.create("span", {style: {display: "inline-block"}},this.toolbarNode);
    	var toolbar = davinci.Workbench._createToolBar("xx", tb, viewActions,this);
		dojo.style(toolbar.domNode,{"display":"inline-block"});
	},
	
	_getActions: function()
	{
		var editorActions=[];
		var extensions = davinci.Runtime.getExtensions('davinci.annotationActions', function(ext){
			editorActions.push(ext.editorContribution);
			return true;
			
		});
		return editorActions;
	},
	
	hide: function(){
		this.isShowing = false;
		this.onHide();
		dojo.style(this.domNode, "display", "none");
		this.reset();
	},
	
	onHide: function(){
		// Placeholder
	},
	
	show: function(){
		this.isShowing = true;
		dojo.style(this.domNode, "display", "block");
		dojo.window.scrollIntoView(this.domNode);
	},
	
	_submit: function(){
		var subject = this.subject.get("value"),
			content = this.content.get("value").replace(/\n/g, "<br/>"),
			type = dojo.byId(this.type.id + "_label" ).innerHTML,
			severity = this.severity.containerNode.innerHTML,
			func = this._update ? "onUpdate" : "onSubmit";
		
		this[func]({
			subject: subject,
			content: content,
			type: type,
			severity: severity
		});
	},
	
	onSubmit: function(args){
		// Placeholder to be connected
	},
	
	onUpdate: function(args){
		// Placeholder to be connected
	},
	
	/**
	 * Generate a drop down button for comment types.
	 */
	_constructCommentTypes : function(){
		var typeList = new dijit.Menu();
		this.type = new dijit.form.DropDownButton({
				label: "Unassigned",
				iconClass: "dijitEditorIcon emptyIcon",	//Here use an empty icon, the generated DropDownButton will align automatically.
				dropDown : typeList
			}, this.commentType);
		
		typeList.addChild(new dijit.MenuItem({ 
			label : "Unassigned",
			onClick: dojo.hitch( this, "setTypeButtonLabel", "Unassigned" )
		}));
		
		typeList.addChild(new dijit.MenuItem({ 
			label : "Requirement",
			onClick: dojo.hitch( this, "setTypeButtonLabel", "Requirement" )
		}));
		typeList.addChild(new dijit.MenuItem({ 
			label : "Task",
			onClick: dojo.hitch( this, "setTypeButtonLabel", "Task" )
		}));
		typeList.addChild( new dijit.MenuItem({ 
			label : "Defect",
			onClick: dojo.hitch( this, "setTypeButtonLabel", "Defect" )
		}));
		
		
		if(!dojo.hasClass(this.type.domNode.parentNode, "commentTheme")){
			dojo.addClass(this.type.domNode.parentNode, "commentTheme");
		}
	},
	
	/**
	 * Generate a drop down button for comment severity(High, Low, Medium).
	 */
	_constructSeverities : function(){
		var severityList = new dijit.Menu();
		
		this.severity = new dijit.form.DropDownButton({
			label: "Unassigned",
			iconClass: "dijitEditorIcon severityUnassigned",
			dropDown : severityList
		}, this.commentSeverity);
		
		severityList.addChild(new dijit.MenuItem({
			label: "Unassigned",
			iconClass: "dijitEditorIcon severityUnassigned",
			onClick: dojo.hitch( this, "setSeverityButtonLabel", "Unassigned" )
		}));
		
		severityList.addChild(new dijit.MenuItem({
			label: "Low",
			iconClass: "dijitEditorIcon severityLow",
			onClick: dojo.hitch( this, "setSeverityButtonLabel", "Low" )
		}));
		
		severityList.addChild(new dijit.MenuItem({
			label: "Medium",
			iconClass: "dijitEditorIcon severityMedium",
			onClick: dojo.hitch( this, "setSeverityButtonLabel", "Medium" )
		}));
		
		severityList.addChild(new dijit.MenuItem({
			label: "High",
			iconClass: "dijitEditorIcon severityHigh",
			onClick: dojo.hitch( this, "setSeverityButtonLabel", "High" )
		}));
		
		// Add this class to override the Claro theme.
		if (!dojo.hasClass( this.severity.domNode.parentNode, "commentTheme" )){
			dojo.addClass( this.severity.domNode.parentNode, "commentTheme" );
		}
	},
	
	setSeverityButtonLabel: function(severity){
		this.severity.set("label", severity);
		dojo.removeClass(this.severity.iconNode, "severityUnassigned severityLow severityMedium severityHigh emptyIcon" );
		dojo.addClass(this.severity.iconNode, "severity" + severity);
	},
	
	setTypeButtonLabel: function(type){
		this.type.set("label", type);
	},
	
	reset: function(){
		dojo.style(this.subject.domNode, "display", "block");
		this.placeHolder.innerHTML = "Comment";
		this.showPlaceHolder();
		this.subject.set("value", "");
		this.content.set("value", "");
		this.replyTo = 0;
		this.placeAt(this.parentNode, "first");
		this._update = false;
		this.isShowing = false;
		this.editFrom = null;
	},
	
	/**
	 * When the comment form firstly shows, the text hint should be "Enter comment here", in grey color.
	 * @returns
	 */
	showPlaceHolder : function(){
		if(""==this.content.get("value"))
		dojo.removeClass(this.placeHolder,"davinciReviewHide");
	},
	
	hidePlaceHolder: function(){
		dojo.addClass(this.placeHolder,"davinciReviewHide");
	},
	
	setReplyMode: function(){
		dojo.style(this.subject.domNode, "display", "none");
		this.placeHolder.innerHTML = "Comment reply";
	},
	
	setEditMode: function(){
		this._update = true;
	},
	
	moveTo: function(/*DomNode*/ parent){
		if(!this.parentNode) this.parentNode = parent;
		this.placeAt(parent);
	}
});