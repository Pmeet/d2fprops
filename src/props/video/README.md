# d2fprops / video

Attribute-based video player for Webflow. Supports YouTube and direct video files with modal or inline playback.

---

## Installation

Add this to your Webflow site's **Custom Code** section (in Project Settings or before `</body>`):

```html
<!-- All-in-one (JS + CSS included) -->
<script defer src="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.bundle.min.js"></script>
```

**Or** load CSS separately in the `<head>` for better performance:

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.min.css">

<!-- Before </body> -->
<script defer src="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.min.js"></script>
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
| `data-vdo-mode` | `modal` (popup) or `inline` (plays in place) | `modal` |
| `data-vdo-autoplay` | Auto-play when clicked: `1` or `0` | `1` |
| `data-vdo-muted` | Start muted: `1` or `0` | `0` |
| `data-vdo-ratio` | Aspect ratio: `16/9`, `4/3`, `1/1`, etc. | `16/9` |
| `data-vdo-poster` | Custom thumbnail image URL | Auto-detected for YouTube |
| `data-vdo-play-toggle` | Add to child elements to hide them when playing | — |

---

## Examples

### YouTube Video (Modal)

```html
<div data-vdo data-vdo-src="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
  <!-- Optional: Add a play button or thumbnail here -->
</div>
```

### YouTube Video (Inline)

```html
<div data-vdo data-vdo-src="https://youtu.be/dQw4w9WgXcQ" data-vdo-mode="inline"></div>
```

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
    ▶ Play Video
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

## Styling in Webflow

The video container uses these default styles:
- `border-radius: 16px`
- `background-color: #000`
- Aspect ratio maintained via padding

You can override these in Webflow by styling the element directly. The `background-size: cover` ensures your poster/thumbnail fills the container.

---

## Optional: Enhanced Player (Plyr)

For custom video controls, include [Plyr](https://plyr.io/) before this script:

```html
<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css">
<script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/d2fprops/dist/video/video.bundle.min.js"></script>
```

---

## Accessibility

This prop includes:
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

**Modal not closing:**
- Click outside the video or press Escape
- Check for CSS conflicts with `z-index`

---

## Notes

- YouTube videos use `youtube-nocookie.com` for privacy
- Videos are lazy-loaded for better page performance
- The modal is shared across all video elements (only one video plays at a time)
