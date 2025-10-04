import pandas as pd
import glob

csv_files = glob.glob("training/*_data.csv")

df_combined = pd.concat((pd.read_csv(file) for file in csv_files), ignore_index=True)

df_combined.to_csv("data.csv", index=False)

print(f"✅ Combined {len(csv_files)} files into data.csv")
