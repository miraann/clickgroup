# Click Group brand promo (Kurdish Sorani)

A 56-second Facebook video: hook → logo → 4 services → real projects (website, booking system, restaurant POS, mobile apps) → numbers → contact.
The finished videos go to `../ClickGroup-Brand-9x16.mp4` (Reels/Stories) and `../ClickGroup-Brand-4x5.mp4` (feed).

`promo.html` is the whole video: every frame is drawn by `seek(t)`, and `render.mjs` screenshots it frame by frame in headless Chrome.
Kurdish text uses `app/public/font/ku.otf`.

## Re-render

```sh
npm install
npm run prep          # copy logos + screenshots from F:/amnasuraka and F:/zhewar, build icons.js and the QR code
npm run render:916    # 9:16 → ../ClickGroup-Brand-9x16.mp4
npm run render:45     # 4:5  → ../ClickGroup-Brand-4x5.mp4
```

Needs Node, Python with numpy + Pillow, and Chrome at the default path (or set `CHROME_PATH`).

## Editing

- Text: search for the Kurdish line in `promo.html`; long lines shrink automatically to fit.
- Preview in Chrome: `promo.html?play` (loops), `promo.html?t=31.5` (one frame), add `&f=45` for the feed cut.
- Check frames without a full render: `node render.mjs stills 5,15.5,52 916`, then `python sheet.py stills-916 sheet.png`.
- Timing: scene starts are in `T`; they sit on the 2-second bars of the soundtrack (`gen_audio.py`), so move them in 2 s steps.

## Notes

- Client names are never shown, only their logos. `prep_assets.py` erases the museum name from the screenshot headers.
- `ku.otf` draws 0–9 as Kurdish numerals, so ASCII digits fall back to Segoe UI (that's how the phone number shows as +964 770 146 6787). Use `KD()` for Kurdish numerals.
- Music and sound effects are synthesized by `gen_audio.py`, so there's nothing to license.
