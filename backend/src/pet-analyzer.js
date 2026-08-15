import OpenAI from "openai";
import { petIdentityJsonSchema, petIdentitySchema } from "./pet-schema.js";

const ANALYSIS_PROMPT = `
Analyze the visible pet for a deterministic 332x252 robot-face renderer.

Rules:
- Report only characteristics visible in the image.
- Focus on head identity: coat colors, markings, eye colors, face width, muzzle, and ears.
- Return representative colors as six-digit hexadecimal RGB values.
- All proportions must be between 0 and 1.
- Use null for breed when it cannot be determined visually.
- Do not describe pose, background, clothing, emotion, or lighting.
- "distinctiveFeatures" must contain only features useful for drawing this specific pet.
- For cats, classify mackerel, classic, spotted, ticked, or M-shaped forehead stripes as "tabby", never "merle".
`;

function normalizeIdentity(identity) {
  const tabbyEvidence = [identity.coat.foreheadMark, ...identity.distinctiveFeatures]
    .join(" ")
    .toLowerCase();
  if (identity.species === "cat" && /tabby|mackerel|m-shaped|m shape/.test(tabbyEvidence)) {
    identity.coat.pattern = "tabby";
  }
  return identity;
}

const mockIdentity = {
  species: "cat",
  breed: null,
  coat: {
    baseColor: "#756553",
    secondaryColor: "#b7aa96",
    patternColor: "#3f352d",
    pattern: "tabby",
    foreheadMark: "dark tabby M with three central stripes"
  },
  eyes: {
    leftColor: "#8fb5a1",
    rightColor: "#8fb5a1",
    shape: "round",
    pupilShape: "vertical"
  },
  face: {
    width: 0.56,
    muzzleWidth: 0.43,
    earShape: "upright-pointed",
    earSize: 0.68
  },
  distinctiveFeatures: ["dark forehead stripes", "pale lower muzzle", "dark cheek stripes"],
  confidence: 0.5
};

export async function analyzePet({ buffer, mimeType, speciesHint, breedHint }) {
  if (!process.env.OPENAI_API_KEY) {
    return { identity: mockIdentity, mode: "mock" };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const hints = [
    speciesHint ? `User species hint: ${speciesHint}.` : "",
    breedHint ? `User breed hint: ${breedHint}. Treat it as a hint, not ground truth.` : ""
  ].filter(Boolean).join("\n");

  const response = await client.responses.create({
    model: process.env.OPENAI_VISION_MODEL || "gpt-5.6-luna",
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: `${ANALYSIS_PROMPT}\n${hints}` },
        { type: "input_image", image_url: `data:${mimeType};base64,${buffer.toString("base64")}`, detail: "high" }
      ]
    }],
    text: {
      format: {
        type: "json_schema",
        name: "pet_identity",
        strict: true,
        schema: petIdentityJsonSchema
      }
    }
  });

  const parsed = normalizeIdentity(petIdentitySchema.parse(JSON.parse(response.output_text)));
  return { identity: parsed, mode: "openai" };
}
