package org.davinci.server.internal.command;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.Reader;
import java.net.URL;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.user.User;
import org.eclipse.core.runtime.IConfigurationElement;
import org.osgi.framework.Bundle;

public class GetPlugins extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		List extensions = ServerManager.getServerManger().getExtensions(IDavinciServerConstants.EXTENSION_POINT_JSPLUGIN, IDavinciServerConstants.EP_TAG_JSPLUGIN);
		StringBuffer sb=new StringBuffer();
		sb.append("[");
		boolean wasOne=false;
		for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
			IConfigurationElement configElement = (IConfigurationElement) iterator.next();
			String role=configElement.getAttribute(IDavinciServerConstants.EP_ATTR_JSPLUGIN_ROLE);
			if (role!=null && role.length()>0)
			{
				// validate authorization for this plugin
			}

			if (wasOne)
				sb.append(",");
			wasOne=true;
			String path=configElement.getAttribute(IDavinciServerConstants.EP_ATTR_JSPLUGIN_PATH);
			sb.append('"').append(path).append("\",");
			String resourcePath=configElement.getAttribute(IDavinciServerConstants.EP_ATTR_JSPLUGIN_RESOURCE_PATH);
			String bundleName = configElement.getDeclaringExtension().getContributor().getName();
			Bundle bundle=Activator.getActivator().getOtherBundle(bundleName);
			if (bundle!=null)
			{
				URL resourceURL=bundle.getEntry(resourcePath+"_plugin.js");
				if (resourceURL!=null)
				{
					InputStream inputStream = null;
					try {
						inputStream = resourceURL.openConnection().getInputStream();
						Reader reader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));
						int firstChar=reader.read();
						boolean isParen=false;
						if (firstChar=='(')		// some plugins are surrounded by '(' ')' , get rid of them
							isParen=true;
						else
							sb.append((char)firstChar);
						  char[] arr = new char[8*1024]; // 8K at a time
						  int numChars;
	
						  while ((numChars = reader.read(arr, 0, arr.length)) > 0) {
						      sb.append(arr, 0, numChars);
						  }
						  if (isParen)
							  sb.deleteCharAt(sb.length()-1);
					} catch (IOException e) {
						// FIXME: why catch?
						// TODO Auto-generated catch block
						e.printStackTrace();
						throw e;
					} finally {
						if(inputStream != null)
							inputStream.close();
					}
				}

			}

		}
		sb.append("]");
		responseString=sb.toString();
	}

}
