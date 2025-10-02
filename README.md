<div align="center">
  <h1>Air Force</h1>
  <h3>Air Quality Tracking & Forecasting App</h3>
  <h4>Participate in</h4>
</div>

<div align="center">
  <img src="https://assets.spaceappschallenge.org/media/images/Colorway2-Color_White3x.width-440.jpegquality-60.png?raw=true" height="25%" alt="NASA Space Apps" />
</div>
<hr>
<div align="center" style="line-height: 1.4;">
    <a href="#"><img alt="Field"
    src="https://img.shields.io/badge/Earth%20Observation-forestgreen?style=for-the-badge"/></a>
    <a href="#"><img alt="Field"
    src="https://img.shields.io/badge/Air%20Quality%20Tracking-blue?style=for-the-badge"/></a>
    <a href="#"><img alt="Field"
    src="https://img.shields.io/badge/Air%20Quality%20Forecasting-red?style=for-the-badge"/></a>
    <br/>
    <a href="#"><img alt="AI Skill"
    src="https://img.shields.io/badge/AI%20Engineering-orange?style=for-the-badge"/></a>
    <a href="#"><img alt="Web Skill"
    src="https://img.shields.io/badge/Applications%20Development-blueviolet?style=for-the-badge"/></a>
    <a href="#"><img alt="Cloud Skill"
    src="https://img.shields.io/badge/Cloud%20Computing-skyblue?style=for-the-badge"/></a>
    <br/>
    <a href="https://github.com/DanielNguyen-05/AirForce/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/DanielNguyen-05/AirForce?style=for-the-badge&logo=github"/></a>
</div>

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
* [TEMPO satellite data](https://asdc.larc.nasa.gov/)
* [EPA AirNow ground station data](https://docs.airnowapi.org/)
* [NOAA weather forecasts](https://www.ncei.noaa.gov/access)
* [WHO Ambient Air quality database](https://www.who.int/data/gho/data/themes/air-pollution/who-air-quality-database)
  
## Machine Learning Models
* Baseline: ARIMA, Linear Regression.
* Deep Learning: LSTM, TCN, Transformer-based time-series models.
* Ensemble:
* Evaluation Metrics: RMSE, MAE, R-squared