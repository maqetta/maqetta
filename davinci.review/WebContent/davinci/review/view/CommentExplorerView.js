dojo.provide("davinci.review.view.CommentExplorerView");

dojo.require("davinci.review.Runtime");
dojo.require("davinci.review.model.ReviewTreeModel");
dojo.require("davinci.Workbench");
dojo.require("davinci.workbench.ViewPart");
dojo.require("davinci.ui.widgets.ResourceTreeModel");
dojo.require("davinci.ui.widgets.Tree");
dojo.require("davinci.resource");
dojo.require("dojo.date.locale");
dojo.require("davinci.review.actions.OpenVersionAction");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Toolbar");
dojo.require("dijit.ToolbarSeparator");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");

dojo.declare("davinci.review.view.CommentExplorerView", davinci.workbench.ViewPart, {
	postCreate: function()
	{
		this.inherited(arguments);

		
		
		
		var model= new davinci.review.model.ReviewTreeModel();
		this.model = model;
		this.tree = new davinci.ui.widgets.Tree({
			showRoot:false,
			model: model, id:'reviewResourceTree',
			labelAttr: "name", childrenAttrs:"children",
			getIconClass: dojo.hitch(this,this._getIconClass),
			filters : [davinci.review.model.Resource.dateSortFilter,this.commentingFilter],
			isMultiSelect : true});
		
		
		this.setContent(this.tree); 
		this.tree.startup();
		dojo.connect(this.tree, 'onDblClick',  
				dojo.hitch(this,this._dblClick ));
		dojo.connect(this.tree, 'onClick',dojo.hitch(this,this._click));
		dojo.connect(this.tree,'_onNodeMouseEnter',dojo.hitch(this,this._over));
		dojo.connect(this.tree,'_onNodeMouseLeave',dojo.hitch(this,this._leave));
		this.tree.notifySelect=dojo.hitch(this, function (item){
			var items = dojo.map(this.tree.getSelectedItems(),function(item){ return {resource:item};});
			this.publish("/davinci/ui/selectionChanged",[items,this]);
	    });
		
		this.subscribe("/davinci/ui/selectionChanged","_updateActionBar");
		this.subscribe("/davinci/review/resourceChanged",function(arg1,arg2,arg3){
			if(arg3&&arg3.timeStamp){
				var node = davinci.review.model.Resource.root.findVersion(arg3.timeStamp);
				if(node)
					this.tree.set("selectedItem",node);
				else
					this.publish("/davinci/ui/selectionChanged",[{},this]);
			}
			
		});
		
		var popup=davinci.Workbench.createPopup({ partID: 'davinci.review.reviewNavigator',
				domNode: this.tree.domNode, openCallback:this.tree.getMenuOpenCallback()});

		this.detailPopup = new dijit.TooltipDialog({
			orient: function(/*DomNode*/ node, /*String*/ aroundCorner, /*String*/ corner){
				var c = this._currentOrientClass;
				if(c){
					dojo.removeClass(this.domNode, c);
				}
				c = "dijitTooltipAB"+(corner.charAt(1) == 'L'?"Left":"Right")+" dijitTooltipRight reviewTooltipRight";
					dojo.addClass(this.domNode, c);
					this._currentOrientClass = c;
			},
			closable:true,
			autofocus: false,
            content: '<div id="detail_title"></div>'+
				'<div>'+
				'<div class="detail_div"><span>Your Role:</span><span id="detail_role"></span><span>Due by:</span><span id="detail_dueDate"></span></div>'+
				'<div class="detail_div"><span>Created by:</span><span id="detail_creator"></div>'+
				
				'</div>'+
				'<div><strong>Artifacts In Review<strong></div>'+
				'<div id="detail_files"></div>'+
				'<div><strong>Reviewers</strong></div>'+
				'<div id="detail_reviewers"></div>',
			onMouseEnter: dojo.hitch(this,function(){
				if(this._deleteTime){
					clearTimeout(this._deleteTime);
					delete this._deleteTime;
				}
				if(this._showTime){
					clearTimeout(this._showTime);
					delete this._showTime;
				}
			}),
			onMouseLeave: dojo.hitch(this,function(){
				if(this._showTimer){
					clearTimeout(this._showTimer);
					delete this._showTimer;
				}
				var popup = this.detailPopup,
					stack = dijit.popup._stack,
					temp = [];
				
				
				
				while(dojo.some(stack, function(elem){return elem.widget == popup;})){
					var top = stack.pop(),
						wrapper = top.wrapper,
						iframe = top.iframe,
						widget = top.widget,
						onClose = top.onClose;
					if(top.widget != popup){
						temp.push(top);
						continue;
					}

					if(widget.onClose){
						// TODO: in 2.0 standardize onHide() (used by StackContainer) and onClose() (used here)
						widget.onClose();
					}
					dojo.forEach(top.handlers, dojo.disconnect);

					// Move the widget plus it's wrapper off screen, unless it has already been destroyed in above onClose() etc.
					if(widget && widget.domNode){
						dijit.popup.moveOffScreen(widget.domNode);
					}else{
						dojo.destroy(wrapper);
					}
		                        
					if(onClose){
						onClose();
					}
				}
				
				dojo.forEach(temp,function(item){
					stack.push(item);
				});
				
			})
        });
		if(davinci.review.Runtime.getRole()!="Designer")
		dojo.style(this.toolbarDiv, "display", "none");
	},
	
	_updateActionBar: function(item,context){
		if(context!=this||!item||!item.length) {
			this.closeBtn.set("disabled",true);
			this.editBtn.set("disabled",true);
			return;
		}
		var selectedVersion = item[0].resource.elementType=="ReviewFile"?item[0].resource.parent:item[0].resource;
		var isVersion = selectedVersion.elementType=="ReviewVersion";
		var isDraft = selectedVersion.isDraft;
		this.closeBtn.set("disabled",!isVersion||selectedVersion.closed||isDraft);
		this.openBtn.set("disabled",!isVersion||!selectedVersion.closedManual||isDraft);
		this.editBtn.set("disabled",!isVersion);
	},
	
	getTopAdditions: function(){
		var toolbar = new dijit.Toolbar({},dojo.create("div"));
		var closeBtn = new dijit.form.Button({
			id: toolbar.get("id") + ".Close",
			showLabel: false,
			label:"Close Version",
			disabled: true,
			iconClass: "viewActionIcon closeVersionIcon",
			onClick: dojo.hitch(this,"_closeVersion")
		});
		this.closeBtn = closeBtn;
		
		var openBtn = new dijit.form.Button({
			id: toolbar.get("id")+".Open",
			showLabel:false,
			label:"Open Version",
			disabled:true,
			iconClass: "viewActionIcon openVersionIcon",
			onClick: dojo.hitch(this,"_openVersion")
		});
		this.openBtn = openBtn;
		var editBtn = new dijit.form.Button({
			id: toolbar.get("id") + ".Edit",
			showLabel: false,
			label:"Edit Version",
			disabled: true,
			iconClass: "viewActionIcon editVersionIcon",
			onClick: dojo.hitch(this,"_editVersion")
		});
		this.editBtn = editBtn;
		
		var input = new dijit.form.TextBox({
			id:"reviewExplorerFilter",
			placeHolder: "Type to filter...",
			onKeyUp: dojo.hitch(this,this._filter)
		});
				
		toolbar.addChild(closeBtn);
		toolbar.addChild(openBtn);
		toolbar.addChild(new dijit.ToolbarSeparator());
		toolbar.addChild(editBtn);
				
		dojo.place(dojo.create("br"), toolbar.domNode);
		toolbar.addChild(input);
		return toolbar.domNode;
	},
	
	_closeVersion: function(){
		(new davinci.review.actions.CloseVersionAction()).run(this);
	},
	
	_openVersion: function(){
		(new davinci.review.actions.OpenVersionAction()).run(this);
	},
	
	_editVersion: function(){
		(new davinci.review.actions.EditVersionAction()).run(this);
	},
	
	_filter: function(e){
		//if(e.keyCode != dojo.keys.ENTER)return;
		var text = dijit.byId("reviewExplorerFilter").get("value");
		this.commentingFilter.filterString=text;
		dojo.forEach(this.model.root.children,dojo.hitch(this,function(item){
			
			var newChildren;
			item.getChildren(function(children){newChildren=children;},true);
			this.model.onChildrenChange(item,newChildren);
		})
		);
		
	},
	
	commentingFilter : {
		filterString:"",
	     filterItem : function(item)
	    {
		    if(!this.filterString)
		    	return false;
		    else{
		    	if(item.elementType=="ReviewFile"){
		    		if(item.name.toLowerCase().indexOf(this.filterString.toLowerCase())>=0)
		    			return false;
		    		else 
		    			return true;
		    	}
		    	return false;
		    	
		    }
	    }
	},

	destroy: function(){
		this.inherited(arguments);
	},
	
	_dblClick: function(node)
	{
		if(davinci.review.Runtime.getMode()=="reviewPage"){
			if(node.isDraft||node.parent.isDraft){
				if(davinci.review.Runtime.getRole()=="Designer")
				this._openPublishWizard(node.isDraft?node:node.parent);
				return;
			}
			if (node.elementType=="ReviewFile")
			{
				davinci.Workbench.openEditor({
					fileName: node,
					content: node.getContents()
				});
			}
		}
		else if(davinci.review.Runtime.getMode()=="designPage"){
			if(node.isDraft||node.parent.isDraft){
				if(davinci.review.Runtime.getRole()=="Designer")
				this._openPublishWizard(node.isDraft?node:node.parent);
				return;
			}
			if (node.elementType=="ReviewFile")
			{
				window.open(location.href+"review/"+davinci.Runtime.userName+"/"+node.parent.timeStamp+"/"
						+node.name+"/default");
			}
		}
	},
	
	_click: function(node){
		this.select = node;
	},
	_insertInfo: function(node){
		var item = node.item.elementType =="ReviewFile"?node.item.parent:node.item;
		dojo.byId("detail_role").innerHTML = davinci.review.Runtime.getRole();
		dojo.byId("detail_title").innerHTML = item.name;
		
		
		dojo.byId("detail_dueDate").innerHTML = item.dueDate=="infinite"?"infinite":dojo.date.locale.format( 
				item.dueDate, {selector:'date',
						formatLength:'long',
	                datePattern:'MMM dd, yyyy', 
	                timePattern:'HH:mm:ss'}).toLowerCase();
		dojo.byId("detail_creator").innerHTML = davinci.review.Runtime.getDesigner();
		
		var files="<ul>";
		var c;
		item.getChildren(function(children){c=children;},true);
		dojo.forEach(c,function(i){
			files+="<li>"+i.getLabel()+"</li>";
		});
		files+="</ul>";
		dojo.byId("detail_files").innerHTML = files;
		
		
		var reviewer="<ul>";
		dojo.forEach(item.reviewers,function(i){
			reviewer+="<li>"+i.name+"</li>";
		});
		reviewer+="</ul>";
		dojo.byId("detail_reviewers").innerHTML = reviewer;
		dojo.removeClass("detail_dueDate","closed");
		dojo.removeClass("detail_dueDate","notClosed");
		if(item.closed){
			dojo.addClass("detail_dueDate","closed");
		}
		else{
			dojo.addClass("detail_dueDate","notClosed");
		}
		
	},
	
	_over: function(node,item){
		
		if(!this._showTimer){
			
			this._showTimer = setTimeout(dojo.hitch(this, function(){
				dijit.popup.open({popup: this.detailPopup,
				around: node.domNode,orient:
				{
					'TR':'TL'
				}});
				this._insertInfo(node);
			}), 1000);
		}
		
	},
	
	_leave: function(node){
		if(this._showTimer){
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		if(this._deleteTime){
			clearTimeout(this._deleteTime);
			delete this._deleteTime;
		}
		var popup = this.detailPopup,
			stack = dijit.popup._stack,
			temp = [];
		
		this._deleteTime = setTimeout(dojo.hitch(this, function(){
		
		while(dojo.some(stack, function(elem){return elem.widget == popup;})){
			var top = stack.pop(),
				wrapper = top.wrapper,
				iframe = top.iframe,
				widget = top.widget,
				onClose = top.onClose;
			if(top.widget != popup){
				temp.push(top);
				continue;
			}

			if(widget.onClose){
				// TODO: in 2.0 standardize onHide() (used by StackContainer) and onClose() (used here)
				widget.onClose();
			}
			dojo.forEach(top.handlers, dojo.disconnect);

			// Move the widget plus it's wrapper off screen, unless it has already been destroyed in above onClose() etc.
			if(widget && widget.domNode){
				dijit.popup.moveOffScreen(widget.domNode);
			}else{
				dojo.destroy(wrapper);
			}
                        
			if(onClose){
				onClose();
			}
		}
		
		dojo.forEach(temp,function(item){
			stack.push(item);
		});
		}),1000);
	},
	
	
	
	_openPublishWizard: function(node){
		var action = new davinci.review.actions.PublishAction(node);
		action.run();
	},
	
	_getIconClass: function(item, opened){

		if (item.elementType=="ReviewVersion"){
			if(item.isDraft) return "draft-open";
			if(item.closed)return opened ? "reviewFolder-open-disabled":"reviewFolder-closed-disabled";
			if(!item.closed) return opened ? "reviewFolder-open":"reviewFolder-closed";
				
		}
		
		if (item.elementType=="ReviewFile")
		{
			if(item.parent.closed){
				return "disabledReviewFileIcon";
			}
			var icon;
			var fileType=item.getExtension();
			var extension=davinci.Runtime.getExtension("davinci.fileType", function (extension){
				return extension.extension==fileType;
			});
			if (extension)
				icon=extension.iconClass;
			return icon ||	"dijitLeaf";

		}
		return "dijitLeaf";
	}

});