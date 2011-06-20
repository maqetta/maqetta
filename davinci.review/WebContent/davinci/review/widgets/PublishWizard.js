dojo.provide("davinci.review.widgets.PublishWizard");

dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.data.QueryReadStore");
dojo.require("dojox.widget.Toaster");
dojo.require("dojo.string");
dojo.require("dijit.Dialog");
dojo.require("dijit.Tree");
dojo.require("davinci.resource");
dojo.require("davinci.model.Resource");

dojo.declare("davinci.review.widgets.PublishWizard",[dijit._Widget, dijit._Templated],{
	templateString: dojo.cache("davinci", "review/widgets/templates/PublishWizard.html"),
	warningString: dojo.cache("davinci", "review/widgets/templates/MailFailureDialogContent.html"),
	
	postCreate: function(){
	
		var sc = this.reviewerStackContainer = new dijit.layout.StackContainer({},this.reviewerStackContainer);
		
		var page1 = this.page1 = new dijit.layout.ContentPane({style:"overflow:hidden;"});
		var page2 = this.page2 = new dijit.layout.ContentPane({style:"overflow:hidden;"});
		var page3 = this.page3 = new dijit.layout.ContentPane({style:"overflow:hidden;"});
		this.reviewerStackContainer.addChild(page1);
		this.reviewerStackContainer.addChild(page2);
		this.reviewerStackContainer.addChild(page3);
		
		this._initPage1();
		this._initPage2();
		this._initPage3();
		this._initButtons();
				
		dojo.place(this.page1Node,page1.domNode);
		dojo.place(this.page2Node,page2.domNode);
		dojo.place(this.page3Node,page3.domNode);
				
		sc.startup();
		this._subs=[
			dojo.subscribe(sc.id+"-selectChild", dojo.hitch(this,this._onPageSelected)),
			dojo.subscribe("/davinci/review/publish/valueChanged", dojo.hitch(this,this.updateSubmit)),
			dojo.subscribe("/davinci/review/deleteReviewFile", dojo.hitch(this,this.delFiles)),
			dojo.subscribe("/davinci/review/deleteReviewer",dojo.hitch(this,this.delRow))
		];
	},
	
	_initPage1: function(){
		this.versionTitle = new dijit.form.ValidationTextBox({
			onChange: this._onValueChange,
			required: true
		},this.versionTitle);
		
		this.receiveEmail = new dijit.form.CheckBox({
			checked:true
		},this.receiveEmail);
		
		this.descriptions = new dijit.form.SimpleTextarea({
			style: "width:460px;height:100px;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:100%;"
		},this.descriptions);
		
		this.desireWidth = new dijit.form.NumberTextBox({
			constraints:{min:0,
						places:0},
			value: 1024,
			style: "width:85px"
		},this.desireWidth);
		
		this.desireHeight = new dijit.form.NumberTextBox({
			constraints:{min:0,
						places:0},
			value: 768,
			style: "width:85px"
		},this.desireHeight);
		var current = new Date();
		this.dueDate = new dijit.form.DateTextBox({
			onChange: this._onValueChange,
			type: "text",
			constraints: {
				min: new Date(current.getFullYear(),current.getMonth(),current.getDate())
			}
		},this.dueDate);
	},
	
	_initPage2: function(){
		var sourceTreeCP = new dijit.layout.ContentPane({style:"height:170px;padding:0"});
		var targetTreeCP = new dijit.layout.ContentPane({style:"height:170px;padding:0"});
		this.sourceTreeCP.appendChild(sourceTreeCP.domNode);
		this.targetTreeCP.appendChild(targetTreeCP.domNode);
		
		
		var reviewFiles = [];
		var fileIndex= this.fileIndex = 1;
		this.reviewFiles = reviewFiles;
					
		var sourceTreeModel=this.sourceTreeModel = new davinci.review.actions.ReviewFileTreeModel({
			root : new davinci.model.Resource.Folder(".",null),
			foldersOnly:false
		});
		var doubleClick = function(item){
			this.addFiles([item]);
		};
		var sourceTree= this.sourceTree = new dijit.Tree({
			showRoot:false,
			model: sourceTreeModel, 
			
			labelAttr: "name", 
			childrenAttrs:"children",
			getIconClass: dojo.hitch(this,this._getIconClass),
			isMultiSelect : true,
			onDblClick: dojo.hitch(this,doubleClick),
			filters:[davinci.resource.alphabeticalSortFilter]
		});
		sourceTreeCP.domNode.appendChild(sourceTree.domNode);
		sourceTree.startup();
		
		var targetTreeModel=this.targetTreeModel = new davinci.review.actions.ReviewFileTreeModel({
			root : new davinci.review.model.Resource.Empty(),
			foldersOnly:false
		});
		var targetTree = this.targetTree = new davinci.review.widgets.Tree({
			showRoot:false,
			model: targetTreeModel, 
			
			labelAttr: "name", 
			childrenAttrs:"children",
			getIconClass: dojo.hitch(this,this._getIconClass),
			isMultiSelect : true
		});
		targetTreeCP.domNode.appendChild(targetTree.domNode);
		targetTree.startup();
	},
	
	_initPage3: function(){
		var formatPic = function(result){
			if(!this.photoRepositoryUrl){
				this.photoRepositoryUrl = davinci.Runtime.serverJSONRequest({
					url:"./cmd/getBluePageInfo",
					handleAs: "text",
					content:{'type': "photo"},
					sync: true
				});
			}
			if(this.photoRepositoryUrl == "" || this.photoRepositoryUrl == "not-implemented"){
				this.photoRepositoryUrl =  "app/davinci/review/resources/img/profileNoPhoto.gif?";
			}
			return '<img src="' + this.photoRepositoryUrl + result + '" width="35px" height="35px" alt="User Photo"></img>';
		};
		
		var formatHref = function(result){
			return '<a href="javascript:dojo.publish(\'/davinci/review/deleteReviewer\',[])"><img class="delImg" src="app/davinci/review/resources/img/del.gif"/></a>';
		};
		
		var layoutCountries = [ {

			cells : [ {
				name : "User",
				field : 'email',
				formatter: formatPic,
				width : "70px",
				styles: "text-align: center;"
			}, {
				name : "Email",
				field : 'displayName',
				width : "320px"
			}, {
				name:"Action",
				field:"action",
				formatter: formatHref,
				width: "70px",
				styles: "text-align: center;"
			}
			]
		} ];
	
		var emptyData = {
			identifier : 'email',
			label : 'name',
			items : []
		};
		this.userData=emptyData.items;
		var jsonStore = new dojo.data.ItemFileWriteStore( 
			{data : emptyData}
		);
		this.jsonStore = jsonStore;
		var grid = new dojox.grid.DataGrid( {
			
			elasticView : "1",
			store : jsonStore,
			structure : layoutCountries,
			style:"height:100%;width:100%;",
			canSort:function(index){
				if(index==1){
					return false;
				}
				return true;
			},
			canResize:function(){
				return false;
			},
			delRow: function(e){
				this.removeSelectedRows();
				jsonStore.save();
			}
		});
		this.grid = grid;
		this.userGrid.appendChild(grid.domNode);
		grid.startup();
		this.addReviewerButton = new dijit.form.Button({
			disabled:true,
			onClick:dojo.hitch(this,this.addReviewer),
			label: "<div style='width:75px;height:10px;margin:-6px 0 0 0'>Add</div>"
		},this.addReviewerButton);
		
		var stateStore = new dojox.data.QueryReadStore({
			url: "./cmd/getBluePageInfo",
			fetch: function(request) {
				var searchQuery = request.query.displayName;
				searchQuery = searchQuery.substring(0, searchQuery.length - 1);
				request.serverQuery = {searchname: searchQuery};
				if(searchQuery=="")
					return;
				return this.inherited("fetch", arguments);
			}
		});
		
		this.addReviewerCombox = new dijit.form.ComboBox({
			regExpGen: dojo.hitch(this, this._emailAddress),
			required: true,
			store: stateStore,
			searchAttr: "displayName",
			name: "displayName",
			autoComplete: false,
			hasDownArrow: false,
			highlightMatch: "all",
			style: "width:220px", 
			onChange: dojo.hitch(this,this._reviewerComboxValueChanged),
			onKeyUp: dojo.hitch(this,this._updateAddButton),
			pageSize: 10,
			searchDelay: 500,
			placeHolder: "Enter a name or email address"
		},this.addReviewerCombox);
	},
	
	_emailAddress: function(/*Object?*/flags){
		// summary: Builds a regular expression that matches an email address
		//
		//flags: An object
		//    flags.allowCruft  Allow address like <mailto:foo@yahoo.com>.  Default is false.
		//    flags in regexp.host can be applied.
		//    flags in regexp.ipAddress can be applied.

		// assign default values to missing paramters
		
		if(this.addReviewerCombox.item){
			return ".*";
		}
		
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.allowCruft != "boolean") { flags.allowCruft = false; }
		flags.allowPort = false; // invalid in email addresses

		// user name RE per rfc5322
		var usernameRE = "([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+";

		// build emailAddress RE
		var emailAddressRE = usernameRE + "@" + dojox.validate.regexp.host(flags);

		// Allow email addresses with cruft
		if ( flags.allowCruft ) {
			emailAddressRE = "<?(mailto\\:)?" + emailAddressRE + ">?";
		}

		return emailAddressRE; // String
	},
	
	_initButtons: function(){
		this.invite = new dijit.form.Button({
			disabled: true,
			onClick: dojo.hitch(this,function(){this.publish();}),
			style: "float:right;"
		},this.invite);
		this.next = new dijit.form.Button({
			onClick: dojo.hitch(this,function(){this.reviewerStackContainer.forward();}),
			style: "float:right;"
		},this.next);
		this.prev = new dijit.form.Button({
			onClick: dojo.hitch(this,function(){this.reviewerStackContainer.back();}),
			style: "float:right;"
		},this.prev);
		
		this.saveDt = new dijit.form.Button({
			onClick: dojo.hitch(this,function(){this.publish(true);}),
			style: "float:right;"
		},this.saveDt);
	},
	
	_reviewerComboxValueChanged: function(){
		if(this.addReviewerCombox.item)
			this.addReviewer();
	},
	
	_updateAddButton: function(e){
		var valid = this.addReviewerCombox.isValid();
		this.addReviewerButton.set("disabled",!valid);
		if(e.keyCode==13&&valid)
			this.addReviewer();
	},
	
	delRow: function(){
		this.grid.delRow();
		dojo.publish('/davinci/review/publish/valueChanged');
	},
	
	addReviewer: function(){
		var item = this.addReviewerCombox.item;
		var displayName,
			email,
			name;
		if(item){
			displayName = this.addReviewerCombox.value.split(",").join("");
			email = item.i.emailaddress;
			name = item.i.name;
			name = name.split(",").join("");
		}
		else{
			name = email = displayName = this.addReviewerCombox.get("value");
		}
		this.jsonStore.fetchItemByIdentity({identity:email,onItem:function(i){
			item = i;
		}});
		var grid = this.grid;
		if(item){
			var index = grid.getItemIndex(item);
			grid.scrollToRow(index);
			//grid.get("selection").select(index);
			var node = grid.getRowNode(index);
			_flash=  function(elem){
				if(!elem) return;

				dojo.fx.chain([
				               dojo.fadeOut({ node: elem, duration: 300 }),
				               dojo.fadeIn({ node: elem, duration:700 }),
				               dojo.fadeOut({ node: elem, duration: 300 }),
				               dojo.fadeIn({ node: elem, duration:700 })
				               ]).play();
			};
			_flash(node);
			node.removeAttribute("style");
		}
		else{
			this.jsonStore.newItem({name: name, email: email,displayName:displayName});
			grid.scrollToRow(grid.get("rowCount"));
			this.addReviewerCombox.item=null;
			this.addReviewerCombox.reset();
			this.addReviewerButton.set("disabled",true);
			dojo.publish('/davinci/review/publish/valueChanged');
		}
	},
	
	_onValueChange: function(){
		dojo.publish('/davinci/review/publish/valueChanged');
	},
	
	_onPageSelected: function(page){
		this.prev.set("disabled", page.isFirstChild);
		this.next.set("disabled", page.isLastChild);
		dojo.removeClass(this.navPage1,"current");
		dojo.removeClass(this.navPage2,"current");
		dojo.removeClass(this.navPage3,"current");
		
		if(page==this.page1){
			dojo.addClass(this.navPage1,"current");
			
		}
		if(page==this.page2){
			dojo.addClass(this.navPage2,"current");
		}
		if(page==this.page3){
			dojo.addClass(this.navPage3,"current");
		}
		
	},
	

	updateSubmit : function(){
		var valid=this.versionTitle.isValid()&& this.dueDate.isValid();
		var valid2 = this.reviewFiles&&this.reviewFiles.length>0;
		var valid3 = this.userData.length>0;
		dojo.removeClass(this.navPage1,valid?"todo":"done");
		dojo.addClass(this.navPage1,valid?"done":"todo");
		dojo.removeClass(this.navPage2,valid2?"todo":"done");
		dojo.addClass(this.navPage2,valid2?"done":"todo");
		dojo.removeClass(this.navPage3,valid3?"todo":"done");
		dojo.addClass(this.navPage3,valid3?"done":"todo");
		this.invite.set("disabled",!(valid&&valid2&&valid3));
		var errMsg="";
		if(!valid3) errMsg = "No reviewers selected yet";
		if(!valid2) errMsg = "No files selected yet";
		if(!this.dueDate.isValid()) errMsg = "Due Date incorrect";
		if(!this.versionTitle.isValid()) errMsg = "Title required";
		this.reviewMsg.innerHTML = errMsg;
	},
	
	select:function(evt){
		var target = evt.target;
		var stackContainer = this.reviewerStackContainer;
		if (target == this.navPage1) {
			stackContainer.selectChild(this.page1, true);
		}
		else if(target == this.navPage2){
			stackContainer.selectChild(this.page2, true);
		}
		else if(target == this.navPage3){
			stackContainer.selectChild(this.page3, true);
		}
	},
	
	update:function(){
		var targetTreeModel = this.targetTreeModel;
		targetTreeModel.onChildrenChange(targetTreeModel.root,targetTreeModel.root.children);
	},
	
	containReviewFile: function(index){
		var reviewFiles = this.reviewFiles;
		var i;
		if(!isNaN(index)){
			for(i=0;i<reviewFiles.length;i++){
				if(reviewFiles[i].index ==index)
					return true;
			}
		}
		else{
			for(i=0;i<reviewFiles.length;i++){
				if(reviewFiles[i]==index)
					return true;
			}
		}
		return false;
	},
	
	getChildrenFiles: function(item){
		var reviewFiles = this.reviewFiles;
		var targetTreeModel = this.targetTreeModel;
		if(item.elementType=="File"){
			if(!this.containReviewFile(item)){
				item.index = this.fileIndex++;
				reviewFiles.push(item);
				
				var file = new davinci.model.Resource.File(item.name,targetTreeModel.root);
				file.index = item.index;
				targetTreeModel.root.children.push(file);
			}
			
		}
			
		else if(item.elementType=="Folder"){
			var children;
			item.getChildren(function(c){children=c;},true);
			dojo.forEach(children, dojo.hitch(this,function(item){
				if(item.elementType=="File")
					this.getChildrenFiles(item);
				})
			);
		}
	},
	addSelectFiles: function(){
		var selections = this.sourceTree.get("selectedItems");
		this.addFiles(selections);
	},
	addFiles: function(files){
		
		var selections = this.sourceTree.get("selectedItems");
		if(files)
			selections = files;
		dojo.forEach(selections, dojo.hitch(this,function(item){
			this.getChildrenFiles(item);
			
		}));
		this.update();
		dojo.publish('/davinci/review/publish/valueChanged');
	},
	delFiles: function(item){
		var reviewFiles = this.reviewFiles;
		selections = this.targetTree.getSelectedItems();
		if(item)
			selections = [item];
		dojo.forEach(selections, dojo.hitch(this,function(item){
			if(item.index){
				var tmp,i;
				for(i=0;i<reviewFiles.length;i++){
					if(item.index==reviewFiles[i].index){
						tmp=reviewFiles[i];
						reviewFiles.splice(i,1);
						break;
					}
				}
				if(!tmp)
					return;
				var list = item.parent.children;
				for(i=0;i<list.length;i++)
					if(item==list[i])
					{
						item.parent.children.splice(i, 1);
						break;
					}
				this.update(tmp);
			}
		}));
		dojo.publish('/davinci/review/publish/valueChanged');
	},
	
	_getIconClass: function(item, opened){

		if (item.elementType=="Folder")
			return  opened ? "dijitFolderOpened" : "dijitFolderClosed";
		if (item.elementType=="File")
		{
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
	},
	
	initData: function(node,isRestart){
		this.node = node;
		this.isRestart =  isRestart;
		if(!node){
			var	latestVersionId = davinci.Runtime.serverJSONRequest({
	            url: "./cmd/getLatestVersionId",
	            sync: true
	        });
			
			this.versionTitle.set("value","version " +latestVersionId);
		}
		if(node){
			var vName = !isRestart?node.name:node.name+" (R)";
			this.versionTitle.set('value',vName);
			if(!this.isRestart)
				this.dueDate.set('value',node.dueDate=="infinite"?"":node.dueDate);
				this.desireWidth.set('value',node.width==0?"":node.width);
				this.desireHeight.set('value',node.height==0?"":node.height);
				if(node.description){
					this.descriptions.set('value',node.description);
			}
			this.receiveEmail.set('value',node.receiveEmail);
			//init review files
			var children;
			node.getChildren(function(c){children=c;},true);
			dojo.forEach(children,dojo.hitch(this,function(item){
				var path = new davinci.model.Path(item.name);
				var segments = path.getSegments();
				item = this.sourceTreeModel.root;
				var i;
				var search = function(item,name){
					var newChildren;
					item.getChildren(function(children){newChildren=children;},true);
					for(i=0;i<newChildren.length;i++){
						if(newChildren[i].name == name)
							return newChildren[i];
					}
					return null;
					
				};
				for(i=0;i<segments.length;i++){
					item = search(item,segments[i]);
					if(item==null)
						break;
				}
				if(item!=null){
					this.addFiles([item]);
				}
			}));
			//init reviewers
			var i;
			for(i = 0;i< node.reviewers.length;i++){
				this.jsonStore.newItem({name: node.reviewers[i].name, 
					email: node.reviewers[i].email,
					displayName: node.reviewers[i].name+' ('+node.reviewers[i].email+')'});
			}
			
			
		}
	},
	
	publish : function(value) {
		var reviewers = "";
		var emails = "";
		var i;
		for(i=0;i<this.userData.length;i++){
			
			if(this.userData[i].name&&this.userData[i].name!="")
					reviewers = reviewers + this.userData[i].name+",";
				else
					reviewers = reviewers + this.userData[i].email+",";
			emails = emails+ this.userData[i].email+",";
			
			
		}
		var messageTextarea = this.descriptions;
		var message = messageTextarea.value;
		var versionTitle = this.versionTitle.value;
		var dueDate = this.dueDate.get('value');
		var dueDateString = dueDate?dojo.date.locale.format( 
				dueDate, {selector:'date', 
	                datePattern:'MM/dd/yyyy', 
	                timePattern:'HH:mm:ss'}).toLowerCase():"infinite";
		var desireWidth = this.desireWidth.value||0;
		var desireHeight = this.desireHeight.value||0;
		var	resources=dojo.map(this.reviewFiles,function(item){
			return item.getPath();
		});
		var receiveEmail = this.receiveEmail.get("value")=="on"?"true":"false";
		var warningString = this.warningString;
		
		dojo.xhrPost({url:"./cmd/publish",sync:false,handleAs:"text",
			content:{
			'isUpdate':this.node&&!this.isRestart?true:false,
			'isRestart':this.isRestart?true:false,
			'vTime':this.node?this.node.timeStamp:null,
			'reviewers':reviewers,
			'emails':emails,
			'message':message,
			'versionTitle':versionTitle,
			'resources' :resources,
			'desireWidth':desireWidth,
			'desireHeight':desireHeight,
			'savingDraft':value,
			'dueDate':dueDateString,
			'receiveEmail':receiveEmail},
			error: function(response){
				var msg = response.responseText;
				msg = msg.substring(msg.indexOf("<title>")+7, msg.indexOf("</title>"));
				davinci.Runtime.handleError("Error to publish review session "
					       + ", response="
					       + response+", reason="+
					       msg);
			}
		}).then(function(result){
			if(typeof hasToaster == "undefined"){
            	new dojox.widget.Toaster({
            			position: "br-left",
            			duration: 4000,
            			messageTopic: "/davinci/review/resourceChanged"
            	});
            	hasToaster = true;
        	}
            if (result=="OK"){
            	if(!value){
            		dojo.publish("/davinci/review/resourceChanged", [{message:"You have successfully invited the reviewers!", type:"message"},"create"]);
            	}else{
            		dojo.publish("/davinci/review/resourceChanged", [{message:"Saved as draft successfully!", type:"message"},"create"]);
            	}
            }else{
            	var dialogContent = dojo.string.substitute(warningString, {htmlContent: result});
            	dojo.publish("/davinci/review/resourceChanged", [{message:"Failed to send out the invitation", type:"warning"},"create"]);
            	if(!this.invitationDialog){
            		this.invitationDialog = new dijit.Dialog({
            			title: "Warning",
            			content: dialogContent
            		});
            		this.invitationDialog.connect(dijit.byId("_mailFailureDialogButton"), "onClick", function(){
            			this.hide();
            		});
            	}else{
            		this.invitationDialog.content = dialogContent;
            	}
            	this.invitationDialog.show();
            }
		});
		this.onClose();
		
	},
	
	onClose:function(){
		
	},
	
	destroy: function(){
		this.inherited(arguments);
		dojo.forEach(this._subs, function(sub){
			dojo.unsubscribe(sub);
		});
		delete this._subs;
	}	
});
