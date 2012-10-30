package maqetta.core.server;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Properties;
import java.util.Set;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.ILibraryFinder;
import org.davinci.ajaxLibrary.LibInfo;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;

public class DojoLibraryFinder implements ILibraryFinder{

	private URI projectBase;
	private final String DOJO_CONFIG_FILE = "com.ibm.etools.webtools.dojo.core.prefs";
	private final String DOJO_VALIDATION_CONFIG_FILE = "org.eclipse.wst.validation.prefs";
	private final String[] simpleVersion = {"1,4","1.5", "1.6", "1.7"};
	Properties dojoProps;
	Properties dojoValidationProps;
	
	private String project;

	public DojoLibraryFinder(){
		
	}
	
	private DojoLibraryFinder(URI projectBase, String project){
		this.projectBase = projectBase;
		this.project = project;
	}
	
	public ILibraryFinder getInstance(URI baseResource, String project) {
		// TODO Auto-generated method stub
		IPath p = new Path(baseResource.getPath());
		String projectPiece = p.segment(p.segmentCount()-1);
		
		return new DojoLibraryFinder(baseResource, project);
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
	
	private Properties getPropertiesFromSettingsDirectory(String fileName){
		URI settings = appendPath(this.projectBase, "/" + IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		URI dojoConfig = appendPath(settings, "/" + fileName);
		
		Properties props = new OrderedProperties();
		try {
			props.load(dojoConfig.toURL().openStream());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			return null;
		} 
		return props;
	}
	
	private Properties getDojoProperties(){
		if(dojoProps==null){
			dojoProps = this.getPropertiesFromSettingsDirectory(DOJO_CONFIG_FILE);
		}
		return dojoProps;
	}
	
	private Properties getDojoValidationProperties(){
		if(dojoValidationProps==null){
			dojoValidationProps = this.getPropertiesFromSettingsDirectory(DOJO_VALIDATION_CONFIG_FILE);
		}
		return dojoValidationProps;
	}
	
	public ILibInfo[] getLibInfo() {
		Properties dojoProps = getDojoProperties();
		
		if(dojoProps==null)
			return new ILibInfo[0];
		
		String version = dojoProps.getProperty("dojo-version-attribute-name");
		String path = dojoProps.getProperty("dojo-root");
		IPath fullPath = new Path(path);
		String simplePath = fullPath.removeFirstSegments(1).toString();
		
		for(int i=0;i<simpleVersion.length;i++){
			if(version.indexOf(simpleVersion[i]) > -1){
				version = simpleVersion[i];
				break;
			}
		}
		ILibInfo[] result = new ILibInfo[1];
		result[0]= new LibInfo("dojo","dojo", version, simplePath, null);
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
		//Clean-up dojo preferences
		fixDojoPreferences(newSettings);
		
		//Clean up validation preferences
		fixDojoValidationPreferences(newSettings);
	}
	
	private File getSettingsFile(String fileName) {
		URI settings = appendPath(this.projectBase, "/" + IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		URI dojoConfig = appendPath(settings, "/" + fileName);
		File settingsFile = new File(dojoConfig);
		return settingsFile;
	}
	
	private void fixDojoPreferences(ILibInfo[] newSettings) {
		// need to re-write the dojo configuration file to match the new settings
		File settingsFile = this.getSettingsFile(DOJO_CONFIG_FILE);
		
		if(!settingsFile.exists()) return;
		
		for(int i=0;i<newSettings.length;i++){
			if(newSettings[i].getId().equalsIgnoreCase("dojo")){
				Properties dojoProps = this.getDojoProperties();
				String fullPath = "/" + this.project + "/" + newSettings[i].getVirtualRoot();
				dojoProps.setProperty("dojo-root", fullPath);
				dojoProps.setProperty("dojo-source-metadata-root", fullPath);

				try {
					
					dojoProps.store(new FileOutputStream(settingsFile), null);
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

	private void fixDojoValidationPreferences(ILibInfo[] newSettings) {
		// need to re-write the JavaScript validation config file to match the new settings
		File settingsFile = this.getSettingsFile(DOJO_VALIDATION_CONFIG_FILE);
		
		if(!settingsFile.exists()) return;
		
		for(int i=0;i<newSettings.length;i++){
			if(newSettings[i].getId().equalsIgnoreCase("dojo")){
				Properties dojoValidationProps = this.getDojoValidationProperties();
				String path = newSettings[i].getVirtualRoot();

				Set<Object> keySet = dojoValidationProps.keySet();
				Iterator<Object> itr = keySet.iterator(); 
		
				String[] regexes = 
					{
						//pattern 1
						 "file128\\S+/ibm_soap" +
						 "F0204file125\\S+/dijit" +
						 "F0204file124\\S+/dojo" +
						 "F0204file124\\S+/util" +
						 "F0204file125\\S+/dojox" +
						 "F02",
						 //pattern 2
						 "file128\\S+/ibm_soap" + 	
						 "F02113projectNature134org.eclipse.jst.j2ee.ejb.EJBNature04file125\\S+/dijit" +
						 "F0207pattern124.*/META-INF/ibmconfig/.*F04file124\\S+/dojo" + 
						 "F0204file08.projectT01113projectNature130org.eclipse.jst.j2ee.EARNature04file124\\S+/util" +
						 "F0204file125\\S+/dojoxF0204"
					};

				String[] replacements = 
					{	//replacement 1
						"file128" + path + "/ibm_soap" + 
						"F0204file125" + path + "/dijit" +
						"F0204file124" + path + "/dojo" +
						"F0204file124" + path + "/util" +
						"F0204file125" + path + "/dojox" + 
						"F02",
						//replacement 2
						"file128" + path + "/ibm_soap" + 	
						"F02113projectNature134org.eclipse.jst.j2ee.ejb.EJBNature04file125" + path + "/dijit" +
						"F0207pattern124.*/META-INF/ibmconfig/.*F04file124" + path + "/dojo" + 
						"F0204file08.projectT01113projectNature130org.eclipse.jst.j2ee.EARNature04file124" + path + "/util" +
						"F0204file125" + path + "/dojoxF0204"
					};
				
				while(itr.hasNext()) {
					String key = (String)itr.next();
					if (key.endsWith("groups")) {
						String value = dojoValidationProps.getProperty(key);
						for(int j=0;j<regexes.length;j++){
							value = value.replaceAll(regexes[j], replacements[j]);
						}
						dojoValidationProps.setProperty(key, value);
					}
				}
				
				try {
					dojoValidationProps.store(new FileOutputStream(settingsFile), null);
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
	
	/* This is a very simple class for the purpose of trying to keep entries in properties 
	 * files in the same order. This is being done solely to facilitating comparison with 
	 * files generated by Eclipse for debugging.
	 * 
	 * It's not been made fully robust, and is _not_ intended to be used outside of this narrow 
	 * purpose. For example, it does not handle key removal. So, just tucking it in here as a 
	 * simple private utility class.
	 */
	private class OrderedProperties extends Properties {
		private static final long serialVersionUID = 1L;

		public OrderedProperties() {
		}
	 
		private final LinkedHashSet<Object> keys = new LinkedHashSet<Object>();
	 
		public Set<Object> keySet() { 
			return keys; 
		}
	 
		public Enumeration<Object> keys() {
			return Collections.<Object> enumeration(keys);
		}
	 
		public Object put(Object key, Object value) {
			keys.add(key);
			return super.put(key, value);
		}
		
		/* I wouldn't have though we'd need to override store as I thought the base
		 * implementation in Properties would have have called keys() or keySet() and
		 * iterated over the ordered result. But, the base implementation of store messes 
		 * up the order when it writes the file.
		 */ 
		public void store(OutputStream out, String comments) throws IOException {
			BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(out, "8859_1"));
			
			if (comments != null) {
				writer.write("# " + comments);
				writer.newLine();
			}
			writer.write("#" + new Date().toString());
			writer.newLine();
			Set<Object> keySet = keySet();
			Iterator<Object> itr = keySet.iterator(); 
			while(itr.hasNext()) {
				String key = (String)itr.next();
				String value = getProperty(key);
				writer.write(key + "=" + value);
				writer.newLine();
			}
			writer.flush();
		}
	}
}

