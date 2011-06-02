package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.Resource;
import org.davinci.server.user.User;

public class FindResource extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String pathStr = req.getParameter("path");
		String inFolder = req.getParameter("inFolder");
		boolean ignoreCase = "true".equals(req.getParameter("ignoreCase"));
		boolean workspaceOnly = "true"
				.equals(req.getParameter("workspaceOnly"));

		/* REMOVE ME BRAD DONT CHECK IN!!! */
		workspaceOnly = false;

		IVResource[] foundFiles = null;
		if (inFolder != null) {
			foundFiles = user.findFiles(pathStr, inFolder, ignoreCase,
					workspaceOnly);
		} else {
			foundFiles = user.findFiles(pathStr, ignoreCase, workspaceOnly);
		}

		this.responseString = Resource.foundVRsourcesToJson(foundFiles);

		//
		// IPath path = new Path(pathStr);
		//
		// ArrayList results=new ArrayList();
		//
		//
		// VResource rootDir = user.getUserDirectory();
		//
		// Links links = user.getLinks();
		// LibraryManager libraryManager =
		// ServerManager.getServerManger().getLibraryManager();
		//
		// if (isWildcard)
		// {
		// IOFileFilter filter;
		// if (path.segment(0).equals("*"))
		// {
		// IOCase ioCase = ignoreCase ? IOCase.INSENSITIVE : IOCase.SENSITIVE ;
		// filter=new NameFileFilter(path.lastSegment(),ioCase);
		// }
		// else
		// {
		// String lastSegment = path.lastSegment();
		// if (lastSegment.startsWith("*"))
		// filter = new SuffixFileFilter(lastSegment.substring(1));
		// else
		// filter=null;
		// }
		// // big todo here, have to remove the file filter
		// File f1 = null;
		// try {
		// f1 = new File(rootDir.getURI());
		// } catch (URISyntaxException e) {
		// // TODO Auto-generated catch block
		// e.printStackTrace();
		// }
		//
		//
		// results.addAll(FileUtils.listFiles(f1, filter,
		// TrueFileFilter.INSTANCE));
		// Link[] allLinks = links.allLinks();
		// for (int i = 0; i < allLinks.length; i++) {
		// File file = new File(allLinks[i].location);
		// results.addAll(FileUtils.listFiles(file, filter,
		// TrueFileFilter.INSTANCE));
		// }
		// if (!workspaceOnly)
		// libraryManager.findFiles(path,results);
		//
		// }else{
		// VResource file = user.getResource(pathStr);
		// if (file.exists())
		// results.add(file);
		//
		// }
		//
		//
		// JSONWriter jsonWriter=new JSONWriter(true);
		// for (Iterator iterator = results.iterator(); iterator.hasNext();) {
		// Object obj=iterator.next();
		// String virtualPath=null;
		// File file =null;
		// URL url=null;
		// if (obj instanceof File) {
		// file = (File) obj;
		// virtualPath=ResourceUtil.getVirtualPath(file, user);
		//
		// }
		// else if (obj instanceof URL){
		// url=(URL)obj;
		// virtualPath=libraryManager.virtualPath(url);
		//
		// }
		// jsonWriter.startObject().addField("file",
		// virtualPath).addFieldName("parents").startArray();
		// IPath filePath=new Path(virtualPath);
		//
		// int segmentCount=filePath.segmentCount();
		// jsonWriter.startObject().addField("name",".");
		// jsonWriter.addFieldName("members").startArray();
		// ResourceUtil.directoryListJSON(rootDir,"." ,user,jsonWriter);
		// jsonWriter.endArray().endObject();
		// for (int i=0;i<segmentCount;i++)
		// {
		// String segment=filePath.segment(i);
		// String dirPath=filePath.uptoSegment(i+1).toPortableString();
		// if (file!=null)
		// {
		// VResource dir=user.getResource(dirPath);
		// if (dir.isFile())
		// break;
		// jsonWriter.startObject().addField("name", segment);
		// jsonWriter.addFieldName("members").startArray();
		//
		// ResourceUtil.directoryListJSON(dir,dirPath ,user,jsonWriter);
		// }
		// else
		// {
		// if (!libraryManager.isDirectory(dirPath))
		// {
		// break;
		// }
		// jsonWriter.startObject().addField("name", segment);
		// jsonWriter.addFieldName("members").startArray();
		// libraryManager.listFiles(dirPath, jsonWriter);
		// }
		// jsonWriter.endArray().endObject();
		// }
		// jsonWriter.endArray().endObject();
		// }
		//
		// this.responseString= jsonWriter.getJSON();

	}

}
