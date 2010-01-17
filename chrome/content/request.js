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
							var lvs = new Array();

							//count how many <TD s in response
							var tdcount = 0;
							var position = 0;
							while (1) {
								var tempposition = output.search("<TD");
								if(tempposition < 0) break;
								position = position + tempposition + 3;
								output = output.slice(tempposition + 3); //+3 so current "<TD" is skipped
								++tdcount;
							}
							var td_max = tdcount;  //how many <TD s in file
							
							//reset
							tdcount = 0;
							position = 0;
							output = xmlHttpObject.responseText;

							//find first lv
							do {
								var tempposition = output.search("<TD");
								position = position + tempposition + 3;
								output = output.slice(tempposition + 3); //+3 so current "<TD" is skipped
								//alert(tempposition + output);
								//alert(tdcount + output);
								tdcount++;
							} while (tdcount < 75);

							/* final array will look like this
								[0] = description
								[1] = lecturer
								[2] = mark
								[3] = link to smiley.gif
							*/
							//check if more to go (even on first)
							for (var i=0; td_max - tdcount > 4; ++i) {
								var current = new Array();
								lvs.push(current); // = lvs[i]
								var endposition = position + output.search("<") - 2; //-2 to remove \n and space
								var description = xmlHttpObject.responseText.substring(position + 2 + 1, endposition); //move +2 because we are at <TD and skip " >" // +1 to remove \n
								var position2 = output.search("TARGET=details>");
								//alert(position2);
								if(position2 == -1 || position2 > 150) { //just guessing that the next link must be further away
									//no link, just name of lecturer
									position2 = output.search("<I>");
									endposition = output.search("</I>");
									var lecturer = output.substring(position2 + 3, endposition); //+3 to skip <I>
								} else {
									//link for lecturer
									endposition = output.search("</A>");
									var lecturer = output.substring(position2 + 15, endposition); //+15 to skip TARGET=details>
									//alert(output);
									//alert(lecturer);
								}

								/* not working -> adjust parser before ... 
								//trim strings (remove leading/trailing whitespaces
								description.replace(/[\n\r]+/g,"");
								lecturer.replace(/[\n\r]+/g,"");
								description.replace(/^\s+|\s+$/g,"");
								lecturer.replace(/^\s+|\s+$/g,"");*/

								//add the results to the array
								lvs[i].push(description);
								lvs[i].push(lecturer);
								
								for(var k=0; k<13; ++k) {  //13 TDs further is next lv
									var tempposition = output.search("<TD");
									position = position + tempposition + 3;
									output = output.slice(tempposition + 3); //+3 so current "<TD" is skipped
									++tdcount; //TODO right number of counts?? - seems to work
								}
								//TODO: parse beurteilungsinfo -> mark and parse .gif
							}

							//test output
							var ausgabe = "";
							for (var i=0; i<lvs.length; ++i)
								ausgabe = ausgabe + "Name: " + lvs[i][0] + "\nLecturer: " + lvs[i][1] + "\n";
							alert(ausgabe);

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
