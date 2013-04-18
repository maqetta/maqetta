package maqetta.server.orion;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Collection;
import java.util.Vector;

import maqetta.core.server.util.VResourceUtils;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IStorage;

public class VOrionStorage implements IStorage {
	IFileStore store;
	String name;
	VOrionStorage parent;

	public VOrionStorage(String name, IFileStore store, VOrionStorage parent) {
		this.store = store;
		this.name = name;
		this.parent = parent;
	}

	public String getPath() {
		VOrionStorage parent = this.getParentFile();
		if (parent == null) {
			return this.name;
		}

		return new Path(parent.getPath()).append(this.name).toString();
	}

	public boolean readOnly() {
		return this.store.fetchInfo().getAttribute(EFS.ATTRIBUTE_READ_ONLY);
	}

	public boolean delete() throws IOException {
		try {
			store.delete(EFS.NONE, null);
		} catch (CoreException e) {
			throw new IOException(e);
		}
		return true;
	}

	public String getName() {
		return this.name;
	}

	public boolean isDirectory() {
		return this.store.fetchInfo().isDirectory();
	}

	public boolean exists() {
		return this.store.fetchInfo().exists();
	}

	public String getAbsolutePath() {
		return this.getPath();
	}

	public IStorage[] listFiles() {
		Vector<VOrionStorage> results = new Vector<VOrionStorage>();
		try {
			String[] children = this.store.childNames(EFS.NONE, null);
			for (int i = 0; i < children.length; i++) {
				VOrionStorage child = new VOrionStorage(children[i],
						this.store.getChild(children[i]), this);
				results.add(child);
			}
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return (IStorage[]) results.toArray(new IStorage[results.size()]);
	}

	public URI toURI() {
		return this.store.toURI();
	}

	public VOrionStorage getParentFile() {
		return this.parent;
	}

	public OutputStream getOutputStream() throws IOException {
		try {
			return this.store.openOutputStream(EFS.NONE, null);
		} catch (CoreException e) {
			throw new IOException(e);
		}
	}

	public InputStream getInputStream() throws IOException {
		try {
			return this.store.openInputStream(EFS.NONE, null);
		} catch (CoreException e) {
			throw new IOException(e);
		}
	}

	public void createNewFile() throws IOException {
		try {
			OutputStream stream = this.store.openOutputStream(EFS.NONE, null);
			stream.flush();
			stream.close();
		} catch (CoreException e) {
			throw new IOException(e);
		}
	}

	public void mkdir() throws IOException {
		try {
			this.store.mkdir(EFS.NONE, null);
		} catch (CoreException e) {
			throw new IOException(e);
		}
	}

	public boolean mkdirs() throws IOException {
		try {
			IStorage parent = this.getParentFile();
			if (parent != null && !parent.exists()) {
				parent.mkdirs();
			}
			// if(this.store.fetchInfo().isDirectory())
			this.store.mkdir(EFS.NONE, null);
		} catch (CoreException e) {
			throw new IOException(e);
		}
		return true;
	}

	public void renameTo(IStorage file) throws IOException {
		try {
			this.store.move(((VOrionStorage) file).store, EFS.NONE, null);
		} catch (CoreException e) {
			throw new IOException(e);
		}
	}

	public IStorage newInstance(String name) {
		VOrionStorage parent = this.getParentFile();
		while (parent != null && parent.getParentFile() != null) {
			parent = parent.getParentFile();
		}

		if (parent == null)
			parent = this;

		IPath path = new Path(name);
		for (int i = 0; i < path.segmentCount(); i++) {
			parent = (VOrionStorage) parent.create(path.segment(i));
		}

		return parent;
	}

	public IStorage newInstance(IStorage parent, String name) {
		return parent.create(name);
	}

	public IStorage newInstance(URI uri) {
		// not used
		throw new RuntimeException("Unimplemented method");
	}

	public IStorage create(String name) {
		IPath path = new Path(name);
		VOrionStorage result = this;
		for (int i = 0, len = path.segmentCount(); i < len; i++) {
			// getChild() is a handle-only method; a child is provided regardless of whether this
			// store or the child store exists, or whether this store represents a directory or not.
			IFileStore childStore = result.store.getChild(path.segment(i));
			result = new VOrionStorage(path.segment(i), childStore, result);
		}
		return result;
	}

	public Collection<IStorage> findFiles(IStorage parentFolder, String pathStr, boolean ignoreCase) {
		return findFiles(parentFolder, pathStr, ignoreCase, false);
	}

	public Collection<IStorage> findFiles(IStorage parentFolder, String pathStr, boolean ignoreCase, boolean immediate) {
		String[] parts = pathStr.split("/", 2);
		IStorage[] children = parentFolder.listFiles();
		Collection<IStorage> found = new Vector<IStorage>();

		for (IStorage child: children) {
			if (VResourceUtils.matches(child.getName(), parts[0])) {
				if (parts.length > 1) {
					found.addAll(findFiles(child, parts[1], ignoreCase, true));
				} else {
					found.add(child);
				}
			}
			if (child.isDirectory() && !immediate) {
				found.addAll(findFiles(child, pathStr, ignoreCase));
			}
		}
		return found;
	}

	public boolean isFile() {
		return !this.store.fetchInfo().isDirectory();
	}

	public String[] list() {
		try {
			return this.store.childNames(EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
		}
		return new String[0];
	}

	public String toString() {
		return this.getPath();
	}

}
