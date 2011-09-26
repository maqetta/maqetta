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

    static IExtensionRegistry    registry;
    IPersonManager personManager;
    ILibraryManager        libraryManager;

   

	private File userDir;

	private IMaqettaConfig config;

    public static boolean DEBUG_IO_TO_CONSOLE;
    public static boolean LOCAL_INSTALL;
    public static boolean IN_WAR;

    {
        String localInstall = System.getProperty(IDavinciServerConstants.LOCAL_INSTALL);
        if (localInstall != null) {
            ServerManager.LOCAL_INSTALL = Boolean.parseBoolean(localInstall);
        } else {
            ServerManager.LOCAL_INSTALL = false;
        }
        String base = null;
        try{
        	base = System.getProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
        }catch(Exception e){
        	// system property not defined.
        	if(ServerManager.DEBUG_IO_TO_CONSOLE)
        		System.out.println(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY + " note defined!  Using system temp location");
        }
        ServerManager.IN_WAR = base == null;

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

    public static IServerManager getServerManger() {
        if(theServerManager==null)
        	theServerManager = new ServerManager();
        return theServerManager;
    }



    /* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getDavinciProperty(java.lang.String)
	 */
    public String getDavinciProperty(String propertyName) {
    	if (config == null) {
	        IConfigurationElement libraryElement = Extensions.getExtension(IDavinciServerConstants.EXTENSION_POINT_MAQETTACONFIG, IDavinciServerConstants.EP_TAG_MAQETTACONFIG);
		        if (libraryElement != null) {
		        try {
		           this.config = (IMaqettaConfig) libraryElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_CLASS);
		        } catch (CoreException e) {
		           e.printStackTrace();
		        }
	        }
 	 }
     
     return config.getProperty(propertyName);
    }

    /* (non-Javadoc)
	 * @see org.davinci.server.IServerManager#getUserManager()
	 */
    public IUserManager getUserManager() {
   	 if (userManager == null) {
	        IConfigurationElement libraryElement = Extensions.getExtension(IDavinciServerConstants.EXTENSION_POINT_USER_MANAGER, IDavinciServerConstants.EP_TAG_USER_MANAGER);
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
            IConfigurationElement libraryElement = Extensions.getExtension(IDavinciServerConstants.EXTENSION_POINT_PERSON_MANAGER,
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
	                 System.out.println("dir doesnt exist");
	             }
	         }

	         if (userDir == null) {
	             userDir = new File(".");
	         }
    	}
         return this.userDir;
    }
    

}
