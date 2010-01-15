function onLaunch()
{
	//very wrong, just a place holder
	xmlDoc.load("login.xml");
	username = xmlDoc.getElementsByTagName("piswi_username")[0].childNodes[0];
	password = xmlDoc.getElementsByTagName("piswi_password")[0].childNodes[0];
	document.getElementById('piswi_username').value = username.nodeValue;
	document.getElementById('piswi_password').value = password.nodeValue;
}

function updateState()
{
	document.getElementById('auto_login').disabled = !document.getElementById('save_login').checked;
	if (document.getElementById('auto_login').disabled == true) document.getElementById('auto_login').checked = false;
}

function login()
{
	if (document.getElementById('save_login').checked == true)
	{
		//DOM tree and serialization will be moved into it's own function or will be placed after the two if's later when it finaly works
		//DOM tree creation
		var data = document.implementation.createDocument("", "", null);
		var usernameElem1 = data.createElement("piswi_username");
		usernameElem1.setAttribute("username", "test1"); //document.getElementById('piswi_username').value
		var passwordElem1 = data.createElement("piswi_password");
		passwordElem1.setAttribute("password", "test2"); //document.getElementById('piswi_password').value
		
		//serialization into a file... damn js and it's overly complicated serialization
		var serializer = XMLSerializer();
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile); // get profile folder
		file.append("extensions");   // extensions sub-directory
		file.append("piswirequest@taifun21.homelinux.org");   // GUID of your extension
		file.append("chrome");
		file.append("content");
		file.append("login.xml");   // filename - creates file in the into the last created directory - works
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);   // write, create, truncate
		serializer.serializeToStream(data, foStream, "");   // data is the DOM tree - not working currently
		foStream.close();

		alert('works');
	}
	if (document.getElementById('auto_login').checked == true)
	{
	
	}
}