# Cách Convert ERD.mmd thành Ảnh

## Phương pháp 1: Online (Đơn giản nhất - Khuyên dùng) ⭐

1. Mở trình duyệt và vào: **https://mermaid.live/**
2. Mở file `ERD.mmd` bằng Notepad/VS Code
3. Copy toàn bộ nội dung
4. Paste vào mermaid.live editor
5. Diagram sẽ tự động render
6. Click **"Actions"** ở góc trên bên phải
7. Chọn **"Download PNG"** hoặc **"Download SVG"** (SVG chất lượng cao hơn)

## Phương pháp 2: Sử dụng Mermaid CLI (Yêu cầu Node.js)

### Cài đặt:
```bash
npm install -g @mermaid-js/mermaid-cli
```

### Convert sang PNG:
```bash
cd photo-critique-be
mmdc -i ERD.mmd -o ERD.png -b white -w 2400
```

### Convert sang SVG (khuyến nghị - chất lượng cao):
```bash
mmdc -i ERD.mmd -o ERD.svg -t dark
```

### Options:
- `-b white` - Background trắng
- `-w 2400` - Độ rộng 2400px
- `-t dark` - Theme tối (cho SVG)
- `-s 2` - Scale factor

## Phương pháp 3: VS Code Extension

1. Cài extension: **"Markdown Preview Mermaid Support"**
2. Mở file `ERD.mmd`
3. Click chuột phải → **"Open Preview"**
4. Chụp màn hình hoặc sử dụng extension export

## Phương pháp 4: GitHub/GitLab (Nếu có repo)

1. Push file `ERD.mmd` lên repository
2. Tạo file `ERD.md` với nội dung:
   ```markdown
   # Database ERD
   
   ```mermaid
   [paste nội dung ERD.mmd ở đây]
   ```
   ```
3. GitHub/GitLab sẽ tự động render trong README

## Phương pháp 5: Python script tự động (Nâng cao)

Tạo file `convert_to_image.py`:
```python
import subprocess
import sys

try:
    subprocess.run(['mmdc', '-i', 'ERD.mmd', '-o', 'ERD.png', '-w', '2400'], check=True)
    print("Success! ERD.png generated")
except FileNotFoundError:
    print("Error: mermaid-cli not found. Install with: npm install -g @mermaid-js/mermaid-cli")
except subprocess.CalledProcessError:
    print("Error converting diagram")
```

Chạy: `python convert_to_image.py`

