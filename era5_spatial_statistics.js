


var u_component_of_wind_10m = {"opacity":1,"bands":["u_component_of_wind_10m"],"min":-24.042608399961964,"max":11.208942413330078,"palette":["000080","0000d9","4000ff","8000ff","0080ff","00ffff","00ff80","80ff00","daff00","ffff00","fff500","ffda00","ffb000","ffa400","ff4f00","ff2500","ff0a00","ff00ff"]},
    geometry = /* color: #d63000 */ee.Geometry.MultiPoint(),
    ulvedybet_nord_base = ee.FeatureCollection("users/oztasbaris12/danish_all_lakes/ulvedybet_nord_base"),
    temperature_2m = {"bands":["temperature_2m"],"min":250,"max":320,"palette":["#000080","#0000D9","#4000FF","#8000FF","#0080FF","#00FFFF","#00FF80","#80FF00","#DAFF00","#FFFF00","#FFF500","#FFDA00","#FFB000","#FFA400","#FF4F00","#FF2500","#FF0A00","#FF00FF"]},
    skin_temperature = {"bands":["skin_temperature"],"min":250,"max":320,"palette":["#000080","#0000D9","#4000FF","#8000FF","#0080FF","#00FFFF","#00FF80","#80FF00","#DAFF00","#FFFF00","#FFF500","#FFDA00","#FFB000","#FFA400","#FF4F00","#FF2500","#FF0A00","#FF00FF"]},
    agger_tange = ee.FeatureCollection("users/oztasbaris12/danish_all_lakes/agger_tange_so_base");

var dataset = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
                .filter(ee.Filter.date('2013-04-01', '2020-01-01'))
                .filterMetadata("hour","equals",10);


function clipping(image){
  var clipped = image.clip(agger_tange);
  return clipped
}



Map.centerObject(agger_tange);
Map.addLayer(agger_tange);
Map.addLayer(dataset.first().select("temperature_2m"), temperature_2m, "Air temperature [K] at 2m height",0);
Map.addLayer(dataset.select("skin_temperature"), skin_temperature, "Skin temperature [K]",0);
Map.addLayer(dataset.select("u_component_of_wind_10m"), u_component_of_wind_10m, "u_component_of_wind_10m",0);

var deneme = dataset.first().select(["temperature_2m","skin_temperature"
,"u_component_of_wind_10m","v_component_of_wind_10m"]);

function mean(image){
  var clipped = image.select("temperature_2m","skin_temperature"
,"u_component_of_wind_10m","v_component_of_wind_10m");
  var dict = clipped.reduceRegions({
    reducer:ee.Reducer.mean(),
    collection:agger_tange,
  })
  return dict
}

var dict = dataset.map(mean)
print(dict.flatten())
Export.table.toDrive(dict.flatten())
