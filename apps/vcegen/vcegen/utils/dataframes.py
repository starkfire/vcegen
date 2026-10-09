import pandas as pd

def get_df_column(df: pd.DataFrame, key: str):
    try:
        col = df.columns.get_loc(key)

        if type(col) is int:
            return col

        return None
    except KeyError:
        return None

