"""Refresh downloaded cover pointers from their reviewed source manifest."""
import base64
import json
from pathlib import Path
import urllib.request

folder = Path(__file__).resolve().parents[1] / 'assets' / 'cover'
manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
for book in manifest:
    path = folder / book['file']
    pointer = json.loads(path.read_text(encoding='utf-8'))
    request = urllib.request.Request(book['image_url'], headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read()
    if data.startswith(b'\xff\xd8'):
        mime = 'image/jpeg'
    elif data.startswith(b'\x89PNG'):
        mime = 'image/png'
    else:
        raise ValueError('Not an image: ' + book['title'])
    pointer['url'] = 'data:' + mime + ';base64,' + base64.b64encode(data).decode()
    path.write_text(json.dumps(pointer, indent=2), encoding='utf-8')
    print(book['title'], flush=True)
