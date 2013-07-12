function initmetadata()
    {
    var descov = getBinary('metadata/' + hsdataset.collection + '.js');
    descov = descov.replace(';','');
    // var descov = getBinary(planetserver_wcsdc + hsdataset.collection);
    // descov = descov.match(/gmlcov:metadata>(.+)<\/gmlcov:metadata/)[0];
    // descov = descov.replace('minimum','"minimum"');
    // descov = descov.replace('maximum','"maximum"');
    // descov = descov.replace('mean','"mean"');
    // descov = descov.replace('stddev','"stddev"');
    // descov = descov.replace('wavelength','"wavelength"');
    // descov = descov.replace('fwhm','"fwhm"');
    // descov = descov.replace('bbl','"bbl"');
    // descov = '' + descov.substring(16,descov.length - 18);
    hsdataset.metadata = JSON.parse(descov);
    
    data = JSON.parse(getBinary('wcps.php?use=metadata&collection=' + hsdataset.collection));
    // Define some global variables
    hsdataset.xmin = data.xmin;
    hsdataset.xmax = data.xmax;
    hsdataset.ymin = data.ymin;
    hsdataset.ymax = data.ymax;
    hsdataset.width = data.width;
    hsdataset.height = data.height;
    hsdataset.bands = data.bands;
    }