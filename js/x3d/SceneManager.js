/*======================================================================================================================
     EarthServer Project
     2012 Fraunhofer IGD

     File:           SceneManager.js
     Last change:    07.08.2012

     Description:

 ======================================================================================================================*/
function SceneManager()
{
    "use strict";

    this.rootTransform = undefined;     //Init at startUp()
    this.terrain = null;                //Init at startUp()
    this.sr = null;
    this.isRunning = false;             //Is the scene already running?

    //==================================================================================================================
    //Fills the UI with the default data.
    //==================================================================================================================
    this.startUp = function()
    {
        this.sr = new ServerRequest();
        var i, opt;

        $('#BBlowercorner').attr('value', this.sr.bbLowerCorner);
        $('#BBuppercorner').attr('value', this.sr.bbUpperCorner);
        $('#url').attr('value', this.sr.mainCoverData.url);
        $('#urlheight').attr('value', this.sr.heightCoverData.url);
        $('#coverid').attr('value', this.sr.mainCoverData.ID);
        $('#heightcoverid').attr('value',this.sr.heightCoverData.ID);
        $('#texture1').attr('url', 'start.png');

        //Set available WMS/WCS versions
        for(i=0; i<this.sr.WmsVersionArray.length;i++)
        {
            opt = document.createElement("option");
            opt.text  = this.sr.WmsVersionArray[i];
            opt.value = this.sr.WmsVersionArray[i];
            document.getElementById("wmsversion").options.add(opt);
        }

        for(i=0; i<this.sr.WcsVersionArray.length;i++)
        {
            opt = document.createElement("option");
            opt.text  = this.sr.WcsVersionArray[i];
            opt.value = this.sr.WcsVersionArray[i];
            document.getElementById("wcsversion").options.add(opt);
        }

        this.rootTransform = document.getElementById("trans");
        this.sr.rootTransform = this.rootTransform;
        i = null;
        opt = null;
    };

    //==================================================================================================================
    //
    //==================================================================================================================
    this.setView = function(name)
    {
        var vp = document.getElementById(name);
        vp.setAttribute("set_bind", "false");   //If not set to false the camera will not move to their position
        vp.setAttribute("set_bind", "true");    //if the user moved the cameras.
        vp = null;
    };

    //==================================================================================================================
    //
    //==================================================================================================================
    this.createNewScene = function()
    {
        if(this.isRunning)
        {
            this.clearScene();
        }

        this.isRunning = true;
        this.sr.connect();
        this.setCameras();
        this.terrain = new Terrain(this.sr.hmX, this.sr.hmZ, this.rootTransform);

        this.terrain.createTerrain();
    };

    //==================================================================================================================
    //Set the Cameras in realtion to the size of the fishtank
    //==================================================================================================================
    this.setCameras = function()
    {

    };
    //==================================================================================================================
    //Delete all content from the scenegraph and resets the arrays
    //==================================================================================================================
    this.clearScene = function()
    {
        var i;
        for(i=0; i<this.sr.maxChunks; i++)
        {
            var inline = document.getElementById('' + i);
            inline.onload = null;

            this.rootTransform.removeChild(inline);
            inline = null;
        }
        i = null;
        $('#trans').empty();

        this.sr.cleanUp();
        location.reload();
    };

    //==================================================================================================================
    //
    //==================================================================================================================
    this.createChunk = function(chunkIndex)
    {
        var info = this.terrain.getChunkInfo(chunkIndex);

        var hf = this.sr.getHeightMapPart(info.xPos,info.zPos,info.sizeX+4,info.sizeZ+4);

        //Every Chunk gets it's own small image
        //Set up the Bounding Box
        var box = [];
        var sizeX = this.sr.subSetX[1] - this.sr.subSetX[0];
        var sizeY = this.sr.subSetY[1] - this.sr.subSetY[0];
        var startX = parseFloat(this.sr.subSetX[0]) + (info.xPos/this.sr.hmX * sizeX);
        var startY = parseFloat(this.sr.subSetY[1]) - (info.zPos/this.sr.hmZ * sizeY);
        var endX   = parseFloat(this.sr.subSetX[0]) + ((info.xPos+info.sizeX)/this.sr.hmX * sizeX);
        var endY   = parseFloat(this.sr.subSetY[1]) - ((info.zPos+info.sizeZ)/this.sr.hmZ * sizeY);

        box[0] = parseFloat(startX);
        box[1] = parseFloat(endY);
        box[2] = parseFloat(endX);
        box[3] = parseFloat(startY);

        var bbox  = box[0]+','+box[1]+','+box[2]+','+box[3];

        //Create an image url
        var imageURL = this.sr.createRequestString(1, bbox, info.sizeX-1, info.sizeZ-1);

        x3dom.debug.logInfo('Chunk: '+info.xPos+'/'+info.zPos+ ' Size: '+ this.sr.hmX+'/'+ this.sr.hmZ);
        this.terrain.createNewChunk(chunkIndex, hf, imageURL);

        this.sr.UpdateScale();
        info = null;
    };
}