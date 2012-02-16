package maqetta.server.orion.internal;

import java.io.File;
import java.io.FileFilter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.filesystem.IFileSystem;

public class EFStoreFile extends File {

	IFileStore store;
	/* takes an eclipse file store and treats it like local file system */
	public EFStoreFile(IFileStore fileStore, String childName) {
		super(fileStore.getName());
		this.store = store;
		
		
	}
	@Override
	public boolean canExecute() {
		// TODO Auto-generated method stub
		return super.canExecute();
	}
	@Override
	public boolean canRead() {
		// TODO Auto-generated method stub
		return super.canRead();
	}
	@Override
	public boolean canWrite() {
		// TODO Auto-generated method stub
		return super.canWrite();
	}
	@Override
	public int compareTo(File pathname) {
		// TODO Auto-generated method stub
		return super.compareTo(pathname);
	}
	@Override
	public boolean createNewFile() throws IOException {
		// TODO Auto-generated method stub
		return super.createNewFile();
	}
	@Override
	public boolean delete() {
		// TODO Auto-generated method stub
		return super.delete();
	}
	@Override
	public void deleteOnExit() {
		// TODO Auto-generated method stub
		super.deleteOnExit();
	}
	@Override
	public boolean equals(Object obj) {
		// TODO Auto-generated method stub
		return super.equals(obj);
	}
	@Override
	public boolean exists() {
		// TODO Auto-generated method stub
		return super.exists();
	}
	@Override
	public File getAbsoluteFile() {
		// TODO Auto-generated method stub
		return super.getAbsoluteFile();
	}
	@Override
	public String getAbsolutePath() {
		// TODO Auto-generated method stub
		return super.getAbsolutePath();
	}
	@Override
	public File getCanonicalFile() throws IOException {
		// TODO Auto-generated method stub
		return super.getCanonicalFile();
	}
	@Override
	public String getCanonicalPath() throws IOException {
		// TODO Auto-generated method stub
		return super.getCanonicalPath();
	}
	@Override
	public long getFreeSpace() {
		// TODO Auto-generated method stub
		return super.getFreeSpace();
	}
	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return super.getName();
	}
	@Override
	public String getParent() {
		// TODO Auto-generated method stub
		return super.getParent();
	}
	@Override
	public File getParentFile() {
		// TODO Auto-generated method stub
		return super.getParentFile();
	}
	@Override
	public String getPath() {
		// TODO Auto-generated method stub
		return super.getPath();
	}
	@Override
	public long getTotalSpace() {
		// TODO Auto-generated method stub
		return super.getTotalSpace();
	}
	@Override
	public long getUsableSpace() {
		// TODO Auto-generated method stub
		return super.getUsableSpace();
	}
	@Override
	public int hashCode() {
		// TODO Auto-generated method stub
		return super.hashCode();
	}
	@Override
	public boolean isAbsolute() {
		// TODO Auto-generated method stub
		return super.isAbsolute();
	}
	@Override
	public boolean isDirectory() {
		// TODO Auto-generated method stub
		return super.isDirectory();
	}
	@Override
	public boolean isFile() {
		// TODO Auto-generated method stub
		return super.isFile();
	}
	@Override
	public boolean isHidden() {
		// TODO Auto-generated method stub
		return super.isHidden();
	}
	@Override
	public long lastModified() {
		// TODO Auto-generated method stub
		return super.lastModified();
	}
	@Override
	public long length() {
		// TODO Auto-generated method stub
		return super.length();
	}
	@Override
	public String[] list() {
		// TODO Auto-generated method stub
		return super.list();
	}
	@Override
	public String[] list(FilenameFilter filter) {
		// TODO Auto-generated method stub
		return super.list(filter);
	}
	@Override
	public File[] listFiles() {
		// TODO Auto-generated method stub
		return super.listFiles();
	}
	@Override
	public File[] listFiles(FileFilter filter) {
		// TODO Auto-generated method stub
		return super.listFiles(filter);
	}
	@Override
	public File[] listFiles(FilenameFilter filter) {
		// TODO Auto-generated method stub
		return super.listFiles(filter);
	}
	@Override
	public boolean mkdir() {
		// TODO Auto-generated method stub
		return super.mkdir();
	}
	@Override
	public boolean mkdirs() {
		// TODO Auto-generated method stub
		return super.mkdirs();
	}
	@Override
	public boolean renameTo(File dest) {
		return true;
	}
	@Override
	public boolean setExecutable(boolean executable, boolean ownerOnly) {
		return true;
	}
	@Override
	public boolean setExecutable(boolean executable) {
		return true;
	}
	@Override
	public boolean setLastModified(long time) {
		store.fetchInfo().setLastModified(time);
		return true;
	}
	
	public boolean setReadOnly() {
		
		return true;
	}
	
	public boolean setReadable(boolean readable, boolean ownerOnly) {
		return true;
	}
	
	public boolean setReadable(boolean readable) {
		 store.fetchInfo().setAttribute(EFS.ATTRIBUTE_OWNER_WRITE, readable);
		 return true;
	}
	
	public boolean setWritable(boolean writable, boolean ownerOnly) {
		 store.fetchInfo().setAttribute(EFS.ATTRIBUTE_OWNER_WRITE, writable && ownerOnly);
		 return true;
	}
	
	public boolean setWritable(boolean writable) {
		 store.fetchInfo().setAttribute(EFS.ATTRIBUTE_OTHER_WRITE, true);
		 return true;
	}
	
	public String toString() {
		return store.toString();
	}
	
	public URI toURI() {
		return store.toURI();
	}
	
	public URL toURL() throws MalformedURLException {
		
		return store.toURI().toURL();
	}
	
	
	

}
