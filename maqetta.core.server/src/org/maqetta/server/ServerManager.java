package org.maqetta.server;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.ajaxLibrary.LibraryManager;
import org.maqetta.server.IProjectTemplatesManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.internal.IRegistryListener;
import org.davinci.server.user.IPersonManager;
import org.davinci.server.user.IUserManager;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;
import org.eclipse.orion.server.configurator.ConfiguratorActivator;
import org.eclipse.osgi.service.datalocation.Location;

public class ServerManager implements IServerManager {

	static private ServerManager  theServerManager;
	static final private Logger theLogger = Logger.getLogger(ServerManager.class.getName());

	private IUserManager           userManager;

	private IExtensionRegistry    registry;
	private IPersonManager personManager;
	private ILibraryManager        libraryManager;
	private IProjectTemplatesManager projectTemplatesManager;

	public ServletConfig  servletConfig;
	private IStorage userDir;
	private Hashtable<String, String> options = new Hashtable<String, String>();

	public static boolean LOCAL_INSTALL = false;

	{
		String localInstall = this.getDavinciProperty(IDavinciServerConstants.LOCAL_INSTALL);
		if (localInstall != null) {
			ServerManager.LOCAL_INSTALL = Boolean.parseBoolean(localInstall);
		}
	}

	private ServerManager() {
		try {
			this.readConfigFile();
		} catch (IOException e) {
			String desc = "Unable to read config file";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}

		Activator.getActivator().addRegistryChangeListener(new IRegistryListener() {
			public void registryChanged() {
				ServerManager.this.registry = Activator.getActivator().getRegistry();
			}
		});
	}

	/*
	 * Reads the maqetta.conf file and creates a hashtable options that contains all the key value pairs from the config file
	 */
	private void readConfigFile() throws IOException {
		String configFile = this.getDavinciProperty(IDavinciServerConstants.CONFIG_FILE);
		if (configFile == null) {
			throw new FileNotFoundException("Missing Config File: " + IDavinciServerConstants.CONFIG_FILE);
		}

		BufferedReader br = null;
		String log = "";
		try {
			// Open the file that is the first command line parameter
			FileInputStream fstream = new FileInputStream(configFile);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			br = new BufferedReader(new InputStreamReader(in));

			//Read File Line By Line
			String strLine;
			log = "Reading Config File: " + configFile;
			while ((strLine = br.readLine()) != null) {
				log += "\n" + strLine;

				strLine = strLine.trim(); // remove leading trailing white space
				String delims = "[=]+";
				String[] tokens = strLine.split(delims, 2); // splits the string at the first '='
				if ((tokens.length > 1) && (tokens[0].startsWith("#") == false)) {
					this.options.put(tokens[0], tokens[1]);
				}
			}
		} finally {
			if (br != null) {
				br.close();
			}
			theLogger.config(log);
		}
	}

	public static ServerManager getServerManager() {
		if(ServerManager.theServerManager==null) {
			ServerManager.theServerManager = new ServerManager();
		}

		return ServerManager.theServerManager;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getDavinciProperty(java.lang.String)
	 */
	public String getDavinciProperty(String propertyName) {
// XXX Don't read in from servlet container environment, since we're reading options from
//     maqetta.conf.  But for now, leave this code here (commented) in case we want to use it again.
//
//		String property = null;
//		if (IN_WAR != SetBoolean.FALSE) { // IN_WAR == SetBoolean.TRUE || IN_WAR == SetBoolean.UNDEFINED
//			try {
//				Context env = (Context) new InitialContext().lookup("java:comp/env");
//				if (IN_WAR == SetBoolean.UNDEFINED) {
//					// call to InitialContext.lookup succeeded; assume we're in a WAR
//					IN_WAR = SetBoolean.TRUE;
//				}
//				property = (String) env.lookup(propertyName);
//			} catch (NameNotFoundException e) {
//				// do nothing; fall through to config file then `System.getProperty` block
//			} catch (NamingException e) {
//				if (IN_WAR == SetBoolean.TRUE) {
//					e.printStackTrace();
//				}
//				// call to InitialContext.lookup failed; assume we're running standalone
//				IN_WAR = SetBoolean.FALSE;
//			}
//		}
//		if (property == null) {
//			// check the config file
//			property = (String) this.options.get(propertyName);
//		}

		// check the config file
		String property = (String) this.options.get(propertyName);

		if (property == null) {
			property = System.getProperty(propertyName);
		}
		theLogger.log(Level.CONFIG, "servlet parm '" + propertyName + "' is : " + property);
		return property;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getUserManager()
	 */
	public IUserManager getUserManager() {
		if (userManager == null) {
			IConfigurationElement libraryElement = ServerManager.getServerManager().getExtension(IDavinciServerConstants.EXTENSION_POINT_USER_MANAGER, IDavinciServerConstants.EP_TAG_USER_MANAGER);
			if (libraryElement != null) {
				try {
					this.userManager = (IUserManager) libraryElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
				} catch (CoreException e) {
					theLogger.logp(Level.SEVERE, ServerManager.class.getName(), "getUserManager", "unexpected failure", e);
					throw new Error(e);
				}
			}
		}

		return userManager;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getExtensions(java.lang.String, java.lang.String)
	 */
	public List<IConfigurationElement> getExtensions(String extensionPoint, String elementTag) {
		ArrayList<IConfigurationElement> list = new ArrayList<IConfigurationElement>();
		IExtension[] extensions = this.getExtensions(extensionPoint);
		for (int i = 0; i < extensions.length; i++) {
			IConfigurationElement[] elements = extensions[i].getConfigurationElements();
			for (int j = 0; j < elements.length; j++) {
				if (elements[j].getName().equals(elementTag)) {
					list.add(elements[j]);
				}
			}
		}

		return list;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getExtension(java.lang.String, java.lang.String)
	 */


	public IConfigurationElement getExtension(String extensionPoint, String elementTag) {
		IExtension[] extensions = this.getExtensions(extensionPoint);

		IConfigurationElement winner = null;
		int highest = -100000;
		for(int i=0;i<extensions.length;i++){
			IConfigurationElement[] elements = extensions[i].getConfigurationElements();
			for (int j = 0; j < elements.length; j++) {
				if (elements[j].getName().equals(elementTag)) {
					String stringPriority = elements[j].getAttribute(IDavinciServerConstants.EP_ATTR_PAGE_PRIORITY);
					int priority = -10000;
					if(stringPriority!=null)
						priority= Integer.parseInt(stringPriority);
					if(priority > highest){
						winner = elements[j];
						highest = priority;
					}
				}
			}
		}

		return winner;
	}

	private static final IExtension[] EMPTY_EXTENSIONS = {};

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getExtensions(java.lang.String)
	 */
	public IExtension[] getExtensions(String extensionPoint) {
		if (this.registry == null) {
			this.registry = Activator.getActivator().getRegistry();
		}
		if (this.registry != null) {
			IExtensionPoint point = this.registry.getExtensionPoint(IDavinciServerConstants.BUNDLE_ID, extensionPoint);

			if (point != null) {
				return point.getExtensions();
			}
		}
		return ServerManager.EMPTY_EXTENSIONS;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getLibraryManager()
	 */
	public synchronized ILibraryManager getLibraryManager() {
		if (libraryManager == null) {
			/*
    		 IConfigurationElement libraryElement = ServerManager.getServerManager().getExtension(IDavinciServerConstants.EXTENSION_POINT_LIBRARY_MANAGER, IDavinciServerConstants.EP_TAG_LIBRARY_MANAGER);
		        if (libraryElement != null) {
		        try {
		           this.libraryManager = (ILibraryManager) libraryElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
		        } catch (CoreException e) {
		           e.printStackTrace();
		        }
	        }
			 */
			libraryManager = new LibraryManager();
		}

		return libraryManager;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getLibraryManager()
	 */
	public synchronized IProjectTemplatesManager getProjectTemplatesManager() {
		if (projectTemplatesManager == null) {
			projectTemplatesManager = new ProjectTemplatesManager();
		}
		return projectTemplatesManager;
	}

	public IPersonManager getPersonManager() {

		if(this.personManager==null){
			IConfigurationElement libraryElement = ServerManager.getServerManager().getExtension(IDavinciServerConstants.EXTENSION_POINT_PERSON_MANAGER,
					IDavinciServerConstants.EP_TAG_PERSON_MANAGER);
			if (libraryElement != null) {
				try {
					this.personManager = (IPersonManager) libraryElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
				} catch (CoreException e) {
					theLogger.logp(Level.SEVERE, ServerManager.class.getName(), "getPersonManager", "unexpected failure", e);
					throw new Error(e);
				}
			}

		}
		return this.personManager;
	}

	public IStorage getBaseDirectory() {
		if (userDir == null) {
			// Use the same directory as the Orion workspace
			Location instanceLoc = ConfiguratorActivator.getDefault().getInstanceLocation();
			userDir = new StorageFileSystem(instanceLoc.getURL().getFile());
		}
		return userDir;
	}
}
