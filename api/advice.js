const UPSTREAM_URL = "https://api.adviceslip.com/advice";
const MAX_ATTEMPTS = 5;

function normalize(text) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isAllowed(text) {
  const configuredWords = process.env.EXC_WORDS;
  if (!configuredWords) {
    throw new Error("EXC_WORDS is not configured");
  }

  const exc_words = configuredWords
    .split(",")
    .map((word) => normalize(word))
    .filter(Boolean);
  const normalizedText = ` ${normalize(text)} `;

  return !exc_words.some((word) => normalizedText.includes(` ${word} `));
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const upstreamResponse = await fetch(UPSTREAM_URL);
      if (!upstreamResponse.ok)
        throw new Error("Upstream advice service failed");

      const payload = await upstreamResponse.json();
      const advice = payload?.slip?.advice;
      if (advice && isAllowed(advice)) {
        return response.status(200).json({ advice });
      }
    }

    return response
      .status(503)
      .json({ error: "No suitable advice was available" });
  } catch (error) {
    return response.status(502).json({ error: "Unable to retrieve advice" });
  }
};
