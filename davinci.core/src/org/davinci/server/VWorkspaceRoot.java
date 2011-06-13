package org.davinci.server;

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
import java.util.Collection;
import java.util.Hashtable;

import org.davinci.server.user.User;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class VWorkspaceRoot extends VDirectory {
  
    User user;

    public VWorkspaceRoot(User user) {
        super();
     
        this.user = user;

    }

    public String getPath(){
        return ".";
  
    }
}
