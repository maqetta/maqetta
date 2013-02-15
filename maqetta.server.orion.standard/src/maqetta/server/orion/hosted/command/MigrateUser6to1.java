package maqetta.server.orion.hosted.command;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.util.VResourceUtils;
import maqetta.server.orion.user.OrionUser;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.StorageFileSystem;

public class MigrateUser6to1 extends Command {

    
	/*
	 * If user workspace doesn't exist, always returns NO_WORKSPACE so the client can redirect before issuing a migrate.
	 * 
	 */
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	String migrate = req.getParameter("migrate");
        File oldWorkspace = getOldWorkspace(user);
    	if(oldWorkspace==null){
    		this.responseString = "NO_WORKSPACE";
    		return;
    	}
    	
    	if(migrate!=null){
    		/* Copy user files */
    			migrateUser(user);
    			user.rebuildWorkspace();
    			this.responseString="OK";
    			return;
    			
    	}
    	this.responseString="WORKSPACE_EXISTS";
    	
    }

    private void migrateUser(IUser user) throws IOException {
    	File oldWorkspace = getOldWorkspace(user);
    	OrionUser orionUser = (OrionUser)user;
    	IStorage workspace = new StorageFileSystem(oldWorkspace);
    	IStorage[] files = workspace.listFiles();
    	for(int i=0;i<files.length;i++){
    		if(".settings".equals(files[i].getName())) continue;
    		IVResource project = orionUser.createOrionProject(files[i].getName());
    		//IStorage file = user.getUserDirectory().newInstance(project.getPath());
    		 IStorage file =user.getUserDirectory().newInstance(project.getPath());
    		copyDirectory(files[i], file);
    	}
    	
    }
    
    public String getOldWorkspaceLocation(){
    	return  ServerManager.getServerManager().getDavinciProperty("migrateWorkspaceLoc");
    }
    
    private File getOldWorkspace(IUser user){
    	String email = user.getPerson().getEmail();
    	String absoluteWorkspace =getOldWorkspaceLocation();
    	if(absoluteWorkspace!=null){
    		IPath filePath = new Path(absoluteWorkspace).append(email);
    		return new File(filePath.toOSString());
    	}
    	
    	return null;
    }
    
    public static void copyDirectory(IStorage source, IStorage destination) throws IOException {
		IStorage[] list = source.listFiles();
		
		for (int i = 0; i < list.length; i++) {
			if(list[i].isDirectory() ){
				 
				
				IStorage newFile = destination.newInstance( destination, list[i].getName());
				newFile.mkdir();
				
				copyDirectory(list[i],newFile);
			}else{
				IStorage newFile = destination.newInstance(destination, list[i].getName());
				
				InputStream in = null;
				OutputStream out = null;
				try{
					in = list[i].getInputStream();
					out = newFile.getOutputStream();

					byte[] buf = new byte[1024];
					int len;
					while ((len = in.read(buf)) > 0) {
						out.write(buf, 0, len);
					}
					
				} catch (IOException e) {
					
					e.printStackTrace();
				}finally{
					if(in != null)
						try {
							in.close();
							if(out != null) out.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					
				}
			}

		}
	}
}