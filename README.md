# Mathare-Slums
Informal Settlements Detection using Random Forest Classifier
Overview
This project focuses on the detection and mapping of informal settlements using satellite imagery and machine learning techniques in Google Earth Engine (GEE). 
Informal settlements, often characterized by inadequate housing, limited access to basic amenities, and unplanned urban growth, present critical challenges for urban planners and policymakers. 
Utilizing available satellite imagery archives and machine learning capabilities, this project aims to identify these settlements, providing valuable insights into urban development patterns.

Methodology
Data Collection: The project utilizes multi-spectral satellite data, including planetscope, capturing various urban features.
Indices: indices such as Building Anomalities index, Gray Level Co-occurrence Matrix (GLCM) and Composite slum spectral index (CSSI) are utilized
Training the Model: Employed a Random Forest classifier to learn patterns from labeled samples representing informal settlements and other urban features.
Classification and Mapping: Applied the trained model to classify pixels and create maps highlighting areas potentially classified as informal settlements.
Project Components
Satellite Imagery Processing: Preprocessing and extraction of meaningful features from satellite data.
Machine Learning Model Development: Training a Random Forest classifier using labeled samples.
Classification and Visualization: Generating maps depicting classified areas representing informal settlements.
Export and Analysis: Exporting classified results and conducting accuracy assessments.
Output
The project generates maps outlining potential informal settlements, aiding urban planners, researchers, and policymakers in understanding urban growth dynamics and addressing socio-economic challenges.

