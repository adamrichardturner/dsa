# Store media

Real screens from the simulator, framed for the App Store.

| Folder | Size | App Store Connect slot |
| --- | --- | --- |
| `screenshots/iphone` | 1320 × 2868 | iPhone 6.9" |
| `screenshots/iphone-6.3` | 1206 × 2622 | iPhone 6.3" (from the 6.9" captures) |
| `screenshots/ipad` | 2064 × 2752 | iPad 13" |
| `screenshots/duo` | 1398 × 2034 (cover) or 2007 × 2853 (open) | iPhone Duo |
| `screenshots/creatives/header.png` | 3840 × 1646 | Product Page › Header |
| `screenshots/creatives/search.png` | 3840 × 2560 | Product Page › Search Results |

## 1. Capture

Run the API against a local database with a seeded learner, build the app in Release with `EXPO_PUBLIC_GRAPHQL_URL` pointing at that API, and install it on an iPhone 18 Pro Max, an iPad Pro 13-inch (M5) and an iPhone Duo.

Set the status bar before each capture:

```bash
xcrun simctl status_bar <udid> override --time 9:41 --dataNetwork wifi --wifiBars 3 --cellularBars 4 --batteryState charged --batteryLevel 100
```

Save each screen with `xcrun simctl io <udid> screenshot store/screenshots/raw/<set>/<name>.png`, where `<set>` is `iphone`, `ipad` or `duo` and `<name>` is one of `course`, `lesson`, `practice`, `passed`, `progress`, `articles`. On the Duo, pass `--display=primary` for the cover or `--display=primary-1` once the simulator window has been opened. `raw/` is not committed.

## 2. Compose

```bash
node store/compose/compose.mjs            # every set and the creatives
node store/compose/compose.mjs ipad       # one set
node store/compose/compose.mjs creatives  # Header and Search Results only
```

Each shot is `template.html` rendered by headless Chrome at the exact App Store size and flattened to an opaque PNG. Headlines, subtitles and themes (ink, paper, dusk) are the `listing` in `compose.mjs`. The glyph field and the floating cards (two pointers, a binary search tree, a linked list, Big O curves, a gap chip, the test result) come from `art.mjs`.
