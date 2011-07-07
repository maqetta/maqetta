package org.davinci.server;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Hashtable;

import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class VFile implements IVResource {
    // abstracted file/resource class
    File       file = null;
    private boolean    isWorkingCopy;
    private String     virtualPath;
    private File       workingCopy;
    private IVResource parent;

    public VFile(File file, IVResource parent, String virtualPath) {

        if (virtualPath != null && virtualPath.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) > 0) {
            this.workingCopy = file;
            IPath path = new Path(file.getPath());
            this.file = new File(path.removeFileExtension().toString());
            this.virtualPath = virtualPath.replace(IDavinciServerConstants.WORKING_COPY_EXTENSION, "");
        } else {
            this.file = file;
            this.virtualPath = virtualPath;
            this.workingCopy = this.getWorkingCopy(file);
        }

        this.parent = parent;
    }

    public VFile(File file, IVResource parent) {
        this(file, parent, "");
        /*
         * String parentPath = parent.getFullPath(); String me =
         * file.getAbsolutePath(); this.virtualPath =
         * me.substring(me.indexOf(parentPath) + parentPath.length());
         */
    }

    public VFile(File file) {
        this(file, null, file.getPath());
    }

    private File getFile() {
        if (this.workingCopy.exists()) {
            return this.workingCopy;
        }

        return this.file;

    }

    private File getWorkingCopy(File original) {
        File parent = original.getParentFile();
        File workingCopy = new File(parent, original.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
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
     * String cleanPath = this.parent.getPath() + IVResource.SEPERATOR +
     * this.virtualPath;
     * 
     * if(cleanPath.length() > 0 && cleanPath.charAt(0)=='.'){ cleanPath =
     * cleanPath.substring(1); } if(cleanPath.length() > 0 &&
     * cleanPath.charAt(0)=='/'){ cleanPath = cleanPath.substring(1); } return
     * cleanPath; }
     */
    public String getPath() {
        if (this.virtualPath == null) {
            return ".";
        }
        if (this.parent == null) {
            return ".";
        }

        String cleanPath = this.virtualPath;
        /*
         * if(cleanPath.length() > 0 && cleanPath.charAt(0)=='.'){ cleanPath =
         * cleanPath.substring(1); }
         */
        if (cleanPath.length() > 0 && cleanPath.charAt(0) == '/') {
            cleanPath = cleanPath.substring(1);
        }

        if (this.parent == null) {
            return cleanPath;
        }
        String parentPath = this.parent.getPath();
        if (parentPath==null ) {
            return cleanPath;
        } else if(cleanPath!=null && cleanPath.length()>0){
            return parentPath + IVResource.SEPERATOR + cleanPath;
        }else{
            return parentPath;
        }

    }

    public void createNewInstance() throws IOException {

        this.workingCopy.createNewFile();

    }

    private boolean deleteDirectory(File path) {
        if (path.exists()) {
            File[] files = path.listFiles();
            for (int i = 0; i < files.length; i++) {
                if (files[i].isDirectory()) {
                    deleteDirectory(files[i]);
                } else {
                    files[i].delete();
                }
            }
        }
        return (path.delete());

    }

    public boolean delete() {
        File target = null;

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

        return new BufferedOutputStream(new FileOutputStream(this.workingCopy));
    }

    public InputStream getInputStreem() throws IOException {
        return new BufferedInputStream(new FileInputStream(this.getFile()));
    }

    public IVResource[] listFiles() {
        File[] list = this.file.listFiles();

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

    public boolean mkdir() {
        return this.file.mkdir();

    }

    public IVResource[] find(String path) {
        if (!this.isDirectory()) {
            return null;
        }

        IPath a = new Path(this.file.getAbsolutePath()).append(path);
        File f1 = new File(a.toOSString());

        if (!f1.exists()) {
            return null;
        }
        String[] segments = a.segments();
        IPath me = new Path(this.file.getAbsolutePath());
        IVResource parent = this;
        for (int i = me.matchingFirstSegments(a); i < segments.length; i++) {
            int segsToEnd = segments.length - i - 1;
            String s = a.removeLastSegments(segsToEnd).toOSString();
            File f = new File(s);
            parent = new VFile(f, parent, segments[i]);
        }
        return new IVResource[] { parent };

    }

    public IVResource create(String path) {
        if (!this.isDirectory()) {
            return null;
        }

        IPath a = new Path(this.file.getAbsolutePath()).append(path);
        String[] segments = a.segments();
        IPath me = new Path(this.file.getAbsolutePath());
        IVResource parent = this;
        for (int i = me.matchingFirstSegments(a); i < segments.length; i++) {
            int segsToEnd = segments.length - i - 1;
            File f = new File(a.removeLastSegments(segsToEnd).toOSString());
            parent = new VFile(f, parent, segments[i]);
        }
        return parent;

    }

    public boolean isFile() {
        return this.file.isFile();
    }

    public void flushWorkingCopy() {
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

    public void removeWorkingCopy() {
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

    public void add(IVResource v) {
        // TODO Auto-generated method stub

    }

    public IVResource get(String childName) {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean committed() {
        return !this.file.exists();
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
        return null;
    }
}
