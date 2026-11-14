# iOS app images for the landing page

The app section on the landing page (`#app`, `components/app-showcase.tsx`) shows these screens in a phone that cycles through them, with the screens either side peeking out behind it. They play in the order of `iosApp.screenshots` in `lib/site.ts`:

| File | Shows |
| --- | --- |
| `course.png` | The course, week one ticked off |
| `lesson.png` | A lesson's reading |
| `practice.png` | A gap exercise with snippets |
| `passed.png` | The same exercise after a pass (dark mode) |
| `progress.png` | Progress |
| `articles.png` | The articles |

Each is a raw iPhone capture with no frame (the page draws the phone), 1320:2868, saved at 660 × 1434. They come from `apps/mobile/store/screenshots/raw/iphone` (see `apps/mobile/store/README.md`), resized with:

```bash
python3 -c "import sys; from PIL import Image; [Image.open(f'../../mobile/store/screenshots/raw/iphone/{n}.png').convert('RGB').resize((660, 1434), Image.LANCZOS).save(f'{n}.png', optimize=True) for n in sys.argv[1:]]" course lesson practice passed progress articles
```

To change one, replace the file with the same name. If it shows something different, update its `label`, `caption` and `alt` in `iosApp.screenshots`.
