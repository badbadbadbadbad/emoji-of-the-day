const EMOJI_CDN = "https://cdn.jsdelivr.net/npm/emoji.json@15.0.0/emoji.json";

/**
 * Seeded PRNG (mulberry32).
 * Same seed always produces the same value, so the same date = same emoji.
 */
function seededRandom(seed) {
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

/**
 * Turns today's local date into an integer, e.g. 2026-04-09 → 20260409.
 * Using local date means the emoji changes at midnight in the user's timezone.
 */
function getTodaySeed() {
    const date = new Date();
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1500);
}

async function init() {
    document.getElementById("date-label").textContent = new Date().toLocaleDateString(
        undefined,
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );

    try {
        const ALLOWED_SUBGROUPS = new Set([
            // Animals
            "animal-mammal",
            "animal-bird",
            "animal-marine",
            "animal-reptile",
            "animal-bug",
            "animal-amphibian",
            // Nature
            "plant-flower",
            "plant-other",
            "sky & weather",
            // Travel & places
            "place-map",
            "place-building",
            "place-religious",
            "place-other",
            "transport-ground",
            "transport-water",
            "transport-air",
            // Food & drink
            "food-fruit",
            "food-vegetable",
            "food-prepared",
            "food-asian",
            "food-marine",
            "food-sweet",
            "drink",
            "dishware",
            // Objects
            "tool",
            "household",
            "other-object",
        ]);

        const response = await fetch(EMOJI_CDN);
        const allEmojis = await response.json();

        console.log([...new Set(allEmojis.map(e => e.subgroup))]);

        const filteredEmojis = allEmojis.filter(e =>
            ALLOWED_SUBGROUPS.has(e.subgroup) &&
            !/[\u{1F3FB}-\u{1F3FF}]/u.test(e.char)  // still exclude skin tone variants
        );

        const seed = getTodaySeed();
        const emoji = filteredEmojis[Math.floor(seededRandom(seed) * filteredEmojis.length)];

        document.getElementById("emoji-display").textContent = emoji.char;
        document.getElementById("emoji-name").textContent = emoji.name;

        document.getElementById("copy-btn").addEventListener("click", () => {
            navigator.clipboard.writeText(emoji.char).then(showToast);
        });

    } catch {
        document.getElementById("emoji-display").textContent = "❌";
        document.getElementById("emoji-name").textContent = "Could not load emoji list";
    }
}

init();