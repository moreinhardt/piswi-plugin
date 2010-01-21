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
  prefs: null,
  kennwort:  "",
  matnr:  "",

  startup: function() {
    // initialization code
    // Register to receive notifications of preference changes
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch("piswirequest.");
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("", this, false);

    this.matnr = this.prefs.getCharPref("login");
    this.kennwort = this.prefs.getCharPref("pw");

    this.initialized = true;
  },

  shutdown: function() {
    this.prefs.removeObserver("", this);
  },

  observe: function(subject, topic, data) {
    if ( topic != "nsPref:changed") 
      return;
    switch(data) {
      case "login":
        this.matnr = this.prefs.getCharPref("login");
        break;
      case "pw":
        this.kennwort = this.prefs.getCharPref("pw");
        break;
    }
  },

  

  onMenuItemCommand: function() {
    //dynamically adjusting the xul-interface
    //remove any hbox-elements (previous results) but not piswi-logo
    var samplepopup = document.getElementById('showpiswires');
    while(samplepopup.lastChild != samplepopup.firstChild)
	samplepopup.removeChild(samplepopup.lastChild);
    const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var hbox_loading = document.createElementNS(XUL_NS, "hbox");
    samplepopup.appendChild(hbox_loading);
    var loadingpic = document.createElementNS(XUL_NS, "image");
    var loading = document.createElementNS(XUL_NS, "description");
    loadingpic.setAttribute("src", "chrome://piswi/content/load.gif");
    loading.setAttribute("value", " Retrieving information ... ");
    hbox_loading.appendChild(loadingpic);
    hbox_loading.appendChild(loading);
    //end adjusting xul-interface

//HIER beginnts!!
    var xmlHttpObject = new XMLHttpRequest();

    var kennwort = piswirequest.kennwort;
    var matnr = piswirequest.matnr;
    // Funktion, die bei Statusänderungen reagiert
    function handleStateChange()
    {
	if(xmlHttpObject.readyState == 4) {
		if(xmlHttpObject.status == 200) {
			var returnstring = xmlHttpObject.responseText;
			var id_anfang = returnstring.search(/NAME=isid/);
			var isid = returnstring.slice(id_anfang + 17, id_anfang + 17 + 20);
			var imod_anfang = returnstring.search(/NAME=imod/);
			var imod = returnstring.slice(imod_anfang + 16, imod_anfang + 16 + 1);

			xmlHttpObject.open('POST', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
			xmlHttpObject.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xmlHttpObject.setRequestHeader('Content-length', 60);
			xmlHttpObject.setRequestHeader('Connection','keep-alive');
//			xmlHttpObject.setRequestHeader('Referer','http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
			xmlHttpObject.onreadystatechange = function (aEvt) {  
				if (xmlHttpObject.readyState == 4) {  
					if(xmlHttpObject.status == 200) { //logged in
						//test if login failed
						if(xmlHttpObject.responseText.search("Du hast eine falsche Matrikelnummer") != -1) {
							var samplepopup = document.getElementById('showpiswires');
							while(samplepopup.lastChild != samplepopup.firstChild)
								samplepopup.removeChild(samplepopup.lastChild);
							var hbox_error = document.createElementNS(XUL_NS, "hbox");
							samplepopup.appendChild(hbox_error);
							var error = document.createElementNS(XUL_NS, "description");
							error.setAttribute("value", " !! Falsche Matrikelnummer / Passwort !! ");
							hbox_error.appendChild(error);
							return;
							//end adjusting xul-interface
						}
						//end test

						xmlHttpObject.open('GET', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x?isid='+isid+'1&imod=L'); // send to display lvs /1 added after isid
						xmlHttpObject.setRequestHeader('Connection','keep-alive');
						xmlHttpObject.setRequestHeader('imnr',matnr);
						xmlHttpObject.setRequestHeader('ikenn',kennwort);
						xmlHttpObject.setRequestHeader('Referer','http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
						xmlHttpObject.send(null); 
						xmlHttpObject.onreadystatechange = function(cEvt) {
							if(xmlHttpObject.readyState == 4) {
								if(xmlHttpObject.status == 200) { //displaying lvs
									//one deeper
									xmlHttpObject.open('GET', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x?isid='+isid+'2&imod=S'); // send to display actual results of lvs /2 added after isid
									xmlHttpObject.setRequestHeader('Connection','keep-alive');
									xmlHttpObject.setRequestHeader('imnr',matnr);
									xmlHttpObject.setRequestHeader('ikenn',kennwort);
									xmlHttpObject.setRequestHeader('Referer','http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x?isid='+isid+'1&imod=L');
									xmlHttpObject.send(null);
									xmlHttpObject.onreadystatechange = function(dEvt) {
										if(xmlHttpObject.readyState == 4) {
											if(xmlHttpObject.status == 200) { //displaying lvs with actual results
												//anotherone deeper
												xmlHttpObject.open('POST', 'http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x');
												xmlHttpObject.setRequestHeader('Connection','keep-alive');
												xmlHttpObject.setRequestHeader('Referer','http://sibelius.pri.univie.ac.at:8885/piswi/xxx/piswi.x?isid='+isid+'2&imod=S');
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
												xmlHttpObject.send("iknr=521&ipkt=0&ilv=&iaus=M&ise=0&iord=V&ilek=On&inot=On&imod=O&isid="+isid+"3"); //ise=0 -> alle semester, iord=V -> nach beginn /alle anderen leer
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
													} while (tdcount < 66); //66 for link, 72 for description

													/* final array will look like this
														[0] = description
														[1] = lecturer
														[2] = mark
														[3] = link to smiley.gif
													*/
													//check if more to go (even on first)
													for (var i=0; td_max - tdcount > 4; ++i) {
														//icon parse
														var iconstart = output.search("SRC=");
														var temp_output = output.slice(iconstart);
														var iconend = iconstart + temp_output.search(" ");
														var gif = "http://sibelius.pri.univie.ac.at:8885" + output.substring(iconstart + 4, iconend); //+4 to skip SRC=

														for(var k=0; k<6; ++k) {  //6 TDs further is description
															var tempposition = output.search("<TD");
															position = position + tempposition + 3;
															output = output.slice(tempposition + 3); //+3 so current "<TD" is skipped
															++tdcount; //TODO right number of counts?? - seems to work
														}

														var current = new Array();
														lvs.push(current); // = lvs[i]
														var endposition = position + output.search("<") - 2; //-2 to remove \n and space
														var description = xmlHttpObject.responseText.substring(position + 2 + 1, endposition); //move +2 because we are at <TD and skip " >" // +1 to remove \n
														var position2 = output.search("TARGET=details>");
														if(position2 == -1 || position2 > 150 || output.search("-&gt; Sammelzeugnis") == position2 + 15) { //just guessing that the next link must be further away / check that link is not for sammelzeugnis
															//no link, just name of lecturer
															position2 = output.search("<I>");
															endposition = output.search("</I>");
															var lecturer = output.substring(position2 + 3, endposition); //+3 to skip <I>
														} else {
															//link for lecturer
															endposition = output.search("</A>");
															var lecturer = output.substring(position2 + 15, endposition); //+15 to skip TARGET=details>
														}
														position2 = output.search("<BR>");
														if(position2 == -1 || position2 - endposition > 50) {//50 guess
															//no info
															var mark = "";
														} else {
															temp_output = output.slice(position2 + 1); //reuse temp_output /+1 to skip "<" to not hit it in next search
															endposition = position2 + 1 + temp_output.search("<") - 1; //-1 to skip new line TODO trim properly /+1 to add the "<" skipped before
															var mark = output.substring(position2 + 4, endposition); //+4 to skip <BR>
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
														lvs[i].push(mark);
														lvs[i].push(gif);
														
														for(var k=0; k<6; ++k) {  //6 TDs further next lv icon / 12 TDs further is next lv description
															var tempposition = output.search("<TD");
															position = position + tempposition + 3;
															output = output.slice(tempposition + 3); //+3 so current "<TD" is skipped
															++tdcount; //TODO right number of counts?? - seems to work
														}
													}

													//test output
													var ausgabe = "";

													//start dynamically adjusting XUL-interface
													//remove any hbox-elements (previous results) but not piswi-logo
													while(samplepopup.lastChild != samplepopup.firstChild)
														samplepopup.removeChild(samplepopup.lastChild);
													for (var i=0; i<lvs.length; ++i) {
														ausgabe = ausgabe + "Name: " + lvs[i][0] + "\nLecturer: " + lvs[i][1] + "\nMark: " + lvs[i][2] + "\nIcon: " + lvs[i][3] + "\n";
														var hbox = document.createElementNS(XUL_NS, "hbox");
														samplepopup.appendChild(hbox);
														var image = document.createElementNS(XUL_NS, "image");
														image.setAttribute("src", lvs[i][3]);
														hbox.appendChild(image);
														var description = document.createElementNS(XUL_NS, "description");
														description.setAttribute("value", lvs[i][0] + " - " + lvs[i][1]);
														hbox.appendChild(description);
														if(lvs[i][2] != "") {
															//mark present
															var hbox2 = document.createElementNS(XUL_NS, "hbox");
															var mark = document.createElementNS(XUL_NS, "description");
															mark.setAttribute("value", "       " + lvs[i][2]);
															hbox2.appendChild(mark);
															samplepopup.appendChild(hbox2);
														}
													}
													//alert(ausgabe);
												}
											} else
												alert("error loading page\n");
										} //endif
									} //end function /TODO strichpunkt?!?
								} else
									alert("error loading page\n");
							} //endif
						} //end function  /TODO strichpunkt ?!?
					} else
						alert("Error loading page\n");  
				}
			};
			//alert(matnr+"\n"+kennwort+"\ngeschickt");
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

window.addEventListener("load", function(e) { piswirequest.startup(); }, false); 
window.addEventListener("unload", function(e) { piswirequest.shutdown(); }, false); 
