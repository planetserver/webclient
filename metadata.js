function initmetadata()
    {
    var metadata = getBinary('metadata/' + hsdataset.collection + '.js');
    hsdataset.metadata = JSON.parse(metadata);
    hsdataset.xmin = hsdataset.metadata.xmin;
    hsdataset.xmax = hsdataset.metadata.xmax;
    hsdataset.ymin = hsdataset.metadata.ymin;
    hsdataset.ymax = hsdataset.metadata.ymax;
    hsdataset.width = hsdataset.metadata.width;
    hsdataset.height = hsdataset.metadata.height;
    hsdataset.bands = hsdataset.metadata.bands;
    }