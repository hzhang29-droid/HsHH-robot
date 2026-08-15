import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a six-digit hex color");
const proportion = z.number().min(0).max(1);

export const petIdentitySchema = z.object({
  species: z.enum(["cat", "dog", "other"]),
  breed: z.string().nullable(),
  coat: z.object({
    baseColor: hexColor,
    secondaryColor: hexColor,
    patternColor: hexColor,
    pattern: z.enum([
      "solid", "tabby", "bicolor", "tricolor", "tortoiseshell",
      "point", "spotted", "brindle", "merle", "other"
    ]),
    foreheadMark: z.string().max(80)
  }),
  eyes: z.object({
    leftColor: hexColor,
    rightColor: hexColor,
    shape: z.enum(["round", "almond", "narrow", "other"]),
    pupilShape: z.enum(["vertical", "round", "other"])
  }),
  face: z.object({
    width: proportion,
    muzzleWidth: proportion,
    earShape: z.enum(["upright-pointed", "rounded", "folded", "floppy", "other"]),
    earSize: proportion
  }),
  distinctiveFeatures: z.array(z.string().max(100)).max(6),
  confidence: proportion
});

export const petIdentityJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    species: { type: "string", enum: ["cat", "dog", "other"] },
    breed: { type: ["string", "null"] },
    coat: {
      type: "object",
      additionalProperties: false,
      properties: {
        baseColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
        secondaryColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
        patternColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
        pattern: { type: "string", enum: ["solid", "tabby", "bicolor", "tricolor", "tortoiseshell", "point", "spotted", "brindle", "merle", "other"] },
        foreheadMark: { type: "string" }
      },
      required: ["baseColor", "secondaryColor", "patternColor", "pattern", "foreheadMark"]
    },
    eyes: {
      type: "object",
      additionalProperties: false,
      properties: {
        leftColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
        rightColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
        shape: { type: "string", enum: ["round", "almond", "narrow", "other"] },
        pupilShape: { type: "string", enum: ["vertical", "round", "other"] }
      },
      required: ["leftColor", "rightColor", "shape", "pupilShape"]
    },
    face: {
      type: "object",
      additionalProperties: false,
      properties: {
        width: { type: "number", minimum: 0, maximum: 1 },
        muzzleWidth: { type: "number", minimum: 0, maximum: 1 },
        earShape: { type: "string", enum: ["upright-pointed", "rounded", "folded", "floppy", "other"] },
        earSize: { type: "number", minimum: 0, maximum: 1 }
      },
      required: ["width", "muzzleWidth", "earShape", "earSize"]
    },
    distinctiveFeatures: { type: "array", items: { type: "string" }, maxItems: 6 },
    confidence: { type: "number", minimum: 0, maximum: 1 }
  },
  required: ["species", "breed", "coat", "eyes", "face", "distinctiveFeatures", "confidence"]
};
