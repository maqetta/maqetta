package org.davinci.server.internal.command;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.Resource;
import org.davinci.server.ServerManager;
import org.davinci.server.VFile;
import org.davinci.server.IVResource;
import org.davinci.server.internal.Links;
import org.davinci.server.internal.Links.Link;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOCase;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.NameFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;

public class FindResource extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,	User user) throws IOException {
		String pathStr=req.getParameter("path");
		String inFolder=req.getParameter("inFolder");
		boolean ignoreCase="true".equals(req.getParameter("ignoreCase"));
		boolean isWildcard=pathStr.indexOf('*')>=0;
		boolean workspaceOnly="true".equals(req.getParameter("workspaceOnly"));
		IVResource[] foundFiles = null;
		if(inFolder!=null)
			foundFiles = user.findFiles(pathStr, inFolder, ignoreCase, workspaceOnly);
		else
			foundFiles = user.findFiles(pathStr, ignoreCase, workspaceOnly);
			
		
		this.responseString =Resource.foundVRsourcesToJson(foundFiles);
	
	
//
//		IPath path = new Path(pathStr);
//		
//		ArrayList results=new ArrayList();
//		
//
//		VResource rootDir = user.getUserDirectory();
//		
//		Links links = user.getLinks();
//		LibraryManager libraryManager = ServerManager.getServerManger().getLibraryManager();
//		
//		if (isWildcard)
//		{
//			IOFileFilter filter;
//			if (path.segment(0).equals("*"))
//			{
//				IOCase  ioCase = ignoreCase ? IOCase.INSENSITIVE : IOCase.SENSITIVE ;
//			  filter=new NameFileFilter(path.lastSegment(),ioCase);
//			}
//			else
//			{
//				String lastSegment = path.lastSegment();
//				if (lastSegment.startsWith("*"))
//					filter = new SuffixFileFilter(lastSegment.substring(1));
//				else
//					filter=null;
//			}
//			// big todo here,  have to remove the file filter
//			File f1 = null;
//			try {
//				f1 = new File(rootDir.getURI());
//			} catch (URISyntaxException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
//			
//			
//			results.addAll(FileUtils.listFiles(f1, filter, TrueFileFilter.INSTANCE));
//			Link[] allLinks = links.allLinks();
//			for (int i = 0; i < allLinks.length; i++) {
//				File file = new File(allLinks[i].location);
//				results.addAll(FileUtils.listFiles(file, filter, TrueFileFilter.INSTANCE));
//			}
//			if (!workspaceOnly)
//				libraryManager.findFiles(path,results);
//			
//		}else{
//			VResource file = user.getResource(pathStr);
//			if (file.exists())
//				results.add(file);
//			
//		}
//		
//
//		JSONWriter jsonWriter=new JSONWriter(true);
//		for (Iterator iterator = results.iterator(); iterator.hasNext();) {
//			Object obj=iterator.next();
//			String virtualPath=null;
//			File file =null;
//			URL url=null;
//			if (obj instanceof File) {
//				file = (File) obj;
//				virtualPath=ResourceUtil.getVirtualPath(file, user);
//				
//			}
//			else if (obj instanceof URL){
//				 url=(URL)obj;
//				virtualPath=libraryManager.virtualPath(url);
//				
//			}
//			jsonWriter.startObject().addField("file", virtualPath).addFieldName("parents").startArray();
//			IPath filePath=new Path(virtualPath);
//
//			int segmentCount=filePath.segmentCount();
//			jsonWriter.startObject().addField("name",".");
//			jsonWriter.addFieldName("members").startArray();
//			ResourceUtil.directoryListJSON(rootDir,"." ,user,jsonWriter);
//			jsonWriter.endArray().endObject();
//			for (int i=0;i<segmentCount;i++)
//			{
//				String segment=filePath.segment(i);
//				String dirPath=filePath.uptoSegment(i+1).toPortableString();
//				if (file!=null)
//				{
//					VResource dir=user.getResource(dirPath);
//					if (dir.isFile())
//						break;
//					jsonWriter.startObject().addField("name", segment);
//					jsonWriter.addFieldName("members").startArray();
//
//					ResourceUtil.directoryListJSON(dir,dirPath ,user,jsonWriter);
//				}
//				else
//				{
//					if (!libraryManager.isDirectory(dirPath))
//					{
//						break;
//					}
//					jsonWriter.startObject().addField("name", segment);
//					jsonWriter.addFieldName("members").startArray();
//					libraryManager.listFiles(dirPath, jsonWriter);
//				}
//				jsonWriter.endArray().endObject();
//			}
//			jsonWriter.endArray().endObject();
//		}
//		
//		this.responseString= jsonWriter.getJSON();

	}
	
	
	private void findFile(File dir, ArrayList results, IPath path,
			String fileExtension) {

		File[] files = dir.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (path.segmentCount()>1)
			{
				if (files[i].getName().equals(path.segment(0)))
				{
					findFile(files[i],results,path.removeFirstSegments(1),fileExtension);
					return;
				}
			}
			else
			{
				if (fileExtension==null)
				{
						if (path.lastSegment().equals(files[i].getName()))
						{
							results.add(files[i]);
							return;
						}
				}
				else
				{
					if (files[i].getName().endsWith(fileExtension))
					{
						results.add(files[i]);
					}
					else
						findFile(files[i],results,path,fileExtension);
				}
				
			}
		}
		
		
	}





	
	
}
