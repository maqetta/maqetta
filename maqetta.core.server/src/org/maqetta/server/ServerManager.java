package org.maqetta.server;


import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.SendFailedException;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NameNotFoundException;
import javax.naming.NamingException;
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

    static ServerManager  theServerManager;

    IUserManager           userManager;

    IExtensionRegistry    registry;
    IPersonManager personManager;
    ILibraryManager        libraryManager;

    public ServletConfig  servletConfig;
    private static SmtpPop3Mailer mailer = null;
	private IStorage userDir;

    public static boolean DEBUG_IO_TO_CONSOLE;
    public static boolean LOCAL_INSTALL;

    public enum SetBoolean {
    	FALSE, TRUE, UNDEFINED
    };
    public static SetBoolean IN_WAR;

    {
    	ServerManager.IN_WAR = SetBoolean.UNDEFINED;
        String localInstall = this.getDavinciProperty(IDavinciServerConstants.LOCAL_INSTALL);
        if (localInstall != null) {
            ServerManager.LOCAL_INSTALL = Boolean.parseBoolean(localInstall);
        } else {
            ServerManager.LOCAL_INSTALL = false;
        }
    }

    	public SmtpPop3Mailer getMailer(){
    		if(this.mailer==null)
    			 mailer = SmtpPop3Mailer.getDefault();
    		return this.mailer;
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
    	SetBoolean inWar = ServerManager.IN_WAR;
    	if (inWar != SetBoolean.FALSE) { // inWar == SetBoolean.TRUE || inWar == SetBoolean.UNDEFINED
	    	try {
				Context env = (Context) new InitialContext().lookup("java:comp/env");
				if (inWar == SetBoolean.UNDEFINED) {
					// call to InitialContext.lookup succeeded; assume we're in a WAR
					ServerManager.IN_WAR = SetBoolean.TRUE;
				}
                property = (String) env.lookup(propertyName);
	    	} catch (NameNotFoundException e) {
	    		// do nothing; fall through to `System.getProperty` block
			} catch (NamingException e) {
				if (inWar == SetBoolean.TRUE) {
					e.printStackTrace();
				}
				// call to InitialContext.lookup failed; assume we're running standalone
				ServerManager.IN_WAR = SetBoolean.FALSE;
			}
    	}
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
