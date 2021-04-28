var Landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    Landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR"),
    all_lakes = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/updated_mask"),
    sal = {"opacity":1,"bands":["Salinity"],"palette":["ff0000","0008ff"]},
    salda = 
    /* color: #0b4a8b */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[29.636899620282133, 37.561846117039345],
          [29.636899620282133, 37.54333758508176],
          [29.66196218131729, 37.54333758508176],
          [29.66196218131729, 37.561846117039345]]], null, false),
    lake_tuz = 
    /* color: #00ffff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[33.28685518635397, 38.9109774698425],
          [33.28685518635397, 38.86608254097312],
          [33.34453340901022, 38.86608254097312],
          [33.34453340901022, 38.9109774698425]]], null, false),
    ulvedybet_nord = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ulvedybet_nord_base"),
    ulvedybet_nord_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ulvedybet_nord_point_buffer_30m"),
    vearn_sande = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/vearn_sande_base"),
    vearn_sande_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/vearn_sande_point_buffer_30m"),
    keldsnor = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/keldsnor_base"),
    keldsnor_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/keldsnor_point_buffer_30m"),
    ferring_so = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ferrring_so_base"),
    Ferring_so_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ferrring_so_point_buffer_30m"),
    kilen = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/kilen_base"),
    kilen_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/kilen_point_buffer_30m");

    var lake_name = vearn_sande_point
var lake_string = 'vearn_sande_point'

function CalculateSalinity_l5(image){
  var NDVI = image.normalizedDifference(['B7','B4']).rename('Salinity');
  return NDVI;  
}

function CalculateSalinity_l8(image){
  var NDVI = image.normalizedDifference(['B7','B4']).rename('Salinity');
  return NDVI;  
}

function CalculateNDVI_l5(image){
  var NDVI = image.normalizedDifference(['B4','B3']).rename('NDVI');
  return NDVI;  
}

function CalculateNDVI_l8(image){
  var NDVI = image.normalizedDifference(['B5','B4']).rename('NDVI');
  return NDVI;  
}

function median(image){
  var reduced = image.reduceRegions({
  reducer: ee.Reducer.median(), //Gives you the mean, it has other variable like sum min max
  collection: lake_name,
  scale: 30
});
return reduced
}


function CalculateMNDWI_l5(image){
  var MNDWI = image.normalizedDifference(['B2','B5']).rename('MNDWI');
  return MNDWI;  
}

function CalculateMNDWI_l8(image){
  var MNDWI = image.normalizedDifference(['B3','B6']).rename('MNDWI');
  return MNDWI;  
}

function clipping(image){
  var clipped = image.clip(lake_name)
  return clipped
}

var filtered_collection_l5 = Landsat5.filterDate('1984-01-01', '2012-12-31')
.filterBounds(lake_name)
.filterMetadata('CLOUD_COVER', 'less_than', 5)
.sort('system:index', true);

print(filtered_collection_l5.size());


var filtered_collection_l8 = Landsat8.filterDate('2013-04-01', '2020-12-31')
.filterBounds(lake_name)
.filterMetadata('CLOUD_COVER', 'less_than', 5)
.sort('system:index', true);

print(filtered_collection_l8.size());

print(filtered_collection_l5.merge(filtered_collection_l8))
// NDVI Calculation
var NDVI_collection_l5 = filtered_collection_l5.map(CalculateNDVI_l5);
var NDVI_collection_l8 = filtered_collection_l8.map(CalculateNDVI_l8);
var NDVI_collection = NDVI_collection_l5.merge(NDVI_collection_l8).sort('SENSING_TIME', true);
// print('ndvi',NDVI_collection);

Map.addLayer(NDVI_collection,null,'NDVI', 0)
Map.centerObject(NDVI_collection,8)

var MDNWI_collection_l5 = filtered_collection_l5.map(CalculateMNDWI_l5);
var MNDWI_collection_l8 = filtered_collection_l8.map(CalculateMNDWI_l8);
var MNDWI_collection = MDNWI_collection_l5.merge(MNDWI_collection_l8).sort('SENSING_TIME', true);
// print('mndwi',MNDWI_collection);

var Salinity_collection_l5 = filtered_collection_l5.map(CalculateSalinity_l5)
var Salinity_collection_l8 = filtered_collection_l8.map(CalculateSalinity_l8)
var Salinity_collection = Salinity_collection_l5.merge(Salinity_collection_l8).sort('SENSING_TIME', true);
Map.addLayer(Salinity_collection,null,'Salinity', 0)


Map.addLayer(MNDWI_collection,null,'MNDWI', 0)

//var clipped = Salinity_collection.map(clipping)

var area_data_median = Salinity_collection.map(median)

Export.table.toDrive({
  collection: area_data_median.flatten(),
  description: lake_string
 })

var image_number = 10;
var listOfImages_index = Salinity_collection.toList(Salinity_collection.size());
var intended_image_index = listOfImages_index.get(image_number);

print(intended_image_index)

var real = filtered_collection_l5.merge(filtered_collection_l8)
var listOfImages_real = real.toList(real.size());
var intended_image_real = listOfImages_real.get(image_number);

Map.addLayer(ee.Image(intended_image_real))
print('deneme',intended_image_real)



var boxcar = ee.Kernel.square({
  radius: 7, units: 'pixels', normalize: true
});

Map.addLayer(vearn_sande)
Map.addLayer(vearn_sande_point)
Map.centerObject(vearn_sande)