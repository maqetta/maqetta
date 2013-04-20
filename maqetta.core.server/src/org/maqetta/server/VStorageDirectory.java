package org.maqetta.server;

import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.Vector;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.LibrarySettings;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class VStorageDirectory extends VDirectory {
	
	private IStorage resource;
	
    public VStorageDirectory(IStorage resource, IVResource parent, String name) {

    	super(parent,name, false);
    	this.resource = resource;
    	rebuild();
    }

    public VStorageDirectory(IStorage resource, IVResource parent, String name, boolean readOnly) {
       super(parent,name,readOnly);
       this.resource = resource;
       rebuild();
    }

    public boolean isVirtual() {
		return false;
	}
    public boolean delete() throws IOException {
  		return this.resource.delete();
  	}
    
	protected LibrarySettings getLibSettings() {
		
		return new LibrarySettings(this.resource.newInstance(this.resource, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME));
	}
	
	protected Library getLibrary(ILibInfo li) {
		String id = li.getId();
		String version = li.getVersion();
		return ServerManager.getServerManager().getLibraryManager().getLibrary(id, version);

	}
	
	private boolean isConfig(String folderName){
		if(folderName==null) return true;
		return folderName.equals(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME) ;
	}
	
    private void rebuild() {
		
		IStorage[] userFiles = this.resource.listFiles();
		IVResource root = this;
		/* add the real files first */
		for(int j=0;j<userFiles.length;j++){
			if(!isConfig(userFiles[j].getName()) && !userFiles[j].isDirectory()){
				VFile element = new VFile(userFiles[j], root, userFiles[j].getName());
				root.add(element);
				continue;
			}
			
			if(isConfig(userFiles[j].getName()) || !userFiles[j].isDirectory()) continue;
			VStorageDirectory element = new VStorageDirectory(userFiles[j], root, userFiles[j].getName(),true);
			root.add(element);
		}
		LibrarySettings settings = this.getLibSettings();
		if(!settings.exists()) return;
		
		/* see if there is a .settings/libs.settings file.  If there is
		 * build out the virtual structure 
		 */
		Vector<ILibInfo> libs = new Vector();
		libs.addAll(Arrays.asList( settings.allLibs()));
		for (int i = 0; i < libs.size(); i++) {
			root = this;
			String defaultRoot = libs.get(i).getVirtualRoot();
			if(defaultRoot==null) continue;
			Library b = this.getLibrary(libs.get(i));
			/* library not found on server so avoid adding it to the workspace */
			if (b == null) {
				continue;
			}
			URL file = b.getURL("", false);
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
					v = new VDirectory( root, segment,true);
					root.add(v);
				}
				root = v;
			}
			IVResource libResource = new VLibraryResource(b, file,"", "");
					
			IVResource[] children = libResource.listFiles();
			for(int p=0;p<children.length;p++)
				root.add(children[p]);

		}
		
	}
    
    public String toString(){
    	return this.getPath();
    }
}
