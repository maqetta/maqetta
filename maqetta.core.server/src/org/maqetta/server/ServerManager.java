package org.maqetta.server;


import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.SendFailedException;
import javax.servlet.ServletConfig;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.internal.IRegistryListener;
import org.davinci.server.user.IPersonManager;
import org.davinci.server.user.IUserManager;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;
import org.maqetta.server.mail.SimpleMessage;
import org.maqetta.server.mail.SmtpPop3Mailer;

public class ServerManager implements IServerManager {

	static private ServerManager  theServerManager;

	private IUserManager           userManager;

	private IExtensionRegistry    registry;
	private IPersonManager personManager;
	private ILibraryManager        libraryManager;

	public ServletConfig  servletConfig;
	private static SmtpPop3Mailer mailer = null;
	private IStorage userDir;
	private Hashtable<String, String> options = new Hashtable<String, String>();

	public static boolean DEBUG_IO_TO_CONSOLE = false;
	public static boolean LOCAL_INSTALL = false;

//	private enum SetBoolean {
//		FALSE, TRUE, UNDEFINED
//	};
//	private static SetBoolean IN_WAR;

	{
//		IN_WAR = SetBoolean.UNDEFINED;
		String localInstall = this.getDavinciProperty(IDavinciServerConstants.LOCAL_INSTALL);
		if (localInstall != null) {
			ServerManager.LOCAL_INSTALL = Boolean.parseBoolean(localInstall);
		}
	}

	public SmtpPop3Mailer getMailer(){
		if(mailer==null) {
			mailer = SmtpPop3Mailer.getDefault();
		}
		return mailer;
	}

	private ServerManager() {
		try {
			this.readConfigFile();
		} catch (IOException e) {
			e.printStackTrace(); // TODO: better way to surface this?
		}
		String shouldDebug = this.getDavinciProperty(IDavinciServerConstants.SERVER_DEBUG);
		if (shouldDebug != null && "true".equals(shouldDebug)) { //FIXME: true check seems redundant
			ServerManager.DEBUG_IO_TO_CONSOLE = Boolean.parseBoolean(shouldDebug);
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
		BufferedReader br = null;
		try {
			String configFile = this.getDavinciProperty(IDavinciServerConstants.CONFIG_FILE);
			// Open the file that is the first command line parameter
			FileInputStream fstream = new FileInputStream(configFile);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			br = new BufferedReader(new InputStreamReader(in));

			//Read File Line By Line
			String strLine;
			while ((strLine = br.readLine()) != null) {
				// Print the content on the console
				if (ServerManager.DEBUG_IO_TO_CONSOLE) {
					System.out.println (strLine);
				}
				strLine = strLine.trim(); // remove leading trailing white space
				String delims = "[=]+";
				String[] tokens = strLine.split(delims, 2); // splits the strng at the first '='
				if ((tokens.length > 1) && (tokens[0].startsWith("#") == false)) {
					this.options.put(tokens[0], tokens[1]);
				}
			}
		} finally {
			if (br != null) {
				br.close();
			}
		}
	}

	public static ServerManager getServerManger() {
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
		if (ServerManager.DEBUG_IO_TO_CONSOLE) {
			System.out.println("servlet parm '" + propertyName + "' is : " + property);
		}
		return property;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getUserManager()
	 */
	public IUserManager getUserManager() {
		if (userManager == null) {
			IConfigurationElement libraryElement = ServerManager.getServerManger().getExtension(IDavinciServerConstants.EXTENSION_POINT_USER_MANAGER, IDavinciServerConstants.EP_TAG_USER_MANAGER);
			if (libraryElement != null) {
				try {
					this.userManager = (IUserManager) libraryElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
				} catch (CoreException e) {
					e.printStackTrace();
				}
			}
		}

		return userManager;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getExtensions(java.lang.String, java.lang.String)
	 */
	public List getExtensions(String extensionPoint, String elementTag) {
		ArrayList list = new ArrayList();
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
    		 IConfigurationElement libraryElement = ServerManager.getServerManger().getExtension(IDavinciServerConstants.EXTENSION_POINT_LIBRARY_MANAGER, IDavinciServerConstants.EP_TAG_LIBRARY_MANAGER);
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

	public IPersonManager getPersonManager() {

		if(this.personManager==null){
			IConfigurationElement libraryElement = ServerManager.getServerManger().getExtension(IDavinciServerConstants.EXTENSION_POINT_PERSON_MANAGER,
					IDavinciServerConstants.EP_TAG_PERSON_MANAGER);
			if (libraryElement != null) {
				try {
					this.personManager = (IPersonManager) libraryElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
				} catch (CoreException e) {
					e.printStackTrace();
				}
			}

		}
		return this.personManager;
	}

	public void setBaseDirectory(IStorage baseDirectory){
		this.userDir = baseDirectory;
	}

	public IStorage getBaseDirectory(){
		if(this.userDir ==null){

			String basePath = getDavinciProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);

			if (basePath != null && basePath.length() > 0) {
				IStorage dir = new StorageFileSystem(basePath);
				if (dir.exists()) {
					userDir = dir;
				} else {
					System.err.println("FATAL!!!!! User directory does not exist.");
					throw new RuntimeException("User directory does not exist.");
				}
			}
			if (userDir == null) {
				File tempDir = (File) servletConfig.getServletContext().getAttribute("javax.servlet.context.tempdir");
				userDir = new StorageFileSystem(tempDir);
			}
			if (userDir == null) {
				userDir =new StorageFileSystem(".");
			}
		}
		return this.userDir;
	}

	public boolean sendEmail( String from, String to, String subject, String content) {
		SimpleMessage email = new SimpleMessage(from, to, null, null,subject, content);


		try {
			SmtpPop3Mailer mailer = this.getMailer();

			if(mailer==null) {
				return false;
			}

			mailer.sendMessage(email);
		} catch (SendFailedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();

			//Failure, so should return false
			return false;
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();

			//Failure, so should return false
			return false;
		}
		return true;

	}


}
