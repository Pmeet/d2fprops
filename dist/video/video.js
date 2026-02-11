"use strict";
var d2f_video = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/props/video/index.ts
  var video_exports = {};
  __export(video_exports, {
    getYouTubeId: () => getYouTubeId,
    init: () => init,
    isVideoFileUrl: () => isVideoFileUrl,
    isYouTubeUrl: () => isYouTubeUrl,
    parseRatioToPaddingTop: () => parseRatioToPaddingTop,
    pickBestYouTubePoster: () => pickBestYouTubePoster
  });
  var ATTR_LEGACY = {
    ROOT: "data-vdo",
    SRC: "data-vdo-src",
    MODE: "data-vdo-mode",
    AUTOPLAY: "data-vdo-autoplay",
    MUTED: "data-vdo-muted",
    RATIO: "data-vdo-ratio",
    POSTER: "data-vdo-poster",
    PLAY_TOGGLE: "data-vdo-play-toggle",
    HAS_RATIO: "data-vdo-has-ratio"
  };
  var ATTR_NEW = {
    ROOT: "data-video",
    SRC: "data-video-src",
    MODE: "data-video-mode",
    AUTOPLAY: "data-video-autoplay",
    MUTED: "data-video-muted",
    RATIO: "data-video-ratio",
    POSTER: "data-video-poster",
    PLAY_TOGGLE: "data-video-play-toggle",
    HAS_RATIO: "data-video-has-ratio"
  };
  function getAttr(el, newAttr, legacyAttr) {
    return el.getAttribute(newAttr) ?? el.getAttribute(legacyAttr);
  }
  var YT_PRIVACY_DOMAIN = "https://www.youtube-nocookie.com";
  var CSS_PREFIX = "d2f-video";
  var activePlayer = null;
  var lastActiveEl = null;
  function isYouTubeUrl(url) {
    return /youtu\.be|youtube\.com/i.test(url || "");
  }
  function isVideoFileUrl(url) {
    return /\.(mp4|webm|m4v)(\?.*)?$/i.test(url || "");
  }
  function getYouTubeId(url) {
    if (!url)
      return null;
    const cleaned = url.replace(/watch\?v=([^&?]+)\?/i, "watch?v=$1&");
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/i,
      /(?:youtu\.be\/)([^?&]+)/i,
      /(?:youtube\.com\/embed\/)([^?&]+)/i,
      /[?&]v=([^&]+)/i
    ];
    for (const re of patterns) {
      const m = cleaned.match(re);
      if (m && m[1])
        return m[1];
    }
    return null;
  }
  function parseRatioToPaddingTop(ratioStr) {
    if (!ratioStr || !ratioStr.includes("/"))
      return null;
    const [w, h] = ratioStr.split("/").map((n) => parseFloat(String(n).trim()));
    if (!w || !h)
      return null;
    return `${h / w * 100}%`;
  }
  function canLoadImage(url, timeoutMs = 2500) {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = (ok) => {
        if (done)
          return;
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
  async function pickBestYouTubePoster(ytId) {
    const candidates = [
      `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    ];
    for (const url of candidates) {
      const ok = await canLoadImage(url);
      if (ok)
        return url;
    }
    return candidates[candidates.length - 1];
  }
  async function setPosterIfNeeded(el, src) {
    const custom = getAttr(el, ATTR_NEW.POSTER, ATTR_LEGACY.POSTER);
    if (custom) {
      el.style.backgroundImage = `url("${custom}")`;
      return;
    }
    if (!isYouTubeUrl(src))
      return;
    const id = getYouTubeId(src);
    if (!id)
      return;
    if (el.style.backgroundImage && el.style.backgroundImage !== "none")
      return;
    const best = await pickBestYouTubePoster(id);
    el.style.backgroundImage = `url("${best}")`;
  }
  function togglePlayOverlay(rootEl, isPlaying) {
    const toggles = rootEl.querySelectorAll(
      `[${ATTR_LEGACY.PLAY_TOGGLE}], [${ATTR_NEW.PLAY_TOGGLE}]`
    );
    toggles.forEach((el) => {
      el.style.opacity = isPlaying ? "0" : "1";
      el.style.pointerEvents = isPlaying ? "none" : "";
      el.style.transition = "opacity 0.25s ease";
    });
  }
  function ensureModal() {
    let modal = document.querySelector(`.${CSS_PREFIX}-modal`);
    if (modal)
      return modal;
    modal = document.createElement("div");
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
  function destroyPlayerAndClear(container) {
    if (activePlayer) {
      try {
        activePlayer.destroy();
      } catch (e) {
      }
      activePlayer = null;
    }
    if (container)
      container.innerHTML = "";
  }
  function closeModal() {
    const modal = document.querySelector(`.${CSS_PREFIX}-modal`);
    if (!modal)
      return;
    const inner = modal.querySelector(`.${CSS_PREFIX}-modal__inner`);
    destroyPlayerAndClear(inner);
    modal.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (modal._onKey) {
      document.removeEventListener("keydown", modal._onKey);
      modal._onKey = void 0;
    }
    if (lastActiveEl) {
      resumePreview(lastActiveEl);
      if (typeof lastActiveEl.focus === "function") {
        lastActiveEl.focus();
      }
    }
  }
  function openModal() {
    const modal = ensureModal();
    modal.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const closeBtn = modal.querySelector(`.${CSS_PREFIX}-modal__close`);
    closeBtn?.focus();
    const onKey = (ev) => {
      if (ev.key === "Escape")
        closeModal();
    };
    modal._onKey = onKey;
    document.addEventListener("keydown", onKey);
  }
  function wireModalClose() {
    const modal = ensureModal();
    const panel = modal.querySelector(`.${CSS_PREFIX}-modal__panel`);
    const closeBtn = modal.querySelector(`.${CSS_PREFIX}-modal__close`);
    closeBtn?.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (panel && !panel.contains(e.target) && e.target !== closeBtn) {
        closeModal();
      }
    });
  }
  function buildYouTubeIframe(src, autoplay) {
    const id = getYouTubeId(src);
    if (!id)
      return null;
    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      rel: "0",
      playsinline: "1",
      modestbranding: "1"
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
  function buildHtml5Video(src, autoplay, muted) {
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
  function buildPreviewYouTubeIframe(src) {
    const id = getYouTubeId(src);
    if (!id)
      return null;
    const pageOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      loop: "1",
      playlist: id,
      controls: "0",
      modestbranding: "1",
      playsinline: "1",
      rel: "0",
      showinfo: "0",
      disablekb: "1",
      enablejsapi: "1",
      origin: pageOrigin,
      iv_load_policy: "3",
      fs: "0",
      cc_load_policy: "0"
    });
    const iframe = document.createElement("iframe");
    iframe.src = `${YT_PRIVACY_DOMAIN}/embed/${id}?${params.toString()}`;
    iframe.setAttribute("title", "Video preview");
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("frameborder", "0");
    iframe.loading = "eager";
    iframe.style.pointerEvents = "none";
    return iframe;
  }
  function buildPreviewHtml5Video(src) {
    const video = document.createElement("video");
    video.setAttribute("playsinline", "");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.style.pointerEvents = "none";
    const source = document.createElement("source");
    source.src = src;
    source.type = /\.webm(\?.*)?$/i.test(src) ? "video/webm" : "video/mp4";
    video.appendChild(source);
    return video;
  }
  function enhanceWithPlyr(mediaEl) {
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
            "fullscreen"
          ]
        });
      }
    } catch (e) {
      activePlayer = null;
    }
  }
  function startPreview(el, src, inner) {
    if (isYouTubeUrl(src)) {
      const iframe = buildPreviewYouTubeIframe(src);
      if (iframe) {
        inner.appendChild(iframe);
        el._d2fPreviewEl = iframe;
        togglePlayOverlay(el, true);
      }
    } else if (isVideoFileUrl(src)) {
      const vid = buildPreviewHtml5Video(src);
      inner.appendChild(vid);
      el._d2fPreviewEl = vid;
      togglePlayOverlay(el, true);
      setTimeout(() => {
        try {
          vid.play();
        } catch (_e) {
        }
      }, 0);
    }
  }
  function ytCommand(iframe, func) {
    if (!iframe.contentWindow)
      return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      YT_PRIVACY_DOMAIN
    );
  }
  function pausePreview(el) {
    const preview = el._d2fPreviewEl;
    if (!preview)
      return;
    if (preview instanceof HTMLVideoElement) {
      preview.pause();
    } else if (preview instanceof HTMLIFrameElement) {
      ytCommand(preview, "pauseVideo");
    }
  }
  function resumePreview(el) {
    const preview = el._d2fPreviewEl;
    if (!preview)
      return;
    if (preview instanceof HTMLVideoElement) {
      try {
        preview.play();
      } catch (_e) {
      }
    } else if (preview instanceof HTMLIFrameElement) {
      ytCommand(preview, "playVideo");
    }
  }
  function observePreview(el, src, inner) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startPreview(el, src, inner);
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0 }
    );
    observer.observe(el);
  }
  function initOne(el) {
    if (el._d2fVideoInit)
      return;
    el._d2fVideoInit = true;
    const src = getAttr(el, ATTR_NEW.SRC, ATTR_LEGACY.SRC);
    if (!src)
      return;
    const isLegacy = el.hasAttribute(ATTR_LEGACY.ROOT);
    const ATTR = isLegacy ? ATTR_LEGACY : ATTR_NEW;
    const mode = (getAttr(el, ATTR_NEW.MODE, ATTR_LEGACY.MODE) || "modal").toLowerCase();
    const autoplay = (getAttr(el, ATTR_NEW.AUTOPLAY, ATTR_LEGACY.AUTOPLAY) || "1") === "1";
    const muted = (getAttr(el, ATTR_NEW.MUTED, ATTR_LEGACY.MUTED) || "0") === "1";
    const ratioStr = getAttr(el, ATTR_NEW.RATIO, ATTR_LEGACY.RATIO);
    const pt = parseRatioToPaddingTop(ratioStr);
    if (pt) {
      el.style.setProperty("--d2f-video-pt", pt);
      el.setAttribute(ATTR.HAS_RATIO, "1");
    }
    if (mode !== "preview") {
      setPosterIfNeeded(el, src);
    }
    if (!el.querySelector(`.${CSS_PREFIX}__inner`)) {
      const inner2 = document.createElement("div");
      inner2.className = `${CSS_PREFIX}__inner`;
      el.appendChild(inner2);
    }
    if (!el.hasAttribute("tabindex"))
      el.setAttribute("tabindex", "0");
    if (!el.hasAttribute("role"))
      el.setAttribute("role", "button");
    if (!el.hasAttribute("aria-label")) {
      el.setAttribute("aria-label", mode === "preview" ? "Play full video" : "Play video");
    }
    const inner = el.querySelector(`.${CSS_PREFIX}__inner`);
    if (mode === "preview") {
      observePreview(el, src, inner);
    }
    const play = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      lastActiveEl = el;
      if (mode === "preview") {
        pausePreview(el);
      } else {
        inner.innerHTML = "";
      }
      const modalAutoplay = mode === "preview" ? true : autoplay;
      const modalMuted = mode === "preview" ? false : muted;
      if (isYouTubeUrl(src)) {
        const iframe = buildYouTubeIframe(src, modalAutoplay);
        if (!iframe)
          return;
        if (mode === "inline") {
          inner.appendChild(iframe);
          togglePlayOverlay(el, true);
          try {
            if (window.Plyr)
              activePlayer = new window.Plyr(iframe);
          } catch (e2) {
          }
        } else {
          const modal = ensureModal();
          const modalInner = modal.querySelector(`.${CSS_PREFIX}-modal__inner`);
          destroyPlayerAndClear(modalInner);
          const modalRatio = modal.querySelector(`.${CSS_PREFIX}-modal__ratio`);
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
            if (window.Plyr)
              activePlayer = new window.Plyr(iframe);
          } catch (e2) {
          }
          openModal();
        }
        return;
      }
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
            } catch (e2) {
            }
          }, 0);
        } else {
          const modal = ensureModal();
          const modalInner = modal.querySelector(`.${CSS_PREFIX}-modal__inner`);
          destroyPlayerAndClear(modalInner);
          const modalRatio = modal.querySelector(`.${CSS_PREFIX}-modal__ratio`);
          if (modalRatio) {
            if (pt) {
              modalRatio.style.setProperty("--d2f-video-pt", pt);
              modalRatio.setAttribute("data-video-has-ratio", "1");
            } else {
              modalRatio.style.removeProperty("--d2f-video-pt");
              modalRatio.removeAttribute("data-video-has-ratio");
            }
          }
          const vid = buildHtml5Video(src, modalAutoplay, modalMuted);
          modalInner?.appendChild(vid);
          enhanceWithPlyr(vid);
          setTimeout(() => {
            try {
              vid.play();
            } catch (e2) {
            }
          }, 0);
          openModal();
        }
      }
    };
    el.addEventListener("click", play);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        play(e);
      }
    });
  }
  function init() {
    ensureModal();
    wireModalClose();
    document.querySelectorAll(
      `[${ATTR_LEGACY.ROOT}], [${ATTR_NEW.ROOT}]`
    ).forEach(initOne);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  return __toCommonJS(video_exports);
})();
//# sourceMappingURL=video.js.map
