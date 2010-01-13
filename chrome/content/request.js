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

    var kennwort = "KENNWORT"; //TODO
    var matnr = "0804616";
    // Funktion, die bei Statusänderungen reagiert
    function handleStateChange()
    {
 //       alert(xmlHttpObject.responseText);
	if(xmlHttpObject.readyState == 4) {
		if(xmlHttpObject.status == 200) {
			var returnstring = xmlHttpObject.responseText;
			//alert(returnstring);
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
					if(xmlHttpObject.status == 200) { //logged in
						xmlHttpObject.open('POST', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
						xmlHttpObject.setRequestHeader('Connection','keep-alive');
						xmlHttpObject.setRequestHeader('Referer','http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
						xmlHttpObject.setRequestHeader('imnr',matnr);
						xmlHttpObject.setRequestHeader('ikenn',kennwort);
						xmlHttpObject.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
						xmlHttpObject.setRequestHeader('Content-Length', 94);
						xmlHttpObject.onreadystatechange = function (bEvt) {
							if (xmlHttpObject.readyState == 4) {
								if(xmlHttpObject.status == 200) { //displaying my lvs with description + mark
									infoReceived();
								} else 
									alert("Error loading page\n");
							}
						}
						xmlHttpObject.send("iknr=521&ipkt=0&ilv=&iaus=M&ise=2009W&iord=A&ilek=On&inot=On&imod=O&isid="+isid+"1");
						//using DOM to modify the xul-file and insert the information
						function infoReceived() {
							var samplepopup = document.getElementById('showpiswires');
							var output = xmlHttpObject.responseText;

							//search string for first course
							var tdcount = 0;
							var position = 0;
							do {
								var tempposition = output.search("<TD");
								position = position + tempposition + 3;
								output = output.slice(tempposition + 3); //+3 so current "<TD" is skipped
								//alert(tempposition + output);
								//alert(tdcount + output);
								tdcount++;
							} while (tdcount < 75);
							var endposition = position + output.search("</TD");
							position = position -3; //remove first +3 because none was added in the beginning
							var inhalt = xmlHttpObject.responseText.substring(position, endposition);
							alert(inhalt);
							/*var output = xmlHttpObject.responseXML;

							var tds = output.getElementsByTagName("TD");
							var first_course = tds.item(199);
							alert(first_course.childNodes.item(0).nodeValue);*/
						}
					} else
						alert("Error loading page\n");  
				}
			};
			xmlHttpObject.send("imnr="+matnr+"&ikenn="+kennwort+"&isid="+isid+"&imod="+imod);
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
