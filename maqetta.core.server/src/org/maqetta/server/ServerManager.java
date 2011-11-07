package org.maqetta.server;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NameNotFoundException;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.ajaxLibrary.LibraryManager;

import org.davinci.server.internal.Activator;
import org.davinci.server.internal.IRegistryListener;

import org.davinci.server.user.IUserManager;
import org.davinci.server.user.IPersonManager;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;

public class ServerManager implements IServerManager {

    static ServerManager  theServerManager;

    IUserManager           userManager;

    IExtensionRegistry    registry;
    IPersonManager personManager;
    ILibraryManager        libraryManager;

    public ServletConfig  servletConfig;

	private File userDir;

    public static boolean DEBUG_IO_TO_CONSOLE;
    public static boolean LOCAL_INSTALL;
    public static boolean IN_WAR;

    {
    	ServerManager.IN_WAR = false;
        String localInstall = this.getDavinciProperty(IDavinciServerConstants.LOCAL_INSTALL);
        if (localInstall != null) {
            ServerManager.LOCAL_INSTALL = Boolean.parseBoolean(localInstall);
        } else {
            ServerManager.LOCAL_INSTALL = false;
        }

        String base = System.getProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
        ServerManager.IN_WAR = Boolean.parseBoolean(this.getDavinciProperty(IDavinciServerConstants.INWAR_PROPERTY));

    }

    ServerManager() {
        String shouldDebug = this.getDavinciProperty(IDavinciServerConstants.SERVER_DEBUG);
        if (shouldDebug != null && "true".equals(shouldDebug)) {
            ServerManager.DEBUG_IO_TO_CONSOLE = Boolean.parseBoolean(shouldDebug);
        } else {
            ServerManager.DEBUG_IO_TO_CONSOLE = false;
        }

        Activator.getActivator().addRegistryChangeListener(new IRegistryListener() {
            public void registryChanged() {
                ServerManager.this.registry = Activator.getActivator().getRegistry();
            }
        });
    }

    public static ServerManager getServerManger() {
        if(ServerManager.theServerManager==null)
        	ServerManager.theServerManager = new ServerManager();
    	
    	return ServerManager.theServerManager;
    }

    /* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getDavinciProperty(java.lang.String)
	 */
    public String getDavinciProperty(String propertyName) {
        String property = null;
        if (ServerManager.IN_WAR) {
            try {
                Context env = (Context) new InitialContext().lookup("java:comp/env");
                property = (String) env.lookup(propertyName);
            } catch (NameNotFoundException e) {
                // ignore
            } catch (NamingException e) {
                e.printStackTrace();
            }

            // String property
            // =this.servletConfig.getServletContext().getInitParameter(propertyName);
            System.out.println("servlet parm '" + propertyName + "' is : " + property);

        }
        if (property == null) {
            property = System.getProperty(propertyName);
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
        for (int i = 0; i < extensions.length; i++) {
            IConfigurationElement[] elements = extensions[i].getConfigurationElements();
            for (int j = 0; j < elements.length; j++) {
                if (elements[j].getName().equals(elementTag)) {
                    return elements[j];
                }
            }
        }

        return null;
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

    public File getBaseDirectory(){
    	if(this.userDir ==null){
    	
	    	 String basePath = getDavinciProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
	         
	         if (basePath != null && basePath.length() > 0) {
	             File dir = new File(basePath);
	             if (dir.exists()) {
	                 userDir = dir;
	             } else {
	                 System.err.println("FATAL!!!!! User directory does not exist.");
	             }
	         }
	         if (userDir == null) {
	             userDir = (File) servletConfig.getServletContext().getAttribute("javax.servlet.context.tempdir");
	         }
	         if (userDir == null) {
	             userDir = new File(".");
	         }
    	}
         return this.userDir;
    }
    

}
