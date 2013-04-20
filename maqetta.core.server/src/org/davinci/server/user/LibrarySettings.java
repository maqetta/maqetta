package org.davinci.server.user;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.LibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.util.XMLFile;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;
import org.w3c.dom.Element;

public class LibrarySettings extends XMLFile {

    IStorage      libFile;
    ILibInfo[] libs;

    public LibrarySettings(IStorage dir) {
        libFile = dir.newInstance(dir, IDavinciServerConstants.LIBS_FILE);

        if (!libFile.exists()) {
            libs = getAllDefaultLibs();
        } else {
            ArrayList list = this.load(libFile);
            libs = (ILibInfo[]) list.toArray(new ILibInfo[list.size()]);
        }
    }

    public boolean exists(){
    	return libFile.exists();
    }
 
    public static ILibInfo[] getAllDefaultLibs() {
        Library[] all = ServerManager.getServerManager().getLibraryManager().getAllLibraries();
        ILibInfo[] results = new ILibInfo[all.length];
        for (int i = 0; i < all.length; i++) {
            results[i] = new LibInfo(all[i].getID(), all[i].getName(), all[i].getVersion(), all[i].getDefaultRoot(), all[i].getRequired());
        }
        return results;
    }
    protected String[] getAttributeNames() {
        return new String[] { "id", "name", "version", "virtualRoot", "base", "required" };
    }
	protected String getAttributeValue(String attribute, Object object) {
		  ILibInfo libInfo = (ILibInfo) object;
		  if(attribute.equalsIgnoreCase("id")){
				return libInfo.getId();
		  }
		  if(attribute.equalsIgnoreCase("name")){
			  return libInfo.getName();
		  }
		  if(attribute.equalsIgnoreCase("version")){
			  return libInfo.getVersion();
		  }
		  if(attribute.equalsIgnoreCase("virtualRoot")){
			  return libInfo.getVirtualRoot();
		  }
		  if(attribute.equalsIgnoreCase("base")){
			  return null;
		  }
		  if(attribute.equalsIgnoreCase("required")){
			  return libInfo.getRequired();
		  }
		  
		return null;
	
	}
    protected String getRootTag() {
        return "libraries";
    }

    public ILibInfo[] allLibs() {
        return this.libs;
    }

    protected String getElementTag() {
        return "library";
    }

    public boolean addLibrary(String name, String version, String id, String virtualRoot, String required) throws IOException {

        LibInfo link = new LibInfo(id, name, version, virtualRoot, required);

        LibInfo[] newLibs = new LibInfo[libs.length + 1];
        System.arraycopy(libs, 0, newLibs, 0, libs.length);
        newLibs[libs.length] = link;
        this.libs = newLibs;
        this.save();
        return true;
    }

    public boolean removeLibrary(String id, String version, String base) throws IOException {
        for (int i = 0; i < this.libs.length; i++) {
            if (this.libs[i].getId().equals(id) && this.libs[i].getVersion().equals(version)) {
                LibInfo[] newLinks = new LibInfo[libs.length - 1];
                System.arraycopy(libs, 0, newLinks, 0, i);
                System.arraycopy(libs, i + 1, newLinks, i, libs.length - 1 - i);
                this.libs = newLinks;
                this.save();
                return true;
            }
        }
        return false;

    }

    public void modifyLibrary(String id, String version, String virtualRoot, String base, String required) throws IOException {
        this.removeLibrary(id, version, base);
        this.addLibrary(id, version, id, virtualRoot, required);
    }

    protected Object createObject(Element element, String[] attributeNames, String[] attributeValues) {

    	String id = null;
    	String name = null;
    	String version = null;
    	String virtualRoot = null;
    	String base = null;
    	String required = null;
    	
    	for(int i=0;i<attributeNames.length;i++){
    		if(attributeNames[i].equalsIgnoreCase("id"))
    			id = attributeValues[i];
    		if(attributeNames[i].equalsIgnoreCase("name"))
    			name = attributeValues[i];
    		if(attributeNames[i].equalsIgnoreCase("version"))
    			version = attributeValues[i];
    		if(attributeNames[i].equalsIgnoreCase("virtualRoot"))
    			virtualRoot = attributeValues[i];
    		if(attributeNames[i].equalsIgnoreCase("base"))
    			base = attributeValues[i];
    		if(attributeNames[i].equalsIgnoreCase("required"))
    			required = attributeValues[i];
    	}
    	
    	ILibInfo link = new LibInfo(id,name,version,virtualRoot, required);
        return link;
    }

    public void save() throws IOException {
        this.save(libFile, Arrays.asList(this.libs));
    }
}
