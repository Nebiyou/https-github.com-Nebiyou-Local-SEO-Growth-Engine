# Content file schema (unit1.json … unit8.json)

Each unit is ONE valid JSON file at `content/unit<N>.json`. No comments, no trailing
commas. It will be validated by `app/validate.mjs` and inlined into the final HTML.

## Top-level shape

```json
{
  "unit": 1,
  "title": "Place Value & Number Sense",
  "concepts": [ { ...concept }, { ...concept } ]
}
```

## Concept shape

```json
{
  "id": "c1",
  "title": "Place Value to Thousandths & Powers of 10",
  "standards": ["5.NBT.A.1", "5.NBT.A.2"],
  "states": "Tested in every state",
  "know": [
    "Each place is 10 times the place to its right, and 1/10 of the place to its left.",
    "3–6 bullets total, kid-friendly, complete sentences."
  ],
  "mc": [
    {
      "q": "Question text. May include limited HTML (see Formatting).",
      "choices": ["A text", "B text", "C text", "D text"],
      "answer": 2,
      "explain": "1–3 sentence worked explanation of the correct answer AND why the tempting wrong answer is wrong."
    }
  ],
  "open": [
    {
      "q": "Open-ended question text.",
      "answer": "The exact answer, short (e.g. \"4.07\" or \"36 cubic cm\").",
      "solution": "Step-by-step worked solution, 2–5 sentences."
    }
  ],
  "challenge": {
    "q": "One harder, out-of-the-box multi-step problem.",
    "answer": "Short exact answer.",
    "solution": "Full worked solution."
  }
}
```

## Hard requirements

- Exactly **10** items in `mc`, exactly **5** in `open`, exactly **1** `challenge`.
- `mc[].choices` has exactly 4 entries; `answer` is the 0-based index of the correct
  one. **Vary the correct index** across questions (roughly balanced 0–3).
- Every distractor must be a plausible common mistake (e.g., forgot to find common
  denominator, multiplied instead of divided, place-value slip) — never absurd.
- Difficulty ramp within `mc`: items 1–3 easy, 4–7 medium (typical state-test level),
  8–10 hard (state-test hard items). `open` at medium level, mixing pure computation
  and real-world word problems. `challenge` is one notch above grade level but solvable
  with grade-5 tools — puzzle-flavored, multi-step.
- Real-world contexts a 10–11-year-old likes: games, sports, baking, pets, allowance,
  school events. Vary names/genders. No brand names.
- DOUBLE-CHECK every answer by recomputing it. An incorrect answer key is the worst
  possible bug in this product.

## Formatting conventions (the engine renders these)

- Fractions: write `{{3/4}}` → renders as a stacked fraction. Mixed numbers: `2{{1/3}}`.
- Exponents: `10<sup>3</sup>`. Multiplication sign: `×`. Division: `÷`. Minus: `−`.
- Allowed HTML tags in text fields: `<b>`, `<i>`, `<sup>`, `<sub>`, `<br>`, `<u>`.
  Nothing else (no images, tables, scripts).
- Simple data tables for questions: use the `table` extension —
  `[[table|Header 1,Header 2|1,4|2,8|3,12]]` renders a small table (first segment =
  headers, following segments = rows, cells comma-separated; so avoid commas inside cells).
- Keep question text under ~60 words. Keep `explain` under ~50 words.
