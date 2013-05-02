package maqetta.core.server.user;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import maqetta.core.server.util.VResourceUtils;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.ILibraryFinder;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.internal.Activator;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.davinci.server.user.LibrarySettings;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.project.util.EclipseProjectUtil;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.StorageFileSystem;
import org.maqetta.server.VFile;
import org.maqetta.server.VLibraryResource;
import org.maqetta.server.VStorageDirectory;
import org.maqetta.server.VWorkspaceRoot;
import org.osgi.framework.Bundle;

public class User implements IUser {

	protected IStorage userDirectory;
	protected IStorage projectTemplatesDirectory;
	//protected Links links;
	protected IPerson person;
	protected IVResource workspace;
  
    public User(IPerson person) {
		this.person = person;
	}

	public User(IPerson person, IStorage userDirectory) throws IOException {
		this(person);
		this.userDirectory = userDirectory;
		userDirectory.mkdirs();
		rebuildWorkspace();
	}
	public IVResource newWorkspaceRoot(){
		return   new VWorkspaceRoot();
	}
	/* rebuilds the virtual part of the workspace.
	 * 
	 * any real files are NOT included in this data structure for 
	 * performance reasons. 
	 */
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#rebuildWorkspace()
	 */
	public void rebuildWorkspace() {
		this.workspace = newWorkspaceRoot();
		IStorage[] userFiles = this.userDirectory.listFiles();
		for(int j=0;j<userFiles.length;j++){
			if(isConfig(userFiles[j].getName()) || !userFiles[j].isDirectory()) continue;
			IVResource workspace = this.workspace;
			
			IVResource firstFolder = new VStorageDirectory(userFiles[j], workspace, userFiles[j].getName());
			this.workspace.add(firstFolder);
		}
	}
	private boolean isConfig(String folderName){
		if(folderName==null) return true;
		return folderName.equals(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
	}
	
	public ILibraryFinder[] getFinders(String base){
		ILibraryFinder[] finders = ServerManager.getServerManager().getLibraryManager().getLibraryFinders();
		IStorage baseFile = this.userDirectory.newInstance(this.userDirectory, base);
		Vector<ILibraryFinder> allLibs = new Vector();
		for(int i=0;i<finders.length;i++){
			ILibraryFinder finder = finders[i].getInstance(baseFile.toURI(), baseFile.getName());
			allLibs.add(finder);
		}
		return allLibs.toArray(new ILibraryFinder[allLibs.size()]);
	}
	
	public ILibInfo[] getExtendedSettings(String base){
		
		ILibraryFinder[] finders = ServerManager.getServerManager().getLibraryManager().getLibraryFinders();
		IStorage baseFile = this.userDirectory.newInstance(this.userDirectory, base);
		Vector<ILibInfo> allLibs = new Vector();
		for(int i=0;i<finders.length;i++){
			ILibraryFinder finder = finders[i].getInstance(baseFile.toURI(), baseFile.getName());
			ILibInfo[] libs = finder.getLibInfo();
			allLibs.addAll(Arrays.asList(libs));
		}
		return (ILibInfo[]) allLibs.toArray(new ILibInfo[allLibs.size()]);
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createEclipseProject(java.lang.String)
	 */
	
	public IVResource createEclipseProject(String projectName) throws IOException {
		return createEclipseProject(projectName, "", "");
	}
	public IVResource createEclipseProject(String projectName, String projectToClone, String projectTemplateDirectoryName ) throws IOException {
		IVResource project = createProject(projectName, projectToClone, projectTemplateDirectoryName, "WebContent", true);
		/*
		 * Load the initial user files extension point and copy the files to the projects root
		 */

           
         Hashtable eclipseConfig = EclipseProjectUtil.getEclipseConfig(projectName);
         Iterator keys = eclipseConfig.keySet().iterator();
         while(keys.hasNext()){
          	Object key = keys.next();
           	String filePath = (String)key;
           	String xml = (String)eclipseConfig.get(key);
           	IPath resourcePath = new Path(project.getPath()).append(filePath);
           	IVResource resource = this.createResource(resourcePath.toString(), false);
           	
           	VResourceUtils.setText(resource, xml);
           	
          }
        /* modify the library settings with the WebContent folder */
       Library[] allLibs = ServerManager.getServerManager().getLibraryManager().getAllLibraries();
        
        for(int i=0;i<allLibs.length;i++){
        	Library lib = allLibs[i];
        	String root = lib.getDefaultRoot();
        	if(root!=null){
        		String id= lib.getID();
            	String version = lib.getVersion();
            	String required = lib.getRequired();
            	String libPath = "./WebContent" + root;
        		this.modifyLibrary(id, version,  libPath, project.getPath(), required==null?false:Boolean.parseBoolean(required));
        	}
        }
        
        rebuildWorkspace();
		return project;
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createProject(java.lang.String)
	 */
	public IVResource createProject(String projectName) throws IOException {
		return this.createProject(projectName, "", "", "", true);
	}
	public IVResource createProject(String projectName, String projectToClone, String projectTemplateDirectoryName) throws IOException {
		return this.createProject(projectName, projectToClone, projectTemplateDirectoryName, "", true);
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createProject(java.lang.String, java.lang.String, boolean)
	 */
	public IVResource createProject(String projectName, String projectToClone, String projectTemplateName, 
			String basePath, boolean initFiles) throws IOException {
		IVResource project = createResource(projectName + "/", true);
		/*
		 * Load the initial user files extension point and copy the files to the projects root
		 */
		try {
			if(!isValid(new File(project.getURI()).getAbsolutePath() + "/" + basePath )) return null;
		} catch (URISyntaxException e1) {
			// TODO Auto-generated catch block
			return null;
		}
		if(basePath!=null && !basePath.equals("")){
			project.create(basePath + "/");
		}
			
		
		if(initFiles){
			List extensions = ServerManager.getServerManager().getExtensions(IDavinciServerConstants.EXTENSION_POINT_INITIAL_USER_FILES,
	                IDavinciServerConstants.EP_TAG_INITIAL_USER_FILE);
	        for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
	            IConfigurationElement libraryElement = (IConfigurationElement) iterator.next();
	            String path = libraryElement.getAttribute(IDavinciServerConstants.EP_ATTR_INITIAL_USER_FILE_PATH);
	            String name = libraryElement.getDeclaringExtension().getContributor().getName();
	            Bundle bundle = Activator.getActivator().getOtherBundle(name);
	            IStorage file = null;
				try {
					
					file = new StorageFileSystem(project.getURI().getPath()+ "/" + basePath);
					if(!isValid(file.getAbsolutePath())) return null;
				} catch (URISyntaxException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
	            VResourceUtils.copyDirectory(file, path, bundle);
	        }
		}
        addBaseSettings(projectName);
        rebuildWorkspace();
		return project;
	}

	/*
	 * adds configuration settings for a new path
	 * 
	 * used to map configurations to sub folders
	 */
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#addBaseSettings(java.lang.String)
	 */
	public void addBaseSettings(String base) throws IOException {
		IStorage baseFile = userDirectory.newInstance(this.userDirectory, base);
		if(!isValid(baseFile.getAbsolutePath())) return;
		IStorage settings = userDirectory.newInstance(baseFile, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		settings.mkdirs();
		
		LibrarySettings ls = this.getLibSettings(base);
		ls.save();
		ILibraryFinder[] finders = this.getFinders(base);
		for(int i=0;i<finders.length;i++){
			finders[i].librarySettingsChanged(ls.allLibs());
		}
		rebuildWorkspace();

	
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#deleteBaseSettings(java.lang.String)
	 */
	public void deleteBaseSettings(String base){
		
	}
	private LibrarySettings getLibSettings(String base) {
		return getLibSettings(this.userDirectory.newInstance(this.userDirectory, base));
		
	}
	protected LibrarySettings getLibSettings(IStorage baseFile) {
		if(!isValid(baseFile.getAbsolutePath())) return null;
		return new LibrarySettings(this.userDirectory.newInstance(baseFile, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME));
	}
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getUserDirectory()
	 */
	public IStorage getUserDirectory() {
		return this.userDirectory;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#modifyLibrary(java.lang.String, java.lang.String, java.lang.String, boolean)
	 */
	public void modifyLibrary(String id, String version, String base, boolean installed, boolean required) throws IOException {
		LibrarySettings libs = this.getLibSettings(base);

		if (!installed) {
			libs.removeLibrary(id, version, base);

		} else {
			String defaultRoot = ServerManager.getServerManager().getLibraryManager().getDefaultRoot(id, version);
			libs.addLibrary(id, version, id, defaultRoot, required?"true":"false");
		}
		
		ILibraryFinder[] finders = this.getFinders(base);
		for(int i=0;i<finders.length;i++){
			finders[i].librarySettingsChanged(libs.allLibs());
		}
		
		rebuildWorkspace();
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#modifyLibrary(java.lang.String, java.lang.String, java.lang.String, java.lang.String)
	 */
	public void modifyLibrary(String id, String version, String virtualRoot, String base, boolean required) throws IOException {
		LibrarySettings libs = this.getLibSettings(base);

		libs.modifyLibrary(id, version, virtualRoot, base, required?"true":"false");
		ILibraryFinder[] finders = this.getFinders(base);
		for(int i=0;i<finders.length;i++){
			finders[i].librarySettingsChanged(libs.allLibs());
		}
		
		rebuildWorkspace();
	}

	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#listFiles(java.lang.String)
	 */
	public IVResource[] listFiles(String path) {
	    IVResource[] found = new IVResource[0];
	    if (path == null || path.equals(".") ) {
			path = "";
		}
    
		/* list all files given a path, dont recurse. */
		/* add users actual workspace files */
		IVResource r1 = getUserFile(path);
		if (r1 != null) {
			if (r1.isDirectory()) {
				found = r1.listFiles();
			}
		}
		/* add links */
		/*
		r1 = getLinkedResource(path);
		if (r1 != null) {
            if (r1.isDirectory()) {
                IVResource[] list = r1.listFiles();
                found = VResourceUtils.merge(found, list);
            }
        }
		*/
		
		r1 = getLibFile(path);
        if (r1 != null) {
            if (r1.isDirectory()) {
                IVResource[] list = r1.listFiles();
                found = VResourceUtils.merge(found, list);
            }
        }
 		return found;
 		

	}

	protected void findLibFiles(IPath path, ArrayList results) {
	
		IVResource[] result = this.workspace.find(path.toString());
		/* make sure that we dont add library files that already exist in the file system */
		for (int i = 0; i < result.length; i++) {
			boolean existing = false;
			for(int z=0;z<results.size() && !existing;z++){
				if(((IVResource)results.get(z)).getPath().equals(result[i].getPath()))
					existing = true;
			}
			if(!existing)
				results.add(result[i]);
		}
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getResource(java.lang.String)
	 */
	public IVResource getResource(String path) {

	    IVResource r1 = getUserFile(path);
        if (r1 != null) {
            return r1;
        }
        /* add links */
        /*
        r1 = getLinkedResource(path);
        if (r1 != null) {
           return r1;
        }
        */
        return getLibFile(path);
    }


	protected IVResource getLibFile(String p1) {
		IPath path = new Path(p1);
		IVResource root = this.workspace;
		for (int i = 0; i < path.segmentCount() && root != null; i++) {
			root = root.get(path.segment(i));

		}

		return root;
	}
	/*
	protected IVResource getLinkedResource(String path){
	    String path1 = path;
        if (path1.startsWith("./")) {
            path1 = path.substring(2);
        } else if (path.length() > 0 && path.charAt(0) == '.') {
            path1 = path.substring(1);
        }
	    ILink link = this.getLinks().hasLink(path1);
        if (link != null) {
            path = link.location + "/" + path1.substring(link.path.length());
            path = path.replace('/', File.separatorChar);
            VFile linkFile = new VFile(this.userDirectory.newInstance(path));
            return linkFile;
        }
        return null;
        
	}
	*/
	public boolean isValid(String path){
		 IPath workspaceRoot = new Path(this.userDirectory.getAbsolutePath());
		 IPath a = new Path(path);
	     if (a.matchingFirstSegments(workspaceRoot) != workspaceRoot.segmentCount()) {
	         return false;
	      }
	     return true;
	}
	
	 protected IVResource getUserFile(String p1) {
	       
	        String path = p1;
	        while(path.length()>0 && (path.indexOf(".//")==0 || path.charAt(0)=='/' || path.charAt(0)=='\\'))
            	path=path.substring(1);

	        IPath a = new Path(this.userDirectory.getAbsolutePath()).append(path);
	        /*
	         * security check, dont want to return a resource BELOW the workspace
	         * root
	         */
	        IPath workspaceRoot = new Path(this.userDirectory.getAbsolutePath());
	        if (a.matchingFirstSegments(workspaceRoot) != workspaceRoot.segmentCount()) {
	            return null;
	        }

	        File f1 = new File(a.toOSString());

	        if (!f1.exists()) {

	            IPath a2 = new Path(this.userDirectory.getAbsolutePath()).append(path + IDavinciServerConstants.WORKING_COPY_EXTENSION);
	            File workingCopy = new File(a2.toOSString());
	            if (!workingCopy.exists()) {
	                return null;
	            }
	        }
	        String[] segments = a.segments();
	        IPath me = new Path(this.userDirectory.getAbsolutePath());
	        IVResource parent = this.workspace;
	        for (int i = me.matchingFirstSegments(a); i < segments.length; i++) {
	            int segsToEnd = segments.length - i - 1;
	            String s = a.removeLastSegments(segsToEnd).toOSString();
	            IStorage f = this.userDirectory.newInstance(s);
	            parent = new VFile(f, parent, segments[i]);
	        }
	        
	        if(parent==this.workspace)
	            parent = new VFile(this.userDirectory, this.workspace);
	        
	        return parent;

	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createResource(java.lang.String)
	 */
	public IVResource createResource(String path, boolean isFolder) throws IOException {
		/* serve working copy files if they exist */

		String path1 = path;
		if (path1.startsWith("./")) {
			path1 = path.substring(2);
		} else if (path.length() > 0 && path.charAt(0) == '.') {
			path1 = path.substring(1);
		}
		if(!this.isValid(this.userDirectory.getAbsolutePath() + "/" + path1)) return null;
		
		/*
		ILink link = this.getLinks().hasLink(path1);
		if (link != null) {
			path = link.location + "/" + path1.substring(link.path.length());
			path = path.replace('/', File.separatorChar);
			VFile linkFile = new VFile(this.userDirectory.newInstance(path));
			return linkFile;
		}
		*/
		IVResource directory = new VFile(this.userDirectory, this.workspace);
		/* make sure the new resoruce is within the user directory */
		
		IVResource userFile = directory.create(path);

		return userFile;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getWorkbenchSettings()
	 */
	public IStorage getWorkbenchSettings() throws IOException {
		return getWorkbenchSettings("");
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getWorkbenchSettings(java.lang.String)
	 */
	public IStorage getWorkbenchSettings(String base) throws IOException {
	
		
		IStorage baseFile = userDirectory.newInstance(this.userDirectory,base);
		IStorage settingsDirectory = userDirectory.newInstance(baseFile,IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		if(!isValid(settingsDirectory.getAbsolutePath())) return null;
		
		if(!settingsDirectory.exists())
			settingsDirectory.mkdirs();
		

		return settingsDirectory;
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getLinks()
	 */
	/*
	synchronized public ILinks getLinks() {
		if (this.links == null) {
			this.links = new Links(this.getWorkbenchSettings());
		}
		return this.links;
	}
	*/
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#findFiles(java.lang.String, boolean, boolean)
	 */
	public IVResource[] findFiles(String pathStr, boolean ignoreCase,boolean workspaceOnly) {
		return this.findFiles(pathStr, ".", ignoreCase, workspaceOnly);
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#findFiles(java.lang.String, java.lang.String, boolean, boolean)
	 */
	public IVResource[] findFiles(String pathStr, String startFolder,	boolean ignoreCase, boolean workspaceOnly) {
		boolean isWildcard = pathStr.indexOf('*') >= 0;
		IPath path = new Path(pathStr);
		ArrayList results = new ArrayList();

		// Links links = this.getLinks();
		if (isWildcard) {
			IVResource start = null;
			if (startFolder == null || startFolder.equals(".")) {
		          start = this.workspace;
		    } else {
		         start = this.getResource(startFolder);
		    }
			
			results.addAll(Arrays.asList((start.find(pathStr))));
			
			
			
		} else {
			IVResource file = this.getResource(pathStr);
			if (file != null && file.exists()) {
				results.add(file);
			}

		}
		/* search the libraries */
		
		if (!workspaceOnly) {
			IPath fullPath = new Path(startFolder).append(pathStr);
			findLibFiles(fullPath, results);
		}
		
		
		ArrayList filtered = new ArrayList();
		
		if (workspaceOnly) {
			// need to filter out library entries here in case some got through (mixed directories)
			for(int z=0;z<results.size();z++){
				if(!(results.get(z) instanceof VLibraryResource)){
					filtered.add(results.get(z));
				}
			}
			results = filtered;
		}
		
		return (IVResource[]) results.toArray(new IVResource[results.size()]);

	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getLibs(java.lang.String)
	 */
	public ILibInfo[] getLibs(String base) {
		
		Vector<ILibInfo> allLibs = new Vector();
		allLibs.addAll(Arrays.asList(this.getLibSettings(base).allLibs()));
		
		/* need to make sure we're not already mapping librarys with the same ID and Version in the workspace.  If so, remove them and let the 
		 * library from the finder take precidence. 
		 */
		ILibInfo extendLibs[] = this.getExtendedSettings(base);
		for(int z=0;z<allLibs.size();z++){
			ILibInfo library = allLibs.get(z);
			for(int f=0;f<extendLibs.length;f++){
				if(library.getId().equals(extendLibs[f].getId()) && library.getVersion().equals(extendLibs[f].getVersion()) ){
					allLibs.remove(z);
				}
			}
		}
		
		
		
		allLibs.addAll(Arrays.asList(extendLibs));
		return (ILibInfo[]) allLibs.toArray(new ILibInfo[allLibs.size()]);
		
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getLibPath(java.lang.String, java.lang.String, java.lang.String)
	 */
	public String getLibPath(String id, String version, String base) {
		/*
		 * returns the virtual path of library in the users workspace given ID
		 * and version for now its going to be the default, but this will allow
		 * to remap/move etc..
		 */
		ILibInfo[] mappedLibs = this.getLibs(base);
		for (int i = 0; i < mappedLibs.length; i++) {
			ILibInfo library = mappedLibs[i];
			if (library.getId().equals(id)
					&& library.getVersion().equals(version)) {
				return library.getVirtualRoot();
			}
		}

		return null;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getUserName()
	 */
	public String getUserID() {
		return this.person.getUserID();
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getPerson()
	 */
	public IPerson getPerson() {
		return this.person;
	}
	
	// Following routines are used by OrionUser.java
	
	public void copyDirectory(IStorage sourceDir, IStorage destinationDir) throws IOException {
		destinationDir.mkdirs();
		IStorage[] file = sourceDir.listFiles();
		for (int i = 0; i < file.length; i++) {
			if (file[i].isFile()) {
				IStorage sourceFile = file[i];

				IStorage targetFile = destinationDir.newInstance(destinationDir, file[i].getName());
				copyFile(sourceFile, targetFile);
			}

			if (file[i].isDirectory()) {
				IStorage destination = destinationDir.newInstance(destinationDir, file[i].getName());
				copyDirectory(file[i], destination);
			}
		}
	}

	public void copyFile(IStorage source, IStorage destination) throws IOException {
		InputStream in = null;
		OutputStream out = null;
		try {
			destination.getParentFile().mkdirs();
			in = source.getInputStream();
			out = destination.getOutputStream();
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
		} finally {
			if (in != null) {
				in.close();
			}
			if (out != null) {
				out.close();
			}
		}
	}


}
