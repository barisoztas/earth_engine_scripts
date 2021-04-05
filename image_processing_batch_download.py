import ee
import geetools

ee.Initialize()


Landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR")
bounds = ee.FeatureCollection("users/oztasbaris12/Danish_lakes/Mask_shapefile/danish_mask_for_lakes")
Landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
Landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR")
deneme_export = ee.ImageCollection("COPERNICUS/S2").filterDate("2020-01-01","2020-01-01").first()

def clipping(image):
    image = image.clip(bounds)
    return image

def CalculateNDVI_l5(image):
    NDVI = image.normalizedDifference(['B4','B3']).rename('NDVI')
    return NDVI

def CalculateNDVI_l8(image):
    NDVI = image.normalizedDifference(['B5','B4']).rename('NDVI')
    return NDVI

def CalculateMNDWI_l5(image):
    MNDWI = image.normalizedDifference(['B2','B5']).rename('MNDWI')
    return MNDWI

def CalculateMNDWI_l8(image):
    MNDWI = image.normalizedDifference(['B3','B6']).rename('MNDWI')
    return MNDWI

def CalculateBinary(image):
    MNDWI = image.select('MNDWI')
    NDVI = image.select('NDVI')
    binary = MNDWI.gte(0).And(NDVI.lte(0)).rename('Binary')
    return binary



filtered_collection_l5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR").filterDate("1984-01-01", "2012-12-31").filterBounds(bounds).filterMetadata('CLOUD_COVER', 'less_than', 10).sort('system:time_start', True)


filtered_collection_l8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR").filterDate("2013-04-01", "2020-12-31").filterBounds(bounds).filterMetadata('CLOUD_COVER', 'less_than', 10).sort('system:time_start', True)



filtered_collection_l7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR").filterDate("2011-10-22", "2013-04-01").filterBounds(bounds).filterMetadata('CLOUD_COVER', 'less_than', 10).sort('system:time_start', True)


merged_landsat_collection_l5_l7 = filtered_collection_l5.merge(filtered_collection_l7)


# NDVI Calculation
NDVI_collection_l5 = merged_landsat_collection_l5_l7.map(CalculateNDVI_l5)
NDVI_collection_l8 = filtered_collection_l8.map(CalculateNDVI_l8)
NDVI_collection = NDVI_collection_l5.merge(NDVI_collection_l8)


# MNDWI Calculation
MDNWI_collection_l5 = merged_landsat_collection_l5_l7.map(CalculateMNDWI_l5)
MNDWI_collection_l8 = filtered_collection_l8.map(CalculateMNDWI_l8)
MNDWI_collection = MDNWI_collection_l5.merge(MNDWI_collection_l8)


# Binarization

combined_list = NDVI_collection.combine(MNDWI_collection)
binary = combined_list.map(CalculateBinary)



tasks = geetools.batch.Export.imagecollection.toDrive(binary,'Binary',namePattern='{id}',scale=30,dataType='int',region=bounds,datePattern=None,extra=False,verbose=False, maxPixels=int(1e13))

