"""Render all scene*.html files to 1920×1080 PNGs."""
from pathlib import Path
from playwright.sync_api import sync_playwright

folder = Path(__file__).parent
scenes = sorted(folder.glob('scene*.html'))
assert scenes, "No scene*.html files found"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(
        viewport={'width': 1920, 'height': 1080},
        device_scale_factor=2,           # renders at 3840×2160, downsamples to 1080p — sharper text
    )
    for scene in scenes:
        page.goto(f'file://{scene.resolve()}')
        page.wait_for_timeout(1200)      # let DM Mono + Manrope load
        out = scene.with_suffix('.png')
        page.screenshot(path=str(out), full_page=False)
        print(f'✓ {out.name}')
    browser.close()