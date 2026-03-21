import pandas as pd
import warnings
warnings.filterwarnings('ignore')

xls = pd.ExcelFile('../src/ED Law School.xlsx')
out = []

for sheet in xls.sheet_names:
    df = pd.read_excel(xls, sheet)
    out.append(f"## Sheet: {sheet}")
    
    # Try to find exactly where headers begin by scanning for non-empty rows with > 3 non-empty cells
    header_idx = 0
    for idx, row in df.iterrows():
        if row.notna().sum() > 3:
            header_idx = idx
            break
            
    df_clean = pd.read_excel(xls, sheet, header=header_idx)
    cols = [str(c).replace('\n', ' ').strip() for c in df_clean.columns if not str(c).startswith('Unnamed')]
    
    out.append(f"**Columns:** {', '.join(cols)}")
    out.append("```csv")
    out.append(", ".join(cols))
    
    for _, row in df_clean.head(3).iterrows():
        line = []
        for c in df_clean.columns:
            if not str(c).startswith('Unnamed'):
                val = str(row[c]).replace('\n', ' ').strip()
                line.append(val if val != 'nan' else '')
        out.append(", ".join(line))
    out.append("```\n")

with open("/tmp/excel_structure.md", "w") as f:
    f.write("\n".join(out))
print("Done writing to /tmp/excel_structure.md")
