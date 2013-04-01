package org.maqetta.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
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
	private IStorage projectTemplatesIndexIStorage = null;
	private JSONObject projectTemplatesIndex = null;
	static final private Logger theLogger = Logger.getLogger(ServerManager.class.getName());
	
	// Manage project templates folder here
	public ProjectTemplatesManager() {
	}
	
	// Local routine that sees if the index file for project templates
	// has been loaded into memory. If so, return that.
	// Otherwise, load the index file from disk.
	private JSONObject _getProjectTemplatesIndex() throws IOException {
		if(this.projectTemplatesIndex != null){
			return this.projectTemplatesIndex;
		}
		IStorage indexFile = getProjectTemplatesIndexIStorage();
		try{
			if(!indexFile.exists()) {
				this.projectTemplatesIndex = new JSONObject();
				JSONArray templates = new JSONArray();
				this.projectTemplatesIndex.put("templates", templates);
			}else{
				String indexFileContents = readFile(indexFile.getPath());
				this.projectTemplatesIndex = new JSONObject(indexFileContents);
			}
		} catch (JSONException e) {
			String desc = "Project Templates index file - not a valid json file";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return this.projectTemplatesIndex;
	}

	// If no user specified, then return the full list of templates
	public JSONObject getProjectTemplatesIndex() throws IOException {
		return getProjectTemplatesIndex(null);
	}
	
	// If a user is specified, then return only those templates that are available to that user	
	public JSONObject getProjectTemplatesIndex(IUser user) throws IOException {
		JSONObject projectTemplatesObject = _getProjectTemplatesIndex();
		if(projectTemplatesObject == null){
			return null;
		}
		// Give a clone, not original object, to callers
		JSONObject returnObject = cloneJSONObject(projectTemplatesObject);
		if(user == null){
			return returnObject;
		}
		try{
			// Filter the list of templates
			IPerson person = user.getPerson();
			String userEmail = person.getEmail();			
			JSONArray allTemplates = returnObject.getJSONArray("templates");
			JSONArray userTemplates = new JSONArray();
			int count = allTemplates.length();
			for(int i=0 ; i< count; i++){
				JSONObject template = allTemplates.getJSONObject(i);
				String authorEmail = template.getString("authorEmail");
				String sharing = template.getString("sharingSimple");
				if(userEmail.equals(authorEmail) || sharing.equals("all")){
					userTemplates.put(template);
				}
			}
			returnObject.put("templates", userTemplates);
			return returnObject;
		} catch (JSONException e) {
			String desc = "getProjectTemplatesIndex - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
	}

	public IStorage getProjectTemplatesIndexIStorage() {
		if(this.projectTemplatesIndexIStorage != null){
			return this.projectTemplatesIndexIStorage;
		}
		try{
			IStorage projectTemplatesDirectory = getProjectTemplatesDirectory();
			this.projectTemplatesIndexIStorage = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, IDavinciServerConstants.PROJECT_TEMPLATES_INDEX_FILE);
		}catch(IOException e){
			String desc = "getProjectTemplates";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return this.projectTemplatesIndexIStorage;
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
		
		if (projectTemplateName.equals("") || projectTemplateName == null) {
			return "No project template name specified";
		}
		// Make sure project template name only contains alphas. 
		// Guards against "../" and ensures there are no underscores in name
		// Don't allow underscore because folder name we create has an underscore
		// to separate the template name from the author's email
		if (!projectTemplateName.matches("^[\\p{L}\\d\\.\\-]+$")){
			return "Invalid characters in project template name";
		}
		if (projectToClone.equals("") || projectToClone == null) {
			return "No project to clone specified";
		}

		IStorage userDir = user.getUserDirectory();
		IStorage projectDir = userDir.newInstance(projectToClone);
		if(!projectDir.exists()){
			return "Invalid project name to clone - project does not exist";
		}
		try{
			IStorage projectTemplatesDirectory = getProjectTemplatesDirectory();
			
			IPerson person = user.getPerson();
			String email = person.getEmail();
			String templateFolderName = makeProjectTemplateFolderName(projectTemplateName, email);
			IStorage templateDir = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, templateFolderName);
			if(templateDir.exists()) {
				// If template directory already exists,
				// remove all of the current contents
				IStorage[] files = templateDir.listFiles();
				for (int i = 0; i < files.length; i++) {
					IStorage file = files[i];
					if (file.isFile()) {
						file.delete();
					}else if(file.isDirectory()) {
						deleteDirectory(file);
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
			JSONObject projectTemplatesObject = _getProjectTemplatesIndex();
			JSONArray oldTemplates;
			oldTemplates = projectTemplatesObject.getJSONArray("templates");
			JSONArray newTemplates = new JSONArray();
			JSONObject template;
			String oldCreationTimestamp = null;
			int count = oldTemplates.length();
			for(int i=0 ; i< count; i++){
				template = oldTemplates.getJSONObject(i);
				String folder = template.getString("folder");
				if(folder.equals(templateFolderName)){
					oldCreationTimestamp = template.getString("creationTimestamp");
				}else{
					newTemplates.put(template);
				}
			}
			// Add this template and write out a new copy of index file
			template = new JSONObject();
			template.put("folder", templateFolderName);
			template.put("name", projectTemplateName);
			template.put("authorEmail", email);
			template.put("clonedProject", projectToClone);
			template.put("sharingSimple", sharingSimple);
			template.put("creationTimestamp", oldCreationTimestamp == null ? timestamp : oldCreationTimestamp);
			template.put("lastModifyTimestamp", timestamp);
			newTemplates.put(template);
			
			updateTemplates(newTemplates);

		} catch (JSONException e) {
			String desc = "addProjectTemplate - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		} catch (IOException e) {
			String desc = "IOException with createProjectTemplate";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return "";
	}
	
	// Deletes a set of project templates
	// User must be the owner of all the templates he is trying to delete, else operation fails
	public String deleteProjectTemplates(IUser user, JSONArray templatesToDelete){
		String errorString = null;
		IPerson person = user.getPerson();
		String email = person.getEmail();

		JSONObject projectTemplatesObject;
		JSONArray existingTemplates;
		try{
			IStorage projectTemplatesDirectory = getProjectTemplatesDirectory();
			projectTemplatesObject = _getProjectTemplatesIndex();
			existingTemplates = projectTemplatesObject.getJSONArray("templates");
			// Verify that all of the templatesToDelete exist
			// and are owned by this user
			int count = templatesToDelete.length();
			for(int i=0 ; i< count; i++){
				JSONObject templateToDelete = templatesToDelete.getJSONObject(i);
				int found = findTemplateInArray(existingTemplates, templateToDelete, email);
				if(found == -1){
					return "at least one template to delete not found";
				}
			}
			
			// Delete the overridden template(s), both in the index file
			// and on disk
			JSONArray newTemplates = new JSONArray();
			int existingCount = existingTemplates.length();
			for(int j=0; j<existingCount; j++){
				JSONObject existingTemplate = existingTemplates.getJSONObject(j);
				String existingName = existingTemplate.getString("name");
				String existingEmail = existingTemplate.getString("authorEmail");
				Boolean found = false;
				int deleteCount = templatesToDelete.length();
				for(int i=0 ; i< deleteCount; i++){
					JSONObject templateToDelete = templatesToDelete.getJSONObject(i);
					String deleteName = templateToDelete.getString("name");
					if(existingName.equals(deleteName) && existingEmail.equals(email)){
						found = true;
						break;
					}
				}
				if(found){
					String existingFolderName = makeProjectTemplateFolderName(existingName, existingEmail);
					IStorage existingFolder = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, existingFolderName);
					deleteDirectory(existingFolder);
				}else{
					newTemplates.put(existingTemplate);
				}
			}
			updateTemplates(newTemplates);
		} catch (JSONException e) {
			String desc = "deleteProjectTemplates - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		} catch (IOException e) {
			String desc = "IOException with deleteProjectTemplates";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return errorString;
	}
	
	// Modify settings on a set of project templates
	// User must be the owner of all the templates he is trying to modify, else operation fails
	public String modifyProjectTemplates(IUser user, JSONArray templatesToModify){
		String errorString = null;

		IPerson person = user.getPerson();
		String userEmail = person.getEmail();

		JSONObject projectTemplatesObject;
		JSONArray existingTemplates;
		try{
			projectTemplatesObject = _getProjectTemplatesIndex();
			existingTemplates = projectTemplatesObject.getJSONArray("templates");
			// Verify that all of the templatesToModify exist
			// and are owned by this user
			int count = templatesToModify.length();
			for(int i=0 ; i< count; i++){
				JSONObject templateToModify = templatesToModify.getJSONObject(i);
				int found = findTemplateInArray(existingTemplates, templateToModify, userEmail);
				if(found == -1){
					return "at least one template to modify not found";
				}
			}
			
			// Modify the templates
			IStorage projectTemplatesDirectory = getProjectTemplatesDirectory();
			JSONArray newTemplates = new JSONArray();
			int existingCount = existingTemplates.length();
			for(int j=0; j<existingCount; j++){
				JSONObject existingTemplate = existingTemplates.getJSONObject(j);
				String existingName = existingTemplate.getString("name");
				String existingEmail = existingTemplate.getString("authorEmail");
				int modifyCount = templatesToModify.length();
				for(int i=0 ; i< modifyCount; i++){
					JSONObject templateToModify = templatesToModify.getJSONObject(i);
					String modifyName = templateToModify.getString("name");
					if(existingName.equals(modifyName) && existingEmail.equals(userEmail)){
						// Only valid fields to modify: sharingSimple and name (via newName property)
						if(templateToModify.has("newName")){
							String newName = templateToModify.getString("newName");
							if(!newName.equals("") && newName != null){
								String existingFolderName = makeProjectTemplateFolderName(existingName, userEmail);
								String newFolderName =  makeProjectTemplateFolderName(newName, userEmail);
								IStorage existingFolder = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, existingFolderName);
								IStorage newFolder = projectTemplatesDirectory.newInstance(projectTemplatesDirectory, newFolderName);
								existingFolder.renameTo(newFolder);
								existingTemplate.put("name", newName);
								existingTemplate.put("folder", newFolderName);
							}
						}
						if(templateToModify.has("sharingSimple")){
							String newSharingSimply = templateToModify.getString("sharingSimple");
							if(!newSharingSimply.equals("") && newSharingSimply != null){
								existingTemplate.put("sharingSimple", newSharingSimply.equals("all") ? "all" : "none");
							}
						}
					}
				}
				newTemplates.put(existingTemplate);
			}
			updateTemplates(newTemplates);
		} catch (JSONException e) {
			String desc = "modifyProjectTemplates - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		} catch (IOException e) {
			String desc = "IOException with modifyProjectTemplates";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return errorString;
	}
	
	public IStorage getProjectTemplatesDirectory() throws IOException {
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
		String indexFileContents;
		try{
			projectTemplatesIndex = _getProjectTemplatesIndex();
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
	
	private String makeProjectTemplateFolderName(String projectTemplateName, String authorEmail){
		return projectTemplateName + "_" + authorEmail;

	}
	
	// Return index of given template within the given templateArray
	// Matches if template names match and author emails match.
	private int findTemplateInArray(JSONArray templateArray, JSONObject templateToMatch, String emailToMatch){
		int found = -1;
		try{
			String nameToMatch = templateToMatch.getString("name");
			int count = templateArray.length();
			for(int i=0; i<count; i++){
				JSONObject template = templateArray.getJSONObject(i);
				String name = template.getString("name");
				String email = template.getString("authorEmail");
				if(name.equals(nameToMatch) && email.equals(emailToMatch)){
					found = i;
					break;
				}
			}
		} catch (JSONException e) {
			String desc = "findTemplateInArray - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return found;
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
	
	private void deleteDirectory(IStorage dir) throws IOException {
		IStorage[] file = dir.listFiles();
		for (int i = 0; i < file.length; i++) {
			if (file[i].isFile()) {
				IStorage f = file[i];
				f.delete();
			}
			if (file[i].isDirectory()) {
				deleteDirectory(file[i]);
			}
		}
		dir.delete();
	}
	
	private JSONObject cloneJSONObject(JSONObject originalObject){
		JSONObject returnObject;
		try{
			String temp = originalObject.toString();
			returnObject = new JSONObject(temp);
		} catch (JSONException e) {
			String desc = "Project Templates index file - not a valid json file";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		return returnObject;
	}

}