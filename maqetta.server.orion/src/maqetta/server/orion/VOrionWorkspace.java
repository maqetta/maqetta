package maqetta.server.orion;

import java.io.IOException;

import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.maqetta.server.VWorkspaceRoot;


public class VOrionWorkspace extends VWorkspaceRoot{

	private VOrionWorkspaceStorage store;
	
    public VOrionWorkspace(VOrionWorkspaceStorage storage) {
    	this.store=storage;
	}

	public IVResource create(String path) throws IOException {
		IPath ps = new Path(path);
		IVResource parent = this;
		
		for(int i=0;i<ps.segmentCount();i++){
			String segment = ps.segment(i);
			IVResource f= parent.get(segment);
			if(f==null ){
				IStorage file = this.store.create(path);
				f = new VOrionResource(file, parent, segment);
				
				
			}else if(f.isVirtual()){
				
				IStorage file = this.store.create(path);
				if(f.isDirectory())
					file.mkdirs();
				f = new VOrionResource(file, parent, segment);
				parent.add(f);
				
			}
			parent = f;
		}
		
		
		return parent;
	}

}
