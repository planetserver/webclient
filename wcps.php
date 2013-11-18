<?php
function get_string_between($string, $start, $end)
    {
	$string = " ".$string;
	$ini = strpos($string,$start);
	if ($ini == 0) return "";
	$ini += strlen($start);
	$len = strpos($string,$end,$ini) - $ini;
	return substr($string,$ini,$len);
    }

if($_SERVER['REQUEST_METHOD'] == 'POST')
    {
    //header('Content-Disposition: attachment; filename="'.$_POST['filename'].'"');
    //echo $_POST["data"];
    $fp = fopen("php://output", 'w');
    //header("Content-type: application/vnd.ms-word");
    header("Content-Disposition: attachment;Filename=".$_POST['filename']);
    $fp = fopen("php://output", 'w');
    fwrite($fp,$_POST["data"]);
    fclose($fp);
    }
else
    {
    $use = $_GET['use'];

    // Initialize CURL:
    $curl_connection = curl_init('http://planetserver.jacobs-university.de:8080/petascope/wcps');
    //$curl_connection = curl_init('http://10.70.2.196:8080/petascope/wcps');
    curl_setopt($curl_connection, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($curl_connection, CURLOPT_USERAGENT,
    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)");
    curl_setopt($curl_connection, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl_connection, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl_connection, CURLOPT_FOLLOWLOCATION, 1);

    // Options:
    if($use=="export")
        {
        header('Content-Disposition: attachment; filename="'.$_GET['filename'].'"');
        echo urldecode($_GET['data']);
        }
    elseif($use=="png")
        {
        if($_GET['filename'] != "");
            {
            header('Content-Disposition: attachment; filename="'.$_GET['filename'].'"');
            }
        $query = $_GET['query'];
        $query = urlencode($query);
        // CURL execute:
        $post_string = 'query=' . $query;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $result = curl_exec($curl_connection);

        //$image_types = array("jpg","png","jpeg","tif","tiff");
        //if(in_array($type, $image_types))

        header("Content-Type: image/png");
        // Gave 500 Error first, had to follow http://www.boutell.com/gd/faq.html
        $im = imagecreatefromstring($result);
        $w = imagesx($im); // image width
        $h = imagesy($im); // image height
        // Check the UL,UR,LL,LR corner colour values and chose the most occurring color:
        $ul = imagecolorat($im, 1, 1);
        $ur = imagecolorat($im, 1, $h - 1);
        $ll = imagecolorat($im, $w - 1, 1);
        $lr = imagecolorat($im, $w - 1, $h - 1);
        $colours = array($ul, $ur, $ll, $lr);
        $counted = array_count_values($colours); 
        arsort($counted); 
        $color = key($counted);
        if($color > 255)
            {
            // RGB
            $r = ($color >> 16) & 0xFF;
            $g = ($color >> 8) & 0xFF;
            $b = $color & 0xFF;
            $bgcolor = imagecolorexact($im, $r, $g, $b);
            }
        else
            {
            // Greyscale
            $bgcolor = imagecolorexact($im, $color, $color, $color);
            }
        imagecolortransparent($im, $bgcolor);
        imagepng($im);
        imagedestroy($im);
        }
    elseif($use=="csv")
        {
        $query = $_GET['query'];
        $query = urlencode($query);

        // CURL execute:
        $post_string = 'query=' . $query;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $values = curl_exec($curl_connection);
        $values = explode(' ', (string) substr($values,1,-1)); // substring to get rid of the {}. Make this cleaner.
        
        $results = array(
            'data' => $values
        );

        print json_encode($results);
        }
    elseif($use=="histogram")
        {
        $collection = $_GET['collection'];
        $calc = $_GET['calc'];
        $nodata = $_GET['nodata'];
        $nrbins = $_GET['nrbins'];

        $minquery = urlencode('for data in ( '.$collection.' ) return encode( min((('.$calc.')='.$nodata.') * (('.$calc.') + 1) + (('.$calc.')!='.$nodata.') *  ('.$calc.')), "csv")');
        $maxquery = urlencode('for data in ( '.$collection.' ) return encode( max((('.$calc.')!='.$nodata.') * ('.$calc.')), "csv")');

        // CURL execute:
        $post_string = 'query=' . $minquery;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $minx = curl_exec($curl_connection);
        $minx = substr($minx,1,-1);
        $post_string = 'query=' . $maxquery;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $maxx = curl_exec($curl_connection);
        $maxx = substr($maxx,1,-1);

        $histquery = urlencode('for data in ( '.$collection.' )
              return
                  encode( coverage histogram
                          over     $n x(0:'.($nrbins - 1).')
                          values   count(
                                       '.$calc.' >= '.$minx.' + $n*('.$maxx.' - '.$minx.') / '.$nrbins.' and
                                       '.$calc.' < '.$minx.' + (1+$n)*('.$maxx.' - '.$minx.') / '.$nrbins.'),
                          "csv" )');

        //CURL execute:
        $post_string = 'query=' . $histquery;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $histogram = curl_exec($curl_connection);
        $histogram = substr($histogram,1,-1);

        $results = array(
            'data' => $histogram
        );

        print json_encode($results);
        }
    elseif($use=="spectrum")
        {
        $collection = $_GET['collection'];
        $lon = $_GET['lon'];
        $lat = $_GET['lat'];
        $query = 'for m in ( '.$collection.' ) return encode(  (m[x:"http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/1/"('.$lon.':'.$lon.'),y:"http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/1/"('.$lat.':'.$lat.')]), "csv")';
        
        // CURL execute:
        $post_string = 'query=' . $query;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $values = curl_exec($curl_connection);
        $values = explode(' ', (string) substr($values,2,-2));

        $results = array(
            'domainInfo' => array(
                'lowLimit' => $lon.' '.$lat,
                'highLimit' => $lon.' '.$lat,
                'axisLabel' => "x y"
            ),
            'data' => $values
        );

        print json_encode($results);
        }
    elseif($use=="spectrum_imagecrs")
        {
        $collection = $_GET['collection'];
        $pixelX = $_GET['pixelX'];
        $pixelY = $_GET['pixelY'];
        $query = 'for data in ( '.$collection.' ) return encode( data[x:"CRS:1"('.$pixelX.':'.$pixelX.'),y:"CRS:1"('.$pixelY.':'.$pixelY.')], "csv" )';
        
        // CURL execute:
        $post_string = 'query=' . $query;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $values = curl_exec($curl_connection);
        $values = explode(' ', (string) substr($values,2,-2));

        $results = array(
            'domainInfo' => array(
                'lowLimit' => $pixelX.' '.$pixelY,
                'highLimit' => $pixelX.' '.$pixelY,
                'axisLabel' => "x y"
            ),
            'data' => $values
        );

        print json_encode($results);
        }
    elseif($use=="xyz")
        {
        $collection = $_GET['collection'];
        
        $queryx = 'for data in ( '.$collection.' ) return imageCrsDomain(data,x)';
        $queryy = 'for data in ( '.$collection.' ) return imageCrsDomain(data,y)';
        $queryz = 'for data in ( '.$collection.' ) return encode( data[x:"CRS:1"(0:0),y:"CRS:1"(0:0)], "csv" )';
        
        // CURL execute:
        $post_string = 'query=' . $queryx;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $xvalue = curl_exec($curl_connection);
        $post_string = 'query=' . $queryy;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $yvalue = curl_exec($curl_connection);
        $post_string = 'query=' . $queryz;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $zvalue = curl_exec($curl_connection);
        
        $xvalue = get_string_between($xvalue, ",", ")") + 1;
        $yvalue = get_string_between($yvalue, ",", ")") + 1;
        $zvalue = substr_count($zvalue, " ") + 1; //This of course depends on the deliminator.

        $results = array(
                'x' => (string) $xvalue,
                'y' => (string) $yvalue,
                'z' => (string) $zvalue
            );
        print json_encode($results);
        }
    elseif($use=="exist")
        {
        $collection = $_GET['collection'];
        $query = 'for c in ( '.$collection.' ) return identifier(c)';

        // CURL execute:
        $post_string = 'query=' . $query;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $values = curl_exec($curl_connection);

        if($values == $collection)
            {
            print 1;
            }
        else
            {
            print 0;
            }
        }
    elseif($use=="extent")
        {
        $collection = $_GET['collection'];
        
        $queryx = 'for data in ( '.$collection.' ) return domain(data,x,"http://www.opengis.net/def/crs/EPSG/0/4326")';
        $queryy = 'for data in ( '.$collection.' ) return domain(data,y,"http://www.opengis.net/def/crs/EPSG/0/4326")';
        
        // CURL execute:
        $post_string = 'query=' . $queryx;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $xextent = curl_exec($curl_connection);
        $post_string = 'query=' . $queryy;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $yextent = curl_exec($curl_connection);
        
        $xextent = explode(',', get_string_between($xextent, "(", ")"));
        $yextent = explode(',', get_string_between($yextent, "(", ")"));

        $results = array(
                'xmin' => (string) $xextent[0],
                'xmax' => (string) $xextent[1],
                'ymin' => (string) $yextent[0],
                'ymax' => (string) $yextent[1]
            );
        print json_encode($results);
        }
    elseif($use=="metadata")
        {
        $collection = $_GET['collection'];
        
        $querywidth = 'for data in ( '.$collection.' ) return imageCrsDomain(data,x)';
        $queryheight = 'for data in ( '.$collection.' ) return imageCrsDomain(data,y)';
        $querybands = 'for data in ( '.$collection.' ) return encode( data[x:"CRS:1"(0:0),y:"CRS:1"(0:0)], "csv" )';
        $queryexx = 'for data in ( '.$collection.' ) return domain(data,x,"http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/1/")';
        $queryexy = 'for data in ( '.$collection.' ) return domain(data,y,"http://kahlua.eecs.jacobs-university.de:8080/def/crs/PS/0/1/")';
        
        // CURL execute:
        $post_string = 'query=' . $querywidth;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $width = curl_exec($curl_connection);
        $post_string = 'query=' . $queryheight;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $height = curl_exec($curl_connection);
        $post_string = 'query=' . $querybands;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $bands = curl_exec($curl_connection);
        $post_string = 'query=' . $queryexx;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $xextent = curl_exec($curl_connection);
        $post_string = 'query=' . $queryexy;
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, $post_string);
        $yextent = curl_exec($curl_connection);
        
        $width = get_string_between($width, ",", ")") + 1;
        $height = get_string_between($height, ",", ")") + 1;
        $bands = substr_count($bands, " ") + 1; //This of course depends on the deliminator.
        $xextent = explode(',', get_string_between($xextent, "(", ")"));
        $yextent = explode(',', get_string_between($yextent, "(", ")"));

        $results = array(
                'width' => (int) $width,
                'height' => (int) $height,
                'bands' => (int) $bands,
                'xmin' => (float) $xextent[0],
                'xmax' => (float) $xextent[1],
                'ymin' => (float) $yextent[0],
                'ymax' => (float) $yextent[1]
            );
        print json_encode($results);
        }
    else
        {
        print "Wrong usage";
        }

    // Close CURL:
    curl_close($curl_connection);
    }
?>
