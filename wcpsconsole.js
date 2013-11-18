function initconsole()
    {
    var console = $('.console');
    var controller = console.console({
    promptLabel: 'WCPS> ',
    commandValidate:function(line){
        if (line == "") return false;
        else if (line == "help")
            return toggleDisplay('tutorial');
        else return true;
    },
    commandHandle:function(line){
        try { var ret = eval(line);
            if (typeof ret != 'undefined') return ret.toString();
            else return true; }
        catch (e) {
            // SPECTRUM FUNCTION
            // This code checks if the user typed 'spectrum(query)', such as spectrum(s(2) / s(1))
            // If so the true function is executed: spectrum_calc("query")
            string = JSON.parse(JSON.stringify(arguments))[0]; // http://markhansen.co.nz/javascript-optional-parameters/
            if((string.indexOf("spectrum(") != -1) && (string.substring(0,9) == "spectrum("))
                {
                string = string.substring(9,string.length - 1);
                if(hsdataset.point.length > 0)
                    {
                    spectrum_calc(string);
                    return "";
                    }
                else
                    {
                    return "Please first use the Spectrum button";
                    }
                }
            // END SPECTRUM FUNCTION
            else
                {
                return e.toString();
                }
        }
    },
    animateScroll:true,
    promptHistory:true,
    welcomeMessage:'PlanetServer console. Help opens the tutorial.'
    });
    controller.promptText('');
    }
function min(calculation)
    {
    calculation = minstr(calculation);
    var data = csv(calculation);
    return parseFloat(data.data);
    }
function max(calculation)
    {
    calculation = maxstr(calculation);
    var data = csv(calculation);
    return parseFloat(data.data);
    }
// RASDAMAN COMMUNITY VERSIONS
// function minstr(calculation)
    // {
    // calculation = band2data(calculation.toString());
    // var nodata = hsdataset.nodata;
    // if(nodata > 0)
        // {
        // return 'min(' + calculation + ')';
        // }
    // else
        // {
        // return 'min(((' + calculation + ')=' + nodata + ') * ((' + calculation + ') + 1) + ((' + calculation + ')!=' + nodata + ') *  (' + calculation + '))';
        // }
    // }
// function maxstr(calculation)
    // {
    // calculation = band2data(calculation.toString());
    // var nodata = hsdataset.nodata;
    // return 'max(((' + calculation + ')!=' + nodata + ') * (' + calculation + '))';
    // }
function maxstr(calculation)
    {
    calculation = band2data(calculation.toString());
    return 'max(' + calculation + ')';
    }
function minstr(calculation)
    {
    calculation = band2data(calculation.toString());
    return 'min(' + calculation + ')';
    }

function band2data(string)
    {
    // http://stackoverflow.com/questions/504219/javascript-add-or-subtract-from-number-in-string
    string = string.replace(/band(\d+)/g, function(a,n)
        {
        if(hsdataset.metadata.bbl[n-1] == 0)
            {
            return "BAD";
            }
        else
            {
            return "data." + (+n-1);
            }
        });
    if(string.indexOf("BAD") != -1)
        {
        return -1;
        }
    else
        {
        return string;
        }
    }
function csv(string)
    {
    string = band2data(string.toString());
    var collection = hsdataset.collection;
    var wcpsquery = 'for data in ( ' + collection + ' ) return encode( ' + string + '), "csv" )';
    var url = 'wcps.php?use=csv&query=' + wcpsquery.replace(/\+/g, '%2B');
    /* TODO:
    var url = planetserver_wcps + '?query=' + encodeURIComponent(wcpsquery);
    But also convert the wcps.php?use=csv code to JS
    */
    return JSON.parse(getBinary(url));
    }
function worldfile()
    {
    xres = Math.abs((hsdataset.xmax - hsdataset.xmin) / hsdataset.width);
    yres = Math.abs((hsdataset.ymax - hsdataset.ymin) / hsdataset.height);
    ulx = hsdataset.xmin + (0.5 * xres);
    uly = hsdataset.ymax - (0.5 * yres);
    yres = -yres;
    return xres + "\n0\n0\n" + yres + "\n" + ulx + "\n" + uly;
    }
// function urlencode(string)
    // {
    // string = string.replace(/\+/g, '%2B');
    // string = string.replace(/\n/g, '%0A');
    // return string;
    // }
function image(string, tocstring)
    {
    tocstring = (typeof tocstring === "undefined") ? "" : tocstring;
    // if(sp.hasOwnProperty(string))
        // {
        // string = sp[string];
        // }
    datastring = band2data(string.toString());
    if(datastring != -1)
        {
        var collection = hsdataset.collection;
        if(maxstretch == 0)
            {
            maxstretch = maxstr(datastring);
            }
        //min_value = minstr(datastring);
        var startwcps = 'for data in ( ' + collection + ' ) return encode(';
        if($("#savecheck").attr('checked') == "checked")
            {
            var wcpsquery = startwcps + ' (float) ' + datastring + ', "GTiff", "NODATA=65535")';
            var gtiffurl = planetserver_wcps + '/' + filename + '?query=' + encodeURIComponent(wcpsquery);
            window.open(gtiffurl,"_blank");
            //window.open(pgwurl,"_parent");
            }
        else
            {
            if(minstretch == 0)
                {
                var wcpsquery = startwcps + ' (char) (255 / ' + maxstretch + ') * (' + datastring + '), "png", "NODATA=255")';
                }
            else
                {
                var wcpsquery = startwcps + ' (char) (255 / (' + maxstretch + ' - ' + minstretch + ')) * ((' + datastring + ') - ' + minstretch + '), "png", "NODATA=255" )';
                }
            var pngurl = planetserver_wcps + '?query=' + encodeURIComponent(wcpsquery);
            var i = PNGimages.length;
            var temp = {};
            temp.type = "greyscale";
            temp.base64 = base64Encode(getBinary(pngurl));
            temp.wcps = wcpsquery;
            if(tocstring != "")
                {
                temp.string = tocstring;
                }
            else
                {
                temp.string = checkpredef(string);
                }
            imagedata[i] = temp;
            PNGimages[i] = new OpenLayers.Layer.Image(
                string,
                'data:image/png;base64,' + temp.base64,
                hsdataset.bbox,
                new OpenLayers.Size(hsdataset.width, hsdataset.height),
                hsdataset.mapoptions
                );
            map.addLayers([PNGimages[i]]);
            if (i == 1)
                var html = '&nbsp;<input class="pnglayer" type="checkbox" value="'+ i +'" checked="true"/>' + imagedata[i].string;
            else
                var html = '</br>&nbsp;<input class="pnglayer" type="checkbox" value="'+ i +'" checked="true"/>' + imagedata[i].string;
            $("#pngselect").append(html);
            // SHOW/HIDE PNG IMAGE WHEN CHECKED OR UNCHECKED
            $('.pnglayer').change(function() {
                i = $(this).val();
                //alert(i);
                if ($(this).is(':checked')) {
                    // the checkbox was checked
                    PNGimages[i].setVisibility(true);
                } 
                else {
                    // the checkbox was unchecked
                    PNGimages[i].setVisibility(false);        
                }
            });
            return wcpsquery;
            }
        }
    else
        {
        return "You used bad band(s)!";
        }
    }
function bdimage(low, center, high)
    {
    string = banddepth(low, center, high);
    image(string, "banddepth(" + low + "," + center + "," + high + ")");
    }
function rgbimage(red,green,blue)
    {
    // if(sp.hasOwnProperty(red))
        // {
        // red = sp[red];
        // }
    // if(sp.hasOwnProperty(green))
        // {
        // green = sp[green];
        // }
    // if(sp.hasOwnProperty(blue))
        // {
        // blue = sp[blue];
        // }
    red = band2data(red.toString());
    green = band2data(green.toString());
    blue = band2data(blue.toString());
    if((red != -1) || (green != -1) || (blue != -1))
        {
        var collection = hsdataset.collection;
        maxred_value = maxstr(red);
        //minred_value = minstr(red);
        maxgreen_value = maxstr(green);
        //mingreen_value = minstr(green);
        maxblue_value = maxstr(blue);
        //minblue_value = minstr(blue);
        var startwcps = 'for data in ( ' + collection + ' ) return encode(';
        if($("#savecheck").attr('checked') == "checked")
            {
            wcpsquery = startwcps + ' {red: (float) ' + red + '; green: (float) ' + green + '; blue: (float) ' + blue + '}, "GTiff", "NODATA=65535;65535;65535" )';
            var gtiffurl = planetserver_wcps + '/' + filename + '?query=' + encodeURIComponent(wcpsquery);
            window.open(gtiffurl,"_blank");
            //window.open(pgwurl,"_parent");
            }
        else
            {
            if(minstretch == 0)
                {
                wcpsquery = startwcps + ' {red: (char) (255 / ' + maxred_value + ') * (' + red + '); green: (char) (255 / ' + maxgreen_value + ') * (' + green + '); blue: (char) (255 / ' + maxblue_value + ') * (' + blue + ')}, "png", "NODATA=255;255;255" )';
                }
            else
                {
                wcpsquery = startwcps + ' {red: (char) (255 / (' + maxred_value + ' - ' + minstretch + ')) * ((' + red + ') - ' + minstretch + '); green: (char) (255 / (' + maxgreen_value + ' - ' + minstretch + ')) * ((' + green + ') - ' + minstretch + '); blue: (char) (255 / (' + maxblue_value + ' - ' + minstretch + ')) * ((' + blue + ') - ' + minstretch + ')}, "png", "NODATA=255;255;255" )';
                }
            var pngurl = planetserver_wcps + '?query=' + encodeURIComponent(wcpsquery);
            var i = PNGimages.length;
            var temp = {};
            temp.type = "RGB";
            temp.base64 = base64Encode(getBinary(pngurl));
            temp.wcps = wcpsquery;
            temp.string = checkpredef(red) + ";" + checkpredef(green) + ";" + checkpredef(blue);
            imagedata[i] = temp;
            PNGimages[i] = new OpenLayers.Layer.Image(
                "RGB",
                'data:image/png;base64,' + temp.base64,
                hsdataset.bbox,
                new OpenLayers.Size(hsdataset.width, hsdataset.height),
                hsdataset.mapoptions
                );
            map.addLayers([PNGimages[i]]);
            if (i == 1)
                var html = '&nbsp;<input class="pnglayer" type="checkbox" value="'+ i +'" checked="true"/>' + imagedata[i].string;
            else
                var html = '</br>&nbsp;<input class="pnglayer" type="checkbox" value="'+ i +'" checked="true"/>' + imagedata[i].string;
            $("#pngselect").append(html);
            // SHOW/HIDE PNG IMAGE WHEN CHECKED OR UNCHECKED
            $('.pnglayer').change(function() {
                i = $(this).val();
                //alert(i);
                if ($(this).is(':checked')) {
                    // the checkbox was checked
                    PNGimages[i].setVisibility(true);
                } 
                else {
                    // the checkbox was unchecked
                    PNGimages[i].setVisibility(false);        
                }
            });
            return wcpsquery;
            }
        }
    else
        {
        return "You used bad band(s)!";
        }
    }
function histogramtocsv(numbers)
    {
    string = "BIN,COUNT\n";
    for(var i = 0; i < numbers.length; i++)
        {
        j = i + 1;
        string = string + j + "," + numbers[i] + "\n";
        }
    return string;
    }
function histogram(string, nrbins)
{
    var nodata = hsdataset.nodata;
    var collection = hsdataset.collection;
    var wcpsstring = 'wcps.php?use=histogram&nrbins='+ nrbins +'&collection=' + collection + '&nodata=' + nodata + '&calc=' + string;
    /*Change into BarDiagram.js???*/
    // extract numbers from the query using regex
    var numbers = getBinary(wcpsstring).match(/\d+\.?\d*/g);
    // find the largest entry to determine the range of the plot
    var n = Math.max.apply( null, numbers);
    var mult = Math.pow(10, 2 - Math.floor(Math.log(n) / Math.LN10) - 1); //round to two s.f.
    var n = Math.round(n * mult) / mult;
    var largest = n * 1.1;
    // Switch to HISTOGRAM TAB and then plot the histogram
    diagramplot.histogram = numbers;
    switch_tabs($('.histtab'));
    $.jqplot.config.enablePlugins = true;
    hist = $.jqplot('histPlace', [numbers], {
         title: collection,
         seriesDefaults:{
             renderer: $.jqplot.BarRenderer,
             rendererOptions: {
                barMargin: 5
            },
            showMarker: false,
            pointLabels: { show: false }
        },
        axes: {
            xaxis: {
                renderer:  $.jqplot.CategoryAxisRenderer,
                pad: 0
            },
            yaxis: {
                min: 0,
                max: largest
            }
        },
        highlighter: {
            sizeAdjust: 7.5
        },
        cursor: {
            show: false
        }
    });
    hist.replot();
}
function lltoimagecrs(lon,lat)
    {
    xmin = hsdataset.xmin;
    xmax = hsdataset.xmax;
    ymin = hsdataset.ymin;
    ymax = hsdataset.ymax;
    width = hsdataset.width;
    height = hsdataset.height;
    if(inextent(lat,lon))
        {
        imx = (lon - xmin) * (width / (xmax - xmin));
        imy = (ymax - lat) * (height / (ymax - ymin)); // The WCPS CRS:1 origin is top-left, so reverse order.
        imx = parseInt(Math.floor(imx));
        imy = parseInt(Math.floor(imy));
        return [imx, imy];
        }
    else
        {
        return false;
        }
    }
// function ll2imgcrs(lon,lat)
    // {
    // //CRS:1 0,0 is upper left
    // var xmin = hsdataset.xmin;
    // var xmax = hsdataset.xmax;
    // var ymin = hsdataset.ymin;
    // var ymax = hsdataset.ymax;
    // var width = hsdataset.width;
    // var height = hsdataset.height;
    // var xa = Math.abs(xmax - xmin) / width;
    // var ya = Math.abs(ymax - ymin) / height;
    // var x = Math.floor(Math.abs(lon - xmin) / xa);
    // var y = Math.floor(Math.abs(lat - ymax) / ya);
    // return [x,y];
    // }
function inextent(lat,lon)
    {
    xmin = hsdataset.xmin;
    xmax = hsdataset.xmax;
    ymin = hsdataset.ymin;
    ymax = hsdataset.ymax;
    if((lon > xmin) && (lon < xmax) && (lat > ymin) && (lat < ymax))
        {
        return true;
        }
    else
        {
        return false;
        }
    }
function show(dict)
    {
    var string = "";
    for (var key in dict) {string = string + key + "\n"}
    return string;
    }

function p(i)
    {
    var string = "";
    if(typeof(hsdataset.ratio_divisor) != "undefined")
        {
        string = string + "Ratio: " + hsdataset.ratio_divisor.lonlat + "\n"
        }
    if(i == null)
        {
        for (var key in hsdataset.point)
            {
            string = string + "Spectrum " + colors[parseInt(key)] + ": " + hsdataset.point[key].lonlat + "\n"
            }
        return string;
        }
    else
        {
        if(i <= hsdataset.point.length)
            {
            return hsdataset.point[i - 1].lonlat;
            }
        }
    }
function s(i)
    {
    if(i == null)
        {
        var string = "";
        for (var key in hsdataset.point)
            {
            count = parseInt(key) + 1;
            string = string + "Point" + (count) + ": " + hsdataset.point[key].spectrum + "\n"
            }
        return string;
        }
    else
        {
        if(i <= hsdataset.point.length)
            {
            return hsdataset.point[i - 1].spectrum;
            }
        }
    }
function spectrum_load(numbers,colors,title)
{
    // Switch to SPECTRUM TAB and then plot the spectrum
    switch_tabs($('.defaulttab'));
    diagramplot.spectra = numbers;
    $.jqplot.config.enablePlugins = true;
    spectra = $.jqplot('chartPlace', numbers, {
        title: title,
        cursor: {
            show: true,
            zoom : true
        },
        highlighter : {
            show : true
        },
        series: [{breakOnNull: true}],
        seriesDefaults: {
            renderer: $.jqplot.LineRenderer,
            lineWidth: 1,
            rendererOptions: {
                smooth: true,
                animation: {
                    show: true
                }
            },
            showMarker: false,
            pointLabels: {
                show: false
            }
        },
        axes: {
            xaxis: {
                pad: 1.1
            },
            yaxis: {
                pad: 1.1
            }
        },
        seriesColors: colors
    });
    spectra.replot();
}
function spectrum_calc(string)
    {
    var cnt = 0;
    string = string.replace(/s\((\d+)\)/g, function(a,n)
        { 
        if(n > cnt)
            {
            cnt = n;
            }
        return "s(" + (+n) + ")[i][1]";
        });
    var numbers = [];
    var pointcnt = 0
    for (var key in hsdataset.point)
        {
        pointcnt = parseInt(key) + 1;
        }
    if(cnt <= pointcnt)
        {
        numbers = []
        try
            {
            for(var i = 0; i < hsdataset.point[0].spectrum.length; i++)
                {
                var out = eval(string);
                if(isNaN(out))
                    {
                    out = null;
                    }
                if(out == Infinity)
                    {
                    out = null;
                    }
                if(out == 0)
                    {
                    out = null;
                    }
                var wavelength = hsdataset.metadata.wavelength[i];
                numbers.push([wavelength, out]);
                }
            spectrum_load([numbers],["Red"]);
            }
        catch(e)
            {
            return "Wrong query!";
            }
        }
    else
        {
        return "s(" + cnt + ") isn't defined!";
        }
    }
function spectrumtocsv(numbers)
    {
    headerstring = "WAVELENGTH,";
    for(var i = 0; i < numbers.length; i++)
        {
        spectrumcolumn = "SPECTRUM" + (i + 1);
        headerstring = headerstring + spectrumcolumn + ",";
        }
    string = headerstring + "\n";
    for(var i = 0; i < numbers[0].length; i++)
        {
        string = string + numbers[0][i][0] + "," + numbers[0][i][1];
        for(var j = 1; j < numbers.length; j++)
            {
            string = string + "," + numbers[j][i][1];
            }
        string = string + "\n";
        }
    return string;
    }
function crosssectiontocsv(numbers)
    {
    string = "METER,ELEVATION\n";
    for(var i = 0; i < numbers[0].length; i++)
        {
        string = string + numbers[0][i][0] + "," + numbers[0][i][1] + "\n";
        }
    return string;
    }
function crossdiagram(numbers)
    {
    var nodata = dtmdataset.nodata;
        
    // Switch to CROSS TAB and then plot the cross diagram
    switch_tabs($('.crosstab'));
    diagramplot.crosssection = numbers;
    $.jqplot.config.enablePlugins = true;
    cross = $.jqplot('crossPlace', numbers, {
        title: 'Cross Section',
        cursor: {
            show: true,
            zoom : true
        },
        highlighter : {
            show : true
        },
        series: [{breakOnNull: true}],
        seriesDefaults: {
            renderer: $.jqplot.LineRenderer,
            lineWidth: 1,
            rendererOptions: {
                smooth: true,
                animation: {
                    show: true
                }
            },
            showMarker: false,
            pointLabels: {
                show: false
            }
        }
    });
    cross.replot();
    }
function crosssection(lon1,lat1,lon2,lat2)
    {
    // var gcdistance = OpenLayers.Util.distVincenty(
          // {lon: dtmdataset.templonlat.lon, lat: dtmdataset.templonlat.lat},
          // {lon: lonlat.lon, lat: lonlat.lat}
        // )
    // var datares = Math.abs((dtmdataset.xmax - dtmdataset.xmin) / dtmdataset.width);
    // var nrpoints = parseInt(gcdistance / datares);
    var response = JSON.parse(getBinary('cgi-bin/greatcircle.cgi?nrpoints=' + nrpoints + '&lon1=' + lon1 + '&lat1=' + lat1 + '&lon2=' + lon2 + '&lat2=' + lat2));
    var values = [];
    for(var i = 0; i < nrpoints; i++)
        {
        lon = response[0][i];
        lat = response[1][i];
        var distancecount = OpenLayers.Util.distVincenty(
              {lon: lon2, lat: lat2},
              {lon: lon, lat: lat}
            )
        wcpsquery = 'for data in ( ' + dtmdataset.collection + ' ) return encode(  (data[x:"' + dtmdataset.crs + '"(' + lon + ':' + lon + '),y:"' + dtmdataset.crs + '"(' + lat + ':' + lat + ')]), "csv")';
        url = 'wcps.php?use=csv&query=' + encodeURIComponent(wcpsquery);
        elevation = JSON.parse(getBinary(url));
        values.push([distancecount,parseFloat(elevation.data)]);
        }
    crossdiagram([values]);
    }
// function crosssection(lon1,lat1,lon2,lat2)
    // {
    // // Waiting for http://earthserver.eu/trac/ticket/57
    // var collection = dtmdataset.collection;
    // im1 = lltoimagecrs(lon1,lat1);
    // im2 = lltoimagecrs(lon2,lat2);
    // a = (im2[1] - im1[1]) / (im2[0] - im1[0]);
    // b = im1[1] - (a * im1[0]);
    // if(b < 0)
        // {
        // b = ' - ' + -b;
        // }
    // else
        // {
        // b = ' + ' + b;
        // }
    
    // calculation = 'for data in (' + collection + ') return coverage crossSection over $X in [' + im1[0] + ':' + im2[0] + '] values data[x($X),y(' + a + ' * $X' + b + ')]';
    // // var data = 'wcps.php?use=csv&query=' + calculation;
    // return calculation;
    // }
function getz(lon,lat)
    {
    wcpsquery = 'for data in ( ' + dtmdataset.collection + ' ) return encode(  (data[x:"' + dtmdataset.crs + '"(' + lon + ':' + lon + '),y:"' + dtmdataset.crs + '"(' + lat + ':' + lat + ')]), "csv")';
    url = 'wcps.php?use=csv&query=' + encodeURIComponent(wcpsquery);
    elevation = JSON.parse(getBinary(url));
    alert(elevation.data);
    }
function noratio()
    {
    vector_layer2.destroyFeatures();
    delete hsdataset.ratio_divisor;
    }
function loadmetadata()
    {
    var meanlist = [];
    var stddevlist = [];
    var minlist = [];
    var maxlist = [];
    for(var i = 0; i < hsdataset.metadata.mean.length; i++){
        var wavelength = hsdataset.metadata.wavelength[i];
        meanlist.push([wavelength, hsdataset.metadata.mean[i]]);
        stddevlist.push([wavelength, hsdataset.metadata.stddev[i]]);
        minlist.push([wavelength, hsdataset.metadata.minimum[i]]);
        maxlist.push([wavelength, hsdataset.metadata.maximum[i]]);
    }
    spectrum_load([meanlist,stddevlist,minlist,maxlist],["Black","Red","Green","Blue"],"Black:Mean, Red:Stddev, Green:Min, Blue:Max");
    }
function resetspectra()
    {
    spectrum_load([[0]],["Black"],"");
    pos = 0;
    full = 0;
    hsdataset.point = [];
    vector_layer.destroyFeatures();
    noratio();
    loadmetadata();
    }
function addspectrum(lon,lat)
    {
    if((lon === undefined) && (lon === undefined)) {
        var lon = hsdataset.lonlat.lon;
        var lat = hsdataset.lonlat.lat;
    }
    // The following code is also used by fire(e) in planetmap.events.js
    if(getxspectrum(lon,lat))
        {
        var origin = {x:lon, y:lat}; 
        var circleout = new OpenLayers.Geometry.Polygon.createRegularPolygon(origin, pointsize, 50);
        var circle = new OpenLayers.Feature.Vector(circleout, {fcolor: colors[pos]});
        vector_layer.addFeatures(circle);
        pos++;
        if (pos == nrclicks) {
            pos = 0; // wrap around
        }
        }
    }
function getxspectrum(lon,lat)
    {
    var collection = hsdataset.collection;
    var xmin = hsdataset.xmin;
    var xmax = hsdataset.xmax;
    var ymin = hsdataset.ymin;
    var ymax = hsdataset.ymax;
    // if you click within the extent of the WCPS PNG:
    if((lon >= xmin) && (lon <= xmax) && (lat >= ymin) && (lat <= ymax))
        {
        xy = lltoimagecrs(lon,lat);
        imagex = xy[0];
        imagey = xy[1];
        var i = Math.floor(binvalue/2);
        xplus = (imagex + i).toString();
        xmin = (imagex - i).toString();
        yplus = (imagey + i).toString();
        ymin = (imagey - i).toString();
        var response = getBinary(planetserver_wcps + '?query=for data in ( ' + hsdataset.collection + ' ) return encode(  (data[x:"CRS:1"(' + xmin + ':' + xplus + '),y:"CRS:1"(' + ymin + ':' + yplus + ')]), "csv")');
        var spectrabin = getbin(response);
        if(spectrabin != -1)
            {
            if (pos == (nrclicks - 1)) {
                full = 1; // turn on the full flag
            }
            
            var avgspectrum = avgbin(spectrabin);
            var values = [];
            if(hsdataset.ratio_divisor === undefined)
                {
                for(var i = 0; i < avgspectrum.length; i++){
                    var wavelength = hsdataset.metadata.wavelength[i];
                    if(avgspectrum[i] != hsdataset.nodata){
                        values.push([wavelength,avgspectrum[i]]);
                    }
                    else {
                        values.push([wavelength,null]);
                    }
                }
                }
            else
                {
                for(var i = 0; i < avgspectrum.length; i++){
                    var wavelength = hsdataset.metadata.wavelength[i];
                    if((hsdataset.ratio_divisor.divisor[i] == null) || (avgspectrum[i] == null))
                        {
                        values.push([wavelength,null])
                        }
                    else
                        {
                        var ratio = parseFloat(avgspectrum[i],10)/parseFloat(hsdataset.ratio_divisor.divisor[i],10);
                        if(ratio > 10)
                            {
                            values.push([wavelength,null])
                            }
                        else
                            {
                            values.push([wavelength,ratio])
                            }
                        }
                }
                }
            hsdataset.values = values;
            spectrum_load([values],["#4bb2c5"],hsdataset.collection);
            
            var locdata = {}
            var lonlat = new OpenLayers.LonLat(lon, lat);
            locdata.lonlat = lonlat;
            locdata.spectrum = values;
            hsdataset.point[pos] = locdata;
            if (full == 1) {
                var output = [];
                for (i=0; i<nrclicks; i++) {
                    output.push(hsdataset.point[i].spectrum);
                }
                spectrum_load(output,colors,hsdataset.collection);
            }
            else {
                var output = [];
                for (i=0; i <= pos; i++) {
                    output.push(hsdataset.point[i].spectrum);
                }
                spectrum_load(output,colors,hsdataset.collection);
            }
            return true;
            }
        else
            {
            return false;
            }
        }
    else
        {
        return false;
        }
    }
function chooseratio(lon,lat)
    {
    if((lon === undefined) && (lon === undefined)) {
        var lon = hsdataset.lonlat.lon;
        var lat = hsdataset.lonlat.lat;
    }
    vector_layer2.destroyFeatures(); // destroy the points from the series
    if(getyspectrum(lon,lat))
        {
        var origin = {x:lon, y:lat}; 
        var circleout = new OpenLayers.Geometry.Polygon.createRegularPolygon(origin, pointsize, 50);
        vector_layer2.addFeatures(new OpenLayers.Feature.Vector(circleout)); 
        }
    }
function getyspectrum(lon,lat)
    {
    var collection = hsdataset.collection;
    var xmin = hsdataset.xmin;
    var xmax = hsdataset.xmax;
    var ymin = hsdataset.ymin;
    var ymax = hsdataset.ymax;
    // if you click within the extent of the WCPS PNG:
    if((lon >= xmin) && (lon <= xmax) && (lat >= ymin) && (lat <= ymax))
        {
        xy = lltoimagecrs(lon,lat);
        imagex = xy[0];
        imagey = xy[1];
        var i = Math.floor(binvalue/2);
        xplus = (imagex + i).toString();
        xmin = (imagex - i).toString();
        yplus = (imagey + i).toString();
        ymin = (imagey - i).toString();
        var response = getBinary(planetserver_wcps + '?query=for data in ( ' + hsdataset.collection + ' ) return encode(  (data[x:"CRS:1"(' + xmin + ':' + xplus + '),y:"CRS:1"(' + ymin + ':' + yplus + ')]), "csv")');
        var spectrabin = getbin(response);
        if(spectrabin != -1)
            {
            var avgspectrum = avgbin(spectrabin);
            var values = [];
            for(var i = 0; i < avgspectrum.length; i++){
                var wavelength = hsdataset.metadata.wavelength[i];
                if(avgspectrum[i] != hsdataset.nodata){
                    values.push([wavelength,avgspectrum[i]]);
                }
                else {
                    values.push([wavelength,null]);
                }
            }
            var locdata = {}
            var lonlat = new OpenLayers.LonLat(lon, lat);
            locdata.lonlat = lonlat;
            locdata.spectrum = values;
            locdata.divisor = avgspectrum;
            hsdataset.ratio_divisor = locdata;
            spectrum_load([values],["#4bb2c5"],hsdataset.collection);
            return true;
            }
        else
            {
            return false;
            }
        }
    else
        {
        return false;
        }
    }
function getbin(response)
    {
    //response = response.substring(1,response.length - 1);
    response = response.replaceAll("{","");
    response = response.replaceAll("}","");
    response = response.replaceAll("\"","");
    hsdataset.response = response;
    var binlist = response.split(",");
    var spectrabin = []
    var outside = binlist.length;
    var k = 0;
    for(var i = 0; i < binlist.length; i++)
        {
        var temp = binlist[i].split(" ");
        numbers = [];
        var count = 0;
        for(var j = 0; j < temp.length; j++)
            {
            if((temp[j] == hsdataset.nodata) || (temp[j] == 0))
                {
                numbers.push(null);
                count++;
                }
            else
                {
                numbers.push(parseFloat(temp[j], 10));
                }
            }
        if(count != numbers.length)
            {
            spectrabin[k] = numbers;
            k++;
            }
        }
    if(k > 0)
        {
        return spectrabin;
        }
    else
        {
        return -1;
        }
    }
function avgbin(spectrabin)
    {
    var numbers = [];
    for(var i = 0; i < spectrabin[0].length; i++)
        {
        sum = 0
        count = spectrabin.length
        for(var j = 0; j < spectrabin.length; j++)
            {
            if(spectrabin[j][i] === null)
                {
                count--;
                }
            else
                {
                sum = sum + spectrabin[j][i];
                }
            }
        number = sum / count;
        if(isNaN(number))
            {
            numbers.push(null);
            }
        else
            {
            numbers.push(parseFloat(number, 10));
            }
        }
    return numbers;
    }
function bin(value)
    {
    i = Math.floor(value/2);
    binvalue = ((2*i) + 1);
    if(binvalue > maxbin)
        {
        binvalue = maxbin;
        return "Using maximum bin of " + binvalue + "x" + binvalue;
        }
    else
        {
        return "Using bin " + binvalue + "x" + binvalue;
        }
    }
    