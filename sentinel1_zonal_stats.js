var sentinel1 = ee.ImageCollection("COPERNICUS/S1_GRD"),
    imageVisParam = {"opacity":1,"bands":["VV"],"min":-21.902648354673964,"max":-4.170072287849244,"gamma":1},
    imageVisParam2 = {"opacity":1,"bands":["VH"],"min":-30.94576864306422,"max":-9.521320952616936,"gamma":1},
    area_of_interest = ee.FeatureCollection("users/oztasbaris12/Sentinel1/soil_moisture/CRNParea"),
    cosmic = ee.FeatureCollection("users/oztasbaris12/Sentinel1/soil_moisture/cosmickmz-point"),
    eddy = ee.FeatureCollection("users/oztasbaris12/Sentinel1/soil_moisture/eddykmz-point"),
    area_of_interest_2 = ee.FeatureCollection("users/oztasbaris12/Sentinel1/soil_moisture/CRNParea_100");



var sentinel1_filtered = sentinel1.filterDate("2018-03-01", "2019-07-01").filterBounds(eddy)
print(sentinel1_filtered)
print(area_of_interest)
var pts = ee.FeatureCollection(ee.List([ee.Feature(eddy.geometry().buffer(10)),ee.Feature(cosmic.geometry().buffer(10))]))
print(pts)


// Empty Collection to fill
var ft = ee.FeatureCollection(ee.List([]))

var fill = function(img, ini) {
  // type cast
  var inift = ee.FeatureCollection(ini)

  // gets the values for the points in the current img
  var ft2 = img.reduceRegions(pts, ee.Reducer.first(),30)

  // gets the date of the img
  var date = img.date().format()

  // writes the date in each feature
  var ft3 = ft2.map(function(f){return f.set("date", date)})

  // merges the FeatureCollections
  return inift.merge(ft3)
}

// Iterates over the ImageCollection
var newft = ee.FeatureCollection(sentinel1_filtered.iterate(fill, ft))

print(newft)

Export.table.toDrive({
  collection: newft,
  description: 'Point_data_new_correct',
 })

Map.addLayer(eddy)
Map.addLayer(cosmic)

Map.addLayer(area_of_interest)
Map.addLayer(pts)
Map.centerObject(area_of_interest,20)


function mean(image){
  var reduced = image.reduceRegions({
  reducer: ee.Reducer.mean(), //Gives you the mean, it has other variable like sum min max
  collection: area_of_interest,
  scale: 10
});
return reduced
}

function clipping(image){
  var clipped = image.clip(area_of_interest)
  return clipped
}
sentinel1_filtered = sentinel1_filtered.map(clipping)

Map.addLayer(sentinel1_filtered.first().select('VV'), imageVisParam,0)

var area_data = sentinel1_filtered.map(mean)
print(area_data.flatten())

Export.table.toDrive({
  collection: area_data.flatten(),
  description: 'Area_data',
  scale: 10 
 })
