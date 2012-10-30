package org.davinci.ajaxLibrary;

public interface ILibraryManager {

	public String getDefaultRoot(String id, String version);

	public Library[] getAllLibraries();

	public Library getLibrary(String id, String version);
	
	public ILibraryFinder[] getLibraryFinders();

}