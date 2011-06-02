package org.davinci.server;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;

public class ResourceOSWrapper extends VFile {

	IVResource original;

	/*
	 * use this class to temporarily rewrite data of a resource.. just save the
	 * new IO in a temp file...
	 */
	public ResourceOSWrapper(IVResource original, File tempFile) {

		super(tempFile);
		this.original = original;
	}

	@Override
	public void add(IVResource v) {
		original.add(v);

	}

	@Override
	public IVResource create(String path) {
		// TODO Auto-generated method stub
		return original.create(path);
	}

	@Override
	public void createNewInstance() throws IOException {
		original.createNewInstance();

	}

	@Override
	public boolean delete() {
		// TODO Auto-generated method stub
		return original.delete();
	}

	@Override
	public boolean exists() {
		// TODO Auto-generated method stub
		return original.exists();
	}

	@Override
	public IVResource[] find(String path) {
		// TODO Auto-generated method stub
		return original.find(path);
	}

	@Override
	public void flushWorkingCopy() {
		original.flushWorkingCopy();

	}

	@Override
	public IVResource get(String childName) {
		return original.get(childName);
	}

	@Override
	public String getName() {
		return original.getName();
	}

	@Override
	public IVResource getParent() {
		return original.getParent();
	}

	@Override
	public IVResource[] getParents() {
		// TODO Auto-generated method stub
		return original.getParents();
	}

	@Override
	public String getPath() {
		return original.getPath();
	}

	@Override
	public URI getURI() throws URISyntaxException {
		// TODO Auto-generated method stub
		return original.getURI();
	}

	@Override
	public boolean isDirectory() {
		// TODO Auto-generated method stub
		return original.isDirectory();
	}

	@Override
	public boolean isDirty() {
		// TODO Auto-generated method stub
		return original.isDirty();
	}

	@Override
	public boolean isFile() {
		// TODO Auto-generated method stub
		return original.isFile();
	}

	@Override
	public IVResource[] listFiles() {
		// TODO Auto-generated method stub
		return original.listFiles();
	}

	@Override
	public boolean mkdir() {
		// TODO Auto-generated method stub
		return original.mkdir();
	}

	@Override
	public void removeWorkingCopy() {
		original.removeWorkingCopy();

	}

	public URLConnection openConnection() throws MalformedURLException,
			IOException {
		return this.file.toURI().toURL().openConnection();
	}

}
