package org.maqetta.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Collection;

import org.apache.commons.io.filefilter.IOFileFilter;

/* 
 * This is an interface for actual server storage.  Instead of using
 * a java.io.file in generic server methods, this class is used instead allowing
 * for base file system portability.
 * 
 * This differs from IVResource in that this is server side real storage where 
 * IVResource is the virtual filesystem the client sees.
 * 
 */
public interface IStorage {
	char separatorChar = 0;
	public boolean exists();
	public String getAbsolutePath();
	public boolean mkdirs();
	public IStorage[] listFiles();
	public boolean isDirectory();
	public URI toURI();
	public IStorage getParentFile();
	public OutputStream getOutputStream() throws IOException;
	
	
	public InputStream getInputStream() throws IOException;
	public boolean delete();
	public void createNewFile() throws IOException;
	public String getPath();
	public String getName();
	public void mkdir();
	public void renameTo(IStorage file);
	
	/* newInstance(..) are factory style methods for creating a new resource
	 * NOT based on the parent resource.
	 * 
	 * This is useful for propogating the storage system without any
	 * dependancies besides IStorage.
	 * 

	 */
	public IStorage newInstance(String name);
	public IStorage newInstance(IStorage parent, String name);
	public IStorage newInstance(URI uri);
	
	
	public Collection listFiles(IStorage f1, IOFileFilter filter,
			IOFileFilter instance);
	public boolean isFile();
	public String[] list();
	
}
