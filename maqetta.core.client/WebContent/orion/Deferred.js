/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global exports module define setTimeout*/

(function(root, factory) { // UMD
	if (typeof define === "function" && define.amd) { //$NON-NLS-0$
		define(factory);
	} else if (typeof exports === "object") { //$NON-NLS-0$
		module.exports = factory();
	} else {
		root.orion = root.orion || {};
		root.orion.Deferred = factory();
	}
}(this, function() {
	var syncQueue = [],
		asyncQueue = [],
		running = false;

	function run() {
		var fn;
		while ((fn = syncQueue.shift() || asyncQueue.shift())) { //empty the sync queue first!!
			fn();
		}
		running = false;
	}

	function enqueue(fn, async) {
		var queue = async ? asyncQueue : syncQueue;
		queue.push(fn);
		if (!running) {
			running = true;
			if (async) {
				setTimeout(run, 0);
			} else {
				run();
			}
		}
	}

	function noReturn(fn) {
		return function() {
			fn.apply(null, arguments);
		};
	}

	function noop() {}

	function createCancelError() {
		var cancelError = new Error("Cancel"); //$NON-NLS-0$
		cancelError.name = "Cancel"; //$NON-NLS-0$
		return cancelError;
	}

	/**
	 * @name orion.Promise
	 * @class Interface representing an eventual value.
	 * @description Promise is an interface that represents an eventual value returned from the single completion of an operation.
	 *
	 * <p>For a concrete class that provides Promise-based APIs, see {@link orion.Deferred}.</p>
	 * @see orion.Deferred#promise
	 * @see orion.Deferred
	 */
	/**
	 * @name then
	 * @methodOf orion.Promise.prototype
	 * @description Adds handlers to be called on fulfillment or progress of this promise.
	 * @param {Function} [onResolve] Called when this promise is resolved.
	 * @param {Function} [onReject] Called when this promise is rejected.
	 * @param {Function} [onProgress] May be called to report progress events on this promise.
	 * @returns {orion.Promise} A new promise that is fulfilled when the given onResolve or onReject callback is finished.
	 * The callback's return value gives the fulfillment value of the returned promise.
	 */

	/**
	 * @name orion.Deferred
	 * @borrows orion.Promise#then as #then
	 * @class Provides abstraction over asynchronous operations.
	 * @description Deferred provides abstraction over asynchronous operations.
	 *
	 * <p>Because Deferred implements the {@link orion.Promise} interface, a Deferred may be used anywhere a Promise is called for.
	 * However, in most such cases it is recommended to use the Deferred's {@link #promise} field instead, which exposes a read-only
	 * interface to callers.</p>
	 */
	function Deferred() {
		var result, state, listeners = [],
			_this = this;

		function notify() {
			var listener;
			while ((listener = listeners.shift())) {
				var deferred = listener.deferred;
				var methodName = state === "resolved" ? "resolve" : "reject"; //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
				if (typeof listener[methodName] === "function") { //$NON-NLS-0$
					try {
						var listenerResult = listener[methodName](result);
						if (listenerResult && typeof listenerResult.then === "function") { //$NON-NLS-0$
							deferred.cancel = listenerResult.cancel || noop;
							listenerResult.then(noReturn(deferred.resolve), noReturn(deferred.reject), deferred.progress);
						} else {
							deferred.resolve(listenerResult);
						}
					} catch (e) {
						deferred.reject(e);
					}
				} else {
					deferred[methodName](result);
				}
			}
		}

		/**
		 * Rejects this Deferred.
		 * @name reject
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} error
		 * @param {Boolean} [strict]
		 * @returns {orion.Promise}
		 */
		this.reject = function(error, strict) {
			if (!state) {
				state = "rejected"; //$NON-NLS-0$
				result = error;
				if (listeners.length) {
					enqueue(notify);
				}
			}
			return _this.promise;
		};

		/**
		 * Resolves this Deferred.
		 * @name resolve
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} value
		 * @param {Boolean} [strict]
		 * @returns {orion.Promise}
		 */
		this.resolve = function(value, strict) {
			if (!state) {
				state = "resolved"; //$NON-NLS-0$
				result = value;
				if (listeners.length) {
					enqueue(notify);
				}
			}
			return _this.promise;
		};

		/**
		 * Notifies listeners of progress on this Deferred.
		 * @name progress
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} update The progress update.
		 * @param {Boolean} [strict]
		 * @returns {orion.Promise}
		 */
		this.progress = function(update, strict) {
			if (!state) {
				listeners.forEach(function(listener) {
					if (listener.progress) {
						listener.progress(update);
					}
				});
			}
			return _this.promise;
		};

		/**
		 * Cancels this Deferred.
		 * @name cancel
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} reason The reason for canceling this Deferred.
		 * @param {Boolean} [strict]
		 */
		this.cancel = function() {
			if (!state) {
				_this.reject(createCancelError());
			}
		};

		// Note: "then" ALWAYS returns before having onResolve or onReject called as per http://promises-aplus.github.com/promises-spec/
		this.then = function(onResolve, onReject, onProgress) {
			var listener = {
				resolve: onResolve,
				reject: onReject,
				progress: onProgress,
				deferred: new Deferred()
			};
			var deferred = listener.deferred;
			var thisCancel = this.cancel.bind(this);
			var propagateCancel = function() {
				enqueue(function() {
					var cancel = deferred.cancel === propagateCancel ? thisCancel : deferred.cancel;
					cancel();
				}, true);
			};
			deferred.cancel = propagateCancel;
			var promise = deferred.promise;
			promise.cancel = function() {
				deferred.cancel(); // require indirection since deferred.cancel will be assigned if a promise is returned by onResolve/onReject
			};

			listeners.push(listener);
			if (state) {
				enqueue(notify, true); //runAsync
			}
			return promise;
		};

		/**
		 * The promise exposed by this Deferred.
		 * @name promise
		 * @fieldOf orion.Deferred.prototype
		 * @type orion.Promise
		 */
		this.promise = {
			then: this.then,
			cancel: this.cancel
		};
	}

	/**
	 * Takes multiple promises and returns a new promise that represents the outcome of all the promises.
	 * <p>When <code>all</code> is called with a single parameter, the returned promise has <dfn>eager</dfn> semantics,
	 * meaning if one of the input promises is rejected, the returned promise also rejects, without waiting for the 
	 * rest of the promises to fulfill.</p>
	 *
	 * To obtain <dfn>lazy</dfn> semantics (meaning the returned promise waits for all input promises to fulfill), pass the
	 * optional parameter <code>optOnError</code>.
	 * @name all
	 * @methodOf orion.Deferred
	 * @static
	 * @param {orion.Promise[]} promises The promises.
	 * @param {Function} [optOnError] Handles a rejected input promise. When invoked, <code>optOnError</code> is passed the reason 
	 * the input promise was rejected. The return value of this <code>optOnError</code> call serves as the value of the rejected promise.
	 * @returns {orion.Promise} A new promise. The returned promise is generally fulfilled to an <code>Array</code> whose elements
	 * give the fulfillment values of the input promises. However if an input promise is rejected and eager semantics is used, the 
	 * returned promise will instead be fulfilled to a single error value.</p>
	 */
	Deferred.all = function(promises, optOnError) {
		var count = promises.length,
			result = [],
			rejected = false,
			deferred = new Deferred();

		deferred.then(null, function() {
			rejected = true;
			promises.forEach(function(promise) {
				if (promise.cancel) {
					promise.cancel();
				}
			});
		});

		function onResolve(i, value) {
			if (!rejected) {
				result[i] = value;
				if (--count === 0) {
					deferred.resolve(result);
				}
			}
		}

		function onReject(i, error) {
			if (!rejected) {
				if (optOnError) {
					try {
						onResolve(i, optOnError(error));
						return;
					} catch (e) {
						error = e;
					}
				}
				deferred.reject(error);
			}
		}

		if (count === 0) {
			deferred.resolve(result);
		} else {
			promises.forEach(function(promise, i) {
				promise.then(onResolve.bind(null, i), onReject.bind(null, i));
			});
		}
		return deferred.promise;
	};

	/**
	 * Applies callbacks to a promise or to a regular object.
	 * @name when
	 * @methodOf orion.Deferred
	 * @static
	 * @param {Object|orion.Promise} value Either a {@link orion.Promise}, or a normal value.
	 * @param {Function} onResolve Called when the <code>value</code> promise is resolved. If <code>value</code> is not a promise,
	 * this function is called immediately.
	 * @param {Function} onReject Called when the <code>value</code> promise is rejected. If <code>value</code> is not a promise, 
	 * this function is never called.
	 * @param {Function} onProgress Called when the <code>value</code> promise provides a progress update. If <code>value</code> is
	 * not a promise, this function is never called.
	 * @returns {orion.Promise} A new promise.
	 */
	Deferred.when = function(value, onResolve, onReject, onProgress) {
		var promise, deferred;
		if (value && typeof value.then === "function") { //$NON-NLS-0$
			promise = value;
		} else {
			deferred = new Deferred();
			deferred.resolve(value);
			promise = deferred.promise;
		}
		return promise.then(onResolve, onReject, onProgress);
	};

	return Deferred;
}));