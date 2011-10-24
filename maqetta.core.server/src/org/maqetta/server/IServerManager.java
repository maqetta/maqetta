package org.maqetta.server;

import java.util.List;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.server.user.IUserManager;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;

public interface IServerManager {

	public String getDavinciProperty(String propertyName);

	public IUserManager getUserManager();

	public List getExtensions(String extensionPoint, String elementTag);

	public IConfigurationElement getExtension(String extensionPoint,
			String elementTag);

	public IExtension[] getExtensions(String extensionPoint);

	public ILibraryManager getLibraryManager();

}