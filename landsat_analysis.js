var Landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR"),
    bounds = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/danish_mask_for_lakes"),
    Landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    Landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");


function CalculateNDVI_l5(image){
	var NDVI = image.normalizedDifference(['B4','B3']).rename('NDVI');
	return NDVI;  
}

function CalculateNDVI_l8(image){
	var NDVI = image.normalizedDifference(['B5','B4']).rename('NDVI');
	return NDVI;  
}

function CalculateMNDWI_l5(image){
	var MNDWI = image.normalizedDifference(['B5','B2']).rename('MNDWI');
	return MNDWI;  
}

function CalculateMNDWI_l8(image){
	var MNDWI = image.normalizedDifference(['B5','B2']).rename('MNDWI');
	return MNDWI;  
}

function CalculateBinary(image){
	var MNDWI = image.select('MNDWI');
	var NDVI = image.select('NDVI');
	var binary = MNDWI.gte(0).and(NDVI.lte(0));
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
.filterMetadata('CLOUD_COVER', 'less_than', 30)
.sort('system:time_start', true);

print(filtered_collection_l5.size());


var filtered_collection_l8 = Landsat8.filterDate('2013-04-01', '2020-12-31')
.filterBounds(bounds)
.filterMetadata('CLOUD_COVER', 'less_than', 30)
.sort('system:time_start', true);

print(filtered_collection_l8.size())

var filtered_collection_l7 = Landsat7.filterDate('2011-10-22', '2013-04-01')
.filterBounds(bounds)
.filterMetadata('CLOUD_COVER', 'less_than', 30)
.sort('system:time_start', true);

print(filtered_collection_l7.size())

var merged_landsat_collection_l5_l7 = filtered_collection_l5.merge(filtered_collection_l7);

// NDVI Calculation
var NDVI_collection_l5 = merged_landsat_collection_l5_l7.map(CalculateNDVI_l5);
var NDVI_collection_l8 = filtered_collection_l8.map(CalculateNDVI_l8);
var NDVI_collection = NDVI_collection_l5.merge(NDVI_collection_l8);
print(NDVI_collection)

// MNDWI Calculation
var MDNWI_collection_l5 = merged_landsat_collection_l5_l7.map(CalculateMNDWI_l5);
var MNDWI_collection_l8 = filtered_collection_l8.map(CalculateMNDWI_l8);
var MNDWI_collection = MDNWI_collection_l5.merge(MNDWI_collection_l8);
print(MNDWI_collection)

// Binarization

var combined_list = NDVI_collection.combine(MNDWI_collection);
var binary_list = combined_list.map(CalculateBinary);
print(combined_list)
print(binary_list)

// Polygonization

var lake_polygon = binary_list.map(polygonization);
print (lake_polygon)

