# 🌍 AirForce – Air Quality Tracking & Forecasting App

## Overview
This web application was developed as part of the **NASA Space Apps Challenge 2025** with the topic **From EarthData to Action: Cloud Computing with Earth Observation Data for Predicting Cleaner, Safer Skies**.

## Objective
* Use **TEMPO** *(Tropospheric Emissions: Monitoring of Pollution)* satellite data combined with ground-based air quality measurements and weather data to forecast air quality.
* Alert users to bad air conditions (high AQI).
* Support communities and health agencies in making health-protective decisions.
* Use cloud computing to scale from local devices to global cloud systems.

## Features
* **Real-time data ingestion**: automatically get data from TEMPO, NOAA weather, ground stations.
* **Machine Learning forecasting**: use spatio-temporal models (LSTM, Temporal Convolutional Networks, Ensemble models) to predict AQI.
* **Uncertainty quantification**: provide confidence intervals for forecasts.
* **Web dashboard**: interactive map showing air quality over time & space.
* **Notification system**: send alerts when AQI exceeds WHO/EPA thresholds.
* **Cloud-native scaling**: run on Kubernetes/Serverless functions to accommodate thousands of users.

## Training Dataset
* TEMPO satellite data ($NO_2$, $O_3$, $PM_{2-5}$).
* EPA AirNow ground station data.
* NOAA weather forecasts (wind, humidity, temperature).
* Preprocessing pipeline xử lý missing data, normalization, time alignment.
 
## Machine Learning Models
* Baseline: ARIMA, Linear Regression.
* Deep Learning: LSTM, TCN, Transformer-based time-series models.
* Ensemble:
* Evaluation Metrics: RMSE, MAE, R-squared