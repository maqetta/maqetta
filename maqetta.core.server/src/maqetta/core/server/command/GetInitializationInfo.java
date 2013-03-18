package maqetta.core.server.command;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;

public class GetInitializationInfo extends Command {
	
	/**
	 * NOTE: IN PRACTICE, GetInitializationInfo is never called because
	 * all supported versions support Orion server and orion.core.server
	 * overrides GetInitializationInfo.
	 */

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        IStorage userSettings = user.getWorkbenchSettings();
        IStorage settingsFile = userSettings.newInstance(userSettings, IDavinciServerConstants.WORKBENCH_STATE_FILE);
        InputStream inputStream;
        int i;
        StringBuffer buffer = new StringBuffer();
        if (settingsFile.exists()) {
            inputStream = settingsFile.getInputStream();
        } else {
            inputStream = new ByteArrayInputStream("{}".getBytes());
        }
    	do {
    		i = inputStream.read();
    		if(i !=1 ){
    			buffer.append(i);
    		}
    	}while(i != -1);
		this.responseString=
				"{\n"+
				"\t\"workbenchState\":"+buffer+",\n"+
				"\t\"userInfo\":{\"userId\": \""+user.getUserID()+"\","+
				"\t\t\"isLocalInstall\": \""+String.valueOf(ServerManager.LOCAL_INSTALL)+"\","+
				"\t\t\"userDisplayName\": \""+String.valueOf(user.getPerson().getDisplayName())+"\","+
				/*"\t\t\"userLastName\": \""+String.valueOf(user.getPerson().getLastName())+"\","+*/
				"\t\t\"email\": \""+user.getPerson().getEmail()+"\"\n"+
				"\t}"+
				"}";
        resp.setContentType("application/json;charset=UTF-8");
    }
}
