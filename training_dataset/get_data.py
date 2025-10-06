import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# --- FILE CONFIGURATION (Updated to match uploaded files) ---

DATA_FOLDER = 'data/2010' 
OUTPUT_CSV = "multi_training/2010_data_multi_target.csv" 
POLLUTION_FILES = ["co.csv", "no2.csv", "ozone.csv", "pm10.csv", "pm25.csv", "so2.csv"]
WEATHER_FILES = ["press.csv", "rh.csv", "temp.csv", "wind.csv"] 
ALL_INPUT_FILES = POLLUTION_FILES + WEATHER_FILES

POLLUTION_FEATURES = ['pm25', 'pm10', 'no2', 'o3', 'co', 'so2']

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
    # Use str.strip() to clean up 'Parameter Name' values for robust filtering
    df['Parameter Name'] = df['Parameter Name'].str.strip()
    
    # Select and rename core columns
    df_cleaned = df[['Date Local', 'Latitude', 'Longitude', 'Parameter Name', 'Arithmetic Mean']].copy()
    
    df_cleaned.rename(columns={
        'Date Local': 'date', 
        'Latitude': 'latitude', 
        'Longitude': 'longitude',
        'Arithmetic Mean': 'value'
    }, inplace=True)
    
    # --- POLLUTION DATA PROCESSING ---
    if 'pm25' in filename:
        df_cleaned['feature'] = 'pm25'
    elif 'pm10' in filename:
        df_cleaned['feature'] = 'pm10'
    elif 'co' in filename:
        df_cleaned['feature'] = 'co'
    elif 'no2' in filename:
        df_cleaned['feature'] = 'no2'
    elif 'ozone' in filename:
        # Tên cột sau pivot là 'o3'
        df_cleaned['feature'] = 'o3'
    elif 'so2' in filename:
        df_cleaned['feature'] = 'so2'
    
    # --- WEATHER DATA PROCESSING ---
    
    elif 'temp.csv' in filename:
        df_cleaned['feature'] = 'temperature_c'
        # Convert Fahrenheit to Celsius: C = (F - 32) / 1.8
        df_cleaned['value'] = (df_cleaned['value'] - 32) / 1.8
        
    elif 'rh.csv' in filename:
        # Filter explicitly for Relative Humidity
        df_cleaned = df_cleaned[df_cleaned['Parameter Name'].str.strip() == 'Relative Humidity'].copy()
        if df_cleaned.empty: return pd.DataFrame() 
        df_cleaned['feature'] = 'humidity_perc'
        
    elif 'press.csv' in filename:
        # Filter explicitly for Barometric pressure
        df_cleaned = df_cleaned[df_cleaned['Parameter Name'].str.strip() == 'Barometric pressure'].copy()
        if df_cleaned.empty: return pd.DataFrame() 
        # Millibars are equivalent to hPa
        df_cleaned['feature'] = 'pressure_hpa'
        
    elif 'wind.csv' in filename:
        # 1. Wind Speed
        df_speed = df_cleaned[df_cleaned['Parameter Name'].str.contains('Wind Speed')].copy()
        df_speed['feature'] = 'wind_speed_ms'
        # Convert Knots to m/s: m/s = Knots * 0.514444
        df_speed['value'] = df_speed['value'] * 0.514444
        
        # 2. Wind Direction
        df_direction = df_cleaned[df_cleaned['Parameter Name'].str.contains('Wind Direction')].copy()
        df_direction['feature'] = 'wind_direction_deg'
        
        return pd.concat([df_speed, df_direction], ignore_index=True)
        
    else: 
        print(f"Warning: File {filename} could not be mapped to a feature.")
        return pd.DataFrame() 

    # Return the standardized DataFrame for non-wind data
    return df_cleaned[['date', 'latitude', 'longitude', 'feature', 'value']]

def load_and_merge_data(folder, input_files):
    """Reads, standardizes, and merges all CSV files."""
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
    
    # Pivot the data to have one row per date/location with columns for each feature
    df_pivot = df_combined.pivot_table(
        index=['date', 'latitude', 'longitude'], 
        columns='feature', 
        values='value', 
        aggfunc='mean' 
    ).reset_index()
    
    df_pivot.columns.name = None
    
    df_pivot['date'] = pd.to_datetime(df_pivot['date'])

    print(f"\nMerged and Pivoted into {len(df_pivot)} unique date/location rows of data.")
    return df_pivot

def feature_engineering(df):
    """Creates Multi-Targets (target variables for all pollutants) and Lagged Features."""
    if df.empty:
        return df

    # Sort data for correct time-series operations (lagging)
    df = df.sort_values(by=['latitude', 'longitude', 'date'])
    
    # --- TẠO MULTI-TARGET VÀ LAG FEATURES CHO TẤT CẢ CÁC CHẤT Ô NHIỄM ---
    lag_cols = []
    for feature in POLLUTION_FEATURES:
        # 1. Target variable (Current day's value)
        target_col = f'target_{feature}'
        # Đảm bảo cột tồn tại trước khi tạo target
        if feature in df.columns:
            df[target_col] = df[feature] 
            
            # 2. Lagged feature (Previous day's value)
            lag_col = f'{feature}'
            df[lag_col] = df.groupby(['latitude', 'longitude'])[feature].shift(1)
            lag_cols.append(lag_col)
        else:
            print(f"Warning: Feature '{feature}' not found in merged data. Skipping target/lag creation for it.")


    # --- TẠO TIME-BASED FEATURES ---
    df['day_of_year'] = df['date'].dt.dayofyear
    df['day_of_week'] = df['date'].dt.dayofweek # Monday=0, Sunday=6
    
    # Remove rows where lag features are missing (first day of each site)
    # Chúng ta chỉ cần loại bỏ những hàng có bất kỳ cột lag nào bị thiếu
    df = df.dropna(subset=lag_cols)
    
    return df

def integrate_external_data(df):
    """
    Integrates Satellite data (TEMPO) - Mocked.
    """
    if df.empty:
        return df

    tempo_data = []
    
    for _, row in df.iterrows():
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
    
    # Ensure the output directory exists
    output_dir = os.path.dirname(OUTPUT_CSV)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        
    print(f"--- STARTING DATA AGGREGATION FROM FOLDER: {DATA_FOLDER} ---")
    
    df_training = load_and_merge_data(DATA_FOLDER, ALL_INPUT_FILES)
    
    if df_training.empty:
        print("Training dataset creation failed. Please check the input files and folder path.")
    else:
        df_training = feature_engineering(df_training)
        df_training = integrate_external_data(df_training)

        # CẬP NHẬT FINAL_COLUMNS để bao gồm tất cả các cột mục tiêu và lag mới
        TARGET_LAG_COLUMNS = []
        for feature in POLLUTION_FEATURES:
            TARGET_LAG_COLUMNS.append(f'target_{feature}')
            TARGET_LAG_COLUMNS.append(f'{feature}')
            
        FINAL_COLUMNS = [
            'date', 'latitude', 'longitude', 
            *TARGET_LAG_COLUMNS,
            # Các features hiện tại (không phải target/lag)
            # 'co', 'so2', 'o3', 'pm25', 'pm10', 'no2', 
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
