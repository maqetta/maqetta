package org.maqetta.server;

import java.io.File;
import java.util.List;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.server.user.IPersonManager;
import org.davinci.server.user.IUserManager;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;

public interface IServerManager {

	public String getDavinciProperty(String propertyName);

	public IUserManager getUserManager();

	public ILibraryManager getLibraryManager();

	public IPersonManager getPersonManager();

	public File getBaseDirectory();

}