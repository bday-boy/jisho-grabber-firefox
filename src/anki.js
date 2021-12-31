// Anki deck data is initialized below
const engtojpn_front = `<span style=" font-size: 40px;">{{Meaning}}</span>`
const engtojpn_back = `{{FrontSide}}

<hr id=answer>
<span style="font-size: 75px; font-family: Mincho;">{{furigana:Word}}</span><br />

<span style="font-size: 22px; ">Part(s) of speech: {{Parts of speech}}<br></span>
<span style="font-size: 22px; ">JLPT Level: {{JLPT Level}}<br></span>
<span style="font-size: 22px; color: rgb(0,200,0)">{{Common word}}</span>
<span><a  href="http://jisho.org/word/{{kanji:Word}}">Jisho reference</a></span>`;

const jpntoeng_front = `<span style=" font-size: 75px; font-family: Mincho;">{{kanji:Word}}</span>`;
const jpntoeng_back = `<span style=" font-size: 75px; font-family: Mincho;">{{furigana:Word}}</span>

<hr id=answer>
<span style="font-size: 40px;">{{Meaning}}</span><br /><br>

<span style="font-size: 22px; ">Part(s) of speech: {{Parts of speech}}<br></span>
<span style="font-size: 22px; ">JLPT Level: {{JLPT Level}}<br></span>
<span style="font-size: 22px; color: rgb(0,200,0);">{{Common word}}</span>
<span><a  href="http://jisho.org/word/{{kanji:Word}}">Jisho reference</a></span>`;

const CSS = `.card {
    font-family: Arial;
    font-size: 20px;
    text-align: center;
    color: black;
    background-color: white;
}

.reading {
    text-align: left;
}`;

let jisho_vocab = {
    name: "Jisho Search Vocab",
    id: "1608179351",
    flds: [
        { name: 'Word' },
        { name: 'Meaning' },
        { name: 'Parts of speech' },
        { name: 'JLPT Level' },
        { name: 'Common word' }
    ]
};