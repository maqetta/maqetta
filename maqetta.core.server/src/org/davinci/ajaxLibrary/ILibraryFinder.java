package org.davinci.ajaxLibrary;

import java.net.URI;

public interface ILibraryFinder {

	
	ILibraryFinder getInstance(URI baseResource, String project);

	ILibInfo[] getLibInfo();
	
	void librarySettingsChanged(ILibInfo[] newSettings);
	
	
}
