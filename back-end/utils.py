# utils.py

def convert_to_float(value):
    try:
        return float(value.replace(',', '.'))
    except ValueError:
        return None
