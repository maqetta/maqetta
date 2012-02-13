package maqetta.server.orion.user;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.maqetta.server.ILinks;
import org.maqetta.server.IVResource;


public class User implements IUser {

	
	private IPerson person;

	


	public User(IPerson person) {
		this.person = person;
	//	this.userDirectory = userDirectory;
	//	userDirectory.mkdirs();
		//rebuildWorkspace();
	}

	/* rebuilds the virtual part of the workspace.
	 * 
	 * any real files are NOT included in this data structure for 
	 * performance reasons. 
	 */
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#rebuildWorkspace()
	 */
	

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getUserName()
	 */
	public String getUserName() {
		return this.person.getUserName();
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getPerson()
	 */
	public IPerson getPerson() {
		return this.person;
	}

	public boolean isValid(String path) {
		// TODO Auto-generated method stub
		return false;
	}

	public void rebuildWorkspace() {
		// TODO Auto-generated method stub
		
	}

	public IVResource createEclipseProject(String projectName) {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource createProject(String projectName) {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource createProject(String projectName, String basePath,
			boolean initFiles) {
		// TODO Auto-generated method stub
		return null;
	}

	public void addBaseSettings(String base) {
		// TODO Auto-generated method stub
		
	}

	public void deleteBaseSettings(String base) {
		// TODO Auto-generated method stub
		
	}

	public File getUserDirectory() {
		// TODO Auto-generated method stub
		return null;
	}

	public void modifyLibrary(String id, String version, String base,
			boolean installed) {
		// TODO Auto-generated method stub
		
	}

	public void modifyLibrary(String id, String version, String virtualRoot,
			String base) {
		// TODO Auto-generated method stub
		
	}

	public IVResource[] listFiles(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource getResource(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource createResource(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	public File getWorkbenchSettings() {
		// TODO Auto-generated method stub
		return null;
	}

	public File getWorkbenchSettings(String base) {
		// TODO Auto-generated method stub
		return null;
	}

	public ILinks getLinks() {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource[] findFiles(String pathStr, boolean ignoreCase,
			boolean workspaceOnly) {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource[] findFiles(String pathStr, String startFolder,
			boolean ignoreCase, boolean workspaceOnly) {
		// TODO Auto-generated method stub
		return null;
	}

	public ILibInfo[] getLibs(String base) {
		// TODO Auto-generated method stub
		return null;
	}

	public String getLibPath(String id, String version, String base) {
		// TODO Auto-generated method stub
		return null;
	}

}
