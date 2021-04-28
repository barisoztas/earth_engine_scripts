var imageVisParam = {"opacity":1,"bands":["B4","B3","B2"],"min":295.6808514433328,"max":1214.5643276200283,"gamma":1},
    all_lakes = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/updated_mask"),
    sal = {"opacity":1,"bands":["Salinity"],"palette":["ff0000","0008ff"]},
    ulvedybet_nord = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ulvedybet_nord_base"),
    ulvedybet_nord_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ulvedybet_nord_point_buffer_30m"),
    vearn_sande = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/vearn_sande_base"),
    vearn_sande_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/vearn_sande_point_buffer_30m"),
    keldsnor = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/keldsnor_base"),
    keldsnor_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/keldsnor_point_buffer_30m"),
    ferring_so = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ferrring_so_base"),
    ferring_so_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/ferrring_so_point_buffer_30m"),
    kilen = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/kilen_base"),
    kilen_point = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/kilen_point_buffer_30m"),
    Sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR"),
    salinity_vis = {"opacity":1,"bands":["Salinity"],"palette":["ff0000","ffc800","00ff14","0014ff"]};

var lake_name = ferring_so
var lake_string = 'ferring_so'

function salinity_index(image){
  var salinity = image.normalizedDifference(['B12','B7']).rename('Salinity');
  return salinity
}

function median(image){
  var reduced = image.reduceRegions({
  reducer: ee.Reducer.median(), //Gives you the median, it has other variable like sum min max mean
  collection: lake_name,
  scale: 20
});
return reduced
}

var sentinel2_filtered = Sentinel2.filterBounds(lake_name).filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',5)
var salinity_sentinel2 = sentinel2_filtered.map(salinity_index)

var image_number = 11;
var list_si = salinity_sentinel2.toList(salinity_sentinel2.size());
var letslook = list_si.get(image_number);
Map.addLayer(ee.Image(letslook),salinity_vis,'SI');


var index_median = salinity_sentinel2.map(median)
Export.table.toDrive({
  collection: index_median.flatten(),
  description: lake_string
 })
 
Map.addLayer(lake_name,null,lake_string)
Map.centerObject(lake_name)