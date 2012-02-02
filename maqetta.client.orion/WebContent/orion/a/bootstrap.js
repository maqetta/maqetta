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
/*global define document dojo dijit window eclipse orion serviceRegistry:true widgets alert*/
/*browser:true*/

define(['require', 'dojo', 'orion/serviceregistry', 'orion/preferences', 'orion/pluginregistry'], function(require, dojo, mServiceregistry, mPreferences, mPluginRegistry) {
	function startup() {
		
		// initialize service registry and EAS services
		var serviceRegistry = new mServiceregistry.ServiceRegistry();
	
		// This is code to ensure the first visit to orion works
		// we read settings and wait for the plugin registry to fully startup before continuing
		var preferences = new mPreferences.PreferencesService(serviceRegistry, "system/maqetta.pref");
		var pluginRegistry = new mPluginRegistry.PluginRegistry(serviceRegistry,"system/maqetta.pref");
		
		return preferences.getPreferences("/plugins").then(function(pluginsPreference) {
			var pluginURLs = pluginsPreference.keys();
			for (var i=0; i < pluginURLs.length; ++i) {				
				if (pluginURLs[i].indexOf("://") === -1) {
					pluginURLs[i] = require.toUrl(pluginURLs[i]);
				}
			}		
			return pluginRegistry.startup(pluginURLs);
		}).then(function() {
			if (serviceRegistry.getServiceReferences("orion.core.preference.provider").length > 0) {
				return preferences.getPreferences("/plugins", preferences.USER_SCOPE).then(function(pluginsPreference) {
					var pluginURLs = pluginsPreference.keys();
					for (var i=0; i < pluginURLs.length; ++i) {				
						if (pluginURLs[i].indexOf("://") === -1) {
							pluginURLs[i] = require.toUrl(pluginURLs[i]);
						}
					}		
					return pluginRegistry.startup(pluginURLs);
				});
			}
		}).then(function() {
			dojo.addOnWindowUnload(function() {
				pluginRegistry.shutdown();
			});
		}).then(function() {
			return {
				serviceRegistry: serviceRegistry,
				preferences: preferences,
				pluginRegistry: pluginRegistry
			};
		});
	}
	return {startup: startup};
});
