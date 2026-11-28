# Draft bug report for NetNewsWire

Status: draft for Raisul. Not posted. It goes on
https://github.com/Ranchero-Software/NetNewsWire/issues under his name, so
he posts it. Fill the parts in [brackets] first.

No open issue covers this (searched 2026-11-27). The closest are #5383 and
#2272, both closed in 7.1.3.

---

**Title:** iOS: next article slides in blank in dark mode, with white strips at the top and bottom

When I move to the next article with the down arrow in dark mode, the incoming article is blank for the first part of the slide. For the first few frames it shows white strips at the top and bottom, where the navigation bar and toolbar sit. Then it is plain black, and the article's text only appears when the slide is about three quarters done.

**Steps**

1. Put the iPhone in dark mode and open an article.
2. Tap the down arrow at the top right to go to the next article.
3. Watch the right edge as the next article slides in. It is easiest to see by stepping through a screen recording frame by frame.

**What I see**

Timed from a 60 fps screen recording, counting from the first frame of the slide:

- 0 ms: the incoming panel appears at the right edge. It is black, with a white strip behind the top bar and another behind the bottom toolbar.
- About 100 ms: the white strips are gone and the panel is plain black.
- About 170 ms: the article's title and text appear all at once. The panel already covers about three quarters of the screen.
- About 380 ms: the slide ends.

**What I expected**

The next article drawn from the start of the slide, or at least a panel in the theme's background colour with no white in it.

**Details**

- NetNewsWire [version and build, from Settings > About] on [iPhone model], iOS [version]
- Dark mode. It happens with the Default theme too, so it isn't specific to a theme.
- [Say whether it also happens going back with the up arrow, and in light mode.]
- Possibly related: #5383 and #2272.

My guess is that the new article's web view is on screen before it has painted, and that the area under the bars isn't using the dark background yet.

[Attach the screen recording made with the Default theme.]
