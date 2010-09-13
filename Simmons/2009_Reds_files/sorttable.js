/*
  SortTable
  version 2
  7th April 2007
  Stuart Langridge, http://www.kryogenix.org/code/browser/sorttable/
  
  Instructions:
  Download this file
  Add <script src="sorttable.js"></script> to your HTML
  Add class="sortable" to any table you'd like to make sortable
  Click on the headers to sort
  
  Thanks to many, many people for contributions and suggestions.
  Licenced as X11: http://www.kryogenix.org/code/browser/licence.html
  This basically means: do what you want with it.
*/


// To allow resetting of the document hash search on hash and uncomment.
function addLoadEvent(func) {
    var oldonload = window.onload;

    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            if (oldonload) {
                oldonload();
            }
            func();
        }
    }
}


var stIsIE = /*@cc_on!@*/false;
var TABLE_NUMBER = 0;
sorttable = {
    init: function() {
        // quit if this function has already been called
        if (arguments.callee.done) {
            return;
        }
        // flag this function so we don't do the same thing twice
        arguments.callee.done = true;
        // kill the timer
        if (_timer) clearInterval(_timer);
	
        if (!document.createElement || !document.getElementsByTagName) return;
	
	
        sorttable.DATE_RE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/;
	
	forEach(
		document.getElementsByTagName('table'), 
		function(table) {
                    if (table.className.search(/\bsortable\b/) != -1) {
                        TABLE_NUMBER++;
                        sorttable.makeSortable(table);
                    }
                }
		);
	if(typeof window.tt_Init == 'function') {
	    // function exists, so we can now call it
	    tt_Init();
	}
        use_doc_hash_value();
    },
    
    makeSortable: function(table) {
        if (!table) {
            return;
        }
        if (table.getElementsByTagName('thead').length == 0) {
            // table doesn't have a tHead. Since it should have, create one and
            // put the first table row in it.
            var the = document.createElement('thead');
            the.appendChild(table.rows[0]);
            table.insertBefore(the,table.firstChild);
        }
        // Safari doesn't support table.tHead, sigh
        if (table.tHead == null) {
            table.tHead = table.getElementsByTagName('thead')[0];
        }
    
    
        // Sorttable v1 put rows with a class of "sortbottom" at the
        // bottom (as "total" rows, for example). This is B&R, since
        // what you're supposed to do is put them in a tfoot. So, if
        // there are sortbottom rows, for backwards compatibility,
        // move them to tfoot (creating it if needed).
        var sortbottomrows = [];
        var tfo;
        for (var i=0; i<table.rows.length; i++) {
            if (table.rows[i].className.search(/\bsortbottom\b/) != -1) {
                sortbottomrows[sortbottomrows.length] = table.rows[i];
            }
        }
        if (sortbottomrows) {
            if (table.tFoot == null) {
                // table doesn't have a tfoot. Create one.
                tfo = document.createElement('tfoot');
                table.appendChild(tfo);
            }
            for (var i=0; i<sortbottomrows.length; i++) {
                tfo.appendChild(sortbottomrows[i]);
            }
            delete sortbottomrows;
        }
    

        // work through each column and calculate its type
        var lastHeadRow = table.tHead.rows.length - 1; 
        var headrow = table.tHead.rows[ lastHeadRow ].cells;
        for (var i=0; i<headrow.length; i++) {
            // manually override the type with a sorttable_type attribute
            if (!headrow[i].className.match(/\bsorttable_nosort\b/)) { // skip this col
                var mtch = headrow[i].className.match(/\bsorttable_([a-z0-9]+)\b/);
                if (mtch) { override = mtch[1]; }
                if (mtch && typeof sorttable["sort_"+override] == 'function') {
                    headrow[i].sorttable_sortfunction = sorttable["sort_"+override];
                } else {
                    headrow[i].sorttable_sortfunction = sorttable.guessType(table,i);
                }
                // make it clickable to sort
                headrow[i].sorttable_columnindex = i;
                headrow[i].sorttable_tbody = table.tBodies[0];

                // We add this so that we have a unique span appended
                // for each table we are sorting on.  We use this
                // below in the onclick handler to identify which
                // table we are dealing with. Without this the webding
                // will be removed for one table if we are sorting in
                // another table.
                headrow[i].table_number = TABLE_NUMBER;
                
                dean_addEvent(headrow[i],"click", function(e) {
                        var sortfwdind, sortrevind, col, rows;
                        if (this.className.search(/\bsorttable_sorted\b/) != -1) {
                            // if we're already sorted by this column, just 
                            // reverse the table, which is quicker
                            sorttable.reverse(this.sorttable_tbody);
                            move_tooltips_to_first_row(table);
                            this.className = this.className.replace('sorttable_sorted',
                                                                    'sorttable_sorted_reverse');
                            this.removeChild(document.getElementById('sorttable_sortfwdind' + this.table_number));
                            sortrevind = document.createElement('span');
                            sortrevind.id = "sorttable_sortrevind"+ this.table_number;
                            // Append a webding to show the sort order.
                            col = this.sorttable_columnindex;
                      
                            if (!headrow[col].className.match(/\bsort_default_asc\b/)) { 
                                sortrevind.innerHTML = stIsIE ? '&nbsp<font face="webdings">5</font>' 
                                    :'&nbsp;&#x25B4;';
                            }
                            else {
                                sortrevind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>'
                                    : '&nbsp;&#x25BE;';
                            }
                      
                            this.appendChild(sortrevind);
                            // We need to redo the column ranking if
                            // we have a ranker column
                            if (headrow[0].className.match(/\branker\b/)) {
				//alert('a:'+table + ':' + null +':'+col+':'+col);
                                recolor(table,null,col);
                                move_tooltips_to_first_row(table);
                                set_direct_link_value(table.id,col);
			    }
                            return;
                        }
                        else if (this.className.search(/\bsorttable_sorted_reverse\b/) != -1) {
                            // if we've already sorted by this column in reverse, just 
                            // re-reverse the table, which is quicker
                            sorttable.reverse(this.sorttable_tbody);
                            move_tooltips_to_first_row(table);
                            this.className = this.className.replace('sorttable_sorted_reverse',
                                                                    'sorttable_sorted');
                            this.removeChild(document.getElementById('sorttable_sortrevind'+ this.table_number));
                            sortfwdind = document.createElement('span');
                            sortfwdind.id = "sorttable_sortfwdind"+ this.table_number;
                          
                            // Append a webding to show the sort order.
                            col = this.sorttable_columnindex;
                      
                            if (!headrow[col].className.match(/\bsort_default_asc\b/)) { 
                                sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>'
                                    : '&nbsp;&#x25BE;';
                            }
                            else {
                                sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">5</font>'
                                    : '&nbsp;&#x25B4;';
                            }
                            this.appendChild(sortfwdind);
                            // We need to redo the column ranking if
                            // we have a ranker column
                            if (headrow[0].className.match(/\branker\b/)) {
				//alert('b:'+table + ':' + null +':'+col+':'+col);
                                recolor(table,null,col);
                                move_tooltips_to_first_row(table);
                                set_direct_link_value(table.id,col);
			    }
                            return;
                        }
                      
                        // remove sorttable_sorted classes
                        var theadrow = this.parentNode;
                        forEach(theadrow.childNodes, function(cell) {
                                if (cell.nodeType == 1) { // an element
                                    cell.className = cell.className.replace('sorttable_sorted_reverse','');
                                    cell.className = cell.className.replace('sorttable_sorted','');
                                }
                            });
                        // Search the document for the old span that
                        // has this id and blitz it.
                        sortfwdind = document.getElementById('sorttable_sortfwdind'+ this.table_number);
                        if (sortfwdind) { sortfwdind.parentNode.removeChild(sortfwdind); }
                        sortrevind = document.getElementById('sorttable_sortrevind'+ this.table_number);
                        if (sortrevind) { sortrevind.parentNode.removeChild(sortrevind); }
                        // alert('sorttable_sortrevind'+ this.table_number);
                  
                        // Create a span that contains the webding.
                        this.className += ' sorttable_sorted';
                        sortfwdind = document.createElement('span');
                        sortfwdind.id = "sorttable_sortfwdind"+ this.table_number;
                  
                        // Append a webding to show the sort order.
                        col = this.sorttable_columnindex;
                        // alert("col:"+col);
                        if (!headrow[col].className.match(/\bsort_default_asc\b/)) { 
                            sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>'
                                : '&nbsp;&#x25BE;';
                        }
                        else {
                            sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">5</font>'
                                : '&nbsp;&#x25B4;';
                        }

                        // Append the span to the column we are sorting.
                        this.appendChild(sortfwdind);
                      
                        // build an array to sort. This is a Schwartzian transform thing,
                        // i.e., we "decorate" each row with the actual sort key,
                        // sort based on the sort keys, and then put the rows back in order
                        // which is a lot faster because you only do getInnerText once per row
                        row_array = [];
                        col = this.sorttable_columnindex;
                        rows = this.sorttable_tbody.rows;
                        for (var j=0; j<rows.length; j++) {
                            row_array[row_array.length] = [sorttable.getInnerText(rows[j].cells[col]), rows[j]];
                        }

                        /* If you want a stable sort, uncomment the following line */
                        //sorttable.shaker_sort(row_array,
                        //this.sorttable_sortfunction);
                        /* and comment out this one */
                        row_array.sort(this.sorttable_sortfunction);
                      
                        // See if we want to sort this column by ascending
                        // first rather than descending. If there is not a
                        // class in the header, we sort by descending by
                        // default.
                      
                        if (!headrow[col].className.match(/\bsort_default_asc\b/)) { 
                            // By default this now sorts in descending order.
                            row_array.reverse();
                        }

                      
                        var tb = this.sorttable_tbody;
                        for (var j=0; j<row_array.length; j++) {
                            tb.appendChild(row_array[j][1]);
                        }
                      
                        delete row_array;
                        this.style.backgroundColor = '';
                        this.style.color = '';

                        for (var ii=0; ii<headrow.length; ii++) {
                            if (ii == col) {
                                // Set the newly sorted column's class.
                                headrow[ii].className += " " + colClsNm;
                                headrow[ii].className = normalizeString(headrow[ii].className);
                            }
                            else {
                                // Set the newly sorted column's class.
                                headrow[ii].className = headrow[ii].className.replace(colTest, "");
                                headrow[ii].className = normalizeString(headrow[ii].className);
                            }
                        }
                        LAST_COLUMN = col;
			// alert('c:'+table + ':' + null +':'+col+':'+col);
                        recolor(table,null,col);
                        move_tooltips_to_first_row(table);
                        set_direct_link_value(table.id,col);
                      
                    });
            }
        }
    
    },
  
    guessType: function(table, column) {
        // guess the type of a column based on its first non-blank row
        sortfn = sorttable.sort_alpha;
        for (var i=0; i<table.tBodies[0].rows.length; i++) {
            text = sorttable.getInnerText(table.tBodies[0].rows[i].cells[column]);
            if (text != '') {
                if (text.match(/^-?[£$¤]?[\d,.]+%?$/)) {
                    return sorttable.sort_numeric;
                }
                // check for a date: dd/mm/yyyy or dd/mm/yy 
                // can have / or . or - as separator
                // can be mm/dd as well
                possdate = text.match(sorttable.DATE_RE)
                    if (possdate) {
                        // looks like a date
                        first = parseInt(possdate[1]);
                        second = parseInt(possdate[2]);
                        if (first > 12) {
                            // definitely dd/mm
                            return sorttable.sort_ddmm;
                        } else if (second > 12) {
                            return sorttable.sort_mmdd;
                        } else {
                            // looks like a date, but we can't tell which, so assume
                            // that it's dd/mm (English imperialism!) and keep looking
                            sortfn = sorttable.sort_ddmm;
                        }
                    }
            }
        }
        return sortfn;
    },
  
    getInnerText: function(node) {
        // gets the text we want to use for sorting for a cell.
        // strips leading and trailing whitespace.
        // this is *not* a generic getInnerText function; it's special to sorttable.
        // for example, you can override the cell text with a customkey attribute.
        // it also gets .value for <input> fields.
        if (node == null) return '';
        var hasInputs = (typeof node.getElementsByTagName == 'function') &&
        node.getElementsByTagName('input').length;
    
        if (node.getAttribute("sorttable_customkey") != null) {
            return node.getAttribute("sorttable_customkey");
        }
        else if (node.getAttribute("csk") != null) {
            return node.getAttribute("csk");
        }
        else if (typeof node.textContent != 'undefined' && !hasInputs) {
            return node.textContent.replace(/^\s+|\s+$/g, '');
        }
        else if (typeof node.innerText != 'undefined' && !hasInputs) {
            return node.innerText.replace(/^\s+|\s+$/g, '');
        }
        else if (typeof node.text != 'undefined' && !hasInputs) {
            return node.text.replace(/^\s+|\s+$/g, '');
        }
        else {
            switch (node.nodeType) {
            case 3:
            if (node.nodeName.toLowerCase() == 'input') {
                return node.value.replace(/^\s+|\s+$/g, '');
            }
            case 4:
            return node.nodeValue.replace(/^\s+|\s+$/g, '');
            break;
            case 1:
            case 11:
            var innerText = '';
            for (var i = 0; i < node.childNodes.length; i++) {
                innerText += sorttable.getInnerText(node.childNodes[i]);
            }
            return innerText.replace(/^\s+|\s+$/g, '');
            break;
            default:
            return '';
            }
        }
    },
  
    reverse: function(tbody) {
        // reverse the rows in a tbody
        newrows = [];
        for (var i=0; i<tbody.rows.length; i++) {
            newrows[newrows.length] = tbody.rows[i];
        }
        for (var i=newrows.length-1; i>=0; i--) {
            tbody.appendChild(newrows[i]);
        }
        delete newrows;
    },
  
    /* sort functions
       each sort function takes two parameters, a and b
       you are comparing a[0] and b[0] */
    sort_numeric: function(a,b) {
        aa = parseFloat(a[0].replace(/[^0-9.-]/g,''));
        if (isNaN(aa)) aa = 0;
        bb = parseFloat(b[0].replace(/[^0-9.-]/g,'')); 
        if (isNaN(bb)) bb = 0;
        return aa-bb;
    },
    sort_alpha: function(a,b) {
        if (a[0]==b[0]) return 0;
        if (a[0]<b[0]) return -1;
        return 1;
    },
    sort_ddmm: function(a,b) {
        mtch = a[0].match(sorttable.DATE_RE);
        y = mtch[3]; m = mtch[2]; d = mtch[1];
        if (m.length == 1) m = '0'+m;
        if (d.length == 1) d = '0'+d;
        dt1 = y+m+d;
        mtch = b[0].match(sorttable.DATE_RE);
        y = mtch[3]; m = mtch[2]; d = mtch[1];
        if (m.length == 1) m = '0'+m;
        if (d.length == 1) d = '0'+d;
        dt2 = y+m+d;
        if (dt1==dt2) return 0;
        if (dt1<dt2) return -1;
        return 1;
    },
    sort_mmdd: function(a,b) {
        mtch = a[0].match(sorttable.DATE_RE);
        y = mtch[3]; d = mtch[2]; m = mtch[1];
        if (m.length == 1) m = '0'+m;
        if (d.length == 1) d = '0'+d;
        dt1 = y+m+d;
        mtch = b[0].match(sorttable.DATE_RE);
        y = mtch[3]; d = mtch[2]; m = mtch[1];
        if (m.length == 1) m = '0'+m;
        if (d.length == 1) d = '0'+d;
        dt2 = y+m+d;
        if (dt1==dt2) return 0;
        if (dt1<dt2) return -1;
        return 1;
    },
  
    shaker_sort: function(list, comp_func) {
        // A stable sort function to allow multi-level sorting of data
        // see: http://en.wikipedia.org/wiki/Cocktail_sort
        // thanks to Joseph Nahmias
        var b = 0;
        var t = list.length - 1;
        var swap = true;

        while(swap) {
            swap = false;
            for(var i = b; i < t; ++i) {
                if ( comp_func(list[i], list[i+1]) > 0 ) {
                    var q = list[i]; list[i] = list[i+1]; list[i+1] = q;
                    swap = true;
                }
            } // for
            t--;

            if (!swap) break;

            for(var i = t; i > b; --i) {
                if ( comp_func(list[i], list[i-1]) < 0 ) {
                    var q = list[i]; list[i] = list[i-1]; list[i-1] = q;
                    swap = true;
                }
            } // for
            b++;

        } // while(swap)
    }
}

    

/* ******************************************************************
   Convert a table into csv.  This is fairly straightforward, except
   in cases where there are colspans and rowspans.

   blank_colspans tells us not to repeat colspan values in later columns.
*/
    
function get_csv_output(tableid, do_drop_over_headers, blank_colspans) {
    
    var tableref     =  document.getElementById(tableid);
    var pre_filled_value = -9999;

    // Delete all of the non-visible rows.
    var trs = $$('table#' + tableid + ' tr');

    // Needs to be in reverse order because we are deleting rows which
    // causes the idx of subsequent rows to be off by one.
    for (i = trs.length - 1; i >= 0; i--) {
        if (!trs[i].visible()) {
            tableref.deleteRow(i);
        }
    }
        
    if (!tableref)
	return 'Converting from PRE-Formatted to CSV does not work, please <span class=tooltip onClick="window.location.reload()">Reload</span> and then click CSV' ;
    
    // Safari doesn't support tableref.tHead, sigh
    if (tableref.tHead == null)
	tableref.tHead = tableref.getElementsByTagName('thead')[0];


    
    // work through each column and row and stuff into table_entries
    // If we have multiple rows in thead, we want the last one.
    //alert(':' +tableid + ':' + tableref +":" );
    //alert(tableref.tHead);
    var headrow = tableref.tHead.rows[ tableref.tHead.rows.length - 1  ].cells;
    
    var maxx = tableref.rows.length; var maxy = headrow.length;
    var table_entries = new Array(maxx);
    for (x = 0; x <= maxx; x++) {
	table_entries [x] = new Array(maxy);
	for (y = 0; y <= maxy; y++) {
	    table_entries[x][y] = pre_filled_value;
	}
    }
    
    
    // Read in all of the values.
    var initial_row = 0;
    if (do_drop_over_headers && (do_drop_over_headers == 1)) {
	initial_row = tableref.tHead.rows.length - 1;
    }
    
    for (var i = 0; i < maxx; i++) {
	var pre_filled_table_entries = 0;
	for (var j = 0; j < maxy; j++) {
	    
	    if (table_entries[i][j] == pre_filled_value) {
		var cell_rowspan
		    = tableref.rows[i].cells[j - pre_filled_table_entries].getAttribute("rowspan");
		var cell_colspan
		    = tableref.rows[i].cells[j - pre_filled_table_entries].getAttribute("colspan");
		
                
		// Read the data within the table cells.
		var node_value
		    =  get_node_inner_text(tableref.rows[i].cells[j - pre_filled_table_entries]);

                node_value.replace('&nbsp<font face="webdings">6</font>','');
                node_value.replace('&nbsp<font face="webdings">5</font>','');
		if(i < initial_row)
		    node_value = node_value.substring(0,4);

		// Remove any commas from the entry.
		var new_node_value = node_value.replace(/,/g,'');
		node_value = new_node_value;

		table_entries[i][j] = node_value;
		
		// Handle the rowspans.
		if (cell_rowspan > 1) {
		    for (k = 0; k < cell_rowspan; k++) { 
			for (l = 0; l < cell_colspan; l++) { 
			    // alert('prefill: ' + (i+k) + ',' + (j + l - pre_filled_table_entries) + ',' + pre_filled_table_entries);
			    table_entries[i + k][j + l] = node_value;
			    if (l > 0) {
			    }
			}
		    }
		    if (cell_colspan > 1) {
			pre_filled_table_entries += cell_colspan - 1;
			j = j + cell_colspan - 1;
		    }
		}
		else {
		    // Handle the colspans.
		    if (cell_colspan && (cell_colspan > 1)) {
			for (k = 1; k < cell_colspan; k++) { 
                            // For blank_colspans, we just leave the
                            // entry blank, else we repeat the value.
                            if (blank_colspans) {
                                table_entries[i][j + k ] = '';
                            }
                            else {
                                table_entries[i][j + k ] = node_value;
                            }
			    pre_filled_table_entries++;
			}
			j +=  cell_colspan - 1;
			
		    }
		    
		}
                
	    }
	    else {
		// Note that we've pre-filled something here.
		//pre_filled_table_entries++;
		//j = j + 1;
	    }
	    
	}
    }
    
    // alert(maxx+":"+maxy);
    // Output all of the values.
    var csv_output = '';
    for (var i = 0; i < maxx; i++) {
	var row_output = new Array;
	for (var j = 0; j < maxy; j++) {
	    row_output.push(table_entries[i][j]);
	}
	csv_output = csv_output + "\n" + row_output.join(',');
    }

    return "<!-- ALREADYCSV -->" + csv_output;
}



/* ***********************************************************
   sort_on_load

   Creates a fake mouse click to sort the column in question.

   ********************************************************* */
function sort_on_load(table_name, sorted_column, focus_here)
{
   var table = document.getElementById(table_name);
   var lastHeadRow = table.tHead.rows.length - 1; 
   var headrow = table.tHead.rows[ lastHeadRow ].cells;

   if (focus_here) {
       // First we focus using the hash that actually exists, then the
       // second one doesn't exist, so nothing bad happens and the url
       // bar shows what we expect it to.
       location.hash = table_name;
       location.hash = table_name + '::' + sorted_column;

   }
       
   
   if (!document.all)
   {
      var fireOnThis = headrow[sorted_column];
      var evObj = document.createEvent('MouseEvents');
      evObj.initEvent( 'click', true, true );
      fireOnThis.dispatchEvent(evObj);
   }
   else
   {
      var fireOnThis = headrow[sorted_column];
      fireOnThis.fireEvent('onclick');
   }
}

/* ***********************************************************
   use_doc_hash_value

   Takes the document hash value onload and attempts to sort the
   tables as needed.

   The hashes have the form
   table_name::sorted_column;;table_name2::sorted_column2

   ********************************************************* */
function use_doc_hash_value() {
    // Parse the existing hash and check to see if this table_name is
    // already set here.
    var current_hash = window.location.hash;
    if (current_hash == "") {
       return 1;
    }


    if (current_hash.charAt(0) == '#') {
       var drop_hash = current_hash.substring(1);
       current_hash  = drop_hash;
    }

    var arr_sorted_tables = new Array;
    var arr_tables_keys   = new Array;
    arr_sorted_tables = current_hash.split(/;;/);
    
    for (var i = 0; i < arr_sorted_tables.length; i++) {
        // Get the table id and the column to sort.
        arr_tables_keys = arr_sorted_tables[i].split('::');
        if (arr_tables_keys.length < 2) {
            return 1;
        }
	if (/^[0-9]+$/.test(arr_tables_keys[1])) {
            // The (i == 0) is for a focus boolean.  We want the
            // browser window to focus on only the first table we have sorted.
            sort_on_load(arr_tables_keys[0], arr_tables_keys[1], (i == 0));
	}
	else {
            show_alt_stat(arr_tables_keys[0], arr_tables_keys[1]);
	}	
    }

}


/* ***********************************************************
   set_doc_hash_value

   Takes a table and column and adds a sort command to the hash result
   for use later in providing a bookmarkable link.   

   The hashes have the form
   table_name::sorted_column;;table_name2::sorted_column2

   ********************************************************* */
function set_doc_hash_value(table_name, sorted_column) {
    // Parse the existing hash and check to see if this table_name is
    // already set here.

    //alert("set doc_hash");
    var current_hash = window.location.hash;
    if (current_hash.charAt(0) == '#') {
       var drop_hash = current_hash.substring(1);
       current_hash  = drop_hash;
    }

    var arr_sorted_tables = new Array;
    var arr_tables_keys   = new Array;
    var arr_new_hash = new Array;
    var has_found_table = 0;

    arr_sorted_tables = current_hash.split(/;;/);

    for (var i = 0; i < arr_sorted_tables.length; i++) {
        arr_tables_keys = arr_sorted_tables[i].split(/::/);
        if (arr_tables_keys[0] == table_name) {
            has_found_table = 1;
            arr_tables_keys[1] = sorted_column;
        }

        if (arr_tables_keys.length == 2) {
            arr_new_hash.push(arr_tables_keys.join('::'));
        }
    }

    // For a table not in the hash
    if (!has_found_table) {
        arr_new_hash.push(table_name + '::' + sorted_column);
    }

    // Reset the window's hash.
    window.location.hash = arr_new_hash.join(';;');

}


/* ***********************************************************
   set_direct_link_value

   Takes a table and column and replaces a direct link in that table
   with a table_id::column_number pair that can be used to then send a
   link to someone else.

   The hashes have the form
   table_name::sorted_column

   ********************************************************* */
function set_direct_link_value(table_name, sorted_column) {
    // Parse the existing hash and check to see if this table_name is
    // already set here.

    //alert("set doc_hash");
    var link =  document.getElementById('link_' + table_name);
    if (link) {
        link.href = '#' + table_name + '::' + sorted_column;
        var page_url = link.href;
        var popup_text = "<a href=\"" + page_url + "\">" + page_url + "</a>";
        link.onclick = function () { popupTextNoURL(link, popup_text); }
    }
}


/* ***********************************************************
   move_tooltips_to_first_row

   If we've called up the tooltips and sorted, we always want to move
   them back to the first entry.

   ********************************************************* */
function move_row_safe(table, from, to)
{
    // alert(table.id + ":" + from + ":" +to + ":" );

    if (from == to) {
        return;
    }
    var tbody = table.tBodies[0]; // Use tbody
    var row = tbody.rows[from]; // Make sure row stays referenced
    var insertPos = tbody.rows[to];
    
    var parent = row.parentNode;
    
    parent.removeChild(row);
    parent.insertBefore(row, insertPos);
}

function move_tooltips_to_first_row(table_dom) {
    //alert(table_dom.id);

    // Figure out if there is a tooltip row.
    var tips_row = $$('table#' + table_dom.id + ' tr.delete_this_tip');

    // Get the tooltip rows index. and move it to the index of the
    // first row after thead.
    if (tips_row.length) {
        var old_idx = tips_row[0].rowIndex - table_dom.tHead.rows.length;
        var new_idx = 0;
        //        alert(table_id + ":" + tips_row[0] + ":" + tips_row[0].className + ":" + tips_row[0].rowIndex + ":" + old_idx + ":" +new_idx + ":" );

        move_row_safe(table_dom,old_idx,new_idx);
    }
}


/* ******************************************************************
   Convert a table into csv.  This is fairly straightforward, except
   in cases where there are colspans and rowspans.
*/
function table2csv(table_id) {
    
    var table_div =  document.getElementById('div_'+table_id);
    var csv_output = get_csv_output(table_id);
    table_div.innerHTML = '<p class="small_text"><span class=tooltip onClick="window.location.reload()">Reload</span> page to return to the table-formatted data.</p>' + '<pre>' + csv_output + '</pre>';
}

/* ******************************************************************
   Convert a table into csv and then send it through our csv to pre tool.
*/
function table2pre(table_id) {
    
    var table_div =  document.getElementById('div_'+table_id);
    // get the csv and drop the over_header rows.

    
    var csv_output;
    // Check to see if we've already created the csv output.
    if (table_div.innerHTML.match(/ALREADYCSV/)) { 
        csv_output = table_div.innerHTML;
    } else {
        csv_output = get_csv_output(table_id, 1);
    }
    var url = '/friv/csv2pre.cgi';
    var pars = 'ajax=1&csv=' + encodeURIComponent(csv_output);
    var table_div_name = 'div_' + table_id;
    var myAjax = new Ajax.Updater(
                                  table_div_name,
                                  url, 
                                  {
                                      method: 'post', 
                                      parameters: pars 
                                  }
    );
	    
}




function  get_node_inner_text (node) {
    // gets the text we want to use for sorting for a cell.
    // strips leading and trailing whitespace.
    // this is *not* a generic getInnerText function; it's special to sorttable.
    // for example, you can override the cell text with a customkey attribute.
    // it also gets .value for <input> fields.
    
    if (!node)
        return '';
    
    hasInputs = (typeof node.getElementsByTagName == 'function') &&
        node.getElementsByTagName('input').length;

    if (typeof node.textContent != 'undefined' && !hasInputs) {
        return node.textContent.replace(/^\s+|\s+$/g, '');
    }
    else if (typeof node.innerText != 'undefined' && !hasInputs) {
        return node.innerText.replace(/^\s+|\s+$/g, '');
    }
    else if (typeof node.text != 'undefined' && !hasInputs) {
        return node.text.replace(/^\s+|\s+$/g, '');
    }
    else {
        switch (node.nodeType) {
        case 3:
            if (node.nodeName.toLowerCase() == 'input') {
                return node.value.replace(/^\s+|\s+$/g, '');
            }
        case 4:
            return node.nodeValue.replace(/^\s+|\s+$/g, '');
            break;
        case 1:
        case 11:
            var innerText = '';
            for (var i = 0; i < node.childNodes.length; i++) {
                innerText += sorttable.getInnerText(node.childNodes[i]);
            }
            return innerText.replace(/^\s+|\s+$/g, '');
            break;
        default:
            return '';
        }
    }
}

/* ******************************************************************
   Supporting functions: bundled here to avoid depending on a library
   ****************************************************************** */


/************************************************************************
<!--* Copyright 2002 by Mike Hall                                          *-->
<!--* Please see http://www.brainjar.com for terms of use.                 *-->
<!--************************************************************************-->*/
// Regular expressions for normalizing white space.
var whtSpEnds = new RegExp("^\\s*|\\s*$", "g");
var whtSpMult = new RegExp("\\s\\s+", "g");
// Regular expressions for setting class names.
function normalizeString(s) {
    s = s.replace(whtSpMult, " ");  // Collapse any multiple whites space.
    s = s.replace(whtSpEnds, "");   // Remove leading or trailing white space.
    return s;
}

var colClsNm = "sort_col";
var colTest = new RegExp(colClsNm, "");
var TURN_ON_HIDE_PARTIAL = 1;
var TURN_ON_HIDE_NON_QUALS = 1;
var LAST_COLUMN;

function recolor(tblEl, strTableName, col) {
	
    //alert("tblEl.id:"+tblEl.id+":");

    var i, j;
    var rowEl, cellEl;
    var do_highlight_column = 0;
    // Check to see if we actually got a table.
    //alert('0:'+tblEl + ':' + strTableName +':'+col+':'+LAST_COLUMN);
    if ((tblEl == null)  || (tblEl == '') ) {
	forEach(
		document.getElementsByTagName('table'), 
		function(table) {
                    if (table.id == strTableName) {
                        tblEl = table;
                    }
                }
		);
	//alert('1:'+tblEl + ':' + strTableName +':'+col+':'+LAST_COLUMN);
    }

    if (col == null){
        col = LAST_COLUMN;
	//alert('3:'+tblEl + ':' + strTableName +':'+col+':'+LAST_COLUMN);
    }
    
    
    //alert('4:'+tblEl + ':' + strTableName +':'+col+':'+LAST_COLUMN);
    // work through each column and calculate its type
    // Safari doesn't support table.tHead, sigh
    if (tblEl.tHead == null)
        tblEl.tHead = tblEl.getElementsByTagName('thead')[0];

    if (tblEl.tFoot == null)
        tblEl.tFoot = tblEl.getElementsByTagName('tfoot')[0];

    // Get a handle on the last head row in the thead tag for this
    // table.
    var lastHeadRow = tblEl.tHead.rows.length - 1; 
    var cntFootRows = tblEl.tFoot.rows.length; 
    var headrow = tblEl.tHead.rows[ lastHeadRow ].cells;
    var rankerCount = 0;
    var hasRankerColumn = 0;
    
    // Check the first columns to see if it is a ranker column.
    if (headrow[0].className.match(/\branker\b/)) { // We have a ranker column.
	hasRankerColumn = 1;
    }

    
    var do_hide_partial_rows = 1;
    // This is a column where we want to show all rows even partial ones.
    if (headrow[col].className.match(/\bshow_partial_when_sorting\b/)) {
        do_hide_partial_rows = 0;

        // This is to change the toggle depending on what we have here.
        var oSpan = document.getElementById(tblEl.id + '_toggle_'); 
        if (oSpan) {
            oSpan.innerHTML = oSpan.innerHTML.replace('Show','Hide');
            oSpan.style.backgroundColor = '#fff';
        }
    }
    else {
        var oSpan = document.getElementById(tblEl.id + '_toggle_'); 
        if (oSpan) {
            oSpan.innerHTML = oSpan.innerHTML.replace('Hide','Show');
            oSpan.style.backgroundColor = '#ff9';
        }

    }

    
    // For rate stats, we may want to hide non-qualifiers.
    var do_hide_non_quals = 0;
    // This is a column where we want to show all rows even partial ones.
    if (headrow[col].className.match(/\bhide_non_quals\b/)) {
        do_hide_non_quals = 1;

        // Check to see if there is a form sortables and a checkbox
        // hide_non_quals which if un-checked we override this.

        // This was removed because some pages had multiple
        // form_sortables on a single page
        
        // if(document.form_sortable  &&
        //   document.form_sortable.hide_non_quals  &&
        //   !document.form_sortable.hide_non_quals.checked
        //   )
        //    do_hide_non_quals = 0;

        if(document.getElementById('fs_' + tblEl.id)  &&
           document.getElementById('fs_' + tblEl.id).hide_non_quals  &&
           !document.getElementById('fs_'+ tblEl.id).hide_non_quals.checked
           )
            do_hide_non_quals = 0;

        //alert(tblEl.id + ":do_hide:" + do_hide_non_quals);
    }


  
    //  alert(col + ':HidePartials:' + do_hide_partial_rows + ':HideNonQuals:' + do_hide_non_quals);
    var is_row_hidden; 
    // Set style classes on each row to alternate their appearance.
    for (i = 0; i < tblEl.rows.length; i++) {
        is_row_hidden = 0;
        rowEl = tblEl.rows[i];
	
        if (TURN_ON_HIDE_PARTIAL) {
            // Do we want to hide or show partial seasons by default
            if (rowEl && do_hide_partial_rows && rowEl.className.match(/\bpartial_table\b/)) {
                rowEl.style.display = 'none';
                is_row_hidden = 1;
            }
	    // Turn on a row that may have been hidden before.
            else if (rowEl && !do_hide_partial_rows && rowEl.className.match(/\bpartial_table\b/)) {
                rowEl.style.display = '';
            }
        }

        if (TURN_ON_HIDE_NON_QUALS && !is_row_hidden) {
            // Do we want to hide or show partial seasons by default
            if (rowEl && do_hide_non_quals && rowEl.cells[col] &&
                (rowEl.className.match(/\bnon_qual\b/)
                 || rowEl.cells[col].className.match(/\bnon_qual\b/))
                ) {
                //alert(i+':non qual');
                rowEl.style.display = 'none';
                is_row_hidden = 1;
            }
            else if (rowEl && !do_hide_non_quals && rowEl.cells[col] && 
                     (rowEl.className.match(/\bnon_qual\b/)
                      || rowEl.cells[col].className.match(/\bnon_qual\b/))
                     ) {
                rowEl.style.display = '';
            }
            else {
                rowEl.style.display = '';
            }
        }
      
        // hide all interior_thead rows.
        if (rowEl.className.match(/\bthead\b/)) {
            rowEl.style.display = 'none';
            is_row_hidden = 1;
        }

	// Set the value here.
	if (hasRankerColumn 
	    && (!is_row_hidden)
	    && (i > lastHeadRow)
	    && (i < tblEl.rows.length - cntFootRows)
	    && (!rowEl.className.match(/\bno_ranker\b/))
	    && (!rowEl.className.match(/\bleague_average_table\b/))
	    && (!rowEl.className.match(/\bblank_table\b/))
	    && (!rowEl.className.match(/\bthead\b/))
            ){
	    rankerCount++;
	    rowEl.cells[0].innerHTML = rankerCount;
	}

      
        
    }
}
/// End of copied code.

/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
  document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
  var script = document.getElementById("__ie_onload");
  script.onreadystatechange = function() {
  if (this.readyState == "complete") {
  addLoadEvent(sorttable.init); // call the onload handler
  }
  };
  /*@end @*/

/* for Safari */
if (/WebKit/i.test(navigator.userAgent)) { // sniff
    var _timer = setInterval(function() {
            if (/loaded|complete/.test(document.readyState)) {
                addLoadEvent(sorttable.init); // call the onload handler
            }
        }, 10);
}

/* for other browsers */
addLoadEvent(sorttable.init);

    
// written by Dean Edwards, 2005
// with input from Tino Zijdel, Matthias Miller, Diego Perini

// http://dean.edwards.name/weblog/2005/10/add-event/

function dean_addEvent(element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else {
        // assign each event handler a unique ID
        if (!handler.$$guid) handler.$$guid = dean_addEvent.guid++;
        // create a hash table of event types for the element
        if (!element.events) element.events = {};
        // create a hash table of event handlers for each element/event pair
        var handlers = element.events[type];
        if (!handlers) {
            handlers = element.events[type] = {};
            // store the existing event handler (if there is one)
            if (element["on" + type]) {
                handlers[0] = element["on" + type];
            }
        }
        // store the event handler in the hash table
        handlers[handler.$$guid] = handler;
        // assign a global event handler to do all the work
        element["on" + type] = handleEvent;
    }
};
// a counter used to create unique IDs
dean_addEvent.guid = 1;

function removeEvent(element, type, handler) {
    if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
    } else {
        // delete the event handler from the hash table
        if (element.events && element.events[type]) {
            delete element.events[type][handler.$$guid];
        }
    }
};

function handleEvent(event) {
    var returnValue = true;
    // grab the event object (IE uses a global event object)
    event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
    // get a reference to the hash table of event handlers
    var handlers = this.events[event.type];
    // execute each event handler
    for (var i in handlers) {
        this.$$handleEvent = handlers[i];
        if (this.$$handleEvent(event) === false) {
            returnValue = false;
        }
    }
    return returnValue;
};

function fixEvent(event) {
    // add W3C standard event methods
    event.preventDefault = fixEvent.preventDefault;
    event.stopPropagation = fixEvent.stopPropagation;
    return event;
};
fixEvent.preventDefault = function() {
    this.returnValue = false;
};
fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
}

// Dean's forEach: http://dean.edwards.name/base/forEach.js
/*
  forEach, version 1.0
  Copyright 2006, Dean Edwards
  License: http://www.opensource.org/licenses/mit-license.php
*/

// array-like enumeration
    if (!Array.forEach) { // mozilla already supports this
        Array.forEach = function(array, block, context) {
            for (var i = 0; i < array.length; i++) {
                block.call(context, array[i], i, array);
            }
        };
    }

// generic enumeration
Function.prototype.forEach = function(object, block, context) {
    for (var key in object) {
        if (typeof this.prototype[key] == "undefined") {
            block.call(context, object[key], key, object);
        }
    }
};

// character enumeration
String.forEach = function(string, block, context) {
    Array.forEach(string.split(""), function(chr, index) {
            block.call(context, chr, index, string);
        });
};

// globally resolve forEach enumeration
var forEach = function(object, block, context) {
    if (object) {
        var resolve = Object; // default
        if (object instanceof Function) {
            // functions have a "length" property
            resolve = Function;
        } else if (object.forEach instanceof Function) {
            // the object implements a custom forEach method so use that
            object.forEach(block, context);
            return;
        } else if (typeof object == "string") {
            // the object is a string
            resolve = String;
        } else if (typeof object.length == "number") {
            // the object is array-like
            resolve = Array;
        }
        resolve.forEach(object, block, context);
    }
};

/* Workaround for getelementbyid because it matches name values as well as id values */
if (/msie/i.test (navigator.userAgent)) //only override IE
{
    document.nativeGetElementById = document.getElementById;
    document.getElementById = function(id)
	{
	    var elem = document.nativeGetElementById(id);
	    if(elem)
	    {
		//make sure that it is a valid match on id
		if(elem.attributes['id'].value == id)
		    {
			return elem;
		    }
		else
		    {
			//otherwise find the correct element
			for(var i=1;i<document.all[id].length;i++)
			    {
				if(document.all[id][i].attributes['id'].value == id)
				    {
					return document.all[id][i];
				    }
			    }
		    }
	    }
	    return null;
	};
}
