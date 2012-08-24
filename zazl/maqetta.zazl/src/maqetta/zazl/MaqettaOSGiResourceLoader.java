package maqetta.zazl;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.dojotoolkit.server.util.osgi.OSGiResourceLoader;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IVResource;
import org.osgi.framework.BundleContext;

public class MaqettaOSGiResourceLoader extends OSGiResourceLoader {
	private static Logger logger = Logger.getLogger("maqetta.zazl");
	private IUserManager userManager = null;
	private List<Library> srcLibs = null;
	
	public MaqettaOSGiResourceLoader(BundleContext bundleContext, String[] bundleIds, IUserManager userManager, List<Library> srcLibs) {
		super(bundleContext, bundleIds);
		this.userManager = userManager;
		this.srcLibs = srcLibs;
	}
	
	protected URL _getResource(String path) {
		URL url = super._getResource(path);
		if (url != null) {
			return url;
		}
		IUser user = null;
		IPath ipath = new Path(path);
		if (ipath.segment(0).equals("maqetta")) {
			if (ipath.segment(1).equals("user")) {
		 		ipath = ipath.removeFirstSegments(2);
				String userName = ipath.segment(0);
				user = userManager.getUser(userName);
				ipath = ipath.removeFirstSegments(1);
				if (ipath.segment(0).equals("ws") && ipath.segment(1).equals("workspace")) {
					ipath = ipath.removeFirstSegments(2);
				}
			} else {
				user = userManager.getSingleUser();
			}
			url = scanSrcLibs(ipath);
			if (url != null) {
				return url;
			}
		}
		IVResource resource = user.getResource(ipath.toString());
		if (resource != null) {
			try {
				if (logger.isLoggable(Level.FINEST)) {
					logger.logp(Level.FINEST, getClass().getName(), "_getResource", "resource ["+path +"] loaded from project");
				}
				return resource.getURI().toURL();
			} catch (MalformedURLException e) {
				e.printStackTrace();
			} catch (URISyntaxException e) {
				e.printStackTrace();
			}
		}
		return null;
	}

	private URL scanSrcLibs(IPath ipath) {
		IPath srcPath = ipath.removeFirstSegments(1);
		for (Library srcLib: srcLibs) {
			if (srcPath.toString().startsWith(srcLib.getDefaultRoot().substring(1))) {
				srcPath = srcPath.removeFirstSegments(2);
				URL url = srcLib.getSourceURL(srcPath.toString());
				if (url != null) {
					if (logger.isLoggable(Level.FINEST)) {
						logger.logp(Level.FINEST, getClass().getName(), "_getResource", "resource ["+srcPath.toString() +"] loaded from srclib ["+srcLib.getID()+"]");
					}
					return url;
				}
			}
		}
		return null;
	}
}
