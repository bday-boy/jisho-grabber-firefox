# jisho-grabber-firefox
A Firefox add-on version of my other library, jisho-grabber. This add-on allows
the user to
select a definition within the Jisho webpage directly.  
*This program and its author are not affiliated with the main Anki project or*
*Jisho.org in any way.*

## Dependencies
In order for this program to send Anki notes to your Anki client, you must
install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) and have Anki
running in the background when trying to send notes from your browser.
Additionally, you must be using a browser that has ECMAScript 6 support (most,
if not all, up-to-date, modern browsers do).  
IMPORTANT:  
Since user Anki settings are hard-coded right now, in order to use this
extension at all, import the Jisho Grabber Test.apkg in default_deck. This will
create the proper note type as needed by the extension.

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
  home page by clicking on the
  <img src="./icons/jisho-grabber.svg" width="12" height="12"/> icon in the
  toolbar and pressing the button. Once on the home page, there is a way of
  sending notes over to Anki.

## Future functionality
As jisho-grabber-firefox is still in beta, it currently works, but much of my
code is still pretty sloppy and I have more future functionality planned. Some
of these future features are as follows:
- Primarily functionality-based features:
  - The "Add all notes" button actually works properly lmao. Right now, it DOES
    add all definitions to Anki as notes, but it doesn't update the buttons and
    it doesn't save the note IDs in local browser storage.
  - The extension's local browser storage will be synced (upon opening the
    extension homepage) with Anki. This feature will actually probably be
    available pretty soon as I doubt it'll be that difficult to implement. This
    means if you change the definition and such of a note in Anki, it will be
    changed in local storage.
  - Rows from the table on the homepage will be able to be deleted.
  - Anki deck, model, and fields will be customizable. Right now, I have them
    hard-coded in because I just wanted to test program functionality.
  - Maybe sometime in the far future, other Anki options will be customizable.
    Right now, I have them set up in a way that makes sense for the program.
    The most important of hard-coded options being that you CAN make duplicate
    cards, which is an important feature because the word "掛ける" has 25
    meanings listed on Jisho, so unless you want to shove all of those on one
    card, it makes more sense for duplicates to be allowed.
  - The definition selector part of the program will be able to be turned off.
- Primarily visual features:
  - A new dropdown/popup will be available to help the user select Anki deck,
    model, and fields.
  - Better-looking buttons/animations and such

## Notes for nerds
I really like thorough documentation, so I'm going to use this area to dump
information about this program that is important to my implementation, both
for myself and for anyone who wants to know how it works.  
Important:
- Objects are stored in local storage by concatenating a Japanese word and its
  English meaning together and then md5 hashing that. For example, if you have
  a Japanese word with expression "掛ける" and English meaning "to make (a 
  call)", then the object with that information is stored in the database by
  md5 hashing the string "掛けるto make (a call)". For now, this system works
  great and allows duplicates very nicely, but I'm sure this will be a pain in
  the ass when I decide to implement Anki syncing and allowing the user to
  change the definition on the Anki side.