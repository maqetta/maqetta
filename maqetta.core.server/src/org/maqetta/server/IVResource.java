package org.maqetta.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;

public interface IVResource {

//    public static final char SEPARATOR = '/';

    public URLConnection openConnection() throws MalformedURLException, IOException;

    public boolean exists();
    
    public boolean isVirtual();

    public String toString();

    public String getPath();

    public void setParent(IVResource parent);
    
    public boolean readOnly();

    public void createNewInstance() throws IOException;

    public boolean delete() throws IOException;

    public IVResource create(String path) throws IOException;

    public OutputStream getOutputStreem() throws FileNotFoundException, IOException;

    public InputStream getInputStreem() throws IOException;

    public IVResource[] listFiles();

    public String getName();

    public boolean isDirectory();

    /* only working copy no actual saved file */
    public boolean isNew();

    public void removeWorkingCopy() throws IOException;

    public void flushWorkingCopy() throws IOException;

    public URI getURI() throws URISyntaxException;

    public IVResource[] find(String path);

    public boolean mkdir() throws IOException;

    public boolean isDirty();

    public IVResource[] getParents();

    public IVResource getParent();

    public boolean hasSource();
    
    public boolean isSource();
	
    public IVResource getSource();
    
    public IVResource get(String childName);

    /* search for children, supports wild card */
    public IVResource[] findChildren(String childName);

    public void add(IVResource v);
}