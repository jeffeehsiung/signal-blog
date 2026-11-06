from pathlib import Path
from playwright.sync_api import sync_playwright

folder = Path(__file__).parent
scenes = sorted(folder.glob('post*.html'))
assert scenes, "No post*.html files found"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(
        viewport={'width': 1080, 'height': 1350},
        device_scale_factor=2,  # Renders at 2160x2700 for crisp text
    )
    for scene in scenes:
        page.goto(f'file://{scene.resolve()}')
        page.wait_for_timeout(1000)  # Wait for fonts to load
        out = scene.with_suffix('.png')
        page.screenshot(path=str(out), full_page=False)
        print(f'✓ {out.name}')
    browser.close()