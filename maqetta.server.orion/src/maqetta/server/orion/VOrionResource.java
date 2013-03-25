package maqetta.server.orion;

import java.net.URI;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.orion.internal.server.servlets.Activator;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.maqetta.server.VFile;

@SuppressWarnings("restriction")
public class VOrionResource extends VFile {

	
	protected static final IScopeContext scope = new OrionScope();
	protected IEclipsePreferences prefStore;

	
	
	public VOrionResource(IStorage storage,  IVResource parent, String name) {
		super(storage,parent);
		this.virtualPath = name;
	}
	
    protected IStorage getWorkingCopy(IStorage original) {
    	
    	if(this.file.isDirectory() ){
    		// no working copy for directories (java.io.file handled this before 
    		return this.file;
    	}
    	
    	if(original.isDirectory() ){
    		// no working copy for directories (java.io.file handled this before 
    		return original;
    	}
    	IStorage parent = original.getParentFile();
    	IStorage workingCopy;
    	if(parent!=null)
    		workingCopy = original.newInstance(parent, original.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
    	else
    		workingCopy = original.newInstance(original.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
    	return workingCopy;
    }
    
    public IStorage getStorage(){
    	return this.file;
    }

	public String getLocation() {
		
		String fileURI =  this.file.toURI().toString();
		URI platformLocationURI = Activator.getDefault().getRootLocationURI();
		IFileStore root=null;
		try {
			root = EFS.getStore(platformLocationURI);
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String rootURI = root.toURI().toString();
		
		return fileURI.substring(rootURI.length());
	}
}
