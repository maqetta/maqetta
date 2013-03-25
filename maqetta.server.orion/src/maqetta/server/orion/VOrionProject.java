package maqetta.server.orion;

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;

@SuppressWarnings("restriction")
public class VOrionProject extends VOrionStorage {
	WebProject proj;
	
	public VOrionProject(String name, IFileStore store, WebProject proj, VOrionStorage parent) {
		super(name, store,parent);
		this.proj = proj;
	}
}
