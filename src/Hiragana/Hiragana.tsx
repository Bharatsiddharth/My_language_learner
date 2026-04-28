import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

// Script types
interface Script {
  id: string;
  label: string;
  labelJP: string;
  color: string;
  colorDim: string;
  enabled: boolean;
}

// Hiragana word types
type WordCategory = "noun" | "verb" | "adj" | "phrase";
type WordType = "base" | "daku" | "handa" | "combo" | "long";

interface HiraganaWord {
  jp: string;
  r: string;
  p: string;
  e: string;
  c: WordCategory;
  type: WordType;
  note?: string;
}

// Kana character types
interface KanaChar {
  k: string;
  r: string;
  s: string;
}

interface KanaData {
  base: KanaChar[];
  daku: KanaChar[];
  handa: KanaChar[];
  combo: KanaChar[];
}

// Category types
interface Category {
  id: string;
  label: string;
}

interface TypeMeta {
  label: string;
  badge: string;
}

interface CatMeta {
  badge: string;
}

interface RefSection {
  id: string;
  title: string;
}

interface ScriptData {
  words: HiraganaWord[];
  kana: KanaData;
  categories: Category[];
  typeMeta: Record<string, TypeMeta>;
  catMeta: Record<string, CatMeta>;
  refSections: RefSection[];
}

// Badge colors type
interface BadgeColor {
  bg: string;
  color: string;
}

type BadgeColorMap = Record<string, BadgeColor>;

// Tab types
type TabId = "overview" | "words" | "flash" | "quiz" | "ref";

interface Tab {
  id: TabId;
  label: string;
}

// Quiz mode types
type QuizMode = "jp" | "en" | "rom";

interface QuizModeOption {
  id: QuizMode;
  label: string;
}

// ============================================================
// SCRIPT REGISTRY — add Katakana / Kanji scripts here later
// ============================================================
const SCRIPTS: Record<string, Script> = {
  hiragana: {
    id: "hiragana",
    label: "Hiragana",
    labelJP: "ひらがな",
    color: "#7c9eff",
    colorDim: "#1a2547",
    enabled: true,
  },
  katakana: {
    id: "katakana",
    label: "Katakana",
    labelJP: "カタカナ",
    color: "#f472b6",
    colorDim: "#2d1020",
    enabled: false,
  },
  kanji: {
    id: "kanji",
    label: "Kanji",
    labelJP: "漢字",
    color: "#fbbf24",
    colorDim: "#2a1f00",
    enabled: false,
  },
};

// ============================================================
// HIRAGANA DATA
// ============================================================
const HIRAGANA_WORDS: HiraganaWord[] = [
  // BASE
  { jp: "いぬ", r: "inu", p: "ee-noo", e: "dog", c: "noun", type: "base" },
  { jp: "ねこ", r: "neko", p: "neh-ko", e: "cat", c: "noun", type: "base" },
  { jp: "さかな", r: "sakana", p: "sah-kah-nah", e: "fish", c: "noun", type: "base" },
  { jp: "はな", r: "hana", p: "hah-nah", e: "flower / nose", c: "noun", type: "base" },
  { jp: "みず", r: "mizu", p: "mee-zoo", e: "water", c: "noun", type: "base" },
  { jp: "そら", r: "sora", p: "so-rah", e: "sky", c: "noun", type: "base" },
  { jp: "やま", r: "yama", p: "yah-mah", e: "mountain", c: "noun", type: "base" },
  { jp: "かわ", r: "kawa", p: "kah-wah", e: "river", c: "noun", type: "base" },
  { jp: "うみ", r: "umi", p: "oo-mee", e: "sea / ocean", c: "noun", type: "base" },
  { jp: "き", r: "ki", p: "kee", e: "tree", c: "noun", type: "base" },
  { jp: "かお", r: "kao", p: "kah-oh", e: "face", c: "noun", type: "base" },
  { jp: "て", r: "te", p: "teh", e: "hand", c: "noun", type: "base" },
  { jp: "め", r: "me", p: "meh", e: "eye", c: "noun", type: "base" },
  { jp: "みみ", r: "mimi", p: "mee-mee", e: "ear", c: "noun", type: "base" },
  { jp: "くち", r: "kuchi", p: "koo-chee", e: "mouth", c: "noun", type: "base" },
  { jp: "あし", r: "ashi", p: "ah-shee", e: "foot / leg", c: "noun", type: "base" },
  { jp: "あたま", r: "atama", p: "ah-tah-mah", e: "head", c: "noun", type: "base" },
  { jp: "ほん", r: "hon", p: "hon", e: "book", c: "noun", type: "base" },
  { jp: "えんぴつ", r: "enpitsu", p: "en-pee-tsoo", e: "pencil", c: "noun", type: "base" },
  { jp: "つくえ", r: "tsukue", p: "tsoo-koo-eh", e: "desk", c: "noun", type: "base" },
  { jp: "いす", r: "isu", p: "ee-soo", e: "chair", c: "noun", type: "base" },
  { jp: "かばん", r: "kaban", p: "kah-ban", e: "bag", c: "noun", type: "base" },
  { jp: "とけい", r: "tokei", p: "toh-keh-ee", e: "clock / watch", c: "noun", type: "base" },
  { jp: "でんわ", r: "denwa", p: "den-wah", e: "telephone", c: "noun", type: "base" },
  { jp: "くるま", r: "kuruma", p: "koo-roo-mah", e: "car", c: "noun", type: "base" },
  { jp: "みせ", r: "mise", p: "mee-seh", e: "shop / store", c: "noun", type: "base" },
  { jp: "がっこう", r: "gakkou", p: "gak-koh", e: "school", c: "noun", type: "base" },
  { jp: "たべる", r: "taberu", p: "tah-beh-roo", e: "to eat", c: "verb", type: "base" },
  { jp: "のむ", r: "nomu", p: "noh-moo", e: "to drink", c: "verb", type: "base" },
  { jp: "みる", r: "miru", p: "mee-roo", e: "to see / watch", c: "verb", type: "base" },
  { jp: "きく", r: "kiku", p: "kee-koo", e: "to listen", c: "verb", type: "base" },
  { jp: "はなす", r: "hanasu", p: "hah-nah-soo", e: "to speak", c: "verb", type: "base" },
  { jp: "かく", r: "kaku", p: "kah-koo", e: "to write", c: "verb", type: "base" },
  { jp: "よむ", r: "yomu", p: "yoh-moo", e: "to read", c: "verb", type: "base" },
  { jp: "いく", r: "iku", p: "ee-koo", e: "to go", c: "verb", type: "base" },
  { jp: "くる", r: "kuru", p: "koo-roo", e: "to come", c: "verb", type: "base" },
  { jp: "かえる", r: "kaeru", p: "kah-eh-roo", e: "to return home", c: "verb", type: "base" },
  { jp: "ねる", r: "neru", p: "neh-roo", e: "to sleep", c: "verb", type: "base" },
  { jp: "おきる", r: "okiru", p: "oh-kee-roo", e: "to wake up", c: "verb", type: "base" },
  { jp: "かう", r: "kau", p: "kah-oo", e: "to buy", c: "verb", type: "base" },
  { jp: "する", r: "suru", p: "soo-roo", e: "to do", c: "verb", type: "base" },
  { jp: "おおきい", r: "ookii", p: "oh-kee", e: "big / large", c: "adj", type: "base" },
  { jp: "ちいさい", r: "chiisai", p: "chee-sah-ee", e: "small / little", c: "adj", type: "base" },
  { jp: "あたらしい", r: "atarashii", p: "ah-tah-rah-shee", e: "new", c: "adj", type: "base" },
  { jp: "ふるい", r: "furui", p: "foo-roo-ee", e: "old (object)", c: "adj", type: "base" },
  { jp: "たかい", r: "takai", p: "tah-kah-ee", e: "expensive / tall", c: "adj", type: "base" },
  { jp: "やすい", r: "yasui", p: "yah-soo-ee", e: "cheap / easy", c: "adj", type: "base" },
  { jp: "おいしい", r: "oishii", p: "oh-ee-shee", e: "delicious", c: "adj", type: "base" },
  { jp: "あつい", r: "atsui", p: "ah-tsoo-ee", e: "hot", c: "adj", type: "base" },
  { jp: "きれい", r: "kirei", p: "kee-reh-ee", e: "pretty / clean", c: "adj", type: "base" },
  { jp: "おはよう", r: "ohayou", p: "oh-hah-yoh", e: "good morning", c: "phrase", type: "base" },
  { jp: "ありがとう", r: "arigatou", p: "ah-ree-gah-toh", e: "thank you", c: "phrase", type: "base" },
  { jp: "すみません", r: "sumimasen", p: "soo-mee-mah-sen", e: "excuse me / sorry", c: "phrase", type: "base" },
  { jp: "はい", r: "hai", p: "hah-ee", e: "yes", c: "phrase", type: "base" },
  { jp: "いいえ", r: "iie", p: "ee-eh", e: "no", c: "phrase", type: "base" },
  { jp: "わかります", r: "wakarimasu", p: "wah-kah-ree-mah-soo", e: "I understand", c: "phrase", type: "base" },
  { jp: "でんしゃ", r: "densha", p: "den-shah", e: "train", c: "noun", type: "base" },
  { jp: "つめたい", r: "tsumetai", p: "tsoo-meh-tah-ee", e: "cold (touch)", c: "adj", type: "base" },
  { jp: "くさ", r: "kusa", p: "koo-sah", e: "grass", c: "noun", type: "base" },
  // DAKUTEN
  { jp: "ごはん", r: "gohan", p: "go-han", e: "rice / meal", c: "noun", type: "daku", note: "が row: g sound" },
  { jp: "がくせい", r: "gakusei", p: "gah-koo-seh-ee", e: "student", c: "noun", type: "daku", note: "が row: g sound" },
  { jp: "ざっし", r: "zasshi", p: "zas-shee", e: "magazine", c: "noun", type: "daku", note: "ざ row: z sound" },
  { jp: "だいがく", r: "daigaku", p: "dah-ee-gah-koo", e: "university", c: "noun", type: "daku", note: "だ row: d sound" },
  { jp: "どうぞ", r: "douzo", p: "doh-zo", e: "please (go ahead)", c: "phrase", type: "daku", note: "ど: d sound" },
  { jp: "どこ", r: "doko", p: "doh-ko", e: "where", c: "phrase", type: "daku", note: "ど: d sound" },
  { jp: "だれ", r: "dare", p: "dah-reh", e: "who", c: "phrase", type: "daku", note: "だ: d sound" },
  { jp: "ばす", r: "basu", p: "bah-soo", e: "bus", c: "noun", type: "daku", note: "ば row: b sound" },
  { jp: "べんきょう", r: "benkyou", p: "ben-kyoh", e: "studying", c: "noun", type: "daku", note: "べ: b sound" },
  { jp: "ぼうし", r: "boushi", p: "boh-shee", e: "hat / cap", c: "noun", type: "daku", note: "ぼ: b sound" },
  { jp: "かぞく", r: "kazoku", p: "kah-zo-koo", e: "family", c: "noun", type: "daku", note: "ぞ: z sound" },
  { jp: "げんき", r: "genki", p: "gen-kee", e: "healthy / energetic", c: "adj", type: "daku", note: "げ: g sound" },
  { jp: "でる", r: "deru", p: "deh-roo", e: "to go out / exit", c: "verb", type: "daku", note: "で: d sound" },
  { jp: "よぶ", r: "yobu", p: "yoh-boo", e: "to call / invite", c: "verb", type: "daku", note: "ぶ: b sound" },
  { jp: "ぬぐ", r: "nugu", p: "noo-goo", e: "to take off (clothes)", c: "verb", type: "daku", note: "ぐ: g sound" },
  // HANDAKUTEN
  { jp: "ぱん", r: "pan", p: "pan", e: "bread", c: "noun", type: "handa", note: "ぱ: p sound (handakuten)" },
  { jp: "ぴかぴか", r: "pikapika", p: "pee-kah-pee-kah", e: "shiny / sparkly", c: "adj", type: "handa", note: "ぴ: p sound" },
  { jp: "てんぷら", r: "tenpura", p: "ten-poo-rah", e: "tempura", c: "noun", type: "handa", note: "ぷ: p sound" },
  { jp: "えんぴつ", r: "enpitsu", p: "en-pee-tsoo", e: "pencil", c: "noun", type: "handa", note: "ぴ: p sound" },
  { jp: "きっぷ", r: "kippu", p: "kip-poo", e: "ticket", c: "noun", type: "handa", note: "ぷ: p + small っ pause" },
  // COMBO
  { jp: "きょう", r: "kyou", p: "kyoh", e: "today", c: "noun", type: "combo", note: "きょ = kyo (one sound)" },
  { jp: "きょねん", r: "kyonen", p: "kyoh-nen", e: "last year", c: "noun", type: "combo", note: "きょ = kyo" },
  { jp: "しゅくだい", r: "shukudai", p: "shoo-koo-dah-ee", e: "homework", c: "noun", type: "combo", note: "しゅ = shu" },
  { jp: "しゃしん", r: "shashin", p: "shah-sheen", e: "photograph", c: "noun", type: "combo", note: "しゃ = sha" },
  { jp: "じしょ", r: "jisho", p: "jee-sho", e: "dictionary", c: "noun", type: "combo", note: "じょ = jo" },
  { jp: "ちょっと", r: "chotto", p: "chot-to", e: "a little / just a moment", c: "phrase", type: "combo", note: "ちょ = cho + small っ" },
  { jp: "ちゃわん", r: "chawan", p: "chah-wan", e: "rice bowl", c: "noun", type: "combo", note: "ちゃ = cha" },
  { jp: "にゅうがく", r: "nyuugaku", p: "nyoo-gah-koo", e: "school enrollment", c: "noun", type: "combo", note: "にゅ = nyu" },
  { jp: "びょういん", r: "byouin", p: "byoh-een", e: "hospital", c: "noun", type: "combo", note: "びょ = byo" },
  { jp: "りょこう", r: "ryokou", p: "ryoh-koh", e: "travel / trip", c: "noun", type: "combo", note: "りょ = ryo" },
  { jp: "りょうり", r: "ryouri", p: "ryoh-ree", e: "cooking / cuisine", c: "noun", type: "combo", note: "りょ = ryo" },
  { jp: "ひゃく", r: "hyaku", p: "hyah-koo", e: "one hundred", c: "noun", type: "combo", note: "ひゃ = hya" },
  { jp: "じゅぎょう", r: "jugyou", p: "joo-gyoh", e: "class / lesson", c: "noun", type: "combo", note: "じゅ = ju" },
  { jp: "ぎゅうにゅう", r: "gyuunyuu", p: "gyoo-nyoo", e: "milk", c: "noun", type: "combo", note: "ぎゅ = gyu, にゅ = nyu" },
  { jp: "きゃく", r: "kyaku", p: "kyah-koo", e: "guest / customer", c: "noun", type: "combo", note: "きゃ = kya" },
  // LONG VOWEL / っ
  { jp: "おかあさん", r: "okaasan", p: "oh-KAA-san", e: "mother", c: "noun", type: "long", note: "ああ = long 'a' — hold 2 beats" },
  { jp: "おとうさん", r: "otousan", p: "oh-TOH-san", e: "father", c: "noun", type: "long", note: "おう = long 'o' sound" },
  { jp: "おにいさん", r: "oniisan", p: "oh-NEE-san", e: "older brother", c: "noun", type: "long", note: "いい = long 'i' — hold 2 beats" },
  { jp: "おねえさん", r: "oneesan", p: "oh-NEH-san", e: "older sister", c: "noun", type: "long", note: "ねえ = long 'e' sound" },
  { jp: "くうき", r: "kuuki", p: "KOO-kee", e: "air / atmosphere", c: "noun", type: "long", note: "うう = long 'u' — hold 2 beats" },
  { jp: "とうきょう", r: "toukyou", p: "TOH-kyoh", e: "Tokyo", c: "noun", type: "long", note: "おう twice = long 'o'" },
  { jp: "おおきい", r: "ookii", p: "OH-kee", e: "big / large", c: "adj", type: "long", note: "おお = long 'o' at start" },
  { jp: "きって", r: "kitte", p: "kit-teh", e: "stamp (postal)", c: "noun", type: "long", note: "small っ = pause before 't'" },
  { jp: "ざっし", r: "zasshi", p: "zas-shee", e: "magazine", c: "noun", type: "long", note: "small っ = pause before 'sh'" },
  { jp: "きっぷ", r: "kippu", p: "kip-poo", e: "ticket", c: "noun", type: "long", note: "small っ = pause before 'p'" },
  { jp: "もっと", r: "motto", p: "mot-to", e: "more", c: "phrase", type: "long", note: "small っ = pause before 't'" },
  { jp: "ちょっと", r: "chotto", p: "chot-to", e: "a little", c: "phrase", type: "long", note: "small っ = pause before 't'" },
];

const HIRAGANA_KANA: KanaData = {
  base: [
    { k: "あ", r: "a", s: "ah" }, { k: "い", r: "i", s: "ee" }, { k: "う", r: "u", s: "oo" }, { k: "え", r: "e", s: "eh" }, { k: "お", r: "o", s: "oh" },
    { k: "か", r: "ka", s: "kah" }, { k: "き", r: "ki", s: "kee" }, { k: "く", r: "ku", s: "koo" }, { k: "け", r: "ke", s: "keh" }, { k: "こ", r: "ko", s: "koh" },
    { k: "さ", r: "sa", s: "sah" }, { k: "し", r: "shi", s: "shee" }, { k: "す", r: "su", s: "soo" }, { k: "せ", r: "se", s: "seh" }, { k: "そ", r: "so", s: "soh" },
    { k: "た", r: "ta", s: "tah" }, { k: "ち", r: "chi", s: "chee" }, { k: "つ", r: "tsu", s: "tsoo" }, { k: "て", r: "te", s: "teh" }, { k: "と", r: "to", s: "toh" },
    { k: "な", r: "na", s: "nah" }, { k: "に", r: "ni", s: "nee" }, { k: "ぬ", r: "nu", s: "noo" }, { k: "ね", r: "ne", s: "neh" }, { k: "の", r: "no", s: "noh" },
    { k: "は", r: "ha", s: "hah" }, { k: "ひ", r: "hi", s: "hee" }, { k: "ふ", r: "fu", s: "foo" }, { k: "へ", r: "he", s: "heh" }, { k: "ほ", r: "ho", s: "hoh" },
    { k: "ま", r: "ma", s: "mah" }, { k: "み", r: "mi", s: "mee" }, { k: "む", r: "mu", s: "moo" }, { k: "め", r: "me", s: "meh" }, { k: "も", r: "mo", s: "moh" },
    { k: "や", r: "ya", s: "yah" }, { k: "ゆ", r: "yu", s: "yoo" }, { k: "よ", r: "yo", s: "yoh" },
    { k: "ら", r: "ra", s: "rah" }, { k: "り", r: "ri", s: "ree" }, { k: "る", r: "ru", s: "roo" }, { k: "れ", r: "re", s: "reh" }, { k: "ろ", r: "ro", s: "roh" },
    { k: "わ", r: "wa", s: "wah" }, { k: "を", r: "wo", s: "oh (particle)" }, { k: "ん", r: "n", s: "n/m" },
  ],
  daku: [
    { k: "が", r: "ga", s: "gah" }, { k: "ぎ", r: "gi", s: "gee" }, { k: "ぐ", r: "gu", s: "goo" }, { k: "げ", r: "ge", s: "geh" }, { k: "ご", r: "go", s: "goh" },
    { k: "ざ", r: "za", s: "zah" }, { k: "じ", r: "ji", s: "jee" }, { k: "ず", r: "zu", s: "zoo" }, { k: "ぜ", r: "ze", s: "zeh" }, { k: "ぞ", r: "zo", s: "zoh" },
    { k: "だ", r: "da", s: "dah" }, { k: "ぢ", r: "ji", s: "jee" }, { k: "づ", r: "zu", s: "zoo" }, { k: "で", r: "de", s: "deh" }, { k: "ど", r: "do", s: "doh" },
    { k: "ば", r: "ba", s: "bah" }, { k: "び", r: "bi", s: "bee" }, { k: "ぶ", r: "bu", s: "boo" }, { k: "べ", r: "be", s: "beh" }, { k: "ぼ", r: "bo", s: "boh" },
  ],
  handa: [
    { k: "ぱ", r: "pa", s: "pah" }, { k: "ぴ", r: "pi", s: "pee" }, { k: "ぷ", r: "pu", s: "poo" }, { k: "ぺ", r: "pe", s: "peh" }, { k: "ぽ", r: "po", s: "poh" },
  ],
  combo: [
    { k: "きゃ", r: "kya", s: "kyah" }, { k: "きゅ", r: "kyu", s: "kyoo" }, { k: "きょ", r: "kyo", s: "kyoh" },
    { k: "しゃ", r: "sha", s: "shah" }, { k: "しゅ", r: "shu", s: "shoo" }, { k: "しょ", r: "sho", s: "shoh" },
    { k: "ちゃ", r: "cha", s: "chah" }, { k: "ちゅ", r: "chu", s: "choo" }, { k: "ちょ", r: "cho", s: "choh" },
    { k: "にゃ", r: "nya", s: "nyah" }, { k: "にゅ", r: "nyu", s: "nyoo" }, { k: "にょ", r: "nyo", s: "nyoh" },
    { k: "ひゃ", r: "hya", s: "hyah" }, { k: "ひゅ", r: "hyu", s: "hyoo" }, { k: "ひょ", r: "hyo", s: "hyoh" },
    { k: "みゃ", r: "mya", s: "myah" }, { k: "みゅ", r: "myu", s: "myoo" }, { k: "みょ", r: "myo", s: "myoh" },
    { k: "りゃ", r: "rya", s: "ryah" }, { k: "りゅ", r: "ryu", s: "ryoo" }, { k: "りょ", r: "ryo", s: "ryoh" },
    { k: "ぎゃ", r: "gya", s: "gyah" }, { k: "ぎゅ", r: "gyu", s: "gyoo" }, { k: "ぎょ", r: "gyo", s: "gyoh" },
    { k: "じゃ", r: "ja", s: "jah" }, { k: "じゅ", r: "ju", s: "joo" }, { k: "じょ", r: "jo", s: "joh" },
    { k: "びゃ", r: "bya", s: "byah" }, { k: "びゅ", r: "byu", s: "byoo" }, { k: "びょ", r: "byo", s: "byoh" },
    { k: "ぴゃ", r: "pya", s: "pyah" }, { k: "ぴゅ", r: "pyu", s: "pyoo" }, { k: "ぴょ", r: "pyo", s: "pyoh" },
  ],
};

// Script data registry
const SCRIPT_DATA: Record<string, ScriptData> = {
  hiragana: {
    words: HIRAGANA_WORDS,
    kana: HIRAGANA_KANA,
    categories: [
      { id: "all", label: "All" },
      { id: "noun", label: "Nouns" },
      { id: "verb", label: "Verbs" },
      { id: "adj", label: "Adjectives" },
      { id: "phrase", label: "Phrases" },
      { id: "daku", label: "Dakuten (が ざ だ ば)" },
      { id: "handa", label: "Handakuten (ぱ)" },
      { id: "combo", label: "Combinations (きゃ)" },
      { id: "long", label: "Long vowels / っ" },
    ],
    typeMeta: {
      base: { label: "", badge: "base" },
      daku: { label: "dakuten", badge: "daku" },
      handa: { label: "handakuten", badge: "handa" },
      combo: { label: "combo", badge: "combo" },
      long: { label: "long / っ", badge: "long" },
    },
    catMeta: {
      noun: { badge: "noun" },
      verb: { badge: "verb" },
      adj: { badge: "adj" },
      phrase: { badge: "phrase" },
    },
    refSections: [
      { id: "base", title: "Base hiragana (46)" },
      { id: "daku", title: "Dakuten — voiced sounds (20)" },
      { id: "handa", title: "Handakuten — p-sounds (5)" },
      { id: "combo", title: "Combination characters (33)" },
    ],
  },
};

// ============================================================
// STYLE CONSTANTS
// ============================================================
const BADGE_COLORS: BadgeColorMap = {
  noun: { bg: "#0d1a3a", color: "#7c9eff" },
  verb: { bg: "#1a1200", color: "#fbbf24" },
  adj: { bg: "#1a0d1a", color: "#f472b6" },
  phrase: { bg: "#0d1a14", color: "#4ade80" },
  daku: { bg: "#1a0d0d", color: "#f87171" },
  handa: { bg: "#1a0d0d", color: "#f87171" },
  combo: { bg: "#0d1a1a", color: "#2dd4bf" },
  long: { bg: "#1a1500", color: "#fbbf24" },
  base: { bg: "transparent", color: "transparent" },
};

// ============================================================
// UTILITY HOOKS & HELPERS
// ============================================================
function useLocalStorage<T>(key: string, defaultVal: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  });
  
  const set = useCallback((v: T) => {
    setVal(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  
  return [val, set];
}

function filterWords(words: HiraganaWord[], catId: string): HiraganaWord[] {
  if (catId === "all") return words;
  if (["daku", "handa", "combo", "long"].includes(catId)) {
    return words.filter(w => w.type === catId);
  }
  return words.filter(w => w.c === catId);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// --- Badge Component ---
interface BadgeProps {
  type: string;
  label?: string;
}

const Badge: FC<BadgeProps> = ({ type, label }) => {
  const colors = BADGE_COLORS[type] || BADGE_COLORS.noun;
  if (!label) return null;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99, display: "inline-block",
      fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
      background: colors.bg, color: colors.color, border: `1px solid ${colors.color}33`,
    }}>{label}</span>
  );
};

// --- Progress Bar Component ---
interface ProgressBarProps {
  pct: number;
  color?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({ pct, color = "#7c9eff" }) => {
  return (
    <div style={{ height: 3, background: "#2a2d38", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  );
};

// ============================================================
// PAGE: OVERVIEW
// ============================================================
interface PageOverviewProps {
  scriptId: string;
  onNavigate: (tab: TabId) => void;
}

const PageOverview = ({ scriptId }: PageOverviewProps) => {
  const data = SCRIPT_DATA[scriptId];
  const words = data.words;
  const stats = [
    { n: words.length + "+", l: "total words" },
    { n: "104", l: "hiragana sounds" },
    { n: "4", l: "practice modes" },
    { n: "N5", l: "exam ready" },
  ];
  const rules = [
    { title: "Base hiragana (46)", body: "All vowels, k, s, t, n, h, m, y, r, w rows plus ん. The foundation of every Japanese word.", ex: "あいうえお か き く" },
    { title: "Dakuten — voiced sounds (20)", body: "Two dots (゛) change k→g, s→z, t→d, h→b. Same shape, entirely new sound.", ex: "が ざ だ ば", rom: "ga · za · da · ba" },
    { title: "Handakuten — p-sounds (5)", body: "A small circle (゜) on the h-row changes h→p. Only 5 characters: ぱぴぷぺぽ.", ex: "ぱ ぴ ぷ ぺ ぽ", rom: "pa · pi · pu · pe · po" },
    { title: "Combination characters (33)", body: "A large kana + small や/ゆ/よ = one blended sound. Extremely common in N5 vocabulary.", ex: "きゃ しゅ ちょ", rom: "kya · shu · cho" },
    { title: "Long vowels", body: "When the same vowel appears twice, hold it for two beats. おかあさん = o-ka-a-sa-n (5 beats, not 4).", ex: "おかあさん おにいさん", rom: "o-KAA-san · o-NII-san" },
    { title: "Small っ — double consonant", body: "A small っ creates a brief pause before the next consonant. きって = kit-te (2 t's).", ex: "きって ざっし", rom: "kit-te · zas-shi" },
  ];
  const steps = [
    { n: "01", text: "Browse the Word List by category. Read each word and try to sound it out before looking at the romaji." },
    { n: "02", text: "Use Flashcards to build recognition speed. Hide the romaji and test yourself before flipping." },
    { n: "03", text: "Take the Quiz daily. Try all 3 modes — especially English → Hiragana for the hardest challenge." },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 16, padding: "1.5rem 2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 40, color: "#7c9eff", lineHeight: 1.2, letterSpacing: "0.08em" }}>あ が きゃ<br />おかあさん</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 400, color: "#e8eaf2", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Complete Hiragana Practice</h1>
          <p style={{ fontSize: 13, color: "#7c8098", lineHeight: 1.6, maxWidth: 480 }}>All 46 base + 25 dakuten/handakuten + 33 combinations + long vowel rules. Everything you need to master hiragana for JLPT N5.</p>
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {stats.map(s => (
          <div key={s.l} style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: "#7c9eff", fontFamily: "'DM Mono', monospace" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "#7c8098", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Rule cards */}
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a4e63", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>What's covered</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
        {rules.map(r => (
          <div key={r.title} style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 14, padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#7c9eff", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{r.title}</div>
            <div style={{ fontSize: 12, color: "#7c8098", lineHeight: 1.7 }}>{r.body}</div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 18, color: "#2dd4bf", marginTop: 8 }}>{r.ex}</div>
            {r.rom && <div style={{ fontSize: 11, color: "#4a4e63", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{r.rom}</div>}
          </div>
        ))}
      </div>
      {/* How to study */}
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a4e63", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>How to study</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {steps.map(s => (
          <div key={s.n} style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 12, padding: "1rem" }}>
            <div style={{ fontSize: 22, fontFamily: "'DM Mono', monospace", color: "#7c9eff", marginBottom: 6 }}>{s.n}</div>
            <div style={{ fontSize: 12, color: "#7c8098", lineHeight: 1.7 }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// PAGE: WORD LIST
// ============================================================
interface PageWordsProps {
  scriptId: string;
}

const PageWords: FC<PageWordsProps> = ({ scriptId }) => {
  const data = SCRIPT_DATA[scriptId];
  const [cat, setCat] = useState<string>("all");
  const filtered = filterWords(data.words, cat);

  return (
    <div>
      {/* Category pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {data.categories.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: "5px 14px", borderRadius: 99, border: `1px solid ${cat === c.id ? "#7c9eff" : "#363a4a"}`,
            fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
            background: cat === c.id ? "#7c9eff" : "transparent",
            color: cat === c.id ? "#0a0c14" : "#7c8098", fontWeight: cat === c.id ? 600 : 400,
          }}>{c.label}</button>
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 10 }}>
        {filtered.map((w, i) => {
          const typeMeta = data.typeMeta[w.type];
          const catMeta = data.catMeta[w.c];
          return (
            <div key={i} style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 12, padding: "14px 16px", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#363a4a"; e.currentTarget.style.background = "#1e2029"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2d38"; e.currentTarget.style.background = "#16181f"; }}>
              <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 24, color: "#e8eaf2", fontWeight: 500 }}>{w.jp}</div>
              <div style={{ fontSize: 13, color: "#7c9eff", fontFamily: "'DM Mono', monospace", marginTop: 4, fontWeight: 500 }}>{w.r}</div>
              <div style={{ fontSize: 11, color: "#7c8098", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{w.p}</div>
              <div style={{ fontSize: 13, color: "#7c8098", marginTop: 8, paddingTop: 8, borderTop: "1px solid #2a2d38" }}>{w.e}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                {catMeta && <Badge type={catMeta.badge} label={w.c} />}
                {typeMeta?.label && <Badge type={typeMeta.badge} label={typeMeta.label} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// PAGE: FLASHCARDS
// ============================================================
type RomMode = "always" | "after" | "never";

interface PageFlashProps {
  scriptId: string;
}

const PageFlash: FC<PageFlashProps> = ({ scriptId }) => {
  const data = SCRIPT_DATA[scriptId];
  const [cat, setCat] = useState<string>("all");
  const [romMode, setRomMode] = useState<RomMode>("after");
  const [deck, setDeck] = useState<HiraganaWord[]>(() => [...data.words]);
  const [idx, setIdx] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  const initDeck = useCallback((c: string) => {
    setDeck(filterWords(data.words, c));
    setIdx(0);
    setFlipped(false);
  }, [data]);

  useEffect(() => { initDeck(cat); }, [cat, initDeck]);

  const w = deck[idx] || null;
  const pct = deck.length ? Math.round((idx + 1) / deck.length * 100) : 0;
  const showRom = romMode === "always" || (romMode === "after" && flipped);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "#7c8098", fontFamily: "'DM Mono', monospace" }}>Category:</label>
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ background: "#16181f", border: "1px solid #363a4a", color: "#e8eaf2", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
          {data.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <label style={{ fontSize: 12, color: "#7c8098", fontFamily: "'DM Mono', monospace", marginLeft: 8 }}>Romaji:</label>
        <select value={romMode} onChange={e => setRomMode(e.target.value as RomMode)} style={{ background: "#16181f", border: "1px solid #363a4a", color: "#e8eaf2", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
          <option value="after">After flip</option>
          <option value="always">Always</option>
          <option value="never">Never</option>
        </select>
        <button onClick={() => { setDeck(shuffle(deck)); setIdx(0); setFlipped(false); }}
          style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 9, border: "1px solid #363a4a", background: "transparent", color: "#e8eaf2", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
          ⇄ shuffle
        </button>
      </div>
      {/* Counter + progress */}
      <div style={{ fontSize: 12, color: "#7c8098", fontFamily: "'DM Mono', monospace", textAlign: "center", marginBottom: 6 }}>
        {deck.length ? `${idx + 1} / ${deck.length}` : "—"}
      </div>
      <div style={{ marginBottom: "1rem" }}><ProgressBar pct={pct} /></div>
      {/* Card */}
      {w ? (
        <div onClick={() => setFlipped(f => !f)} style={{
          background: flipped ? "#1e2029" : "#16181f",
          border: `1px solid ${flipped ? "#7c9eff" : "#2a2d38"}`,
          borderRadius: 20, padding: "3rem 2rem", textAlign: "center", cursor: "pointer",
          minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative", marginBottom: "1rem", transition: "border-color 0.2s, background 0.2s", userSelect: "none",
        }}>
          {/* Type badge */}
          {data.typeMeta[w.type]?.label && (
            <div style={{ position: "absolute", top: 14, left: 14 }}>
              <Badge type={data.typeMeta[w.type].badge} label={data.typeMeta[w.type].label} />
            </div>
          )}
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 64, color: "#e8eaf2", lineHeight: 1 }}>{w.jp}</div>
          {showRom && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: 22, color: "#7c9eff", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{w.r}</div>
              <div style={{ fontSize: 14, color: "#7c8098", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{w.p}</div>
              <div style={{ fontSize: 18, color: "#e8eaf2", marginTop: 12, fontFamily: "'Playfair Display', serif" }}>{w.e}</div>
              {w.note && (
                <div style={{ fontSize: 12, color: "#2dd4bf", fontFamily: "'DM Mono', monospace", marginTop: 10, padding: "6px 14px", background: "#0d1a1a", borderRadius: 8, border: "1px solid #1a3a3a" }}>{w.note}</div>
              )}
            </div>
          )}
          {!showRom && romMode === "never" && (
            <div style={{ fontSize: 12, color: "#4a4e63", fontFamily: "'DM Mono', monospace", marginTop: "1.5rem" }}>tap to reveal</div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#4a4e63", padding: "3rem", fontFamily: "'DM Mono', monospace" }}>No cards in this category.</div>
      )}
      {/* Nav */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => { setIdx(i => (i - 1 + deck.length) % deck.length); setFlipped(false); }}
          style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid #363a4a", background: "transparent", color: "#e8eaf2", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
          ← prev
        </button>
        <button onClick={() => { setIdx(i => (i + 1) % deck.length); setFlipped(false); }}
          style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid #7c9eff", background: "#7c9eff", color: "#0a0c14", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
          next →
        </button>
      </div>
    </div>
  );
};

// ============================================================
// PAGE: QUIZ
// ============================================================
interface PageQuizProps {
  scriptId: string;
}

interface Feedback {
  msg: string;
  ok: boolean | null;
}

const PageQuiz: FC<PageQuizProps> = ({ scriptId }) => {
  const data = SCRIPT_DATA[scriptId];
  const words = data.words;
  const MODES: QuizModeOption[] = [
    { id: "jp", label: "Hiragana → English" },
    { id: "en", label: "English → Hiragana" },
    { id: "rom", label: "Romaji → English" },
  ];
  const [mode, setMode] = useState<QuizMode>("jp");
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [fb, setFb] = useState<Feedback>({ msg: "", ok: null });
  const [current, setCurrent] = useState<HiraganaWord | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  const makeQuestion = useCallback(() => {
    const w = words[Math.floor(Math.random() * words.length)];
    const correct = mode === "en" ? w.jp : w.e;
    let options = [correct];
    while (options.length < 4) {
      const r = words[Math.floor(Math.random() * words.length)];
      const v = mode === "en" ? r.jp : r.e;
      if (!options.includes(v)) options.push(v);
    }
    options = shuffle(options);
    setCurrent(w);
    setOpts(options);
    setAnswered(false);
    setFb({ msg: "", ok: null });
    setChosen(null);
  }, [mode, words]);

  useEffect(() => { makeQuestion(); }, [mode, makeQuestion]);

  const answer = (opt: string): void => {
    if (answered || !current) return;
    const correct = mode === "en" ? current.jp : current.e;
    const ok = opt === correct;
    setAnswered(true);
    setChosen(opt);
    setTotal(t => t + 1);
    if (ok) { 
      setScore(s => s + 1); 
      setStreak(s => s + 1); 
      setFb({ msg: "Correct!", ok: true }); 
    } else { 
      setStreak(0); 
      setFb({ msg: `Incorrect — answer: ${correct}${current.note ? ` (${current.note})` : ""}`, ok: false }); 
    }
  };

  const switchMode = (m: QuizMode): void => {
    setMode(m); 
    setScore(0); 
    setTotal(0); 
    setStreak(0);
  };

  const pct = Math.min(Math.round(total / 30 * 100), 100);

  return (
    <div>
      {/* Mode buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => switchMode(m.id)} style={{
            padding: "6px 16px", borderRadius: 99, border: `1px solid ${mode === m.id ? "#7c9eff" : "#363a4a"}`,
            fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
            background: mode === m.id ? "#7c9eff" : "transparent",
            color: mode === m.id ? "#0a0c14" : "#7c8098", fontWeight: mode === m.id ? 600 : 400,
          }}>{m.label}</button>
        ))}
      </div>
      {/* Score row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#7c8098" }}>
          Score: {score} / {total} ({total ? Math.round(score / total * 100) : 0}%)
        </div>
        {streak >= 3 && <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#fbbf24" }}>streak: {streak} 🔥</div>}
      </div>
      <div style={{ marginBottom: "1.5rem" }}><ProgressBar pct={pct} /></div>
      {/* Prompt */}
      {current && (
        <>
          <div style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 20, padding: "2.5rem", textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: 11, color: "#4a4e63", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>
              {mode === "jp" ? "What does this mean?" : mode === "en" ? "Choose the hiragana" : "What does this mean?"}
            </div>
            <div style={{
              fontFamily: mode === "en" ? "'Playfair Display', serif" : mode === "rom" ? "'DM Mono', monospace" : "'Noto Sans JP', sans-serif",
              fontSize: mode === "en" ? 26 : mode === "rom" ? 32 : 56,
              color: mode === "rom" ? "#7c9eff" : "#e8eaf2", lineHeight: 1,
            }}>{mode === "jp" ? current.jp : mode === "en" ? current.e : current.r}</div>
            {mode !== "en" && (
              <div style={{ fontSize: 13, color: "#7c8098", fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
                {mode === "jp" ? `${current.r} — ${current.p}` : current.p}
              </div>
            )}
          </div>
          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
            {opts.map((o, i) => {
              let bgColor = "#16181f", borderColor = "#363a4a", textColor = "#e8eaf2";
              if (answered && current) {
                const correct = mode === "en" ? current.jp : current.e;
                if (o === correct) { bgColor = "#0d2018"; borderColor = "#4ade80"; textColor = "#4ade80"; }
                else if (o === chosen && o !== correct) { bgColor = "#200d0d"; borderColor = "#f87171"; textColor = "#f87171"; }
              }
              return (
                <button key={i} disabled={answered} onClick={() => answer(o)} style={{
                  padding: "14px 16px", borderRadius: 12, border: `1px solid ${borderColor}`,
                  background: bgColor, fontSize: 14, cursor: answered ? "default" : "pointer", textAlign: "center",
                  color: textColor, transition: "all 0.15s",
                  fontFamily: mode === "en" ? "'Noto Sans JP', sans-serif" : "'Playfair Display', serif",
                }}>
                  {o}
                </button>
              );
            })}
          </div>
          {/* Feedback */}
          {fb.msg && (
            <div style={{ textAlign: "center", fontSize: 14, fontFamily: "'DM Mono', monospace", marginBottom: 10, color: fb.ok ? "#4ade80" : "#f87171", minHeight: 22 }}>
              {fb.msg}
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <button onClick={makeQuestion} style={{ padding: "10px 28px", borderRadius: 10, border: "1px solid #7c9eff", background: "#7c9eff", color: "#0a0c14", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
              next question →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// PAGE: REFERENCE
// ============================================================
interface PageRefProps {
  scriptId: string;
}

const PageRef: FC<PageRefProps> = ({ scriptId }) => {
  const data = SCRIPT_DATA[scriptId];
  return (
    <div>
      {data.refSections.map(sec => (
        <div key={sec.id} style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a4e63", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{sec.title}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {(data.kana[sec.id as keyof KanaData] || []).map((k, i) => (
              <div key={i} style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 30, color: "#e8eaf2" }}>{k.k}</div>
                <div style={{ fontSize: 13, color: "#7c9eff", fontFamily: "'DM Mono', monospace", fontWeight: 500, marginTop: 4 }}>{k.r}</div>
                <div style={{ fontSize: 11, color: "#7c8098", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>{k.s}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Rules */}
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a4e63", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Long vowel & small っ rules</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { title: "Long vowels — hold for 2 beats", rows: ["ああ → aa　おかあさん (o-ka-a-san) = mother", "いい → ii　おにいさん (o-ni-i-san) = older brother", "うう → uu　すうじ (su-u-ji) = number", "ええ → ee　おねえさん (o-ne-e-san) = older sister", "おう → oo　とうきょう (to-u-kyo-u) = Tokyo"] },
          { title: "Small っ — brief stop/pause", rows: ["きって (kit-te) = stamp", "ざっし (zas-shi) = magazine", "きっぷ (kip-pu) = ticket", "ちょっと (chot-to) = a little", "ほっかいどう (hok-kai-do) = Hokkaido"] },
        ].map(rc => (
          <div key={rc.title} style={{ background: "#16181f", border: "1px solid #2a2d38", borderRadius: 14, padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#7c9eff", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>{rc.title}</div>
            {rc.rows.map((r, i) => <div key={i} style={{ fontSize: 12, color: "#7c8098", lineHeight: 1.9 }}>{r}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// ROOT APP
// ============================================================
const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "words", label: "Word List" },
  { id: "flash", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
  { id: "ref", label: "Reference" },
];

const Hiragana: FC = () => {
  const [activeScript, setActiveScript] = useState<string>("hiragana");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [theme, setTheme] = useLocalStorage<string>("theme", "dark");

  const enabledScripts = Object.values(SCRIPTS).filter(s => s.enabled);
  const scriptColor = SCRIPTS[activeScript]?.color || "#7c9eff";

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const light = theme === "light";
  const colors = {
    bg: light ? "#fafbfc" : "#0e0f13",
    surface: light ? "#ffffff" : "#16181f",
    text: light ? "#111318" : "#e8eaf2",
    muted: light ? "#656a80" : "#7c8098",
    border: light ? "#e2e4e9" : "#2a2d38",
  };

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: "100vh", fontFamily: "'Playfair Display', serif" }}>
      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: colors.bg, borderBottom: `1px solid ${colors.border}`,
        padding: "0 2rem", display: "flex", alignItems: "center", gap: 0, height: 56,
      }}>
        {/* Script switcher (logo area) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "1.5rem" }}>
          {enabledScripts.map(s => (
            <button key={s.id} onClick={() => { setActiveScript(s.id); setActiveTab("overview"); }} style={{
              padding: "4px 12px", borderRadius: 8, border: `1px solid ${activeScript === s.id ? s.color : colors.border}`,
              background: activeScript === s.id ? s.colorDim : "transparent",
              color: activeScript === s.id ? s.color : colors.muted,
              fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 500, transition: "all 0.2s",
            }}>{s.labelJP}</button>
          ))}
          {/* Coming soon — greyed out */}
          {Object.values(SCRIPTS).filter(s => !s.enabled).map(s => (
            <button key={s.id} title="Coming soon" style={{
              padding: "4px 12px", borderRadius: 8, border: `1px solid ${colors.border}`,
              background: "transparent", color: "#4a4e63",
              fontSize: 13, cursor: "not-allowed", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 500, opacity: 0.5,
            }}>{s.labelJP}</button>
          ))}
        </div>
        {/* Page tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "0 16px", height: 56, display: "flex", alignItems: "center",
              fontSize: 13, cursor: "pointer", border: "none", background: "transparent",
              color: activeTab === t.id ? scriptColor : colors.muted,
              borderBottom: `2px solid ${activeTab === t.id ? scriptColor : "transparent"}`,
              fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", transition: "color 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
        {/* Theme toggle */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
          marginLeft: "auto", padding: "6px 12px", borderRadius: 8,
          border: `1px solid ${colors.border}`, background: colors.surface, color: colors.text,
          fontSize: 14, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
        }}>{theme === "dark" ? "🌙" : "☀️"}</button>
      </nav>
      {/* PAGE CONTENT */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {activeTab === "overview" && <PageOverview scriptId={activeScript} onNavigate={setActiveTab} />}
        {activeTab === "words" && <PageWords scriptId={activeScript} />}
        {activeTab === "flash" && <PageFlash scriptId={activeScript} />}
        {activeTab === "quiz" && <PageQuiz scriptId={activeScript} />}
        {activeTab === "ref" && <PageRef scriptId={activeScript} />}
      </div>
    </div>
  );
};

export default Hiragana;