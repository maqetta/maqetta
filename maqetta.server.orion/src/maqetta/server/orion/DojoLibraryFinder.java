package maqetta.server.orion;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Properties;


import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.ILibraryFinder;
import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.ajaxLibrary.LibInfo;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;
import org.osgi.framework.Bundle;

public class DojoLibraryFinder implements ILibraryFinder{

	private URI projectBase;
	private final String DOJO_CONFIG_FILE = "org.ibm.etools.webtools.dojo.core.prefs";
	private final String[] simpleVersion = {"1,4","1.5", "1.6", "1.7"};
	Properties dojoProps;
	
	private String project;
	
	
	public DojoLibraryFinder(){
		
	}
	
	private DojoLibraryFinder(URI projectBase, String project){
		this.projectBase = projectBase;
		this.project = project;
	}
	
	public ILibraryFinder getInstance(URI baseResource) {
		// TODO Auto-generated method stub
		IPath p = new Path(baseResource.getPath());
		String projectPiece = p.segment(p.segmentCount()-1);
		
		return new DojoLibraryFinder(baseResource, projectPiece);
	}

	private static URI appendPath(URI u, String piece){
		try {
			return new URI(u.getScheme(),u.getAuthority(),u.getPath() + piece,u.getQuery(),u.getFragment());
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	private Properties getProperties(){
		
		if(dojoProps==null){
			URI settings = appendPath(this.projectBase, "/" + IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
			URI dojoConfig = appendPath(settings, "/" +DOJO_CONFIG_FILE );
			
			dojoProps = new Properties();
			try {
				dojoProps.load(dojoConfig.toURL().openStream());
			} catch (IOException e) {
				// TODO Auto-generated catch block
				return null;
			} 
		}
		return dojoProps;
	}
	
	public ILibInfo[] getLibInfo() {
		Properties dojoProps = getProperties();
		
		if(dojoProps==null)
			return new ILibInfo[0];
		
		String version = dojoProps.getProperty("dojo-version-attribute-name");
		String path = dojoProps.getProperty("dojo-root");
		for(int i=0;i<simpleVersion.length;i++){
			if(version.indexOf(simpleVersion[i]) > -1){
				version = simpleVersion[i];
				break;
			}
		}
		ILibInfo[] result = new ILibInfo[1];
		result[0]= new LibInfo("dojo","dojo", version, path);
		return result;
	}
	
	private static String readFile(URI path){
		   
		  String result = "";
		   try {
			    BufferedReader in = new BufferedReader(new InputStreamReader(path.toURL().openStream()));
			    String str;
			    while ((str = in.readLine()) != null) {
			        // str is one line of text; readLine() strips the newline character(s)
			    	result+= str + "\n";
			    }
			    in.close();
			
			} catch (IOException e) {
			}
		   
		   return result;
	}


	public void librarySettingsChanged(ILibInfo[] newSettings) {
		// need to re-write the dojo configuration file to match the new settings
		URI settings = appendPath(this.projectBase, "/" + IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		URI dojoConfig = appendPath(settings, "/" +DOJO_CONFIG_FILE );
		File settingsFile = new File(dojoConfig);
		
		if(!settingsFile.exists()) return;
		
		for(int i=0;i<newSettings.length;i++){
			if(newSettings[i].getId().equalsIgnoreCase("dojo")){
				Properties dojoProps = this.getProperties();
				String fullPath = "/" + this.project + "/" + newSettings[i].getVirtualRoot();
				dojoProps.setProperty("dojo-root", fullPath);
				dojoProps.setProperty("dojo-source-metadata-root", fullPath);
				
			
				
				try {
					
					dojoProps.store(new FileOutputStream(settingsFile), "");
				} catch (MalformedURLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				return;
			}
		}
		
	}

}
