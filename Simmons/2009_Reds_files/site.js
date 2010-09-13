/* Highlight/Unhighlight the element. */
function hl (element)  {   element.style.backgroundColor = "#ffa"; }
function uhl (element) {   element.style.backgroundColor = "";  }

function show_drop (element) {   element.className += " drophover"; }
function hide_drop (element) {   element.className = element.className.replace("drophover", ""); }

/* send us along. */
function goto_page(selectDest, strBaseUrl, f, final_addition) { 
    var index = f[ selectDest ].selectedIndex;
    if (!final_addition) {
        final_addition = '';
    }
        
    if (f[ selectDest ].options[index].value != "0") {
	location = strBaseUrl + f[ selectDest ].options[index].value + final_addition;
    }
}


var remote = null;
window.name = 'mainWindow';
function oI(url){
    window.open(url,'surf','width=200,height=240,scrollbars=yes,resizable=yes');
    if (remote != null) {
        if (remote.opener == null)
            remote.opener = self;
        remote.location.href = url;
    }
}


function show_alt_stat(overall_stat_type, stat_to_show_id) {
      // Get all div elements with a class of div_(overall_stat_type)_type
      var div_get = 'div.div_'+overall_stat_type+'_type';
      var divs_to_search = new Array();
      divs_to_search = $$(div_get);
      for (var i = 0; i < divs_to_search.length; i++) {
          if (/all_/.test(stat_to_show_id)) {
              divs_to_search[i].show();
          }
          else if (divs_to_search[i].id == 'all_' + stat_to_show_id) {
              divs_to_search[i].show();
          }
          else if (/ show_always/.test(divs_to_search[i].className)) {
          }
          else {
              divs_to_search[i].hide();
          }
      }
      set_doc_hash_value(overall_stat_type, stat_to_show_id);
}



function toggleDisplay(oElm, strClassName, toggleNumber ) {
    var strDisplayAppearStyle = '';

    
    if (!toggleNumber) {
        toggleNumber = '';
    }

    if (!oElm) return;

    // Get a handle on the toggle tooltip.
    var oSpan = document.getElementById(oElm.getAttribute("id") + '_toggle_' + toggleNumber);
 
    // Get a handle on all of the tags with this class in our
    // container.  This comes from prototype
    //    var arrElements = $$('tr.'+strClassName);
    var arrElements = oElm.getElementsByClassName(strClassName);
    var strClassStatus;
    // Run thru toggling the appearance of each element.
    for (var intCount =0; intCount < arrElements.length; intCount++) {
        arrElements[intCount].style.display = 
               (arrElements[intCount].style.display == "none") ? strDisplayAppearStyle : "none";

        strClassStatus = arrElements[intCount].style.display;
    }

     // We have changed the class's display style, now change what our link shows.    
     // class not displayed we want the option to show.  class displayed option to hide.
    if (strClassStatus == "none") {
         oSpan.innerHTML = oSpan.innerHTML.replace('Hide','Show');
         oSpan.style.backgroundColor = '#FFF655';
     }
    else {
        oSpan.innerHTML = oSpan.innerHTML.replace('Show','Hide');
        oSpan.style.backgroundColor = '';
    }
     
}


function changeimage(imageid, imagefile) {
    //make new image
    document.getElementById(imageid).src = imagefile;
}


// *************************************************************************
// *************************************************************************
//  Materials for the tooltips on various pages
// *************************************************************************
// *************************************************************************

var divTOOLTIP;
var elemCLICKED;
var boolINITED = 0;
var arrTOOLTIPcoords;
var arrTOOLTIP_NewCoords;

var intTOOLTIPoffsetTop  = 18;
var intTOOLTIPoffsetLeft = 15;
var intTOOLTIPspecialLeftOffset = 0;


var divTARGETname;
var PREVCLICKED = 0;
var ImageCount = 34;
var TIMEDOUTmessage = '<h3>We apologize, but this question may have taken too long to answer causing the server to quit before finishing.  Please try again, and if this happens again, please <a href="mailto:bugs@sports-reference.com">let us know what you were trying to do</a>.  Also, we update our database from 7-8am and that can cause the queries to stall.</h3>';

var TIMEDOUTmessage_streak = '<h3>We apologize, but this question may have taken too long (more than 30 seconds) to answer causing the server to quit before finishing.  Calculating streaks is generally slow and impossible to optimize.  These queries may take up to two seconds per season searched, and requests are limited to thirty seconds of time.   Please try again with fewer years.  Please <a href="mailto:bugs@sports-reference.com">let us know what you were trying to do</a> if you continue to have difficulties. Also, we update our database from 7-8am and that can cause the queries to stall.</h3>';



// we store the current location of the tooltip in an array.
function initTooltip() {
    divTOOLTIP = document.getElementById("tooltip");
    if (boolINITED != 1) {
	arrTOOLTIPcoords = findPos(divTOOLTIP);
	// Preset some of the style data for later use.
	divTOOLTIP.style.margin          = "0em";
	divTOOLTIP.style.padding         = ".3em";
	divTOOLTIP.style.paddingLeft     = "1em";
    }	
    boolINITED = 1;
}

// Run the ajax request for this tooltip request.
function getTooltipData(url, params) {
    initTooltip();
    arrTOOLTIP_NewCoords = findPos(elemCLICKED);
    
    var newAjax  = new Ajax.Request(url,
	{
	    method: 'get',
	    parameters: params,
            onSuccess:  setTooltipData,
	    onLoading:  setTooltipWait,
	    onFailure:  setTooltipFailed
	}
				    );
}


// Update the tooltip with the new data.
function setTooltipData(eventData, isNotAjax) {            
    // Output the data into our tooltip.
    divTOOLTIP.style.backgroundColor = "#fff";
    divTOOLTIP.style.border          = "black 1px solid";
    divTOOLTIP.style.textAlign       = "left";
    
    var offsetSpecialLeft = intTOOLTIPoffsetLeft + intTOOLTIPspecialLeftOffset;
    divTOOLTIP.style.left            = arrTOOLTIP_NewCoords[0] + offsetSpecialLeft  + "px";
    divTOOLTIP.style.top             = arrTOOLTIP_NewCoords[1] + intTOOLTIPoffsetTop  +"px";

    if (isNotAjax) {
	divTOOLTIP.innerHTML = eventData;
    }
    else {
	divTOOLTIP.innerHTML = eventData.responseText;
    }

    // If available scroll this into the window.
    // divTOOLTIP.scrollIntoView(0);
         
    addLoadEvent(sorttable.init);
}



// Update the tooltip in the case where our request failed.
function setTooltipFailed(eventData) {            
    divTOOLTIP.style.backgroundColor = "#fff";
    divTOOLTIP.style.border          = "black 1px solid";
    var offsetSpecialLeft = intTOOLTIPoffsetLeft + intTOOLTIPspecialLeftOffset;
    divTOOLTIP.style.left            = arrTOOLTIP_NewCoords[0] + offsetSpecialLeft + "px";
    divTOOLTIP.style.top             = arrTOOLTIP_NewCoords[1] + intTOOLTIPoffsetTop + "px";

    divTOOLTIP.innerHTML = '<div align=left><h3>We apologize, but this request failed.</h3>' + 
	"<P><span class=tooltip onclick=\"clearTooltipData();\">" + 
	"Close [x]</span>\n</div>";

    // If available scroll this into the window.
    //divTOOLTIP.scrollIntoView(0);
}


// Update the tooltip with the new data.
function setTooltipWait(eventData) {            
    // Print out a loading page for the user.
    divTOOLTIP.style.backgroundColor = "#777";
    divTOOLTIP.style.border          = "black 1px solid";
    var offsetSpecialLeft = intTOOLTIPoffsetLeft + intTOOLTIPspecialLeftOffset;
    divTOOLTIP.style.left            = arrTOOLTIP_NewCoords[0] + offsetSpecialLeft  + "px";
    divTOOLTIP.style.top             = arrTOOLTIP_NewCoords[1] + intTOOLTIPoffsetTop  + "px";
    divTOOLTIP.innerHTML = '<img src="http://d2ft4b0ve1aur1.cloudfront.net/images-001/loadingAnimation.gif" width=100 height=100>';
    // If available scroll this into the window.
    //divTOOLTIP.scrollIntoView(0);
}

// Return the tooltip to its previous location and make it empty.
function clearTooltipData() {            
    if (!divTOOLTIP) {
        return 1;
    }
    intTOOLTIPspecialLeftOffset = 0;
    divTOOLTIP.innerHTML    = "";
    divTOOLTIP.style.border = "none";
    var offsetSpecialLeft = intTOOLTIPoffsetLeft + intTOOLTIPspecialLeftOffset;
    divTOOLTIP.style.left   = arrTOOLTIPcoords[0];
    divTOOLTIP.style.top    = arrTOOLTIPcoords[1];
}        

// http://www.quirksmode.org/js/findpos.html
function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft;
        curtop  = obj.offsetTop;
        var i = 0;
        while (obj = obj.offsetParent) {
            i++;
            curleft += obj.offsetLeft;
            curtop  += obj.offsetTop;
        }
    }
    return [curleft,curtop];
}

//  Set up the individual tooltips.

// Print out a list of the games played on that day.
// following week.
function getGamesData(elemUserClicked, specialLeftOffset) {
    elemCLICKED = elemUserClicked;
    if (specialLeftOffset) {
	intTOOLTIPspecialLeftOffset = specialLeftOffset;
    }
    else {
	intTOOLTIPspecialLeftOffset = 0;
    }
    var url    = "/play-index/st.cgi"
    var params = "date=" + escape(elemUserClicked.id);
    getTooltipData(url, params);
}

// Print out a summary of the team's result for the previous and
// following week.
function getWeekEventData(elemUserClicked, specialLeftOffset) {
    intTOOLTIPspecialLeftOffset = specialLeftOffset;
    elemCLICKED = elemUserClicked;
    var url    = "/play-index/week.cgi";
    var params = "html=1&team-game=" + escape(elemUserClicked.id);
    getTooltipData(url, params);
}

// Print out a summary of player's pitch-by-pitch
// Print out a summary of player's pitch-by-pitch
function popupText(elemUserClicked, url, offset) {
    if (Math.abs(offset) > 0) {
	intTOOLTIPspecialLeftOffset = offset;
    }
    else {
	intTOOLTIPspecialLeftOffset = 0;
    }
    elemCLICKED = elemUserClicked;
    getTooltipData(url + '?randbit=' + Math.random(), '');
}

// This will print out text/html into the tooltip without 
function popupTextNoURL(elemUserClicked, text, is_url) {
    initTooltip();
    intTOOLTIPspecialLeftOffset = 0;
    elemCLICKED = elemUserClicked;
    arrTOOLTIP_NewCoords = findPos(elemCLICKED);

    if (is_url) {
        text = '<a href="' + text + '">' + text + '</a>';
    }
    
    text = text + 
	"<div align=\"left\"><span class=tooltip onclick=\"clearTooltipData();\" >" + 
	"Close [x]</span></div>\n";
    setTooltipData(text, 1);
}

// Print out a summary of player's pitch-by-pitch
function getPitchData(elemUserClicked) {
    intTOOLTIPspecialLeftOffset = 0;
    elemCLICKED = elemUserClicked;
    var url     = "/play-index/pitch.cgi";
    var params  = "html=1&game-event=" + escape(elemUserClicked.id);
    getTooltipData(url, params);
}

// Print out a summary of the innings for each pitcher.
function getDefEventData(elemUserClicked, specialLeftOffset) {
    PREVCLICKED = 1;
    if (specialLeftOffset) {
	intTOOLTIPspecialLeftOffset = specialLeftOffset;
    }
    else {
	intTOOLTIPspecialLeftOffset = 0;
    }
    elemCLICKED = elemUserClicked;
    var url     = "/play-index/def.cgi";
    var params  = "html=1&game-event=" + escape(elemUserClicked.id);
    getTooltipData(url, params);
}

// Print out a summary of the innings for each pitcher.
function getPitchEventData(elemUserClicked) {
    PREVCLICKED = 1;
    intTOOLTIPspecialLeftOffset = 0;
    elemCLICKED = elemUserClicked;
    var url     = "/play-index/pe.cgi";
    var params  = "html=1&game-id=" + escape(elemUserClicked.id);
    getTooltipData(url, params);
}

// Print out a summary of batter's PA's
function getBatEventData(elemUserClicked) {
    PREVCLICKED = 1;
    intTOOLTIPspecialLeftOffset = 0;
    elemCLICKED = elemUserClicked;
    var url     = "/play-index/be.cgi";
    var params  = "html=1&game-id=" + escape(elemUserClicked.id);
    getTooltipData(url, params);
}



// Print out a summary of batter's PA's
function getCumStats(elemUserClicked, player, year, career_game, sORc, pORb) {
    PREVCLICKED = 1;
    intTOOLTIPspecialLeftOffset = 0;
    elemCLICKED = elemUserClicked;
    var url     = "/play-index/cumStats.cgi";
    var params  = "html=1&player=" + escape(player) + "&year=" + escape(year) + "&cgame=" + escape(career_game) + "&level=" + escape(sORc) + "&type=" + escape(pORb);
    getTooltipData(url, params);
}



// SPLIT YEAR-BY-YEAR PRINT OUT
function get_split_stats(elemUserClicked,type) {
    intTOOLTIPspecialLeftOffset = 0;
    elemCLICKED = elemUserClicked;
    var url     = "/play-index/split_stats.cgi";
    var params  = "full=0&params=" + escape(elemUserClicked.id);
    if (type == 'team') {
        url     = "/play-index/split_stats_team.cgi";
        params  = "full=0&params=" + escape(elemUserClicked.id);
    }
    else if (type == 'league') {
        url     = "/play-index/split_stats_lg.cgi";
        params  = "full=0&params=" + escape(elemUserClicked.id);
    }
    
    getTooltipData(url, params);
}



///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
// We run the neutralization through neutralize.
// JK's eq stats toolbox.
function getYears(strID,strForm) {
    var url = "/play-index/getYears.cgi?id=" + strID + "&type=" + strForm;
    strYrChange = "years_" + strForm;
       alert(url);

    request2.open("GET", url, true);
    request2.onreadystatechange = updateYears;
    request2.send(null);
}

function getLeagues(strForm) {
    var strYrForm = "year_"+strForm;
    var year = document.getElementById(strYrForm).value;
    var url = "/play-index/getLeagues.cgi?type=" + strForm + "&year=" + year;
    strLgChange = "leagues_" + strForm;
    request.open("GET", url, true);
    request.onreadystatechange = updateLeagues;
    request.send(null);
}

function getTeams(strForm) {
    var strYrForm = "year_"+strForm;
    var strTyForm = "type_"+strForm;
    var strLgForm = "league_"+strForm;

    var type = document.getElementById(strTyForm).value;
    var year = document.getElementById(strYrForm).value;
    var league = document.getElementById(strLgForm).value;
    strTmChange = "teams_" + strForm;
    var url = "/play-index/getTeams.cgi?type=" + type + "&year=" + 
	year + "&league=" + league;
    request.open("GET", url, true);
    request.onreadystatechange = updateTeams;
    request.send(null);
}

function getBat() {
    var id = document.getElementById("id").value;
    var year = document.getElementById("year_bat").value;
    var league = document.getElementById("league_bat").value;
    var team = document.getElementById("team_bat").value;
    var url = "/players/get_neutral_bat.cgi?id=" + id + "&year=" + year + "&league=" + league + "&team=" + team;
    
    strDivChange = 'neutral_change_here';
    document.getElementById(strDivChange).style.color = "#999";
    document.getElementById(strDivChange).style.backgroundColor = "#ddd";

    request.open("GET", url, true);
    request.onreadystatechange = updateStats;
    request.send(null);
}

function getPitch() {
  var id = document.getElementById("id").value;
  var year = document.getElementById("year_pitch").value;
  var league = document.getElementById("league_pitch").value;
  var team = document.getElementById("team_pitch").value;

  strDivChange = 'neutral_change_here';
  document.getElementById(strDivChange).style.color = "#999";
    document.getElementById(strDivChange).style.backgroundColor = "#ddd";

  var url = "/players/get_neutral_pitch.cgi?id=" + id + "&year=" + year + "&league=" + league + "&team=" + team;
  request.open("GET", url, true);
  request.onreadystatechange = updateStats;
  request.send(null);
}

function defaultPitch(strID, strQueryString) {
    if (strQueryString) {
	url = "/players/get_neutral_pitch.cgi?" + strQueryString;
    }
    else {
	url = "/players/get_neutral_pitch.cgi?id=" + strID + "&league=ML:4.415:0.90:162&team=neutral:100:100";
	strID = strID.replace(/\'/,'_');
	document.getElementById("neutralPitch").innerHTML = "<span class=tooltip onclick=\"actualize('pitchStats', '" + 
	    strID + "');\">Return&nbsp;to&nbsp;Actual&nbsp;Stats</span>";
    }


    strDivChange = 'neutral_change_here';
    document.getElementById(strDivChange).style.color = "#999";
    document.getElementById(strDivChange).style.backgroundColor = "#ddd";
    request.open("GET", url, true);
    request.onreadystatechange = updateStats;
    request.send(null);
}

function defaultBat(strID, strQueryString) {
    var url;

    if (strQueryString) {
	url = "/players/get_neutral_bat.cgi?" + strQueryString;
    }
    else {
	url = "/players/get_neutral_bat.cgi?id=" + strID + "&league=ML:4.415:0.90:162&team=neutral:100:100";
	strID = strID.replace(/\'/,'_');
	document.getElementById("neutralBat").innerHTML = "<span class=tooltip onclick=\"actualize('batStats', '" + 
	    strID + "');\">Return&nbsp;to&nbsp;Actual&nbsp;Stats</span>";
    }
    strDivChange = 'neutral_change_here';
    document.getElementById(strDivChange).style.color = "#999";
    document.getElementById(strDivChange).style.backgroundColor = "#ddd";

    request.open("GET", url, true);
    request.onreadystatechange = updateStats;
    request.send(null);
}



function updateLeagues() {
  if (request.readyState == 4) {
    var leagueList = request.responseText;
    document.getElementById(strLgChange).innerHTML = leagueList;
  }
}

function updateYears() {
    alert('in update years');
    if (request2.readyState == 4) {
    var yearList = request2.responseText;
    document.getElementById(strYrChange).innerHTML = yearList;
  }
}

function updateTeams() {
    if (request.readyState == 4) {
      var teamList = request.responseText;
      document.getElementById(strTmChange).innerHTML = teamList;
    }
}

function updateStats() {
       if (request.readyState == 4) {
	var eqStats = request.responseText;
	//fade(strDivChange);
	document.getElementById(strDivChange).style.color = "#000";
	document.getElementById(strDivChange).innerHTML = eqStats;
	document.getElementById(strDivChange).style.backgroundColor = "#fff";
    }
}

function clearTeams(strForm) {
    var strTmID  = "teams_" + strForm;
    document.getElementById(strTmID).innerHTML = "";
}

function clearAll(strForm) {
    var strLgID  = "leagues_" + strForm;
    var strTmID  =   "teams_" + strForm;
    document.getElementById(strLgID).innerHTML = "";
    document.getElementById(strTmID).innerHTML = "";
}
var request = null;
var strDivChange = '';
var strYrChange = '';
var strLgChange = '';
var strTmChange = '';

function neutralize (strType, strID, strQueryString) {
    // Passing quotes is a pain, so we fix it here.
    strID = strID.replace(/_/,'\'');

    if (strQueryString) {
	strQueryString = strQueryString.replace(/_/,'\'');
    }
    if (strType == 'pitchStats') {
	clearAll('pitch');
	defaultPitch(strID, strQueryString);
    }
    else if (strType == 'batStats') {
	clearAll('bat');
	defaultBat(strID, strQueryString);
    }

    if (!strQueryString) {
	if (strType == 'pitchStats') {
	    getYears(strID,'pitch');
	}
	else if (strType == 'batStats') {
	    getYears(strID,'bat');
	}
    }
}


function setDivData(eventData) {            
    $(divTARGETname).innerHTML = eventData.responseText + 
	"<pre><span class=closeLink onclick=\"$('" + divTARGETname + "').innerHTML='';\">Close [x]</span></pre>";
}


function pL (pageType) {
}

try {
    request = new XMLHttpRequest();
} catch (trymicrosoft) {
    try {
	request = new ActiveXObject("Msxm12.XMLHTTP");
    } catch (othermicrosoft) {
	try {
	    request = new ActiveXObject("Microsoft.XMLHTTP");
	} catch (failed) {
	    request = null;
	}
    }
}

try {
    request2 = new XMLHttpRequest();
} catch (trymicrosoft) {
    try {
	request2 = new ActiveXObject("Msxm12.XMLHTTP");
    } catch (othermicrosoft) {
	try {
	    request2 = new ActiveXObject("Microsoft.XMLHTTP");
	} catch (failed) {
	    request2 = null;
	}
    }
}



// Box Score material
function wpa_chart_hl(elements) {
    clear_chart();
    elem_array = elements.split(',');

    if (marked_plays == elem_array.join()) {
        marked_plays = '';
        return true;
    }

    for (var j=0; j<elem_array.length; j++) {
	var span =  document.getElementById(elem_array[j]);
	span.style.backgroundImage = 'url("http://d2ft4b0ve1aur1.cloudfront.net/boxes-002/images/chart_sprite_hl.png")';
    }

    // Save the marked plays for later.
    marked_plays = elem_array.join();
}
function clear_chart() {
    if (marked_plays == '') {
        return true;
    }

    var elem_array = marked_plays.split(',');
    for (var j=0; j < elem_array.length; j++) {
	var span =  document.getElementById(elem_array[j]);
	span.style.backgroundImage = 'url("http://d2ft4b0ve1aur1.cloudfront.net/boxes-002/images/chart_sprite.png")';
    }
}
var div_wpa_chart_top = 0;
var div_wpa_chart_left = 0;

function getAbsX(elt) { 
    return (elt.x) ? elt.x : getAbsPos(elt,"Left"); }
function getAbsY(elt) { 
    return (elt.y) ? elt.y : getAbsPos(elt,"Top"); }
function getAbsPos(elt,which) {
    iPos = 0;
    while (elt != null) {
	iPos += elt["offset" + which];
	elt = elt.offsetParent;
    }
    return iPos;
}

function fix_wpa_chart() {
    document.getElementById('unfix_span').style.display = 'inline';
    document.getElementById('fix_span').style.display   = 'none';
    var div_wpa_chart = document.getElementById('div_wpa_chart');
    div_wpa_chart_top = getAbsY(div_wpa_chart);
    div_wpa_chart_left = getAbsY(div_wpa_chart);
    div_wpa_chart.style.position = 'fixed';
    div_wpa_chart.style.top = '10px';
    div_wpa_chart.style.left = '10px';
    div_wpa_chart.style.width = '__DIV_WIDTH_BORDER__';    
    div_wpa_chart.style.border = '#999 solid 8px';
    
}
function unfix_wpa_chart() {
    
    document.getElementById('unfix_span').style.display = 'none';
    document.getElementById('fix_span').style.display = 'inline';
    var div_wpa_chart = document.getElementById('div_wpa_chart');
    div_wpa_chart.style.position = 'static';
    div_wpa_chart.style.top = div_wpa_chart_top + 'px';
    div_wpa_chart.style.left = div_wpa_chart_left + 'px';
    div_wpa_chart.style.width = '__DIV_WIDTH__';    
    div_wpa_chart.style.border = '';
    
}

