define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/layout/StackContainer",
	"dijit/layout/ContentPane",
	"dijit/form/SimpleTextarea",
	"dijit/form/NumberTextBox",
	"dijit/form/ValidationTextBox",
	"dijit/form/DateTextBox",
	"dijit/form/Button",
	"dijit/form/ComboBox",
	"dojo/data/ItemFileWriteStore",
	"dijit/form/CheckBox",
	"dojox/grid/DataGrid",
	"dojox/data/QueryReadStore",
	"dojox/widget/Toaster",
	"dojox/validate/regexp",
	"dojo/_base/xhr",
	"dojo/string",
	"dojo/fx",
	"dojo/date/stamp",
	"dijit/Tree",
	"dojo/Deferred",
	"dojo/promise/all",
	"system/resource",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/model/resource/Folder",
	"davinci/model/resource/File",
	"davinci/review/model/resource/Empty",
	"davinci/review/model/resource/root",
	"dijit/tree/TreeStoreModel",
	"davinci/review/model/store/GeneralReviewReadStore",
	"dojo/i18n!./nls/widgets",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/PublishWizard.html",
	"dojo/text!./templates/MailFailureDialogContent.html"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StackContainer, ContentPane, SimpleTextarea, NumberTextBox, ValidationTextBox, DateTextBox, 
		Button, ComboBox, ItemFileWriteStore, CheckBox, DataGrid, QueryReadStore, Toaster, dojoxRegexp, xhr, dojostring, dojofx, stamp, Tree, Deferred, all,
		systemResource, Runtime, Workbench, Folder, File, Empty, ReviewRoot, TreeStoreModel, GeneralReviewReadStore, widgetsNls, dijitNls, 
		templateString, warningString) {

//WARNING: extends private dijit API
var reviewTreeNode = declare(dijit._TreeNode, {
	postCreate: function() {
		this.inherited(arguments);

		var divDom = dojo.create("img", { 
			src: "app/dojo/resources/blank.gif",
			"class": "deleteImg"
		});
		dojo.connect(divDom, "onclick", this, dojo.hitch(this, function() {
			dojo.publish("/davinci/review/deleteReviewFile", [this.item]);
		}));
		dojo.place(divDom, this.rowNode, "first");
		dojo.style(this.rowNode, {width:"99%"});
		dojo.style(this.containerNode, {display:"block"});
	}
});

var reviewTree = declare(Tree, {
	_createTreeNode: function(args) {
		return new reviewTreeNode(args);
	}
});

return declare("davinci.review.widgets.PublishWizard", [_WidgetBase, _TemplatedMixin], {

	templateString: templateString,

	postMixInProperties: function() {
		this.inherited(arguments);
		dojo.mixin(this, widgetsNls);
		dojo.mixin(this, dijitNls);
	},

	postCreate: function() {

		var sc = this.reviewerStackContainer = new StackContainer({}, this.reviewerStackContainer);

		var page1 = this.page1 = new ContentPane({style:"overflow:hidden;"});
		var page2 = this.page2 = new ContentPane({style:"overflow:hidden;"});
		var page3 = this.page3 = new ContentPane({style:"overflow:hidden;"});
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
			dojo.subscribe(sc.id+"-selectChild", dojo.hitch(this, this._onPageSelected)),
			dojo.subscribe("/davinci/review/publish/valueChanged", dojo.hitch(this, this.updateSubmit)),
			dojo.subscribe("/davinci/review/deleteReviewFile", dojo.hitch(this, this.delFiles)),
			dojo.subscribe("/davinci/review/deleteReviewer", dojo.hitch(this, this.delRow))
		];
	},

	_initPage1: function() {
		this.versionTitle = new ValidationTextBox({
			onChange: this._onValueChange,
			required: true
		},this.versionTitle);

		this.receiveEmail = new CheckBox({
			checked:true
		},this.receiveEmail);

		this.descriptions = new SimpleTextarea({
			style: "width:460px;height:100px;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:100%;"
		},this.descriptions);

		this.desireWidth = new NumberTextBox({
			constraints:{min:0,
				places:0},
				value: 1024,
				style: "width:85px"
		},this.desireWidth);

		this.desireHeight = new NumberTextBox({
			constraints:{min:0,
				places:0},
				value: 768,
				style: "width:85px"
		},this.desireHeight);
		var current = new Date();
		this.dueDate = new DateTextBox({
			onChange: this._onValueChange,
			type: "text",
			constraints: {
				min: new Date(current.getFullYear(), current.getMonth(), current.getDate())
			}
		},this.dueDate);
	},

	_initPage2: function() {
		var reviewFiles = [];
		var fileIndex = this.fileIndex = 1;
		this.reviewFiles = reviewFiles;

		var sourceTreeModel = this.sourceTreeModel = new TreeStoreModel({
			deferItemLoadingUntilExpand: true,
			store: new GeneralReviewReadStore({
				root: new Folder(Workbench.getProject(), null),
				getLabel: function(item) {
					var label = item.getName();
					if (item.link) { label=label + "  [" + item.link + "]"; }
					return label;
				}
			})
		});

		var doubleClick = function(item) {
			this.addFiles([item]);
		};
		var sourceTree = this.sourceTree = new Tree({
			id: "reviewWizardSourceTree",
			persist: false,
			showRoot: false,
			model: sourceTreeModel, 
			labelAttr: "name", 
			getIconClass: dojo.hitch(this, this._getIconClass),
			isMultiSelect: true,
			onDblClick: dojo.hitch(this, doubleClick),
			transforms: [function(items) {
				return items.sort(function(a,b) {
					a = a.name.toLowerCase();
					b = b.name.toLowerCase();
					return a < b ? -1 : (a > b ? 1 : 0);
				});
			}]
		});
		this.sourceTreeNode.appendChild(sourceTree.domNode);
		sourceTree.startup();

		var targetTreeModel = this.targetTreeModel = new TreeStoreModel({
			store: new GeneralReviewReadStore({
				root: new Empty(),
				getLabel: function(item) {
					var label = item.getName();
					if (item.link){ label=label + "  [" + item.link + "]"; }
					return label;
				}
			})
		});

		var targetTree = this.targetTree = new reviewTree({
			id: "reviewWizardTargetTree",
			showRoot: false,
			model: targetTreeModel, 
			labelAttr: "name", 
			getIconClass: dojo.hitch(this,this._getIconClass),
			isMultiSelect: true
		});
		this.targetTreeNode.appendChild(targetTree.domNode);
		targetTree.startup();
	},

	_initPage3: function() {
		var formatPic = function(result) {
			if (!this.photoRepositoryUrl) {
				this.photoRepositoryUrl = Runtime.serverJSONRequest({
					url: "cmd/getBluePageInfo",
					handleAs: "text",
					content:{'type': "photo"},
					sync: true,
				});
			}
			if (this.photoRepositoryUrl === "" || this.photoRepositoryUrl == "not-implemented") {
				this.photoRepositoryUrl =  "app/davinci/review/resources/img/profileNoPhoto.gif?";
			}
			return '<img src="' + this.photoRepositoryUrl + result + '" width="35px" height="35px" alt="User Photo"></img>';
		}.bind(this);

		var formatHref = function(result) {
			return '<a href="javascript:dojo.publish(\'/davinci/review/deleteReviewer\',[])"><img class="delImg" src="app/davinci/review/resources/img/del.gif"/></a>';
		};
		var layoutCountries = [{
			cells : [ {
				name : widgetsNls.user,
				field : 'email',
				formatter: formatPic,
				width : "70px",
				styles: "text-align: center;"
			}, {
				name : widgetsNls.emailAddress,
				field : 'displayName',
				width : "320px"
			}, {
				name: widgetsNls.action,
				field:"action",
				formatter: formatHref,
				width: "70px",
				styles: "text-align: center;"
			}]
		}];

		var emptyData = {
				identifier : 'email',
				label : 'name',
				items : []
		};
		this.userData = emptyData.items;
		var jsonStore = new ItemFileWriteStore( 
				{data : emptyData}
		);
		this.jsonStore = jsonStore;
		var grid = new DataGrid({
			elasticView: "1",
			store: jsonStore,
			structure : layoutCountries,
			style:"height:100%;width:100%;",
			canSort:function(index) {
				if (index==1) {
					return false;
				}
				return true;
			},
			canResize:function() {
				return false;
			},
			delRow: function(e) {
				this.removeSelectedRows();
				jsonStore.save();
			}
		});
		this.grid = grid;
		this.userGrid.appendChild(grid.domNode);
		grid.startup();
		this.addReviewerButton = new Button({
			disabled:true,
			onClick:dojo.hitch(this, this.addReviewer),
			label: "<div style='width:75px;height:10px;margin:-6px 0 0 0'>" + widgetsNls.add + "</div>"
		},this.addReviewerButton);

		var stateStore = new QueryReadStore({
			url: "cmd/getBluePageInfo",
			fetch: function(request) {
				var searchQuery = request.query.displayName;
				searchQuery = searchQuery.substring(0, searchQuery.length - 1);
				request.serverQuery = {searchname: searchQuery};
				return this.inherited("fetch", arguments);
			}
		});
		this.addReviewerCombox = new ComboBox({
			regExpGen: dojo.hitch(this, this._emailAddress),
			required: true,
			store: stateStore,
			searchAttr: "displayName",
			name: "displayName",
			autoComplete: false,
			hasDownArrow: false,
			highlightMatch: "all",
			style: "width:220px", 
			onChange: dojo.hitch(this, this._reviewerComboxValueChanged),
			onKeyUp: dojo.hitch(this, this._updateAddButton),
			pageSize: 10,
			searchDelay: 500,
			placeHolder: widgetsNls.enterNameOrEmail
		}, this.addReviewerCombox);
	},

	_emailAddress: function(/*Object?*/flags) {
		// summary: Builds a regular expression that matches an email address
		//
		//flags: An object
		//    flags.allowCruft  Allow address like <mailto:foo@yahoo.com>.  Default is false.
		//    flags in regexp.host can be applied.
		//    flags in regexp.ipAddress can be applied.

		// assign default values to missing paramters

		if (this.addReviewerCombox.item) {
			return ".*";
		}

		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.allowCruft != "boolean") { flags.allowCruft = false; }
		flags.allowPort = false; // invalid in email addresses

		// user name RE per rfc5322
		var usernameRE = "([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+";

		// build emailAddress RE
		var emailAddressRE = usernameRE + "@" + dojoxRegexp.host(flags);

		// Allow email addresses with cruft
		if ( flags.allowCruft ) {
			emailAddressRE = "<?(mailto\\:)?" + emailAddressRE + ">?";
		}

		return emailAddressRE; // String
	},

	_initButtons: function() {
		this.invite = new Button({
			disabled: true,
			onClick: dojo.hitch(this, function() { this.publish(); })
		},this.invite);
		this.next = new Button({
			onClick: dojo.hitch(this, function() { this.reviewerStackContainer.forward(); })
		},this.next);
		this.prev = new Button({
			onClick: dojo.hitch(this, function() { this.reviewerStackContainer.back(); })
		},this.prev);

		this.saveDt = new Button({
			onClick: dojo.hitch(this,function(){this.publish(true);})
		},this.saveDt);
	},

	_reviewerComboxValueChanged: function() {
		if (this.addReviewerCombox.item) {
			this.addReviewer();
		}
	},

	_updateAddButton: function(e) {
		var valid = this.addReviewerCombox.isValid();
		this.addReviewerButton.set("disabled", !valid);
		if (e.keyCode == 13 && valid) { 
			this.addReviewer();
		}
	},

	delRow: function() {
		this.grid.delRow();
		dojo.publish('/davinci/review/publish/valueChanged');
	},

	addReviewer: function() {
		var item = this.addReviewerCombox.item;
		var displayName,
		email,
		name;
		if (item) {
			displayName = this.addReviewerCombox.value.split(",").join("");
			email = item.i.emailaddress;
			name = item.i.name;
			name = name.split(",").join("");
		} else {
			name = email = displayName = this.addReviewerCombox.get("value");
		}
		this.jsonStore.fetchItemByIdentity({identity:email,onItem:function(i) {
			item = i;
		}});
		var grid = this.grid;
		if (item) {
			var index = grid.getItemIndex(item);
			grid.scrollToRow(index);
			var node = grid.getRowNode(index);
			dojo.fx.chain([
				dojo.fadeOut({ node: node, duration: 300 }),
				dojo.fadeIn({ node: node, duration:700 }),
				dojo.fadeOut({ node: node, duration: 300 }),
				dojo.fadeIn({ node: node, duration:700 })
			]).play();
			node.removeAttribute("style");
		} else {
			this.jsonStore.newItem({name: name, email: email, displayName: displayName});
			grid.scrollToRow(grid.get("rowCount"));
			this.addReviewerCombox.item = null;
			this.addReviewerCombox.reset();
			this.addReviewerButton.set("disabled", true);
			dojo.publish('/davinci/review/publish/valueChanged');
		}
	},

	_onValueChange: function() {
		dojo.publish('/davinci/review/publish/valueChanged');
	},

	_onPageSelected: function(page) {
		this.prev.set("disabled", page.isFirstChild);
		this.next.set("disabled", page.isLastChild);
		dojo.removeClass(this.navPage1, "current");
		dojo.removeClass(this.navPage2, "current");
		dojo.removeClass(this.navPage3, "current");

		if (page == this.page1) {
			dojo.addClass(this.navPage1 ,"current");
		}
		if (page == this.page2) {
			dojo.addClass(this.navPage2, "current");
		}
		if (page == this.page3) {
			dojo.addClass(this.navPage3, "current");
		}
	},


	updateSubmit: function() {
		var valid = this.versionTitle.isValid() && this.dueDate.isValid();
		var valid2 = this.reviewFiles && this.reviewFiles.length > 0;
		var valid3 = this.userData.length > 0;
		dojo.removeClass(this.navPage1Icon, valid ? "todo" : "done");
		dojo.addClass(this.navPage1Icon, valid ? "done" : "todo");
		dojo.removeClass(this.navPage2Icon, valid2 ? "todo" : "done");
		dojo.addClass(this.navPage2Icon, valid2 ? "done" : "todo");
		dojo.removeClass(this.navPage3Icon, valid3 ? "todo" : "done");
		dojo.addClass(this.navPage3Icon, valid3 ? "done" : "todo");
		this.invite.set("disabled", !(valid && valid2 && valid3));
		var errMsg="";
		if (!valid3) {
			errMsg = widgetsNls.noReviewersSelected;
		}
		if (!valid2) {
			errMsg = widgetsNls.noFilesSelected;
		}
		if (!this.dueDate.isValid()) {
			errMsg = widgetsNls.dueDateIncorrect;
		}
		if (!this.versionTitle.isValid()) {
			errMsg = widgetsNls.titleRequired;
		}
		this.reviewMsg.innerHTML = errMsg;
	},

	select: function (evt) {
		var target = evt.target;
		var stackContainer = this.reviewerStackContainer;
		if (target == this.navPage1 || target == this.navPage1Icon) {
			stackContainer.selectChild(this.page1, true);
		} else if (target == this.navPage2 || target == this.navPage2Icon) {
			stackContainer.selectChild(this.page2, true);
		} else if (target == this.navPage3 || target == this.navPage3Icon) {
			stackContainer.selectChild(this.page3, true);
		}
	},

	update: function() {
		var targetTreeModel = this.targetTreeModel;
		targetTreeModel.onChildrenChange(targetTreeModel.root, targetTreeModel.root.children);
	},

	containReviewFile: function(index) {
		return (this.reviewFiles || []).some(function(file){
			return isNaN(index) ? file == index : file.index == index;
		});
	},

	getChildrenFiles: function(item) {
		var reviewFiles = this.reviewFiles || [];
		var targetTreeModel = this.targetTreeModel;
		if (item.elementType == "File") {
			if (!this.containReviewFile(item)) {
				item.index = this.fileIndex++;
				reviewFiles.push(item);
				var file = new File(item.name, targetTreeModel.root);
				file.index = item.index;
				targetTreeModel.root.children.push(file);
			}
		}else if (item.elementType == "Folder") {
			item.getChildren(function(children) {
				dojo.forEach(children, dojo.hitch(this, function(item) {
					if (item.elementType == "File") {
						this.getChildrenFiles(item);
					}
				}.bind(this)));
			}.bind(this));
		}
	},

	addSelectFiles: function() {
		var selections = this.sourceTree.get("selectedItems");
		this.addFiles(selections);
	},

	addFiles: function(files) {
		var selections = this.sourceTree.get("selectedItems");
		if (files) {
			selections = files;
		}
		dojo.forEach(selections, this.getChildrenFiles, this);
		this.update();
		dojo.publish('/davinci/review/publish/valueChanged');
	},

	delFiles: function(item) {
		var reviewFiles = this.reviewFiles,
			selections = this.targetTree.get('selectedItems');
		if(item) {
			selections = [item];
		}
		dojo.forEach(selections, dojo.hitch(this, function(item) {
			if (item.index) {
				var tmp, i;
				for (i=0; i<reviewFiles.length; i++) {
					if (item.index == reviewFiles[i].index) {
						tmp=reviewFiles[i];
						reviewFiles.splice(i,1);
						break;
					}
				}
				if (!tmp) {
					return;
				}
				var list = item.parent.children;
				for (i=0; i<list.length; i++) {
					if (item==list[i]) {
						item.parent.children.splice(i, 1);
						break;
					}
				}
				this.update(tmp);
			}
		}));
		dojo.publish('/davinci/review/publish/valueChanged');
	},

	_getIconClass: function(item, opened) {

		if (item.elementType == "Folder") {
			return  opened ? "dijitFolderOpened" : "dijitFolderClosed";
		}
		if (item.elementType == "File") {
			var icon;
			var fileType = item.getExtension();
			var extension = Runtime.getExtension("davinci.fileType", function (extension) {
				return extension.extension == fileType;
			});
			if (extension) {
				icon=extension.iconClass;
			}
			return icon ||	"dijitLeaf";
		}
		return "dijitLeaf";
	},

	initData: function(node, isRestart) {
		var mainPromise = new Deferred();
		
		this.node = node;
		this.isRestart = isRestart;
		if (!node) {
			xhr.get({
				url: "cmd/getLatestVersionId"
			}).then(function(latestVersionId){
				this.versionTitle.set("value", dojo.string.substitute(widgetsNls.defaultReviewTitle, [latestVersionId]));				
			}.bind(this));
		}
		if (node) {
			var vName = node.name;
			if (isRestart) {
				vName += " (R)";
			}
			this.versionTitle.set('value', vName);
			if (!this.isRestart) {
				this.dueDate.set('value', node.dueDate == "infinite" ? new Date("") : node.dueDate);
			}
			this.desireWidth.set('value', node.width === 0 ? "" : node.width);
			this.desireHeight.set('value', node.height === 0 ? "" : node.height);
			if (node.description) {
				this.descriptions.set('value', node.description);
			}
			this.receiveEmail.set('value', node.receiveEmail);
			
			 // init review files
			node.getChildren(function(children) {
				dojo.forEach(children, function(item) {
					var file = systemResource.findResource(item.name);
					if (file != null) {
						this.addFiles([file]);
					}
				}.bind(this));
				
				//init reviewers
				for (var i = 0; i < node.reviewers.length; i++) {
					if (node.reviewers[i].email != node.designerEmail) {
						var displayName = Runtime.getUserDisplayNamePlusEmail({
							email: node.reviewers[i].email,
							userId: node.reviewers[i].name
						});
						this.jsonStore.newItem({
							name: node.reviewers[i].name,
							email: node.reviewers[i].email,
							displayName: displayName
						});
					}
				}
				mainPromise.resolve();
			}.bind(this));
		} else {
			mainPromise.resolve();
		}
		
		return mainPromise;
	},

	publish: function(isDraft) {
		var emails = this.userData.map(function(data) {
			return data.email;
		}).join(",");
		var messageTextarea = this.descriptions;
		var message = messageTextarea.value;
		var versionTitle = this.versionTitle.value;
		var dueDate = this.dueDate.get('value');
		var dueDateString = dueDate ? stamp.toISOString(dueDate, {zulu: true}) : "infinite";
		var desireWidth = this.desireWidth.value || 0;
		var desireHeight = this.desireHeight.value || 0;
		var	resources = dojo.map(this.reviewFiles, function(item) {
			//Remove leading "./"
			var path = item.getPath();
			if (path.length > 2 && path.indexOf("./") == 0) {
				path = path.substring(2);
			}
			return path;
		});
		var receiveEmail = this.receiveEmail.get("value") == "on" ? "true" : "false";

		//Build up args for the xhrPost
		var urlParms = {
			isUpdate: this.node && !this.isRestart,
			isRestart: this.isRestart,
			vTime: this.node ? this.node.timeStamp : null,
			emails: emails,
			message: message,
			versionTitle: versionTitle,
			resources: resources,
			desireWidth: desireWidth,
			desireHeight: desireHeight,
			savingDraft: isDraft,
			dueDate: dueDateString,
			receiveEmail: receiveEmail
		};
		if (Runtime.currentEditor && Runtime.currentEditor.getContext && Runtime.currentEditor.getContext().getPreference("zazl")) { // FIXME: preferences should be available without going through Context. #3804
			urlParms.zazl = true;
		}

		var urlParmsQueryStr = dojo.objectToQuery(urlParms);

		//Do the POST
		xhr.post({
			url: "cmd/publish" + "?" + urlParmsQueryStr,
			handleAs:"json"
		}).then(function(result) {
			if (typeof hasToaster == "undefined") {
				new Toaster({
					position: "br-left",
					duration: 4000,
					messageTopic: "/davinci/review/resourceChanged"
				});
				hasToaster = true;
			}
			
			if (result.length > 0) {
				var resultEntry = result[0];
				if (resultEntry.result=="OK") {
					if (isDraft) {
						dojo.publish("/davinci/review/resourceChanged", [{message:widgetsNls.draftSaved, type:"message"}, "draft", this.node]);
					} else {
						if (resultEntry.emailResult) {
							if (resultEntry.emailResult == "OK") {
								dojo.publish("/davinci/review/resourceChanged", [{message:widgetsNls.inviteSuccessful, type:"message"}, "create", this.node]);
							} else {
								// Server failed to send an email notification (server is either
								// unreachable or not configured). Display message to user.
								var dialogContent = dojostring.substitute(warningString, {
										htmlContent: resultEntry.emailResult, 
										inviteNotSent: widgetsNls.inviteNotSent, 
										mailFailureMsg: widgetsNls.mailFailureMsg
								});
								dojo.publish("/davinci/review/resourceChanged", [{message:widgetsNls.inviteFailed, type:"warning"}, "create", this.node]);
				
								Workbench.showMessage(widgetsNls.warning, dialogContent);
							}
							
						}
					}
				}
			}
		}.bind(this)).otherwise(function(response) {
			var msg = response.responseText;
			msg = msg.substring(msg.indexOf("<title>")+7, msg.indexOf("</title>"));
			Runtime.handleError(dojostring.substitute(widgetsNls.errorPublish, [response, msg]));
		});
		this.onClose();
	},

	onClose: function() {
	},

	destroy: function() {
		this.inherited(arguments);
		this._subs.forEach(dojo.unsubscribe);
		delete this._subs;
		this.sourceTree.destroyRecursive();
		this.targetTree.destroyRecursive();
	}	
});
});
