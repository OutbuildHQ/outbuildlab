# Outbuild Lab — Brand Assets

Logo and icon files for external use (decks, socials, partners, press,
favicons, app icons). Regenerate with `node scripts/build-brand.mjs`.

## The mark

An **open circle "O"** with a block snapping into the gap — an *O being built*.
It stands for **O**utbuild and reads as a system mid-assembly. The SVGs are the
canonical, infinitely scalable source; PNGs are provided for convenience.

## Colors

| Token        | Hex       | Use                                              |
| ------------ | --------- | ------------------------------------------------ |
| Ink          | `#0B0B0C` | Backgrounds; the mark on light surfaces          |
| Accent (lime)| `#D7FF3E` | The mark on dark surfaces; highlights            |
| Olive        | `#66800B` | Lime-as-text on light backgrounds (contrast-safe)|
| Paper        | `#EDEDE8` | Wordmark / text on dark surfaces                 |

## Typography

The wordmark is set in **Clash Display — Semibold (600)**
([free, Fontshare](https://www.fontshare.com/fonts/clash-display)); the `LAB`
tag is **IBM Plex Mono**. The lockup SVGs reference these with system fallbacks,
so install Clash Display before exporting a pixel-perfect lockup from the SVG.

## Files

```
icon/
  outbuild-icon.svg          Primary — lime mark, transparent
  outbuild-icon-ink.svg      Ink mark for light backgrounds
  outbuild-icon-white.svg    White mark for photos / busy backgrounds
  outbuild-badge.svg         Rounded dark square + lime mark (app icon / avatar)
  png/
    outbuild-icon-16…512.png Transparent lime mark, common sizes
    outbuild-badge-512.png   App icon / social avatar
    outbuild-badge-180.png   apple-touch-icon size
lockup/
  outbuild-lockup-dark.svg   Mark + wordmark, for DARK backgrounds
  outbuild-lockup-light.svg  Mark + wordmark, for LIGHT backgrounds
```

## Usage

**Do**
- Keep clear space around the mark of at least the height of the inner circle.
- Use the lime mark on dark backgrounds, the ink mark on light ones.
- Use the badge for square contexts (app icons, social avatars).

**Don't**
- Recolor the mark outside the palette above, stretch it, rotate it, or add
  effects (shadows, gradients, outlines).
- Place the lime mark on a light background — contrast is too low; use ink.
- Recreate the wordmark in a different typeface.

## Need another format?

EPS/PDF vectors, a one-color print version, or a font-outlined lockup PNG can be
produced on request — just ask.
