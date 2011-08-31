package org.davinci.ajaxLibrary;

public class LibInfo {
    
	public LibInfo(String id, String name, String version, String virtualRoot) {
        this.setName(name);
        this.setVersion(version);
        this.setId(id);
        this.setVirtualRoot(virtualRoot);
       

    }


    public void setVersion(String version) {
        this.version = version;
    }

    public String getVersion() {
        return version;
    }
    
    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setVirtualRoot(String virtualRoot) {
        this.virtualRoot = virtualRoot;
    }

    public String getVirtualRoot() {
        String vr = this.virtualRoot;

        if (vr.length()>0 && vr.charAt(0) == '.') {
            vr = vr.substring(1);
        }

        if (vr.length()>0 && vr.charAt(0) == '/') {
            vr = vr.substring(1);
        }
        return vr;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    private String name;
    private String version;
    private String id;
    private String virtualRoot;


}