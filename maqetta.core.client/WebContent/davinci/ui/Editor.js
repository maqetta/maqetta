//if (typeof orion == "undefined") { orion = {}; } // workaround because orion code did not declare orion global in a way that works with the Dojo loader

define([
	"davinci/commands/CommandStack",
	"dojox/timing/doLater",
	"dojo/_base/declare",
	"davinci/actions/Action",
	"./TextStyler",
	"orion/editor/editor",
	"orion/editor/editorFeatures",
	"orion/editor/htmlGrammar",
	"orion/editor/textMateStyler",
	"orion/textview/textView",
	"orion/textview/textModel",
	"davinci/UserActivityMonitor"
], function(CommandStack, doLater, declare, Action, TextStyler, mEditor, mEditorFeatures, mHtmlGrammar, mTextMateStyler, mTextView, mTextModel, UserActivityMonitor) {
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
		// 'this' === Editor._textModel
		if (this._dontNotifyChange) {
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
					that.handleChange(that._textModel.getText());
					delete that.isTyping;
				})(this);
			} catch (e){console.error(e);}
		}
	};

	var onSelectionChanged = function(selectionEvent) {
		if (this._selecting) {
			return;
		}
//		var startPos=this._textModel.getPosition(selectionEvent.newValue.start);
//		var endPos=this._textModel.getPosition(selectionEvent.newValue.end);
        this.selectionChange({startOffset:selectionEvent.newValue.start,endOffset:selectionEvent.newValue.end});
	};

return declare("davinci.ui.Editor", null, {
	
	constructor: function (element, existWhenVisible) {
		this.contentDiv = element;
		this.commandStack = new CommandStack(); //TODO: integrate with orion.editor.UndoFactory
		this._existWhenVisible = existWhenVisible;
		this._isVisible = !existWhenVisible;
	},

	setContent: function (filename, content) {
		if (!this.editor && (!this._existWhenVisible || this._isVisible)) {
			this._createEditor();
		}
		if (!this._textModel) {
			this._textModel = this.editor ? this.editor.getModel() : new mTextModel.TextModel();
		}
		this.fileName=filename;

		this.setValue(content, true);
		this._updateStyler();
		
		// delay binding to the onChange event until after initializing the content 
		if (this._textModel) {
			dojo.connect(this._textModel, "onChanged", this, onTextChanged); // editor.onInputChange?
		}
	},

	setVisible: function (visible) {

//console.log("setVisible="+visible + " "+s)
		if (visible!=this._isVisible && this._existWhenVisible) {
			if (visible && this._existWhenVisible) {
				this._createEditor();
				this._updateStyler();
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

	setValue: function (content,dontNotify) {
		this._dontNotifyChange=dontNotify;
		if (this.editor) {
			this.editor.setText(content);
		} else {
			this._textModel.setText(content);
		}
		this._dontNotifyChange=false;
	},

	_createEditor: function () {
		var parent = this.contentDiv,
			model = this._textModel,
			options = {
				statusReporter: function(message, isError) {
//					var method = isError ? "error" : "log";
//					console[method]("orion.editor: " + message);
				    if ( isError ) { console.error("orion.editor: " + message); }
				},
				textViewFactory: function() {
					return new mTextView.TextView({
						parent: parent,
						model: model,
						tabSize: 4
					});
				},
				undoStackFactory: new mEditorFeatures.UndoFactory(),
				annotationFactory: new mEditorFeatures.AnnotationFactory(),
				lineNumberRulerFactory: new mEditorFeatures.LineNumberRulerFactory(),
				contentAssistFactory: null,
//TODO				keyBindingFactory: keyBindingFactory, 
				domNode: parent // redundant with textView parent?
		};
		this.editor = new mEditor.Editor(options);
		this.editor.installTextView();
		// add the user activity monitoring to the document and save the connects to be 
		// disconnected latter
		this._activiityConnections = UserActivityMonitor.addInActivityMonitor(this.contentDiv.firstChild.contentDocument);
		this.editor.getTextView().focus();

		dojo.style(this.contentDiv, "overflow", "hidden");

		if (this.selectionChange) {
            this.editor.getTextView().addEventListener("Selection", dojo.hitch(this, onSelectionChanged));
		}
		this.cutAction=new davinci.ui._EditorCutAction(this.editor);
		this.copyAction=new davinci.ui._EditorCopyAction(this.editor);
		this.pasteAction=new davinci.ui._EditorPasteAction(this.editor);
	},

	_updateStyler: function () {
		if (!this.editor) { return; }
		var lang = this.fileName.substr(this.fileName.lastIndexOf('.')+1),
			view = this.editor.getTextView();
		
		if (this._styler) {
			this._styler.destroy();
			delete this._styler;
		}
		if (lang == "json") { lang = "js"; }

		switch (lang) {
		case "js":
		case "java":
		case "css":
			this._styler = new TextStyler(view, lang, this.editor._annotationModel/*view.annotationModel*/);
			break;
		case "html":
			this._styler = new mTextMateStyler.TextMateStyler(view, new mHtmlGrammar.HtmlGrammar());
		}
		view.setText(this.getText());
	},

	selectionChange: function (selection) {
	},

	destroy: function () {
		dojo.forEach(this._activiityConnections, dojo.disconnect);
	},

	select: function (selectionInfo) {
		
//		var start=this._textModel.getLineStart(selectionInfo.startLine)+selectionInfo.startCol;
//		var end=this._textModel.getLineStart(selectionInfo.endLine)+selectionInfo.endCol;
		this._selecting=true;
		if (this.editor) {
			this.editor.setSelection(selectionInfo.startOffset,selectionInfo.endOffset);
		}
		this._selecting=false;
	},

	getText: function() {
		return this._textModel.getText(0);
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
