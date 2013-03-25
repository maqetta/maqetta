package maqetta.server.orion;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;

@SuppressWarnings("restriction")
public class VOrionProjectStorage extends VOrionStorage {
	WebProject proj;
	
	public VOrionProjectStorage(String name, IFileStore store,WebProject proj, VOrionProjectStorage parent) {
		super(name, store, parent);
		this.proj = proj;
		if(store!=null){
			try {
				this.store.mkdir(EFS.NONE, null);
			} catch (CoreException e) {
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

}
