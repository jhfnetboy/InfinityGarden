cd /Users/jason/Dev/crypto-projects/garden

python3 << 'EOF'
import zipfile
from pathlib import Path

dist_dir = Path('dist')
zip_path = Path('XGarden.zip')

# 删除旧的 zip
if zip_path.exists():
    zip_path.unlink()

# 创建新 zip
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in dist_dir.rglob('*'):
        if root.is_file() and not root.name.startswith('.'):
            arcname = root.relative_to(dist_dir)
            zipf.write(root, arcname)
            
print('✅ Created XGarden.zip')
