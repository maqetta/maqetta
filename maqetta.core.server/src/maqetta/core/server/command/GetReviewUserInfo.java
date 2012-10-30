package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class GetReviewUserInfo extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			IUser user) throws IOException {
		this.responseString="{ userName: '"+user.getUserID()+
		"', isLocalInstall: "+String.valueOf(ServerManager.LOCAL_INSTALL)+
		" ,email: '"+user.getPerson().getEmail()+"' }";
	}

}
