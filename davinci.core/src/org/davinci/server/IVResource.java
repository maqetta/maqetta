package org.davinci.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;

public interface IVResource {

    public static final char SEPERATOR = '/';

    URLConnection openConnection() throws MalformedURLException, IOException;

    public boolean exists();

    public String toString();

    public String getPath();

    public boolean readOnly();

    public void createNewInstance() throws IOException;

    public boolean delete();

    public IVResource create(String path);

    public OutputStream getOutputStreem() throws FileNotFoundException, IOException;

    public InputStream getInputStreem() throws IOException;

    public IVResource[] listFiles();

    public String getName();

    public boolean isDirectory();

    /* only working copy no actual saved file */
    public boolean committed();

    public void removeWorkingCopy();

    public void flushWorkingCopy();

    public URI getURI() throws URISyntaxException;

    public IVResource[] find(String path);

    public boolean mkdir();

    public boolean isFile();

    public boolean isDirty();

    public IVResource[] getParents();

    public IVResource getParent();

    IVResource get(String childName);

    /* search for children, supports wild card */
    IVResource[] findChildren(String childName);

    void add(IVResource v);
}