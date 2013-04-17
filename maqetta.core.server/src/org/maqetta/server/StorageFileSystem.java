package org.maqetta.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Collection;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOCase;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.NameFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class StorageFileSystem implements IStorage {
	
	private File file;
	
	public StorageFileSystem(IStorage userDirectory, String name){
		this.file = new File(((StorageFileSystem)userDirectory).file, name);
	}
	
	public StorageFileSystem(String name){
		this.file = new File(name);
	}
	
	public StorageFileSystem(File tempDir){
		this.file = tempDir;
	}
	public boolean exists() {
		return this.file.exists();
	}
	public String getAbsolutePath() {
		return this.file.getAbsolutePath();
	}
	public boolean mkdirs() {
		return this.file.mkdirs();
	}
	public IStorage[] listFiles() {
		File[] files = this.file.listFiles();
		IStorage[] results = new IStorage[files.length];
		for(int i=0;i<files.length;i++){
			results[i] = new StorageFileSystem(files[i]);
		}
		return results;
	}
	public boolean isDirectory() {
		return this.file.isDirectory();
	}
	public URI toURI() {
		return this.file.toURI();
	}
	public IStorage getParentFile() {
		return new StorageFileSystem(this.file.getParentFile());
	}
	public OutputStream getOutputStream() throws IOException {
	
			return new FileOutputStream(this.file);
	}
	public IStorage newInstance(String name) {
		return new StorageFileSystem(name);
	}
	public IStorage newInstance(IStorage parent, String name) {
		return new StorageFileSystem(parent,name);

	}
	public InputStream getInputStream() throws IOException {
		
		return new FileInputStream(this.file);
	}
	public boolean delete() {
		// TODO Auto-generated method stub
		return this.file.delete();
	}
	public void createNewFile() throws IOException {
		this.file.mkdirs();
		this.file.delete();
		
		this.file.createNewFile();
		
	}
	public String getPath() {
		return this.file.getPath();
	}
	public String getName() {
		return this.file.getName();
	}
	public void mkdir() {
		this.file.mkdir();
		
	}
	public void renameTo(IStorage file) {
		this.file.renameTo(((StorageFileSystem)file).file);
		
	}
	public IStorage newInstance(URI uri) {
		return new StorageFileSystem(new File(uri));
	}
	public IStorage create(String path) {
		throw new RuntimeException("Not implemented");
	}
	public Collection findFiles(IStorage f1, String pathStr, boolean ignoreCase) {
		IOFileFilter filter;
		IPath path = new Path(pathStr);
		if (path.segment(0).equals("*")) {
			IOCase ioCase = ignoreCase ? IOCase.INSENSITIVE		: IOCase.SENSITIVE;
			filter = new NameFileFilter(path.lastSegment(), ioCase);
		} else {
			String lastSegment = path.lastSegment();
			if (lastSegment.startsWith("*")) {
				filter = new SuffixFileFilter(lastSegment.substring(1));
			} else {
				filter = null;
			}
		}
	
		return FileUtils.listFiles(((StorageFileSystem)f1).file, filter, TrueFileFilter.INSTANCE);
	}

	public boolean isFile() {
		return this.file.isFile();
	}

	public String[] list() {
		return this.file.list();
	}
	public String toString(){
		return this.file.getAbsolutePath();
	}
}
