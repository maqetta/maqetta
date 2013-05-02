package org.maqetta.server;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Vector;

import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.NameFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.eclipse.core.runtime.Path;

public class VDirectory implements IVResource {

    private Vector     children;
    private IVResource parent;
    private String     name;
    private boolean readOnly;
    
    public VDirectory(IVResource parent, String name) {
    	this(parent,name, false);
    }

    public VDirectory(IVResource parent, String name, boolean readOnly) {
        this.parent = parent;
        this.name = name;
        this.children = new Vector();
        this.readOnly = readOnly;
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
    
    protected VDirectory() {
        // TODO Auto-generated constructor stub
        this.children = new Vector();
    }

    public IVResource create(String path) throws IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public void createNewInstance() throws IOException {
        // TODO Auto-generated method stub

    }

    public boolean delete() throws IOException {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean exists() {
        // TODO Auto-generated method stub
        return false;
    }

    public IVResource[] find(String path) {
      
          return findInLib(path);
     }

    private IVResource[] findInLib(String path) {
        String[] split = path.split("/");
        IVResource parent = this;
        for (int i = 0; parent != null && i < split.length; i++) {

            if (split[i].indexOf("*") > -1 || split[i].indexOf("?") > -1) {
                return parent.findChildren(split[i]);
            }

            parent = parent.get(split[i]);
        }
        if(parent!=null)
        	return new IVResource[] { parent };
        
        return new IVResource[0];
    }

    public void flushWorkingCopy() {
        // TODO Auto-generated method stub

    }
    public void setParent(IVResource parent){
    	this.parent = parent;
    }
    public InputStream getInputStreem() throws IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public String getName() {
        // TODO Auto-generated method stub
        String name = this.name;

        if (name != null && name.length() > 0 && name.charAt(name.length() - 1) == '/') {
            name = name.substring(0, name.length() - 1);
        }
        if (name != null && name.length() > 0 && name.indexOf("./")==0 ) {
            name = name.substring(1);
        }
        if (name != null && name.length() > 0 && name.charAt(0) == '/') {
            name = name.substring(1);
        }

        return name;
    }

    public OutputStream getOutputStreem() throws FileNotFoundException, IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public IVResource getParent() {
        // TODO Auto-generated method stub
        return this.parent;
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

    public String getPath() {
        // TODO Auto-generated method stub
        if (parent == null) {
            return this.name;
        }
        return new Path(this.parent.getPath()).append(this.name).toString();

    }

    public URI getURI() throws URISyntaxException {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean isDirectory() {
        // TODO Auto-generated method stub
        return true;
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
        return (IVResource[]) this.children.toArray(new IVResource[this.children.size()]);
    }

    public boolean mkdir() {
        // TODO Auto-generated method stub
        return false;
    }

    public URLConnection openConnection() throws MalformedURLException, IOException {
        // TODO Auto-generated method stub
        return null;
    }

    public void removeWorkingCopy() {
        // TODO Auto-generated method stub

    }

    public void add(IVResource v) {
    	/* ensure that this object is set as the parent */
    	
    	for(int i=0;i<this.children.size();i++){
    		IVResource child = (IVResource)this.children.get(i);
    		if(child.getName().equals(v.getName())){
    			this.children.remove(i);
    		}
    		
    	}
    	v.setParent(this);
        this.children.add(v);

    }

    public IVResource get(String childName) {

        if (childName != null && childName.equals(".")) {
            return this;
        }

        for (int i = 0; i < this.children.size(); i++) {
            IVResource child = (IVResource) children.get(i);
            if (child != null && child.getName().equals(childName)) {
                return child;
            }
        }
        return null;
    }

    public String toString() {
        return this.getPath();
    }

    public boolean isNew() {
        return false;
    }

    public boolean readOnly() {
        if (this.parent != null) {
            return this.readOnly || this.parent.readOnly();
        } else {
            return this.readOnly;
        }
    }

    public IVResource[] findChildren(String childName) {
        // TODO Auto-generated method stub
        Path path = new Path(childName);
        IOFileFilter filter;
        if (path.segment(0).equals("*")) {
            filter = new NameFileFilter(path.lastSegment());
        } else {
            String lastSegment = path.lastSegment();
            if (lastSegment.startsWith("*")) {
                filter = new SuffixFileFilter(lastSegment.substring(1));
            } else {
                filter = null;
            }
        }
        Vector results = new Vector();

        for (int i = 0; i < this.children.size(); i++) {
            IVResource r1 = (IVResource) children.get(i);
            File f1 = new File(r1.getName());
            if (filter.accept(f1)) {
                results.add(r1);
            }

            if (r1.isDirectory()) {
                IVResource[] more = r1.findChildren(childName);
                results.addAll(Arrays.asList(more));
            }

        }
        return (IVResource[]) results.toArray(new IVResource[results.size()]);

    }
}
