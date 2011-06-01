package org.davinci.server.internal.command;

import java.io.File;
import java.io.IOException;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONReader;

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
		ZipOutputStream zos = null;
	    try {
			resp.setContentType("application/x-download"); //FIXME: is this a good mime type for zip?
			resp.setHeader("Content-Disposition", "attachment; filename=" + path);

	    	zos = new ZipOutputStream(resp.getOutputStream()); 
			zipFiles(files,  zos); 
			//responseString="OK";

	    } catch (IOException e) {
			responseString="Error creating download file : " + e;
			throw e;
		}finally{
			if(zos != null)zos.close();
		}
		
			
	}
	private void zipDir(IVResource zipDir,   ZipOutputStream zos) throws IOException {
			IVResource[] dirList = zipDir.listFiles(); 
	        zipFiles(dirList, zos);
	}

	private void zipFiles(IVResource[] files,  ZipOutputStream zos) throws IOException { 
	        byte[] readBuffer = new byte[2156]; // why 2156?
	        int bytesIn = 0; 
	        //loop through dirList, and zip the files 
	        for(int i=0; i<files.length; i++){ 
				if(files[i].isDirectory()){ 
					zipDir(files[i], zos); 
					continue; 
				}
				InputStream fis = null;
	            try {
					fis = new BufferedInputStream(files[i].getInputStreem());
					ZipEntry anEntry = new ZipEntry(files[i].getPath().toString()); 
					//place the zip entry in the ZipOutputStream object 
					zos.putNextEntry(anEntry); 
					//now write the content of the file to the ZipOutputStream 
					while((bytesIn = fis.read(readBuffer)) != -1){ 
					    zos.write(readBuffer, 0, bytesIn); 
					} 
					files[i].removeWorkingCopy();
				} finally {
					if(fis != null) fis.close();
				}
	        }
	    } 
 
}
