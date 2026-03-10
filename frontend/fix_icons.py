import os
import re

mapping = {
  "search_icon": "search",
  "panel_left_icon": "left_panel_open",
  "plus": "add",
  "x_icon": "close",
  "chevron_up_icon": "keyboard_arrow_up",
  "check_icon": "check",
  "circle_icon": "radio_button_unchecked",
  "minus_icon": "remove",
  "chevron_right_icon": "keyboard_arrow_right",
  "chevron_left_icon": "keyboard_arrow_left",
  "chevron_down_icon": "keyboard_arrow_down",
  "loader2": "progress_activity",
  "briefcase": "work",
  "users": "group",
  "trending_up": "trending_up",
  "file_text": "description",
  "dollar_sign": "attach_money",
  "bar_chart3": "bar_chart",
  "activity": "monitoring",
  "shield": "security",
  "lock": "lock",
  "credit_card": "credit_card",
  "trash2": "delete",
  "edit2": "edit",
  "shield_check": "gpp_good",
  "clock": "schedule",
  "check_circle2": "check_circle",
  "log_in": "login",
  "log_out": "logout",
  "mail": "mail",
  "arrow_right": "arrow_forward",
  "sun": "light_mode",
  "moon": "dark_mode",
  "eye_off": "visibility_off",
  "eye": "visibility",
  "circle_question_mark": "help",
  "menu": "menu",
  "chevrons_up_down": "unfold_more",
  "bell": "notifications",
  "badge_check": "verified",
  "x": "close",
  "chevron_right": "keyboard_arrow_right",
  "telescope": "biotech",
  "wrench": "build",
  "user": "person",
  "send": "send",
  "rotate_cw": "refresh",
  "printer": "print",
  "history": "history",
  "file_spreadsheet": "receipt_long",
  "download": "download",
  "brain_circuit": "psychology",
  "globe": "public",
  "hard_hat": "engineering",
  "clipboard_list": "assignment",
  "layout_dashboard": "dashboard",
  "folder_open": "folder_open",
  "map_pin": "location_on"
}

def fix_icons(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                original = content
                
                # Replace name="x" and icon="x" and icon: 'x'
                for old, new in mapping.items():
                    # <Icon name="old"
                    content = re.sub(r'name=["\']' + re.escape(old) + r'["\']', f'name="{new}"', content)
                    # icon: 'old' -> icon: 'new'
                    content = re.sub(r'icon:\s*[\'"]' + re.escape(old) + r'[\'"]', f"icon: '{new}'", content)
                    # logo: 'old' -> logo: 'new'
                    content = re.sub(r'logo:\s*[\'"]' + re.escape(old) + r'[\'"]', f"logo: '{new}'", content)

                if content != original:
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

fix_icons('/home/project3/Documents/SQB/africacontechhub/frontend/src')
