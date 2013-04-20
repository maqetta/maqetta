package org.maqetta.server;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;

import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class VFile implements IVResource {
    // abstracted file/resource class
    protected IStorage       file = null;
    protected boolean    isWorkingCopy;
    protected String     virtualPath;
    protected IStorage       workingCopy;
    protected IVResource parent;

    public VFile(IStorage file, IVResource parent, String virtualPath) {

        if (virtualPath != null && virtualPath.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) > 0) {
            this.workingCopy = file;
            IPath path = new Path(file.getPath());
            this.file =  file.newInstance(path.removeFileExtension().toString());
            this.virtualPath = virtualPath.replace(IDavinciServerConstants.WORKING_COPY_EXTENSION, "");
        } else {
            this.file = file;
            this.virtualPath = virtualPath;
            this.workingCopy = this.getWorkingCopy(file);
        }

        this.parent = parent;
    }
    public boolean hasSource(){
    	return false;
    }
    public boolean isSource(){
    	return parent!=null && this.parent.isSource();
    }
    
    public IVResource getSource(){
    	return this;
    }
    public VFile(IStorage file, IVResource parent) {
        this(file, parent, "");
        /*
         * String parentPath = parent.getFullPath(); String me =
         * file.getAbsolutePath(); this.virtualPath =
         * me.substring(me.indexOf(parentPath) + parentPath.length());
         */
    }

    public VFile(IStorage file) {
        this(file, null, file.getPath());
    }

    public IStorage getFile() {
        if (this.workingCopy.exists()) {
            return this.workingCopy;
        }

        return this.file;

    }

    protected IStorage getWorkingCopy(IStorage original) {
    	IStorage parent = original.getParentFile();
    	IStorage workingCopy;
    	if(parent!=null)
    		workingCopy = original.newInstance(parent, original.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
    	else
    		workingCopy = original.newInstance(original.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
    	return workingCopy;
    }

    /*
     * public VResource getWorkingCopy(){ if(this.isWorkingCopy) return this;
     * File f = Command.getWorkingCopy(this.file); return new VFile(f,true); }
     */
    public boolean exists() {
        return this.file.exists() || this.workingCopy.exists();
    }

    
    
    public boolean isDirty() {
        return this.workingCopy.exists();
    }

    public String toString() {
        return this.getPath();
    }

    public URLConnection openConnection() throws MalformedURLException, IOException {
        return this.getFile().toURI().toURL().openConnection();
    }

    /*
     * public String getPath() { if(this.virtualPath== null) return null;
     * if(this.parent==null) return ".";
     * 
     * String cleanPath = this.parent.getPath() + IVResource.SEPARATOR +
     * this.virtualPath;
     * 
     * if(cleanPath.length() > 0 && cleanPath.charAt(0)=='.'){ cleanPath =
     * cleanPath.substring(1); } if(cleanPath.length() > 0 &&
     * cleanPath.charAt(0)=='/'){ cleanPath = cleanPath.substring(1); } return
     * cleanPath; }
     */
    
    public String getPath(){
        if (parent == null) {
            return this.virtualPath;
        }
        return new Path(this.parent.getPath()).append(this.virtualPath).toString();
    }
  
    

    public void createNewInstance() throws IOException {

        this.workingCopy.createNewFile();

    }

    private boolean deleteDirectory(IStorage path) throws IOException {
        if (path.exists()) {
            IStorage[] files = path.listFiles();
            for (int i = 0; i < files.length; i++) {
                if (files[i].isDirectory()) {
                    deleteDirectory(files[i]);
                } else {
                    files[i].delete();
                }
            }
        }
        return path.delete();
    }

    public boolean delete() throws IOException {
        IStorage target = null;

        if (this.workingCopy.exists()) {
            target = this.workingCopy;
        } else {
            target = this.file;
        }
        if (target.isDirectory()) {
            return deleteDirectory(target);
        } else {
            return target.delete();
        }

    }

    public OutputStream getOutputStreem() throws IOException {
        if (!this.workingCopy.exists()) {
            this.workingCopy.createNewFile();
        }

        return new BufferedOutputStream(this.workingCopy.getOutputStream());
    }

    public InputStream getInputStreem() throws IOException {
        return new BufferedInputStream(this.getFile().getInputStream());
    }

    public IVResource[] listFiles() {
        IStorage[] list = this.file.listFiles();

        Hashtable results = new Hashtable();
        for (int i = 0; i < list.length; i++) {
            IVResource resource = new VFile(list[i], this, list[i].getName());
            results.put(resource.getPath(), resource);
        }
        Collection c = results.values();
        return (IVResource[]) c.toArray(new IVResource[c.size()]);
    }

    public String getName() {

        if (this.virtualPath == null) {
            return ".";
        }
        if (this.parent == null) {
            return ".";
        }
        String name = this.virtualPath;

        if (name != null && name.length() > 0 && name.charAt(name.length() - 1) == '/') {
            name = name.substring(0, name.length() - 1);
        }

        return name;
    }

    /*
     * public VResource getOriginal(){
     * 
     * String fileName = this.getName(); if
     * (fileName.endsWith(IDavinciServerConstants.WORKING_COPY_EXTENSION)){ File
     * f = new File(file.getParent(),fileName.substring(0,fileName.length()-
     * IDavinciServerConstants.WORKING_COPY_EXTENSION.length())); return new
     * VFile(f, false); } return null; }
     */
    public boolean isDirectory() {
        return this.file.isDirectory();
    }

    public URI getURI() throws URISyntaxException {
        return this.file.toURI();
    }

    public boolean mkdir() throws IOException {
        return this.file.mkdirs();
    }

    protected static boolean wildCardMatch(String text, String pattern){
        // Create the cards by splitting using a RegEx. If more speed 
        // is desired, a simpler character based splitting can be done.
        String [] cards = pattern.split("\\*");

        // Iterate over the cards.
        for(String card:cards){
            int idx = text.indexOf(card);
            /* this checks if the card is in the proper position.  
             * for searches like *.theme, *.theme.bak would be a false match so
             * you have to test if there's any more cards left after the match
             * to gobble up the rest (with a * or some text)
             * 
             */
            if(idx + card.length() < text.length() && card.length()>0) return false;
            
            // Card not detected in the text.
            if(idx == -1)
            {
                return false;
            }
            
            // Move ahead, towards the right of the text.
            text = text.substring(idx + card.length());
        }
        
        return true;
    }
    public IVResource[] find(String pattern) {
        if (!this.isDirectory()) {
            if(wildCardMatch(this.getName(), pattern))
            	return new IVResource[]{this};
            return new IVResource[0];
        }
       ArrayList found = new ArrayList();
       IVResource[] children = this.listFiles();
       for(int i=0;i<children.length;i++){
    	   found.addAll(Arrays.asList(children[i].find(pattern)));
       }
       return (IVResource[])found.toArray(new IVResource[found.size()]);

    }

    public IVResource create(String path) throws IOException {
        if (!this.isDirectory()) {
            return null;
        }

        IPath a = new Path(this.file.getAbsolutePath()).append(path);
        boolean directory = path.charAt(path.length()-1)=='/';
        
        String[] segments = a.segments();
        IPath me = new Path(this.file.getAbsolutePath());
        IVResource parent = this;
        for (int i = me.matchingFirstSegments(a); i < segments.length; i++) {
            int segsToEnd = segments.length - i - 1;
            IStorage f = file.newInstance(a.removeLastSegments(segsToEnd).toString());
            
            if((i+1==segments.length) && directory)
            	f.mkdir();
            
            	
            parent = new VFile(f, parent, segments[i]);
        }
        return parent;

    }

    public boolean isVirtual() {
		return false;
	}

    public void flushWorkingCopy() throws IOException {
        // String name = this.file.getName();
        if (this.workingCopy.exists()) {
            this.file.delete();
            this.workingCopy.renameTo(this.file);

        }

        /*
         * try { this.file.createNewFile(); } catch (IOException e) { // TODO
         * Auto-generated catch block e.printStackTrace(); }
         * this.copyfile(this.workingCopy, this.file);
         */

        // this.workingCopy.delete();
    }

    public void removeWorkingCopy() throws IOException {
        this.workingCopy.delete();
    }

    public IVResource[] getParents() {
        // TODO Auto-generated method stub
        IVResource parent = this.parent;
        ArrayList parents = new ArrayList();
        while (parent != null) {
            parents.add(0, parent);
            parent = parent.getParent();

        }
        return (IVResource[]) parents.toArray(new IVResource[parents.size()]);
    }

    public IVResource getParent() {
        // TODO Auto-generated method stub
        return this.parent;
    }
    public void setParent(IVResource parent){
    	this.parent = parent;
    }
    public void add(IVResource v) {
        // TODO Auto-generated method stub

    }

    public IVResource get(String childName) {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean isNew() {
        return (!this.file.exists() && this.workingCopy.exists());
    }

    public boolean readOnly() {
        if (this.parent != null) {
            return this.parent.readOnly();
        } else {
            return false;
        }
    }

    public IVResource[] findChildren(String childName) {
        // TODO Auto-generated method stub
        return this.find(childName);
    }
}
