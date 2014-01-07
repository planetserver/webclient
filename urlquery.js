var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();

function checksinglecollection()
    {
    if(typeof(QueryString.productid) != "undefined")
        {
        hsdataset.vnir.productid = QueryString.productid.toLowerCase().replace("l_","s_");
        hsdataset.vnir.collection = hsdataset.vnir.productid + "_" + pcversion + "_" + ptversion;
        hsdataset.ir.productid = QueryString.productid.toLowerCase().replace("s_","l_");
        hsdataset.ir.collection = hsdataset.ir.productid + "_" + pcversion + "_" + ptversion;
        consolestring = "";
        if(typeof(QueryString.console) != "undefined")
            {
            consolestring = decodeURIComponent(QueryString.console);
            }
        hyperspectral_load(consolestring);
        }
    }
function checkregion()
    {
    if(typeof(QueryString.region) != "undefined")
        {
        var options = $('#chooseregion option');
        $.map(options ,function(option) {
            if(option.value == QueryString.region)
                {
                $("#chooseregion").val(QueryString.region);
                $('#chooseregion').change();
                }
        });
        }
    }
function checkmrdr()
    {
    if(typeof(QueryString.mrdr) != "undefined")
        {
        for(productid in mrdr)
            {
            if(QueryString.mrdr.toUpperCase() == productid)
                {
                loadmrdr(productid); //loadregion.js
                }
            }
        }
    }
