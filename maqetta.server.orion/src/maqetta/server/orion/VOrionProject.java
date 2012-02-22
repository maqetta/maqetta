package maqetta.server.orion;

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;

public class VOrionProject extends VOrionStorage {
	WebProject proj;
	
	public VOrionProject(String name, IFileStore store, WebProject proj) {
		super(name, store);
		this.proj = proj;
	}

	public String getOrionLocation(){
		return "/file/" + proj.getId();
	}
}
