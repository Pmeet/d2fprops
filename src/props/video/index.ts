/**
 * d2fprops / video
 * Attribute-based video player for Webflow
 *
 * Supports two attribute naming conventions:
 * - Legacy: data-vdo, data-vdo-src, etc. (for existing implementations)
 * - New: data-video, data-video-src, etc.
 *
 * @example
 * <div data-vdo data-vdo-src="https://youtube.com/watch?v=VIDEO_ID"></div>
 * <div data-video data-video-src="https://youtube.com/watch?v=VIDEO_ID"></div>
 */

// ============================================================
// CONSTANTS
// ============================================================

// Legacy attributes (data-vdo-*) - maintained for backwards compatibility
const ATTR_LEGACY = {
  ROOT: "data-vdo",
  SRC: "data-vdo-src",
  MODE: "data-vdo-mode",
  AUTOPLAY: "data-vdo-autoplay",
  MUTED: "data-vdo-muted",
  RATIO: "data-vdo-ratio",
  POSTER: "data-vdo-poster",
  PLAY_TOGGLE: "data-vdo-play-toggle",
  HAS_RATIO: "data-vdo-has-ratio",
} as const;

// New attributes (data-video-*)
const ATTR_NEW = {
  ROOT: "data-video",
  SRC: "data-video-src",
  MODE: "data-video-mode",
  AUTOPLAY: "data-video-autoplay",
  MUTED: "data-video-muted",
  RATIO: "data-video-ratio",
  POSTER: "data-video-poster",
  PLAY_TOGGLE: "data-video-play-toggle",
  HAS_RATIO: "data-video-has-ratio",
} as const;

/**
 * Get attribute value with fallback to legacy naming
 */
function getAttr(el: HTMLElement, newAttr: string, legacyAttr: string): string | null {
  return el.getAttribute(newAttr) ?? el.getAttribute(legacyAttr);
}

const YT_PRIVACY_DOMAIN = "https://www.youtube-nocookie.com";
const CSS_PREFIX = "d2f-video";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface VideoElement extends HTMLElement {
  _d2fVideoInit?: boolean;
}

interface VideoModal extends HTMLElement {
  _onKey?: (ev: KeyboardEvent) => void;
}

declare global {
  interface Window {
    Plyr?: new (element: HTMLElement | HTMLIFrameElement, options?: object) => PlyrInstance;
  }
}

interface PlyrInstance {
  destroy(): void;
}

// ============================================================
// STATE
// ============================================================

let activePlayer: PlyrInstance | null = null;
let lastActiveEl: HTMLElement | null = null;

// ============================================================
// URL HELPERS
// ============================================================

/**
 * Check if URL is a YouTube link
 */
export function isYouTubeUrl(url: string | null): boolean {
  return /youtu\.be|youtube\.com/i.test(url || "");
}

/**
 * Check if URL is a direct video file
 */
export function isVideoFileUrl(url: string | null): boolean {
  return /\.(mp4|webm|m4v)(\?.*)?$/i.test(url || "");
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function getYouTubeId(url: string | null): string | null {
  if (!url) return null;

  // Clean up malformed URLs
  const cleaned = url.replace(/watch\?v=([^&?]+)\?/i, "watch?v=$1&");

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/i,
    /(?:youtu\.be\/)([^?&]+)/i,
    /(?:youtube\.com\/embed\/)([^?&]+)/i,
    /[?&]v=([^&]+)/i,
  ];

  for (const re of patterns) {
    const m = cleaned.match(re);
    if (m && m[1]) return m[1];
  }

  return null;
}

// ============================================================
// RATIO HELPERS
// ============================================================

/**
 * Convert ratio string (e.g., "16/9") to CSS padding-top percentage
 */
export function parseRatioToPaddingTop(ratioStr: string | null): string | null {
  if (!ratioStr || !ratioStr.includes("/")) return null;

  const [w, h] = ratioStr.split("/").map((n) => parseFloat(String(n).trim()));
  if (!w || !h) return null;

  return `${(h / w) * 100}%`;
}

// ============================================================
// POSTER HELPERS
// ============================================================

/**
 * Test if an image URL can be loaded
 */
function canLoadImage(url: string, timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };

    const t = setTimeout(() => finish(false), timeoutMs);
    img.onload = () => {
      clearTimeout(t);
      finish(true);
    };
    img.onerror = () => {
      clearTimeout(t);
      finish(false);
    };
    img.src = url;
  });
}

/**
 * Find the best available YouTube thumbnail
 */
export async function pickBestYouTubePoster(ytId: string): Promise<string> {
  const candidates = [
    `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
  ];

  for (const url of candidates) {
    const ok = await canLoadImage(url);
    if (ok) return url;
  }

  return candidates[candidates.length - 1];
}

/**
 * Set poster image on element if not already set
 */
async function setPosterIfNeeded(el: HTMLElement, src: string): Promise<void> {
  // Explicit poster attribute takes priority (check both naming conventions)
  const custom = getAttr(el, ATTR_NEW.POSTER, ATTR_LEGACY.POSTER);
  if (custom) {
    el.style.backgroundImage = `url("${custom}")`;
    return;
  }

  if (!isYouTubeUrl(src)) return;

  const id = getYouTubeId(src);
  if (!id) return;

  // Don't override existing inline styles
  if (el.style.backgroundImage && el.style.backgroundImage !== "none") return;

  const best = await pickBestYouTubePoster(id);
  el.style.backgroundImage = `url("${best}")`;
}

// ============================================================
// UI HELPERS
// ============================================================

/**
 * Toggle visibility of play overlay elements
 */
function togglePlayOverlay(rootEl: HTMLElement, isPlaying: boolean): void {
  // Check both legacy and new attribute names
  const toggles = rootEl.querySelectorAll<HTMLElement>(
    `[${ATTR_LEGACY.PLAY_TOGGLE}], [${ATTR_NEW.PLAY_TOGGLE}]`
  );

  toggles.forEach((el) => {
    el.style.opacity = isPlaying ? "0" : "1";
    el.style.pointerEvents = isPlaying ? "none" : "";
    el.style.transition = "opacity 0.25s ease";
  });
}

// ============================================================
// MODAL
// ============================================================

/**
 * Get or create the modal element
 */
function ensureModal(): VideoModal {
  let modal = document.querySelector<VideoModal>(`.${CSS_PREFIX}-modal`);
  if (modal) return modal;

  modal = document.createElement("div") as VideoModal;
  modal.className = `${CSS_PREFIX}-modal`;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Video dialog");

  modal.innerHTML = `
    <button class="${CSS_PREFIX}-modal__close" type="button" aria-label="Close video">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.31 6.3-6.31z"/>
      </svg>
    </button>
    <div class="${CSS_PREFIX}-modal__panel" role="document">
      <div class="${CSS_PREFIX}-modal__ratio">
        <div class="${CSS_PREFIX}-modal__inner"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

/**
 * Destroy active player and clear container
 */
function destroyPlayerAndClear(container: HTMLElement | null): void {
  if (activePlayer) {
    try {
      activePlayer.destroy();
    } catch (e) {
      // Ignore destroy errors
    }
    activePlayer = null;
  }
  if (container) container.innerHTML = "";
}

/**
 * Close the video modal
 */
function closeModal(): void {
  const modal = document.querySelector<VideoModal>(`.${CSS_PREFIX}-modal`);
  if (!modal) return;

  const inner = modal.querySelector<HTMLElement>(`.${CSS_PREFIX}-modal__inner`);
  destroyPlayerAndClear(inner);

  modal.classList.remove("is-open");
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";

  if (modal._onKey) {
    document.removeEventListener("keydown", modal._onKey);
    modal._onKey = undefined;
  }

  if (lastActiveEl && typeof lastActiveEl.focus === "function") {
    lastActiveEl.focus();
  }
}

/**
 * Open the video modal
 */
function openModal(): void {
  const modal = ensureModal();
  modal.classList.add("is-open");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  const closeBtn = modal.querySelector<HTMLButtonElement>(`.${CSS_PREFIX}-modal__close`);
  closeBtn?.focus();

  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") closeModal();
  };
  modal._onKey = onKey;
  document.addEventListener("keydown", onKey);
}

/**
 * Wire up modal close handlers
 */
function wireModalClose(): void {
  const modal = ensureModal();
  const panel = modal.querySelector<HTMLElement>(`.${CSS_PREFIX}-modal__panel`);
  const closeBtn = modal.querySelector<HTMLButtonElement>(`.${CSS_PREFIX}-modal__close`);

  closeBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (panel && !panel.contains(e.target as Node) && e.target !== closeBtn) {
      closeModal();
    }
  });
}

// ============================================================
// PLAYER BUILDERS
// ============================================================

/**
 * Create a YouTube iframe embed
 */
function buildYouTubeIframe(src: string, autoplay: boolean): HTMLIFrameElement | null {
  const id = getYouTubeId(src);
  if (!id) return null;

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    playsinline: "1",
    modestbranding: "1",
  });

  const iframe = document.createElement("iframe");
  iframe.src = `${YT_PRIVACY_DOMAIN}/embed/${id}?${params.toString()}`;
  iframe.setAttribute("title", "YouTube video");
  iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.loading = "lazy";

  return iframe;
}

/**
 * Create an HTML5 video element
 */
function buildHtml5Video(src: string, autoplay: boolean, muted: boolean): HTMLVideoElement {
  const video = document.createElement("video");
  video.setAttribute("playsinline", "");
  video.setAttribute("controls", "");
  video.autoplay = autoplay;
  video.muted = muted;

  const source = document.createElement("source");
  source.src = src;
  source.type = /\.webm(\?.*)?$/i.test(src) ? "video/webm" : "video/mp4";
  video.appendChild(source);

  return video;
}

/**
 * Enhance a video/iframe with Plyr if available
 */
function enhanceWithPlyr(mediaEl: HTMLVideoElement | HTMLIFrameElement): void {
  try {
    if (window.Plyr) {
      activePlayer = new window.Plyr(mediaEl, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
      });
    }
  } catch (e) {
    activePlayer = null;
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize a single video element
 */
function initOne(el: VideoElement): void {
  // Prevent double initialization
  if (el._d2fVideoInit) return;
  el._d2fVideoInit = true;

  // Get src with fallback to legacy attribute
  const src = getAttr(el, ATTR_NEW.SRC, ATTR_LEGACY.SRC);
  if (!src) return;

  // Determine which attribute set this element uses (for setting attributes)
  const isLegacy = el.hasAttribute(ATTR_LEGACY.ROOT);
  const ATTR = isLegacy ? ATTR_LEGACY : ATTR_NEW;

  // Set up aspect ratio
  const ratioStr = getAttr(el, ATTR_NEW.RATIO, ATTR_LEGACY.RATIO);
  const pt = parseRatioToPaddingTop(ratioStr);
  if (pt) {
    el.style.setProperty("--d2f-video-pt", pt);
    el.setAttribute(ATTR.HAS_RATIO, "1");
  }

  // Set poster (async for YouTube)
  setPosterIfNeeded(el, src);

  // Create inner mount (use consistent class name internally)
  if (!el.querySelector(`.${CSS_PREFIX}__inner`)) {
    const inner = document.createElement("div");
    inner.className = `${CSS_PREFIX}__inner`;
    el.appendChild(inner);
  }

  // Accessibility
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
  if (!el.hasAttribute("role")) el.setAttribute("role", "button");
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Play video");

  // Parse options with fallback to legacy attributes
  const mode = (getAttr(el, ATTR_NEW.MODE, ATTR_LEGACY.MODE) || "modal").toLowerCase();
  const autoplay = (getAttr(el, ATTR_NEW.AUTOPLAY, ATTR_LEGACY.AUTOPLAY) || "1") === "1";
  const muted = (getAttr(el, ATTR_NEW.MUTED, ATTR_LEGACY.MUTED) || "0") === "1";

  const inner = el.querySelector<HTMLElement>(`.${CSS_PREFIX}__inner`)!;

  /**
   * Play handler
   */
  const play = (e?: Event) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    lastActiveEl = el;
    inner.innerHTML = "";

    // YouTube video
    if (isYouTubeUrl(src)) {
      const iframe = buildYouTubeIframe(src, autoplay);
      if (!iframe) return;

      if (mode === "inline") {
        inner.appendChild(iframe);
        togglePlayOverlay(el, true);
        try {
          if (window.Plyr) activePlayer = new window.Plyr(iframe);
        } catch (e) {
          // Ignore Plyr errors
        }
      } else {
        const modal = ensureModal();
        const modalInner = modal.querySelector<HTMLElement>(`.${CSS_PREFIX}-modal__inner`);
        destroyPlayerAndClear(modalInner);

        const modalRatio = modal.querySelector<HTMLElement>(`.${CSS_PREFIX}-modal__ratio`);
        if (modalRatio) {
          if (pt) {
            modalRatio.style.setProperty("--d2f-video-pt", pt);
            modalRatio.setAttribute("data-video-has-ratio", "1");
          } else {
            modalRatio.style.removeProperty("--d2f-video-pt");
            modalRatio.removeAttribute("data-video-has-ratio");
          }
        }

        modalInner?.appendChild(iframe);
        try {
          if (window.Plyr) activePlayer = new window.Plyr(iframe);
        } catch (e) {
          // Ignore Plyr errors
        }
        openModal();
      }
      return;
    }

    // Direct video file
    if (isVideoFileUrl(src)) {
      if (mode === "inline") {
        const vid = buildHtml5Video(src, autoplay, muted);
        inner.appendChild(vid);
        togglePlayOverlay(el, true);

        vid.addEventListener("ended", () => togglePlayOverlay(el, false), { once: true });

        enhanceWithPlyr(vid);
        setTimeout(() => {
          try {
            vid.play();
          } catch (e) {
            // Ignore play errors
          }
        }, 0);
      } else {
        const modal = ensureModal();
        const modalInner = modal.querySelector<HTMLElement>(`.${CSS_PREFIX}-modal__inner`);
        destroyPlayerAndClear(modalInner);

        const modalRatio = modal.querySelector<HTMLElement>(`.${CSS_PREFIX}-modal__ratio`);
        if (modalRatio) {
          if (pt) {
            modalRatio.style.setProperty("--d2f-video-pt", pt);
            modalRatio.setAttribute("data-video-has-ratio", "1");
          } else {
            modalRatio.style.removeProperty("--d2f-video-pt");
            modalRatio.removeAttribute("data-video-has-ratio");
          }
        }

        const vid = buildHtml5Video(src, autoplay, muted);
        modalInner?.appendChild(vid);
        enhanceWithPlyr(vid);
        setTimeout(() => {
          try {
            vid.play();
          } catch (e) {
            // Ignore play errors
          }
        }, 0);
        openModal();
      }
    }
  };

  // Event listeners
  el.addEventListener("click", play);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      play(e);
    }
  });
}

/**
 * Initialize all video elements on the page
 */
export function init(): void {
  ensureModal();
  wireModalClose();
  // Select both legacy (data-vdo) and new (data-video) elements
  document.querySelectorAll<VideoElement>(
    `[${ATTR_LEGACY.ROOT}], [${ATTR_NEW.ROOT}]`
  ).forEach(initOne);
}

// ============================================================
// AUTO-INIT
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
