import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

DATA_FOLDER = 'data/2024' 
POLLUTION_FILES = ["co.csv", "no2.csv", "ozone.csv", "pm10.csv", "pm25.csv", "so2.csv"]
WEATHER_FILES = ["press.csv", "rh.csv", "temp.csv", "wind.csv"]
ALL_INPUT_FILES = POLLUTION_FILES + WEATHER_FILES
OUTPUT_CSV = "2024_data.csv" 

# --- MÔ PHỎNG DỮ LIỆU VỆ TINH TEMPO ---
def mock_fetch_tempo_data(date, latitude, longitude):
    """Mocks fetching TEMPO satellite data for NO2 and HCHO."""
    seed_value = int(datetime.strptime(date, '%Y-%m-%d').timestamp())
    np.random.seed(seed_value)
    
    return {
        'tempo_no2_col': np.random.uniform(0.0001, 0.0005), 
        'tempo_hcho_col': np.random.uniform(0.00005, 0.00015)
    }

def process_and_convert(df, filename):
    """
    Standardizes column names, filters, and performs unit conversion for both pollution and weather data.
    """
    df_cleaned = df[['Date Local', 'Latitude', 'Longitude', 'Parameter Name', 'Arithmetic Mean']].copy()
    
    df_cleaned.rename(columns={
        'Date Local': 'date', 
        'Latitude': 'latitude', 
        'Longitude': 'longitude',
        'Arithmetic Mean': 'value'
    }, inplace=True)
    
    if 'pm25' in filename:
        df_cleaned['feature'] = 'pm25'
    elif 'pm10' in filename:
        df_cleaned['feature'] = 'pm10'
    elif 'co' in filename:
        df_cleaned['feature'] = 'co'
    elif 'no2' in filename:
        df_cleaned['feature'] = 'no2'
    elif 'ozone' in filename:
        df_cleaned['feature'] = 'o3'
    elif 'so2' in filename:
        df_cleaned['feature'] = 'so2'
    
    elif filename == 'temp.csv':
        df_cleaned['feature'] = 'temperature_c'
        df_cleaned['value'] = (df_cleaned['value'] - 32) / 1.8
    elif filename == 'RH_Dewpoin.csv':
        df_cleaned['feature'] = 'humidity_perc'
    elif filename == 'barometric_ressure.csv':
        df_cleaned['feature'] = 'pressure_hpa'
    elif filename == 'wind.csv':

        # 1. Wind Speed
        df_speed = df_cleaned[df_cleaned['Parameter Name'].str.contains('Wind Speed')].copy()
        df_speed['feature'] = 'wind_speed_ms'
        # Convert Knots to m/s: m/s = Knots * 0.514444
        df_speed['value'] = df_speed['value'] * 0.514444
        
        # 2. Wind Direction
        df_direction = df_cleaned[df_cleaned['Parameter Name'].str.contains('Wind Direction')].copy()
        df_direction['feature'] = 'wind_direction_deg'
        
        return pd.concat([df_speed, df_direction], ignore_index=True)
        
    else: return pd.DataFrame() 

    return df_cleaned[['date', 'latitude', 'longitude', 'feature', 'value']]

def load_and_merge_data(folder, input_files):
    """Reads, standardizes, and merges 10 CSV files (pollution + weather)."""
    all_data = []
    
    for file in input_files:
        file_path = os.path.join(folder, file) 
        try:
            if not os.path.exists(file_path):
                 print(f"Skipping file {file}: Not found at {file_path}")
                 continue
                 
            df = pd.read_csv(file_path)
            
            df_processed = process_and_convert(df, file)
            
            if not df_processed.empty:
                all_data.append(df_processed)
                print(f"Processed {file} - {len(df_processed)} rows.")


        except Exception as e:
            print(f"Error reading or processing file {file}: {e}")
            continue

    if not all_data:
        print("No data loaded successfully. Please check your data folder and file names.")
        return pd.DataFrame()

    df_combined = pd.concat(all_data, ignore_index=True)
    
    df_pivot = df_combined.pivot_table(
        index=['date', 'latitude', 'longitude'], 
        columns='feature', 
        values='value', 
        aggfunc='mean' 
    ).reset_index()
    
    df_pivot.columns.name = None
    
    df_pivot['date'] = pd.to_datetime(df_pivot['date'])

    print(f"\nMerged and Pivoted into {len(df_pivot)} rows of data.")
    return df_pivot

def feature_engineering(df):
    """Creates Lagged Features and time-based features."""
    if df.empty:
        return df

    df = df.sort_values(by=['latitude', 'longitude', 'date'])
    
    df['target_pm25'] = df['pm25'] 
    df['pm25_lag_1d'] = df.groupby(['latitude', 'longitude'])['target_pm25'].shift(1)

    df['pm10_lag_1d'] = df.groupby(['latitude', 'longitude'])['pm10'].shift(1)
    df['no2_lag_1d'] = df.groupby(['latitude', 'longitude'])['no2'].shift(1)
    
    df['day_of_year'] = df['date'].dt.dayofyear
    df['day_of_week'] = df['date'].dt.dayofweek
    
    df = df.dropna(subset=['pm25_lag_1d'])
    
    return df

def integrate_external_data(df):
    """
    Integrates Satellite data (TEMPO) - Mocked.
    """
    if df.empty:
        return df

    tempo_data = []
    
    for index, row in df.iterrows():
        date_str = row['date'].strftime('%Y-%m-%d')
        lat = row['latitude']
        lon = row['longitude']
        
        # Mock fetching TEMPO
        tempo_features = mock_fetch_tempo_data(date_str, lat, lon)
        tempo_data.append(tempo_features)
    
    # Add the Satellite columns to the DataFrame
    df_tempo = pd.DataFrame(tempo_data)
    
    df = pd.concat([df.reset_index(drop=True), df_tempo], axis=1)

    print("\nIntegrated Satellite features (Mocked).")
    return df

if __name__ == "__main__":
    
    print(f"--- STARTING DATA AGGREGATION FROM FOLDER: {DATA_FOLDER} ---")
    
    df_training = load_and_merge_data(DATA_FOLDER, ALL_INPUT_FILES)
    
    if df_training.empty:
        print("Training dataset creation failed. Please check the input files and folder path.")
    else:
        df_training = feature_engineering(df_training)
        df_training = integrate_external_data(df_training)

        FINAL_COLUMNS = [
            'date', 'latitude', 'longitude', 
            'target_pm25', 
            'pm25_lag_1d', 'pm10_lag_1d', 'no2_lag_1d',
            'co', 'so2', 'o3', 
            'temperature_c', 'wind_speed_ms', 'wind_direction_deg', 'humidity_perc', 'pressure_hpa', 
            'tempo_no2_col', 'tempo_hcho_col',
            'day_of_year', 'day_of_week'
        ]
        
        final_df = df_training[[col for col in FINAL_COLUMNS if col in df_training.columns]]
        final_df = final_df.dropna().reset_index(drop=True)
        
        final_df.to_csv(OUTPUT_CSV, index=False)
        
        print(f"\n--- FINAL TRAINING DATASET COMPLETED ---")
        print(f"Total rows ready for training: {len(final_df)}")
        print(f"Saved to: {OUTPUT_CSV}")
        print("\nFirst rows of the training dataset:")
        print(final_df.head())
