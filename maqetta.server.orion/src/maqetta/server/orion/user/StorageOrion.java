package maqetta.server.orion.user;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Collection;


import org.maqetta.server.IStorage;

public class StorageOrion implements IStorage {

	public boolean exists() {
		// TODO Auto-generated method stub
		return false;
	}

	public String getAbsolutePath() {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean mkdirs() {
		// TODO Auto-generated method stub
		return false;
	}

	public IStorage[] listFiles() {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean isDirectory() {
		// TODO Auto-generated method stub
		return false;
	}

	public URI toURI() {
		// TODO Auto-generated method stub
		return null;
	}

	public IStorage getParentFile() {
		// TODO Auto-generated method stub
		return null;
	}

	public OutputStream getOutputStream() throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public InputStream getInputStream() throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean delete() {
		// TODO Auto-generated method stub
		return false;
	}

	public void createNewFile() throws IOException {
		// TODO Auto-generated method stub
		
	}

	public String getPath() {
		// TODO Auto-generated method stub
		return null;
	}

	public String getName() {
		// TODO Auto-generated method stub
		return null;
	}

	public void mkdir() {
		// TODO Auto-generated method stub
		
	}

	public void renameTo(IStorage file) {
		// TODO Auto-generated method stub
		
	}

	public IStorage newInstance(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	public IStorage newInstance(IStorage parent, String name) {
		// TODO Auto-generated method stub
		return null;
	}

	public IStorage newInstance(URI uri) {
		// TODO Auto-generated method stub
		return null;
	}




	public boolean isFile() {
		// TODO Auto-generated method stub
		return false;
	}

	public String[] list() {
		// TODO Auto-generated method stub
		return null;
	}

	public Collection findFiles(IStorage parentFolder, String pathStr,
			boolean ignoreCase) {
		// TODO Auto-generated method stub
		return null;
	}


}
