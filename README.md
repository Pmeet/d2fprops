# d2fprops

A collection of attribute-based props for Webflow. Each prop adds powerful functionality to your site using simple `data-*` attributes — no custom code required.

## Available Props

| Prop | Description | Docs |
|------|-------------|------|
| video | YouTube & video file player with modal, inline, and preview modes | [View docs](src/props/video/README.md) |

*More props coming soon.*

---

## Installation

Load only the props you need. Each prop is independent. Add the script to your Webflow site's **Custom Code** section (Project Settings > before `</body>`):

```html
<script defer src="https://cdn.jsdelivr.net/gh/Pmeet/d2fprops@main/dist/video/video.bundle.min.js"></script>
```

Each prop's README has detailed installation and usage instructions.

---

## How It Works

1. Add a script tag for the prop you need
2. Add `data-*` attributes to your Webflow elements
3. The prop auto-initializes on page load — no custom code needed

All styling inherits from your Webflow classes by default, so your existing design stays intact.

---

## Development

See [AI.md](./AI.md) for architecture details, build system, and how to add new props.

**Building is automated.** A GitHub Actions workflow rebuilds `dist/` on every push to `main`. Just push source changes.

---

## License

MIT
