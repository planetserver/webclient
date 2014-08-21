jQuery(document).ready(function(){
    //Diagram
    initspectrallibrary(); //diagram.js
    inithistogram(); //diagram.js
    //Console
    initconsole(); //wcpsconsole.js
    //GUI
    initloader(); //loader.js
    initdownloadify(); //downloadify.js
    initloadregion(); //loadregion.js
    inittabs(); //gui.js
    resizecss(); //gui.js
    initdragwindows(); //gui.js
    initguievents(); //gui.js
    //OpenLayers
    initmap(); //planetmap.js
    initmapevents(); //planetmap.events.js
    initpanels(); //planetmap.js
    initvectors(); //planetmap.js
    //downloadAndCacheProducts(-290,290,-87,87);
    //TOC
    inittoc(); //toc.js
    //URL Query
    checksinglecollection(); //urlquery.js
    checkregion(); //urlquery.js
    checkmrdr(); //urlquery.js
    checklonlat(); // urlquery.js
});

var productsCache = [];

function filterProducts(products)
    {
        var filteredProducts = [];
        for(var i = 0; i < products.length; i++)
            {
            // Only show when data is in rasdaman, currently using inrasdaman list in inrasdaman.js
            // This will need to work using GetCapabilities: http://fuzzytolerance.info/blog/parsing-wms-getcapabilities-with-jquery/
            for(var j = 0; j < inrasdaman.length; j++)
                {
                var coll = products[i].pdsid.toLowerCase() + "_" + pcversion + "_" + ptversion;
                if(inrasdaman[j] == coll)
                    {
                    filteredProducts.push(products[i]);
                    break;
                    }
                }
            }
        return filteredProducts;
    }

function downloadAndCacheProducts(westernlon,easternlon,minlat,maxlat)
    {
    productsCache = filterProducts(getProducts(false, westernlon, easternlon, minlat, maxlat));
    }

