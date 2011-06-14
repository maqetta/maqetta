package org.davinci.server.review.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.Person;
import org.davinci.server.user.PersonManager;
import org.davinci.server.user.User;

public class GetBluePageInfo extends Command {

	private static final String IDENTIFIER_AND_LABEL = "{identifier:'displayName',label:'name',numRows:";
	private static final String IDENTIFIER_AND_LABEL2 = ",items:[";
//	private static final String PHOTO_REPO_COOKIE = "photoRepositoryPath";

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		try {
			String name = req.getParameter("searchname");
			String count = req.getParameter("count");
			String startString = req.getParameter("start");
			String type = req.getParameter("type");

			PersonManager personManager = ServerManager.getServerManger().getUserManager().getPersonManager();

			if("photo".equals(type)){
				responseString = personManager.getPhotoRepositoryPath();
			}else{
				int resultNumber = Integer.parseInt(count);
				int start = Integer.parseInt(startString);
				Person[] persons = personManager.getPersons(name, resultNumber, start);
				responseString = arrayToJson(persons);
			}
		} catch (Exception e) {
			errorString = "Getting bluepage information fails.";
			e.printStackTrace();
		}
	}

	private String arrayToJson(Person[] persons) {
		StringBuffer buf = new StringBuffer();
		buf.append(IDENTIFIER_AND_LABEL);
		buf.append(persons.length);
		buf.append(IDENTIFIER_AND_LABEL2);
		for (Person p : persons) {
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
				buf.append(p.getUserName() + " (" + p.getEmail() + ")");
				buf.append("'");
				buf.append(",");
				buf.append("'");
				buf.append("name");
				buf.append("'");
				buf.append(":");
				buf.append("'");
				buf.append(p.getUserName());
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
