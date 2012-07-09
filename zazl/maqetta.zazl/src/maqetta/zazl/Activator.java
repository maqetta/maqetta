package maqetta.zazl;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.Filter;

import org.davinci.ajaxLibrary.Library;
import org.dojotoolkit.compressor.JSCompressorFactory;
import org.dojotoolkit.optimizer.JSOptimizerFactory;
import org.dojotoolkit.optimizer.amd.rhinoast.AMDJSOptimizerFactory;
import org.dojotoolkit.optimizer.servlet.JSServlet;
import org.dojotoolkit.server.util.resource.ResourceLoader;
import org.dojotoolkit.server.util.rhino.RhinoClassLoader;
import org.eclipse.equinox.http.registry.HttpContextExtensionService;
import org.eclipse.equinox.http.servlet.ExtendedHttpService;
import org.maqetta.server.ServerManager;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.http.HttpContext;
import org.osgi.util.tracker.ServiceTracker;

public class Activator implements BundleActivator {
	private BundleContext bundleContext = null;
	private ServiceTracker httpServiceTracker = null;
	//private ServiceTracker httpContextExtensionServiceTracker = null;
	private ServiceReference httpServiceReference = null;
	private HttpContextExtensionService httpContextExtensionService = null;
	private ExtendedHttpService httpService = null;
	private HttpContext httpContext = null;
	private String httpContextName = "maqetta.core.server.httpcontext";
	private boolean registered = false;
	private Filter maqettaHTMLFilter = null;

	public void start(BundleContext bundleContext) throws Exception {
		this.bundleContext = bundleContext;
		httpServiceTracker = new HttpServiceTracker(bundleContext);
		httpServiceTracker.open();
		/*
		httpContextExtensionServiceTracker = new HttpContextExtensionServiceTracker(bundleContext);
		httpContextExtensionServiceTracker.open();
		*/
	}

	public void stop(BundleContext bundleContext) throws Exception {
		/*
		httpContextExtensionServiceTracker.close();
		httpContextExtensionServiceTracker = null;
		*/
		httpServiceTracker.close();
		httpServiceTracker = null;
		this.bundleContext = null;
	}
	
	protected boolean register() {
		if (!registered && httpService != null) {// && httpContextExtensionService != null) {
			/*
			httpContext = httpContextExtensionService.getHttpContext(httpServiceReference, httpContextName);
			if (httpContext == null) {
				System.out.println("Unable to obtain HttpContext for "+httpContextName);
				return registered;
			}
			*/
			String[] bundleIds = {
				"org.json", 
				"org.dojotoolkit.server.util.js",
				"org.dojotoolkit.optimizer.amd",
				"org.dojotoolkit.optimizer.servlet"
			};
			List<Library> libraryList = new ArrayList<Library>();
			Library[] libraries = ServerManager.getServerManger().getLibraryManager().getAllLibraries();
			for (Library library : libraries) {
				if (!library.getID().equals("dojo") && !library.getID().equals("dojo-src") && !library.getID().equals("zazl")) {
					libraryList.add(library);
				}
			}
			Library dojoLib = ServerManager.getServerManger().getLibraryManager().getLibrary("dojo-src", "1.8");
			ResourceLoader resourceLoader = new MaqettaOSGiResourceLoader(bundleContext, bundleIds, ServerManager.getServerManger().getUserManager(), dojoLib);
			RhinoClassLoader rhinoClassLoader = new RhinoClassLoader(resourceLoader);
			JSCompressorFactory jsCompressorFactory = null;
			//JSCompressorFactory jsCompressorFactory = new ShrinksafeJSCompressorFactory();
			JSOptimizerFactory jsOptimizerFactory = new AMDJSOptimizerFactory();
	
			JSServlet jsServlet = new JSServlet(resourceLoader, jsOptimizerFactory, rhinoClassLoader, "zazl", null, null, jsCompressorFactory);
			maqettaHTMLFilter = new MaqettaHTMLFilter(dojoLib, libraryList);
			try {
				System.out.println("Registering Zazl JavaScript servlet");
				httpService.registerServlet("/_javascript", jsServlet, null, null);
				System.out.println("Registering Maqetta HTML Filter for Zazl");
				httpService.registerFilter("/maqetta/user/*.html", maqettaHTMLFilter, null, null);
				registered = true;
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return registered;
	}

	private class HttpContextExtensionServiceTracker extends ServiceTracker {
		public HttpContextExtensionServiceTracker(BundleContext context) {
			super(context, HttpContextExtensionService.class.getName(), null);
		}
		
		public Object addingService(ServiceReference reference) {
			httpContextExtensionService = (HttpContextExtensionService)context.getService(reference);
			register();
			return httpContextExtensionService;
		}
	}
	
	private class HttpServiceTracker extends ServiceTracker {
		public HttpServiceTracker(BundleContext context) {
			super(context, ExtendedHttpService.class.getName(), null);
		}

		public Object addingService(ServiceReference reference) {
			httpServiceReference = reference;
			httpService = (ExtendedHttpService) context.getService(reference);
			register();
			return httpService;
		}

		public void removedService(ServiceReference reference, Object service) {
			if (registered) {
				httpService.unregister("/_javascript");
				httpService.unregisterFilter(maqettaHTMLFilter);
			}
			super.removedService(reference, service);
		}			
	}
}
