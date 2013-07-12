function initdownloadify()
    {
    Downloadify.create('spectrum_download',{
        filename: function()
            {
            if($('.defaulttab').hasClass('selected'))
                {
                if (typeof diagramplot.spectra != 'undefined')
                    {
                    return 'spectra.csv';
                    }
                }
            else if($('.histtab').hasClass('selected'))
                {
                if (typeof diagramplot.histogram != 'undefined')
                    {
                    return 'histogram.csv';
                    }
                }
            else if($('.crosstab').hasClass('selected'))
                {
                if (typeof diagramplot.crosssection != 'undefined')
                    {
                    return 'crosssection.csv';
                    }
                }
            },
        data: function()
            {
            if($('.defaulttab').hasClass('selected'))
                {
                if (typeof diagramplot.spectra != 'undefined')
                    {
                    return spectrumtocsv(diagramplot.spectra);
                    }
                }
            else if($('.histtab').hasClass('selected'))
                {
                if (typeof diagramplot.histogram != 'undefined')
                    {
                    return histogramtocsv(diagramplot.histogram);
                    }
                }
            else if($('.crosstab').hasClass('selected'))
                {
                if (typeof diagramplot.crosssection != 'undefined')
                    {
                    return crosssectiontocsv(diagramplot.crosssection);
                    }
                }
            },
        onComplete: function(){ alert('Your file has been saved!'); },
        //onCancel: function(){ alert('You have cancelled the saving of this file.'); },
        onError: function(){ alert('You must put something in the File Contents or there will be nothing to save!'); },
        swf: 'media/downloadify.swf',
        downloadImage: 'images/download.png',
        width: 17,
        height: 17,
        transparent: true,
        append: false
    });
    }