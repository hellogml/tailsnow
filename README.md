# [TailsNow](https://tailsnow.com/) — a browser-based coin flip and random generator powered by cryptographic randomness

I built this as a lightweight utility for the kind of trivial decision fatigue that hits during development sprints — picking a test branch, breaking ties in code review debates, or seeding a quick random choice when you don't want to wire up a full scripting environment. It runs entirely in the browser. There is no backend server, no request payload leaving your machine, and no upload of session data. The randomness comes from the Web Crypto API rather than the default Math.random, which makes the toss output suitable even when you need something closer to a fair distribution than a toy PRNG.

The tool keeps a live tally of every toss in the current session so you can sanity-check the distribution by eye. It works on any device with a modern browser, requires no installation, and costs nothing to use. If you need to [flip a coin](https://tailsnow.com/) right now, the page loads ready to toss — no setup screens, no configuration step.

## Quick example

Open the page, click the coin or the flip button, and read the settled result:

```
Click coin  →  Heads
Click coin  →  Tails
Click coin  →  Heads
```

The live tally updates as `Heads: 2, Tails: 1`. Each click is one independent toss, and the animation spins through faces before settling so you can visually confirm the flip actually happened rather than returning a pre-baked string.

## Where to read more

Complete tutorials, worked examples and the full documentation live on the site: [TailsNow](https://tailsnow.com/)

## License

Source code is MIT-licensed. Website articles and descriptive content are NOT included in this license and remain copyrighted.
