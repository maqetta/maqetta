package maqetta.zazl;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.davinci.server.user.UserException;
import org.dojotoolkit.server.util.osgi.OSGiResourceLoader;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IVResource;
import org.osgi.framework.BundleContext;

public class MaqettaOSGiResourceLoader extends OSGiResourceLoader {
	private static Logger logger = Logger.getLogger("maqetta.zazl");
	private IUserManager userManager = null;
	private List<Library> srcLibs = null;
	private String contextPathSegment = null;
	
	public MaqettaOSGiResourceLoader(BundleContext bundleContext, String[] bundleIds, IUserManager userManager, List<Library> srcLibs) {
		super(bundleContext, bundleIds);
		this.userManager = userManager;
		this.srcLibs = srcLibs;
	}
	
	public void setContextPath(String contextPath) {
		if (!contextPath.equals("")) {
			contextPathSegment = contextPath.substring(1);
		} else {
			contextPathSegment = "";
		}
	}
	
	public boolean contextPathSet() {
		return contextPathSegment == null ? false : true;
	}
	
	protected URL _getResource(String path) {
		URL url = super._getResource(path);
		if (url != null) {
			return url;
		}
		IUser user = null;
		IPath ipath = new Path(path);
		if (ipath.segment(0).equals(contextPathSegment)) {
	 		ipath = ipath.removeFirstSegments(1);
		}
		if (ipath.segment(0).equals("maqetta")) {
			if (ipath.segment(1).equals("user")) {
		 		ipath = ipath.removeFirstSegments(2);
				String userName = ipath.segment(0);
				try {
					user = userManager.getUser(userName);
				} catch (UserException e) {
					// TODO surface error up the stack
					e.printStackTrace();
					return null;
				} catch (IOException e) {
					// TODO surface error up the stack
					e.printStackTrace();
					return null;
				}
				ipath = ipath.removeFirstSegments(1);
				if (ipath.segment(0).equals("ws") && ipath.segment(1).equals("workspace")) {
					ipath = ipath.removeFirstSegments(2);
				}
			} else {
				user = userManager.getSingleUser();
			}
			int removecount = 0;
			if (ipath.segment(0).equals(".review")) {
				removecount = 4;
			} else {
				removecount = user.getResource(ipath.segment(0)+"/.project") == null ? 1 : 2;
			}
			ILibInfo[] projectLibs = user.getLibs(ipath.segment(0));
			url = scanSrcLibs(ipath, removecount, projectLibs);
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

	private URL scanSrcLibs(IPath ipath, int removecount, ILibInfo[] projectLibs) {
		for (Library srcLib: srcLibs) {
			IPath srcPath = ipath.removeFirstSegments(removecount);
			String root = getRoot(srcLib, projectLibs);
			if (root.charAt(0) == '/') {
				root = root.substring(1);
			}
			IPath srcLibPath = new Path(root);
			IPath srcRelPath = srcPath.removeFirstSegments(srcLibPath.segmentCount());
			if (srcPath.toString().startsWith(root)) {
				URL url = srcLib.getURL(srcRelPath.toString(), true);
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

	private String getRoot(Library srcLib, ILibInfo[] projectLibs) {
		for (ILibInfo projectLib: projectLibs) {
			if (projectLib.getId().equals(srcLib.getID())) {
				return projectLib.getVirtualRoot();
			}
		}
		return srcLib.getDefaultRoot();
	}
}
