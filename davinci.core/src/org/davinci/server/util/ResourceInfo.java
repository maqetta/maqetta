package org.davinci.server.util;

import java.io.File;
import java.util.ArrayList;

import org.davinci.server.IDavinciServerConstants;
import org.w3c.dom.Element;

public class ResourceInfo  extends XMLFile 
{

	
	public static class ResourceInfoEntry {
		public String path;
		String type;
		public String parentPath;
		public String name;
		public Object[] data;
		ResourceInfoEntry(String path, String type)
		{
			this.path=path;
			this.type=type;
			
			int inx=this.path.lastIndexOf('/');
			if (inx<0)
			{
				this.parentPath="";
				this.name=path;
			}
			else
			{
				this.parentPath=this.path.substring(0,inx);
				this.name=this.path.substring(inx+1);
			}
		}
	}
	
	ResourceInfoEntry[] resourceInfos;
	File infoFile;
	
	public ResourceInfo(File dir)
	{
	}
	
	public void loadResourceInfo(File settingsDir)
	{
		 infoFile=new File(settingsDir,IDavinciServerConstants.LINKS_FILE);
		ArrayList list=this.load(infoFile);
		resourceInfos=(ResourceInfoEntry[])list.toArray(new ResourceInfoEntry[list.size()]);
	}
	
	
	protected Object createObject(Element element, String[] attributes) {
		String path=attributes[0];
		String type=attributes[1];
		ResourceInfoEntry entry=new ResourceInfoEntry(path, type);
		ArrayList objects = this.loadAny(element);
		entry.data= objects.toArray();
		return entry;
	}

	protected String[] getAttributeNames() {
		return new String[]{"path","type"};
	}

	protected String[] getAttributeValues(Object object) {
		ResourceInfoEntry entry=(ResourceInfoEntry)object;
		return new String[]{entry.path,entry.type};
	}

	protected String getElementTag() {
		return "resource";
	}

	protected String getRootTag() {
		return "resourceInfo";
	}

	@Override
	protected void saveElementAddition(Element element, Object value) {
		ResourceInfoEntry entry=(ResourceInfoEntry)value;
		this.saveAny(element, entry.data);
	}

}
