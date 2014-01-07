// Global variable declaration

// JSON for hyperspectral data
hsdataset = {};
hsdataset.crs = 'http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/2/';
hsdataset.prj = 'GEOGCS["GCS_Mars_2000_Sphere",DATUM["D_Mars_2000_sphere",SPHEROID["Mars_2000_Sphere",3396190.0,0.0]],PRIMEM["Reference_Meridian",0.0],UNIT["Degree",0.0174532925199433]]';
hsdataset.point = []; // saves data of the clicked locations for query map features
hsdataset.nodata = 65535;
hsdataset.mapoptions = {   
    opacity: 1,
    isBaseLayer: false,
    numZoomLevels : 20,
    isVisible: true,
    displayOutsideMaxExtent: true,
    wrapDateLine: true,
    alwaysInRange: true,
    displayInLayerSwitcher: false
};
hsdataset.ir = {};
hsdataset.vnir = {};

// JSON for default 'moladtm' global elevation dataset in rasdaman
dtmdefault = {}
dtmdefault.collection = 'moladtm';
dtmdefault.crs = 'http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/1/';
dtmdefault.xmin = -180;
dtmdefault.xmax = 180;
dtmdefault.ymin = -88;
dtmdefault.ymax = 88;
dtmdefault.width = 46080;
dtmdefault.height = 22528;

//CAT Summary Products
var vnirsp;
var irsp;
//VNIR
var bd530;
var bd860;;
var bd920;
var bd640;
var sh600;
var rbr;
var r770;
//IR
var olindex;
var olindex2;
var lcpindex;
var hcpindex;
var bd2100;
var bd2200;
var bd2210;
var bd1900r;
var sindex;
var d2300;
var bd1980;
var doub2200;
var bd2230;
var bd2500;
var cindex;
var bd3400;
var bd3200;
var bd3100;
var bd3000;
var bdcarb;
var icer2;
var bd1900;
var bd1750;
var icer1;
var bd1500;
var bd1435;
var islope1;
var ira;
var irr3;
var bd2700;
var r2700;
var irr2;
var bd2600;
var bd2350;
var bd2000co2;
var bd1400h2o;
var bd1270o2;

//MRDR
var mrdr = {
    'T0667_MRRIF_20S043_0256_3':
        {'name': 'T0667_MRRIF_20S043_0256_3',
        'westernlon': 40,
        'easternlon': 45,
        'minlat': -22.5,
        'maxlat': -17.5,
        'wms': {'name': 'CTX of T0667_MRRIF_20S043_0256_3',
            'map': '/var/lib/pgsql/process_data/wms/noachis/T0667_MRRIF_20S043_0256_3.map',
            'layer': 'T0667_MRRIF_20S043_0256_3',
            'projection': 'PS:2'}},
    'T0666_MRRIF_20S038_0256_3':
        {'name': 'T0666_MRRIF_20S038_0256_3',
        'westernlon': 35,
        'easternlon': 40,
        'minlat': -22.5,
        'maxlat': -17.5,
        'wms': {'name': 'CTX of T0666_MRRIF_20S038_0256_3',
            'map': '/var/lib/pgsql/process_data/wms/noachis/T0666_MRRIF_20S038_0256_3.map',
            'layer': 'T0666_MRRIF_20S038_0256_3',
            'projection': 'PS:2'}},
    };

// Regions
var regions = {
    'gale': 
        {'id': 'gale',
        'name': 'Gale crater',
        'westernlon': 135.5,
        'easternlon': 140,
        'minlat': -7.5,
        'maxlat': -3,
        'wms': [
            {'name': 'Gale HRSC mosaic',
            'map': '/var/lib/pgsql/process_data/wms/gale/galehrsc.map',
            'layer': 'galehrsc',
            'projection': 'PS:1'},
            {'name': 'Gale CTX mosaic',
            'map': '/var/lib/pgsql/process_data/wms/gale/galectx.map',
            'layer': 'galectx',
            'projection': 'PS:1'}],
        'dtm': [
            {'collection': 'galehrscdtm',
            'name': 'Gale HRSC DTM',
            'width':2325,
            'height':4549,
            'xmin':135.86945014764,
            'xmax':139.79208522914,
            'ymin':-8.1666731664627,
            'ymax':-0.49180564570269}]
        },
    'ganges':
        {'id': 'ganges',
        'name': 'Ganges Chasma',
        'westernlon': -55,
        'easternlon': -40,
        'minlat': -11,
        'maxlat': -5.5,
        'wms':[],
        'dtm':[
            {'collection': 'gangeshrscdtm',
            'name': 'Ganges HRSC DTM',
            'width':12180,
            'height':6368,
            'xmin':-52.853791943154,
            'xmax':-42.579593584562,
            'ymin':-11.030629160831,
            'ymax':-5.6590285740068}]
        },
    'capri':
        {'id': 'capri',
        'name': 'Capri Chasma',
        'westernlon': -58,
        'easternlon': -36,
        'minlat': -18.5,
        'maxlat': -10,
        'wms':[],
        'dtm':[]},
    'juventae':
        {'id': 'juventae',
        'name': 'Juventae Chasma',
        'westernlon': -64,
        'easternlon': -59,
        'minlat': -6,
        'maxlat': -0.5,
        'wms':[],
        'dtm':[]},
    'mawrth':
        {'id': 'mawrth',
        'name': 'Marwth Vallis',
        'westernlon': -30,
        'easternlon': -14,
        'minlat': 19,
        'maxlat': 28,
        'wms':[],
        'dtm':[]},
    'nili':
        {'id': 'nili',
        'name': 'Nili Fossae',
        'westernlon': 70,
        'easternlon': 82,
        'minlat': 16,
        'maxlat': 30,
        'wms':[],
        'dtm':[]}
};

/*,
    'schiaparelli':
        {'id': 'schiaparelli',
        'name': 'Schiaparelli crater',
        'westernlon': 12,
        'easternlon': 21.5,
        'minlat': -7,
        'maxlat': 2,
        'wms':[],
        'dtm':[]},
    'aramchaos':
        {'id': 'aramchaos',
        'name': 'Aram Chaos',
        'westernlon': -24,
        'easternlon': -18,
        'minlat': -0.5,
        'maxlat': 6,
        'wms':[],
        'dtm':[]}*/

// JSON for currently loaded elevation dataset, default 'moladtm'.
dtmdataset = {}
dtmdataset = jQuery.extend({}, dtmdefault);

// Changing variables
var region;
var maplonlat;
var WMSlayers = [];
var PNGimages = [];
var imagedata = [];
var diagramplot = {};
var hist;
var spectra;
var cross;
var pos = 0; // position to be used for adding data in query map features
var full = 0; // a boolean variable to track if all the dataset.point[]'s are filled
var turn = 0; // A global variable to keep track of turns for finding spectral ratio
var crossturn = 0;
var rgb = 0;
var hstype = "ir";

// User changable variables. These can later be added to a properties/settings window.
var nrpoints = 100;
var binvalue = 3; //spectrum binning, default 3x3
var maxbin = 7;
var nrclicks = 10; // nrclicks and nr of colors need to be the same
var colors = [ "Red", "Green", "Blue", "#6500bb", "Magenta", "Pink", "Gray", "Brown", "Orange", "Yellow"];
var pointsize = 0.0024;
var minstretch = 0;
var maxstretch = 0;
var filename = "image";

// Fixed variables
var planetserver_ps_wms = "http://planetserver.jacobs-university.de:8080/petascope/wms";
var planetserver_ms_wms = "http://planetserver.jacobs-university.de/cgi-bin/mapserv";
var planetserver_wcps = "http://planetserver.jacobs-university.de:8080/petascope";
var planetserver_wcsdc = "http://planetserver.jacobs-university.de:8080/petascope/wcs?version=2.0.0&service=WCS&request=DescribeCoverage&coverageId=";
Proj4js.defs["PS:1"] = "+proj=longlat +a=3396190 +b=3396190 +no_defs";
Proj4js.defs["ODE"] = "+proj=longlat +a=3396190 +b=3396190 +lon_wrap=180 +no_defs";
//Proj4js.defs["EPSG:4326"] = "+proj=longlat +a=3396190 +b=3396190 +no_defs";
Proj4js.defs["PS:2?0"] = "+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +a=3396190 +b=3396190 +units=m +no_defs";
Proj4js.defs["PS:2?180"] = "+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=180 +x_0=0 +y_0=0 +a=3396190 +b=3396190 +units=m +no_defs";
//Proj4js.reportError = function(msg) {alert(msg);}

// These variables are part of the rasdaman collection name. For example:
// When querying ODE REST you get:
// productid = frt00009ca9_07_if164l_trr3
// Then you know that:
// collection = productid + "_" + pcversion + "_" + ptversion
// How to deal with these version numbers, where to store them, still needs to be decided.
var pcversion = "1"; // PlanetServer processing chain version
var ptversion = "01"; // PlanetServer processing type version
