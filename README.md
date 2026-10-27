# TailsNow — Browser-based coin flip with cryptographic randomness

TailsNow is a small side project I built to scratch a common itch: needing a genuinely fair coin flip without digging for loose change or trusting whatever random widget shows up in search results. It runs entirely in the browser. There is no backend, no server-side log, and nothing gets uploaded — the toss happens locally and the result stays on your device.

What sets it apart from a basic `Math.random()` toy is the randomness source. TailsNow pulls from cryptographic randomness rather than a pseudo-random number generator, which makes the outcome meaningfully harder to predict. The page also keeps a live tally of heads and tails history statistics so you can sanity-check distribution over repeated flips, and there is a real flip animation that spins through heads and tails before settling. No app install is required and it works on any device with a modern browser.

You can try the [coin flip](https://tailsnow.com/) directly — just land on the page, click the coin or the flip button, and read the result once it settles.

Shortest possible usage:

```text
Click coin  ->  "Heads"
```

That is the whole loop. Click again for another outcome, as many times as you need. The [live tally](https://tailsnow.com/) updates alongside each toss so you can watch the running head/tail count in real time.

## Where to read more

Complete tutorials, worked examples and the full documentation live on the site: [TailsNow](https://tailsnow.com/)

## License

Source code is MIT-licensed. Website articles and descriptive content are NOT included in this license and remain copyrighted.
