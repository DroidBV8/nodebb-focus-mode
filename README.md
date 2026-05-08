# nodebb-focus-mode
Immersive reading mode for NodeBB — hides the UI, centers content, CRT glitch effect on activation. F shortcut, reading progress bar, Bootstrap multi-theme compatible.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![NodeBB](https://img.shields.io/badge/NodeBB-compatible-green.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple.svg)

---

## Features

- **Full immersion** — sidebars, header, footer and decorative elements are hidden on activation
- **Centered reading area** — content reflows to a comfortable 860px max-width
- **Typography zoom** — font size increases from 16px to 18px for extended reading
- **CRT glitch effect** — visual transition on activation/deactivation, fully configurable
- **Reading progress bar** — fixed bar at the top of the page
- **Keyboard shortcut** — `F` to toggle, `Échap` to exit (Ctrl/Cmd/Alt+F ignored)
- **Smart scroll** — compensates for layout shift, keeps you at the same post
- **Toast feedback** — confirmation message on activation and deactivation
- **Topic-only** — disabled outside topics, with an info toast if triggered elsewhere
- **Mobile disabled** — no activation on screens under 768px
- **Bootstrap multi-theme** — all colors use Bootstrap CSS variables, adapts to any theme
- **Material View compatible** — both modes can be active simultaneously

---

## Installation

### 1. JavaScript
Copy the contents of `focus-mode.js` into your NodeBB admin panel:  
**Admin → Appearance → Custom JavaScript**

### 2. CSS
Copy the contents of `focus-mode.css` into your NodeBB admin panel:  
**Admin → Appearance → Custom CSS**

### 3. Rebuild
Click **Rebuild & Restart** in the admin panel.

---

## Usage

| Action | Trigger |
|--------|---------|
| Toggle Focus Mode | Click the 📖 icon in the right sidebar, or press `F` |
| Exit Focus Mode | Press `Esc`, press `F` again, or return back in your browser.

The mode state is saved in `localStorage` and restored on next visit.

---

## Configuration

All visual settings are CSS variables defined at the top of `focus-mode.css`:

```css
:root {
  --fm-dur:              400ms;   /* transition duration          */
  --fm-ease:             cubic-bezier(.4, 0, .2, 1);

  /* CRT Glitch effect */
  --fm-glitch-opacity:   1;       /* 0.5 = subtle | 1 = normal | 2 = intense */
  --fm-glitch-skew:      1deg;    /* horizontal band tilt         */
  --fm-glitch-shift:     4px;     /* horizontal displacement      */

  /* Icon */
  --fm-icon-weight:      400;     /* icon font-weight             */
}
```

To adjust content width, edit this line in `focus-mode.css`:
```css
body.focus-mode #content {
  max-width: 860px !important; /* ← change here */
}
```

---

## File Structure

```
focus-mode.js     — Toggle logic, keyboard shortcut, glitch effect, scroll compensation
focus-mode.css    — All styles, CRT glitch keyframes, configurable variables
```

---

## Compatibility

- NodeBB 3.x+
- Bootstrap 5 (uses `--bs-*` CSS variables)
- All NodeBB themes (light, dark, custom)
- Desktop only (disabled on mobile < 768px)

---

## License

[MIT](LICENSE) — © 2026
