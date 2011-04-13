package org.davinci.server.review;

import org.davinci.server.DirectoryFilter;
import org.davinci.server.Resource;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.packageadmin.PackageAdmin;
import org.osgi.util.tracker.ServiceTracker;
import org.osgi.util.tracker.ServiceTrackerCustomizer;

public class Activator implements BundleActivator, ServiceTrackerCustomizer {

	private static Activator theActivator;

	public static Activator getActivator()
	{
		return theActivator;
	}
	private Bundle bundle;
	private BundleContext context;
	private PackageAdmin packageAdmin;
	private ServiceTracker packageAdminTracker;
	
	public Activator() {
		theActivator=this;
	}
	/*
	 * (non-Javadoc)
	 * @see org.osgi.framework.BundleActivator#start(org.osgi.framework.BundleContext)
	 */
	public void start(BundleContext context) throws Exception {
		this.context = context;
		bundle=context.getBundle();
		Resource.addFilter(new DirectoryFilter(Constants.REVIEW_DIRECTORY_NAME));
		packageAdminTracker = new ServiceTracker(context, PackageAdmin.class.getName(), this);
		packageAdminTracker.open();
	}

	/*
	 * (non-Javadoc)
	 * @see org.osgi.framework.BundleActivator#stop(org.osgi.framework.BundleContext)
	 */
	public void stop(BundleContext context) throws Exception {
	}
	public Bundle getBundle() {
		return bundle;
	}
	
	public Object addingService(ServiceReference reference) {
		Object service = context.getService(reference);

		if (service instanceof PackageAdmin && packageAdmin == null)
			packageAdmin = (PackageAdmin) service;
		return null;
	}
	
	public void removedService(ServiceReference reference, Object service) {
		if (service == packageAdmin)
			packageAdmin = null;
	}
	
	public Bundle getOtherBundle(String symbolicName) {
		Bundle[] bundles = packageAdmin.getBundles(symbolicName, null);
		if (bundles == null)
			return null;
		//Return the first bundle that is not installed or uninstalled
		for (int i = 0; i < bundles.length; i++) {
			if ((bundles[i].getState() & (Bundle.INSTALLED | Bundle.UNINSTALLED)) == 0) {
				return bundles[i];
			}
		}
		return null;
	}
	public void modifiedService(ServiceReference arg0, Object arg1) {
		// TODO Auto-generated method stub
		
	}
}
