/*======================================================================================================================
     EarthServer Project
     2012 Fraunhofer IGD

     File:           Terrain.js
     Last change:    06.08.2012

     Description:

 ======================================================================================================================*/
function Terrain(hmX, hmZ, root)
{
    "use strict";

    this.hmX = hmX;
    this.hmZ = hmZ;
    this.numChunksX = 0;
    this.numChunksZ = 0;
    this.firstrun = 0;

    this.createTerrain = function()
    {
        x3dom.debug.logInfo('Create Terrain.');

        if( this.firstrun === 0)
        {
            this.calcSizes();
            this.counter = new ChunkCounter(this.maxChunks);
            this.chunkArray = [ (this.maxChunks) ];
            this.firstrun = 1;
        }

        if(!this.counter.finish())
        {
            x3dom.debug.logInfo('*** CREATE CHUNK ' + this.counter.index + ' ***');
            var inline = document.createElement('Inline');
            inline.setAttribute('id', this.counter.index);
            inline.setAttribute('nameSpaceName','hm' + this.counter.index);
            inline.setAttribute('load','true');
            inline.setAttribute('url','chunk.x3d');
            inline.setAttribute('onLoad','sceneManager.createChunk('+ this.counter.index +');');

            this.counter.increaseCounter();
            root.appendChild(inline);
            inline = null;
        }
        x3dom.debug.logInfo('Exit Terrain.');
    };

    //==================================================================================================================
    //Returns an object with the basic info for the chunk with the given index: Position (x/z) and Size(x/z)
    //==================================================================================================================
    this.getChunkInfo = function(num)
    {
        var info = {};
        info.xPos = parseInt(num%this.numChunksX,"10")*252;//width
        info.zPos = parseInt(num/this.numChunksX,"10")*252;//height

        if( num%this.numChunksX === (this.numChunksX-1) )
        { info.sizeX = hmX - parseInt((this.numChunksX-1)*252,"10"); }
        else
        { info.sizeX = 253; }

       if( num >= this.maxChunks - this.numChunksX)
       { info.sizeZ = hmZ - parseInt((this.numChunksZ-1)*252,"10"); }
       else
        { info.sizeZ = 253; }

        x3dom.debug.logInfo('#######INFO: '+ num + '/'+ info.xPos + '/'+ info.zPos + '/'+ info.sizeX+'/'+ info.sizeZ);
        return info;
    };

    //==================================================================================================================
    //Calc the amount of needed chunks for the grid.
    //==================================================================================================================
    this.calcSizes = function()
    {
        this.numChunksX = parseInt(this.hmX/252,"10");
        if( this.hmX % 252 !== 0)
        { this.numChunksX++;}

        this.numChunksZ = parseInt(this.hmZ/252,"10");
        if( this.hmZ % 252 !== 0)
        { this.numChunksZ++;}

        this.maxChunks = parseInt(this.numChunksZ*this.numChunksX,"10");
        x3dom.debug.logInfo('maxChunks: '+ this.maxChunks);
    };

    //==================================================================================================================
    //Creates and inserts X3D inline node (terrain chunk) into DOM.
    //==================================================================================================================
    this.createNewChunk = function(currentChunk, hf, imageURL)
    {
        x3dom.debug.logInfo('createNewChunk: '+ currentChunk);
        var info = this.getChunkInfo(currentChunk);

        this.chunkArray[this.counter.index] = new Chunk(info.sizeX, info.sizeZ);
        this.chunkArray[this.counter.index].setupChunk(currentChunk, info.xPos, info.zPos, hmX, hmZ, hf, imageURL);
        this.createTerrain();
        info = null;
    };
}