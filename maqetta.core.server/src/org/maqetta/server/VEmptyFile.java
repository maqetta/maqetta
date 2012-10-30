package org.maqetta.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;


public class VEmptyFile implements IVResource {

    private String  virtualPath;
    private boolean directory;

    public VEmptyFile(String path, boolean directory) {
        this.virtualPath = path;
        this.directory = directory;
    }

    public void createNewInstance() throws IOException {
        // TODO Auto-generated method stub

    }
    public boolean hasSource(){
    	return false;
    }
    public boolean isSource(){
    	return false;
    }
    
    public IVResource getSource(){
    	return this;
    }
    public boolean delete() {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean exists() {
        // TODO Auto-generated method stub
        return false;
    }

    public IVResource[] find(String path) {
        // TODO Auto-generated method stub
        return null;
    }

    public void flushWorkingCopy() {
        // TODO Auto-generated method stub

    }

    public InputStream getInputStreem() throws IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public String getName() {
        // TODO Auto-generated method stub
        return virtualPath;
    }

    public OutputStream getOutputStreem() throws FileNotFoundException, IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public IVResource getParent() {
        // TODO Auto-generated method stub
        return null;
    }

    public IVResource[] getParents() {
        // TODO Auto-generated method stub
        return null;
    }

    public String getPath() {
        // TODO Auto-generated method stub
        return virtualPath;
    }

    public URI getURI() throws URISyntaxException {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean isDirectory() {
        // TODO Auto-generated method stub
        return this.directory;
    }

    public boolean isDirty() {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean isVirtual() {
		return true;
	}

    public IVResource[] listFiles() {
        // TODO Auto-generated method stub
        return new IVResource[0];
    }

    public boolean mkdir() {
        // TODO Auto-generated method stub
        return false;
    }
    public void setParent(IVResource parent){
    	//noop
    }
    public URLConnection openConnection() throws MalformedURLException, IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public void removeWorkingCopy() {
        // TODO Auto-generated method stub

    }

    public IVResource create(String path) {
        // TODO Auto-generated method stub
        return null;
    }

    public void add(IVResource v) {
        // TODO Auto-generated method stub

    }

    public IVResource get(String childName) {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean isNew() {

        return false;
    }

    public boolean readOnly() {
        // TODO Auto-generated method stub
        return true;
    }

    public IVResource[] findChildren(String childName) {
        // TODO Auto-generated method stub
        return null;
    }

}
