package org.maqetta.server;

import java.io.IOException;
import java.util.List;

public interface ILinks {

	public List findLinks(String path);

	public ILink isLinkTarget(String path);

	public String findPath(String path);

	public ILink hasLink(String path);

	public boolean addLink(String path, String location, int type) throws IOException;

	public ILink[] allLinks();

	public boolean removeLink(String path) throws IOException;

}