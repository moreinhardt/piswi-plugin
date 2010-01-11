var openprefs = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
  },

  onMenuItemCommand: function() {
    window.open("chrome://piswi/content/piswiprefs.xul", "", "chrome");
  }
};

window.addEventListener("load", function(e) { openprefs.onLoad(e); }, false);


var piswirequest = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
  },

  onMenuItemCommand: function() {
//HIER beginnts!!
    var xmlHttpObject = new XMLHttpRequest();

    // Funktion, die bei Statusänderungen reagiert
    function handleStateChange()
    {
 //       alert(xmlHttpObject.responseText);
	if(xmlHttpObject.readyState == 4) {
		if(xmlHttpObject.status == 200) {
			var returnstring = xmlHttpObject.responseText;
			alert(returnstring);
			var id_anfang = returnstring.search(/NAME=isid/);
			var isid = returnstring.slice(id_anfang + 17, id_anfang + 17 + 20);
			var imod_anfang = returnstring.search(/NAME=imod/);
			var imod = returnstring.slice(imod_anfang + 16, imod_anfang + 16 + 1);
			//alert("isid: "+isid);
			//alert("imod: "+imod);

			xmlHttpObject.open('POST', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
			xmlHttpObject.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xmlHttpObject.setRequestHeader('Content-length', 60);
			xmlHttpObject.setRequestHeader('Connection','keep-alive');
//			xmlHttpObject.setRequestHeader('Referer','http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
			xmlHttpObject.onreadystatechange = function (aEvt) {  
				if (xmlHttpObject.readyState == 4) {  
					if(xmlHttpObject.status == 200)
						alert(xmlHttpObject.responseText);
					else
						alert("Error loading page\n");  
				}
			}; //TODO KENNWORT
			xmlHttpObject.send("imnr=0804616&ikenn=KENNWORT&isid="+isid+"&imod="+imod);

		} else alert("error loading page!");
	}
    }
	xmlHttpObject.open('GET', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
	xmlHttpObject.setRequestHeader('Connection','keep-alive');
	xmlHttpObject.send(null);


        // Handler hinterlegen
        xmlHttpObject.onreadystatechange = handleStateChange;
  }
};

window.addEventListener("load", function(e) { piswirequest.onLoad(e); }, false); 
