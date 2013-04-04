package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.IPersonManager;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class GetBluePageInfo extends Command {

	private static final String IDENTIFIER_AND_LABEL = "{identifier:'displayName',label:'name',numRows:";
	private static final String IDENTIFIER_AND_LABEL2 = ",items:[";
//	private static final String PHOTO_REPO_COOKIE = "photoRepositoryPath";

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			IUser user) throws IOException {
		try {
			String usernameTypeaheadEnabledString = ServerManager.getServerManager().
					getDavinciProperty(IDavinciServerConstants.USERNAME_TYPEAHEAD_ENABLED);
			Boolean usernameTypeaheadEnabled = usernameTypeaheadEnabledString==null || usernameTypeaheadEnabledString.equals("true");

			String name = req.getParameter("searchname");
			String count = req.getParameter("count");
			String startString = req.getParameter("start");
			String type = req.getParameter("type");

			IPersonManager personManager = ServerManager.getServerManager().getPersonManager();

			if("photo".equals(type)){
				responseString = personManager.getPhotoRepositoryPath();
			}else{
				int resultNumber = Integer.parseInt(count);
				int start = Integer.parseInt(startString);
				IPerson[] persons;
				if(usernameTypeaheadEnabled){
					persons = personManager.getPersons(name, resultNumber, start);
				}else{
					persons = new IPerson[0];
				}
				responseString = arrayToJson(persons);
			}
		} catch (Exception e) {
			errorString = "Getting bluepage information fails.";
			e.printStackTrace();
		}
	}

	private String arrayToJson(IPerson[] persons) {
		StringBuffer buf = new StringBuffer();
		buf.append(IDENTIFIER_AND_LABEL);
		buf.append(persons.length);
		buf.append(IDENTIFIER_AND_LABEL2);
		for (IPerson p : persons) {
			if (p.getEmail().contains("@")) {
				buf.append("{");
				buf.append("'");
				buf.append("emailaddress");
				buf.append("'");
				buf.append(":");
				buf.append("'");
				buf.append(p.getEmail());
				buf.append("'");
				buf.append(",");
				buf.append("'");
				buf.append("displayName");
				buf.append("'");
				buf.append(":");
				buf.append("'");
				buf.append(p.getEmail()); //buf.append(p.getUserID() + " (" + p.getEmail() + ")");
				buf.append("'");
				buf.append(",");
				buf.append("'");
				buf.append("name");
				buf.append("'");
				buf.append(":");
				buf.append("'");
				buf.append(p.getUserID());
				buf.append("'");
				buf.append("}");
				buf.append(",");
			}
		}
		if(persons != null && persons.length > 0){
			buf.deleteCharAt(buf.lastIndexOf(","));
		}
		buf.append("]}");
		return buf.toString();
	}
}
