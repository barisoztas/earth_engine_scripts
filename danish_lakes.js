// version = 0.0.1
// App = https://oztasbaris12.users.earthengine.app/view/danish-lakes

var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    dataset = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017"),
    rgb_vis = {"opacity":1,"bands":["B4","B3","B2"],"min":-607.027817603207,"max":1474.2185690482938,"gamma":1},
    mndwi_vis = {"opacity":1,"bands":["MNDWI"],"palette":["ff0000","1000ff"]},
    ndvi_vis = {"opacity":1,"bands":["NDVI"],"palette":["ff0000","ffa500","00ff14"]},
    mask = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/danish_mask"),
    table2 = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/danish_samples");

function area_of_interest(dataset, string){
	var aoi = dataset.filter(ee.Filter.eq('country_na', string));
	Map.centerObject(aoi,7.3);
	return aoi
}
function filtering_image_collection(image_dataset, mask, cloud_cover, start_date, end_date){
	var image_dataset = L8.filterBounds(mask)
.filterMetadata('CLOUD_COVER_LAND', 'less_than', cloud_cover)
.filterDate(start_date, end_date);
	print('Size of filtered data is', image_dataset.size())
	return image_dataset
}
function median(image_dataset) {
	var median_image = image_dataset.median();
	return median_image
}
function add_symbology(image, parameters, string, shown){
	Map.addLayer(image, parameters, string, shown);
}
function MNDWI_NDVI_composite (NDVI, MNDWI, water_threshold, vegatation_threshold){
	var binary = MNDWI.gte(water_threshold).and(NDVI.lte(vegatation_threshold));
	return binary
}
function polygonize(image, mask){
  var lake_polygon = image.reduceToVectors({
    geometry: mask,
  crs: 'EPSG:32632',
  scale:7
  })
  return lake_polygon
}

var start_date  = "2020-05-01";
var end_date    = "2020-05-31";
var cloud_cover = 50;
var aoi = 'Denmark';
var denmark = area_of_interest(dataset, aoi);
var filtered_image_collection = filtering_image_collection(L8,mask, cloud_cover, start_date, end_date);
var median_image = median(filtered_image_collection);
var median_image = median_image.clip(mask);
var MNDWI = median_image.normalizedDifference(['B3','B6']).rename('MNDWI');
var NDVI = median_image.normalizedDifference(['B5','B4']).rename('NDVI');
var binary = MNDWI_NDVI_composite(NDVI,MNDWI, 0, 0);
var lake_polygon = polygonize(binary, mask);


add_symbology(median_image, rgb_vis, 'Median Image',1);
add_symbology(NDVI, ndvi_vis, 'NDVI', 0);
add_symbology(MNDWI, mndwi_vis, 'MNDWI', 0);
add_symbology(binary, null, 'Binary Image', 0)
add_symbology(lake_polygon, null, 'Lake Polygons',1)
Map.addLayer(table2, {color: 'FF0000'}, 'colored');



