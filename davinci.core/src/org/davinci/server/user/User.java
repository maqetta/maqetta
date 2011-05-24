package org.davinci.server.user;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Vector;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOCase;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.NameFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.davinci.ajaxLibrary.LibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.IVResource;
import org.davinci.server.ServerManager;
import org.davinci.server.VDirectory;
import org.davinci.server.VFile;
import org.davinci.server.VLibraryResource;
import org.davinci.server.VWorkspaceRoot;
import org.davinci.server.internal.Links;
import org.davinci.server.internal.Links.Link;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class User {

	File userDirectory;
	File settingsDirectory;
	Links links;
	Person person;
	IVResource workspace;
	LibrarySettings libSettings;
	

	
	public User(Person person, IVResource userDirectory) {
		this.person=person;
		try {
			this.userDirectory=new File(userDirectory.getURI());
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	
		rebuildWorkspace();
	}
	
	public User(Person person,File userDirectory) {
		this.person=person;
		this.userDirectory=userDirectory;
		rebuildWorkspace();
	}

	public void rebuildWorkspace(){
		this.workspace = new VWorkspaceRoot(userDirectory,this);
		LibInfo libs[] = getLibs("/");
		for(int i = 0;i<libs.length;i++){
			String defaultRoot = libs[i].getVirtualRoot();
			IPath path = new Path(defaultRoot);
			IVResource root = this.workspace;
			Library b = this.getLibrary(libs[i]);
			/* library not found on server so avoid adding it to the workspace */
			if(b==null)
				continue;
			
			for(int k=0;k<path.segmentCount()-1;k++){
				String segment = path.segment(k);
				IVResource v = (IVResource)root.get(segment);
				if(v==null){
					v = new VDirectory(root,segment);
					root.add(v);
				}
				root = v;
			}
			
			URL file =  b.getURL("");
			// TODO temp fix to avoid adding virtual library entries that don't exist to the workspace.
			if(file==null)
				continue;
			
			IVResource libResource = new VLibraryResource(b, file, root,path.lastSegment(), "");
			root.add(libResource);
		}	
	}
	
	private LibrarySettings getLibInfo(){
		File settingsDirectory = getSettingsDirectory();
		if (this.libSettings==null)
			this.libSettings=new LibrarySettings(this.getSettingsDirectory());
		
		return this.libSettings;
	}
	
	private User(){}
	
	public IVResource getWorkspace() {			
	
		return this.workspace;
	}

	public void modifyLibrary(String id, String version, boolean installed){
		LibrarySettings libs = this.getLibInfo();
		
		if(!installed){
			libs.removeLibrary(id, version);
			
		}else{
			String defaultRoot = ServerManager.getServerManger().getLibraryManager().getDefaultRoot(id, version);
			libs.addLibrary(id, version, id, defaultRoot);
		}
		rebuildWorkspace();
	}
	public void modifyLibrary(String id, String version, String virtualRoot){
		LibrarySettings libs = this.getLibInfo();
		
		libs.modifyLibrary(id, version, virtualRoot);
		rebuildWorkspace();
	}
	public IVResource[] listFiles(String path){
		
		if(path==null || path.equals(".") || path.equals("")){
		
			IVResource workspace = this.getWorkspace();
			return workspace.listFiles();
		}
		
		/* list all files given a path, dont recurse. */
		Vector resource = new Vector();
		/* add users actual workspace files */
		IVResource r1 = getUserFile(path);
		if(r1!=null){
			if(r1.isDirectory()){
				IVResource[] list = r1.listFiles();
				resource.addAll(Arrays.asList(list));
			}
		}
		/* add users library files */
		/*
		IVResource[] libFiles = this.getLibFiles(path);
		resource.addAll(Arrays.asList(libFiles));	
		*/
		return (IVResource[])resource.toArray(new IVResource[resource.size()]);
		
	}
	private void findLibFiles(IPath path, ArrayList results) {
		IVResource workspace = this.getWorkspace();
		IVResource[] result = workspace.find(path.toString());
		
		for(int i=0;i<result.length;i++)
			results.add(result[i]);
	}
	public IVResource getResource(String path){
	
		/* search user space */
		IVResource userFile = getUserFile(path);
		if(userFile!=null && userFile.exists()) return userFile;
		IVResource r1 = this.getLibFile(path);
		if(r1!=null)
			return r1;
		return userFile;
		
	}
	protected IVResource[] getRootLibraryEntries(){
		return this.workspace.listFiles();
	
	}
	

	public IVResource[] getLibFiles(String p1){
		
		IPath path = new Path(p1);
		IVResource root = getLibFile(p1);
		
		if(root==null)
			return new IVResource[0];
		
		if(root.isDirectory())
			return root.listFiles();
		else
			return new IVResource[]{root};
		
	
	}
	
	private Library getLibrary(LibInfo li){
		String id = li.getId();
		String version = li.getVersion();
		return  ServerManager.getServerManger().getLibraryManager().getLibrary(id, version);
		
	}
	public IVResource getLibFile(String p1){
		IPath path = new Path(p1);
		IVResource root = this.getWorkspace();
		for(int i=0;i<path.segmentCount() && root!=null;i++){
			root = root.get(path.segment(i));
				
		}
		
		return root;
	}

	
	public IVResource getUserFile(String path){
		/* serve working copy files if they exist */

		String path1=path;
		if (path1.startsWith("./"))
			path1=path.substring(2);
		else if (path.length()>0 && path.charAt(0)=='.')
			path1=path.substring(1);

		Link link= this.getLinks().hasLink(path1);
		if (link!=null){
			path=link.location+"/"+path1.substring(link.path.length());
			path=path.replace('/', File.separatorChar);
			VFile linkFile=new VFile(new File(path));
			return linkFile;
		}
		
		IVResource directory = getWorkspace();
	
		
		
		IVResource[] userFile = directory.find(path);
		if(userFile.length>0)
			return userFile[0];
		
		return null;
	}
	
	public IVResource createUserFile(String path){
		/* serve working copy files if they exist */

		String path1=path;
		if (path1.startsWith("./"))
			path1=path.substring(2);
		else if (path.length()>0 && path.charAt(0)=='.')
			path1=path.substring(1);

		Link link= this.getLinks().hasLink(path1);
		if (link!=null){
			path=link.location+"/"+path1.substring(link.path.length());
			path=path.replace('/', File.separatorChar);
			VFile linkFile=new VFile(new File(path));
			return linkFile;
		}
		
		IVResource directory = getWorkspace();
	
		
		
		IVResource userFile = directory.create(path);
		
		return userFile;
	}

	public File getSettingsDirectory() {
		if (this.settingsDirectory==null){
			File userDir = null;
			try {
				userDir = new File(getWorkspace().getURI());
			} catch (URISyntaxException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			this.settingsDirectory= new File(userDir,IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		}
			
		return this.settingsDirectory;
	}

	synchronized public Links getLinks(){
		if (this.links==null)
			this.links=new Links(this.getSettingsDirectory());
		return this.links;
	}
	
	public IVResource[] findFiles(String pathStr, boolean ignoreCase, boolean workspaceOnly){
		
		return this.findFiles(pathStr, ".", ignoreCase, workspaceOnly);
	}
	
	public IVResource[] findFiles(String pathStr, String startFolder, boolean ignoreCase, boolean workspaceOnly){
		boolean isWildcard=pathStr.indexOf('*')>=0;
		IPath path = new Path(pathStr);
		ArrayList results=new ArrayList();
		IVResource rootDir = null;
		if(startFolder==null || startFolder.equals("."))
			rootDir = this.getWorkspace();
		else{
			IVResource workspace = this.getWorkspace();
			rootDir = workspace.get(startFolder);
		}
			
	//	Links links = this.getLinks();
		if (isWildcard){
			IOFileFilter filter;
			if (path.segment(0).equals("*")){
			  IOCase  ioCase = ignoreCase ? IOCase.INSENSITIVE : IOCase.SENSITIVE ;
			  filter=new NameFileFilter(path.lastSegment(),ioCase);
			}
			else{
				String lastSegment = path.lastSegment();
				if (lastSegment.startsWith("*"))
					filter = new SuffixFileFilter(lastSegment.substring(1));
				else
					filter=null;
			}
			// big todo here,  have to remove the file filter
			if(rootDir!=null){
				File f1 = null;
				try {
					f1 = new File(rootDir.getURI());
				} catch (URISyntaxException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				Collection c = FileUtils.listFiles(f1, filter, TrueFileFilter.INSTANCE);
				
				File[] found = (File[])c.toArray(new File[c.size()]);
				
				for(int i=0;i<found.length;i++){
					
					File workspaceFile=null;
					try {
						workspaceFile = new File(this.getWorkspace().getURI());
					} catch (URISyntaxException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					
					IPath workspacePath = new Path(workspaceFile.getPath());
					IPath foundPath = new Path(found[i].getPath());
					IPath elementPath = foundPath.makeRelativeTo(workspacePath);
					
					IVResource[] wsFound = this.findFiles(elementPath.toString(), ignoreCase, true);
					results.addAll(Arrays.asList(wsFound));
					
				}
				
			}
			Link[] allLinks = links.allLinks();
			for (int i = 0; i < allLinks.length; i++) {
				File file = new File(allLinks[i].location);
				Collection c = FileUtils.listFiles(file, filter, TrueFileFilter.INSTANCE);
				File[] found = (File[])c.toArray(new File[c.size()]);
				
				for(int p=0;p<found.length;p++){
					IPath workspacePath = new Path(this.getWorkspace().getPath());
					IPath foundPath = new Path(found[p].getPath());
					IPath elementPath = foundPath.makeRelativeTo(workspacePath);
					
					IVResource[] wsFound = this.findFiles(elementPath.toString(), ignoreCase, true);
					results.addAll(Arrays.asList(wsFound));
					
				}
				
			}
		
			if (!workspaceOnly){
				this.findLibFiles(path,results);
			
			
			}
		}else{
			IVResource file = this.getResource(pathStr);
			if (file!=null && file.exists())
				results.add(file);
			
		}
		return (IVResource[])results.toArray(new IVResource[results.size()]);
		/*
		JSONWriter jsonWriter=new JSONWriter(true);
		for (Iterator iterator = results.iterator(); iterator.hasNext();) {
			Object obj=iterator.next();
			String virtualPath=null;
			File file =null;
			URL url=null;
			if (obj instanceof File) {
				file = (File) obj;
				virtualPath=ResourceUtil.getVirtualPath(file, this);
				
			}
			
			jsonWriter.startObject().addField("file", virtualPath).addFieldName("parents").startArray();
			IPath filePath=new Path(virtualPath);

			int segmentCount=filePath.segmentCount();
			jsonWriter.startObject().addField("name",".");
			jsonWriter.addFieldName("members").startArray();
			ResourceUtil.directoryListJSON(rootDir,"." ,this,jsonWriter);
			jsonWriter.endArray().endObject();
			for (int i=0;i<segmentCount;i++)
			{
				String segment=filePath.segment(i);
				String dirPath=filePath.uptoSegment(i+1).toPortableString();
				if (file!=null)
				{
					VResource dir=this.getResource(dirPath);
					if (dir.isFile())
						break;
					jsonWriter.startObject().addField("name", segment);
					jsonWriter.addFieldName("members").startArray();

					ResourceUtil.directoryListJSON(dir,dirPath ,this,jsonWriter);
				}
				else
				{
					//if (!libraryManager.isDirectory(dirPath))
				//	{
					//	break;
					//}
					jsonWriter.startObject().addField("name", segment);
					jsonWriter.addFieldName("members").startArray();
				//	this.listFiles(dirPath, jsonWriter);
				}
				jsonWriter.endArray().endObject();
			}
			jsonWriter.endArray().endObject();
		}
		return null;
		*/
	}
	public LibInfo[] getLibs(String base){
		return  this.getLibInfo().allLibs();
	}
	public String getLibPath(String id, String version, String base){
		/* returns the virtual path of library in the users workspace given ID and version
		 * for now its going to be the default, but this will allow to remap/move etc..
		 * 
		 */
			LibInfo[] mappedLibs = this.getLibs(base);
			for(int i=0;i<mappedLibs.length;i++){
				LibInfo library = mappedLibs[i];
				if(library.getId().equals(id) && library.getVersion().equals(version)){
					return (String)library.getVirtualRoot();
				}
			}
		
		return null;
	}
	
	public String getUserName()	{
		return this.person.getUserName();
	}
	public Person getPerson(){
		return this.person;
	}
	
}
