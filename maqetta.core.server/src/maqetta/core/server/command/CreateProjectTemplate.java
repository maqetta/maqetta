package maqetta.core.server.command;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.SimpleTimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.review.Constants;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;

import org.maqetta.server.IStorage;

public class CreateProjectTemplate extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String projectTemplateName = req.getParameter("projectTemplateName");
        String projectToClone = req.getParameter("projectToClone");
        Boolean error = false;
        String errorString = "";
        if (projectTemplateName == "" || projectTemplateName == null) {
        	errorString = "No project template name specified";
        	error = true;
        }
        if (projectToClone == "" || projectToClone == null) {
        	errorString = "No project to clone specified";
        	error = true;
        }
		IStorage userDir = user.getUserDirectory();
		IStorage projectDir = userDir.newInstance(projectToClone);
		if(!projectDir.exists()){
        	errorString = "Invalid project name to clone - project does not exist";
        	error = true;
		}
    	if(!error){
    		errorString = user.createProjectTemplate(projectTemplateName, projectDir);
    		if(errorString != null && errorString != ""){
    			error = true;
    		}
    	}
    	String successString = error ? "false" : "true";
        this.responseString = "{success:" + successString;
        if(error){
        	// Escape backslashes, single quotes and double-quotes
        	// BTW - Java regexps are horrible! To replace a single backslash with a double backslash, need 4 and 8!
        	this.responseString += ", error:\"" + errorString.replaceAll("\\\\","\\\\\\\\").replaceAll("'","\\\\\\'").replaceAll("\"","\\\\\"") + "\"";
        }
        this.responseString += "}";
        resp.setContentType("application/json;charset=UTF-8");
    }

/*
	private void copyDirectory(IStorage sourceDir, IStorage destinationDir) throws IOException {
		destinationDir.mkdirs();
		IStorage[] file = sourceDir.listFiles();
		for (int i = 0; i < file.length; i++) {
			if (file[i].isFile()) {
				IStorage sourceFile = file[i];

				IStorage targetFile = destinationDir.newInstance(destinationDir, file[i].getName());
				copyFile(sourceFile, targetFile);
			}

			if (file[i].isDirectory()) {
				IStorage destination = destinationDir.newInstance(destinationDir, file[i].getName());
				copyDirectory(file[i], destination);
			}
		}
	}

	private void copyFile(IStorage source, IStorage destination) throws IOException {
		InputStream in = null;
		OutputStream out = null;
		try {
			destination.getParentFile().mkdirs();
			in = source.getInputStream();
			out = destination.getOutputStream();
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
		} finally {
			if (in != null) {
				in.close();
			}
			if (out != null) {
				out.close();
			}
		}
	}
*/
    
}