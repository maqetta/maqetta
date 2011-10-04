///
// \amd-mid build/transforms/compactCss
// 
// A function to compact CSS resources.
// 
// 
define(["../buildControl", "../fileUtils", "../stringify"], function(bc, fileUtils, stringify) {
	var
		catPath= fileUtils.catPath,
		getFilepath= fileUtils.getFilepath,
		getFiletype= fileUtils.getFiletype,
		compactPath= fileUtils.compactPath,

		externUid= 0,
		currentExternSet,
		destDirToExternSet= bc.destDirToExternSet= {},
		getSyntheticFilename= function(url) {
			if (currentExternSet[url]) {
				return currentExternSet[url];
			}
			if (!bc.resources[url]) {
				throw new Error("CSS referenced URL (" + url + ") was not included in resources.");
			}
			return (currentExternSet[url]= "_" + (++externUid) + getFiletype(url));
		},

		readCss= function(filename) {
			// read file filename, strip comments, split into lines, trim ws, return result
			var 
				content= bc.resources[filename],
				result= "",
				commentStart, commentEnd;
			if (typeof content=="undefined") {
				throw new Error("imported CSS file not found (" + filename + ")");
			}
			content= content.text;
			while (content.length) {
				commentStart= content.indexOf("/*");
				if (commentStart!=-1) {
					commentEnd= content.indexOf("*/", commentStart+2);
					if (commentEnd!=-1) {
						result+= content.substring(0, commentStart);
						content= content.substring(commentEnd+2);
					} else {
						throw new Error("comment unclosed in CSS file (" + filename + ")");
					}
				} else {
					result+= content;
					break;
				}
			}
			return stringify.split(result).map(function(line){return line.trim();});
		},


		compress= function(root, filename) {
			var result= "";
			filename= compactPath(filename.charAt(0)!="/" ? catPath(root, filename) : filename);
			var path= getFilepath(filename);
			readCss(filename).forEach(function(line) {
				var urlMatch= line.match(/(.*?)url\(\s*('|")?([^'"\:]+)('|")?\s*\)(.*)/);
											//					1						 2		 3				 4					5
				if (urlMatch) {
					var url= urlMatch[3];
					if (/^\s*@import\s*url/.test(line)) {
						result+= compress(path, url, path);
					} else {
						if (url.charAt(0)!="/") {
							url= compactPath(catPath(path, url));
						}
						result+= urlMatch[1] + "url(" + getSyntheticFilename(url) + ")" + urlMatch[5];
					}
				} else if (line.length) {
					result+= line;
				}
			});
			return result.replace(/\s*(\:|;|,|\{|\})\s*/g, "$1").replace(/\s\s+/g, " ");
		};

	return function(resource) {
		try {
			resource.compactDest= (typeof bc.compactCssSet[resource.src]=="string") ? bc.compactCssSet[resource.src] : resource.dest;
			var destDir= getFilepath(resource.compactDest);
			currentExternSet= destDirToExternSet[destDir] || (destDirToExternSet[destDir]= {});
			resource.compactText= compress("", resource.src);
			if (resource.compactDest==resource.dest) {
				resource.text= resource.compactText;
			}
		} catch (e) {
			return e;
		}
		return 0;
	};
});
