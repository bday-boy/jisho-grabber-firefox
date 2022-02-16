# jisho-grabber-firefox
A Firefox add-on version of my other library, jisho-grabber. This add-on allows
the user to
select a definition within the Jisho webpage directly.  
*This program and its author are not affiliated with the main Anki project or*
*Jisho.org in any way.*

## Dependencies
In order for this program to send Anki notes to your Anki client, you must
install the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on
into your Anki and have Anki running in the background when trying to send
notes from your browser.  
IMPORTANT:  
~~Since user Anki settings are hard-coded right now, in order to use this
extension at all, import the Jisho Grabber Test.apkg in default_deck. This will
create the proper note type as needed by the extension.~~ Update: I have
implemented user-configurable Anki settings, so this is no longer a requirement.
However, the Jisho Grabber Test.apkg Anki package does have a note type that
fits the data from my program very well, so it's still not a bad idea to have.

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
  toolbar and pressing the button. Once on the home page, you can connect to
  Anki via AnkiConnect and start sending notes over.

## Future functionality
As jisho-grabber-firefox is still in beta, it currently works, but much of my
code is still pretty sloppy and I have more future functionality planned. Some
of these future features are as follows:
- Primarily functionality-based features:
  - The "Add all notes" button actually works properly lmao. Right now, it DOES
    add all definitions to Anki as notes, but it doesn't update the buttons and
    it doesn't save the note IDs in local browser storage.
  - Rows from the table on the homepage will be able to be deleted.
  - The definition selector part of the program will be able to be turned off.
    least the most recent configuration will save automatically.
- Primarily visual features:
  - Better-looking buttons/animations and such

## Bugs
- When Jisho is scrolled in the y-direction and gets refreshed, all bounding
  boxes are offset by the amount that is scrolled. I'm sure this is a super
  easy fix, but it's pretty low-priority for me rn, so I don't really care.
  - **Update:** Fixed for now. Client bounding boxes have all kinds of BS going on
    but it seems like this is working as should be. Turns out I was adding both
    scrollY and document.body.getBoundingClientRect().top to the rectangle's y
    coordinate, but only the latter is needed.
- When a sentence is searched on Jisho and the user switches between meanings
  of words in the sentence, definitions will not be selectable. I think this
  happens because definitions are given highlighting events on page load, and
  switching between meanings in a sentence doesn't reload the page.

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