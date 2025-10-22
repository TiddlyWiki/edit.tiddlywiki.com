/*\
title: $:/plugins/yourname/resolvepath.js
type: application/javascript
module-type: filteroperator

Filter operator `resolvepath[basePath]`
Takes relative paths from the input and resolves them against `basePath`,
normalizing ".", "..", collapsing consecutive slashes, and preventing climbing above repo root.
Works in both browser and Node.js.
\*/
exports.resolvepath = (source, operator, options) => {
	const results = [],
		fakeRoot = "file:///repo-root/",
		basePath = operator.operand || "";

	source((tiddler, relPath) => {
		try {
			// Normalize relative path by collapsing multiple slashes
			relPath = relPath.replace(/\/+/g, "/");

			// Use URL to resolve safely in both browser and Node
			const resolvedUrl = new URL(relPath, new URL(basePath + "/", fakeRoot));

			// Strip the fake root prefix to get repo-rooted path
			let path = resolvedUrl.pathname.replace(/^\/repo-root\//, "");

			// Clamp to repo root
			if(path.startsWith("/")) {
				path = path.slice(1);
			}

			// Decode percent-encoded characters (e.g. %20 -> space)
			try {
				path = decodeURIComponent(path);
			} catch(e) {
				// if decoding fails, keep the encoded form
			}

			results.push(path);
		} catch(e) {
			// fallback: if invalid URL, just return the normalized relative path
			results.push(relPath);
		}
	});
	return results;
};
