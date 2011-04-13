package org.davinci.server.internal.command;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.LibInfo;
import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.Resource;
import org.davinci.server.ServerManager;
import org.davinci.server.VEmptyFile;
import org.davinci.server.IVResource;
import org.davinci.server.internal.Links.Link;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;

public class ListFiles extends Command {
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,	User user) throws IOException {
		String path=req.getParameter("path");
		IVResource[] listDir = user.listFiles(path);
		this.responseString= Resource.vRsourcesToJson(listDir,false);
	}
}
