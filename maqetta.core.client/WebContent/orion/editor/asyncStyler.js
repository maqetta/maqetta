/******************************************************************************* 
 * @license
 * Copyright (c) 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation 
 ******************************************************************************/
/*jslint browser:true regexp:true*/
/*global define*/
define("orion/editor/asyncStyler", ['i18n!orion/editor/nls/messages', 'orion/textview/annotations'], function(messages, mAnnotations) {
	var SERVICE_NAME = "orion.edit.highlighter";
	var HIGHLIGHT_ERROR_ANNOTATION = "orion.annotation.highlightError";
	mAnnotations.AnnotationType.registerType(HIGHLIGHT_ERROR_ANNOTATION, {
		title: messages.syntaxError,
		html: "<div class='annotationHTML error'></div>",
		rangeStyle: {styleClass: "annotationRange error"}
	});

	function isRelevant(serviceReference) {
		return serviceReference.getName() === SERVICE_NAME && serviceReference.getProperty("type") === "highlighter";
	}

	/**
	 * Pushes styles provided by <code>orion.edit.highlighter</code> services into a TextView.
	 * @param {orion.textview.TextView} textView
	 * @param {orion.serviceregistry.ServiceRegistry} serviceRegistry
	 * @param {orion.textview.AnnotationModel} [annotationModel]
	 */
	function AsyncStyler(textView, serviceRegistry, annotationModel) {
		this.initialize(textView, serviceRegistry, annotationModel);
		this.lineStyles = [];
	}
	AsyncStyler.prototype = {
		initialize: function(textView, serviceRegistry, annotationModel) {
			this.textView = textView;
			this.serviceRegistry = serviceRegistry;
			this.annotationModel = annotationModel; 
			this.services = [];

			var self = this;
			this.listener = {
				onModelChanging: function(e) {
					self.onModelChanging(e);
				},
				onModelChanged: function(e) {
					self.onModelChanged(e);
				},
				onDestroy: function(e) {
					self.onDestroy(e);
				},
				onLineStyle: function(e) {
					self.onLineStyle(e);
				},
				onStyleReady: function(e) {
					self.onStyleReady(e);
				},
				onServiceAdded: function(serviceRef, service) {
					self.onServiceAdded(serviceRef, service);
				},
				onServiceRemoved: function(serviceRef, service) {
					self.onServiceRemoved(serviceRef, service);
				}
			};
			textView.addEventListener("ModelChanging", this.listener.onModelChanging);
			textView.addEventListener("ModelChanged", this.listener.onModelChanged);
			textView.addEventListener("Destroy", this.listener.onDestroy);
			textView.addEventListener("LineStyle", this.listener.onLineStyle);
			serviceRegistry.addEventListener("serviceAdded", this.listener.onServiceAdded);
			serviceRegistry.addEventListener("serviceRemoved", this.listener.onServiceRemoved);

			var serviceRefs = serviceRegistry.getServiceReferences(SERVICE_NAME);
			for (var i = 0; i < serviceRefs.length; i++) {
				var serviceRef = serviceRefs[i];
				if (isRelevant(serviceRef)) {
					this.addServiceListener(serviceRegistry.getService(serviceRef));
				}
			}
		},
		onDestroy: function(e) {
			this.destroy();
		},
		destroy: function() {
			if (this.textView) {
				this.textView.removeEventListener("ModelChanging", this.listener.onModelChanging);
				this.textView.removeEventListener("ModelChanged", this.listener.onModelChanged);
				this.textView.removeEventListener("Destroy", this.listener.onDestroy);
				this.textView.removeEventListener("LineStyle", this.listener.onLineStyle);
				this.textView = null;
			}
			if (this.services) {
				for (var i = 0; i < this.services.length; i++) {
					this.removeServiceListener(this.services[i]);
				}
				this.services = null;
			}
			if (this.serviceRegistry) {
				this.serviceRegistry.removeEventListener("serviceAdded", this.listener.onServiceAdded);
				this.serviceRegistry.removeEventListener("onServiceRemoved", this.listener.onServiceRemoved);
				this.serviceRegistry = null;
			}
			this.listener = null;
			this.lineStyles = null;
		},
		onModelChanging: function(e) {
			this.startLine = this.textView.getModel().getLineAtOffset(e.start);
		},
		onModelChanged: function(e) {
			var startLine = this.startLine;
			if (e.addedLineCount || e.removedLineCount) {
				Array.prototype.splice.apply(this.lineStyles, [startLine, e.removedLineCount].concat(this._getEmptyStyle(e.addedLineCount)));
			}
		},
		/**
		 * @name orion.editor.StyleReadyEvent
		 * @class Represents the styling for a range of lines, as provided by a service.
		 * @description Represents the styling for a range of lines, as provided by a service.
		 * @property {Object} lineStyles A map of style information. Each key of the map is a line index, and the value 
		 * is a {@link orion.editor.StyleReadyEvent#LineStyle} giving the style information for the line.
		 */
		/**
		 * @name orion.editor.StyleReadyEvent#LineStyle
		 * @class Represents style information for a line.
		 * @description Represents style information for a line.
		 * <p>Note that the offsets given in the {@link #ranges} and {@link #errors} properties are relative to the start of the
		 * line that this LineStyle is associated with, not the start of the document.</p>
		 * @property {orion.textview.StyleRange[]} ranges Optional; Gives the styles for this line.
		 * @property {orion.textview.StyleRange[]} errors Optional; Gives the error styles for this line. Error styles will be 
		 * presented as annotations in the UI.
		 */
		onStyleReady: function(e) {
			var style = e.lineStyles || e.style;
			var min = Number.MAX_VALUE, max = -1;
			var model = this.textView.getModel();
			for (var lineIndex in style) {
				if (style.hasOwnProperty(lineIndex)) {
					this.lineStyles[lineIndex] = style[lineIndex];
					min = Math.min(min, lineIndex);
					max = Math.max(max, lineIndex);
				}
			}
//			console.debug("Got style for lines " + (min+1) + " to " + (max+1));
			min = Math.max(min, 0);
			max = Math.min(max, model.getLineCount());
			
			var annotationModel = this.annotationModel;
			if (annotationModel) {
				var annos = annotationModel.getAnnotations(model.getLineStart(min), model.getLineEnd(max));
				var toRemove = [];
				while (annos.hasNext()) {
					var anno = annos.next();
					if (anno.type === HIGHLIGHT_ERROR_ANNOTATION) {
						toRemove.push(anno);
					}
				}
				var toAdd = [];
				for (var i = min; i <= max; i++) {
					lineIndex = i;
					var lineStyle = this.lineStyles[lineIndex], errors = lineStyle && lineStyle.errors;
					var lineStart = model.getLineStart(lineIndex);
					if (errors) {
						for (var j=0; j < errors.length; j++) {
							var err = errors[j];
							toAdd.push(mAnnotations.AnnotationType.createAnnotation(HIGHLIGHT_ERROR_ANNOTATION, err.start + lineStart, err.end + lineStart));
						}
					}
				}
				annotationModel.replaceAnnotations(toRemove, toAdd);
			}
			this.textView.redrawLines(min, max + 1);
		},
		onLineStyle: function(e) {
			function _toDocumentOffset(ranges, lineStart) {
				var len = ranges.length, result = [];
				for (var i=0; i < len; i++) {
					var r = ranges[i];
					result.push({
						start: r.start + lineStart,
						end: r.end + lineStart,
						style: r.style
					});
				}
				return result;
			}
			var style = this.lineStyles[e.lineIndex];
			if (style) {
				// The 'ranges', 'errors' are of type {@link orion.textview.LineStyleEvent#ranges}, except the 
				// start and end indices are line-relative offsets, not document-relative.
				if (style.ranges) { e.ranges = _toDocumentOffset(style.ranges, e.lineStart); }
				else if (style.style) { e.style = style.style; }
			}
		},
		_getEmptyStyle: function(n) {
			var result = [];
			for (var i=0; i < n; i++) {
				result.push(null);
			}
			return result;
		},
		setContentType: function(contentType) {
			this.contentType = contentType;
			if (this.services) {
				for (var i = 0; i < this.services.length; i++) {
					var service = this.services[i];
					if (service.setContentType) {
						service.setContentType(this.contentType);
					}
				}
			}
		},
		onServiceAdded: function(serviceRef, service) {
			if (isRelevant(serviceRef)) {
				this.addServiceListener(service);
			}
		},
		onServiceRemoved: function(serviceRef, service) {
			if (this.services.indexOf(service) !== -1) {
				this.removeServiceListener(service);
			}
		},
		addServiceListener: function(service) {
			service.addEventListener("orion.edit.highlighter.styleReady", this.listener.onStyleReady);
			this.services.push(service);
			if (service.setContentType && this.contentType) {
				service.setContentType(this.contentType);
			}
		},
		removeServiceListener: function(service) {
			service.removeEventListener("orion.edit.highlighter.styleReady", this.listener.onStyleReady);
			var serviceIndex = this.services.indexOf(service);
			if (serviceIndex !== -1) {
				this.services.splice(serviceIndex, 1);
			}
		}
	};
	
	return { AsyncStyler: AsyncStyler };
});