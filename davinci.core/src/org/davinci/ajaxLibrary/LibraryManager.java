package org.davinci.ajaxLibrary;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Vector;

import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.internal.IRegistryListener;
import org.davinci.server.util.JSONWriter;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.osgi.framework.Bundle;

public class LibraryManager {

	Library[] installedLibraries;
	/*
	static class BundleInfo{
		Bundle bundle;
		IPath path;
		BundleInfo ( Bundle bundle, IPath path){
			this.bundle=bundle;
			this.path=path;
		}
	}
	*/
	public LibraryManager() {
		initialize();

		Activator.getActivator().addRegistryChangeListener(new IRegistryListener() {
			public void registryChanged() {
				initialize();
			}
		});
	}

    
    class BundleLibraryInfo extends Library{
        Bundle bundleBase;
        String basePath;
        
        BundleLibraryInfo(String ID, String version, String basePath, String defaultRoot, URL bundleBase, MetaData metadata){
        	this.ID = ID;
        	this.version = version;
        	this.basePath = basePath;
        	
        }
        BundleLibraryInfo(String id, String version){
        	this.ID = id;
        	this.version = version;
        }
        public void setBasePath(String basePath, String defaultRoot) {
			this.basePath = basePath;
			this.defaultRoot = defaultRoot;
		}
        
		public URL[] find( String path) {
			IPath p1 = new Path(this.basePath).append(path);
			String name = p1.lastSegment();
			IPath newBase = p1.removeLastSegments(1);
			
			Enumeration e = this.bundleBase.findEntries(newBase.toString(), name, false);
			Vector found = new Vector();
			while(e!=null && e.hasMoreElements()){
				
				found.add(e.nextElement());
			}
			return (URL[])found.toArray(new URL[found.size()]);
		}
	
		
		private URL getUri(String base, String path) {
			IPath basePath = new Path(base);
			IPath fullPath = basePath.append(path);
			try {
				URL entry = this.bundleBase.getEntry(fullPath.toString());
				if(entry!=null)
					return entry;
				
				System.out.println("Library file not found! :" + fullPath);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return null;
		}
		
		private URL[] listUri(String base, String path) {
			IPath basePath = new Path(base);
			IPath fullPath = basePath.append(path);
			Vector results = new Vector();
			Enumeration e =  (this.bundleBase.findEntries(fullPath.toString(), "*", false));
			
			while(e.hasMoreElements()){

				results.add(e.nextElement());
			}
			
			return (URL[])results.toArray(new URL[results.size()]);
		}
		
		public String getMetadata() {
			if(this.metadatapath==null)
				return "";
			URL metadata= this.bundleBase.getEntry(this.metadatapath);
			InputStream stream = null;
			try {
				stream = metadata.openStream();
			} catch (MalformedURLException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			StringBuffer out = new StringBuffer();
		    byte[] b = new byte[4096];
		    try {
				for (int n; (n = stream.read(b)) != -1;) {
				    out.append(new String(b, 0, n));
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return out.toString();
		}
		public URL getURL(String path) {
			// TODO Auto-generated method stub
			return this.getUri(this.basePath,path);
		}
		public URL[] listURL(String path) {
			return this.listUri(this.basePath,path);
		}

    }
    
    
    
    
    Library findLibrary(String id, String version){
    	for(int i = 0;i<installedLibraries.length;i++){
			if(installedLibraries[i]!=null && installedLibraries[i].getID().equals(id) &&  installedLibraries[i].getVersion().equals(version)){
				return installedLibraries[i];
			}
		}
    	return null;
    }
    
    public String getDefaultRoot(String id, String version){
    	Library l = findLibrary(id,version);
    	return l.defaultRoot;
    }
    
	void initialize(){
		List extensions = ServerManager.getServerManger().getExtensions(IDavinciServerConstants.EXTENSION_POINT_AJAXLIBRARY,  IDavinciServerConstants.EP_TAG_AJAXLIBRARY);
		this.installedLibraries = new Library[extensions.size()];
		int count = -1;
		for (Iterator iterator = extensions.iterator(); iterator.hasNext();) {
			count++;
			IConfigurationElement libraryElement = (IConfigurationElement) iterator.next();
			String id = libraryElement.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_ID);
			String version = libraryElement.getAttribute(IDavinciServerConstants.EP_ATTR_METADATA_VERSION);
			
			if(id==null || version==null || id.equals("") || version.equals("")){
				System.err.println("Problem reading library data, no ID or Version defined :" + libraryElement.getName());
				
			}
			Library libInfo = findLibrary(id, version);
			
			if(libInfo==null){
				libInfo = new BundleLibraryInfo(id, version);
				this.installedLibraries[count] = libInfo;
			}
			
			IConfigurationElement[] libraryPathElements = libraryElement.getChildren(IDavinciServerConstants.EP_TAG_LIBRARYPATH);
			
			for (int i=0;i<libraryPathElements.length;i++) {
				String virtualPath = libraryPathElements[i].getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_NAME);
				String bundlePath = libraryPathElements[i].getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_LOCATION);
				((BundleLibraryInfo)libInfo).setBasePath(bundlePath,virtualPath);
			}
			if(libInfo instanceof BundleLibraryInfo){
				((BundleLibraryInfo)libInfo).bundleBase = getLibraryBundle(libraryElement);
			}
			
			
			
			IConfigurationElement[] meta = libraryElement.getChildren("metadata");
			for(int i=0;i<meta.length;i++)
				libInfo.setMetadataPath(meta[i].getAttribute("location"));
			
		
			//libInfo.setMetadata( new MetaData(libraryElement));
		}
		
	}

	private Bundle getLibraryBundle(IConfigurationElement configElement){		
			String name = configElement.getDeclaringExtension().getContributor().getName();
			return Activator.getActivator().getOtherBundle(name);
		
	}
	

	public Library[] getAllLibraries(){
		return this.installedLibraries;
	}

	public Library getLibrary(String id, String version){
		for(int i=0;i<this.installedLibraries.length;i++){
			if(this.installedLibraries[i].getID().equals(id) && this.installedLibraries[i].getVersion().equals(version))
				return this.installedLibraries[i];
		}
		return null;
	}
	/*
	private void findFiles(IPath path, Collection  results){
		String findPath=path.lastSegment();
		for (Iterator iterator = this.libraryPaths.keySet().iterator(); iterator.hasNext();) {
			String  libraryPath = (String ) iterator.next();
			IConfigurationElement configElement=(IConfigurationElement)this.libraryPaths.get(libraryPath);
			String name = configElement.getDeclaringExtension().getContributor().getName();
			Bundle bundle=Activator.getActivator().getOtherBundle(name);
			if (bundle!=null)
			{
				IPath locPath=new Path(configElement.getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_LOCATION));
				 Enumeration  e = bundle.findEntries(locPath.toString(), findPath, true);
				 if (e!=null)
					 while (e.hasMoreElements())
						 results.add(e.nextElement());
					 
		}
		}
	}
	
	
	public FileInfo[] dirList(IPath filePath){
		Vector result = new Vector();
		BundleInfo bundleInfo=this.findBundle(filePath);
		if (bundleInfo!=null){
			Enumeration  e = bundleInfo.bundle.findEntries(bundleInfo.path.toString(), "*", false);
			 while ( e!=null && e.hasMoreElements()){
			 	URL url= (URL) e.nextElement();
			 	String s=url.getPath();
			 	IPath fileName = new Path(s);
			 	fileName =  fileName.removeFirstSegments(fileName.matchingFirstSegments(bundleInfo.path));
				try {
					FileInfo fi = new FileInfo( url.toURI(), filePath.append(fileName));
					result.add(fi);
				} catch (URISyntaxException e1) {
					//e1.printStackTrace();
				}
			}
		}
		return (FileInfo[])result.toArray(new FileInfo[result.size()]);			
	}
	
	public void listFiles(String filePath,JSONWriter jsonWriter){
		if (".".equals(filePath))
		{
			for (Iterator iterator = this.libraryPaths.keySet().iterator(); iterator.hasNext();) {
				String path = (String) iterator.next();
				jsonWriter.startObject().addField("name",path).addField("isLib",true).addField("isReadOnly",true).endObject();
			}
		}
		else
		{
			
			BundleInfo bundleInfo=this.findBundle(new Path(filePath));
				if (bundleInfo!=null)
				{
					 Enumeration  e = bundleInfo.bundle.findEntries(bundleInfo.path.toString(), "*", false);

					 while ( e.hasMoreElements())
					 {
						 	URL url= (URL) e.nextElement();
						 	String s=url.getPath();
						 	String fileName = new Path(s).lastSegment().toString();
						 	if (fileName.equals(".svn"))
						 		continue;
							 Enumeration  e2 = bundleInfo.bundle.findEntries(bundleInfo.path.append(fileName).toString(), "*", false);
							boolean isDir = (e2!=null && e2.hasMoreElements());
							jsonWriter.startObject().addField("name",fileName).addField("isLib",isDir).addField("isReadOnly",true).endObject();
					 }

				}
					
		}
	}
	
	public boolean isDirectory(String path)
	{
		BundleInfo bundleInfo=this.findBundle(new Path(path));
		if (bundleInfo!=null)
		{
			 Enumeration  e2 = bundleInfo.bundle.findEntries(bundleInfo.path.toString(), "*", false);
				return  (e2!=null && e2.hasMoreElements());
			
		}
		return false;
	}
	
	public String virtualPath(URL url)
	{
		String path=null;
		for (Iterator iterator = this.libraryPaths.keySet().iterator(); iterator.hasNext();) {
			String  libraryPath = (String ) iterator.next();
			IConfigurationElement configElement=(IConfigurationElement)this.libraryPaths.get(libraryPath);
			String name = configElement.getDeclaringExtension().getContributor().getName();
			Bundle bundle=Activator.getActivator().getOtherBundle(name);
			if (bundle!=null)
			{
				IPath locPath=new Path(configElement.getAttribute(IDavinciServerConstants.EP_ATTR_LIBRARYPATH_LOCATION));
				URL resourceURL=bundle.getEntry(locPath.toString());
				if (url.toString().startsWith(resourceURL.toString()))
				{
					String remainingPath=url.toString().substring(resourceURL.toString().length());
					return libraryPath+"/"+remainingPath;
				}
			}
		}
		return path;
	}
	
	public String metadataJSON()
	{
		StringBuffer sb=new StringBuffer("[");
		boolean first=true;
		for (Iterator iterator = this.metadata.iterator(); iterator.hasNext();) {
			MetaData metadata = (MetaData) iterator.next();
			if (!first)
				sb.append(", ");
			first=false;
			sb.append(metadata.toJSON());
		}
		sb.append("]");
		return sb.toString();
	}
	*/
}
