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
            IStorage projectTemplatesDirectory = user.getProjectTemplatesDirectory();

            /*
    		Date currentTime = new Date();
    		SimpleDateFormat formatter = new SimpleDateFormat(Constants.DATE_PATTERN_SHORT);
    		formatter.setCalendar(Calendar.getInstance(new SimpleTimeZone(0, "GMT")));
    		String timeVersion = formatter.format(currentTime);
    		*/
            IPerson person = user.getPerson();
            String email = person.getEmail();
    		IStorage templateDir = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, projectTemplateName + "_" + email /* + "_" + timeVersion*/);
    		if(!templateDir.exists()) {
    			templateDir.mkdir();
    		}

    		IStorage[] files = projectDir.listFiles();
    		for (int i = 0; i < files.length; i++) {
//    			String path = files[i].getAbsolutePath();
    			if (files[i].isFile()/*
    					&& path.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) < 0*/) {
    				IStorage destination = templateDir.newInstance(templateDir, files[i].getName());
    				copyFile(files[i], destination);
    			} else if (files[i].isDirectory()/*
//    					&& path.indexOf(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME) < 0  // Need to copy the settings
    					&& path.indexOf(IDavinciServerConstants.DOWNLOAD_DIRECTORY_NAME) < 0
    					&& path.indexOf(Constants.REVIEW_DIRECTORY_NAME) < 0
    					&& path.indexOf(".svn") < 0
    					&& containsPublishedFiles(files[i], user, timeStamp)*/) {
    				IStorage destination = templateDir.newInstance(templateDir, files[i].getName());
    				copyDirectory(files[i], destination);
    			}
    		}

//    		user.createProject(projectTemplateName);
    	}
    	String successString = error ? "false" : "true";
        this.responseString = "{success:" + successString + "}";
        resp.setContentType("application/json;charset=UTF-8");
    }


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

}