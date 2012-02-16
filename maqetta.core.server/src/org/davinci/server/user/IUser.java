package org.davinci.server.user;

import org.davinci.ajaxLibrary.ILibInfo;
import org.maqetta.server.ILinks;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;

public interface IUser {

	public void rebuildWorkspace();

	public IVResource createEclipseProject(String projectName);

	public IVResource createProject(String projectName);

	public IVResource createProject(String projectName, String basePath,
			boolean initFiles);

	/*
	 * adds configuration settings for a new path
	 * 
	 * used to map configurations to sub folders
	 */
	public void addBaseSettings(String base);

	public void deleteBaseSettings(String base);

	public IStorage getUserDirectory();

	public void modifyLibrary(String id, String version, String base,
			boolean installed);

	public void modifyLibrary(String id, String version, String virtualRoot,
			String base);

	public IVResource[] listFiles(String path);

	public IVResource getResource(String path);

	public IVResource createResource(String path);

	public IStorage getWorkbenchSettings();

	public IStorage getWorkbenchSettings(String base);

	public ILinks getLinks();

	public IVResource[] findFiles(String pathStr, boolean ignoreCase,
			boolean workspaceOnly);

	public IVResource[] findFiles(String pathStr, String startFolder,
			boolean ignoreCase, boolean workspaceOnly);

	public ILibInfo[] getLibs(String base);

	public String getLibPath(String id, String version, String base);

	public String getUserName();

	public IPerson getPerson();
	
	public boolean isValid(String path);

}