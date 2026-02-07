# d2fprops

A collection of attribute-based props for Webflow. Each prop adds powerful functionality to your site using simple `data-*` attributes — no custom code required.

## Available Props

| Prop | Description | Docs |
|------|-------------|------|
| [video](#video) | YouTube & video file player with modal/inline modes | [View](src/props/video/README.md) |

*More props coming soon.*

---

## Installation

Load only the props you need. Each prop is independent.

### CDN (Recommended for Webflow)

```html
<!-- Video prop (all-in-one, includes CSS) -->
<script defer src="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.bundle.min.js"></script>
```

Or load CSS separately for better performance:

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.min.css">

<!-- Before </body> -->
<script defer src="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.min.js"></script>
```

### npm

```bash
npm install d2fprops
```

```javascript
import "d2fprops/dist/video/video.esm.js";
import "d2fprops/dist/video/video.css";
```

---

## Props

### Video

Attribute-based video player. Supports YouTube and direct video files with modal or inline playback.

**Full documentation:** [src/props/video/README.md](src/props/video/README.md)

#### Quick Start

```html
<!-- YouTube video (opens in modal) -->
<div data-vdo data-vdo-src="https://www.youtube.com/watch?v=VIDEO_ID"></div>

<!-- YouTube video inline -->
<div data-vdo data-vdo-src="https://youtu.be/VIDEO_ID" data-vdo-mode="inline"></div>

<!-- Direct video file -->
<div data-vdo data-vdo-src="https://example.com/video.mp4"></div>
```

#### Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-vdo` | Marks element as video container | Required |
| `data-vdo-src` | Video URL (YouTube or .mp4/.webm) | Required |
| `data-vdo-mode` | `modal` or `inline` | `modal` |
| `data-vdo-autoplay` | Auto-play on click (`1` or `0`) | `1` |
| `data-vdo-muted` | Mute video (`1` or `0`) | `0` |
| `data-vdo-ratio` | Aspect ratio (e.g., `16/9`, `4/3`) | `16/9` |
| `data-vdo-poster` | Custom poster image URL | Auto-detected for YouTube |
| `data-vdo-play-toggle` | Add to child elements to hide them on play | — |

---

## Philosophy

- **Attribute-first**: Configure everything with `data-*` attributes
- **Independent props**: Load only what you need
- **Webflow-native**: Works perfectly in the Webflow Designer
- **No dependencies**: Each prop works standalone
- **Accessible**: Keyboard navigation and ARIA support built-in

---

## Contributing

See [AI.md](./AI.md) for architecture details and contribution guidelines.

## License

MIT
