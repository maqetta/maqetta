package org.davinci.server;

import java.util.ArrayList;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NameNotFoundException;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;

import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.internal.IRegistryListener;

import org.davinci.server.internal.user.UserManagerImpl;
import org.davinci.server.user.UserManager;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;

public class ServerManager {

	static ServerManager theServerManager;
	
	UserManager userManager;
	
	IExtensionRegistry registry;
	
	LibraryManager libraryManager;

	public ServletConfig servletConfig;
	
	public static boolean DEBUG_IO_TO_CONSOLE;
	public static boolean LOCAL_INSTALL;
	public static boolean IN_WAR;
	
	{
		String localInstall = System.getProperty(IDavinciServerConstants.LOCAL_INSTALL);
		if(localInstall!=null)
			LOCAL_INSTALL = Boolean.parseBoolean(localInstall);	
		else
			LOCAL_INSTALL = false;

		 String base=System.getProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
		 IN_WAR=base==null;
		
	}
	
	ServerManager(ServletConfig servletConfig)
	{
		this.servletConfig=servletConfig;
		String shouldDebug =this.getDavinciProperty(IDavinciServerConstants.SERVER_DEBUG);
		if(shouldDebug!=null && "true".equals(shouldDebug))
			DEBUG_IO_TO_CONSOLE = Boolean.parseBoolean(shouldDebug);	
		else
			DEBUG_IO_TO_CONSOLE = false;
		
		Activator.getActivator().addRegistryChangeListener(new IRegistryListener() {
			public void registryChanged() {
				ServerManager.this.registry = Activator.getActivator().getRegistry();
			}
		});
	}
	
	
	public static ServerManager getServerManger()
	{
		return theServerManager;
	}
	
	
	public static ServerManager createServerManger(ServletConfig servletConfig)
	{
		if (theServerManager==null)
			theServerManager=new ServerManager(servletConfig);
		return theServerManager;
	}
	
	
	public String getDavinciProperty(String propertyName)
	{
		String property  =null;
		if (IN_WAR)
		{
			try {
				Context env = (Context) new InitialContext().lookup("java:comp/env");
				property  = (String) env.lookup(propertyName);
			} catch (NameNotFoundException e) {
				//ignore
			} catch (NamingException e) {
				e.printStackTrace();
			}
			
//			String property =this.servletConfig.getServletContext().getInitParameter(propertyName);
			System.out.println("servlet parm '"+propertyName+"' is : "+property);
			
		}
		if (property==null)
		{
			property=System.getProperty(propertyName);
			System.out.println("servlet parm '"+propertyName+"' is : "+property);
		}
		return property;
	}
	

	public UserManager getUserManager(){
		if (userManager==null)
		{
		    userManager=new UserManagerImpl();
		}
		return userManager;
	}
	

	
	
	public List getExtensions( String extensionPoint,String elementTag)
	{
		ArrayList list = new ArrayList();
		IExtension[] extensions = this.getExtensions(extensionPoint);
		for (int i = 0; i < extensions.length; i++) {
			IConfigurationElement[] elements = extensions[i]
					.getConfigurationElements();
			for (int j = 0; j < elements.length; j++) {
				if (elements[j].getName().equals(elementTag)) {
					list.add(elements[j]);
				}
			}
		}

		return list;
	}

	public IConfigurationElement getExtension( String extensionPoint,String elementTag)
	{
		ArrayList list = new ArrayList();
		IExtension[] extensions = this.getExtensions(extensionPoint);
		for (int i = 0; i < extensions.length; i++) {
			IConfigurationElement[] elements = extensions[i]
					.getConfigurationElements();
			for (int j = 0; j < elements.length; j++) {
				if (elements[j].getName().equals(elementTag)) {
					return elements[j];
				}
			}
		}

		return null;
	}

	private static final IExtension[] EMPTY_EXTENSIONS= {};
	public IExtension[] getExtensions( String extensionPoint)
	{
		ArrayList list=new ArrayList();
		if (this.registry==null)
			this.registry = Activator.getActivator().getRegistry();
		if (this.registry != null) {
			IExtensionPoint point = this.registry.getExtensionPoint(
					IDavinciServerConstants.BUNDLE_ID, extensionPoint);

			if (point != null)  
				return  point.getExtensions();
		}
		return EMPTY_EXTENSIONS;
	}
	
	public synchronized LibraryManager getLibraryManager() {
		if (libraryManager==null)
		{
			libraryManager=new LibraryManager();
		}
		return libraryManager;
	}
}
