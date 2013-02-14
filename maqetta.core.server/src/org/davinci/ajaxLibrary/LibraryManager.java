package org.davinci.ajaxLibrary;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;
import java.util.logging.Logger;

import maqetta.core.server.user.manager.UserManagerImpl;

import org.davinci.server.internal.Activator;
import org.davinci.server.internal.IRegistryListener;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;
import org.osgi.framework.Bundle;

public class LibraryManager implements ILibraryManager {

	static final private Logger theLogger = Logger.getLogger(LibraryManager.class.getName());

	private Library[] installedLibraries;
	private ILibraryFinder[] libFinders;

	/*
	 * static class BundleInfo{ Bundle bundle; IPath path; BundleInfo ( Bundle
	 * bundle, IPath path){ this.bundle=bundle; this.path=path; } }
	 */
	public LibraryManager() {
		initialize();

		Activator.getActivator().addRegistryChangeListener(
				new IRegistryListener() {
					public void registryChanged() {
						initialize();
					}
				});
	}

	class BundleLibraryInfo extends Library {
		Bundle bundleBase;
		String basePath;

		BundleLibraryInfo(String ID, String version, String basePath,
				String defaultRoot, URL bundleBase) {
			this.ID = ID;
			this.version = version;
			this.basePath = basePath;
		}

		BundleLibraryInfo(String id, String version) {
			this.ID = id;
			this.version = version;
		}

		public void setBasePath(String basePath, String defaultRoot, String source) {
			this.basePath = basePath;
			this.defaultRoot = defaultRoot;
			this.sourcePath = source;
		}

		public URL[] find(String path, boolean recurse, boolean useSource) {
			IPath p1 = null;
			
			if(useSource)
				p1 = new Path(this.sourcePath).append(path);
			else
				p1 = new Path(this.basePath).append(path);
			
			String name = p1.lastSegment();
			IPath newBase = p1.removeLastSegments(1);

			Enumeration e = this.bundleBase.findEntries(newBase.toString(),
					name, recurse);
			Vector found = new Vector();
			while (e != null && e.hasMoreElements()) {

				found.add(e.nextElement());
			}
			return (URL[]) found.toArray(new URL[found.size()]);
		}

		private URL getUri(String base, String path) {
			IPath basePath = new Path(base);
			IPath fullPath = basePath.append(path);
			URL entry = this.bundleBase.getEntry(fullPath.toString());
			if (entry == null) {
				// TODO: should we throw an Error?
				theLogger.severe("Library file not found! :" + fullPath);
			}

			return entry;
		}

		private URL[] listUri(String base, String path) {
			IPath basePath = new Path(base);
			IPath fullPath = basePath.append(path);
			Vector results = new Vector();
			Enumeration e = (this.bundleBase.findEntries(fullPath.toString(),
					"*", false));

			while (e.hasMoreElements()) {
				results.add(e.nextElement());
			}

			return (URL[]) results.toArray(new URL[results.size()]);
		}

		public String getMetadata() throws IOException {
			if (this.metadataPath == null) {
				return "";
			}
			URL metadata = this.bundleBase.getEntry(this.metadataPath
					+ "/widgets.json");
			InputStream stream = null;
			StringBuffer out = new StringBuffer();
			try {
				stream = new BufferedInputStream(metadata.openStream());
				byte[] b = new byte[4096];
				for (int n; (n = stream.read(b)) != -1;) {
					out.append(new String(b, 0, n));
				}
			} finally {
				if (stream != null) {
					stream.close();
				}
			}
			return out.toString();
		}

		public URL getURL(String path, boolean useSource) {
			// TODO Auto-generated method stub
			if(useSource){
				return this.getUri(this.sourcePath, path);
			}
			return this.getUri(this.basePath, path);
		}
		
		public URL[] listURL(String path, boolean useSource) {
			
			if(useSource){
				return this.listUri(this.sourcePath, path);
			}
			
			return this.listUri(this.basePath, path);
		}


	    public URL getSourceURL(String path) {
			return this.getUri(this.sourcePath, path);
	    }
	}

	Library findLibrary(String id, String version) {
		for (int i = 0; i < installedLibraries.length; i++) {
			if (installedLibraries[i] != null
					&& installedLibraries[i].getID().equals(id)
					&& installedLibraries[i].getVersion().equals(version)) {
				return installedLibraries[i];
			}
		}
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.davinci.ajaxLibrary.ILibraryManager#getDefaultRoot(java.lang.String,
	 * java.lang.String)
	 */
	public String getDefaultRoot(String id, String version) {
		Library l = findLibrary(id, version);
		return l.defaultRoot;
	}

	public ILibraryFinder[] getLibraryFinders() {

		if (libFinders == null) {
			Vector libs = new Vector();
			List libraryElements = ServerManager.getServerManager().getExtensions(IDavinciServerConstants.EXTENSION_POINT_LIBRARYFINDER,	IDavinciServerConstants.EXTENSION_POINT_LIBRARYFINDER);
			if (libraryElements != null) {
				for (int i = 0; i < libraryElements.size(); i++) {

					try {
						Object o = ((IConfigurationElement) libraryElements
								.get(i))
								.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
						if (o != null)
							libs.add(o);
					} catch (CoreException e) {
						e.printStackTrace();
					}
				}

			}
			libFinders = (ILibraryFinder[])libs.toArray(new ILibraryFinder[libs.size()]);
		}

		return libFinders;
	}

	void initialize() {
		List extensions = ServerManager.getServerManager().getExtensions(
				IDavinciServerConstants.EXTENSION_POINT_AJAXLIBRARY,
				IDavinciServerConstants.EP_TAG_AJAXLIBRARY);
		this.installedLibraries = new Library[extensions.size()];
		int count = -1;
		for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
			count++;
			IConfigurationElement libraryElement = (IConfigurationElement) iterator
					.next();
			String id = libraryElement
					.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_ID);
			String version = libraryElement
					.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_VERSION);

			if (id == null || version == null || id.equals("")
					|| version.equals("")) {
				System.err
						.println("Problem reading library data, no ID or Version defined :"
								+ libraryElement.getName());

			}
			Library libInfo = findLibrary(id, version);

			if (libInfo == null) {
				libInfo = new BundleLibraryInfo(id, version);
				this.installedLibraries[count] = libInfo;
			}
			String required = libraryElement
					.getAttribute(IDavinciServerConstants.EP_ATTR_REQUIRED);
			((BundleLibraryInfo) libInfo).setRequired(required);
			
			IConfigurationElement[] libraryPathElements = libraryElement
					.getChildren(IDavinciServerConstants.EP_TAG_LIBRARYPATH);

			for (int i = 0; i < libraryPathElements.length; i++) {
				String virtualPath = libraryPathElements[i]
						.getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_NAME);
				String bundlePath = libraryPathElements[i]
						.getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_LOCATION);
				String source = libraryPathElements[i]
				        .getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_SOURCE);
				((BundleLibraryInfo) libInfo).setBasePath(bundlePath, virtualPath, source);
			}

			if (libInfo instanceof BundleLibraryInfo) {
				((BundleLibraryInfo) libInfo).bundleBase = getLibraryBundle(libraryElement);
			}

			IConfigurationElement[] meta = libraryElement.getChildren("metadata");
			for (int i = 0; i < meta.length; i++) {
				libInfo.setMetadataPath(meta[i].getAttribute("location"));
			}
			
			
			// libInfo.setMetadata( new MetaData(libraryElement));
		}

	}

	private Bundle getLibraryBundle(IConfigurationElement configElement) {
		String name = configElement.getDeclaringExtension().getContributor()
				.getName();
		return Activator.getActivator().getOtherBundle(name);

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.davinci.ajaxLibrary.ILibraryManager#getAllLibraries()
	 */
	public Library[] getAllLibraries() {
		return this.installedLibraries;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.davinci.ajaxLibrary.ILibraryManager#getLibrary(java.lang.String,
	 * java.lang.String)
	 */
	public Library getLibrary(String id, String version) {
		for (int i = 0; i < this.installedLibraries.length; i++) {
			if (this.installedLibraries[i].getID().equals(id)
					&& this.installedLibraries[i].getVersion().equals(version)) {
				return this.installedLibraries[i];
			}
		}
		return null;
	}

}
