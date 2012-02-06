/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*global define */

define("orion/textview/annotations", ['orion/textview/eventTarget'], function(mEventTarget) {
	/**
	 * @class This object represents a decoration attached to a range of text. Annotations are added to a
	 * <code>AnnotationModel</code> which is attached to a <code>TextModel</code>.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.textview.AnnotationModel}<br/>
	 * {@link orion.textview.Ruler}<br/>
	 * </p>		 
	 * @name orion.textview.Annotation
	 * 
	 * @property {String} type The annotation type (for example, orion.annotation.error).
	 * @property {Number} start The start offset of the annotation in the text model.
	 * @property {Number} end The end offset of the annotation in the text model.
	 * @property {String} html The HTML displayed for the annotation.
	 * @property {String} title The text description for the annotation.
	 * @property {orion.textview.Style} style The style information for the annotation used in the annotations ruler and tooltips.
	 * @property {orion.textview.Style} overviewStyle The style information for the annotation used in the overview ruler.
	 * @property {orion.textview.Style} rangeStyle The style information for the annotation used in the text view to decorate a range of text.
	 * @property {orion.textview.Style} lineStyle The style information for the annotation used in the text view to decorate a line of text.
	 */
	/**
	 * Constructs a new folding annotation.
	 * 
	 * @param {orion.textview.ProjectionTextModel} projectionModel The projection text model.
	 * @param {String} type The annotation type.
	 * @param {Number} start The start offset of the annotation in the text model.
	 * @param {Number} end The end offset of the annotation in the text model.
	 * @param {String} expandedHTML The HTML displayed for this annotation when it is expanded.
	 * @param {orion.textview.Style} expandedStyle The style information for the annotation when it is expanded.
	 * @param {String} collapsedHTML The HTML displayed for this annotation when it is collapsed.
	 * @param {orion.textview.Style} collapsedStyle The style information for the annotation when it is collapsed.
	 * 
	 * @class This object represents a folding annotation.
	 * @name orion.textview.FoldingAnnotation
	 */
	function FoldingAnnotation (projectionModel, type, start, end, expandedHTML, expandedStyle, collapsedHTML, collapsedStyle) {
		this.type = type;
		this.start = start;
		this.end = end;
		this._projectionModel = projectionModel;
		this._expandedHTML = this.html = expandedHTML;
		this._expandedStyle = this.style = expandedStyle;
		this._collapsedHTML = collapsedHTML;
		this._collapsedStyle = collapsedStyle;
		this.expanded = true;
	}
	
	FoldingAnnotation.prototype = /** @lends orion.textview.FoldingAnnotation.prototype */ {
		/**
		 * Collapses the annotation.
		 */
		collapse: function () {
			if (!this.expanded) { return; }
			this.expanded = false;
			this.html = this._collapsedHTML;
			this.style = this._collapsedStyle;
			var projectionModel = this._projectionModel;
			var baseModel = projectionModel.getBaseModel();
			this._projection = {
				start: baseModel.getLineStart(baseModel.getLineAtOffset(this.start) + 1),
				end: baseModel.getLineEnd(baseModel.getLineAtOffset(this.end), true)
			};
			projectionModel.addProjection(this._projection);
		},
		/**
		 * Expands the annotation.
		 */
		expand: function () {
			if (this.expanded) { return; }
			this.expanded = true;
			this.html = this._expandedHTML;
			this.style = this._expandedStyle;
			this._projectionModel.removeProjection(this._projection);
		}
	};
	
	/**
	 * Constructs an annotation model.
	 * 
	 * @param {textModel} textModel The text model.
	 * 
	 * @class This object manages annotations for a <code>TextModel</code>.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.textview.Annotation}<br/>
	 * {@link orion.textview.TextModel}<br/> 
	 * </p>	
	 * @name orion.textview.AnnotationModel
	 * @borrows orion.textview.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.textview.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.textview.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function AnnotationModel(textModel) {
		this._annotations = [];
		var self = this;
		this._listener = {
			onChanged: function(modelChangedEvent) {
				self._onChanged(modelChangedEvent);
			}
		};
		this.setTextModel(textModel);
	}

	AnnotationModel.prototype = /** @lends orion.textview.AnnotationModel.prototype */ {
		/**
		 * Adds an annotation to the annotation model. 
		 * <p>The annotation model listeners are notified of this change.</p>
		 * 
		 * @param {orion.textview.Annotation} annotation the annotation to be added.
		 * 
		 * @see #removeAnnotation
		 */
		addAnnotation: function(annotation) {
			if (!annotation) { return; }
			var annotations = this._annotations;
			var index = this._binarySearch(annotations, annotation.start);
			annotations.splice(index, 0, annotation);
			var e = {
				type: "Changed",
				added: [annotation],
				removed: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Returns the text model. 
		 * 
		 * @return {orion.textview.TextModel} The text model.
		 * 
		 * @see #setTextModel
		 */
		getTextModel: function() {
			return this._model;
		},
		/**
		 * @class This object represents an annotation iterator.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.textview.AnnotationModel#getAnnotations}<br/>
		 * </p>		 
		 * @name orion.textview.AnnotationIterator
		 * 
		 * @property {Function} hasNext Determines whether there are more annotations in the iterator.
		 * @property {Function} next Returns the next annotation in the iterator.
		 */		
		/**
		 * Returns an iterator of annotations for the given range of text.
		 *
		 * @param {Number} start the start offset of the range.
		 * @param {Number} end the end offset of the range.
		 * @return {orion.textview.AnnotationIterator} an annotation iterartor.
		 */
		getAnnotations: function(start, end) {
			var annotations = this._annotations, current;
			//TODO binary search does not work for range intersection when there are overlaping ranges, need interval search tree for this
			var i = 0;
			var skip = function() {
				while (i < annotations.length) {
					var a =  annotations[i++];
					if ((start === a.start) || (start > a.start ? start < a.end : a.start < end)) {
						return a;
					}
					if (a.start >= end) {
						break;
					}
				}
				return null;
			};
			current = skip();
			return {
				next: function() {
					var result = current;
					if (result) { current = skip(); }
					return result;					
				},
				hasNext: function() {
					return current !== null;
				}
			};
		},
		/**
		 * Notifies the annotation model that the given annotation has been modified.
		 * <p>The annotation model listeners are notified of this change.</p>
		 * 
		 * @param {orion.textview.Annotation} annotation the modified annotation.
		 * 
		 * @see #addAnnotation
		 */
		modifyAnnotation: function(annotation) {
			if (!annotation) { return; }
			var index = this._getAnnotationIndex(annotation);
			if (index < 0) { return; }
			var e = {
				type: "Changed",
				added: [],
				removed: [],
				changed: [annotation]
			};
			this.onChanged(e);
		},
		/**
		 * Notifies all listeners that the annotation model has changed.
		 *
		 * @param {orion.textview.Annotation[]} added The list of annotation being added to the model.
		 * @param {orion.textview.Annotation[]} changed The list of annotation modified in the model.
		 * @param {orion.textview.Annotation[]} removed The list of annotation being removed from the model.
		 * @param {ModelChangedEvent} textModelChangedEvent the text model changed event that trigger this change, can be null if the change was trigger by a method call (for example, {@link #addAnnotation}).
		 */
		onChanged: function(e) {
			return this.dispatchEvent(e);
		},
		/**
		 * Removes all annotations of the given <code>type</code>. All annotations
		 * are removed if the type is not specified. 
		 * <p>The annotation model listeners are notified of this change.  Only one changed event is generated.</p>
		 * 
		 * @param {Object} type the type of annotations to be removed.
		 * 
		 * @see #removeAnnotation
		 */
		removeAnnotations: function(type) {
			var annotations = this._annotations;
			var removed, i; 
			if (type) {
				removed = [];
				for (i = annotations.length - 1; i >= 0; i--) {
					var annotation = annotations[i];
					if (annotation.type === type) {
						annotations.splice(i, 1);
					}
					removed.splice(0, 0, annotation);
				}
			} else {
				removed = annotations;
				annotations = [];
			}
			var e = {
				type: "Changed",
				removed: removed,
				added: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Removes an annotation from the annotation model. 
		 * <p>The annotation model listeners are notified of this change.</p>
		 * 
		 * @param {orion.textview.Annotation} annotation the annotation to be removed.
		 * 
		 * @see #addAnnotation
		 */
		removeAnnotation: function(annotation) {
			if (!annotation) { return; }
			var index = this._getAnnotationIndex(annotation);
			if (index < 0) { return; }
			var e = {
				type: "Changed",
				removed: this._annotations.splice(index, 1),
				added: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Removes and adds the specifed annotations to the annotation model. 
		 * <p>The annotation model listeners are notified of this change.  Only one changed event is generated.</p>
		 * 
		 * @param {orion.textview.Annotation} remove the annotations to be removed.
		 * @param {orion.textview.Annotation} add the annotations to be added.
		 * 
		 * @see #addAnnotation
		 * @see #removeAnnotation
		 */
		replaceAnnotations: function(remove, add) {
			var annotations = this._annotations, i, index, annotation, removed = [];
			if (remove) {
				for (i = remove.length - 1; i >= 0; i--) {
					annotation = remove[i];
					index = this._getAnnotationIndex(annotation);
					if (index < 0) { continue; }
					annotations.splice(index, 1);
					removed.splice(0, 0, annotation);
				}
			}
			if (!add) { add = []; }
			for (i = 0; i < add.length; i++) {
				annotation = add[i];
				index = this._binarySearch(annotations, annotation.start);
				annotations.splice(index, 0, annotation);
			}
			var e = {
				type: "Changed",
				removed: removed,
				added: add,
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Sets the text model of the annotation model.  The annotation
		 * model listens for changes in the text model to update and remove
		 * annotations that are affected by the change.
		 * 
		 * @param {orion.textview.TextModel} textModel the text model.
		 * 
		 * @see #getTextModel
		 */
		setTextModel: function(textModel) {
			if (this._model) {
				this._model.removeEventListener("Changed", this._listener.onChanged);
			}
			this._model = textModel;
			if (this._model) {
				this._model.addEventListener("Changed", this._listener.onChanged);
			}
		},
		/** @ignore */
		_binarySearch: function (array, offset) {
			var high = array.length, low = -1, index;
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				if (offset <= array[index].start) {
					high = index;
				} else {
					low = index;
				}
			}
			return high;
		},
		/** @ignore */
		_getAnnotationIndex: function(annotation) {
			var annotations = this._annotations;
			var index = this._binarySearch(annotations, annotation.start);
			while (index < annotations.length && annotations[index].start === annotation.start) {
				if (annotations[index] === annotation) {
					return index;
				}
				index++;
			}
			return -1;
		},
		/** @ignore */
		_onChanged: function(modelChangedEvent) {
			var start = modelChangedEvent.start;
			var addedCharCount = modelChangedEvent.addedCharCount;
			var removedCharCount = modelChangedEvent.removedCharCount;
			var annotations = this._annotations, end = start + removedCharCount;
			//TODO binary search does not work for range intersection when there are overlaping ranges, need interval search tree for this
			var startIndex = 0;
			if (!(0 <= startIndex && startIndex < annotations.length)) { return; }
			var e = {
				type: "Changed",
				added: [],
				removed: [],
				changed: [],
				textModelChangedEvent: modelChangedEvent
			};
			var changeCount = addedCharCount - removedCharCount, i;
			for (i = startIndex; i < annotations.length; i++) {
				var annotation = annotations[i];
				if (annotation.start >= end) {
					annotation.start += changeCount;
					annotation.end += changeCount;
					e.changed.push(annotation);
				} else if (annotation.end <= start) {
					//nothing
				} else if (annotation.start < start && end < annotation.end) {
					annotation.end += changeCount;
					e.changed.push(annotation);
				} else {
					annotations.splice(i, 1);
					e.removed.push(annotation);
					i--;
				}
			}
			if (e.added.length > 0 || e.removed.length > 0 || e.changed.length > 0) {
				this.onChanged(e);
			}
		}
	};
	mEventTarget.EventTarget.addMixin(AnnotationModel.prototype);

	/**
	 * Constructs a new styler for annotations.
	 * 
	 * @param {orion.textview.TextView} view The styler view.
	 * @param {orion.textview.AnnotationModel} view The styler annotation model.
	 * 
	 * @class This object represents a styler for annotation attached to a text view.
	 * @name orion.textview.AnnotationStyler
	 */
	function AnnotationStyler (view, annotationModel) {
		this._view = view;
		this._annotationModel = annotationModel;
		this._types = [];
		var self = this;
		this._listener = {
			onDestroy: function(e) {
				self._onDestroy(e);
			},
			onLineStyle: function(e) {
				self._onLineStyle(e);
			},
			onChanged: function(e) {
				self._onAnnotationModelChanged(e);
			}
		};
		view.addEventListener("Destroy", this._listener.onDestroy);
		view.addEventListener("LineStyle", this._listener.onLineStyle);
		annotationModel.addEventListener("Changed", this._listener.onChanged);
	}
	AnnotationStyler.prototype = /** @lends orion.textview.AnnotationStyler.prototype */ {
		/**
		 * Adds an annotation type to the receiver.
		 * <p>
		 * Only annotations of the specified types will be shown by
		 * this receiver.
		 * </p>
		 *
		 * @param type {Object} the annotation type to be shown
		 * 
		 * @see #removeAnnotationType
		 * @see #isAnnotationTypeVisible
		 */
		addAnnotationType: function(type) {
			this._types.push(type);
		},
		/**
		 * Destroys the styler. 
		 * <p>
		 * Removes all listeners added by this styler.
		 * </p>
		 */
		destroy: function() {
			var view = this._view;
			if (view) {
				view.removeEventListener("Destroy", this._listener.onDestroy);
				view.removeEventListener("LineStyle", this._listener.onLineStyle);
				this.view = null;
			}
			var annotationModel = this._annotationModel;
			if (annotationModel) {
				annotationModel.removeEventListener("Changed", this._listener.onChanged);
				annotationModel = null;
			}
		},
		/**
		 * Returns whether the receiver shows annotations of the specified type.
		 *
		 * @param {Object} type the annotation type 
		 * @returns {Boolean} whether the specified annotation type is shown
		 * 
		 * @see #addAnnotationType
		 * @see #removeAnnotationType
		 */
		isAnnotationTypeVisible: function(type) {
			for (var i = 0; i < this._types.length; i++) {
				if (this._types[i] === type) {
					return true;
				}
			}
			return false;
		},
		/**
		 * Removes an annotation type from the receiver.
		 *
		 * @param {Object} type the annotation type to be removed
		 * 
		 * @see #addAnnotationType
		 * @see #isAnnotationTypeVisible
		 */
		removeAnnotationType: function(type) {
			for (var i = 0; i < this._types.length; i++) {
				if (this._types[i] === type) {
					this._types.splice(i, 1);
					break;
				}
			}
		},
		_mergeStyle: function(result, style) {
			if (style) {
				if (!result) { result = {}; }
				if (result.styleClass && style.styleClass && result.styleClass !== style.styleClass) {
					result.styleClass += " " + style.styleClass;
				} else {
					result.styleClass = style.styleClass;
				}
				var prop;
				if (style.style) {
					if (!result.style) { result.style  = {}; }
					for (prop in style.style) {
						if (!result.style[prop]) {
							result.style[prop] = style.style[prop];
						}
					}
				}
				if (style.attributes) {
					if (!result.attributes) { result.attributes  = {}; }
					for (prop in style.attributes) {
						if (!result.attributes[prop]) {
							result.attributes[prop] = style.attributes[prop];
						}
					}
				}
			}
			return result;
		},
		_mergeStyleRanges: function(ranges, styleRange) {
			if (!ranges) { return; }
			for (var i=0; i<ranges.length; i++) {
				var range = ranges[i];
				if (styleRange.end <= range.start) { break; }
				if (styleRange.start >= range.end) { continue; }
				var mergedStyle = this._mergeStyle({}, range.style);
				mergedStyle = this._mergeStyle(mergedStyle, styleRange.style);
				if (styleRange.start <= range.start && styleRange.end >= range.end) {
					ranges[i] = {start: range.start, end: range.end, style: mergedStyle};
				} else if (styleRange.start > range.start && styleRange.end < range.end) {
					ranges.splice(i, 1,
						{start: range.start, end: styleRange.start, style: range.style},
						{start: styleRange.start, end: styleRange.end, style: mergedStyle},
						{start: styleRange.end, end: range.end, style: range.style});
					i += 2;
				} else if (styleRange.start > range.start) {
					ranges.splice(i, 1,
						{start: range.start, end: styleRange.start, style: range.style},
						{start: styleRange.start, end: range.end, style: mergedStyle});
					i += 1;
				} else if (styleRange.end < range.end) {
					ranges.splice(i, 1,
						{start: range.start, end: styleRange.end, style: mergedStyle},
						{start: styleRange.end, end: range.end, style: range.style});
					i += 1;
				}
			}
		},
		_onAnnotationModelChanged: function(e) {
			if (e.textModelChangedEvent) {
				return;
			}
			var view = this._view;
			if (!view) { return; }
			var self = this;
			var model = view.getModel();
			function redraw(changes) {
				for (var i = 0; i < changes.length; i++) {
					if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
					var start = changes[i].start;
					var end = changes[i].end;
					if (model.getBaseModel) {
						start = model.mapOffset(start, true);
						end = model.mapOffset(end, true);
					}
					if (start !== -1 && end !== -1) {
						view.redrawRange(start, end);
					}
				}
			}
			redraw(e.added);
			redraw(e.removed);
			redraw(e.changed);
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onLineStyle: function (e) {
			var annotationModel = this._annotationModel;
			var viewModel = this._view.getModel();
			var baseModel = annotationModel.getTextModel();
			var start = e.lineStart;
			var end = e.lineStart + e.lineText.length;
			if (baseModel !== viewModel) {
				start = viewModel.mapOffset(start);
				end = viewModel.mapOffset(end);
			}
			var annotations = annotationModel.getAnnotations(start, end);
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (!this.isAnnotationTypeVisible(annotation.type)) { continue; }
				if (annotation.rangeStyle) {
					var annotationStart = annotation.start;
					var annotationEnd = annotation.end;
					if (baseModel !== viewModel) {
						annotationStart = viewModel.mapOffset(annotationStart, true);
						annotationEnd = viewModel.mapOffset(annotationEnd, true);
					}
					this._mergeStyleRanges(e.ranges, {start: annotationStart, end: annotationEnd, style: annotation.rangeStyle});
				}
				if (annotation.lineStyle) {
					e.style = this._mergeStyle({}, e.style);
					e.style = this._mergeStyle(e.style, annotation.lineStyle);
				}
			}
		}
	};
	
	return {
		FoldingAnnotation: FoldingAnnotation,
		AnnotationModel: AnnotationModel,
		AnnotationStyler: AnnotationStyler
	};
});
