function inithistogram()
    {
    $('#histcalc').click(function(e) {
        var calc = $('#bandselect').val();
        if(calc==null)
            {
            alert("please select a band!");
            }
        else
            {
            var nrbins = $('#nrbins').val();
            histogram(band2data(calc.toString()),nrbins);
            }
    });
    }

function initspectrallibrary()
    {
    $('#loadlibrary').click(function(e) {
        var library = $('#spectrallibrary').val();
        if (library == "selectlibrary") {
            alert("Please select one of the libraries before clicking on the load button.");
        }
        else
            {
            var libspectra = $('#selectspectra[name=' + library + ']').val();
            if(libspectra == undefined)
                {
                // first load the corresponding js file
                var file = 'speclib/' + library+'.js';
                $.getScript(file)
                .done(function(){
                    eval('data = ' + library + ';');
                    var html = '';
                    for (var key in data)
                        {
                        if(key != "Wavelength")
                            {
                            html += '<option value="' + key + '">' + key + '</option>';
                            }
                        }
                    var libraryselect = '<select name="' + library + '" id="selectspectra" size=1>' + html + '</select>';
                    $("#afterload").html(libraryselect);
                })
                .fail(function(){
                alert("Error loading the file.");
                });
                }
            else
                {
                var numbers = [];
                eval('data = ' + library + ';');
                wavelength = data["Wavelength"];
                values = data[libspectra];
                for(var i = 0; i < wavelength.length; i++){
                    numbers.push([wavelength[i], values[i]]);
                }
                var output = [];
                var tempcolors = [];
                for (i=0; i < pos; i++) {
                    output.push(hsdataset.point[i].spectrum);
                    tempcolors.push(colors[i]);
                }
                tempcolors.push("Black");
                output.push(numbers);
                spectrum_load(output,tempcolors,libspectra);
                }
            }
     });
    }
    
function spectrum_load(numbers,colors,title)
    {
    // Switch to SPECTRUM TAB and then plot the spectrum
    switch_tabs($('.defaulttab'));
    diagramplot.spectra = numbers;
    $.jqplot.config.enablePlugins = true;
    spectra = $.jqplot('chartPlace', numbers, {
        title: title,
        cursor: {
            show: true,
            zoom : true
        },
        highlighter : {
            show : true
        },
        series: [{breakOnNull: true}],
        seriesDefaults: {
            renderer: $.jqplot.LineRenderer,
            lineWidth: 1,
            rendererOptions: {
                smooth: true,
                animation: {
                    show: true
                }
            },
            showMarker: false,
            pointLabels: {
                show: false
            }
        },
        axes: {
            xaxis: {
                pad: 1.1
            },
            yaxis: {
                pad: 1.1
            }
        },
        seriesColors: colors
    });
    spectra.replot();
    }
function histdiagram(numbers)
    {
    // find the largest entry to determine the range of the plot
    var n = Math.max.apply( null, numbers);
    var mult = Math.pow(10, 2 - Math.floor(Math.log(n) / Math.LN10) - 1); //round to two s.f.
    var n = Math.round(n * mult) / mult;
    var largest = n * 1.1;
    // Switch to HISTOGRAM TAB and then plot the histogram
    diagramplot.histogram = numbers;
    switch_tabs($('.histtab'));
    $.jqplot.config.enablePlugins = true;
    hist = $.jqplot('histPlace', [numbers], {
         title: collection,
         seriesDefaults:{
             renderer: $.jqplot.BarRenderer,
             rendererOptions: {
                barMargin: 5
            },
            showMarker: false,
            pointLabels: { show: false }
        },
        axes: {
            xaxis: {
                renderer:  $.jqplot.CategoryAxisRenderer,
                pad: 0
            },
            yaxis: {
                min: 0,
                max: largest
            }
        },
        highlighter: {
            sizeAdjust: 7.5
        },
        cursor: {
            show: false
        }
    });
    hist.replot();
    }
function crossdiagram(numbers)
    {
    var nodata = dtmdataset.nodata;
        
    // Switch to CROSS TAB and then plot the cross diagram
    switch_tabs($('.crosstab'));
    diagramplot.crosssection = numbers;
    $.jqplot.config.enablePlugins = true;
    cross = $.jqplot('crossPlace', numbers, {
        title: 'Cross Section',
        cursor: {
            show: true,
            zoom : true
        },
        highlighter : {
            show : true
        },
        series: [{breakOnNull: true}],
        seriesDefaults: {
            renderer: $.jqplot.LineRenderer,
            lineWidth: 1,
            rendererOptions: {
                smooth: true,
                animation: {
                    show: true
                }
            },
            showMarker: false,
            pointLabels: {
                show: false
            }
        }
    });
    cross.replot();
    }
function histogramtocsv(numbers)
    {
    string = "BIN,COUNT\n";
    for(var i = 0; i < numbers.length; i++)
        {
        j = i + 1;
        string = string + j + "," + numbers[i] + "\n";
        }
    return string;
    }
function spectrumtocsv(numbers)
    {
    headerstring = "WAVELENGTH,";
    for(var i = 0; i < numbers.length; i++)
        {
        spectrumcolumn = "SPECTRUM" + (i + 1);
        headerstring = headerstring + spectrumcolumn + ",";
        }
    string = headerstring + "\n";
    for(var i = 0; i < numbers[0].length; i++)
        {
        string = string + numbers[0][i][0] + "," + numbers[0][i][1];
        for(var j = 1; j < numbers.length; j++)
            {
            string = string + "," + numbers[j][i][1];
            }
        string = string + "\n";
        }
    return string;
    }
function crosssectiontocsv(numbers)
    {
    string = "METER,ELEVATION\n";
    for(var i = 0; i < numbers[0].length; i++)
        {
        string = string + numbers[0][i][0] + "," + numbers[0][i][1] + "\n";
        }
    return string;
    }
