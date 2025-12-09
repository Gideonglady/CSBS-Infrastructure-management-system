import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('CSBS_systems_organized proper.xlsx')

# Display basic info
print("=" * 80)
print("EXCEL FILE STRUCTURE")
print("=" * 80)
print(f"\nTotal rows: {len(df)}")
print(f"\nColumns: {df.columns.tolist()}")
print("\n" + "=" * 80)
print("FIRST 5 ROWS")
print("=" * 80)
print(df.head(5).to_string())

# Get unique lab names
print("\n" + "=" * 80)
print("UNIQUE LAB NAMES")
print("=" * 80)
if 'Lab Name' in df.columns:
    unique_labs = df['Lab Name'].unique()
    for i, lab in enumerate(unique_labs, 1):
        count = len(df[df['Lab Name'] == lab])
        print(f"{i}. {lab} ({count} systems)")

# Sample data structure
print("\n" + "=" * 80)
print("SAMPLE ROW (as JSON)")
print("=" * 80)
if len(df) > 0:
    sample = df.iloc[0].to_dict()
    print(json.dumps(sample, indent=2, default=str))
