# Draft bug report for NetNewsWire

Status: draft for Raisul. Not posted. It goes on
https://github.com/Ranchero-Software/NetNewsWire/issues under his name, so
he posts it. Fill the parts in [brackets] first.

No open issue covers this (searched 2026-11-27). The closest are #5383 and
#2272, both closed in 7.1.3.

---

**Title:** iOS: next article slides in blank in dark mode, starting with a white flash

When I move to the next article with the down arrow in dark mode, the incoming article is often blank for the first part of the slide. It starts as a white panel for one or two frames, turns plain black, and the article's text only appears once the panel is about two thirds of the way across.

**Steps**

1. Put the iPhone in dark mode, with the Default article theme, and open an article.
2. Tap the down arrow at the top right to go to the next article. Repeat a few times, about half a second apart.
3. Watch the right edge as the next article slides in. It is easiest to see by stepping through a screen recording frame by frame.

**What I see**

Timed from a 60 fps screen recording with the Default theme, counting from the first frame of the slide:

- 0 ms: the incoming panel appears at the right edge. It is white from top to bottom.
- About 33 ms: the panel is plain black, with nothing in it.
- About 100 ms: the article's title and text appear all at once. The panel already covers about two thirds of the screen.
- About 370 ms: the slide ends.

It doesn't happen on every slide. Of 11 slides in the recording, 8 had a blank incoming panel for at least one frame (the text arrived 17 to 100 ms into the slide), and 4 of those started white. The 3 clean ones drew the article from the first frame.

The up arrow does the same from the left edge: one of the two slides back started with a white panel and stayed blank for 100 ms.

**What I expected**

The next article drawn from the start of the slide, or at least a panel in the article's background colour with no white in it.

**Details**

- NetNewsWire [version and build, from Settings > About] on [iPhone model], iOS [version]
- Dark mode, Default theme. A custom theme shows it too, so it isn't specific to a theme.
- [Say whether you also see the blank panel in light mode. The white wouldn't show there.]
- Possibly related: #5383 and #2272.

My guess is that the new article's web view is on screen before it has painted, and that it shows its default white background until the page's dark background arrives.

[Attach the slow-motion clip, or the full recording. The full recording shows text from your subscriptions; the clip shows only two public feeds.]

---

## Measurements behind this (for Raisul, not for the report)

Both recordings are 1206x2622 at 60 fps, dark mode, measured frame by frame on 2026-11-27.

| Recording | Slides | Blank incoming panel | Started white | Longest wait for text |
|---|---|---|---|---|
| Default theme (18:33) | 11 | 8 | 4, whole panel | 100 ms |
| Calm (10:41) | 6 | 1 | 1, only behind the top and bottom bars | 170 ms |

In the Default recording the taps were about half a second apart; in the Calm one about three quarters of a second. Faster taps may leave NetNewsWire less time to prepare the next article, which would explain more blank slides there. That is a guess. One Calm sample at 170 ms against Default's longest at 100 ms is too little to say whether Calm adds to the wait.

The last two movements in the Default recording are the end-of-list bounce, not slides, and aren't counted.
