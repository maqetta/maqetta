define([
	"../commands/CommandStack",
	"dojox/timing/doLater",
	"dojo/_base/declare",
	"../actions/Action",
	"../UserActivityMonitor",
	"orion/editor/built-editor-amd"
], function(CommandStack, doLater, declare, Action, UserActivityMonitor, orionEditor) {

	declare("davinci.ui._EditorCutAction", Action, {
		constructor: function (editor) {
			this._editor=editor;
		},
		run: function(context){
			this._editor.getTextView()._doCut();
		},
		isEnabled: function(context){
			return !this._editor.getTextView()._getSelection().isEmpty();
		}
	});
	declare("davinci.ui._EditorCopyAction", Action, {
		constructor: function (editor) {
			this._editor=editor;
		},
		run: function(context){
			this._editor.getTextView()._doCopy();
		},
		isEnabled: function(context){
			return !this._editor.getTextView()._getSelection().isEmpty();
		}
	});
	declare("davinci.ui._EditorPasteAction", Action, {
		constructor: function (editor) {
			this._editor=editor;
		},
		run: function(context){
			this._editor.getTextView()._doPaste();
		}
	});

	var onTextChanged = function(textChangeEvent) {
		if (this._dontNotifyChange) { 
			// clear out the notify skipping
			this._dontNotifyChange = false;
			return;
		}
		this.lastChangeStamp = Date.now();
		if (this.handleChange && !("waiter" in this)) {
			try {
				// don't process keystrokes until the user stops typing
				// keep re-executing the following closure until the doLater condition is satisfied
				this.waiter = true;
				(function(that){
					if (doLater(Date.now() - that.lastChangeStamp > 1000, that)) { return; }
					delete that.waiter;
					that.isTyping = true; // defer saving the buffer
					var textView = that.editor.getTextView();
					var sel = textView.getSelection();
					var leftPixel = textView.getHorizontalPixel();
					var topPixel = textView.getTopPixel();
					that.handleChange(that.editor.getText());
					delete that.isTyping;
					textView.setSelection(sel.start, sel.end, false); // show=false because we are handling scrolling ourselves
					textView.setHorizontalPixel(leftPixel);
					textView.setTopPixel(topPixel);
				})(this);
			} catch (e){console.error(e);}
		}
	};

	var onSelectionChanged = function(selectionEvent) {
		if (this._progSelect) {
			return;
		}

		// User-initiated change in the source editor.  Synchronize with the model.
		this.selectionChange({
        	startOffset: selectionEvent.newValue.start,
        	endOffset: selectionEvent.newValue.end
        });
	};

return declare(null, {
	
	constructor: function (element, fileName, existWhenVisible) {
		this.contentDiv = element;
		this.commandStack = new CommandStack(); //TODO: integrate with orion.editor.UndoFactory
		this._existWhenVisible = existWhenVisible;
		this._isVisible = !existWhenVisible;
	},

	setContent: function (filename, content) {
		if (!this.editor && (!this._existWhenVisible || this._isVisible)) {
			this._createEditor();
		}
		this.fileName=filename;

		this.setValue(content, true);
	},

	setVisible: function (visible) {

//console.log("setVisible="+visible + " "+s)
		if (visible!=this._isVisible && this._existWhenVisible) {
			if (visible && this._existWhenVisible) {
				this._dontNotifyChange = true;
				this._createEditor();
			} else {
	            this.editor.getTextView().removeEventListener("Selection", dojo.hitch(this, onSelectionChanged));
//	            try {
//					this.editor.destroy();
//	            } catch (e){ console.error(e); }
				delete this.editor;
			}
		}
		this._isVisible=visible;
	},

	setValue: function (content, dontNotify) {
		this._dontNotifyChange = dontNotify;
		if (this.editor) {
			this.editor.setText(content);
		} else {
			this._content = content;
		}
	},

	_createEditor: function () {
		this.editor = orionEditor({
			parent: this.contentDiv,
			contents: this._content,
			lang: this.fileName.substr(this.fileName.lastIndexOf('.')+1)
		});
		// add the user activity monitoring to the document and save the connects to be 
		// disconnected latter
		this._activityConnections = UserActivityMonitor.addInActivityMonitor(this.contentDiv.ownerDocument);
		this.editor.getTextView().focus();

		dojo.style(this.contentDiv, "overflow", "hidden");

		if (this.selectionChange) {
            this.editor.getTextView().addEventListener("Selection", onSelectionChanged.bind(this));
		}
		this.editor.getModel().addEventListener("Changed", onTextChanged.bind(this));
		this.cutAction=new davinci.ui._EditorCutAction(this.editor);
		this.copyAction=new davinci.ui._EditorCopyAction(this.editor);
		this.pasteAction=new davinci.ui._EditorPasteAction(this.editor);
	},

	selectionChange: function (selection) {
	},

	destroy: function () {
		dojo.forEach(this._activityConnections, dojo.disconnect);
	},

	select: function (selectionInfo) {
		if (this.editor) {
			try {
				this._progSelect = true;
				// reverse arguments so that insertion caret (and the scroll) happens at the beginning of the selection
				this.editor.setSelection(selectionInfo.endOffset,selectionInfo.startOffset/*, true*/);
			} finally {
				delete this._progSelect;				
			}
		}
	},

	getText: function() {
		return this.editor.getText();
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
		return null;
	}
});
});
