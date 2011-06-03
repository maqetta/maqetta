package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;

public class ListLibs extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		Library[] libs = ServerManager.getServerManger().getLibraryManager()
				.getAllLibraries();

		JSONWriter jsonWriter = new JSONWriter(true);
		jsonWriter.startObject().addFieldName("userLibs").startArray();
		for (int i = 0; i < libs.length; i++) {
			String id = libs[i].getID();
			String version = libs[i].getVersion();
			jsonWriter.startObject().addField("id", id);
			jsonWriter.addField("version", version);
			jsonWriter.addField("root", libs[i].getDefaultRoot());
			jsonWriter.endObject();
		}
		jsonWriter.endArray().endObject();
		this.responseString = jsonWriter.getJSON();
	}

}
