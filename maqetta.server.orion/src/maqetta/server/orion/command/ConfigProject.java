package maqetta.server.orion.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.MaqettaOrionServerConstants;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.Command;

public class ConfigProject extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	
        String projectName = req.getParameter("project");
        String redirectTo = req.getParameter("redirect");
    	user.createProject(projectName);
        
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(user.getUserName());
    	String workbenchSettings = result.get(MaqettaOrionServerConstants.WORKBENCH_PREF, "{}");
        
    	this.responseString = "OK";
    	resp.sendRedirect("/maqetta/?project=" + projectName);

    }

}
