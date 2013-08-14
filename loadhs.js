function hyperspectral_load()
    {
    showLoader();
    initmetadata(); //metadata.js

    // Load image
    var bbox = new OpenLayers.Bounds(hsdataset.xmin, hsdataset.ymin, hsdataset.xmax, hsdataset.ymax);
    bbox.transform(new OpenLayers.Projection('PS:2?0'), new OpenLayers.Projection('PS:1'));
    hsdataset.xmin = bbox.left;
    hsdataset.ymin = bbox.bottom;
    hsdataset.xmax = bbox.right;
    hsdataset.ymax = bbox.top;
    hsdataset.bbox = bbox;
    // TODO: automatically find zoom level once you know the extent of the data
    // http://stackoverflow.com/questions/7558257/openlayers-zoomtoextent-does-not-zoom-correctly
    //
    // similar code can be found in wcpsconsole: image() and rgbimage()
    datastring = 'data.' + parseInt(hsdataset.bands/2);
    max_value = maxstr(datastring);
    min_value = minstr(datastring);
    var wcpsquery = 'for data in ( ' + hsdataset.collection + ' ) return encode( (char) (255 / (' + max_value + ' - ' + min_value + ')) * ((' + datastring + ') - ' + min_value + '), "png", "NODATA=255;" )';
    var pngurl = planetserver_wcps + '?query=' + wcpsquery;
    var i = PNGimages.length;
    var temp = {};
    temp.type = "greyscale";
    temp.base64 = base64Encode(getBinary(pngurl));
    temp.wcps = wcpsquery;
    temp.string = hsdataset.collection;
    imagedata[i] = temp;
    PNGimages[i] = new OpenLayers.Layer.Image(
        hsdataset.collection,
        'data:image/png;base64,' + temp.base64,
        bbox,
        new OpenLayers.Size(hsdataset.width, hsdataset.height),
        hsdataset.mapoptions
        );
    map.addLayers([PNGimages[i]]);
    map.setCenter(new OpenLayers.LonLat((hsdataset.xmin + hsdataset.xmax) / 2, (hsdataset.ymin + hsdataset.ymax) / 2), 12);
    //
    
    // Load mean value in diagram
    // Once the Diagram shows a table of contents then we can also add:
    // hsdataset.metadata.min
    // hsdataset.metadata.max
    // hsdataset.metadata.stddev
    var numbers = [];
    for(var i = 0; i < hsdataset.metadata.mean.length; i++){
        var wavelength = hsdataset.metadata.wavelength[i];
        numbers.push([wavelength, hsdataset.metadata.mean[i]]);
    }
    spectrum_load([numbers],["#000000"],hsdataset.collection);
    //
    
    inithsmapevents(); //planetmap.events.js
    initsp(); //summaryproducts.js
    loadtoc(); //toc.js
    inittoctabs(); //gui.js
    inittocevents(); //toc.js
    hideLoader();
    spectra.replot();
}

function initloadhs()
    {
    $('#vnirorirselect').click(function(){
        // choose VNIR or IR
        toggleDisplay('vnirorir');
        footprints.setVisibility(false);
        //curiosity.setVisibility(false);
        //var band_array;
        if($("#vnircheck").attr('checked') == "checked")
            {
            hsdataset.productid = hsdataset.productid.toLowerCase().replace("l_","s_");
            //type = "S";
            //band_array = crism_vnir;
            }
        if($("#ircheck").attr('checked') == "checked")
            {
            //type = "L";
            hsdataset.productid = hsdataset.productid.toLowerCase();
            //band_array = crism_ir;
            }
        // Load hyperspectral
        hsdataset.collection = hsdataset.productid + "_" + pcversion + "_" + ptversion;
        hsdataset.nodata = 65535;
        hyperspectral_load();
    });
    }