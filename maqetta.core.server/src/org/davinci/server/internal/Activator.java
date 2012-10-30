package org.davinci.server.internal;

import java.util.ArrayList;
import java.util.Iterator;

import org.eclipse.core.runtime.IExtensionRegistry;
import org.eclipse.core.runtime.IRegistryChangeEvent;
import org.eclipse.core.runtime.IRegistryChangeListener;
import org.maqetta.server.IDavinciServerConstants;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.packageadmin.PackageAdmin;
import org.osgi.util.tracker.ServiceTracker;
import org.osgi.util.tracker.ServiceTrackerCustomizer;

public class Activator implements BundleActivator, ServiceTrackerCustomizer, IRegistryChangeListener {

    static Activator           theActivator;
    Bundle                     bundle;
    private BundleContext      context;
    private PackageAdmin       packageAdmin;
    private IExtensionRegistry registry;
    private ServiceTracker     packageAdminTracker;
    private ServiceTracker     registryTracker;

    private ArrayList          registryChangeListeners = new ArrayList();

    public static Activator getActivator() {
        return theActivator;
    }

    public Activator() {
        theActivator = this;
    }

    /*
     * (non-Javadoc)
     *
     * @see
     * org.osgi.framework.BundleActivator#start(org.osgi.framework.BundleContext
     * )
     */
    public void start(BundleContext context) throws Exception {
        this.context = context;
        bundle = context.getBundle();
        packageAdminTracker = new ServiceTracker(context, PackageAdmin.class.getName(), this);
        packageAdminTracker.open();

        registryTracker = new ServiceTracker(context, IExtensionRegistry.class.getName(), this);
        registryTracker.open();
    }

    /*
     * (non-Javadoc)
     *
     * @see
     * org.osgi.framework.BundleActivator#stop(org.osgi.framework.BundleContext)
     */
    public void stop(BundleContext context) throws Exception {
        this.context = context;
    }

    public Object addingService(ServiceReference reference) {
        Object service = context.getService(reference);

        if (service instanceof PackageAdmin && packageAdmin == null) {
            packageAdmin = (PackageAdmin) service;
        }

        if (service instanceof IExtensionRegistry && registry == null) {
            registry = (IExtensionRegistry) service;
            registryChanged(null);
            registry.addRegistryChangeListener(this, IDavinciServerConstants.BUNDLE_ID);
        }

        // if (packageAdmin != null && registry != null) {
        // httpServiceTracker = new HttpServiceTracker(context, packageAdmin,
        // registry);
        // httpServiceTracker.open();
        // }

        return service;
    }

    public Bundle getBundle() {
        return bundle;
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
        for (Iterator iterator = this.registryChangeListeners.iterator(); iterator.hasNext();) {
            IRegistryListener listener = (IRegistryListener) iterator.next();
            listener.registryChanged();
        }

    }

}
