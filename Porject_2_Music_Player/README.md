# PRISM — Web-Based Music Player
**Task 1 — Web Development Internship**

## Overview
PRISM is a browser-based music player with playlist building, search, category
filtering, and full playback controls — built with vanilla HTML, CSS, and
JavaScript (no frameworks or build step required).

## How to run
Open `index.html` in any modern browser (Chrome, Edge, Firefox). No install
or server needed. Requires an internet connection to stream the demo tracks.

## Requirements → Implementation

| Requirement | Implementation |
|---|---|
| Design a web-based music player with playlist functionality | Sidebar **Library** + **Your Queue** panel — click `+` on any track to add it to a personal playlist; click a queued track to jump to it; remove tracks from the queue anytime. |
| Search and categorize music | Live search box (title/artist) in the sidebar, plus category filter chips (All, Chill, Focus, Energetic, Retro, Ambient) that combine with search. |
| Play, pause, skip, and volume control | Full transport bar: play/pause, next/previous, shuffle, repeat, a custom scrubber with waveform styling and live time display, and a draggable rotary **volume knob** (also supports arrow-key and mute-click control). |

## Extra polish
- Rotating "prism disc" now-playing visual with a faceted ring animation
- Animated ambient gradient background
- Fully responsive layout (desktop → tablet → mobile)
- Keyboard shortcuts: `Space` = play/pause, `Shift + →/←` = next/previous
- Accessible controls (ARIA roles/labels on the volume knob and toggle buttons)

## File structure
```
music-player/
├── index.html   → structure/markup
├── style.css    → design system, layout, animations, responsive rules
├── script.js    → playback engine, search/filter, queue management
└── README.md
```

## Fixes & upgrades (latest pass)
- **No more overlapping playback.** Switching tracks now always fully stops
  the previous source before the next one starts (each audio source tracks
  its own stop-state instead of sharing one flag, removing a race condition
  that could occasionally let a track keep sounding after you clicked
  another). *If sound still seems to overlap, check whether you have more
  than one browser tab open on this app — each tab runs its own independent
  player and will play at the same time as any other open tab.*
- Clicking the track that's already playing now toggles play/pause instead
  of restarting it from the beginning.
- Failed loads no longer get stuck on "Loading…" — they show a clear message
  and let you pick another track.
- Richer generated music: detuned unison pads for warmth, a light algorithmic
  reverb, a sub-bass layer, and a unique chord progression per track so songs
  feel more distinct from one another.

## Notes
Audio is **generated entirely in the browser** using the Web Audio API — each
track is a short generative composition (unique per track, styled by its
category: e.g. Energetic = fast sawtooth arpeggios + percussion, Ambient =
slow evolving sine pads). There is no streaming, no external audio files, and
no network dependency, so playback works instantly and reliably offline, on
any machine or network. To use real audio files instead, swap the
`renderTrackBuffer()` step in `script.js` for a `fetch()`/`decodeAudioData()`
call against your own MP3 files.
