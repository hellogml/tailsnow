# <a href="https://tailsnow.com/">TailsNow</a> — A browser-based coin toss driven by cryptographic randomness.

I built this as a lightweight utility for those recurring moments where you just need a perfectly fair binary outcome and don't want to reach for a physical coin. Whether it is settling a trivial decision or breaking a tie in a quick script test, having a reliable toss available in a browser tab is surprisingly convenient. The tool runs entirely on the client side. There is no backend processing and no data upload, so every flip stays local to your machine. The randomness does not rely on basic math functions; it uses cryptographic randomness to keep the heads or tails distribution genuinely unpredictable. You get a real flip animation, and the page maintains a live tally along with head and tail history statistics so you can verify the distribution yourself over repeated tosses.

The shortest way to use it is to simply open the page and trigger a toss. The interface is intentionally minimal: you click the coin or the flip button, watch the animation spin through heads and tails, and read the final result once the coin settles. You can flip again as many times as you need another outcome. If you are running repeated tests, the live tally keeps count automatically.

Here is what a single interaction looks like conceptually:

```text
Input:  click flip button
Output: Heads
```

The live history statistics update immediately after each toss, giving you a clean result without any extra configuration. You can try the <a href="https://tailsnow.com/">coin flip</a> directly in your browser without installing anything.

## Where to read more

Complete tutorials, worked examples and the full documentation live on the site: <a href="https://tailsnow.com/">TailsNow</a>

## License

Source code is MIT-licensed. Website articles and descriptive content are NOT included in this license and remain copyrighted.

