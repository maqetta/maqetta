define(["require",
	"dojo/_base/declare",
	"davinci/workbench/_ToolbaredContainer",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/ve/utils/GeomUtils",
	"dojo/Deferred",
	"dojo/i18n!davinci/workbench/nls/workbench"  
], function(require, declare, ToolbaredContainer, Runtime, Workbench, GeomUtils, Deferred, workbenchStrings) {

return declare("davinci.workbench.EditorContainer", ToolbaredContainer, {

	constructor: function(args){
	},
	
	postCreate: function(){
		this.subscribe("/davinci/ui/editorSelected", function(event){
			if(event.editor == this.editor){
				var toolbarDiv = this.getToolbarDiv();
				toolbarDiv.innerHTML = '';
				var toolbar = this.toolbarCreated(this.editorExtension.editorClass);
				if(toolbar){
					toolbarDiv.appendChild(toolbar.domNode);
				}
				this.updateToolbars();
			}
		}.bind(this));
		this.subscribe("/davinci/ui/widgetSelected", function(widgets){
			this.updateToolbars();
		}.bind(this));
		this.subscribe("/davinci/workbench/ready", function(widgets){
			this.updateToolbars();
		}.bind(this));
	},
	
	layout: function() {
		// Don't show the title bar or tool bar strips above the editors's main content area
		// Note that the toolbar shared by all of the editors gets automagically injected
		// into the Workbench's DIV with id="davinci_toolbar_container".
		this.titleBarDiv.style.display = 'none';
		this.toolbarDiv.style.display = 'none';
		this.inherited(arguments);
	},
	
	setEditor: function(editorExtension, fileName, content, file, rootElement, newHtmlParams){
		var d = new Deferred();
		this.editorExtension = editorExtension;
		require([editorExtension.editorClass], function(EditorCtor) {
			try {
				var editor = this.editor = new EditorCtor(this.containerNode, fileName);
				var setupEditor = function(){
					if(editor.setRootElement){
						editor.setRootElement(rootElement);
					}
					this.containerNode = editor.domNode || this.containerNode;
					if(typeof editorExtension.editorClassName == 'string'){
						dojo.addClass(this.domNode, editorExtension.editorClassName);
					}
					editor.editorID=editorExtension.id;
					editor.isDirty= !editor.isReadOnly && this.isDirty;
					this._createToolbar(editorExtension.editorClass);
					if (!content) {
						content=editor.getDefaultContent();
						editor.isDirty=!editor.isReadOnly;
						editor.lastModifiedTime=Date.now();
					}
					if (!content) {
						content="";
					}
					editor.resourceFile=file;
					editor.fileName=fileName;
			
					// Don't populate the editor until the tab is selected.  Defer processing,
					// but also avoid problems with display:none on hidden tabs making it impossible
					// to do geometry measurements in editor initialization
					var editorsContainer = "editors_container";
					if(dijit.byId(editorsContainer).selectedChildWidget.domNode == this.domNode){
						// Tab is visible.  Go ahead
						editor.setContent(fileName, content, newHtmlParams);

						// keyboard bindings
						this._setupKeyboardHandler();
						dojo.connect(editor, "handleKeyEvent", this, "_handleKeyDown");
					}else{
						// When tab is selected, set up the editor
						var handle = dojo.subscribe(editorsContainer + "-selectChild", null, function(args){
							if(editor==args.editor){
								dojo.unsubscribe(handle);
								editor.setContent(fileName,content);

								// keyboard bindings
								this._setupKeyboardHandler();
								dojo.connect(editor, "handleKeyEvent", this, "_handleKeyDown");
							}
						}.bind(this));
					}
					editor.editorContainer=this;
					this.setDirty(editor.isDirty);
				}.bind(this);
				if(editor.deferreds){
					editor.deferreds.then(function(){
						try {
							setupEditor();
							d.resolve(editor);
						} catch (e2) {
							d.reject(e2);
						}
					}.bind(this));
				}else{
					//setupEditor.bind(this);
					setupEditor();
					d.resolve(editor);			}
			} catch (e) {
				d.reject(e);
			}
		}.bind(this));
		return d;
	},

	setDirty: function (isDirty) {
		//FIXME: davinci.Workbench.hideEditorTabs is always true now
		//Need to clean up this logic (make less hacky)
		//if(!davinci.Workbench.hideEditorTabs){
			var title = this._getTitle();
			if (isDirty){
				title="*"+title;
			}
			davinci.Workbench.editorTabs.setTitle(this,title);
		//}
		this.lastModifiedTime=Date.now();
		this.isDirty = isDirty;
	},
	
	_getTitle: function() {
		var title=this.attr("title");
		if (title[0]=="*"){
			title=title.substring(1);
		}
		return title;
	},
	
	save: function(isWorkingCopy){
		this.editor.save(isWorkingCopy);
		this.setDirty(isWorkingCopy);
	},

	_close: function(editor, dirtycheck){
		dojo.publish("/davinci/ui/EditorClosing", [{editor:editor}]);
		var okToClose = true;
		if (dirtycheck && editor && editor.isDirty){
			//Give editor a chance to give us a more specific message
			var message = editor.getOnUnloadWarningMessage();
			if (!message) {
				//No editor-specific message, so use our canned one
				message = dojo.string.substitute(workbenchStrings.fileHasUnsavedChanges, [this._getTitle()]);
			}
		    okToClose=confirm(message);
		}
		if (okToClose){
	    	this._isClosing = true;
	    	
			//this.editor.resourceFile.removeWorkingCopy();
	    	if(editor.removeWorkingCopy){ // wdr
	    		editor.removeWorkingCopy();
	    	} else if(editor.getFileEditors){
				editor.getFileEditors().forEach(function(editor) {
					if (editor.isReadOnly) {
						return;
					}
					editor.resourceFile.removeWorkingCopy();
				});	
			}else if(editor.resourceFile){
				editor.resourceFile.removeWorkingCopy();	 
			}
	 	}
		return okToClose;
	},
	/* Callback to handle notifier when parent widget closes an
	 * editor tab, usually in response to user clicking on "x" close icon.
	 */
	onClose: function(){
		return this._close(this.editor, true);
	},
	/* forceClose is where daVinci actively removes a child editor.
	 * (eg, saveas might close old editor before creating new editor)
	 */
	forceClose: function(editor, dirtycheck){
		this._close(editor, dirtycheck);
		var parent = this.getParent();
		if(parent){	
			parent.removeChild(this);
			this.destroyRecursive();
		}
	},
	_getViewActions: function() {
		var editorID=this.editorExtension.id;
		var editorActions=[];
		var extensions = davinci.Runtime.getExtensions('davinci.editorActions', function(ext){
			if (editorID==ext.editorContribution.targetID)
			{
				editorActions.push(ext.editorContribution);
				return true;
			}
		});

		if (editorActions.length == 0) {
			var extensions = davinci.Runtime.getExtension('davinci.defaultEditorActions', function(ext){
				editorActions.push(ext.editorContribution);
				return true;
			});
		}

		return editorActions;
	},

	_getViewContext: function() {
		return this.editor;
	},

	_setupKeyboardHandler: function() {
		var that = this;
		function pushBinding(o){
			if (!that.keyBindings) {
				that.keyBindings = [];
			}
			that.keyBindings.push(o);
		}
		dojo.forEach(this._getViewActions(), dojo.hitch(this, function(actionSet) {
			dojo.forEach(actionSet.actions,  dojo.hitch(this, function(action) {
				if (action.keyBinding) {
					pushBinding({keyBinding: action.keyBinding, action: action});
				}
				if(action.menu){
					dojo.forEach(action.menu, dojo.hitch(this, function(menuItemObj) {
						if(menuItemObj.keyBinding){
							pushBinding({keyBinding: menuItemObj.keyBinding, action: menuItemObj});
						}
					}));
				}
			}));
		}));
	},

	_handleKeyDown: function(e, isGlobal) {
		var handled = this._handleKey(e, isGlobal);

		// now pass to runtime if unhandled so global key listeners can take a stab
		// make sure to not pass global events back up
		if (!handled && !isGlobal) {
			Runtime.handleKeyEvent(e);
		}
	},

	_handleKey: function(e, isGlobal) {
		var stopEvent = false;

		if (!this.keyBindings) {
			return false;
		}

		var context = this.editor ? (this.editor.getContext ? this.editor.getContext() : null) : null;

		stopEvent = dojo.some(this.keyBindings, dojo.hitch(this, function(globalBinding) {
			if (isGlobal && !globalBinding.keyBinding.allowGlobal) {
				return;
			}

			if (Runtime.isKeyEqualToEvent(globalBinding.keyBinding, e)) {
				davinci.Workbench._runAction(globalBinding.action, this.editor, globalBinding.action.id);
				return true;
			}
		}));

		if (stopEvent) {
			dojo.stopEvent(e);
		}

		return stopEvent;
	},

	destroy: function() {
		this.inherited(arguments);
		//TODO: should we implement getChildren() in _ToolbaredContainer instead so that the children will get destroyed automatically?
        if (this.editor){
        	this.editor.destroy();
        }
        delete this.editor;
	},
	
	_updateToolbar: function(toolbar){
		// Call a function on an action class
		// Only used for 'shouldShow' and 'isEnabled'
		function runFunc(action, funcName){
			var retval = true;
			if(action && action.action &&  action.action[funcName]){
				retval = action.action[funcName]();
			} else if(action && action[funcName]){
				retval = action[funcName]();
			}
			return retval;
		}
		function hideShowWidget(widget, action){
			var shouldShow = runFunc(action, 'shouldShow');
			if(shouldShow){
				dojo.removeClass(widget.domNode, 'maqHidden');
			}else{
				dojo.addClass(widget.domNode, 'maqHidden');
			}
			
		}
		function enableDisableWidget(widget, action){
			var enabled = runFunc(action, 'isEnabled');
			widget.set('disabled', !enabled);
		}
		function updateIcon(widget, action){
			runFunc(action, 'updateIcon');
		}
		
		if(toolbar && this.editor){
			var context = this.editor.getContext ? this.editor.getContext() : null;
			if(context){
				var children = toolbar.getChildren();
				for(var i=0; i<children.length; i++){
					var child = children[i];
					hideShowWidget(child, child._maqAction);
					enableDisableWidget(child, child._maqAction);
					updateIcon(child, child._maqAction);
					var menu = child.dropDown;
					if(menu){
						var menuItems = menu.getChildren();
						for(var j=0; j<menuItems.length; j++){
							var menuItem = menuItems[j];
							hideShowWidget(menuItem, menuItem._maqAction);
							enableDisableWidget(menuItem, menuItem._maqAction);
							updateIcon(menuItem, menuItem._maqAction);
						}
					}
				}
			}
		}
		
	},
	
	/**
	 * Enable/disable various items on the editor toolbar and action bar
	 */
	updateToolbars: function(){
		if(this.editor == Runtime.currentEditor){
			var editorToolbarNode = dojo.query('#davinci_toolbar_container .dijitToolbar')[0];
			var editorToolbar = editorToolbarNode ? dijit.byNode(editorToolbarNode) : null;
			this._updateToolbar(editorToolbar);
		}
	},
	
	/**
	 * Override the _createToolbar function in _ToolbaredContainer.js to redirect
	 * the toolbar creation logic to target the DIV with id="davinci_toolbar_container"
	 */
	_createToolbar: function(editorClass){
		if(this.toolbarCreated(editorClass)){
			return;
		}
		this.inherited(arguments);
	},
	
	/**
	 * Returns an {Element} that is the container DIV into which editor toolbar should go
	 * This function can be overridden by subclasses (e.g., EditorContainer.js)
	 */
	getToolbarDiv: function(){
		return dojo.byId("davinci_toolbar_container");
	},
	
	/**
	 * Getter/setting for whether toolbar has been created.
	 * Note that this function overrides the function from _ToolbaredContainer.js
	 * @param {string} editorClass  Class name for editor, such as 'davinci.ve.PageEditor'
	 * @param {boolean} [toolbar]  If provided, toolbar widget
	 * @returns {boolean}  Whether toolbar has been created
	 */
	toolbarCreated: function(editorClass, toolbar){
		if(!davinci.Workbench._editorToolbarCreated){
			davinci.Workbench._editorToolbarCreated = {};
		}
		if(arguments.length > 1){
			davinci.Workbench._editorToolbarCreated[editorClass] = toolbar;
		}
		return davinci.Workbench._editorToolbarCreated[editorClass];
	}

});
});
