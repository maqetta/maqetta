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

import maqetta.server.orion.VDirectory;
import maqetta.server.orion.VFile;
import maqetta.server.orion.VLibraryResource;
import maqetta.server.orion.VResourceUtils;
import maqetta.server.orion.VWorkspaceRoot;
import maqetta.server.orion.internal.Activator;
import maqetta.server.orion.internal.Links;
import maqetta.server.orion.internal.Links.Link;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOCase;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.NameFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.ILibraryFinder;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.davinci.server.user.LibrarySettings;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.project.util.EclipseProjectUtil;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ILink;
import org.maqetta.server.ILinks;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.osgi.framework.Bundle;

public class User implements IUser {

	private static final boolean CASCADE_SETTINGS = false;
	private File userDirectory;
	private File settingsDirectory;
	private Links links;
	private IPerson person;
	private IVResource workspace;
	


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
	public void rebuildWorkspace() {
		this.workspace = new VWorkspaceRoot();
		File[] userFiles = this.userDirectory.listFiles();
		
		for(int j=0;j<userFiles.length;j++){
			if(!userFiles[j].isDirectory()) continue;
			LibrarySettings settings = this.getLibSettings(userFiles[j]);
			if(!settings.exists()) continue;
			Vector<ILibInfo> libs = new Vector();
			libs.addAll(Arrays.asList( settings.allLibs()));
			
			
			IVResource workspace = this.workspace;
			IVResource firstFolder = new VDirectory(workspace, userFiles[j].getName());
			this.workspace.add(firstFolder);
			for (int i = 0; i < libs.size(); i++) {
				IVResource root = firstFolder;
				String defaultRoot = libs.get(i).getVirtualRoot();
				
				if(defaultRoot==null) continue;
				
				Library b = this.getLibrary(libs.get(i));
				/* library not found on server so avoid adding it to the workspace */
				if (b == null) {
					continue;
				}
				URL file = b.getURL("");
				// TODO temp fix to avoid adding virtual library entries that don't
				// exist to the workspace.
				if (file == null) {
					continue;
				}
				IPath path = new Path(defaultRoot);
				for (int k = 0; k < path.segmentCount(); k++) {
					String segment = path.segment(k);
					IVResource v = root.get(segment);
					if (v == null) {
						v = new VDirectory(root, segment);
						root.add(v);
					}
					root = v;
				}
	
				
				IVResource libResource = new VLibraryResource(b, file,"", "");
				/* need a special case for library items whos root is the project roots */
				//if(path.segmentCount()==0){
					
				IVResource[] children = libResource.listFiles();
				for(int p=0;p<children.length;p++)
					root.add(children[p]);
				//}else{
				//	root.add(libResource);
				//}
			}
		}
	}
	
	
	public ILibraryFinder[] getFinders(String base){
		ILibraryFinder[] finders = ServerManager.getServerManger().getLibraryManager().getLibraryFinders();
		File baseFile = new File(this.userDirectory, base);
		Vector<ILibraryFinder> allLibs = new Vector();
		for(int i=0;i<finders.length;i++){
			ILibraryFinder finder = finders[i].getInstance(baseFile.toURI());
			allLibs.add(finder);
		}
		return allLibs.toArray(new ILibraryFinder[allLibs.size()]);
	}
	
	public ILibInfo[] getExtendedSettings(String base){
		
		ILibraryFinder[] finders = ServerManager.getServerManger().getLibraryManager().getLibraryFinders();
		File baseFile = new File(this.userDirectory, base);
		Vector<ILibInfo> allLibs = new Vector();
		for(int i=0;i<finders.length;i++){
			ILibraryFinder finder = finders[i].getInstance(baseFile.toURI());
			allLibs.addAll(Arrays.asList(finder.getLibInfo()));
		}
		return (ILibInfo[]) allLibs.toArray(new ILibInfo[allLibs.size()]);
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createEclipseProject(java.lang.String)
	 */
	public IVResource createEclipseProject(String projectName){
		IVResource project = createProject(projectName, "WebContent", true);
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
           	IVResource resource = this.createResource(resourcePath.toString());
           	
           	VResourceUtils.setText(resource, xml);
           	
          }
        /* modify the library settings with the WebContent folder */
       Library[] allLibs = ServerManager.getServerManger().getLibraryManager().getAllLibraries();
        
        for(int i=0;i<allLibs.length;i++){
        	Library lib = allLibs[i];
        	String root = lib.getDefaultRoot();
        	if(root!=null){
        		String id= lib.getID();
            	String version = lib.getVersion();
            	String libPath = "./WebContent" + root;
        		this.modifyLibrary(id, version,  libPath, project.getPath());
        	}
        }
        
        rebuildWorkspace();
		return project;
	}
	
	
	
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createProject(java.lang.String)
	 */
	public IVResource createProject(String projectName){
		return this.createProject(projectName, "", true);
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createProject(java.lang.String, java.lang.String, boolean)
	 */
	public IVResource createProject(String projectName, String basePath, boolean initFiles){
		IVResource project = createResource(projectName + "/");
		/*
		 * Load the initial user files extension point and copy the files to the projects root
		 */
		
		if(basePath!=null && !basePath.equals("")){
			project.create(basePath + "/");
		}
			
		
		if(initFiles){
			List extensions = ServerManager.getServerManger().getExtensions(IDavinciServerConstants.EXTENSION_POINT_INITIAL_USER_FILES,
	                IDavinciServerConstants.EP_TAG_INITIAL_USER_FILE);
	        for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
	            IConfigurationElement libraryElement = (IConfigurationElement) iterator.next();
	            String path = libraryElement.getAttribute(IDavinciServerConstants.EP_ATTR_INITIAL_USER_FILE_PATH);
	            String name = libraryElement.getDeclaringExtension().getContributor().getName();
	            Bundle bundle = Activator.getActivator().getOtherBundle(name);
	            File file = null;
				try {
					
					file = new File(project.getURI().getPath()+ "/" + basePath);
					
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
	public void addBaseSettings(String base){
		File baseFile = new File(this.userDirectory, base);
		File settings = new File(baseFile, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
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
		File baseFile = new File(this.userDirectory, base);
		return getLibSettings(baseFile);
	}

	private LibrarySettings getLibSettings(File base) {
		
		File settings = new File(base, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		return new LibrarySettings(settings);
		
		
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getUserDirectory()
	 */
	public File getUserDirectory() {
		return this.userDirectory;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#modifyLibrary(java.lang.String, java.lang.String, java.lang.String, boolean)
	 */
	public void modifyLibrary(String id, String version, String base, boolean installed) {
		LibrarySettings libs = this.getLibSettings(base);

		if (!installed) {
			libs.removeLibrary(id, version, base);

		} else {
			String defaultRoot = ServerManager.getServerManger().getLibraryManager().getDefaultRoot(id, version);
			libs.addLibrary(id, version, id, defaultRoot);
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
	public void modifyLibrary(String id, String version, String virtualRoot, String base) {
		LibrarySettings libs = this.getLibSettings(base);

		libs.modifyLibrary(id, version, virtualRoot, base);
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
		r1 = getLinkedResource(path);
		if (r1 != null) {
            if (r1.isDirectory()) {
                IVResource[] list = r1.listFiles();
                found = VResourceUtils.merge(found, list);
            }
        }
		
		
		r1 = getLibFile(path);
        if (r1 != null) {
            if (r1.isDirectory()) {
                IVResource[] list = r1.listFiles();
                found = VResourceUtils.merge(found, list);
            }
        }
 		return found;
 		

	}

	private void findLibFiles(IPath path, ArrayList results) {
	
		IVResource[] result = this.workspace.find(path.toString());

		for (int i = 0; i < result.length; i++) {
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
        r1 = getLinkedResource(path);
        if (r1 != null) {
           return r1;
        }
        
        return getLibFile(path);
    }

	private Library getLibrary(ILibInfo li) {
		String id = li.getId();
		String version = li.getVersion();
		return ServerManager.getServerManger().getLibraryManager().getLibrary(id, version);

	}

	private IVResource getLibFile(String p1) {
		IPath path = new Path(p1);
		IVResource root = this.workspace;
		for (int i = 0; i < path.segmentCount() && root != null; i++) {
			root = root.get(path.segment(i));

		}

		return root;
	}

	private IVResource getLinkedResource(String path){
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
            VFile linkFile = new VFile(new File(path));
            return linkFile;
        }
        return null;
        
	}
	
	
	 private IVResource getUserFile(String p1) {
	       
	        String path = p1;
	        while(path.length()>0 && (path.charAt(0)=='.' || path.charAt(0)=='/' || path.charAt(0)=='\\'))
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
	            File f = new File(s);
	            parent = new VFile(f, parent, segments[i]);
	        }
	        
	        if(parent==this.workspace)
	            parent = new VFile(this.userDirectory, this.workspace);
	        
	        return parent;

	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#createResource(java.lang.String)
	 */
	public IVResource createResource(String path) {
		/* serve working copy files if they exist */

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
			VFile linkFile = new VFile(new File(path));
			return linkFile;
		}

		IVResource directory = new VFile(this.userDirectory, this.workspace);

		IVResource userFile = directory.create(path);

		return userFile;
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getWorkbenchSettings()
	 */
	public File getWorkbenchSettings() {
		return getWorkbenchSettings("");
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getWorkbenchSettings(java.lang.String)
	 */
	public File getWorkbenchSettings(String base) {
	
		
			File baseFile = new File(this.userDirectory,base);
			File settingsDirectory = new File(baseFile,IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
			
			if(!settingsDirectory.exists())
				settingsDirectory.mkdirs();
		

		return settingsDirectory;
	}
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getLinks()
	 */
	synchronized public ILinks getLinks() {
		if (this.links == null) {
			this.links = new Links(this.getWorkbenchSettings());
		}
		return this.links;
	}

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
			IOFileFilter filter;
			if (path.segment(0).equals("*")) {
				IOCase ioCase = ignoreCase ? IOCase.INSENSITIVE		: IOCase.SENSITIVE;
				filter = new NameFileFilter(path.lastSegment(), ioCase);
			} else {
				String lastSegment = path.lastSegment();
				if (lastSegment.startsWith("*")) {
					filter = new SuffixFileFilter(lastSegment.substring(1));
				} else {
					filter = null;
				}
			}
			// big todo here, have to remove the file filter
			
			File f1 = null; 
		    if (startFolder == null || startFolder.equals(".")) {
		          f1 = this.userDirectory;
		     } else {
		         IVResource start = this.getUserFile(startFolder);
		         if(start!=null)
    		         try {
    		             
    		                 f1 = new File(start.getURI());
                    } catch (URISyntaxException e) {
                        e.printStackTrace();
                    }
		     }
		    if(f1!=null){
    			Collection c = FileUtils.listFiles(f1, filter, TrueFileFilter.INSTANCE);
    			File[] found = (File[]) c.toArray(new File[c.size()]);
    			for (int i = 0; i < found.length; i++) {
    					File workspaceFile = null;
    					workspaceFile = this.userDirectory;
    
    					IPath workspacePath = new Path(workspaceFile.getPath());
    					IPath foundPath = new Path(found[i].getPath());
    					IPath elementPath = foundPath.makeRelativeTo(workspacePath);
    
    					IVResource[] wsFound = this.findFiles(
    							elementPath.toString(), ignoreCase, true);
    					results.addAll(Arrays.asList(wsFound));
    
    			}
		    }
			
			ILink[] allLinks = links.allLinks();
			for (int i = 0; i < allLinks.length; i++) {
				File file = new File(allLinks[i].location);
				Collection c = FileUtils.listFiles(file, filter, TrueFileFilter.INSTANCE);
				File[] found = (File[]) c.toArray(new File[c.size()]);

				for (int p = 0; p < found.length; p++) {
					IPath workspacePath = new Path(this.getUserDirectory()
							.getPath());
					IPath foundPath = new Path(found[p].getPath());
					IPath elementPath = foundPath.makeRelativeTo(workspacePath);

					IVResource[] wsFound = this.findFiles(
							elementPath.toString(), ignoreCase, true);
					results.addAll(Arrays.asList(wsFound));

				}

			}

			if (!workspaceOnly) {
				this.findLibFiles(path, results);

			}
		} else {
			IVResource file = this.getResource(pathStr);
			if (file != null && file.exists()) {
				results.add(file);
			}

		}
		return (IVResource[]) results.toArray(new IVResource[results.size()]);

	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getLibs(java.lang.String)
	 */
	public ILibInfo[] getLibs(String base) {
		
		Vector<ILibInfo> allLibs = new Vector();
		allLibs.addAll(Arrays.asList(this.getLibSettings(base).allLibs()));
		
		allLibs.addAll(Arrays.asList(this.getExtendedSettings(base)));
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
	public String getUserName() {
		return this.person.getUserName();
	}

	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#getPerson()
	 */
	public IPerson getPerson() {
		return this.person;
	}

}
