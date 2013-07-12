/*======================================================================================================================
     EarthServer Project
     2012 Fraunhofer IGD

     File:           Chunk.js
     Last change:    06.08.2012

     Description:

 ======================================================================================================================*/
function Chunk(width, height)
{
    "use strict";

    this.width = width;     //Chunk width
    this.height = height;   //Chunk height
    this.imageCNT = 0;
    this.imageMap = {};

    //==================================================================================================================
    //Returns a imageTexture when called first. Then references to the first one.
    //==================================================================================================================
    this.getImageNode = function(url)
    {
        var imageTexture;

        if( this.imageMap[url] === undefined)//Not in map
        {
            //create entry
            imageTexture = document.createElement('ImageTexture');
            imageTexture.setAttribute("url", url );
            imageTexture.setAttribute("def", "Image"+this.imageCNT);
            this.imageMap[url] = "Image"+this.imageCNT;
            this.imageCNT++;
        }
        else
        {
            imageTexture = document.createElement('ImageTexture');
            imageTexture.setAttribute("use", this.imageMap[url]);
        }
        return imageTexture;
    };

    //==================================================================================================================
    //Shrinks the heightfield with the given factor
    //==================================================================================================================
    this.ShrinkHeightMap = function(heightfield, sizex, sizey, shrinkfactor)
    {
        var smallGrid, smallx, smally, val,i,k,l, o;

        x3dom.debug.logInfo('ShrinkHeightMap: ' +sizex+'/'+sizey+'/'+shrinkfactor);

        smallx = parseInt(sizex/shrinkfactor,"10");
        smally = parseInt(sizey/shrinkfactor,"10");
        //IF shrinked the heightfield needs one more element than the desired length (63 elements for a length of 62)
        if( shrinkfactor !== 1)
        {
            smallx++;
            smally++;
        }
        smallGrid = "";

        for(i=0; i<smally; i++)
        {
            for(k=0; k<smallx; k++)
            {
                val = 0;
                for(l=0; l<shrinkfactor; l++)
                {
                    for(o=0; o<shrinkfactor; o++)
                    {
                        val = val + parseFloat( heightfield[(k*shrinkfactor)+l][(i*shrinkfactor)+o]);
                    }
                }
                val = parseFloat(val/(shrinkfactor*shrinkfactor));
                smallGrid = smallGrid + val+ " ";
            }
        }

        return smallGrid;
    };

    //==================================================================================================================
    //Calcs the TextureCoordinats for the given part of the heightmap
    //==================================================================================================================
    this.calcTexCoords = function(xpos,ypos,sizex,sizey,hmX, hmZ, shrinkfactor)
    {
        var tc, tcnode,i,k, offsetx, offsety, partx, party, tmpx, tmpy,smallx,smally;
        offsetx = xpos/hmX;
        offsety = ypos/hmZ;
        partx   = parseFloat( (sizex/hmX)*(1/sizex) );
        party   = parseFloat( (sizey/hmZ)*(1/sizey) );
        smallx = parseInt(sizex/shrinkfactor, "10");
        smally = parseInt(sizey/shrinkfactor, "10");
        tc = "";
        //Create Node
        tcnode = document.createElement("TextureCoordinate");

        //File string
        for (i = 0; i < smally; i++)
        {
            for (k = 0; k < smallx; k++)
            {
                tmpx = offsetx + (k*shrinkfactor)*partx;
                tmpy = offsety + (i*shrinkfactor)*party;

                tc = tc + tmpx + " " + tmpy + " ";
            }
        }

        tcnode.setAttribute("point", tc);

        tc = null;
        i = null;
        k = null;
        offsetx = null;
        offsety = null;
        partx = null;
        party = null;
        tmpx = null;
        tmpy = null;
        smallx = null;
        smally = null;

        return tcnode;
    };


    //==================================================================================================================
    //Creates and inserts X3D inline node (terrain chunk) into DOM.
    //==================================================================================================================
    this.setupChunk = function(currentChunk, xPos, zPos, hmX, hmZ,hf,imageURL)
    {
        x3dom.debug.logInfo('SetupChunk: '+ currentChunk + ': '+ this.width + '/'+this.height);
        var elevationGrid, imageTexture, shape, lod, i, appearance,imageTransform, shf;

        var transform = document.getElementById('hm' + currentChunk + '__transform');
        transform.setAttribute("translation", ""+ xPos + " 0 " + zPos);
        transform.setAttribute("scale", "1.0 1.0 1.0");
        transform.removeChild(document.getElementById('hm' + currentChunk + '__shape'));

        //LOD
        lod = document.createElement('LOD');
        lod.setAttribute("Range", "2500, 4000");
        lod.setAttribute("id", 'lod' + String(currentChunk));

        //We build a LOD with 3 childs. [Full Resolution, 1/2 Resolution, 1/4 Resolution]
        for(i=0; i<3; i++)
        {
            //All none full resolutions needs to be one element bigger to keep the desired length
            var add =0;
            if(i !== 0){ add = 1;}

            x3dom.debug.logInfo('Start LOD loop');
            //Set up: Shape-> Apperance -> ImageTexture +  Texturtransform
            shape = document.createElement('Shape');
            appearance = document.createElement('Appearance');
            imageTexture = this.getImageNode(imageURL);//Imagenode DEF/USE
            imageTransform = document.createElement('TextureTransform');
            imageTransform.setAttribute("scale", "1,-1");
            //Append in DOM
            appearance.appendChild(imageTexture);
            appearance.appendChild(imageTransform);
            shape.appendChild(appearance);

            //Build the ElavationsGrid
            //shrink the heightfield to the correct size for this detail level
            shf = this.ShrinkHeightMap(hf,this.width,this.height,Math.pow(2,i));
            elevationGrid = document.createElement('ElevationGrid');
            elevationGrid.setAttribute("id", "hm"+ currentChunk);
            elevationGrid.setAttribute("solid", "false");
            elevationGrid.setAttribute("xSpacing", String( Math.pow(2,i) ) );//To keep the same size with fewer elements increase the space of one element
            elevationGrid.setAttribute("zSpacing", String( Math.pow(2,i) ) );
            elevationGrid.setAttribute("xDimension", parseInt(this.width/Math.pow(2,i),"10")+add);//fewer elements in every step
            elevationGrid.setAttribute("zDimension", parseInt(this.height/Math.pow(2,i),"10")+add);
            elevationGrid.setAttribute("height", shf );
            elevationGrid.setAttribute("onclick", "sceneManager.sr.setValueField(event.hitPnt);");

            shape.appendChild(elevationGrid);
            lod.appendChild(shape);

            //set null stuff
            shf = null;
            shape = null;
            appearance = null;
            imageTexture = null;
            imageTransform = null;
            elevationGrid = null;
        }

        transform.appendChild(lod);

        lod = null;
        shape = null;
        elevationGrid = null;
        imageTexture = null;
        transform  = null;
        hf = null;
        x3dom.debug.logInfo('Exit setupChunk');
    };

}