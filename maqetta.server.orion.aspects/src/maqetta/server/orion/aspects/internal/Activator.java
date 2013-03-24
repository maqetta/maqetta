package maqetta.server.orion.aspects.internal;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {

	private static Activator singleton;
	private BundleContext bundleContext;

	public void start(BundleContext bundleContext) throws Exception {
		singleton = this;
		this.bundleContext = bundleContext;
	}

	public void stop(BundleContext bundleContext) throws Exception {
		this.bundleContext = null;
	}

	public static Activator getDefault() {
		return singleton;
	}

	public BundleContext getBundleContext() {
		return bundleContext;
	}

}
