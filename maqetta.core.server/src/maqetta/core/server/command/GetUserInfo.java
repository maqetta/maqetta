package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class GetUserInfo extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			IUser user) throws IOException {
		this.responseString=
		"{ userId: '"+user.getUserID()+"',"+
		"isLocalInstall: '"+String.valueOf(ServerManager.LOCAL_INSTALL)+"',"+
		"userFirstName: '"+String.valueOf(user.getPerson().getFirstName())+"',"+
		"userLastName: '"+String.valueOf(user.getPerson().getLastName())+"',"+
		"email: '"+user.getPerson().getEmail()+"' }";
	}

}