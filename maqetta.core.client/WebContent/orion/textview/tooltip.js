/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define setTimeout clearTimeout setInterval clearInterval Node */

define(['orion/textview/textView', 'orion/textview/textModel', 'orion/textview/projectionTextModel'], function(mTextView, mTextModel, mProjectionTextModel) {

	/** @private */
	function Tooltip (view) {
		this._view = view;
		//TODO add API to get the parent of the view
		this._create(view._parent.ownerDocument);
		view.addEventListener("Destroy", this, this.destroy);
	}
	Tooltip.getTooltip = function(view) {
		if (!view._tooltip) {
			 view._tooltip = new Tooltip(view);
		}
		return view._tooltip;
	};
	Tooltip.prototype = /** @lends orion.textview.Tooltip.prototype */ {
		_create: function(document) {
			if (this._domNode) { return; }
			this._document = document;
			var domNode = this._domNode = document.createElement("DIV");
			domNode.className = "viewTooltip";
			var viewParent = this._viewParent = document.createElement("DIV");
			domNode.appendChild(viewParent);
			var htmlParent = this._htmlParent = document.createElement("DIV");
			domNode.appendChild(htmlParent);
			document.body.appendChild(domNode);
			this.hide();
		},
		destroy: function() {
			if (!this._domNode) { return; }
			if (this._contentsView) {
				this._contentsView.destroy();
				this._contentsView = null;
				this._emptyModel = null;
			}
			var parent = this._domNode.parentNode;
			if (parent) { parent.removeChild(this._domNode); }
			this._domNode = null;
		},
		hide: function() {
			if (this._contentsView) {
				this._contentsView.setModel(this._emptyModel);
			}
			if (this._viewParent) {
				this._viewParent.style.left = "-10000px";
				this._viewParent.style.position = "fixed";
				this._viewParent.style.visibility = "hidden";
			}
			if (this._htmlParent) {
				this._htmlParent.style.left = "-10000px";
				this._htmlParent.style.position = "fixed";
				this._htmlParent.style.visibility = "hidden";
				this._htmlParent.innerHTML = "";
			}
			if (this._domNode) {
				this._domNode.style.visibility = "hidden";
			}
			if (this._showTimeout) {
				clearTimeout(this._showTimeout);
				this._showTimeout = null;
			}
			if (this._hideTimeout) {
				clearTimeout(this._hideTimeout);
				this._hideTimeout = null;
			}
			if (this._fadeTimeout) {
				clearInterval(this._fadeTimeout);
				this._fadeTimeout = null;
			}
		},
		isVisible: function() {
			return this._domNode && this._domNode.style.visibility === "visible";
		},
		setTarget: function(target) {
			if (this.target === target) { return; }
			this._target = target;
			this.hide();
			if (target) {
				var self = this;
				self._showTimeout = setTimeout(function() {
					self.show(true);
				}, 1000);
			}
		},
		show: function(autoHide) {
			if (!this._target) { return; }
			var info = this._target.getTooltipInfo();
			if (!info) { return; }
			var domNode = this._domNode;
			domNode.style.left = domNode.style.right = domNode.style.width = domNode.style.height = "auto";
			var contents = info.contents, contentsDiv;
			if (contents instanceof Array) {
				contents = this._getAnnotationContents(contents);
			}
			if (typeof contents === "string") {
				(contentsDiv = this._htmlParent).innerHTML = contents;
			} else if (contents instanceof Node) {
				(contentsDiv = this._htmlParent).appendChild(contents);
			} else if (contents instanceof mProjectionTextModel.ProjectionTextModel) {
				if (!this._contentsView) {
					this._emptyModel = new mTextModel.TextModel("");
					//TODO need hook into setup.js (or editor.js) to create a text view (and styler)
					var newView = this._contentsView = new mTextView.TextView({
						model: this._emptyModel,
						parent: this._viewParent,
						tabSize: 4,
						sync: true,
						stylesheet: ["/orion/textview/tooltip.css", "/orion/textview/rulers.css",
							"/examples/textview/textstyler.css", "/css/default-theme.css"]
					});
					//TODO this is need to avoid IE from getting focus
					newView._clientDiv.contentEditable = false;
					//TODO need to find a better way of sharing the styler for multiple views
					var view = this._view;
					var listener = {
						onLineStyle: function(e) {
							view.onLineStyle(e);
						}
					};
					newView.addEventListener("LineStyle", listener.onLineStyle);
				}
				var contentsView = this._contentsView;
				contentsView.setModel(contents);
				var size = contentsView.computeSize();
				contentsDiv = this._viewParent;
				//TODO always make the width larger than the size of the scrollbar to avoid bug in updatePage
				contentsDiv.style.width = (size.width + 20) + "px";
				contentsDiv.style.height = size.height + "px";
			} else {
				return;
			}
			contentsDiv.style.left = "auto";
			contentsDiv.style.position = "static";
			contentsDiv.style.visibility = "visible";
			var left = parseInt(this._getNodeStyle(domNode, "padding-left", "0"), 10);
			left += parseInt(this._getNodeStyle(domNode, "border-left-width", "0"), 10);
			if (info.anchor === "right") {
				var right = parseInt(this._getNodeStyle(domNode, "padding-right", "0"), 10);
				right += parseInt(this._getNodeStyle(domNode, "border-right-width", "0"), 10);
				domNode.style.right = (domNode.ownerDocument.body.getBoundingClientRect().right - info.x + left + right) + "px";
			} else {
				domNode.style.left = (info.x - left) + "px";
			}
			var top = parseInt(this._getNodeStyle(domNode, "padding-top", "0"), 10);
			top += parseInt(this._getNodeStyle(domNode, "border-top-width", "0"), 10);
			domNode.style.top = (info.y - top) + "px";
			domNode.style.maxWidth = info.maxWidth + "px";
			domNode.style.maxHeight = info.maxHeight + "px";
			domNode.style.opacity = "1";
			domNode.style.visibility = "visible";
			if (autoHide) {
				var self = this;
				self._hideTimeout = setTimeout(function() {
					var opacity = parseFloat(self._getNodeStyle(domNode, "opacity", "1"));
					self._fadeTimeout = setInterval(function() {
						if (domNode.style.visibility === "visible" && opacity > 0) {
							opacity -= 0.1;
							domNode.style.opacity = opacity;
							return;
						}
						self.hide();
					}, 50);
				}, 5000);
			}
		},
		_getAnnotationContents: function(annotations) {
			if (annotations.length === 0) {
				return null;
			}
			var model = this._view.getModel(), annotation;
			var baseModel = model.getBaseModel ? model.getBaseModel() : model;
			function getText(start, end) {
				var textStart = baseModel.getLineStart(baseModel.getLineAtOffset(start));
				var textEnd = baseModel.getLineEnd(baseModel.getLineAtOffset(end), true);
				return baseModel.getText(textStart, textEnd);
			}
			var title;
			if (annotations.length === 1) {
				annotation = annotations[0];
				if (annotation.title) {
					title = annotation.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
					return "<div>" + annotation.html + "&nbsp;<span style='vertical-align:mddle;'>" + title + "</span><div>";
				} else {
					var newModel = new mProjectionTextModel.ProjectionTextModel(baseModel);
					var lineStart = baseModel.getLineStart(baseModel.getLineAtOffset(annotation.start));
					newModel.addProjection({start: annotation.end, end: newModel.getCharCount()});
					newModel.addProjection({start: 0, end: lineStart});
					return newModel;
				}
			} else {
				var tooltipHTML = "<div><em>Multiple annotations:</em></div>";
				for (var i = 0; i < annotations.length; i++) {
					annotation = annotations[i];
					title = annotation.title;
					if (!title) {
						title = getText(annotation.start, annotation.end);
					}
					title = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
					tooltipHTML += "<div>" + annotation.html + "&nbsp;<span style='vertical-align:mddle;'>" + title + "</span><div>";
				}
				return tooltipHTML;
			}
		},
		_getNodeStyle: function(node, prop, defaultValue) {
			var value;
			if (node) {
				value = node.style[prop];
				if (!value) {
					if (node.currentStyle) {
						var index = 0, p = prop;
						while ((index = p.indexOf("-", index)) !== -1) {
							p = p.substring(0, index) + p.substring(index + 1, index + 2).toUpperCase() + p.substring(index + 2);
						}
						value = node.currentStyle[p];
					} else {
						var css = node.ownerDocument.defaultView.getComputedStyle(node, null);
						value = css ? css.getPropertyValue(prop) : null;
					}
				}
			}
			return value || defaultValue;
		}
	};
	return {Tooltip: Tooltip};
}, "orion/textview");
