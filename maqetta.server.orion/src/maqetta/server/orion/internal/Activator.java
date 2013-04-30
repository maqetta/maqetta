package maqetta.server.orion.internal;

import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import maqetta.server.orion.MaqettaProjectDecorator;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IExtensionRegistry;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IRegistryChangeEvent;
import org.eclipse.core.runtime.IRegistryChangeListener;
import org.eclipse.core.runtime.Path;
import org.eclipse.orion.internal.server.core.IWebResourceDecorator;
import org.eclipse.osgi.service.datalocation.Location;
import org.maqetta.server.IDavinciServerConstants;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.packageadmin.PackageAdmin;
import org.osgi.util.tracker.ServiceTracker;
import org.osgi.util.tracker.ServiceTrackerCustomizer;

@SuppressWarnings("restriction")
public class Activator implements BundleActivator, ServiceTrackerCustomizer,
		IRegistryChangeListener {
	public static volatile BundleContext bundleContext;

	/**
	 * Global flag for enabling debug tracing
	 */
	public static final boolean DEBUG = true;

	public static final String LOCATION_WORKSPACE_SERVLET = "/workspace"; //$NON-NLS-1$
	public static final String LOCATION_FILE_SERVLET = "/file"; //$NON-NLS-1$
	public static final String LOCATION_PROJECT_SERVLET = "/project"; //$NON-NLS-1$

	public static final String PROP_USER_AREA = "org.eclipse.orion.server.core.userArea"; //$NON-NLS-1$

	private ArrayList<IRegistryListener> registryChangeListeners = new ArrayList<IRegistryListener>();
	static Activator singleton;

	private static Bundle bundle;
	private PackageAdmin packageAdmin;
	private IExtensionRegistry registry;
	private ServiceTracker packageAdminTracker;
	private ServiceTracker registryTracker;
	private IFileStore rootStore;

	private Map<String, URI> aliases = Collections.synchronizedMap(new HashMap<String, URI>());

	private URI rootStoreURI;

	private ServiceRegistration<IWebResourceDecorator> maqProjectDecoratorRegistration;

	public static Activator getDefault() {
		return singleton;
	}

	public IFileStore getRootStore() {
		return rootStore;
	}

	public BundleContext getContext() {
		return bundleContext;
	}

	public static Activator getActivator() {
		return singleton;
	}

	public Object addingService(ServiceReference reference) {
		Object service = getContext().getService(reference);

		if (service instanceof PackageAdmin && packageAdmin == null) {
			packageAdmin = (PackageAdmin) service;
		}

		if (service instanceof IExtensionRegistry && registry == null) {
			registry = (IExtensionRegistry) service;
			registryChanged(null);
			registry.addRegistryChangeListener(this,
					IDavinciServerConstants.BUNDLE_ID);
		}

		// if (packageAdmin != null && registry != null) {
		// httpServiceTracker = new HttpServiceTracker(context, packageAdmin,
		// registry);
		// httpServiceTracker.open();
		// }

		return service;
	}

	public void modifiedService(ServiceReference reference, Object service) {
	}

	public void removedService(ServiceReference reference, Object service) {
		if (service == packageAdmin) {
			packageAdmin = null;
		}

		if (service == registry) {
			registry = null;
		}
	}

	public IExtensionRegistry getRegistry() {
		return registry;
	}

	public void addRegistryChangeListener(IRegistryListener listener) {
		this.registryChangeListeners.add(listener);
	}

	public Bundle getOtherBundle(String symbolicName) {
		Bundle[] bundles = packageAdmin.getBundles(symbolicName, null);
		if (bundles == null) {
			return null;
		}
		// Return the first bundle that is not installed or uninstalled
		for (int i = 0; i < bundles.length; i++) {
			if ((bundles[i].getState() & (Bundle.INSTALLED | Bundle.UNINSTALLED)) == 0) {
				return bundles[i];
			}
		}
		return null;
	}

	public void registryChanged(IRegistryChangeEvent event) {
		for (Iterator<IRegistryListener> iterator = this.registryChangeListeners.iterator(); iterator.hasNext();) {
			IRegistryListener listener = iterator.next();
			listener.registryChanged();
		}
	}

	/**
	 * Returns the root file system location for the workspace.
	 */
	public IPath getPlatformLocation() {
		BundleContext context = Activator.getDefault().getContext();
		Collection<ServiceReference<Location>> refs;
		try {
			refs = context.getServiceReferences(Location.class,
					Location.INSTANCE_FILTER);
		} catch (InvalidSyntaxException e) {
			// we know the instance location filter syntax is valid
			throw new RuntimeException(e);
		}
		if (refs.isEmpty())
			return null;
		ServiceReference<Location> ref = refs.iterator().next();
		Location location = context.getService(ref);
		try {
			if (location == null)
				return null;
			URL root = location.getURL();
			if (root == null)
				return null;
			// strip off file: prefix from URL
			return new Path(root.toExternalForm().substring(5));
		} finally {
			context.ungetService(ref);
		}
	}

	/**
	 * Returns the root location for storing content and metadata on this
	 * server.
	 */
	public URI getRootLocationURI() {
		return rootStoreURI;
	}

	private void initializeFileSystem() {
		IPath location = getPlatformLocation();
		if (location == null)
			throw new RuntimeException(
					"Unable to compute base file system location"); //$NON-NLS-1$

		rootStore = EFS.getLocalFileSystem().getStore(location);

		try {
			rootStore.mkdir(EFS.NONE, null);
			rootStoreURI = rootStore.toURI();
		} catch (CoreException e) {
			throw new RuntimeException(
					"Instance location is read only: " + rootStore, e); //$NON-NLS-1$
		}

		// initialize user area if not specified
		if (System.getProperty(PROP_USER_AREA) == null) {
			System.setProperty(PROP_USER_AREA,
					rootStore.getFileStore(new Path(".metadata/.plugins/org.eclipse.orion.server.core/userArea")).toString()); //$NON-NLS-1$
		}
	}

	public URI lookupAlias(String alias) {
		return aliases.get(alias);
	}

	public void registerAlias(String alias, URI location) {
		aliases.put(alias, location);
	}

	/**
	 * Registers decorators supplied by servlets in this bundle
	 */
	private void registerDecorators() {
		//adds the import/export locations to representations
		maqProjectDecoratorRegistration = bundleContext.registerService(IWebResourceDecorator.class, new MaqettaProjectDecorator(), null);
	}

	public void start(BundleContext context) throws Exception {
		bundle = context.getBundle();
		singleton = this;
		bundleContext = context;

		packageAdminTracker = new ServiceTracker(context,
				PackageAdmin.class.getName(), this);
		packageAdminTracker.open();

		registryTracker = new ServiceTracker(context,
				IExtensionRegistry.class.getName(), this);
		registryTracker.open();
		initializeFileSystem();
		registerDecorators();
	}

	public static Bundle getBundle() {
		return bundle;
	}

	public void stop(BundleContext context) throws Exception {
		unregisterDecorators();
		bundleContext = null;
	}

	private void unregisterDecorators() {
		if (maqProjectDecoratorRegistration != null) {
			maqProjectDecoratorRegistration.unregister();
			maqProjectDecoratorRegistration = null;
		}
	}
}
