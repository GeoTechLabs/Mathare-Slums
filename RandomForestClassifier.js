// Load the datasets
var buildings = ee.Image('Path_to_/buildings_informal_settlement_proj');
var slum_index = ee.Image('Path_to_/CSI_informal_settlement_proj');
var glcm = ee.Image('Path_to_/GLCM_informal_proj');
var building_anomalities = ee.Image('Path_to_/BAI_informal_settlement_proj');
var markerPoints = ee.FeatureCollection('Path_to_/informal_training_points_shapefile');
// define roi
var roi = ee.FeatureCollection('Path_to_/AOI_informal_settlements')

// Create a stack of the input bands as features
var features = ee.Image.cat(buildings, ndvi, glcm, iron_cover, slum_index, building_anomalities);

// Load the training points..to be later converted to polygons
var informalPoints = ee.FeatureCollection('Path_to_/informal_training_points_shapefile');
// Define a mapping for class labels (string to numeric)
var classMapping = {
  'informal_settlements': 1,  // Assign a numeric label for 'informal_settlements'
  'water': 2,           // Assign a numeric label for another class, if needed
  // Add other classes and their respective numeric labels as needed
};

// Define a buffer distance (adjust as needed)
var bufferDistance = 50; // in meters

// Convert marker points to polygons by creating a buffer around points
var polygonsFromPoints = markerPoints.map(function(point) {
  return point.buffer(bufferDistance);
});

// Combine multiple polygons into a single FeatureCollection
var polygons = ee.FeatureCollection(polygonsFromPoints);

// Set class label for informal settlements points
var classLabel = 'class'; // Assuming the class label property is named 'class'
polygons = polygons.map(function(feature) {
 // Check if the class label exists in the mapping before assigning a numeric label
  var numericLabel = ee.Number(ee.Algorithms.If(classMapping.hasOwnProperty(classLabel), classMapping[classLabel], 0));
 
 return feature.set('numeric_class', numericLabel);
});

// Sample the features at the training points
var samples = features.sampleRegions({
  collection: polygons,
  properties: ['class'], // Property with the class label
  scale: 10, // Adjust the scale according to your dataset
});

// Train the Random Forest classifier
var classifier = ee.Classifier.smileRandomForest(60) // Adjust the number of trees
  .train({
    features: samples,
    classProperty: 'class', // Property with the class label in the training data
    inputProperties: features.bandNames()
  });
var classifiedImage = ee.Image('Path_to_/classified_image_informal_settlements')
// Use the class label for informal settlements from the class mapping
var informalClass = classMapping['informal_settlements'];

// Create a binary image of informal settlements (where informal settlements are classified)
var informalSettlements = classifiedImage.eq(informalClass);
// Clip the informal settlements image to your ROI image
var clippedSettlements = informalSettlements.clip(roi.geometry());

// Convert pixels representing informal settlements to vector polygons
var informalPolygons = clippedSettlements.reduceToVectors({
  geometryType: 'polygon',
  scale: 30, // Adjust according to your image resolution
  labelProperty: 'class', // Property to assign the class value to the polygons
  geometry:roi.geometry().buffer(1),// Adding an error margin by buffering the geometry and /* specify region of interest or whole image */ // Replace with the region or image to analyze
  eightConnected: false, // Adjust as needed
  bestEffort: true // Adjust as needed
});

// Calculate area of informal settlement polygons
var areaInformalSettlements = informalPolygons.geometry().area({ maxError: 1 });

// Print the total area of informal settlements
print('Total Area of Classified Informal Settlements:', areaInformalSettlements); // Area in square meters


// Classify the image
var classifiedImage = features.classify(classifier);
// display slum
Map.addLayer(slum_index, {bands:['b1'],min:-0.1, max:0.2}, 'slums')

// display glcm
Map.addLayer(glcm, {bands:['b1','b2','b3'],min:1, max:49}, 'glcm')


// Display the classified image
Map.addLayer(classifiedImage, {min: 0, max: 4, palette: ['red', 'brown', 'blue', 'green']},'classified informal settlements');

// Visualize the generated polygons on the map
Map.addLayer(polygons, {}, 'training points to polygons');
Map.addLayer(informalPolygons, {color: 'purple'}, 'Informal Settlements Polygons');
// accuracy assessment
var test = classifiedImage.sampleRegions({
  collection: polygons,
  properties: ['class'],
  tileScale: 16,
  scale: 10,
});

var testConfusionMatrix = test.errorMatrix('class', 'classification');
print('Confusion Matrix', testConfusionMatrix);
print('Test Accuracy', testConfusionMatrix.accuracy());

// Calculate Producer's Accuracy, Consumer's Accuracy, and Kappa coefficient
var producersAccuracy = testConfusionMatrix.producersAccuracy();
var consumersAccuracy = testConfusionMatrix.consumersAccuracy();
var kappa = testConfusionMatrix.kappa();

// Print the assessment metrics
print('Producer\'s Accuracy:', producersAccuracy);
print('Consumer\'s Accuracy:', consumersAccuracy);
print('Kappa Coefficient:', kappa);


// accuracy debugging
// Visualize the sampled points (classified and ground truth) on the map for inspection
// Map.addLayer(test, { color: 'yellow' }, 'Sampled Classified Points');
// Map.addLayer(informalPoints, { color: 'blue' }, 'Sampled Ground Truth Points');

// Define export parameters
var exportOptions = {
  image: informalPolygons,
  description: 'informal_image_export', // Specify a description for the exported file
  folder: 'GEE_exports', // Specify the folder in your Google Drive to save the file
  // region: regionOfInterest, // Optional: define a specific region for export
  scale: 30, // Adjust according to the desired resolution
};

// Export the image to Google Drive
Export.image.toDrive(exportOptions);