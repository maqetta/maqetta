package maqetta.server.configurator;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class ConfiguratorActivator implements BundleActivator {
	/**
	 * The symbolic id of this bundle.
	 */
	public static final String PI_LDAP_SERVLETS = "maqetta.server.configurator"; //$NON-NLS-1$

	private static volatile BundleContext bundleContext;

	public static ConfiguratorActivator singleton;

	public static ConfiguratorActivator getDefault() {
		return singleton;
	}

	public static BundleContext getBundleContext() {
		return bundleContext;
	}

	public void start(BundleContext context) throws Exception {
		singleton = this;
		bundleContext = context;
	}

	public void stop(BundleContext context) throws Exception {
		bundleContext = null;
	}

}
