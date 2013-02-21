package org.davinci.ajaxLibrary;

import java.io.IOException;
import java.net.URL;

public abstract class Library {

    String ID;
    String version;
    String defaultRoot;
    String metadataPath;
    String required;
	String sourcePath;

    public String getID() {
        return this.ID;
    }

    public String getRequired(){
    	return this.required;
    }
    
    public void setRequired(String required){
    	this.required = required;
    }
    
    public void setMetadataPath(String path) {
        this.metadataPath = path;
    }

    public String getMetadataPath() {
        return this.metadataPath;
    }

    public void setSourcePath(String path) {
        this.sourcePath = path;
    }

    public String getSourcePath() {
        return this.sourcePath;
    }

    public String getName() {
        return this.ID;
    }

    public void setName() {
        //
    }

    public String getDefaultRoot() {
        return this.defaultRoot;
    }

    public String getVersion() {
        return this.version;
    }

    public void setID(String id) {
        this.ID = id;
    }

    public void setVersion(String version) {
        this.version = version;

    }

    public abstract String getMetadata() throws IOException;

    public abstract URL getURL(String path, boolean useSource);

    public abstract URL[] find(String searchFor, boolean recurse, boolean useSource);
    
 
    public abstract URL[] listURL(String path, boolean useSource);

    public int compareTo(Object item) {
        Library i = (Library) item;
        return i.getID().compareTo(this.ID) + i.getVersion().compareTo(this.version);

    }

}
