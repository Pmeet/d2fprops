# d2fprops / video

Attribute-based video player for Webflow. Supports YouTube and direct video files with modal, inline, and preview playback modes.

---

## Installation

Add this to your Webflow site's **Custom Code** section (in Project Settings or before `</body>`):

```html
<!-- All-in-one (JS + CSS included) -->
<script defer src="https://cdn.jsdelivr.net/gh/Pmeet/d2fprops@main/dist/video/video.bundle.min.js"></script>
```

**Or** load CSS separately in the `<head>` for better performance:

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Pmeet/d2fprops@main/dist/video/video.min.css">

<!-- Before </body> -->
<script defer src="https://cdn.jsdelivr.net/gh/Pmeet/d2fprops@main/dist/video/video.min.js"></script>
```

---

## Quick Start

1. Add a **Div Block** in Webflow
2. Add the custom attribute: `data-vdo` (no value needed)
3. Add another attribute: `data-vdo-src` with your video URL

That's it! Click the element to play the video in a modal.

---

## Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-vdo` | Marks element as video container | Required |
| `data-vdo-src` | Video URL (YouTube or .mp4/.webm file) | Required |
| `data-vdo-mode` | `modal` (popup), `inline` (plays in place), or `preview` (muted loop + click for modal) | `modal` |
| `data-vdo-autoplay` | Auto-play when clicked: `1` or `0` | `1` |
| `data-vdo-muted` | Start muted: `1` or `0` | `0` |
| `data-vdo-ratio` | Aspect ratio: `16/9`, `4/3`, `1/1`, etc. | `16/9` |
| `data-vdo-poster` | Custom thumbnail image URL (not used in preview mode) | Auto-detected for YouTube |
| `data-vdo-fit` | Video sizing: `cover` (fill container, crop overflow) | — (default: contain) |
| `data-vdo-play-toggle` | Add to child elements to hide them when playing | — |

Both `data-vdo-*` (legacy) and `data-video-*` (new) attribute prefixes are supported. All examples below use `data-vdo-*` but `data-video-*` works identically.

---

## Modes

### Modal (default)

Click the element to open the video in a full-screen overlay. Press Escape or click outside to close.

```html
<div data-vdo data-vdo-src="https://www.youtube.com/watch?v=VIDEO_ID"></div>
```

### Inline

Click to play the video directly inside the element.

```html
<div data-vdo data-vdo-src="https://youtu.be/VIDEO_ID" data-vdo-mode="inline"></div>
```

### Preview

A muted, looping video plays automatically as the user scrolls near the element. Clicking opens the full video in a modal from the beginning with sound.

- Preview loads 200px before the element enters the viewport (no page speed impact)
- No poster/thumbnail is loaded in preview mode (the video itself serves as the preview)
- Preview pauses when the modal is open, resumes when it closes
- YouTube controls and branding are hidden in the preview

```html
<div data-vdo data-vdo-src="https://www.youtube.com/watch?v=VIDEO_ID" data-vdo-mode="preview"></div>
```

```html
<div data-video data-video-src="https://example.com/video.mp4" data-video-mode="preview"></div>
```

### Preview with Cover Fit

When the container has a non-16:9 aspect ratio (e.g., a wider/shorter div), the video may not fill the container completely. Use `data-vdo-fit="cover"` to make the video fill the entire container like `object-fit: cover`, cropping overflow:

```html
<div data-vdo data-vdo-src="https://www.youtube.com/watch?v=VIDEO_ID" data-vdo-mode="preview" data-vdo-fit="cover"></div>
```

**How cover fit works for iframes:**

For `<video>` elements, native `object-fit: cover` is applied. For `<iframe>` elements (YouTube embeds), `object-fit` doesn't work, so the following CSS values are applied to the iframe:

| Property | Value |
|----------|-------|
| `width` | `200%` |
| `height` | `200%` |
| `top` | `27.5%` |
| `left` | `27.5%` |
| `transform` | `translate(-27.5%, -27.5%)` |
| `position` | `absolute` |
| `max-width` | `none` |

These values are optimized for 4:3 containers with 16:9 video content. If you need different values for a different container ratio, override them with a custom CSS rule targeting `.d2f-video--cover .d2f-video__inner iframe`.

---

## More Examples

### Direct Video File

```html
<div data-vdo data-vdo-src="https://example.com/video.mp4"></div>
```

### Custom Aspect Ratio

```html
<div data-vdo data-vdo-src="..." data-vdo-ratio="4/3"></div>
```

### With Play Button Overlay

The play button will automatically hide when the video starts:

```html
<div data-vdo data-vdo-src="..." data-vdo-mode="inline">
  <div data-vdo-play-toggle class="play-button">
    Play Video
  </div>
</div>
```

---

## Supported URLs

**YouTube:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Direct Files:**
- `.mp4`
- `.webm`
- `.m4v`

---

## Styling

The video container inherits `border-radius` from your Webflow classes, so your design stays intact. Other default styles:

- `background-color: #000`
- `overflow: hidden`
- Aspect ratio maintained via CSS padding

Style the element in Webflow as you normally would — the prop won't override your classes.

---

## Optional: Enhanced Player (Plyr)

For custom video controls, include [Plyr](https://plyr.io/) before this script:

```html
<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css">
<script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/Pmeet/d2fprops@main/dist/video/video.bundle.min.js"></script>
```

---

## Accessibility

- Keyboard navigation (Enter/Space to play, Escape to close modal)
- Focus management (returns focus after modal closes)
- ARIA attributes for screen readers

---

## Troubleshooting

**Video doesn't play:**
- Check that `data-vdo-src` has a valid URL
- Ensure the URL is publicly accessible

**Thumbnail not showing:**
- For YouTube, thumbnails are auto-detected
- For direct files, add `data-vdo-poster="your-image-url.jpg"`
- Thumbnails are not loaded in preview mode by design

**Modal not closing:**
- Click outside the video or press Escape
- Check for CSS conflicts with `z-index`

---

## Notes

- YouTube videos use `youtube-nocookie.com` for privacy
- Preview mode lazy-loads 200px before viewport for instant playback
- The modal is shared across all video elements (only one video plays at a time)
- Building is automated via GitHub Actions — push source changes and `dist/` is rebuilt automatically
