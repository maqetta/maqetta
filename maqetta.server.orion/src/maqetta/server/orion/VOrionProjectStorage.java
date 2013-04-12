package maqetta.server.orion;

import java.io.IOException;

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
	}

	protected VOrionProjectStorage(String name, IFileStore store,VOrionProjectStorage parent) {
		this(name, store,null,parent);
	}

	 public boolean delete() {
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
	
	public VOrionStorage getParentFile() {
		return this.parent;
	}

	public void createNewFile() throws IOException {
		throw new IOException("Cannot create file representing directory -- operation not allowed.");
	}

	public void mkdir() throws IOException {
		((VOrionWorkspaceStorage)this.parent).createProject(this.name);
	}

	public boolean mkdirs() {
		try {
			this.mkdir();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
	}

}
