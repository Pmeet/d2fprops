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

## Props

### Video

Attribute-based video player. Supports YouTube and direct video files with modal or inline playback.

**Full documentation:** [src/props/video/README.md](src/props/video/README.md)



## Contributing

See [AI.md](./AI.md) for architecture details and contribution guidelines.

## License

MIT
