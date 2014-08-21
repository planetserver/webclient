function initmetadata()
    {
    var vnirmetadata = getBinary('regionsdata/metadata/' + hsdataset.vnir.collection + '.js');
    hsdataset.vnir.metadata = JSON.parse(vnirmetadata);
    hsdataset.vnir.xmin = hsdataset.vnir.metadata.xmin;
    hsdataset.vnir.xmax = hsdataset.vnir.metadata.xmax;
    hsdataset.vnir.ymin = hsdataset.vnir.metadata.ymin;
    hsdataset.vnir.ymax = hsdataset.vnir.metadata.ymax;
    hsdataset.vnir.width = hsdataset.vnir.metadata.width;
    hsdataset.vnir.height = hsdataset.vnir.metadata.height;
    hsdataset.vnir.bands = hsdataset.vnir.metadata.bands;
    var vnirbbox = new OpenLayers.Bounds(hsdataset.vnir.xmin, hsdataset.vnir.ymin, hsdataset.vnir.xmax, hsdataset.vnir.ymax);
    vnirbbox.transform(new OpenLayers.Projection('PS:2?0'), new OpenLayers.Projection('PS:1'));
    hsdataset.vnir.left = vnirbbox.left;
    hsdataset.vnir.right = vnirbbox.right;
    hsdataset.vnir.bottom = vnirbbox.bottom;
    hsdataset.vnir.top = vnirbbox.top;
    hsdataset.vnir.bbox = vnirbbox;

    var irmetadata = getBinary('regionsdata/metadata/' + hsdataset.ir.collection + '.js');
    hsdataset.ir.metadata = JSON.parse(irmetadata);
    hsdataset.ir.xmin = hsdataset.ir.metadata.xmin;
    hsdataset.ir.xmax = hsdataset.ir.metadata.xmax;
    hsdataset.ir.ymin = hsdataset.ir.metadata.ymin;
    hsdataset.ir.ymax = hsdataset.ir.metadata.ymax;
    hsdataset.ir.width = hsdataset.ir.metadata.width;
    hsdataset.ir.height = hsdataset.ir.metadata.height;
    hsdataset.ir.bands = hsdataset.ir.metadata.bands;
    var irbbox = new OpenLayers.Bounds(hsdataset.ir.xmin, hsdataset.ir.ymin, hsdataset.ir.xmax, hsdataset.ir.ymax);
    irbbox.transform(new OpenLayers.Projection('PS:2?0'), new OpenLayers.Projection('PS:1'));
    hsdataset.ir.left = irbbox.left;
    hsdataset.ir.right = irbbox.right;
    hsdataset.ir.bottom = irbbox.bottom;
    hsdataset.ir.top = irbbox.top;
    hsdataset.ir.bbox = irbbox;
    
    hsdataset.region = hsdataset.vnir.metadata.region;
    }