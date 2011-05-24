package org.davinci.ajaxLibrary;

import org.davinci.server.IDavinciServerConstants;
import org.eclipse.core.runtime.IConfigurationElement;

public class MetaData {
	
	       String  module;
	       String modulePath;
	       String base;
	       String paletteDescriptors;
	       String metaJson;
	       
	       public MetaData(IConfigurationElement element){
	    	   this.module=element.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_MODULE);
	    	   this.modulePath=element.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_MODULEPATH);
	    	   this.base=element.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_BASE);
	    	   this.paletteDescriptors=element.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_PALETTEDESCRIPTORS);
	       }
	       public String toJSON(){
	    	   return "{ module: \""+this.module+"\", modulePath: \""+this.modulePath+"\", base: \""+this.base+"\", paletteDescriptorNames: \""+this.paletteDescriptors+"\" }";
	       }
}

