package org.maqetta.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

public class ProjectTemplatesManager implements IProjectTemplatesManager {
	private IStorage projectTemplatesDirectory = null;
	private JSONObject projectTemplatesIndex = null;
	static final private Logger theLogger = Logger.getLogger(ServerManager.class.getName());
	
	// Manage project templates folder here
	public ProjectTemplatesManager() {
	}
	
	public JSONObject getProjectTemplatesIndex() throws IOException {
		IStorage indexFile = getProjectTemplatesIndexIStorage();
		if(!indexFile.exists()) {
			return null;
		}else{
			try{
				String indexFileContents = readFile(indexFile.getPath());
				this.projectTemplatesIndex = new JSONObject(indexFileContents);
			} catch (JSONException e) {
				String desc = "Project Templates index file - not a valid json file";
				theLogger.log(Level.SEVERE, desc, e);
				throw new Error(desc, e);
			}
		}
		return this.projectTemplatesIndex;
	}

	public IStorage getProjectTemplatesIndexIStorage() {
		IStorage indexFile = null;
		try{
			IStorage projectTemplatesDirectory = getProjectTemplatesDirectory();
			indexFile = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, IDavinciServerConstants.PROJECT_TEMPLATES_INDEX_FILE);
		}catch(IOException e){
			String desc = "getProjectTemplates";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return indexFile;
	}

	public JSONArray getProjectTemplates(){
		return getProjectTemplates(null);
	}
	
	// If user is null, then return all templates
	// Otherwise, only return templates that given user is authorized ot use
	public JSONArray getProjectTemplates(IUser user) {
		JSONArray templates = new JSONArray();
		JSONObject indexFileObject = null;
		try{
			indexFileObject= getProjectTemplatesIndex();
		}catch(IOException e){
			String desc = "getProjectTemplates";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		if(indexFileObject == null){
			return templates;
		}
		IPerson person = null;
		String userEmail = null;
		if(user != null){
			person = user.getPerson();
			userEmail = person.getEmail();			
		}
		try{
			JSONArray allTemplates = indexFileObject.getJSONArray("templates");
			int count = allTemplates.length();
			for(int i=0 ; i< count; i++){
				JSONObject template = allTemplates.getJSONObject(i);
				String authorEmail = template.getString("authorEmail");
				String sharing = template.getString("sharingSimple");
				if(userEmail == null || userEmail.equals(authorEmail) || sharing == "all"){
					templates.put(template);
				}
			}
		} catch (JSONException e) {
			String desc = "getProjectTemplates - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return templates;
	}
	
	public String addProjectTemplate(IUser user, JSONObject params){

		Boolean error = false;
		String errorString = null;
		
		String projectTemplateName = null;
		String projectToClone = null;
		String sharingSimple = null;
		String timestamp = null;
		try{
			projectTemplateName = params.getString("projectTemplateName");
			projectToClone = params.getString("projectToClone");
			sharingSimple = params.getString("sharingSimple");
			timestamp = params.getString("timestamp");
		} catch (JSONException e) {
			String desc = "addProjectTemplate - params not valid json";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		
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
			try{
				IStorage projectTemplatesDirectory = getProjectTemplatesDirectory();
				
				IPerson person = user.getPerson();
				String email = person.getEmail();
				String templateFolderName = projectTemplateName + "_" + email;
				IStorage templateDir = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, templateFolderName);
				if(templateDir.exists()) {
					// If template directory already existings,
					// remove all of the current contents
					IStorage[] files = templateDir.listFiles();
					for (int i = 0; i < files.length; i++) {
						IStorage file = files[i];
						if (file.isFile() || file.isDirectory()) {
							file.delete();
						}
					}
				}else{
					templateDir.mkdir();
				}
	
				IStorage[] files = projectDir.listFiles();
				for (int i = 0; i < files.length; i++) {
					if (files[i].isFile()) {
						IStorage destination = templateDir.newInstance(templateDir, files[i].getName());
						copyFile(files[i], destination);
					} else if (files[i].isDirectory()) {
						IStorage destination = templateDir.newInstance(templateDir, files[i].getName());
						copyDirectory(files[i], destination);
					}
				}
				
				// Remove any templates from index that match this template
				JSONArray oldTemplates = getProjectTemplates();
				JSONArray newTemplates = new JSONArray();
				JSONObject template;
				int count = oldTemplates.length();
				for(int i=0 ; i< count; i++){
					try{
						template = oldTemplates.getJSONObject(i);
						String folder = template.getString("folder");
						if(!folder.equals(templateFolderName)){
							newTemplates.put(template);
						}
					} catch (JSONException e) {
						String desc = "addProjectTemplate - json exception";
						theLogger.log(Level.SEVERE, desc, e);
						throw new Error(desc, e);
					}
				}
				try{
					template = new JSONObject();
					template.put("folder", templateFolderName);
					template.put("name", projectTemplateName);
					template.put("authorEmail", email);
					template.put("clonedProject", projectToClone);
					template.put("sharingSimple", sharingSimple);
					template.put("timestamp", timestamp);
					newTemplates.put(template);
				} catch (JSONException e) {
					String desc = "addProjectTemplate - json exception";
					theLogger.log(Level.SEVERE, desc, e);
					throw new Error(desc, e);
				}
				
				// Add this template and write out a new copy of index file
				updateTemplates(newTemplates);
	
			} catch (IOException e) {
				String desc = "IOException with createProjectTemplate";
				theLogger.log(Level.SEVERE, desc, e);
				throw new Error(desc, e);
			}
		}
		return errorString;
	}
	
	private IStorage getProjectTemplatesDirectory() throws IOException {
		if(this.projectTemplatesDirectory!=null){
			return this.projectTemplatesDirectory;
		}
		IStorage baseDirectory = ServerManager.getServerManager().getBaseDirectory();
		this.projectTemplatesDirectory = baseDirectory.newInstance(baseDirectory, IDavinciServerConstants.PROJECT_TEMPLATES_DIRECTORY_NAME);
		if (!this.projectTemplatesDirectory.exists()) {
			this.projectTemplatesDirectory.mkdir();
		}
		return this.projectTemplatesDirectory;
	}
	
	private void updateTemplates(JSONArray newTemplates){
		JSONObject projectTemplatesIndex;
		IStorage projectTemplatesDirectory;
		String indexFileContents;
		try{
			projectTemplatesIndex = getProjectTemplatesIndex();
			projectTemplatesDirectory = getProjectTemplatesDirectory();
		} catch (IOException e) {
			String desc = "updateTemplates - IOException";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		try{
			// This updates the in-memory copy of the index
			projectTemplatesIndex.put("templates", newTemplates);
			indexFileContents = projectTemplatesIndex.toString(2);
		} catch (JSONException e) {
			String desc = "updateTemplates - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		try{
			// Write out the updated projectTemplatesIndex to disk as a JSON file
			InputStream in = new ByteArrayInputStream(indexFileContents.getBytes());
			IStorage destination = getProjectTemplatesIndexIStorage();
			OutputStream out = null;
			try {
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
		} catch (IOException e) {
			String desc = "updateTemplates - IOException";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
	}

	private String readFile(String path) throws IOException {
		FileInputStream stream = new FileInputStream(new File(path));
		try {
			FileChannel fc = stream.getChannel();
			MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0,
					fc.size());
			/* Instead of using default, pass in a decoder. */
			return Charset.defaultCharset().decode(bb).toString();
		} finally {
			stream.close();
		}
	}
	
	public void copyDirectory(IStorage sourceDir, IStorage destinationDir) throws IOException {
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

	public void copyFile(IStorage source, IStorage destination) throws IOException {
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