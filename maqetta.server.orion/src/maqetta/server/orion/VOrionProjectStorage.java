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
	
	public VOrionProjectStorage(String name, IFileStore store,WebProject proj) {
		super(name, store);
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
	
	protected VOrionProjectStorage(String name, IFileStore store) {
		this(name, store,null);
	}
	
	public VOrionStorage getParentFile() {
		// orion projects have no storable parent elemnt.
		return null;
	}
	
	public String getOrionLocation(){
		return "/file/" + proj.getId();
	}

}
