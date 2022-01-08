# jisho-grabber-firefox
A Firefox add-on version of my other library, jisho-grabber. This add-on allows the user to
select a definition within the Jisho webpage directly.

*This program and its author are not affiliated with the main Anki project or Jisho.org in any*
*way.*

## Dependencies
In order for this program to send Anki notes to your Anki client, you must
install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) and have Anki
running in the background when trying to send notes from your browser.
Additionally, you must be using a browser that has ECMAScript 6 support (most,
if not all up-to-date, modern browsers do).

## What it does
- Adds a context menu (right-click menu) item for searching highlighted text on
  Jisho.org. Upon click, it opens a new webpage on Jisho.org searching the
  highlighted text.
- On Jisho.org, word meanings will now be highlighted by a green bounding box
  and the cursor will change to a crosshair. Upon clicking a definition, that
  definition, the Japanese word, its reading, the definition's tags (する verb,
  な-adjective, noun, etc.), and the Japanese word's tags (common word, jlpt
  level, wanikani level) will be saved to local storage.
- In order to send saved Jisho data to Anki, one must open the Jisho Grabber
  home page by clicking on the <img src="./icons/jisho-grabber.svg" width="12" height="12"/> icon in the toolbar and pressing the button. Once on the home
  page, there will (eventually, though not currently) be a way of sending notes
  over to Anki.
