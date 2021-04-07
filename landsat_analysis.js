var Landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR"),
    bounds = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/danish_mask_for_lakes"),
    Landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    Landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");
    mndwi_vis = {"opacity":1,"bands":["MNDWI"],"palette":["ff0000","1000ff"]};
    ndvi_vis = {"opacity":1,"bands":["NDVI"],"palette":["ff0000","ffa500","00ff14"]};


function CalculateNDVI_l5(image){
	var NDVI = image.normalizedDifference(['B4','B3']).rename('NDVI');
	return NDVI;  
}

function CalculateNDVI_l8(image){
	var NDVI = image.normalizedDifference(['B5','B4']).rename('NDVI');
	return NDVI;  
}

function CalculateMNDWI_l5(image){
	var MNDWI = image.normalizedDifference(['B2','B5']).rename('MNDWI');
	return MNDWI;  
}

function CalculateMNDWI_l8(image){
	var MNDWI = image.normalizedDifference(['B3','B6']).rename('MNDWI');
	return MNDWI;  
}

function CalculateBinary(image){
	var MNDWI = image.select('MNDWI');
	var NDVI = image.select('NDVI');
	var binary = MNDWI.gte(0).and(NDVI.lte(0)).rename('Binary');
	return binary
}

function CalculateBinaryfromMNDWI(image){
	var MNDWI = image.select('MNDWI');
	var NDVI = image.select('NDVI');
	var binary = MNDWI.gte(0.2).rename('Binary_MNDWI');
	return binary
}

function polygonization(image){
	var lake_polygon = image.reduceToVectors({
		geometry: bounds,
		crs: 'EPSG:32632',
		scale: 30
	})
  return lake_polygon
}

var filtered_collection_l5 = Landsat5.filterDate('1984-01-01', '2012-12-31')
.filterBounds(bounds)
.filterMetadata('CLOUD_COVER_LAND', 'less_than', 5)
.sort('system:index', true);

print(filtered_collection_l5.size());


var filtered_collection_l8 = Landsat8.filterDate('2013-04-01', '2020-12-31')
.filterBounds(bounds)
.filterMetadata('CLOUD_COVER_LAND', 'less_than', 5)
.sort('system:index', true);

print(filtered_collection_l8.size());

var filtered_collection_l7 = Landsat7.filterDate('2011-10-22', '2013-04-01')
.filterBounds(bounds)
.filterMetadata('CLOUD_COVER_LAND', 'less_than', 5)
.sort('system:index', true);

print(filtered_collection_l7.size());


var merged_landsat_collection_l5_l7 = filtered_collection_l5.merge(filtered_collection_l7).sort('system:index', true);
var merge_all = merged_landsat_collection_l5_l7.merge(filtered_collection_l8).sort('system:index', true);
// print(merged_landsat_collection_l5_l7)

// NDVI Calculation
var NDVI_collection_l5 = merged_landsat_collection_l5_l7.map(CalculateNDVI_l5);
var NDVI_collection_l8 = filtered_collection_l8.map(CalculateNDVI_l8);
var NDVI_collection = NDVI_collection_l5.merge(NDVI_collection_l8);
// print('ndvi',NDVI_collection);

// MNDWI Calculation
var MDNWI_collection_l5 = merged_landsat_collection_l5_l7.map(CalculateMNDWI_l5);
var MNDWI_collection_l8 = filtered_collection_l8.map(CalculateMNDWI_l8);
var MNDWI_collection = MDNWI_collection_l5.merge(MNDWI_collection_l8);
// print('mndwi',MNDWI_collection);

// Binarization

var combined_list = NDVI_collection.combine(MNDWI_collection);
// print('combined', combined_list);
var binary = combined_list.sort('system:index', true).map(CalculateBinaryfromMNDWI);
print(binary.toList(5000));

var image_number = 700;

var listOfImages_binary = binary.toList(binary.size());
var intended_image_binary = listOfImages_binary.get(image_number);
print(intended_image_binary);

var listOfImages_mndwi = MNDWI_collection.toList(MNDWI_collection.size());
var intended_image_mndwi = listOfImages_mndwi.get(image_number);
print(intended_image_mndwi);

var listOfImages_ndvi = NDVI_collection.toList(NDVI_collection.size());
var intended_image_ndvi = listOfImages_ndvi.get(image_number);
print(intended_image_ndvi);

var listOfImages_rgb = merge_all.toList(merge_all.size());
var intended_image_rgb = listOfImages_rgb.get(image_number);
print(intended_image_rgb);



Map.centerObject(ee.Image(intended_image_binary),8)
Map.addLayer(ee.Image(intended_image_mndwi),mndwi_vis,'mdnwi',0)
Map.addLayer(ee.Image(intended_image_ndvi),ndvi_vis,'ndvi',0)
Map.addLayer(ee.Image(intended_image_rgb), l5_7);
Map.addLayer(ee.Image(intended_image_binary), null,'binary')
Map.addLayer(lakes, {color: 'FF0000'}, 'Lake Dataset');

function mean(image){
  var reduced = image.reduceRegions({
  reducer: ee.Reducer.mean(), //Gives you the mean, it has other variable like sum min max
  collection: table.geometry(),
  scale: 1000
});
return reduced
}


//Export.table.toDrive({
//  collection: area_data.flatten(),
//  description: 'Names_cloud_cover_5'
// })


