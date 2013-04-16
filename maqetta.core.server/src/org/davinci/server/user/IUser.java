package org.davinci.server.user;

import java.io.IOException;

import org.davinci.ajaxLibrary.ILibInfo;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;

public interface IUser {

	public void rebuildWorkspace();

	public IVResource createEclipseProject(String projectName, String projectToClone, String projectTemplateDirectoryName) throws IOException;
	public IVResource createEclipseProject(String projectName) throws IOException;

	public IVResource createProject(String projectName, String projectToClone, String projectTemplateDirectoryName) throws IOException;
	public IVResource createProject(String projectName) throws IOException;
	
	public IVResource newWorkspaceRoot();
	
	public IVResource createProject(String projectName, String projectToClone, String projectTemplateDirectoryName, 
			String basePath, boolean initFiles) throws IOException;

	/*
	 * adds configuration settings for a new path
	 * 
	 * used to map configurations to sub folders
	 */
	public void addBaseSettings(String base) throws IOException;

	public void deleteBaseSettings(String base);

	public IStorage getUserDirectory();

	public void modifyLibrary(String id, String version, String base,
			boolean installed, boolean required) throws IOException;

	public void modifyLibrary(String id, String version, String virtualRoot,
			String base, boolean required) throws IOException;

	public IVResource[] listFiles(String path);

	public IVResource getResource(String path);

	public IVResource createResource(String path, boolean isFolder) throws IOException;

	public IStorage getWorkbenchSettings() throws IOException;

	public IStorage getWorkbenchSettings(String base) throws IOException;

	//public ILinks getLinks();

	public IVResource[] findFiles(String pathStr, boolean ignoreCase,
			boolean workspaceOnly);

	public IVResource[] findFiles(String pathStr, String startFolder,
			boolean ignoreCase, boolean workspaceOnly);

	public ILibInfo[] getLibs(String base);

	public String getLibPath(String id, String version, String base);

	public String getUserID();

	public IPerson getPerson();
	
	public boolean isValid(String path);

	public void copyDirectory(IStorage sourceDir, IStorage destinationDir) throws IOException;
	public void copyFile(IStorage source, IStorage destination) throws IOException;

}