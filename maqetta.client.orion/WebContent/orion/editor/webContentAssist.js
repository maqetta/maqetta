/*******************************************************************************
 * @license
 * Copyright (c) 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */

define("orion/editor/webContentAssist", [], function() {

	/**
	 * @name orion.contentAssist.CssContentAssistProvider
	 * @class Provides content assist for CSS keywords.
	 */
	function CssContentAssistProvider() {
	}
	CssContentAssistProvider.prototype = /** @lends orion.editor.CssContentAssistProvider.prototype */ {
		getKeywords: function(prefix, buffer, selection) {
			return [ "background", "background-attachment", "background-color", "background-image",
					"background-position", "background-repeat", "border", "border-bottom",
					"border-bottom-color", "border-bottom-style", "border-bottom-width", "border-color",
					"border-left", "border-left-color", "border-left-style", "border-left-width",
					"border-right", "border-right-color", "border-right-style", "border-right-width",
					"border-style", "border-top", "border-top-color", "border-top-style", "border-top-width",
					"border-width", "bottom", "clear", "clip", "color", "cursor", "display", "float", "font",
					"font-family", "font-size", "font-style", "font-variant", "font-weight", "height",
					"horizontal-align", "left", "line-height", "list-style", "list-style-image",
					"list-style-position", "list-style-type", "margin", "margin-bottom", "margin-left",
					"margin-right", "margin-top", "max-height", "max-width", "min-height", "min-width",
					"outline", "outline-color", "outline-style", "outline-width", "overflow", "overflow-x",
					"overflow-y", "padding", "padding-bottom", "padding-left", "padding-right",
					"padding-top", "position", "right", "text-align", "text-decoration", "text-indent",
					"top", "vertical-align", "visibility", "width", "z-index" ];
		}
	};

	/**
	 * @name orion.editor.JavaScriptContentAssistProvider
	 * @class Provides content assist for JavaScript keywords.
	 */
	function JavaScriptContentAssistProvider() {
	}
	JavaScriptContentAssistProvider.prototype = /** @lends orion.editor.JavaScriptContentAssistProvider.prototype */ {
		getKeywords: function(prefix, buffer, selection) {
			return [ "break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else",
					"finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch",
					"this", "throw", "try", "typeof", "var", "void", "while", "with" ];
		}
	};
	
	return {
		CssContentAssistProvider: CssContentAssistProvider,
		JavaScriptContentAssistProvider: JavaScriptContentAssistProvider
	};
});
