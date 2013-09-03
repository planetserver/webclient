var footprints;
var highlightCtrl;
var selectCtrl;
var curiosity;
//var GaleHRSCWms;
//var GaleCTXWms;

function dtm_load()
    {
    // $("#x3d").css(
    // {
        // 'display': ''
    // });
    $("#spectra").css(
    {
        'display': ''
    });
    switch_tabs($('.crosstab'));
    //crossdiagram([[0,0,0,0,0,0,0,0,0]]); // a test plot
    
    data = JSON.parse(getBinary('wcps.php?use=metadata&collection=' + dtmdataset.collection));
    dtmdataset.xmin = data.xmin;
    dtmdataset.xmax = data.xmax;
    dtmdataset.ymin = data.ymin;
    dtmdataset.ymax = data.ymax;
    dtmdataset.width = data.width;
    dtmdataset.height = data.height;
    }

function loadmrdr(productid)
    {
    data = mrdr[productid];
    getODEfootprints('CRISM footprints',data.westernlon,data.easternlon,data.minlat,data.maxlat);
    
    // WMS
    temp = new OpenLayers.Layer.MapServer(data.wms.name,
        planetserver_ms_wms,
        { map: data.wms.map, layers: data.wms.layer, projection: data.wms.projection},
        {isBaseLayer: false, transitionEffect: 'resize'});
    map.addLayers([temp]);
    WMSlayers[0] = temp;
    map.addLayers([footprints]);
    map.zoomToExtent(footprints.getDataExtent());
    }
    
function initloadregion()
    {
    for(region in regions)
        {
        $("#chooseregion").append("<option value='" + region + "'>" + regions[region].name + "</option>");
        }
    
    $('#chooseregion').change(function()
        {
        if($('#chooseregion').val() != '')
            {
            region = $('#chooseregion').val();
            data = regions[region];
            getODEfootprints('CRISM footprints',data.westernlon,data.easternlon,data.minlat,data.maxlat);
            
            // WMS
            // Remove previously loaded WMS layers
            for(var i = 0; i < WMSlayers.length; i++)
                {
                map.removeLayer(WMSlayers[i]);
                }
            // Add new WMS layers
            wms = data['wms'];
            for(var i = 0; i < wms.length; i++)
                {
                temp = new OpenLayers.Layer.MapServer(wms[i].name,
	                planetserver_ms_wms,
	                { map: wms[i].map, layers: wms[i].layer, projection: wms[i].projection},
                    {isBaseLayer: false, transitionEffect: 'resize'});
                map.addLayers([temp]);
                WMSlayers[i] = temp;
                }
            map.addLayers([footprints]);
            map.zoomToExtent(footprints.getDataExtent());
            
            // DTM
            dtm = data['dtm'];
            for(var i = 0; i < dtm.length; i++)
                {
                $('#choosedtm').append("<option value='" + dtm[i].collection + "'>" + dtm[i].name + "</option>");
                }
            $('#choosedtm').change(function()
                {
                if($('#choosedtm').val() != '')
                    {
                    if($('#choosedtm').val() == 'mola')
                        {
                        // clone dtmdefault into dtmdataset
                        // dtmdataset = dtmdefault; doesnt work.
                        dtmdataset = jQuery.extend({}, dtmdefault);
                        }
                    else
                        {
                        dtmdataset.collection = $('#choosedtm').val();
                        dtm_load();
                        }
                    }
                });
            }
        });
    }

function add_curiosity_location()
    {
    // CURIOSITY LANDING SITE
    // features (http://openlayers.org/dev/examples/vector-features-with-text.html)
    // allow testing of specific renderers via "?renderer=Canvas", etc
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    
    curiosity = new OpenLayers.Layer.Vector("Curiosity", {
        styleMap: new OpenLayers.StyleMap({'default':{
            strokeColor: "black",
            strokeOpacity: 1,
            strokeWidth: 1,
            fillColor: "red",
            fillOpacity: 1,
            pointRadius: 5,
            pointerEvents: "visiblePainted",
            
            // externalGraphic: "images/curiosity.png",
            // graphicXOffset :  -10, 
            // graphicYOffset :  -8, 
            // graphicWidth   : 20, 
            // graphicHeight  : 16, 
            // rotation:0,
            
            label : "${name}",
            
            fontColor: "${favColor}",
            fontSize: "12px",
            fontFamily: "Verdana",
            fontWeight: "bold",
            labelAlign: "${align}",
            labelXOffset: "${xOffset}",
            labelYOffset: "${yOffset}",
            labelOutlineColor: "black",
            labelOutlineWidth: 1
        }}),
        renderers: renderer
    });
    // create points feature
    var curiosity_point = new OpenLayers.Geometry.Point(137.44,-4.59);
    var curiosity_feature = new OpenLayers.Feature.Vector(curiosity_point);
    curiosity_feature.attributes = {
        name: "Curiosity\nlanding site",
        favColor: 'white',
        align: "cm",
        xOffset: 0,
        yOffset: 100
    };
    
    curiosity.addFeatures([curiosity_feature]);
    map.addLayers([curiosity]);
    curiosity.setZIndex(1500);
    }

function getODEfootprints(name,westernlon,easternlon,minlat,maxlat)
    {
    searchlist = ['frt*07_if*l*trr3','hrs*07_if*l*trr3','hrl*07_if*l*trr3'];
    // ODE REST works with 0,360 longitudes
    if(westernlon < 0)
        {
        westernlon = westernlon + 360;
        }
    if(easternlon < 0)
        {
        easternlon = easternlon + 360;
        }
    footprints = new OpenLayers.Layer.Vector(name, {isBaseLayer: false, rendererOptions: { zIndexing: true }});
    wkt = new OpenLayers.Format.WKT();
    for(var k = 0; k < searchlist.length; k++)
        {
        searchstring = searchlist[k];
        oderest = JSON.parse(getBinary('http://oderest.rsl.wustl.edu/mars/?query=product&results=x$proj=c0&output=JSON&limit=1000&loc=f&westernlon=' + westernlon.toString() + '&easternlon=' + easternlon.toString() + '&minlat=' + minlat.toString() + '&maxlat=' + maxlat.toString() + '&pdsid=' + searchstring));
        var products = oderest.ODEResults.Products.Product;
        for(var i = 0; i < products.length; i++)
            {
            // Only show when data is in rasdaman, currently using inrasdaman list in inrasdaman.js
            // This will need to work using GetCapabilities: http://fuzzytolerance.info/blog/parsing-wms-getcapabilities-with-jquery/
            var pdsid = products[i].pdsid;
            var showfootprint = 0;
            for(var j = 0; j < inrasdaman.length; j++)
                {
                var coll = pdsid.toLowerCase() + "_" + pcversion + "_" + ptversion;
                if(inrasdaman[j] == coll)
                    {
                    showfootprint = 1;
                    }
                }
            if(showfootprint == 1)
                {
                wktstring = products[i].Footprint_geometry;
                wktstring = wktto180(wktstring); 
                var polygonFeature = wkt.read(wktstring);
                polygonFeature.data = products[i]
                //polygonFeature.geometry.transform(map.displayProjection, map.getProjectionObject());         
                footprints.addFeatures([polygonFeature]);
                }
            }
        }

    highlightCtrl = new OpenLayers.Control.SelectFeature(footprints, {
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
    });

    selectCtrl = new OpenLayers.Control.SelectFeature(footprints, {
        clickout: true,
        onSelect: function(feature) {
                hsdataset.productid = feature.data["pdsid"];
                toggleDisplay('vnirorir');
            },
        onUnselect: function(feature) {
                hsdataset.productid = "";
            }
        }
    );
    map.addControl(highlightCtrl);
    map.addControl(selectCtrl);

    highlightCtrl.activate();
    selectCtrl.activate();
    
    // register events to the featureInfo tool
    featureInfo.events.register("activate", featureInfo, function() {     
        highlightCtrl.activate();
        selectCtrl.activate();
    });                
    featureInfo.events.register("deactivate", featureInfo, function() {
        highlightCtrl.deactivate();
        selectCtrl.deactivate();
    });
    //map.addLayers([footprints]);
    //footprints.setZIndex(1501);
    }

function wktto180(wktstring)
    {
    if(wktstring.substring(0,18) == "GEOMETRYCOLLECTION")
        {
        wktstring = wktstring.substring(20,wktstring.length - 1);
        }
    wktstring = wkt.read(wktstring).geometry.toString();
    var newwktstring = "POLYGON((";
    wktstring = wktstring.substring(9,wktstring.length - 2);
    coords = wktstring.split(",");
    for(var i = 0; i < coords.length; i++)
        {
        coord = coords[i].split(" ");
        if(coord[0] > 180)
            {
            newwktstring = newwktstring + (coord[0] - 360) + " " + coord[1] + ","
            }
        else
            {
            newwktstring = newwktstring + coord[0] + " " + coord[1] + ","
            }
        }
    newwktstring = newwktstring.substring(0,newwktstring.length - 1) + "))";
    return newwktstring;
    }