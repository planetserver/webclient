function hyperspectral_load(consolestring)
    {
    consolestring = (typeof consolestring === "undefined") ? "" : consolestring;
    showLoader();
    initmetadata(); //metadata.js
    
    // Load WMS and DTM if hsdataset.metadata.region exists:
    if(hsdataset.region !== undefined)
        {
        data = regions[hsdataset.region];
        loadregion(data);
        }
    
    //
    vector_layer.setZIndex(1200);
    vector_layer2.setZIndex(1200);
    vector_layer3.setZIndex(1200);
    vector_layer4.setZIndex(1200);

    // Load image
    var bbox = new OpenLayers.Bounds(hsdataset.vnir.xmin, hsdataset.vnir.ymin, hsdataset.vnir.xmax, hsdataset.vnir.ymax);
    bbox.transform(new OpenLayers.Projection('PS:2?0'), new OpenLayers.Projection('PS:1'));
    // TODO: automatically find zoom level once you know the extent of the data
    // http://stackoverflow.com/questions/7558257/openlayers-zoomtoextent-does-not-zoom-correctly
    //
    // similar code can be found in wcpsconsole: image() and rgbimage()
    datastring = 'data.' + parseInt(hsdataset.vnir.bands/2);
    max_value = maxstr(datastring);
    var wcpsquery = 'for data in ( ' + hsdataset.vnir.collection + ' ) return encode( (char) (255 / ' + max_value + ') * (' + datastring + '), "png", "NODATA=255;" )';
    var pngurl = planetserver_wcps + '?query=' + wcpsquery;
    var i = PNGimages.length;
    var temp = {};
    temp.type = "greyscale";
    temp.base64 = base64Encode(getBinary(pngurl));
    temp.wcps = wcpsquery;
    temp.string = hsdataset.vnir.collection;
    imagedata[i] = temp;
    PNGimages[i] = new OpenLayers.Layer.Image(
        hsdataset.vnir.collection,
        'data:image/png;base64,' + temp.base64,
        bbox,
        new OpenLayers.Size(hsdataset.vnir.width, hsdataset.vnir.height),
        hsdataset.mapoptions
        );
    map.addLayers([PNGimages[i]]);
    map.setCenter(new OpenLayers.LonLat((bbox.left + bbox.right) / 2, (bbox.bottom + bbox.top) / 2), 12);
    //
    
    // Load mean value in diagram
    // Once the Diagram shows a table of contents then we can also add:
    // hsdataset.metadata.min
    // hsdataset.metadata.max
    // hsdataset.metadata.stddev
    /*var numbers = [];
    for(var i = 0; i < hsdataset.metadata.mean.length; i++){
        var wavelength = hsdataset.metadata.wavelength[i];
        numbers.push([wavelength, hsdataset.metadata.mean[i]]);
    }
    spectrum_load([numbers],["#000000"],hsdataset.collection);*/
    loadmetadata();
    //
    
    inithsmapevents(); //planetmap.events.js
    initsp(); //summaryproducts.js
    loadtoc(); //toc.js
    inittoctabs(); //gui.js
    inittocevents(); //toc.js
    hideLoader();
    spectra.replot();
    if(consolestring != "")
        {
        eval(consolestring);
        }
}

/*function initloadhs()
    {
    $('#vnirorirselect').click(function(){


    });
    }*/