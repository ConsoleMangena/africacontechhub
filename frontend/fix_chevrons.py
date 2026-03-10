import os
import re

mapping = {
  "chevron_down": "keyboard_arrow_down",
  "chevron_up": "keyboard_arrow_up",
}

def fix_icons(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                original = content
                
                for old, new in mapping.items():
                    content = re.sub(r'name=["\']' + re.escape(old) + r'["\']', f'name="{new}"', content)
                    content = re.sub(r'icon:\s*[\'"]' + re.escape(old) + r'[\'"]', f"icon: '{new}'", content)
                    content = re.sub(r'logo:\s*[\'"]' + re.escape(old) + r'[\'"]', f"logo: '{new}'", content)

                if content != original:
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

fix_icons('/home/project3/Documents/SQB/africacontechhub/frontend/src')
