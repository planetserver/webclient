/*======================================================================================================================
     EarthServer Project
     2012 Fraunhofer IGD

     File:           ServerRequest.js
     Last change:    07.08.2012

     Description:

======================================================================================================================*/
function ServerRequest()
{
    "use strict";

    this.mainCoverData = {url:'http://planetserver.jacobs-university.de:8080/petascope/wms', ID:'galehrsc_wms'};
    this.heightCoverData = {url:'http://planetserver.jacobs-university.de:8080/petascope' , ID:'galehrscdtm'};
    this.bbLowerCorner = '-6.00750,136.82222';           //Lower Corner [latitude,longitude] of the Scene
    this.bbUpperCorner = '-4.32659,138.93708';           //Upper Corner [latitude,longitude] of the Scene

    //Some basic Values:
    this.WmsVersionArray = ["1.1.0","1.3.0"];//WMS version to choose in UI
    this.WcsVersionArray = ["2.0.0"];        //WCS versions to choose in UI
    this.WmsVersion = this.WmsVersionArray[0];      //Default version
    this.WcsVersion = this.WcsVersionArray[0];      //Default version
    this.maxMSAT = -1000000;                        //maximum height of Heightfield
    this.minMSAT = 1000000;                         //minimum height of Heightfield
    this.avgMSAT = 0;                               //average height of Heightfield
    this.texBase = 400;                             //Standard Texture Size -> Use size of HF
    this.texSizeX = this.texBase;                   //TexSize height
    this.texSizeY = this.texBase;                   //TexSize width

    //Not set at start:
    this.hmX = 0;
    this.hmZ = 0;
    this.hmOffsetX = 0;
    this.hmOffsetZ = 0;
    this.totalHMvalue = 0;

    //Arrays:
    this.subSetX = [];               //latitude
    this.subSetY = [];               //longitude
    this.epsgMap = [];               //epsg paramter for server requests
    this.refSysName = "crs";         //CRS/SRS
    this.axis = [];                  //axis names

    //important DOM elements
    this.rootTransform = undefined;

    this.width = 0;             //Width of each chunk
    this.height = 0;            //Height of each chunk
    this.xSize = 0;                //Amount of all chunks on the x-axis
    this.zSize = 0;                //Amount of all chunks on the z-axis
    this.maxChunks = 0;              //Sum of all chunks (xChunks*zChunks)
    this.chunkIndex = 0;             //Global index (<maxChunks)

    //==================================================================================================================
    // Connects to the server and initiates the data download.
    //==================================================================================================================
    this.connect = function()
    {
        if(!this.setVars())
        {
            x3dom.debug.logInfo("Error while setting up the scene.");
        }

       $('#trans').empty();
        var width, height, box, bbox,points;

        //Set the heightfield
        this.setHeightField();

        //Set width and height for textures
        width  = this.hmX;
        height = this.hmZ;
        this.texSizeX = width;
        this.texSizeY = height;

        //Scale the fishtank/cube tp the size of the heightmap
        points= " 0 -500 0 " +
                  this.hmX + " -500 0 " +
                  this.hmX + " 500 0 " +
                  "0 500 0 " +
                  "0 -500 "+ this.hmZ + " " +
                  this.hmX + " -500 " + this.hmZ + " " +
                  this.hmX + " 500 " + this.hmZ +
                  " 0 500 " + this.hmZ;

        $('#cube').attr("point", points);

        //Set up the Bounding Box for the WMS-Request
        box = [];
        box[0] = parseFloat(this.subSetX[0]);
        box[1] = parseFloat(this.subSetY[0]);
        box[2] = parseFloat(this.subSetX[1]);
        box[3] = parseFloat(this.subSetY[1]);

        bbox  = box[0]+','+box[1]+','+box[2]+','+box[3];

        //Create an imagetexture and prepare for reuse
        this.mainCoverData.imageURL = this.createRequestString(1, bbox, width, height);

        //Download Button
        $('#downloadButton').attr('onClick', "window.open('" + this.createRequestString(2, bbox, width, height) + "','Image');");

        width = null;
        height = null;
        box = null;
        bbox = null;
        x3dom.debug.logInfo("ServerRequest: connect() done.");
    };

    //==================================================================================================================
    //
    //==================================================================================================================
    this.createRequestString = function(multiplier, bBox, width, height)
    {
        var string  = this.mainCoverData.url+"?service=WMS&version=";
        string += this.WmsVersion+"&request=Getmap&layers=";
        string += this.mainCoverData.ID+"&";
        string += this.refSysName+"=";
        string += this.epsgMap[this.mainCoverData.ID]+"&format=image/png&styles=&bbox=";
        string += bBox+"&width="+multiplier*width+"&height="+multiplier*height;
        return string;
    };

    //==================================================================================================================
    //Calcs the pixel of a grid which represents a given latidude
    //==================================================================================================================
    this.latToGridPixel = function (longLat, gridCount, min, max)
    {
        var Dim,offset,percent;
        Dim = max - min;
        offset = longLat - min;
        percent = parseFloat(offset/Dim);

        Dim = null;
        offset = null;

        return parseInt(gridCount*percent,"10");
    };
    //==================================================================================================================
    //Calcs the pixel of a grid which represents a given longitude
    //==================================================================================================================
    this.longToGridPixel = function (longLat, gridCount, min, max)
    {
        var Dim,offset,percent;
        Dim = max - min;
        offset = longLat - min;
        percent = parseFloat(offset/Dim);

        Dim = null;
        offset = null;

        return gridCount - parseInt(gridCount*percent,"10");
    };

    //==================================================================================================================
    //Set some Heightmap information
    //==================================================================================================================
    this.setHeightField = function()
    {
        x3dom.debug.logInfo('Calc Heightfield.');
        var hmaxy, hminy, hminx, hmaxx;
        //Calc the grid subsets from the given longitude/latitude
		hmaxy = this.subSetY[0];
		hminy = this.subSetY[1];
		hminx = this.subSetX[0];
		hmaxx = this.subSetX[1];
		
		  var object = this;
		
		//WCS Request
        $.ajax({
            url: this.heightCoverData.url,
            type: 'GET',
            dataType: "xml",
            async: false,
            data: 'service=WCS&Request=GetCoverage&version='+object.WcsVersion+'&CoverageId='+object.heightCoverData.ID+'&subsetx=x('+hminx+','+hmaxx+')&subsety=y('+hminy+','+hmaxy+')',
            success:  function(xml)
            {
				var Grid = $(xml).find('GridEnvelope');
                var low  = $(Grid).find('low').text().split(" ");
                var high = $(Grid).find('high').text().split(" ");
 
                this.hmX = high[0] - low[0] + 1;
                this.hmZ = high[1] - low[1] + 1;
			
				this.hm = new Array(this.hmX);
                for(var index=0; index<this.hm.length; index++)
                {
                    this.hm[index] = new Array(this.hmZ);
                }
			
                var DataBlocks = $(xml).find('DataBlock');
                DataBlocks.each(function()
                {
                    var i,tuples;
                    tuples = $(this).find("tupleList").text().split('},');

                    for(i=0; i<tuples.length; i++)
                    {
                        var tmp,valueslist,k;
                        tmp = tuples[i].substr(1);
                        valueslist = tmp.split(",");

                        for(k=0; k<valueslist.length; k++)
                        {
                            tmp = parseFloat(valueslist[k]);
                            object.totalHMvalue = object.totalHMvalue + tmp;
                            this.hm[i][k] = tmp;

                            if( parseFloat(object.maxMSAT) < tmp )
                            {	object.maxMSAT = tmp; }
                            if( parseFloat(object.minMSAT) > tmp )
                            {	object.minMSAT = tmp; }
                        }
                    }
                    i = null;
                    tuples = null;
                });
                DataBlocks = null;

            },
            error: function(xhr, ajaxOptions, thrownError)
            {
                x3dom.debug.logInfo("Request WCS HeightField - error" + xhr.status +" " + ajaxOptions + " " + thrownError);
            }
        });
        
    };

    //==================================================================================================================
    //Extract the HeightField for one grid from the stored height array
    //==================================================================================================================
    this.getHeightMapPart = function(xPos,yPos,sizeX,sizeY)
    {

		var hm = new Array(sizeX);
        for(var i=0; i<info.chunkHeight; i++)
        {
			hm[i] = new Array(sizeY);
            for(var j=0; j<sizeY; j++)
            {
				hm[i][j] = this.hm[xPos+j][yPos+i];
            }
        }
        return hm;     
    };

    //==================================================================================================================
    //copies the min/max long/lat information from the source to the destination
    //==================================================================================================================
    this.copysrs = function(src, dst)
    {
        dst.srsName = src.srsName;
        dst.minlongitude = src.minlongitude;
        dst.maxlongitude = src.maxlongitude;
        dst.minlatitude = src.minlatitude;
        dst.maxlatitude = src.maxlatitude;
    };

    //==================================================================================================================
    //
    //==================================================================================================================
    this.checkBounds = function()
    {
        var tmp;
        tmp = parseInt( this.subSetX[0],"10");
        if( tmp < this.mainCoverData.minlatitude || tmp < this.heightCoverData.minlatitude)
        {
            x3dom.debug.logInfo("MinLatidude " + tmp +" not in " + this.mainCoverData.minlatitude + "-" + this.heightCoverData.minlatitude);
            tmp = null;
            return false;
        }
        tmp = parseInt( this.subSetX[1],"10");
        if( tmp > this.mainCoverData.maxlatitude || tmp > this.heightCoverData.maxlatitude)
        {
            x3dom.debug.logInfo("MaxLatidude " + tmp +" not in " + this.mainCoverData.maxlatitude + "-" + this.heightCoverData.maxlatitude);
            tmp = null;
            return false;
        }
        tmp = parseInt( this.subSetY[0],"10");
        if( tmp < this.mainCoverData.minlongitude || tmp < this.heightCoverData.minlongitude)
        {
            x3dom.debug.logInfo("Minlongitude " + tmp +" not in " + this.mainCoverData.minlongitude + "-" + this.heightCoverData.minlongitude);
            tmp = null;
            return false;
        }
        tmp = parseInt( this.subSetY[1],"10");
        if( tmp > this.mainCoverData.maxlongitude|| tmp > this.heightCoverData.maxlongitude)
        {
            x3dom.debug.logInfo("Maxlongitude " + tmp +" not in " + this.mainCoverData.maxlongitude + "-" + this.heightCoverData.maxlongitude);
            tmp = null;
            return false;
        }

        tmp = null;
        return true;
    };

    //==================================================================================================================
    //Receive the EPSG GeoBoundingBox for the WMS Request
    //==================================================================================================================
    this.setEPSG = function()
    {
        var ret = true;
        var object = this;

        if( this.epsgMap[this.mainCoverData.ID] === undefined )
        {
            $.ajax({
                url: object.mainCoverData.url,
                type: 'GET',
                dataType: "xml",
                async: false,
                data: 'service=wms&version='+object.WmsVersion+'&request=getcapabilities',
                success:  function(xml)
                {
                    var envBounds = $(xml).find('Layer');
                    envBounds.each(function()
                    {
                        var name, crs;
                        //name  = $(this).find('Name').text();//It's maybe 'TITLE'
                        name  = $(this).children('Name').text();//It's maybe 'TITLE'

                        if( name.toLowerCase() === object.mainCoverData.ID.toLowerCase() )
                        {
                            crs = $(this).find('CRS').text();
                            if( crs === undefined || crs === "")
                            {
                                crs = $(this).find('SRS').text();
                                object.refSysName = "srs";
                            }

                            object.epsgMap[object.mainCoverData.ID] = crs;

                            //Bounding Box Set still undefined?
                            if( object.mainCoverData.minlongitude === undefined || object.mainCoverData.minlongitude === "")
                            {
                                $(this).find('BoundingBox').each(function()
                                {
                                    $.each(this.attributes, function(i,attrib)
                                    {
                                        var name = String(attrib.name);
                                        if( name === "minx" )
                                        {	object.mainCoverData.minlatitude = parseFloat(attrib.value);	}
                                        if( name === "maxx" )
                                        {	object.mainCoverData.maxlatitude = parseFloat(attrib.value);	}
                                        if( name === "miny" )
                                        {	object.mainCoverData.minlongitude = parseFloat(attrib.value);	}
                                        if( name === "maxy" )
                                        {	object.mainCoverData.maxlongitude = parseFloat(attrib.value);	}
                                        name = null;
                                    });
                                });
                            }
                        }
                        name = null;
                        crs = null;
                    });
                    envBounds = null;
                },
                error: function(xhr, ajaxOptions, thrownError)
                {
                    x3dom.debug.logInfo("CRS Name in WMS - error" + xhr.status +" " + ajaxOptions + " " + thrownError);
                }
            });
            object = null;
        }

        if(this.epsgMap[this.mainCoverData.ID] === undefined )
        {
            x3dom.debug.logInfo("Unable to find EPSG Code in MainData WMS Reply.");
            ret = false;
        }

        object = null;
        return ret;
    };

    //==================================================================================================================
    //This function tries to get all needed information to build the scene from WCS/WMS Requests.
    //==================================================================================================================
    this.setVars = function()
    {
        var low, high, srsSetMain, srsSetHeight, epsgSet, ret, validBounds, opt;
        ret = true; //return value, set to false if error occurs

        this.heightCoverData.url = $('#urlheight').attr("value");
        this.heightCoverData.ID = $('#heightcoverid').attr("value");
        this.mainCoverData.url	= $('#url').attr("value");
        this.mainCoverData.ID = $('#coverid').attr("value");

        this.setCoverageData(this.mainCoverData);
        srsSetMain = this.setSrsByWCS(this.mainCoverData, this.mainCoverData.srsSource);
        this.setCoverageData(this.heightCoverData);
        srsSetHeight = this.setSrsByWCS(this.heightCoverData, this.heightCoverData.srsSource);

        epsgSet = this.setEPSG();
        if(epsgSet === false)
        { ret = false;	}

        if(srsSetMain === false)
        {
            x3dom.debug.logInfo("Unable to find a valid SRS Name in WCS Replay of Main Data. Used Given Values instead.");
        }

        if(srsSetHeight === false)//Assume both coverage have the same GeoBoundingBoxes
        {
            x3dom.debug.logInfo("HeightData WCS Repaly does not have srsName Attribute in Envelope. Main Data srsName used instead.");
            this.copysrs(this.mainCoverData,this.heightCoverData );
        }

        low  = $('#BBlowercorner').attr("value");
        low = low.split(",");
        high = $('#BBuppercorner').attr("value");
        high = high.split(",");

        this.subSetX[0] = low[1];
        this.subSetX[1] = high[1];
        this.subSetY[0] = low[0];
        this.subSetY[1] = high[0];

        //Choosen WMS/WCS versions
        opt = document.getElementById("wmsversion");
        this.WmsVersion = opt.options[opt.selectedIndex].value;
        opt = document.getElementById("wcsversion");
        this.WcsVersion = opt.options[opt.selectedIndex].value;

        //Check if the user input is valid
        if( parseFloat(this.subSetX[1]) <= parseFloat(this.subSetX[0]) )
        {
            x3dom.debug.logInfo("Latitude input not valid!");
            ret = false;
        }
        if( parseFloat(this.subSetY[1]) <= parseFloat(this.subSetY[0]) )
        {
            x3dom.debug.logInfo("Longitude input not valid!");
            ret = false;
        }

        //Is the Query in the Bounds of the available Data?
        validBounds = this.checkBounds();
        if( validBounds === false)
        {
            x3dom.debug.logInfo("Query Bounds are not available in the coverages!");
            ret = false;
        }

        low = null;
        high = null;
        srsSetMain = null;
        srsSetHeight = null;
        epsgSet = null;
        validBounds = null;
        opt = null;

        return ret;
    };

    //==================================================================================================================
    //Extracts the needed information from a WCS Request (Long/Lat Bounds, Grid Bounds, Axii name...)
    //==================================================================================================================
    this.setCoverageData = function(dataStore)
    {
        var low, high;

        var object = this;
        $.ajax({
            url: dataStore.url,
            type: 'GET',
            dataType: "xml",
            async: false,
            data: 'service=WCS&Request=DescribeCoverage&version='+object.WcsVersion+'&CoverageId='+dataStore.ID,
            success:  function(xml)
            {
                //Long/Lat Bounds Envelope
                $(xml).find('Envelope').each(function()
                {
                    $.each(this.attributes, function(i,attrib)
                    {
                        var name = String(attrib.name);
                        if( name === "srsName" )
                        {
                            dataStore.srsSource = attrib.value;
                            dataStore.srsSource = dataStore.srsSource.split("/");
                            dataStore.srsSource = dataStore.srsSource[ dataStore.srsSource.length-1];
                        }
                    });
                    //Set min/max longitude/latitude DEFAULT values. Will be overwriten if srsName is found and bounds are retrieved
                    low  = $(this).find('low').text().split(" ");
                    high = $(this).find('high').text().split(" ");
                    dataStore.minlongitude = low[0];
                    dataStore.minlatitude  = low[1];
                    dataStore.maxlongitude = high[0];
                    dataStore.maxlatitude  = high[1];

                });
                //GridBounds
                var envBounds = $(xml).find('GridEnvelope');
                envBounds.each(function()
                {
                    low  = $(this).find('low').text().split(" ");
                    high = $(this).find('high').text().split(" ");
                    dataStore.gridX = high[0];
                    dataStore.gridY = high[1];
                });
                //Axis Names
                dataStore.axis = $(xml).find('axisLabels').text().split(" ");
                envBounds = null;
            },
            error: function(xhr, ajaxOptions, thrownError)
            {
                x3dom.debug.logInfo("Request WCS Coverage - error" + xhr.status +" " + ajaxOptions + " " + thrownError);
            }
        });

        low = null;
        high = null;
    };

    //==================================================================================================================
    //Tries to get the EX_GeographicBoundingBox from the given srs/EPSG Namecode.
    //Stores the min/max long/lat in the given array
    //==================================================================================================================
    this.setSrsByWCS = function(dataStore,srsName)
    {
        var object = this;

        if(srsName !== undefined )
        {
            $.ajax({
                url: 'http://kahlua.eecs.jacobs-university.de:8080/def/crs/EPSG/0/',
                type: 'GET',
                dataType: "xml",
                async: false,
                data: srsName,
                success:  function(xml)
                {

                    //traverse(xml);
                    $(xml).find('EX_GeographicBoundingBox').each(function()
                    {
                        var bound = $(this).find('westBoundLongitude');
                        dataStore.minlongitude = object.extractBound(bound);
                        bound = $(this).find('eastBoundLongitude');
                        dataStore.maxlongitude = object.extractBound(bound);
                        bound = $(this).find('northBoundLatitude');
                        dataStore.maxlatitude = object.extractBound(bound);
                        bound = $(this).find('southBoundLatitude');
                        dataStore.minlatitude = object.extractBound(bound);
                        bound = null;

                        //Extraction Successfull?
                        if(dataStore.minlongitude !== undefined && dataStore.minlongitude !== "")
                        {
                            return true;
                        }
                    });
                },
                error: function(xhr, ajaxOptions, thrownError)
                {
                    x3dom.debug.logInfo("Request WCS CRS - error" + xhr.status +" " + ajaxOptions + " " + thrownError);
                }
            });
        }

        return false;
    };

    //==================================================================================================================
    //Returns a float value from the given XML-Node
    //==================================================================================================================
    this.extractBound = function(bound)
    {
        return parseFloat($(bound).find('Decimal').text());
    };

    //==================================================================================================================
    //Gets a ClickPoint on the elevationGrid in the scene and set the value of the height map at the clicked
    //position in the detail panel
    //==================================================================================================================
    this.setValueField = function(pnt)
    {
        var  val;

        val = this.getHeightMapPart(parseInt(pnt[0],"10"),parseInt(pnt[2],"10"),0,0);

        $('#detail_5').attr("value", "Value at picked Position: "+val);
        val = null;
    };

    //==================================================================================================================
    // Some Postprocessing: Scale Szene/Set Details
    //==================================================================================================================
    this.UpdateScale = function()
    {
        var scaleH, transh,diff;

        if( this.maxMSAT > 0) //Set the top at 50% of the fishtank
        {
            diff = this.maxMSAT - this.minMSAT;
            if( diff == 0)
            { diff = 1;}
            scaleH = parseFloat( 500/diff);
        }
        else
        {
            diff = this.minMSAT - this.maxMSAT;
            if( diff == 0)
            { diff = 1;}
            scaleH = 500/Math.abs(parseFloat(diff));
        }

        transh = -500 - (parseFloat(this.minMSAT)*scaleH);

        $('#trans').attr('scale',"1 " + scaleH + " 1");
        $('#trans').attr("translation", "0 " + transh + " 0");

        this.avgMSAT = parseFloat( this.totalHMvalue/(this.hmX*this.hmZ));

        //Store the deatils in the UI
        var es="";
        $('#detail_0').attr("value", es+ this.texSizeX + "x" + this.texSizeY);
        $('#detail_1').attr("value", es+ this.hmX + "x" + this.hmZ);
        $('#detail_2').attr("value", es+ this.minMSAT);
        $('#detail_3').attr("value", es+ this.maxMSAT);
        $('#detail_4').attr("value", es+ this.avgMSAT.toFixed(2) );

        es = null;
    };

    //==================================================================================================================
    // Finally ...
    //==================================================================================================================
    this.cleanUp = function()
    {
        this.subSetX = [];
        this.subSetY = [];
        this.epsgMap = [];
        this.axis = [];

        this.rootTransform = null;
        this.hmX = 0;
        this.hmZ = 0;
        this.xSize = 0;
        this.zSize = 0;
        this.width = 0;
        this.height = 0;
        this.maxChunks = 0;
        this.chunkIndex = 0;
    };
}
