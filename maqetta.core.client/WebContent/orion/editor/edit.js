/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 
/*globals define */

define('orion/editor/edit', [ //$NON-NLS-0$
	
	"orion/editor/textView", //$NON-NLS-0$
	"orion/editor/textModel", //$NON-NLS-0$
	"orion/editor/projectionTextModel", //$NON-NLS-0$
	"orion/editor/eventTarget", //$NON-NLS-0$
	"orion/editor/keyBinding", //$NON-NLS-0$
	"orion/editor/rulers", //$NON-NLS-0$
	"orion/editor/annotations", //$NON-NLS-0$
	"orion/editor/tooltip", //$NON-NLS-0$
	"orion/editor/undoStack", //$NON-NLS-0$
	"orion/editor/textDND", //$NON-NLS-0$
	
	"orion/editor/editor", //$NON-NLS-0$
	"orion/editor/editorFeatures", //$NON-NLS-0$
	
	"orion/editor/contentAssist", //$NON-NLS-0$
	"orion/editor/cssContentAssist", //$NON-NLS-0$
	"orion/editor/htmlContentAssist", //$NON-NLS-0$
	"orion/editor/jsTemplateContentAssist", //$NON-NLS-0$
	
	"orion/editor/AsyncStyler", //$NON-NLS-0$
	"orion/editor/mirror", //$NON-NLS-0$
	"orion/editor/textMateStyler", //$NON-NLS-0$
	"orion/editor/htmlGrammar", //$NON-NLS-0$
	"davinci/ui/TextStyler" //$NON-NLS-0$
], function(mTextView, mTextModel, mProjModel, mEventTarget, mKeyBinding, mRulers, mAnnotations, mTooltip, mUndoStack, mTextDND, mEditor, mEditorFeatures, mContentAssist, mCSSContentAssist, mHtmlContentAssist, mJSContentAssist, mAsyncStyler, mMirror, mTextMateStyler, mHtmlGrammar, mTextStyler) {

	/**	@private */
	function getTextFromElement(element) {
		var document = element.ownerDocument;
		var window = document.defaultView || document.parentWindow;
		if (!window.getSelection) {
			return element.innerText || element.textContent;
		}
		var newRange = document.createRange();
		newRange.selectNode(element);
		var selection = window.getSelection();
		var oldRanges = [], i;
		for (i = 0; i < selection.rangeCount; i++) {
			oldRanges.push(selection.getRangeAt(i));
		}
		selection.removeAllRanges();
		selection.addRange(newRange);
		var text = selection.toString();
		selection.removeAllRanges();
		for (i = 0; i < oldRanges.length; i++) {
			selection.addRange(oldRanges[i]);
		}
		return text;
	}

	/**	@private */	
	function optionName(name) {
		var prefix = "data-editor-"; //$NON-NLS-0$
		if (name.substring(0, prefix.length) === prefix) {
			var key = name.substring(prefix.length);
			key = key.replace(/-([a-z])/ig, function(all, character) {
				return character.toUpperCase();
			});
			return key;
		}
		return undefined;
	}
	
	/**	@private */
	function merge(obj1, obj2) {
		for (var p in obj2) {
			if (obj2.hasOwnProperty(p)) {
				obj1[p] = obj2[p];
			}
		}
	}
	
	/**	@private */
	function mergeOptions(parent, defaultOptions) {
		var options = {};
		merge(options, defaultOptions);
		for (var attr, j = 0, attrs = parent.attributes, l = attrs.length; j < l; j++) {
			attr = attrs.item(j);
			var key = optionName(attr.nodeName);
			if (key) {
				var value = attr.nodeValue;
				if (value === "true" || value === "false") { //$NON-NLS-1$ //$NON-NLS-0$
					value = value === "true"; //$NON-NLS-0$
				}
				options[key] = value;
			}
		}
		return options;
	}
	
	/**	@private */
	function getHeight(node) {
		var document = node.ownerDocument;
		var window = document.defaultView || document.parentWindow;
		var height;
		if (window.getComputedStyle) {
			var style = window.getComputedStyle(node, null);
			height = style.getPropertyValue("height"); //$NON-NLS-0$
		} else if (node.currentStyle) {
			height = node.currentStyle.height;
		}
		return parseInt(height, 10) || 0;
	}
	
	/**
	 * @class This object describes the options for <code>edit</code>.
	 * @name orion.editor.EditOptions
	 *
	 * @property {String|DOMElement} parent the parent element for the view, it can be either a DOM element or an ID for a DOM element.
	 * @property {Boolean} [readonly=false] whether or not the view is read-only.
	 * @property {Boolean} [fullSelection=true] whether or not the view is in full selection mode.
	 * @property {Boolean} [tabMode=true] whether or not the tab keypress is consumed by the view or is used for focus traversal.
	 * @property {Boolean} [expandTab=false] whether or not the tab key inserts white spaces.
	 * @property {String} [themeClass] the CSS class for the view theming.
	 * @property {Number} [tabSize=4] The number of spaces in a tab.
	 * @property {Boolean} [wrapMode=false] whether or not the view wraps lines.
	 * @property {Function} [statusReporter] a status reporter.
	 * @property {String} [title=""] the editor title.
	 * @property {String} [contents=""] the editor contents.
	 * @property {String} [lang] the styler language. Plain text by default.
	 * @property {Boolean} [showLinesRuler=true] whether or not the lines ruler is shown.
	 * @property {Boolean} [showAnnotationRuler=true] whether or not the annotation ruler is shown.
	 * @property {Boolean} [showOverviewRuler=true] whether or not the overview ruler is shown.
	 * @property {Boolean} [showFoldingRuler=true] whether or not the folding ruler is shown.
	 */
	/**
	 * Creates an editor instance configured with the given options.
	 * 
	 * @param {orion.editor.EditOptions} options the editor options.
	 */
	function edit(options) {
		var parent = options.parent;
		if (!parent) { parent = "editor"; } //$NON-NLS-0$
		if (typeof(parent) === "string") { //$NON-NLS-0$
			parent = (options.document || document).getElementById(parent);
		}
		if (!parent) {
			if (options.className) {
				var parents = (options.document || document).getElementsByClassName(options.className);
				if (parents) {
					options.className = undefined;
					var editors = [];
					for (var i = 0; i < parents.length; i++) {
						options.parent = parents[i];
						editors.push(edit(options));
					}
					return editors;
				}
			}
		}
		if (!parent) { throw "no parent"; } //$NON-NLS-0$
		options = mergeOptions(parent, options);
	
		var textViewFactory = function() {
			return new mTextView.TextView({
				parent: parent,
				model: new mProjModel.ProjectionTextModel(new mTextModel.TextModel("")),
				tabSize: options.tabSize ? options.tabSize : 4,
				readonly: options.readonly,
				fullSelection: options.fullSelection,
				tabMode: options.tabMode,
				expandTab: options.expandTab,
				themeClass: options.themeClass,
				wrapMode: options.wrapMode
			});
		};

		var contentAssist, contentAssistFactory;
		if (!options.readonly) {
			contentAssistFactory = {
				createContentAssistMode: function(editor) {
					contentAssist = new mContentAssist.ContentAssist(editor.getTextView());
					var contentAssistWidget = new mContentAssist.ContentAssistWidget(contentAssist);
					return new mContentAssist.ContentAssistMode(contentAssist, contentAssistWidget);
				}
			};
		}
	
		// Canned highlighters for js, java, and css. Grammar-based highlighter for html
		var syntaxHighlighter = {
			styler: null, 
			
			highlight: function(lang, editor) {
				if (this.styler) {
					this.styler.destroy();
					this.styler = null;
				}
				if (lang) {
					var textView = editor.getTextView();
					var annotationModel = editor.getAnnotationModel();
					switch(lang) {
						case "js": //$NON-NLS-0$
						case "java": //$NON-NLS-0$
						case "css": //$NON-NLS-0$
							this.styler = new mTextStyler.TextStyler(textView, lang, annotationModel);
							editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
							break;
						case "html": //$NON-NLS-0$
							this.styler = new mTextMateStyler.TextMateStyler(textView, new mHtmlGrammar.HtmlGrammar());
							break;
					}
				}
			}
		};
		
		var keyBindingFactory = function(editor, keyModeStack, undoStack, contentAssist) {
			
			// Create keybindings for generic editing
			var genericBindings = new mEditorFeatures.TextActions(editor, undoStack);
			keyModeStack.push(genericBindings);
			
			// create keybindings for source editing
			var codeBindings = new mEditorFeatures.SourceCodeActions(editor, undoStack, contentAssist);
			keyModeStack.push(codeBindings);
		};
			
		var editor = new mEditor.Editor({
			textViewFactory: textViewFactory,
			undoStackFactory: new mEditorFeatures.UndoFactory(),
			annotationFactory: new mEditorFeatures.AnnotationFactory(),
			lineNumberRulerFactory: new mEditorFeatures.LineNumberRulerFactory(),
			foldingRulerFactory: new mEditorFeatures.FoldingRulerFactory(),
			textDNDFactory: new mEditorFeatures.TextDNDFactory(),
			contentAssistFactory: contentAssistFactory,
			keyBindingFactory: keyBindingFactory, 
			statusReporter: options.statusReporter,
			domNode: parent
		});
		
		var contents = options.contents;
		if (contents === undefined) {
			contents = getTextFromElement(parent); 
		}
		if (!contents) { contents=""; }
		
		editor.installTextView();
		editor.setLineNumberRulerVisible(options.showLinesRuler === undefined || options.showLinesRuler);
		editor.setAnnotationRulerVisible(options.showAnnotationRuler === undefined || options.showFoldingRuler);
		editor.setOverviewRulerVisible(options.showOverviewRuler === undefined || options.showOverviewRuler);
		editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
		editor.setInput(options.title, null, contents);
		syntaxHighlighter.highlight(options.lang, editor);
		if (contentAssist) {
			var cssContentAssistProvider = new mCSSContentAssist.CssContentAssistProvider();
			var jsTemplateContentAssistProvider = new mJSContentAssist.JSTemplateContentAssistProvider();
			contentAssist.addEventListener("Activating", function() { //$NON-NLS-0$
				if (/css$/.test(options.lang)) {
					contentAssist.setProviders([cssContentAssistProvider]);
				} else if (/js$/.test(options.lang)) {
					contentAssist.setProviders([jsTemplateContentAssistProvider]);
				}
			});
		}
		/* The minimum height of the editor is 50px */
		if (getHeight(parent) <= 50) {
			var height = editor.getTextView().computeSize().height;
			parent.style.height = height + "px"; //$NON-NLS-0$
		}
		return editor;
	}

	var editorNS = this.orion ? this.orion.editor : undefined;
	if (editorNS) {
		for (var i = 0; i < arguments.length; i++) {
			merge(editorNS, arguments[i]);	
		}
	}
	
	return edit;
});

