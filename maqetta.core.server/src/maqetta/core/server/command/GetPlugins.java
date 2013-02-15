package maqetta.core.server.command;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.internal.Activator;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IConfigurationElement;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;
import org.osgi.framework.Bundle;

public class GetPlugins extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        List extensions = ServerManager.getServerManager().getExtensions(IDavinciServerConstants.EXTENSION_POINT_JSPLUGIN,
                IDavinciServerConstants.EP_TAG_JSPLUGIN);
        StringBuffer sb = new StringBuffer();
        sb.append("[");
        boolean wasOne = false;
        for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
            IConfigurationElement configElement = (IConfigurationElement) iterator.next();
            String role = configElement.getAttribute(IDavinciServerConstants.EP_ATTR_JSPLUGIN_ROLE);
            if (role != null && role.length() > 0) {
                // validate authorization for this plugin
            }

            if (wasOne) {
                sb.append(",");
            }
            wasOne = true;
            String path = configElement.getAttribute(IDavinciServerConstants.EP_ATTR_JSPLUGIN_PATH);
            sb.append('"').append(path).append("\",");
            String resourcePath = configElement.getAttribute(IDavinciServerConstants.EP_ATTR_JSPLUGIN_RESOURCE_PATH);
            String bundleName = configElement.getDeclaringExtension().getContributor().getName();
            Bundle bundle = Activator.getActivator().getOtherBundle(bundleName);
            if (bundle != null) {
                URL resourceURL = bundle.getEntry(resourcePath + ".plugin");
                if (resourceURL != null) {
                	InputStreamReader reader = null;
                    try {
                        InputStream inputStream = resourceURL.openConnection().getInputStream();
                        reader = new InputStreamReader(inputStream);
                        int firstChar = reader.read();
                        boolean isParen = false;
                        if (firstChar == '(') {
                            isParen = true;
                        } else {
                            sb.append((char) firstChar);
                        }
                        char[] arr = new char[8 * 1024]; // 8K at a time
                        int numChars;

                        while ((numChars = reader.read(arr, 0, arr.length)) > 0) {
                            sb.append(arr, 0, numChars);
                        }
                        if (isParen) {
                            sb.deleteCharAt(sb.length() - 1);
                        }
                    } finally {
                    	if (reader != null) {
                    		reader.close();
                    	}
                    }
                }
            }
        }
        sb.append("]");
        responseString = sb.toString();
    }
}
