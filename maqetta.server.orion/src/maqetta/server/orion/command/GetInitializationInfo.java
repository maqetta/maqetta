package maqetta.server.orion.command;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.MaqettaOrionServerConstants;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;

public class GetInitializationInfo extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(user.getUserID());
    	String workbenchSettings = result.get(MaqettaOrionServerConstants.WORKBENCH_PREF, "{}");
		this.responseString=
			"{\n"+
			"\t'workbenchState':"+workbenchSettings+",\n"+
			"\t'userInfo':{'userId': '"+user.getUserID()+"',"+
			"\t\t'isLocalInstall': '"+String.valueOf(ServerManager.LOCAL_INSTALL)+"',"+
			"\t\t'userFirstName': '"+String.valueOf(user.getPerson().getFirstName())+"',"+
			"\t\t'userLastName': '"+String.valueOf(user.getPerson().getLastName())+"',"+
			"\t\t'email': '"+user.getPerson().getEmail()+"'\n"+
			"\t}"+
			"}";

    }

}
