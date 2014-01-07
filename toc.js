var layerSwitcher;

function inittoc()
    {
    // changed OpenLayers.js line 2808 - "roundedCorner:false" to fix the display of layerswitcher inside toc
    // changed OpenLayers.js line 2820 - this.dataLbl.innerHTML=OpenLayers.i18n("");
    // chnged OpenLayers.js line 2137 - this.eBottom.style.visibility="none";
    layerSwitcher = new OpenLayers.Control.LayerSwitcher({'div':OpenLayers.Util.getElement('layerswitcher')});
    layerSwitcher.ascending = false;
    layerSwitcher.useLegendGraphics = true;
    map.addControl(layerSwitcher);
    // END
    }

function loadtoc()
    {
    // Fill TOC
    $("#toc").html('<div id="title-wrapper"><div id="title">TABLE OF CONTENTS</div></div><div id="close-wrapper"><a href="javascript:void(0)" onclick="toggleDisplay(&quot;toc&quot;)">X</a></div></br></br><div id="layerswitcher"></div><div id="dimensions"></div><div id="bandlist"></div>');
    // VNIR band list
    var vnirbandoptions = '';
    var len = parseInt(hsdataset.vnir.bands);
    for (var i = 0; i < len; i++) {
        bandnr = 'band' + (i+1);
        if(hsdataset.vnir.metadata.bbl[i] == 0)
            {
            vnirbandoptions += '<option value="' + bandnr + '">' + bandnr + ' (' + hsdataset.vnir.metadata.wavelength[i] + ') (bad)</option>';
            }
        else
            {
            vnirbandoptions += '<option value="' + bandnr + '">' + bandnr + ' (' + hsdataset.vnir.metadata.wavelength[i] + ')</option>';
            }
    }
    // IR band list
    var irbandoptions = '';
    var len = parseInt(hsdataset.ir.bands);
    for (var i = 0; i < len; i++) {
        bandnr = 'band' + (i+1);
        if(hsdataset.ir.metadata.bbl[i] == 0)
            {
            irbandoptions += '<option value="' + bandnr + '">' + bandnr + ' (' + hsdataset.ir.metadata.wavelength[i] + ') (bad)</option>';
            }
        else
            {
            irbandoptions += '<option value="' + bandnr + '">' + bandnr + ' (' + hsdataset.ir.metadata.wavelength[i] + ')</option>';
            }
    }
    // REMOVED BUG: onclick="toggleDisplay(&quot;dimensions&quot;);... into onclick="toggleDisplay(&quot;bandselect&quot;)
    var html2 = '<input class="pnglayer" type="checkbox" value="0" checked="true"/><span href="javascript:void(0)" onclick="toggleDisplay(&quot;bandstoc&quot;);toggleDisplay(&quot;pngselect&quot;)"><img id="special" src="images/collapse.png"/></span>&nbsp;' + PNGimages[0].name.substring(0,11).toUpperCase();
    var overlay = jQuery('<div id="bandstoc"><ul class="tabs2"><li class="first"><a href="javascript:vnir()" class="defaulttab2" rel="tabs21" style="font-size: 11px;">VNIR&nbsp;</a></li><li><a href="javascript:ir()"  rel="tabs22" style="font-size: 11px;">IR&nbsp;</a></li><li><a href="javascript:vnir()" rel="tabs23" style="font-size: 11px;">VNIR SP&nbsp;</a></li><li><a href="javascript:ir()" rel="tabs24" style="font-size: 11px;">&nbsp;IR SP</a></li></ul><div class="tab-content2" id="tabs21"><select size=20 multiple="multiple" name="vnirbandselect" id="vnirbandselect"></select></div><div class="tab-content2" id="tabs22"><select size=20 multiple="multiple" name="irbandselect" id="irbandselect"></select></div><div class="tab-content2" id="tabs23"><select size=20 multiple="multiple" name="vnirsp" id="vnirsp"></select></div><div class="tab-content2" id="tabs24"><select size=20 multiple="multiple" name="irsp" id="irsp"></select></div></div>');
    var overlay2 = jQuery('<form id="pngsel"></form>');
    var overlay3 = jQuery('<form id="pngselect"></form>');
    var layerSwitcher = new OpenLayers.Control.LayerSwitcher({'div':OpenLayers.Util.getElement('layerswitcher')});
    map.addControl(layerSwitcher);
    $("#dimensions").append(overlay2);
    $("#dimensions").append(overlay3);
    $("#pngsel").append(html2);
    $("#dimensions").append('<div id="png"></div>');
    $("#dimensions").append(overlay);
    $('#vnirbandselect').append(vnirbandoptions);
    $('#irbandselect').append(irbandoptions);
    $("#bandlist").append(jQuery('<br><br>R: <input name="red" id="red" value="band70" />'));
    $("#bandlist").append(jQuery('<br>G: <input name="green" id="green" value="band80" />'));
    $("#bandlist").append(jQuery('<br>B: <input name="blue" id="blue" value="band90" />'));
    $("#bandlist").append(jQuery('<br><br><input type="button" name="greyquery" id="greyquery" value="Greyscale" />&nbsp;&nbsp;<input type="button" name="rgbquery" id="rgbquery" value="RGB" />'));
    adjustCSS();
    
    // VNIR SP list
    var spoptions = '';
    for (var key in vnirsp)
        {
        spoptions += '<option value="' + vnirsp[key.toString()] + '">' + key + '</option>';
        }
    $('#vnirsp').append(spoptions);
    // IR SP list
    var spoptions = '';
    for (var key in irsp)
        {
        spoptions += '<option value="' + irsp[key.toString()] + '">' + key + '</option>';
        }
    $('#irsp').append(spoptions);
    }
    
function inittocevents()
    {
    $("#vnirbandselect").click(function(e) {
        value = $('#vnirbandselect').val();
        if(rgb == 0)
            {
            $('#red').val(value);
            rgb = 1;
            }
        else if(rgb == 1)
            {
            $('#green').val(value);
            rgb = 2;
            }
        else if(rgb == 2)
            {
            $('#blue').val(value);
            rgb = 0;
            }
        });
    $("#irbandselect").click(function(e) {
        value = $('#irbandselect').val();
        if(rgb == 0)
            {
            $('#red').val(value);
            rgb = 1;
            }
        else if(rgb == 1)
            {
            $('#green').val(value);
            rgb = 2;
            }
        else if(rgb == 2)
            {
            $('#blue').val(value);
            rgb = 0;
            }
        });
    $("#vnirsp").click(function(e) {
        value = $('#vnirsp').val();
        if(rgb == 0)
            {
            $('#red').val(value);
            rgb = 1;
            }
        else if(rgb == 1)
            {
            $('#green').val(value);
            rgb = 2;
            }
        else if(rgb == 2)
            {
            $('#blue').val(value);
            rgb = 0;
            }
        });
    $("#irsp").click(function(e) {
        value = $('#irsp').val();
        if(rgb == 0)
            {
            $('#red').val(value);
            rgb = 1;
            }
        else if(rgb == 1)
            {
            $('#green').val(value);
            rgb = 2;
            }
        else if(rgb == 2)
            {
            $('#blue').val(value);
            rgb = 0;
            }
        });
        
    $("#rgbquery").click(function(e) {
        red = band2data($('#red').val());
        green = band2data($('#green').val());
        blue = band2data($('#blue').val());
        rgbimage(red,green,blue);
    });
    $("#greyquery").click(function(e) {
        var calc;
        if($('.selected2').html() == "VNIR&nbsp;")
            {
            calc = $('#vnirbandselect').val();
            }
        else if($('.selected2').html() == "IR&nbsp;")
            {
            var calc = $('#irbandselect').val();
            }
        else if($('.selected2').html() == "VNIR SP&nbsp;")
            {
            var calc = $('#vnirsp').val();
            }
        else if($('.selected2').html() == "&nbsp;IR SP")
            {
            var calc = $('#irsp').val();
            }
        if(calc==null)
            {
            alert("please select a band!");
            }
        else
            {
            image(calc);
            }
    });
    
    // SHOW/HIDE PNG IMAGE WHEN CHECKED OR UNCHECKED
    $('.pnglayer').change(function() {
        i = $(this).val();
        //alert(i);
        if ($(this).is(':checked')) {
            // the checkbox was checked
            PNGimages[i].setVisibility(true);
        } 
        else {
            // the checkbox was unchecked
            PNGimages[i].setVisibility(false);        
        }
    });
    }