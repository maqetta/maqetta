package org.davinci.server.internal.command;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Vector;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletContext;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.ajaxLibrary.FileInfo;
import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONReader;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class Download extends Command {
	

	
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,	User user) throws IOException {
		if(user==null) return;
		
		String path=req.getParameter("fileName");
		String res=req.getParameter("resources");
		ArrayList  o = (ArrayList)JSONReader.read(res);
		String [] resources = (String[])o.toArray(new String[o.size()]);
		
		IVResource[] files = new IVResource[resources.length];
		for (int i = 0; i < files.length; i++) {
			files[i] =user.getResource(resources[i]);
		}
	    File userDir = null;
		try {
			userDir = new File(user.getWorkspace().getURI());
		} catch (URISyntaxException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	    try {
			resp.setContentType("application/x-download");
			resp.setHeader("Content-Disposition", "attachment; filename=" + path);

	    	ZipOutputStream zos = new ZipOutputStream(resp.getOutputStream()); 
			zipFiles(files,  zos); 
			zos.close();
			//responseString="OK";

	    } catch (IOException e) {
			responseString="Error createing download file : " + e;
		}finally{
			resp.getOutputStream().close();
		}
		
			
	}
	private void zipDir(IVResource zipDir,   ZipOutputStream zos){
			IVResource[] dirList = zipDir.listFiles(); 
	        zipFiles(dirList, zos);
	}

	private void zipFiles(IVResource[] files,  ZipOutputStream zos){ 
	        byte[] readBuffer = new byte[2156]; 
	        int bytesIn = 0; 
	        //loop through dirList, and zip the files 
	        for(int i=0; i<files.length; i++){ 
				if(files[i].isDirectory()){ 
					zipDir(files[i], zos); 
					continue; 
				}
	            try {
					InputStream fis = files[i].getInputStreem();
					ZipEntry anEntry = new ZipEntry(files[i].getPath().toString()); 
					//place the zip entry in the ZipOutputStream object 
					zos.putNextEntry(anEntry); 
					//now write the content of the file to the ZipOutputStream 
					while((bytesIn = fis.read(readBuffer)) != -1){ 
					    zos.write(readBuffer, 0, bytesIn); 
					} 
         //close the Stream 
					fis.close();
					files[i].removeWorkingCopy();
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} 
	        }
	    } 
 
}
