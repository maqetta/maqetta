package maqetta.server.orion;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.maqetta.server.IStorage;

public class VOrionProjectStorage extends VOrionStorage {
	WebProject proj;
	
	public VOrionProjectStorage(String name, IFileStore store,WebProject proj, VOrionProjectStorage parent) {
		super(name, store, parent);
		this.proj = proj;
		if(store!=null){
			try {
				this.store.mkdir(EFS.NONE, null);
			} catch (CoreException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	 public boolean delete() {
	        // TODO Auto-generated method stub
		 try {
			 
			this.store.delete(EFS.NONE, null);
			((VOrionWorkspaceStorage)this.parent).removeProject(this.proj);
			proj.remove();
			proj.save();
		} catch (CoreException e) {
			return false;
		}
		 return true;
	 }

	 
	
	public boolean isDirectory() {
		return true;
	}
	protected VOrionProjectStorage(String name, IFileStore store,VOrionProjectStorage parent) {
		this(name, store,null,parent);
	}
	
	public VOrionStorage getParentFile() {
		
		return this.parent;
	}
	
	public String getOrionLocation(){
		return "/file/" + proj.getId();
	}

}
