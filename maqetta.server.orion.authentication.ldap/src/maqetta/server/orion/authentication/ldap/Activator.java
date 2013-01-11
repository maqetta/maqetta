
package maqetta.server.orion.authentication.ldap;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {
	/**
	 * The symbolic id of this bundle.
	 */
	public static final String PI_LDAP_SERVLETS = "maqetta.server.orion.authentication.ldap"; //$NON-NLS-1$

	private static volatile BundleContext bundleContext;

	public static Activator singleton;

	public static Activator getDefault() {
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
