import urllib.request
import re
import os

fonts_dir = r"D:\المشاريع\art\src\app\fonts"
os.makedirs(fonts_dir, exist_ok=True)

# Google Fonts CSS URL for Cairo, Amiri, and Tajawal
url = "https://fonts.googleapis.com/css2?family=Cairo&family=Amiri&family=Tajawal"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        css_content = response.read().decode('utf-8')
    
    # We will search for @font-face blocks and match the font-family and woff2 URL
    # Specifically looking for the 'arabic' subset blocks
    blocks = re.split(r'\}', css_content)
    
    downloaded = {}
    for block in blocks:
        if 'font-family:' in block and 'url(' in block:
            family_match = re.search(r"font-family:\s*['\"]([^'\"]+)['\"]", block)
            url_match = re.search(r"url\((https://[^\)]+\.woff2)\)", block)
            
            if family_match and url_match:
                family = family_match.group(1)
                font_url = url_match.group(1)
                
                # Check if it's Arabic subset (usually comments contain /* arabic */)
                # Or just take the first match for Amiri, Cairo, Tajawal
                if family in ["Cairo", "Amiri", "Tajawal"] and family not in downloaded:
                    downloaded[family] = font_url
                    
    for family, font_url in downloaded.items():
        dest_filename = f"{family}-Regular.woff2"
        dest_path = os.path.join(fonts_dir, dest_filename)
        print(f"Downloading {family} from {font_url} to {dest_path}...")
        
        # Download the file
        req_dl = urllib.request.Request(font_url, headers=headers)
        with urllib.request.urlopen(req_dl) as f_in, open(dest_path, 'wb') as f_out:
            f_out.write(f_in.read())
        print(f"Successfully downloaded {family} font.")
        
except Exception as e:
    print(f"Error downloading fonts: {e}")
