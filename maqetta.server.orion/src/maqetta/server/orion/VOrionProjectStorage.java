package maqetta.server.orion;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IStorage;

public class VOrionProjectStorage extends VOrionStorage {

	public VOrionProjectStorage(String name, IFileStore store) {
		super(name, store);
		if(store!=null){
			try {
			
				
				this.store.mkdir(EFS.NONE, null);
			} catch (CoreException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	
	
	public VOrionStorage getParentFile() {
		// orion projects have no storable parent elemnt.
		return null;
	}

}
