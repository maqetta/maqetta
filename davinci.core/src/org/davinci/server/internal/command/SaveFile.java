package org.davinci.server.internal.command;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;

public class SaveFile extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String path = req.getParameter("path");
		boolean isWorkingCopy = "true".equalsIgnoreCase(req
				.getParameter("isWorkingCopy"));
		IVResource file = user.getResource(path);

		if (file.exists()) {
			OutputStream os = file.getOutputStreem();
			Command.transferStreams(req.getInputStream(), os, false);
			if (!isWorkingCopy) {
				// flush the working copy
				file.flushWorkingCopy();
			}

		} else {
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
		}

	}

}
