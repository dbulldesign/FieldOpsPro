# FieldOps Pro

A field operations PWA for managing projects, tasks, purchase orders, and shipping — with Firebase real-time sync.

## File Structure

```
/
├── index.html          # App shell — HTML only, no inline JS or CSS
├── css/
│   └── app.css         # All styles (~68KB)
└── js/
    ├── config.js       # Firebase project config (edit this for your project)
    ├── utils.js        # Helpers: theme, toast, badges, formatters, haptic
    ├── data.js         # State, Firebase sync, localStorage CRUD, offline queue
    ├── render.js       # All render functions: dashboard, tasks, projects, POs, shipping
    ├── modals.js       # Modal open/close, all save/edit form handlers, combo boxes
    ├── features.js     # Search, notifications, tab bar, smart FAB, location, swipe
    └── globals.js      # window.X = X assignments for iOS WKWebView compatibility
```

## Script Load Order

The order in `index.html` is intentional:
1. `config.js` — sets `window._embeddedFirebaseConfig` before Firebase SDK loads
2. Firebase CDN scripts
3. `utils.js` — no dependencies
4. `data.js` — depends on utils
5. `render.js` — depends on utils + data
6. `modals.js` — depends on render + data
7. `features.js` — depends on all above
8. `globals.js` — exposes everything to `window` for iOS WKWebView

## GitHub Pages

Enable Pages in repo Settings → Pages → Deploy from branch `main`, folder `/`.  
The app will be live at `https://<username>.github.io/<repo>/`

## Changing Firebase Project

Edit `js/config.js` and replace the config object with your own from the Firebase Console.

## iOS / WKWebView Notes

- All functions must be on `window` — handled by `globals.js`
- No ES6 (`const`/`let`/arrows/template literals) — all ES5
- NodeList.forEach polyfill in `features.js`
- `-webkit-animation` prefixes in `app.css`
