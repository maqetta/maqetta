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
 *		Mihai Sucan (Mozilla Foundation) - fix for Bug#364214
 */

/*global window */

/**
 * Evaluates the definition function and mixes in the returned module with
 * the module specified by <code>moduleName</code>.
 * <p>
 * This function is intented to by used when RequireJS is not available.
 * </p>
 *
 * @param {String} name The mixin module name.
 * @param {String[]} deps The array of dependency names.
 * @param {Function} callback The definition function.
 */
if (!window.define) {
	window.define = function(name, deps, callback) {
		var module = this;
		var split = (name || "").split("/"), i, j; //$NON-NLS-0$
		for (i = 0; i < split.length - 1; i++) {
			module = module[split[i]] = (module[split[i]] || {});
		}
		var depModules = [], depModule;
		for (j = 0; j < deps.length; j++) {
			depModule = this;
			split = deps[j].split("/"); //$NON-NLS-0$
			for (i = 0; i < split.length - 1; i++) {
				depModule = depModule[split[i]] = (depModule[split[i]] || {});
			}
			depModules.push(depModule);
		}
		var newModule = callback.apply(this, depModules);
		for (var p in newModule) {
			if (newModule.hasOwnProperty(p)) {
				module[p] = newModule[p];
			}
		}
	};
}

/**
 * Require/get the defined modules.
 * <p>
 * This function is intented to by used when RequireJS is not available.
 * </p>
 *
 * @param {String[]|String} deps The array of dependency names. This can also be
 * a string, a single dependency name.
 * @param {Function} [callback] Optional, the callback function to execute when
 * multiple dependencies are required. The callback arguments will have
 * references to each module in the same order as the deps array.
 * @returns {Object|undefined} If the deps parameter is a string, then this
 * function returns the required module definition, otherwise undefined is
 * returned.
 */
if (!window.require) {
	window.require = function(deps, callback) {
		var depsArr = typeof deps === "string" ? [deps] : deps; //$NON-NLS-0$
		var depModules = [], depModule, split, i, j;
		for (j = 0; j < depsArr.length; j++) {
			depModule = this;
			split = depsArr[j].split("/"); //$NON-NLS-0$
			for (i = 0; i < split.length - 1; i++) {
				depModule = depModule[split[i]] = (depModule[split[i]] || {});
			}
			depModules.push(depModule);
		}
		if (callback) {
			callback.apply(this, depModules);
		}
		return typeof deps === "string" ? depModules[0] : undefined; //$NON-NLS-0$
	};
}