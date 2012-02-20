package maqetta.server.orion.user;

import java.net.URISyntaxException;
import java.net.URL;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import maqetta.core.server.user.User;
import maqetta.core.server.util.VResourceUtils;
import maqetta.server.orion.VOrionResource;
import maqetta.server.orion.VOrionWorkspace;
import maqetta.server.orion.VOrionWorkspaceStorage;
import maqetta.server.orion.internal.Activator;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.LibrarySettings;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.eclipse.orion.internal.server.servlets.workspace.WebUser;
import org.eclipse.orion.internal.server.servlets.workspace.WebWorkspace;
import org.eclipse.orion.internal.server.servlets.workspace.WorkspaceResourceHandler;
import org.eclipse.orion.server.core.users.OrionScope;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.StorageFileSystem;
import org.maqetta.server.VDirectory;
import org.maqetta.server.VLibraryResource;
import org.osgi.framework.Bundle;


public class OrionUser extends User {

	private WebUser webuser;
	private WebWorkspace webWorkspace;
	protected static final IScopeContext scope = new OrionScope();
	protected IEclipsePreferences store;
	private static String DEFAULT_WORKSPACE = "MyWorkspace";
	private static final String WORKSPACE_NODE_NAME = "Workspaces";//$NON-NLS-1$
	
	public OrionUser(IPerson person) {
		super(person);
		this.webuser = WebUser.fromUserName(this.getUserName());
		try {
			JSONArray workspaceJson = webuser.getWorkspacesJSON();
			for(int i=0;i<workspaceJson.length();i++){
				JSONObject workObj = (JSONObject)workspaceJson.get(i);
				webWorkspace = WebWorkspace.fromId(workObj.getString("Id"));
				
				/* may need to default to other workspace here via the URL or a cookie, but taking first one found for now */
				break;
			}
			if(workspaceJson.length()==0)
				webWorkspace = webuser.createWorkspace(DEFAULT_WORKSPACE);
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String workspaceId = webWorkspace.getId();
		this.userDirectory = new VOrionWorkspaceStorage(webWorkspace, this.getUserName());
		this.workspace = new VOrionWorkspace((VOrionWorkspaceStorage)this.userDirectory);
		
		
	}
	
	public VOrionResource createOrionProject(String name){
		//make sure required fields are set
				
		IVResource existing = this.workspace.get(name);;
		if(existing!=null)
			return (VOrionResource)existing;
		
		return (VOrionResource)this.workspace.create(name);		
			
	}
	
	
	
	public IVResource createProject(String projectName, String basePath, boolean initFiles){
		VOrionResource project = createOrionProject(projectName);
		/*
		 * Load the initial user files extension point and copy the files to the projects root
		 */
		
		if(basePath!=null && !basePath.equals("")){
			project.create(basePath + "/");
		}
			
		
		if(initFiles){
			List extensions = ServerManager.getServerManger().getExtensions(IDavinciServerConstants.EXTENSION_POINT_INITIAL_USER_FILES, IDavinciServerConstants.EP_TAG_INITIAL_USER_FILE);
	        for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
	            IConfigurationElement libraryElement = (IConfigurationElement) iterator.next();
	            String path = libraryElement.getAttribute(IDavinciServerConstants.EP_ATTR_INITIAL_USER_FILE_PATH);
	            String name = libraryElement.getDeclaringExtension().getContributor().getName();
	            Bundle bundle = Activator.getActivator().getOtherBundle(name);
	            IStorage file = project.getStorage();
			
					if(basePath!=null && !basePath.equals(""))
						file = file.newInstance(project.getPath()+ "/" + basePath);
				
				
	            VResourceUtils.copyDirectory(file, path, bundle);
	        }
		}
        addBaseSettings(projectName);
        rebuildWorkspace();
		return project;
	}
	
	public boolean isValid(String path){
	     return true;
	}
	public IVResource getResource(String p1){
	      
		if(p1==null || p1.equals(""))
			return this.workspace;
		
        String path = p1;
        while(path.length()>0 && (path.charAt(0)=='.' || path.charAt(0)=='/' || path.charAt(0)=='\\'))
        	path=path.substring(1);

        IPath a = new Path(this.userDirectory.getAbsolutePath()).append(path);
        /*
         * security check, dont want to return a resource BELOW the workspace
         * root
         */
        IStorage parentStorage = this.userDirectory.newInstance(a.toString());
        
        
        if (!parentStorage.exists()) {

            IPath a2 = new Path(this.userDirectory.getAbsolutePath()).append(path + IDavinciServerConstants.WORKING_COPY_EXTENSION);
            IStorage workingCopy = this.userDirectory.newInstance(a2.toString());
            if (!workingCopy.exists()) {
                return null;
            }
        }
     
       
        IVResource parent = this.workspace;
        IPath halfPath = new Path("");
        for (int i = 1; i < a.segmentCount(); i++) {
        	halfPath = halfPath.append(a.segment(i));
        	IStorage f = this.userDirectory.newInstance(halfPath.toString());
            parent = new VOrionResource(f, parent,a.segment(i));
        }
        /*
        if(parent==this.workspace)
            parent = new VFile(this.userDirectory, this.workspace);
        */
        return parent;

	}
	protected IVResource getLinkedResource(String path){
	    return null;
        
	}
	public WebWorkspace createWorkspace(String workspaceName){
		try {
			return webuser.createWorkspace(workspaceName);
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	public IVResource[] listFiles(String path) {
	    IVResource[] found = new IVResource[0];
	    if (path == null || path.equals(".") ) {
			path = "";
		}
    
		/* list all files given a path, dont recurse. */
		/* add users actual workspace files */
		IVResource r1 = getResource(path);
		if (r1 != null) {
			if (r1.isDirectory()) {
				found = r1.listFiles();
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
	/* rebuilds the virtual part of the workspace.
	 * 
	 * any real files are NOT included in this data structure for 
	 * performance reasons. 
	 */
	
	/* (non-Javadoc)
	 * @see org.davinci.server.user.IUser#rebuildWorkspace()
	 */
	public void rebuildWorkspace() {
		
		IStorage[] userFiles = this.userDirectory.listFiles();
		
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
						/* creating virtual directory structure, so READ ONLY */
						v = new VDirectory(root, segment,true);
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
}
