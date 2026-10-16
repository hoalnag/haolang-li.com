// Encrypts a page's content for the password gate.
//   LOCK_PASSWORD=... node scripts/lock.mjs private/jfk.json
// prints the JSON blob to paste into the matching *_LOCKED in assets/app.js.
// AES-GCM with a PBKDF2-SHA256 key — the same derivation lockKey() uses.
import { readFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const password = process.env.LOCK_PASSWORD;
const source = process.argv[2];
if (!password || !source) { console.error("usage: LOCK_PASSWORD=… node scripts/lock.mjs <file.json>"); process.exit(1); }
const plain = new TextEncoder().encode(JSON.stringify(JSON.parse(readFileSync(source, "utf8"))));
const iter = 250000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base,
  { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
const b64 = (u) => Buffer.from(u).toString("base64");
console.log(JSON.stringify({ iter, salt: b64(salt), iv: b64(iv), data: b64(data) }));
