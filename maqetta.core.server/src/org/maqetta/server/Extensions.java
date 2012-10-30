package org.maqetta.server;

import java.util.ArrayList;
import java.util.List;

import org.davinci.server.internal.Activator;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;

public class Extensions {
	 private static IExtensionRegistry registry;

	public static List getExtensions(String extensionPoint, String elementTag) {
	        ArrayList list = new ArrayList();
	        IExtension[] extensions = getExtensions(extensionPoint);
	        for (int i = 0; i < extensions.length; i++) {
	            IConfigurationElement[] elements = extensions[i].getConfigurationElements();
	            for (int j = 0; j < elements.length; j++) {
	                if (elements[j].getName().equals(elementTag)) {
	                    list.add(elements[j]);
	                }
	            }
	        }

	        return list;
	    }

	    /* (non-Javadoc)
		 * @see org.davinci.server.IServerManager#getExtension(java.lang.String, java.lang.String)
		 */
	    public static IConfigurationElement getExtension(String extensionPoint, String elementTag) {
	        IExtension[] extensions = getExtensions(extensionPoint);
	        for (int i = 0; i < extensions.length; i++) {
	            IConfigurationElement[] elements = extensions[i].getConfigurationElements();
	            for (int j = 0; j < elements.length; j++) {
	                if (elements[j].getName().equals(elementTag)) {
	                    return elements[j];
	                }
	            }
	        }

	        return null;
	    }

	    private static final IExtension[] EMPTY_EXTENSIONS = {};

	    /* (non-Javadoc)
		 * @see org.davinci.server.IServerManager#getExtensions(java.lang.String)
		 */
	    public static IExtension[] getExtensions(String extensionPoint) {
	        if (registry == null) {
	            registry = Activator.getActivator().getRegistry();
	        }
	        if (registry != null) {
	            IExtensionPoint point = registry.getExtensionPoint(IDavinciServerConstants.BUNDLE_ID, extensionPoint);

	            if (point != null) {
	                return point.getExtensions();
	            }
	        }
	        return EMPTY_EXTENSIONS;
	    }

}
