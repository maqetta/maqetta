package maqetta.server.orion.command;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.MaqettaOrionServerConstants;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.Command;
import org.osgi.service.prefs.BackingStoreException;

public class SetWorkbenchState extends Command {

    
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(user.getUserID());
        	// read it with BufferedReader
    	BufferedReader br = new BufferedReader(new InputStreamReader(req.getInputStream()));
     
    	String line;
    	String value = "";
    	while ((line = br.readLine()) != null) {
    		value+=line;
    	}
    	br.close();

    	result.put(MaqettaOrionServerConstants.WORKBENCH_PREF, value);
		try {
			//flush directly at root level to workaround equinox bug 389754.
			result.parent().flush();
		} catch (BackingStoreException e) {
			LogHelper.log(e);
		}
   }

}
