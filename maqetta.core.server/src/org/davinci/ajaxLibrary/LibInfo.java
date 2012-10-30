package org.davinci.ajaxLibrary;

public class LibInfo implements ILibInfo {
    
	public LibInfo(String id, String name, String version, String virtualRoot, String required) {
        this.setName(name);
        this.setVersion(version);
        this.setId(id);
        this.setVirtualRoot(virtualRoot);
        this.setRequired(required);
       

    }


    public void setVersion(String version) {
        this.version = version;
    }

    /* (non-Javadoc)
	 * @see org.davinci.ajaxLibrary.ILibInfo#getVersion()
	 */
    public String getVersion() {
        return version;
    }
    
    public void setId(String id) {
        this.id = id;
    }

    /* (non-Javadoc)
	 * @see org.davinci.ajaxLibrary.ILibInfo#getId()
	 */
    public String getId() {
        return id;
    }

    public void setVirtualRoot(String virtualRoot) {
        this.virtualRoot = virtualRoot;
    }

    /* (non-Javadoc)
	 * @see org.davinci.ajaxLibrary.ILibInfo#getVirtualRoot()
	 */
    public String getVirtualRoot() {
        String vr = this.virtualRoot;

        if(vr==null)
        	return null;
        
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

    /* (non-Javadoc)
	 * @see org.davinci.ajaxLibrary.ILibInfo#getName()
	 */
    public String getName() {
        return name;
    }

    public String toString(){
    	return "name:" + this.getName() + ", id:" + this.getId() + ", virtualRoot:" + this.getVirtualRoot();
    }
    private String name;
    private String version;
    private String id;
    private String virtualRoot;
    private String isRequired;
	public String isRequired() {
		return this.isRequired;
	}
	public void setRequired(String required) {
		this.isRequired = required;
	}


	public String getRequired() {
		
		return this.isRequired;
	}


}