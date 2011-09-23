package org.maqetta.server;

import java.util.List;

public interface ILinks {

	public List findLinks(String path);

	public ILink isLinkTarget(String path);

	public String findPath(String path);

	public ILink hasLink(String path);

	public boolean addLink(String path, String location, int type);

	public ILink[] allLinks();

	public boolean removeLink(String path);

}