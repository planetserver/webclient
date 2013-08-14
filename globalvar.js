// Global variable declaration

// JSON for hyperspectral data
hsdataset = {};
hsdataset.crs = 'http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/1/';
hsdataset.prj = 'GEOGCS["GCS_Mars_2000_Sphere",DATUM["D_Mars_2000_sphere",SPHEROID["Mars_2000_Sphere",3396190.0,0.0]],PRIMEM["Reference_Meridian",0.0],UNIT["Degree",0.0174532925199433]]';
hsdataset.productid = "";
hsdataset.point = []; // saves data of the clicked locations for query map features
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

// JSON for currently loaded elevation dataset, default 'moladtm'.
dtmdataset = {}
dtmdataset = jQuery.extend({}, dtmdefault);

// Changing variables
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

// Non changing variables. These can later be added to a properties window.
var nrpoints = 100;
var bin = 3;
var nrclicks = 10;
var colors = [ "Red", "Green", "Blue", "#6500bb", "Magenta", "Pink", "Gray", "Brown", "Orange", "Yellow"];
var pointsize = 0.0024;

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
