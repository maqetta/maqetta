package org.maqetta.server;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;

import org.eclipse.core.runtime.Path;

public class VURL implements IVResource {
    // abstracted file/resource class
	private URL     file = null;
    private boolean isWorkingCopy;
    private String  virtualPath;

    public VURL(URL file) {
        this.file = file;
        this.virtualPath = file.getPath();
        this.isWorkingCopy = false;
    }

    public VURL(URL file, String virtualPath) {
        this.file = file;
        this.virtualPath = virtualPath;
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
    
    public boolean exists() {
        return true;
    }

    public String toString() {

        return this.getPath();
    }

    public URLConnection openConnection() throws MalformedURLException, IOException {
        return this.file.openConnection();
    }

    public String getPath() {
        String name = this.virtualPath;
        if (name != null && name.length() > 0 && name.charAt(name.length() - 1) == '/') {
            name = name.substring(0, name.length() - 1);
        }
        return name;
    }

    public void createNewInstance() throws IOException {
        File f = new File(this.getPath());
        this.file = f.toURL();
    }

    public boolean delete() {
        // TODO Auto-generated method stub
        return false;
    }

    public OutputStream getOutputStreem() throws FileNotFoundException {
        // TODO Auto-generated method stub
        return null;

    }

    public InputStream getInputStreem() throws IOException {
        // TODO Auto-generated method stub
        return this.file.openStream();
    }

    public String getName() {
        return new Path(this.virtualPath).lastSegment();
        /*
         * String name = this.virtualPath; if(name.length() > 0 &&
         * name.charAt(name.length()-1) == '/') name =
         * name.substring(0,name.length()-1); return name;
         */
    }

    public URI getURI() throws URISyntaxException {
        // TODO Auto-generated method stub
        return this.file.toURI();
    }

    public boolean isDirectory() {
        String path = this.file.getPath();
        return path.endsWith("/");
    }

    public IVResource[] listFiles() {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean mkdir() {
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

    public boolean isDirty() {
        // TODO Auto-generated method stub
        return false;
    }

    public void removeWorkingCopy() {
        // TODO Auto-generated method stub

    }

    public IVResource getParent() {
        // TODO Auto-generated method stub
        return null;
    }

    public IVResource[] getParents() {
        // TODO Auto-generated method stub
        return null;
    }

    public IVResource create(String path) {
        // TODO Auto-generated method stub
        return null;
    }
    public void setParent(IVResource parent){
    	// noop
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

        return true;
    }

    public IVResource[] findChildren(String childName) {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean isVirtual() {
		return true;
	}
}
