define(['dojo', 'orion/serviceregistry', 'orion/preferences', 'orion/pluginregistry'], 

        
function(dojo, mServiceregistry, mPreferences, mPluginRegistry, mCommands) {
	// initialize service registry and EAS services
	var serviceRegistry = new mServiceregistry.ServiceRegistry();

	// This is code to ensure the first visit to orion works
	// we read settings and wait for the plugin registry to fully startup before continuing
	var preferenceService = new mPreferences.PreferencesService(serviceRegistry, "/prefs/user");
	var pluginRegistry;
	preferenceService.getPreferences("/plugins").then(function() {
		pluginRegistry = new mPluginRegistry.PluginRegistry(serviceRegistry);
		dojo.addOnWindowUnload(function() {
			pluginRegistry.shutdown();
		});
		return pluginRegistry.startup();
	});
});