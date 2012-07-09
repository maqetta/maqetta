package maqetta.zazl;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.dojotoolkit.server.util.osgi.OSGiResourceLoader;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IVResource;
import org.osgi.framework.BundleContext;

public class MaqettaOSGiResourceLoader extends OSGiResourceLoader {
	private IUserManager userManager = null;
	private Library dojoLib = null;
	
	public MaqettaOSGiResourceLoader(BundleContext bundleContext, String[] bundleIds, IUserManager userManager, Library dojoLib) {
		super(bundleContext, bundleIds);
		this.userManager = userManager;
		this.dojoLib = dojoLib;
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
			IPath dojoPath = ipath.removeFirstSegments(1);
			if (dojoPath.toString().startsWith(dojoLib.getDefaultRoot().substring(1))) {
				dojoPath = dojoPath.removeFirstSegments(2);
				url = dojoLib.getURL(dojoPath.toString());
				if (url != null) {
					return url;
				}
			}
		}
		IVResource resource = user.getResource(ipath.toString());
		if (resource != null) {
			try {
				return resource.getURI().toURL();
			} catch (MalformedURLException e) {
				e.printStackTrace();
			} catch (URISyntaxException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
}
