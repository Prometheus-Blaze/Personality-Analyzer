import { NextResponse } from "next/server";

// ================= WORD POOLS =================

const HOSTILE_WORDS = [
  "idiot","moron","stupid","dumb","pathetic","garbage","trash",
  "clown","loser","insane","deranged","delusional","fuck","fucking",
  "shit","bullshit","asshole","bitch","crap","wtf"
];

const VIOLENT_VERBS = [
  "kill","hurt","beat","attack","stab","shoot","destroy",
  "hang","burn","murder"
];

const TARGET_WORDS = [
  "you","him","her","them","people","they","someone"
];

const NEGATIVE_WORDS = [
  "hate","annoying","tired","sick","fed up","angry","mad",
  "frustrated","useless","broken","terrible","awful","worst"
];

const CERTAINTY_WORDS = [
  "always","never","everyone","no one","literally","obviously",
  "clearly","fact","truth","undeniable"
];

const HEDGING_WORDS = [
  "maybe","i think","i feel","perhaps","possibly","might",
  "seems","in my opinion","i guess"
];

// ================= HELPERS =================

function countMatches(text: string, phrases: string[]) {
  let count = 0;
  for (const p of phrases) {
    count += text.split(p).length - 1;
  }
  return count;
}

function isGibberish(text: string, words: string[]) {
  let vowelCount = 0;
  let consonantCount = 0;
  let noVowelWords = 0;

  for (const w of words) {
    if (!/[aeiou]/i.test(w)) noVowelWords++;
    for (const c of w) {
      if (/[aeiou]/i.test(c)) vowelCount++;
      else if (/[a-z]/i.test(c)) consonantCount++;
    }
  }

  const vowelRatio =
    vowelCount / Math.max(vowelCount + consonantCount, 1);

  return (
    vowelRatio < 0.25 ||
    noVowelWords / Math.max(words.length, 1) > 0.6
  );
}

function isSymbolsOnly(text: string) {
  return /^[^a-zA-Z0-9]+$/.test(text);
}

function isNumbersOnly(text: string) {
  return /^[0-9\s]+$/.test(text);
}

function isEmojiHeavy(text: string) {
  const emojiCount = (text.match(/\p{Emoji}/gu) || []).length;
  return emojiCount > 0 && emojiCount / text.length > 0.3;
}

function isLinkOnly(text: string) {
  return /^https?:\/\/\S+$/.test(text);
}

function isRepetitive(words: string[]) {
  const unique = new Set(words);
  return words.length >= 4 && unique.size <= 2;
}

function isAllCaps(text: string) {
  return (
    text.length > 6 &&
    text === text.toUpperCase() &&
    /[A-Z]/.test(text)
  );
}

// ================= API =================

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Say something. Anything." },
      { status: 400 }
    );
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const words = lower.split(/\s+/);

  // 🥚 Easter egg
  if (lower === "nigger") {
    return NextResponse.json({
      tone: "Based",
      traits: ["Patriot", "God's chosen"],
      verdict: "Hell Yeah Brother! you said the word!"
    });
  }

  // 🧱 NON-LANGUAGE CLASSIFICATION (EARLY EXIT)

  if (isLinkOnly(trimmed)) {
    return NextResponse.json({
      tone: "Promotional",
      traits: ["Low-effort", "Redirective"],
      verdict: "A standalone link without context communicates little intent."
    });
  }

  if (isNumbersOnly(trimmed)) {
    return NextResponse.json({
      tone: "Non-verbal",
      traits: ["Opaque"],
      verdict: "Numeric input without context carries no emotional signal."
    });
  }

  if (isSymbolsOnly(trimmed)) {
    return NextResponse.json({
      tone: "Expressive Noise",
      traits: ["Non-linguistic"],
      verdict: "Symbols alone signal emotion, not meaning."
    });
  }

  if (isEmojiHeavy(trimmed)) {
    return NextResponse.json({
      tone: "Emoji-driven",
      traits: ["Expressive", "Imprecise"],
      verdict: "Emotion is present, but meaning is left to interpretation."
    });
  }

  if (isGibberish(lower, words)) {
    return NextResponse.json({
      tone: "Gibberish",
      traits: ["Incoherent"],
      verdict: "This appears to be random or non-meaningful input."
    });
  }

  if (isRepetitive(words)) {
    return NextResponse.json({
      tone: "Chant-like",
      traits: ["Repetitive", "Fixated"],
      verdict: "Repetition suggests emphasis without added substance."
    });
  }

  if (isAllCaps(trimmed)) {
    return NextResponse.json({
      tone: "Shouting",
      traits: ["Intense"],
      verdict: "Capitalization alone conveys emotional intensity."
    });
  }

  // 🔪 Violence
  const containsViolence =
    VIOLENT_VERBS.some(v => lower.includes(v)) &&
    TARGET_WORDS.some(t => lower.includes(t));

  if (containsViolence) {
    return NextResponse.json({
      tone: "Hostile",
      traits: ["Threatening", "Aggressive"],
      verdict:
        "This language expresses explicit hostility and intent to harm."
    });
  }

  // 🧠 MICRO MODE
  if (words.length <= 2) {
    if (HOSTILE_WORDS.includes(words[0])) {
      return NextResponse.json({
        tone: "Hostile",
        traits: ["Aggressive"],
        verdict: "Even a single word can carry hostility."
      });
    }

    if (NEGATIVE_WORDS.includes(words[0])) {
      return NextResponse.json({
        tone: "Negative",
        traits: ["Dissatisfied"],
        verdict: "Brief, but emotionally negative."
      });
    }

    return NextResponse.json({
      tone: "Ambiguous",
      traits: ["Minimal"],
      verdict: "Too little context to infer intent."
    });
  }

  // 🔎 SHORT TEXT
  if (trimmed.length < 40) {
    return NextResponse.json({
      tone: "Neutral",
      traits: ["Concise"],
      verdict: "Short and restrained, with limited emotional signal."
    });
  }

  // 🧠 FULL ANALYSIS
  const hostileScore = countMatches(lower, HOSTILE_WORDS);
  const negativeScore = countMatches(lower, NEGATIVE_WORDS);
  const certaintyScore = countMatches(lower, CERTAINTY_WORDS);
  const hedgingScore = countMatches(lower, HEDGING_WORDS);

  if (hostileScore + negativeScore >= 4 && certaintyScore >= 2) {
    return NextResponse.json({
      tone: "Hostile",
      traits: ["Aggressive", "Dogmatic"],
      verdict:
        "Emotionally charged and confrontational, driven by certainty."
    });
  }

  if (hostileScore + negativeScore >= 3) {
    return NextResponse.json({
      tone: "Angry",
      traits: ["Frustrated"],
      verdict: "Strong irritation dominates the message."
    });
  }

  if (certaintyScore > hedgingScore) {
    return NextResponse.json({
      tone: "Assertive",
      traits: ["Confident"],
      verdict: "Clear conviction with limited nuance."
    });
  }

  return NextResponse.json({
    tone: "Neutral",
    traits: ["Balanced"],
    verdict: "Even-toned and measured in expression."
  });
}
