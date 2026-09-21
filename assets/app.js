/* ==========================================================================
   haolang-li.com — Finder engine
   Selection, navigation, menus, Quick Look, Get Info, window management.
   ========================================================================== */
(function () {
"use strict";

/* ================= file system =================
   The folder tree is data: loaded from Supabase so the owner can edit it in
   admin mode and every visitor sees the change. Falls back to a built-in
   default when there is no backend yet, so the site always renders. */
const BASE = "2026-07-01T12:00";
let _fid = 0;
const folder = (name, at = BASE, children = [], id = null) =>
  ({ id: id || ("f" + (++_fid)), name, kind: "Folder", icon: "i-folder-mac", at, size: "--", children });
const pdf = (name, at, href) =>
  ({ id: "file-" + (++_fid), name, kind: "PDF document", icon: "i-pdf-mac", at, size: "--", href });
const mov = (name, at, href) =>
  ({ id: "file-" + (++_fid), name, kind: "QuickTime movie", icon: "i-mov-mac", at, size: "--", href });
const webloc = (name, at, href) =>
  ({ id: "file-" + (++_fid), name: name + ".webloc", kind: "Web site location", icon: "i-webloc", at, size: "1 KB", href, external: true });
const img = (name, at, href, ar = 1) =>
  ({ id: "file-" + (++_fid), name, kind: "JPEG image", icon: "i-jpg-mac", at, size: "--", href, isPhoto: true, ar });

// the filmmaker's reel, on Vimeo
const REEL = { id: "1203912931", url: "https://vimeo.com/1203912931" };

// the desktop files stay fixed (the request is about folders)
const DESK_FILES = () => [
  pdf("Self_Intro.pdf", "2026-07-10T14:05", "assets/files/Self_Intro.pdf"),
  pdf("CV.pdf", "2026-08-29T14:00", "assets/files/CV.pdf"),
  { ...mov("Filmmaker's Reel.mov", "2026-07-15T20:35", REEL.url), external: true },
];

// Dazz-shot stills, chronological — the content of PHOTOGRAPHY › Dazzcam.
// Renders as its own minimalist photo grid (see renderDigital) instead of
// the plain file grid.
const DIGITAL_PHOTOS = [
  img("digital-01.jpg", "2025-01-06T17:12:00", "assets/photos/digital/digital-01.jpg", 1.3333),
  img("digital-02.jpg", "2025-01-06T17:12:00", "assets/photos/digital/digital-02.jpg", 1.3333),
  img("digital-03.jpg", "2025-03-14T14:11:00", "assets/photos/digital/digital-03.jpg", 1.3333),
  img("digital-04.jpg", "2025-03-14T14:12:00", "assets/photos/digital/digital-04.jpg", 1.3346),
  img("digital-05.jpg", "2025-03-14T14:14:00", "assets/photos/digital/digital-05.jpg", 1.3333),
  img("digital-06.jpg", "2025-03-25T13:11:00", "assets/photos/digital/digital-06.jpg", 1.3333),
  img("digital-07.jpg", "2025-04-05T15:48:00", "assets/photos/digital/digital-07.jpg", 1.3333),
  img("digital-08.jpg", "2025-04-19T11:29:00", "assets/photos/digital/digital-08.jpg", 1.5016),
  img("digital-09.jpg", "2025-04-25T19:12:00", "assets/photos/digital/digital-09.jpg", 2.3529),
  img("digital-10.jpg", "2025-04-25T19:12:00", "assets/photos/digital/digital-10.jpg", 1.78),
  img("digital-11.jpg", "2025-04-25T19:13:00", "assets/photos/digital/digital-11.jpg", 1.5016),
  img("digital-12.jpg", "2025-04-25T19:13:00", "assets/photos/digital/digital-12.jpg", 2.3529),
  img("digital-13.jpg", "2025-04-25T19:13:00", "assets/photos/digital/digital-13.jpg", 2.3529),
  img("digital-14.jpg", "2025-06-02T15:14:00", "assets/photos/digital/digital-14.jpg", 1.5),
  img("digital-15.jpg", "2025-06-02T15:14:00", "assets/photos/digital/digital-15.jpg", 2.3529),
  img("digital-16.jpg", "2025-06-02T15:49:00", "assets/photos/digital/digital-16.jpg", 2.3529),
  img("digital-17.jpg", "2025-06-02T15:50:00", "assets/photos/digital/digital-17.jpg", 2.3529),
  img("digital-18.jpg", "2025-06-02T15:50:00", "assets/photos/digital/digital-18.jpg", 2.3529),
  img("digital-19.jpg", "2025-06-02T15:50:00", "assets/photos/digital/digital-19.jpg", 2.3529),
  img("digital-20.jpg", "2025-06-02T15:50:00", "assets/photos/digital/digital-20.jpg", 2.3529),
  img("digital-21.jpg", "2025-06-02T15:54:00", "assets/photos/digital/digital-21.jpg", 2.3529),
  img("digital-22.jpg", "2025-06-02T15:54:00", "assets/photos/digital/digital-22.jpg", 2.3529),
  img("digital-23.jpg", "2025-08-27T14:46:00", "assets/photos/digital/digital-23.jpg", 1.5),
  img("digital-24.jpg", "2025-08-27T14:46:00", "assets/photos/digital/digital-24.jpg", 2.3529),
  img("digital-25.jpg", "2025-08-27T14:46:00", "assets/photos/digital/digital-25.jpg", 2.3529),
  img("digital-26.jpg", "2025-08-27T14:46:00", "assets/photos/digital/digital-26.jpg", 2.3529),
  img("digital-27.jpg", "2025-08-27T14:46:00", "assets/photos/digital/digital-27.jpg", 2.3529),
  img("digital-28.jpg", "2025-08-27T14:54:00", "assets/photos/digital/digital-28.jpg", 0.6667),
  img("digital-29.jpg", "2025-08-27T14:56:00", "assets/photos/digital/digital-29.jpg", 2.3529),
  img("digital-30.jpg", "2025-09-06T16:37:00", "assets/photos/digital/digital-30.jpg", 1.5),
  img("digital-31.jpg", "2025-09-06T16:37:00", "assets/photos/digital/digital-31.jpg", 1.5),
  img("digital-32.jpg", "2025-09-06T16:37:00", "assets/photos/digital/digital-32.jpg", 1.5),
  img("digital-33.jpg", "2025-09-12T09:40:00", "assets/photos/digital/digital-33.jpg", 1.5),
  img("digital-34.jpg", "2025-09-12T09:42:00", "assets/photos/digital/digital-34.jpg", 2.3529),
  img("digital-35.jpg", "2025-09-12T09:48:00", "assets/photos/digital/digital-35.jpg", 1.5),
  img("digital-36.jpg", "2025-09-12T09:48:00", "assets/photos/digital/digital-36.jpg", 1.5),
  img("digital-37.jpg", "2025-10-10T16:59:00", "assets/photos/digital/digital-37.jpg", 1.7778),
  img("digital-38.jpg", "2025-10-30T10:26:00", "assets/photos/digital/digital-38.jpg", 1.7778),
  img("digital-39.jpg", "2025-10-31T16:24:00", "assets/photos/digital/digital-39.jpg", 2.3529),
  img("digital-40.jpg", "2025-10-31T16:24:00", "assets/photos/digital/digital-40.jpg", 1.5),
  img("digital-41.jpg", "2025-11-14T13:25:00", "assets/photos/digital/digital-41.jpg", 2.3529),
  img("digital-42.jpg", "2025-11-15T15:11:00", "assets/photos/digital/digital-42.jpg", 1.7778),
  img("digital-43.jpg", "2025-11-15T15:11:00", "assets/photos/digital/digital-43.jpg", 1.7778),
  img("digital-44.jpg", "2025-11-15T15:11:00", "assets/photos/digital/digital-44.jpg", 1.7778),
  img("digital-45.jpg", "2025-11-28T09:33:00", "assets/photos/digital/digital-45.jpg", 1.5),
  img("digital-46.jpg", "2025-11-28T11:27:00", "assets/photos/digital/digital-46.jpg", 1.5),
  img("digital-47.jpg", "2025-11-28T11:27:00", "assets/photos/digital/digital-47.jpg", 1.5),
  img("digital-48.jpg", "2025-11-28T11:35:00", "assets/photos/digital/digital-48.jpg", 1.7778),
  img("digital-49.jpg", "2025-11-28T11:35:00", "assets/photos/digital/digital-49.jpg", 1.78),
  img("digital-50.jpg", "2025-11-28T11:37:00", "assets/photos/digital/digital-50.jpg", 1.7778),
  img("digital-51.jpg", "2025-11-28T12:16:00", "assets/photos/digital/digital-51.jpg", 1.78),
  img("digital-52.jpg", "2025-11-28T12:16:00", "assets/photos/digital/digital-52.jpg", 1.78),
  img("digital-53.jpg", "2025-12-21T01:30:00", "assets/photos/digital/digital-53.jpg", 2.3529),
  img("digital-54.jpg", "2025-12-21T01:37:00", "assets/photos/digital/digital-54.jpg", 2.3529),
  img("digital-55.jpg", "2025-12-21T01:37:00", "assets/photos/digital/digital-55.jpg", 2.3529),
  img("digital-56.jpg", "2025-12-21T01:37:00", "assets/photos/digital/digital-56.jpg", 2.3529),
  img("digital-57.jpg", "2025-12-21T01:47:00", "assets/photos/digital/digital-57.jpg", 2.3529),
  img("digital-58.jpg", "2025-12-21T01:47:00", "assets/photos/digital/digital-58.jpg", 2.3529),
  img("digital-59.jpg", "2025-12-21T01:47:00", "assets/photos/digital/digital-59.jpg", 2.3529),
  img("digital-60.jpg", "2026-01-13T16:39:00", "assets/photos/digital/digital-60.jpg", 2.3491),
  img("digital-61.jpg", "2026-01-31T00:26:00", "assets/photos/digital/digital-61.jpg", 1.5),
  img("digital-62.jpg", "2026-02-08T20:19:00", "assets/photos/digital/digital-62.jpg", 0.666),
  img("digital-63.jpg", "2026-02-15T16:48:00", "assets/photos/digital/digital-63.jpg", 1.5),
  img("digital-64.jpg", "2026-03-14T10:23:00", "assets/photos/digital/digital-64.jpg", 1.5),
  img("digital-65.jpg", "2026-03-16T20:01:00", "assets/photos/digital/digital-65.jpg", 1.5),
  img("digital-66.jpg", "2026-04-12T18:57:00", "assets/photos/digital/digital-66.jpg", 2.3529),
  img("digital-67.jpg", "2026-05-07T17:52:00", "assets/photos/digital/digital-67.jpg", 2.3529),
  img("digital-68.jpg", "2026-05-09T13:48:00", "assets/photos/digital/digital-68.jpg", 1.5),
  img("digital-69.jpg", "2026-05-09T13:48:00", "assets/photos/digital/digital-69.jpg", 1.5),
  img("digital-70.jpg", "2026-05-15T15:57:00", "assets/photos/digital/digital-70.jpg", 1.5),
  img("digital-71.jpg", "2026-06-06T18:18:00", "assets/photos/digital/digital-71.jpg", 1.5),
  img("digital-72.jpg", "2026-06-08T20:08:00", "assets/photos/digital/digital-72.jpg", 1.5016),
  img("digital-73.jpg", "2026-06-08T20:08:00", "assets/photos/digital/digital-73.jpg", 1.5016),
  img("digital-74.jpg", "2026-07-04T13:29:00", "assets/photos/digital/digital-74.jpg", 1.5),
  img("digital-75.jpg", "2026-07-05T17:54:00", "assets/photos/digital/digital-75.jpg", 1.5),
  img("digital-76.jpg", "2026-07-05T20:19:00", "assets/photos/digital/digital-76.jpg", 2.3529),
  img("digital-77.jpg", "2026-07-05T20:19:00", "assets/photos/digital/digital-77.jpg", 2.3529),
  img("digital-78.jpg", "2026-09-12T02:31:00", "assets/photos/digital/digital-78.jpg", 1.5),
  img("digital-79.jpg", "2026-09-12T02:31:00", "assets/photos/digital/digital-79.jpg", 1.5),
  img("digital-80.jpg", "2026-09-12T02:31:00", "assets/photos/digital/digital-80.jpg", 1.5),
];

// FILMS — one entry per project, sorted newest-first by `at` below, so a new
// project only needs a correct date, not a hand-picked slot. roles are always
// a subset of FILM_ROLES below — that's what the filter chips at the top of
// the page match against.
const FILM_ROLES = ["Director", "DP", "Producer", "AI"];
const ROLE_LABEL = { Director: "Director", Producer: "Producer", DP: "Director of Photography", AI: "Generator" };
// the filter chips name the kind of work, not the credit: an AI film's credit
// reads "Generator", but its chip just says AI
const CHIP_LABEL = { ...ROLE_LABEL, AI: "AI" };
// `vimeo` is { id, h, ar } for an embed on the detail page (h = the private-link
// hash of an unlisted video, omit for public ones; ar defaults to stillRatio);
// `director` names who directed it when it wasn't Haolang; `stills` is a set
// of frame grabs — a project with 3+ of them gets the stills-first DP
// treatment on the FILMS list (list: the first 3 + credits, no poster;
// detail: poster + description up top, the whole set in a grid below)
// instead of the plain poster row/page every other project uses.
const film = (title, at, o) =>
  ({ id: "film-" + (++_fid), name: title, kind: "Film", icon: "i-folder-mac", at, size: "--", children: [],
     poster: o.poster, meta: o.meta, type: o.type, director: o.director, description: o.description,
     festivals: o.festivals || [], roles: o.roles || [], stills: o.stills || [], vimeo: o.vimeo,
     stillRatio: o.stillRatio || 16 / 9 });
const FILM_PROJECTS = [
  film("Rooted", "2026-09-14T14:20", {
    // detail page runs poster + info, then the film, then stills
    poster: "assets/photos/films/rooted/poster.jpg",
    type: "Narrative Short",
    meta: "2026 · 9 min",
    director: "Haolang Li, Tiger Lee",   // as credited on the poster
    description: "A man wakes with no memory of who he is, lying beside the vine-swallowed wreck of a colossal starship. Piecing together fragments left in its ruins, he learns he was once a scientist's assistant entrusted with the final key needed to complete the ship's “rooting” ritual, which would let the vessel become humanity's first city on this new world while its reactor slowly poisoned the planet with radiation. As he uncovers the mutiny that separated him from the doctor who tried to stop it, he must decide whether to let the ritual finish at last, or sever the next generation of humans from the very machine built to save them.",
    festivals: ["Higgsfield Global Film Festival"],
    roles: ["Director", "AI"],
    vimeo: { id: "1226695523", h: "77c8f18059" },
    stillRatio: 2.35,
    stills: [
      "assets/photos/films/rooted/still-1.jpg",
      "assets/photos/films/rooted/still-2.jpg",
      "assets/photos/films/rooted/still-3.jpg",
      "assets/photos/films/rooted/still-4.jpg",
      "assets/photos/films/rooted/still-5.jpg",
      "assets/photos/films/rooted/still-6.jpg",
      "assets/photos/films/rooted/still-7.jpg",
      "assets/photos/films/rooted/still-8.jpg",
      "assets/photos/films/rooted/still-9.jpg",
      "assets/photos/films/rooted/still-10.jpg",
      "assets/photos/films/rooted/still-11.jpg",
      "assets/photos/films/rooted/still-12.jpg",
      "assets/photos/films/rooted/still-13.jpg",
    ],
  }),
  film("Who I Used to Know", "2026-09-10T20:02", {
    poster: "assets/photos/films/who-i-used-to-know/poster.jpg",
    type: "Experimental Short",
    meta: "2026 · 8 min",
    director: "Tiger Lee",
    description: "What is Sinophone? It might be someone “Who I Used to Know”.\n\n故事的真相到底是什么？可能是迷離的華夷風。",
    roles: ["DP"],
    stillRatio: 1.8963,   // DCI 4096×2160
    stills: [
      "assets/photos/films/who-i-used-to-know/still-1.jpg",
      "assets/photos/films/who-i-used-to-know/still-2.jpg",
      "assets/photos/films/who-i-used-to-know/still-3.jpg",
      "assets/photos/films/who-i-used-to-know/still-4.jpg",
      "assets/photos/films/who-i-used-to-know/still-5.jpg",
      "assets/photos/films/who-i-used-to-know/still-6.jpg",
      "assets/photos/films/who-i-used-to-know/still-7.jpg",
      "assets/photos/films/who-i-used-to-know/still-8.jpg",
    ],
  }),
  film("Essence + Stone", "2026-06-01T00:00", {
    // no poster for this one -- DP-only, list row stays 3-stills-and-credits,
    // detail page's poster block just doesn't render (see renderFilmDetail).
    type: "Jewelry Film",
    meta: "2026 · 1 min",
    director: "Isabella Dobrovolska",
    description: "A fashion jewelry advertisement shot in New York for Essence + Stone.",
    roles: ["DP"],
    stills: [
      "assets/photos/films/essence-and-stone/still-1.jpg",
      "assets/photos/films/essence-and-stone/still-2.jpg",
      "assets/photos/films/essence-and-stone/still-3.jpg",
      "assets/photos/films/essence-and-stone/still-4.jpg",
      "assets/photos/films/essence-and-stone/still-5.jpg",
      "assets/photos/films/essence-and-stone/still-6.jpg",
    ],
  }),
  film("INANNA", "2025-04-09T00:00", {
    poster: "assets/photos/films/inanna/poster.jpg",
    type: "Fashion Film",   // inferred from the Sarajevo Fashion Film Festival + poster credits -- flag if wrong
    meta: "2025 · 3 min",
    director: "Cecilia Qingyu Cheng",
    description: "Fleeing an unseen threat, Thea stumbles into a surreal threshold filled with deceptive “self-defense” tools and haunting visions of entrapment. Stripped of her burdens but armed with a single sword, she awakens — no longer a victim, but a warrior.",
    festivals: ["Sarajevo Fashion Film Festival"],
    roles: ["DP"],
    // first 3 are what shows in the DP-filter list row (stills-first template
    // uses stills[0..2] there) -- still-1 stays put, still-5/6 swapped in for
    // the old still-2/3, per request; full grid below still shows all 6.
    stills: [
      "assets/photos/films/inanna/still-1.jpg",
      "assets/photos/films/inanna/still-5.jpg",
      "assets/photos/films/inanna/still-6.jpg",
      "assets/photos/films/inanna/still-2.jpg",
      "assets/photos/films/inanna/still-3.jpg",
      "assets/photos/films/inanna/still-4.jpg",
    ],
  }),
  film("SHAME ON YOU", "2024-12-02T00:00", {
    poster: "assets/photos/films/shame-on-you/poster.jpg",
    type: "Documentary Short",
    meta: "2024 · 18 min",
    description: "This documentary work is about real-estate, displacements, cultural groups, cocoons, and shame. By documenting the recent struggles against certain “non-profits” in Manhattan’s Chinatown, I aim to provide nuanced perspectives on the role of Chinese students in a controversy they passively drawn into. I interviewed scattered individuals representing clustered communities and agency enterprises to infiltrate the societal changes in need to be announced and addressed. This film represents my limited yet precise scope of cultural investigation on people I know. The title “Shame on You” is a slogan shouted by protesters. I hope it may be heard not only by the oppressor, but also pondered by every single one of us.",
    // festival wording matches the laurels on the poster itself (more
    // specific than the submission tracker's generic "Award Winner"/"Selected")
    festivals: [
      "Berlin Indie Awards — Semi-Finalist",
      "Brooklyn International Short Festival — Best Documentary",
      "New York International Film Awards™ - NYIFA — Finalist",
      "New York Lift-Off Film Festival — Official Selection",
      "New York City Independent Film Festival — Official Selection",
      "Oniros Film Awards® - New York — Finalist",
    ],
    roles: ["Director", "DP"],
    stills: [
      "assets/photos/films/shame-on-you/still-1.jpg",
      "assets/photos/films/shame-on-you/still-2.jpg",
      "assets/photos/films/shame-on-you/still-3.jpg",
      "assets/photos/films/shame-on-you/still-4.jpg",
      "assets/photos/films/shame-on-you/still-5.jpg",
      "assets/photos/films/shame-on-you/still-6.jpg",
    ],
  }),
  film("FOOD LOVER عاشق الطعام", "2024-11-10T00:00", {
    poster: "assets/photos/films/food-lover/poster.jpg",
    type: "Documentary Short",
    meta: "2024 · 18 min",
    director: "Haolang Li, Tiger Lee",
    description: "Employing the cinéma vérité approach, the film observes the professional and personal life of Hesham, an Egyptian-American food cart owner, tracing how his culinary practice becomes a site for negotiating culture, religion, and migration.",
    festivals: ["Berlin Lift-Off Film Festival", "Tisch School of the Arts WinterFest"],
    roles: ["Director", "DP"],
    stills: [
      "assets/photos/films/food-lover/still-1.jpg",
      "assets/photos/films/food-lover/still-2.jpg",
      "assets/photos/films/food-lover/still-3.jpg",
      "assets/photos/films/food-lover/still-4.jpg",
      "assets/photos/films/food-lover/still-5.jpg",
      "assets/photos/films/food-lover/still-6.jpg",
    ],
  }),
  film("CURED BY DEATH 拆病", "2024-06-01T00:00", {
    poster: "assets/photos/films/cured-by-death/poster.jpg",
    type: "Narrative Short",
    meta: "2024 · 8 min",
    director: "Murray Zhao",
    description: "A street boy, a deaf boy, and a wise mother, all born and raised by the city of Beijing, are searching for their way.",
    festivals: ["Festival du Nouveau Cinéma 2025"],
    roles: ["Producer", "DP"],
    stills: [
      "assets/photos/films/cured-by-death/still-1.jpg",
      "assets/photos/films/cured-by-death/still-2.jpg",
      "assets/photos/films/cured-by-death/still-3.jpg",
      "assets/photos/films/cured-by-death/still-4.jpg",
      "assets/photos/films/cured-by-death/still-5.jpg",
      "assets/photos/films/cured-by-death/still-6.jpg",
    ],
  }),
  film("BURNING STAGE", "2024-10-01T00:00", {
    // no poster for this one yet
    type: "Documentary Short",
    meta: "2024",
    director: "Jingxuan Wang",
    description: "There are countless documentaries about Sichuan opera, and no shortage of shorts on the art of face-changing — but its fire-breathing has drawn almost no attention. This film centres on that craft and on the unconventional story of one of its inheritors, reaching into a deeper world the public has never seen and bringing the audience a visual feast out of Sichuan opera.",
    roles: ["DP"],
    // scope performance frames, plus two ~4:3 portraits of the subject that
    // are shown whole instead of cropped to the tile (see fitStills)
    stillRatio: 2.41,
    stills: [
      "assets/photos/films/burning-stage/still-1.jpg",
      "assets/photos/films/burning-stage/still-2.jpg",
      "assets/photos/films/burning-stage/still-3.jpg",
      "assets/photos/films/burning-stage/still-4.jpg",
      "assets/photos/films/burning-stage/still-5.jpg",
      "assets/photos/films/burning-stage/still-6.jpg",
      "assets/photos/films/burning-stage/still-7.jpg",
      "assets/photos/films/burning-stage/still-8.jpg",
      "assets/photos/films/burning-stage/still-9.jpg",
      "assets/photos/films/burning-stage/still-10.jpg",
    ],
  }),
  film("Rock‘n’Roll", "2023-11-01T00:00", {
    poster: "assets/photos/films/rock-n-roll/poster.jpg",
    type: "Abstract Short",
    meta: "2023 · 3 min",
    description: "Two students get stuck in the Weinstein elevator and fall into an awkward conversation — one of them barely speaks English, so they talk through a translation app on his phone. When “We Will Rock You” starts playing, the language barrier stops mattering. Nothing was rehearsed and most of it is improvised, so some of the awkwardness is real.",
    festivals: ["Shoot For the Sake of Abstraction"],
    roles: ["Director"],
    stillRatio: 1.41,
    stills: [
      "assets/photos/films/rock-n-roll/still-1.jpg",
      "assets/photos/films/rock-n-roll/still-2.jpg",
      "assets/photos/films/rock-n-roll/still-3.jpg",
      "assets/photos/films/rock-n-roll/still-4.jpg",
      "assets/photos/films/rock-n-roll/still-5.jpg",
      "assets/photos/films/rock-n-roll/still-6.jpg",
    ],
  }),
  film("CAGED 星海遨游", "2023-08-01T00:00", {
    poster: "assets/photos/films/caged/poster.jpg",
    type: "Narrative Short",
    meta: "2023 · 5 min",
    description: "An escaped prisoner named Xinghai Li, after being chased by two police officers, was brought back to reality from the virtual world.\n\nThe film aims to convey the idea that the metaverse is not simply a technological improvement but potentially a risky social reformation. Each representing a group of future users in the metaverse, the characters in the film play their parts as allusions to the young generation, the elder generation, and the capitals. Similar to the core concept in the television program “Black Mirror”, “CAGED” will raise a discussion between the bright and dark sides of near-future technology and warns the viewers of the potential harm being brought by the uncontrollable technology in a striking and sarcastic manner. The protagonist Xinghai Li was freed from the spiritual world (temporarily) and experienced a short time of spiritual freedom. Nevertheless, it shall not be denied that one is never truly free if his physical body is trapped.",
    festivals: ["NYU Tisch School of the Arts Application Film", "Shanghai International Short Week 2023"],
    roles: ["Director"],
    stillRatio: 2.4,
    stills: [
      "assets/photos/films/caged/still-1.jpg",
      "assets/photos/films/caged/still-2.jpg",
      "assets/photos/films/caged/still-3.jpg",
      "assets/photos/films/caged/still-4.jpg",
      "assets/photos/films/caged/still-5.jpg",
      "assets/photos/films/caged/still-6.jpg",
      "assets/photos/films/caged/still-7.jpg",
      "assets/photos/films/caged/still-8.jpg",
      "assets/photos/films/caged/still-9.jpg",
    ],
  }),
  film("LIPSTICK ON A LEOPARD 豹", "2022-06-01T00:00", {
    poster: "assets/photos/films/lipstick-on-a-leopard/poster.jpg",
    type: "Narrative Short",
    meta: "2022 · 5 min",
    description: "While questioning his masculinity upon the prejudice of his weakliness, a young boy with gender identity disorder struggled to retrieve his beastliness from past memories.",
    festivals: ["Changing Minds Young Filmmaker Competition 2022", "CINEMQ 2022"],
    roles: ["Director"],
    stills: [
      "assets/photos/films/lipstick-on-a-leopard/still-1.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-2.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-3.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-4.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-5.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-6.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-7.jpg",
      "assets/photos/films/lipstick-on-a-leopard/still-8.jpg",
    ],
  }),

  /* Named, but nothing else filled in yet. Deliberately bare — a stub carries
     the title and Haolang's role and not one word more, and having no date is
     what parks it at the end of the list until there's something to say. */
  film("One Way Street", null, { roles: ["Director"] }),
  film("Sunset Hunter", null, { roles: ["Director", "DP"] }),
  film("Rosy's Project", null, { roles: ["DP"] }),
  film("Denali", null, { roles: ["Producer"] }),
];
// the FILMS list reads newest first — order comes from each project's own
// date, so adding one is just a matter of giving it the right `at`.
FILM_PROJECTS.sort((a, b) => {
  if (!a.at !== !b.at) return a.at ? -1 : 1;    // the undated stubs go last
  return a.at ? new Date(b.at) - new Date(a.at) : 0;
});

// content that lives inside named folders, merged onto whatever the tree loads.
// This is the "you add material, I place it" hook — extend it per folder.
// No subfolders anymore — each of the four sections is flat, its content
// dropped straight onto it.
function folderContent() {
  return {
    "Film Projects": [...FILM_PROJECTS],
    WRITINGS: [...WRITINGS],
    Dazzcam: [...DIGITAL_PHOTOS].reverse(), // newest shot first
  };
}

// built-in default folder set — matches the Supabase seed, used before setup / offline.
// Four top-level sections, in this order, each its own page (see routing below).
// FILMS is the one exception with sub-pages of its own — Film Projects is
// what its sidebar row opens by default; Reviews/Equipment are placeholders
// for whenever there's real content to put there.
function defaultFolders() {
  return [
    folder("FILMS", "2026-09-14T14:20", [
      folder("Film Projects", "2026-07-16T11:40", []),
      folder("Generative Projects", "2026-07-16T11:40", []),
      folder("Reviews", "2026-07-16T11:40", []),
      folder("Equipment", "2026-07-16T11:40", []),
    ]),
    folder("WORK EXPERIENCE", "2026-08-29T09:00", []),
    folder("WRITINGS", "2026-07-17T23:10", []),
    folder("PHOTOGRAPHY", "2026-09-12T02:31", [
      folder("Dazzcam", "2026-09-12T02:31", []),
    ]),
  ];
}

// rows from Supabase → nested folder nodes, ordered by pos
function foldersFromRows(rows) {
  const byId = new Map();
  rows.forEach(r => byId.set(r.id, folder(r.name, r.created_at, [], r.id)));
  const tops = [];
  rows.forEach(r => {
    const node = byId.get(r.id); node.pos = r.pos;
    if (r.parent && byId.has(r.parent)) byId.get(r.parent).children.push(node);
    else tops.push(node);
  });
  const sortRec = list => { list.sort((a, b) => (a.pos || 0) - (b.pos || 0)); list.forEach(n => sortRec(n.children)); };
  sortRec(tops);
  return tops;
}

// WORK EXPERIENCE is behind a password. The entries (company, aka, role,
// start/end as "YYYY-MM", end === start for a one-month job, points) live
// in git-ignored private/work.json and ship only encrypted: AES-GCM with a
// PBKDF2-SHA256 key from the password. To change them, edit that file and
// run scripts/work-lock.mjs, then paste its output here.
const WORK_LOCKED = {"iter":250000,"salt":"K0GRE2JlhUDms7POoKnj8Q==","iv":"C8K0vKl93W+M7B2D","data":"vIyzpzFk65tSoZQH6Xop31WSeTd4KlY52G1AsXfd+qmUgzyQoQf1RRSC64NpuqvQe+YQ1v6ZGA03TbzNbLqZ7344uPPiCmFlSlbu1sWPJ33nLnlxqIscJBTS/LdF5qXF5kYfTdN+GL/lwICnlgbJ+LEIEVMlYRSb8ta42YR8NJWaj3aQ6Oh3QxKYnsW1HvbI0hKKPWdaKhKGt1A/GDISOmbxZuk9CoKZoY1AkQdkQCbMSLFjbQfFuIXilHsaxxR/kahZ8gQcEXD2B9mX/4yjcSHOyGjBveaTprOVVaz6N/476jdHBi5KV/cFVT/5jiY9BdQIqgqHf12FpwtBGYewAZXg2a3z5T4B1FFkAxG0tBnQlWtD28Hth3Vekx3om8kykSr6wakd3zXANtYxjAOSZTyUcozKyZhlUXa4A81iUWKObu1OwO0u9WfvmR2xYjnEly1/0SHG87txusz7x4ZfZMebMTWKG1B+gMvTG1ixgoo/CjSjLtCldRqe/DVfiq0rVLFicjHyJReJtDfYBBT7CqgMjbcQcbR1vkCTZwwaOBTw8CpIf/AGmj8CTi4MYxm+uWVRuCbTap1THy1rOcfj/v8hWek2zFJUM63g3SosVZ30Ld0kROkd9JwuW05Emio/qpJYatpWth5m+5s9dBs6BTPkRSq6PeND6q344X7lFdfht5A1WeVztCH8Bm202/+8yRhTXKhYqP1jpWRO3UO7H8jmrVbclefjQ1vkbA4INEdTb/fOEI9ih9oY3QVL+Q3A2vU3vGixStSQMg+YigyMktWZYQu/Ta1CDkvY7NYNwea9gI/U25Elj3QaiqAd49Lp6hkTXqzC7Dt9onn9iyF/8dE/8TzVNT60F/BQheURfV2oGqV+du+DMF6c00ENpIwWdKbr3rAzG8ZqIs1kZ9UJHt4XHenaJ6Fx7717EkaLnQC6uVVa8T4W0l7VwjfpUdPSTkb23ZR0H3SFEAQDw4LTREy7p8W2pO1lP6507QjThQeujjjss4967Wg2yVK1fQB9ZWZxnN1TpBiFK5cVy+zQbE0zEI47UCLCgcNW/hTQrLgiO73RyJtoHMfFNs+86tJih68mN1OwpvOYezLoeKhruG8cF3BhMPJKPwlCJPBsvbbAjOgN7OXt7RbrwQkAlJ1OJJKvU+3SeBfogOo9PVONJxhZRA9sFav60/a1C83J43o46+MhqE7JDu+VDmqWgVnvJNGa0PpsLyTIYrTP8P8FwxufX76vsC7ZfXopK/dFSEs2KlJbSgAACCow8NGYO2S0sInrsqFyuSZn3AoggwCXwD7X+oxU8QKjNpCPYOXrHHxNEAaQMKpQ5gsQAECsyZ1x4YlrODQqk9/QPwgeTVgmWxNmwGo1/QxySSeJQZLeLJLk9WGX/rmxRywIrDluSR6iYkVqPHj4m3RmNs9kfrsJGaLblTAow1BNEjP2b97NFh/baHG+Yw6cnaARFUpmhwqJbbAzdgrU7xbwFQ3U1ArLN0pQnZuAP9rCPpn4/Y9CQDx5dcTFV0i+HdTLL0eGaoJv9v3IjTy/ztJ4nKkAjvcTZT+HdH2F2BP4fFKMRyzX1bN+YcwvlnY+eoyhhzZ902Vuifd+ot4VckgoC6tQcBJonMKY7mE18bJxuuGIQkmPvCQoRVwYUqvATjGWlSq0vQ9FVAncK1SS5svJnA4LIotVFB7cBghU4GzfrhU7dQGNSBVxhc3qxVyE1PCgb+83q7RkKn6wUUnxBKovBR8gS8vD83XbTyfVEJEfODRaN18Hq3ePm187t1subCFLEHNk55q9kt34bsE2EVLPMFBaz0cGG+jpmvjaYdb+QHpM8CwVShTWFhKc7lG1IVK8AJlJqp0Pa7WCc3GxSP3TTgnSkMBMGevWcH/Jo7rFTVPZ+ckHnmgJAzIcUEVnDB2vizY7T24E+ipbUuYvcW04S0R38TEQ7XxsNPW0hubu4LFLlL9FEcqYSWLUd4nR3kyZZHPtA88tQVF1/M/AsWUMJJioOoYhM9FGbzWXP4eGEGIHWyXML4Qj7GXKZ52TVqt6p5x1fRr+TjoxtJ3LjL5mbBKnTmKozSYtisz/RcxhnuP9gj/4BsdCi+NzVKU9k9uoWRO7WlMSp2LWqv1k9cyPQKIawuYo6t/Jt7ynEUhwmluHAMKBeR8zC8rhYFOqdgW3hdbAxIGJUxwO+N+/fUCKcU+ZZgsk7TLoOtB/xplhRpPs4h1csWkqVudb8U1k3YV00Voe3fiW"};
let WORK = null;
const WORK_KEY_SLOT = "hl-work-key";
const b64bytes = (b) => Uint8Array.from(atob(b), c => c.charCodeAt(0));
async function workKey(password) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64bytes(WORK_LOCKED.salt), iterations: WORK_LOCKED.iter, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
}
// resolves to true when the key opens the entries; a wrong one throws inside
async function openWork(key) {
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64bytes(WORK_LOCKED.iv) }, key, b64bytes(WORK_LOCKED.data));
    WORK = JSON.parse(new TextDecoder().decode(plain));
    return true;
  } catch { return false; }
}
// an unlocked visitor stays unlocked for the rest of the browser session
async function restoreWorkKey() {
  try {
    const raw = sessionStorage.getItem(WORK_KEY_SLOT);
    if (!raw) return false;
    const key = await crypto.subtle.importKey("raw", b64bytes(raw), "AES-GCM", false, ["decrypt"]);
    return openWork(key);
  } catch { return false; }
}
async function unlockWork(password) {
  const key = await workKey(password);
  if (!(await openWork(key))) return false;
  try {
    const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
    sessionStorage.setItem(WORK_KEY_SLOT, btoa(String.fromCharCode(...raw)));
  } catch {}
  return true;
}

// WRITINGS — one entry per piece; the feed sorts newest first by `at`, so a
// new piece only needs its date. `body` is plain text: a blank line starts a
// new paragraph, a line starting "## " is a subheading, "> " a pull quote
// (inline <em>/<a> are fine), a lone "***" a scene break, "### " a sub-subheading, "![caption](src)" a
// figure, lines starting "• " a bullet list, and a lone "---" line ends the
// text: everything after it (notes, references) is set small, links live.
// `dek` is the one-line standfirst under the title; `tags` build the filter
// row on the feed; `cover` and `pdf` (the original file) are optional.
const essay = (title, at, o) =>
  ({ id: "essay-" + (++_fid), name: title, kind: "Essay", icon: "i-doc-mac", at, size: "--", children: [],
     dek: o.dek, tags: o.tags || [], body: o.body || "", cover: o.cover, pdf: o.pdf });
const WRITINGS = [
  essay("麻辣烫", "2026-09-20T00:00", {
    tags: ["Fiction"],
    body: `出租车里可能会有很多气味，各式车载香薰味、汗臭味、皮革味、大麻味、前一个乘客的香水味…在那辆下午四点从肯尼迪机场开到曼哈顿中城的车上，我第一次闻到了麻酱香味。我坐在司机的正后方，斜眼望去，副驾驶座位上用塑料袋包着一碗满满当当的麻辣烫。

麻辣烫是一道中国美食，但不算能登上大雅之堂的那种。它是一种将各种荤素食材混在一起煮熟后浇上麻酱的大杂烩，吃起来很像火锅的味道。

“小弟走不走隧道？会快一点，加五刀。” 司机问道。

刚刚经历了十八个小时的飞行，我一心想快些躺到床上。

“没问题。”我说。

听司机的口音可以断定他是福建人。绝大多数福建人在吃这方面都很在行，很挑剔。我注意到装麻辣烫的袋子上因时间长而生出的大量水滴，继而猜测这可能并不是他的晚饭。

今天下午，法拉盛城区下了一场雪。他身在路边一个汽修厂，一边用手扫除玻璃边缘的积雪，一边对身旁一边冲电话那头喊着 “我要去肯尼迪跑单啊，来不及的，而且岛上也多的是啊…行吧，那你列个单子发给我。” 电话那头是他的老客户大东，经常会给他打电话请他买些法拉盛的中国美食作为晚餐。今天晚上应该是又馋了这口麻辣烫，并为此开出了高昂的跑腿价格。

“看起来像是动物的粪便，而且里面一层隔热棉也被啃坏了，我猜是哪只小猫咪因为晚上怕冷，把你的引擎架当作窝了。” 一个华人汽修工和他解释着，“我刚刚把那层棉花换掉了，不影响驾驶。”

“修这个保险能报销吗？” 他挂掉电话问。汽车年检本来就是走个过场，他没想到真的查出了些问题。

“可以的，这是账单，明天给保险公司发个邮件就好。” 汽修工递给他一沓纸说。

他最讨厌发邮件，和对方沟通一来一回很不方便。不过对他来说时间就是金钱，多拖延十分钟就是少赚一份钱。他谢过了修理工，开车驶向卖麻辣烫的餐馆。

在喷洒着水雾的食材柜前，他对照着客户发来的食材单挑选各样的麻辣烫原材料，并无意识地计算着每种食材的最佳熟度。比如涮8秒就够的肚丝，超过十秒就老到像口香糖一样咬不动的黄喉…这些食材统统会被统一连同丢进一大锅高汤里熬煮，再一齐捞出来浇上麻酱。

“随便了，” 他想 ，“反正不是我吃。”

他更喜欢火锅，不是纽约遍地都有的那种放人工辣精的四川火锅，是他家乡福清特有的海鲜火锅，他尤其喜欢里面的手打鱼丸和鲜鱼片。而麻辣烫就像是把火锅之所以成为火锅的东西都简化掉了。它省去了食客自己下料，再捞起那恰到好处滚烫熟度的食材这一过程，只留下一锅杂七杂八的熬煮和调味。

***

“小弟，你在这边上学咯？” 他边开车边冷不丁的问我。

“是啊，还有一年就毕业了。” 我说。

"小弟平时晚上是不是经常出去耍呀？"他笑着问我。我从后视镜里看见他眼角笑出来的皱纹。

“啊，学校课业蛮多的，我不太搞这些哈哈。” 我假笑几声说道。

“少骗我啦，你平时出去一次带几个女生呀…下回出来能不能介绍我几个？”

那一刻，比起被冒犯，更多的是懊悔，懊悔刚刚没有打开手机上的录音机。多么生动的剧本素材。

他大概听我是留学生才这样问。"留子"是中文里给留学生的一个专称,音近“瘤子，”有时特指那些有钱、却不好好读书的人。这样的人确实有，或许正因如此他才问我。现在临近八月底，正是留学生返校的时间段，说不定他也这么问过别的乘客。

每到开学季，成群的长途飞机会像大雁北归那样到达肯尼迪机场，而那些成群结队的小绅士化推手们，大多会钻进像我此刻坐着的这种比Uber便宜将近百分之七十的华人黑车，带着大包小包，回到他们在泽西城、长岛城，或是曼岛上的高楼里。

那天我一共随行带了四个箱子，里面装着从国内带过来在剧组上会用到的的三方通话，几颗电影镜头，三把羽毛球拍，和许多日常衣物。我在临近出海关的时候联系了他，他和我说拿完行李去二楼的到达层D区等他。他同时问起我的名字，并说他叫XXX，如果到时候机场的警察问起来，就说他是我的叔叔。

一辆黑色的七座车从拥挤的车流里硬挤出来,停在我所在的D区。他大概是凭我那几个大箱子认出了我，连忙下车，朝我和箱子快步奔过来。我帮他把箱子往后备箱里塞。就在那时，我瞥见后备箱角落里躺着一个蓝色的羽毛球包。

据他所言，在机场被TLC（Taxi and Limousine Commission）抓到一次会罚五百美金，第二次就是两千美金，今天好巧不巧TLC就在我们的附近。他后来还给我展示了聊天软件车队群里大家互相通风报信的聊天记录，和他自己曾经收到过的五百美金罚单。

***

车辆从隧道驶出，我解释道：“哥，我平常不怎么出来玩，更不是像你说的那样子…” 我说，“您没有老婆孩子吗？” 我同时悄悄将手机有麦克风的那一侧对准驾驶位，按下了录音键。

他没怎么迟疑，说：“他们还在国内了啦，以后接过来。”

就像不该因为某个古代智者在某些方面存在某些时代局限，从而全盘否定他一样，我也没有就他那些性别观念上的错位同他争辩什么，也没有再接他的话。我暂停了录音，同时给我的一个朋友发信息吐槽这位司机对我毫无边界感的问话。

这样的暗自吐槽让我自我感觉良好，仿佛这份鄙夷就能证明我已经脱离了那个旧的男性共同体；与此同时，我也意识到自己正用一套接近现代的观念居高临下地凝视他。

我的朋友对他的描述是：恶心。

与此同时，他的车也恰好停在我家楼下。他问我能不能用人民币付，我说行，便扫了递过来的收款码。我谢绝了他递来的一根烟，拖着一身疲惫上了楼。

我住在37楼，向下能望见入夜后曼哈顿街头的车水马龙。我依稀看见他在车旁踩灭烟头，重新上车，朝大东的住处开去。

夜间的FDR高速很快，不出十分钟他便开到了曼哈顿下东区最高的那栋叫做“One Manhattan Square” 的豪华大楼。关于这栋楼，下东区和中国城的居民早就积了一肚子怨气。因为立面那一格一格的斜纹,当地人给它起了个外号叫做“芝士刨。” 它一共有八十多层，共设有八百多套面向市场的公寓。沿着两桥一带的滨水地，开发商曾前后规划了整整五根这样的钉子：除了眼前这一栋，还有一栋七十九层的、六十九层的、六十二层的。附近的居民和组织曾一次次上街、一次次上法庭抗议这些建筑可能带来的逼迁于绅士化。代表这一区的华裔女议员陈倩雯曾公开反对开发商，联名要求市府否决所有申请。可在许多老街坊眼里,她的反对来得太迟，有人甚至递交了对她的操守投诉。她虽站在反对的一边，单同时也被街坊邻居算作共谋的一员。在居民的努力下，开发商的计划被暂停，两桥一带就只剩这一栋“芝士刨，” 孤零零的俯瞰着哈德逊河。

他把车停在One Manhattan Square接驳区，一路小跑，生怕从哪又冒出来一张停车罚单。他经过飘着熟悉的刺鼻香薰味的大堂，坐电梯到达顶楼，将麻辣烫递给大东，并收到了一张涵盖车费与小费的一百美元现金。

回到车上，可算是结束了一天的工作。清点后，连算上刚才的两单，今天一共净收入六百四十美金，折合四千两百多人民币，这些钱他打算一半寄给福清老家，一半留着给自己买一把新的羽毛球拍。他的日工资和车队里的其他人相比不算高。他听说有一个东北汉子在除夕夜跑出了一千两百多美金，不过最后那些钱都进了赌场的腰包。想到这里，他庆幸自己没有染上赌瘾。

***

七点半，他收车回到法拉盛，拐进了 NYBC（New York Badminton Center）的停车场。三周前，他为了省事，没认真做准备活动，结果一个跨步，直接把屁股后面的肌肉拉伤了。 他背上球包，推门走进球馆，付了钱，熟练地和场上的球友们打招呼。这里的人来自五湖四海。打球的时候，他经常能听见粤语、普通话、英语、印度语、和印尼语。

不像是网球、高尔夫等在纽约可以被称得上的高消费的运动，纽约附近的羽毛球场收费通常不高，他所在的这个场馆打一整晚只要十五美元。他走到自己常打的五号场，脱下穿了一天的毛衣，换上昨天刚洗好的速干跨栏背心，开始做准备活动。

“三周没见，长记性了？哈哈。” 旁边一个叫 Peter 的大叔笑着问他。

Peter 来自潮汕，曾经差点因为胆囊炎死掉。那之后，他把生活过得格外健康：每天打球，所有带糖的饮料一律不碰。

他白了 Peter 一眼，挥了挥球拍，示意和他打几球热热身。

羽毛球的等级森严。水平差距太大的人待在同一个场里，对水平高的一方来说，往往没什么意思。所以，球馆里的人群也是按照水平高低分隔开来。他所在的群组属于中间那档，不算新手，却也打不过高手们。

他和 Peter 搭档连赢了几场。打到第三局的时候，他的背已经出了汗，刚才拉伤过的那条腿也有些发紧，不过身体也慢慢热起来了。

休息的时候，他抬头看了一眼旁边。几个年轻人的的场地正好空着，球网两边的人还站在场边喝水。他打量了他们一会儿，从墙边拿起一桶新球，走过去。

“打几场吗？”

“今天有点累了，先不打了。”

“哦，好。”

他也笑着点了点头，把手里的球桶往上提了提，转身走了。

他回到自己的场地，又和 Peter 打了几分。只是刚才那点兴奋已经过去了。

过了一会儿，他往旁边看了一眼。那几个年轻人，显然一点也不累。场上又满了四个人，球在两边飞得很快，几乎看不清落点。杀球时的喊叫声此起彼伏…

他站在那里看了一会儿，又低头看了看自己身上湿透了的球衣，感觉身上也没了劲头。他没有再回自己的场，也没有换衣服，只把球拍塞回包里，背上球包，和Peter挥手道别后推门走出了球馆。

雪已经停了，但外面的温度足以让他感到冰凉彻骨。他赶忙解锁车门，爬进车里打开暖风。被暖风吹拂了一阵子后，他仿佛闻到了一股不可名状的异味。兴许是下午放在副驾驶位置上的麻辣烫遗留下的气味？他想，又向驾驶位的四面八方嗅了几下，确认了空调是异味的来源。他捂着鼻子下了车，打开机箱盖，举起手机的手电筒往机箱里照，竟然发现角落里又出现了几颗大小不一的棕色动物粪便。

远处的几声猫叫吸引了他的注意力，他用手电筒照向远处，一团黑色身影随机消失在了夜色中……`,
  }),
  essay("In Search of Cinematic Sacredness", "2025-05-04T00:00", {
    dek: "A Comparative Analysis of mediated construction of Tibet in Martin Scorsese and Pema Tesden's Films",
    tags: ["Film"],
    pdf: "assets/files/cinematic-sacredness.pdf",
    body: `In this age where film, like all other art forms, is seemingly challenged by the fact that reality can be replicated instantly with a smartphone button, what Benjamin once described as "the transformation of the superstructure" has now become embedded in everyday life. According to Benjamin, "the present condition of production" is "useful for the formulation of revolutionary demands in the politics of art. (Benjamin, 2007)" This indicates that our task is not only to interpret the aesthetics of captured images but to understand how they function politically and joins the dialectical reproduction of the society. Following Benjamin’s idea, we must embrace the transformations and approach film from a materialist standpoint to ask what it can still do today. In an ideal filmic world, signs come with symbols, exchange comes with use value, and rationality comes with religion. In Plate's argument, he states that “diegetic realities of cinema constantly collapse into the afilmic world, supplying both form and content for humans’ sacred strivings." Today, the two most dominant film industries, Hollywood and Chinese state-sponsored cinema, both fail to turn the invisible imagination into a visible diegetic world and collapse the diegetic into the filmic – space of real and lived experience. When capitalist spectacles displace religion, the sacred is understood against the secular, and images are only there to entertain, distract, and amaze; where does the sacred realm go? In this paper, I will center the discussion around contemporary cinematic imaginations and recreations of Tibet by Hollywood directors represented by Martin Scorsese and Tibetan New Wave directors represented by Pema Tseden. Through discussing the motivation behind their creation, sacredness inside the text, and contemporary implications of their works in general, this paper will discuss film's mediating role in modern life by reorganizing a way of precepting the sacred.

Inspired by the screenwriter Melissa Mathison, an American director, Martin Scorsese, an American director, shot the film “Kundun” in 1996 Morroco – to avoid forces from the Chinese government in his storytelling of Tibet and Dalai Lama. The film tells the story of the fourteenth Dalai Lama, from birth to the final moment when he is forced to escape to India to avoid prosecution by the Chinese government. At first glance, the idea of a Western director telling a Tibetan story may seem suspicious – and vulnerable to critique through the lens of Orientalism.

From a storytelling point of view, such an indictment is traceable. Written upfront to commence the film, Scorsese claims, "In war-torn Asia, Tibetans have practiced non-violence for over a thousand years." The statement is by no means valid, as claimed by Chirico: "Dalai Lamas have advocated violence as a means of preserving Tibet and the Buddha Dharma. (Chirico, 2019)" This indicates, to a certain extent, Scorsese's ideal imagination of Tibet and his fall into Orientalism romanticization of Tibet as a pure, clean, and perfect land. In addition, politically, according to Chirico, Gestures were made toward Feudalism in Tibet, but they were insufficient in showing that the Chinese could have a point. In Kundun, feudalism in Tibet is exhibited through little Dalai Lama's growth – he seeks reforms, such as rejecting unnecessary etiquette between himself and the monks. Still, Scorsese did not criticize the feudal system but made minor the issue by focusing on Dalai's personal growth. His portrayal of Chairman Mao further reflects this tendency: Mao appears as a caricature filled with Marxist clichés and devoid of historical complexity, which raised questions about the film's treatment of cross-cultural political entanglements. I have always had a strong affection towards films that are originated from, created by, and delivered to the same cultural group of people and rendered such as authenticity. In this case, however, the endeavor of this American director in search of meaning from oriental regions is then a production originated from Tibet, by both Tibetan and American and for American audiences.

Despite all Orientalism nitpicking on Kundun, compared to other contemporary directors' work, such as “Seven Years in Tibet,” which depicts a lost Westerner discovering sacredness and redemption in the imagined Tibet, Scorsese follows a comparatively more authentic representation of the Dalai Lama's biography. What does it mean for a film to mediate the sacred across cultural boundaries? Moreover, do both films rely on Tibet as a mediating image through which the West contemplates its desire for transcendence?

Pema Tseden's film provides a comparison from another point of view – a perspective from the locals, with anxieties reflected upon the prevalence of modernity in Tibet. Pema Tseden was born in Hainan Tibetan Autonomous Prefecture of Qinghai Province. He holds a strong cultural memory for the Tibetan people. It would then be safe to say that films by Pema Tseden are from Tibet, by Tibetan, and for Tibet. In his first film, "The Silent Holy Stone," Pema Tseden tells the story of a little monk's journey back to the village where his family lives. During the visit, he witnessed the permeation of modern culture in the Tibetan region. Things like DVD players, television, broadcast players, and snacks from modern Han culture seem incompatible with what Westerners in the 90s imagined as “holiness” in Tibetan culture.

"Focalizer," as Bal suggests, is an agent that indicates the vision that offers a perspective for the viewer (Bal, 1995), which is crucial in understanding Pema Tseden's directorial intention and blocking voyeurism. In this film, the young monk serves as the focalizer, portrayed as both wise and youthful. The film opens with him reciting scriptures in the monastery while eagerly anticipating watching a DVD with the living Buddha – another child monk. This highlights the intersection of tradition and curiosity towards modernity. After the little monk travels back to his hometown for the spring festival, he becomes intrigued by the brand-new television in his home, which plays "Journey to the West." The little monk also heard his brother reading a Chinese textbook and heard from him a dream to go to big cities. The little monk expresses his love and curiosity in all his witness of modernity in Tibet. However, when he hears his younger brother enthusiastically praising the wonders of Han culture’s math lessons, he proudly talks about Tibetan astronomical and calendrical calculations. Overall, he makes his judgment. Though he enjoys watching television, as a monk, he prefers Journey to the West, which depicts a monk's journey to acquire Buddhist truth and deliberately avoids TV dramas that depict secular romantic relationships.

In Scorsese and Pema Tseden's depiction of early 20th-century Tibet, Durkheimian defined sacred and transcendence as constructed in different manners. According to Siefert, in her book chapter discussing the lost imperialism in the 20th century United States, Shangri-La is a place of unrivaled peace and the wisdom lost to Western modernity in the wake of both the Great War and the Depression (Siefert, 2015). After experiencing the loss of faith in humanity and the capitalism bubble, Shangri-La, Tibet, and the imagination of transcendence in the Far East becomes the perfect place for seeking redemption and holiness. In Kundun, close-up shots of bronze Buddha sculptures recur throughout the film, emphasizing this search for holiness through aesthetic and symbolic repetition. Applying the concept of gaze – a look that a-historizes and disembodies itself and objectifies the contemplated object (class/4.3) – it could be analyzed that gazing at Dalai Lama and the temples is not Buddha, but Martin Scorsese himself while interviewing Dalai Lama. Following mostly after close-ups of Dalai Lama, these images appear not only as an indication of Dalai Lama’s legitimacy in being a mystical “chosen one" but also the image of seeing the personified god and purified land of Eden.

![](assets/writings/cinematic-sacredness/still-1.jpg)
![](assets/writings/cinematic-sacredness/still-2.jpg)

![](assets/writings/cinematic-sacredness/still-3.jpg)
![](assets/writings/cinematic-sacredness/still-4.jpg)

For “The Silent Holy Stone,” can we honestly say that Pema Tseden's Tibet escapes the mechanics of the gaze, or is it simply a gaze that turns inward – a self-reflexive, yet still constructed look? Pema Tseden's cinematic Tibet is not an "objective" reflection of reality but a mediated construction shaped by his subjective framing, compositional choices, and structured narratives. Throughout the film, unlike Kundun, which employs numerous moving shots and close-ups designed to provoke emotional responses from the audience immersed in the dark theater, Pema Tseden takes a different approach. He avoids emphasizing the protagonist's facial expressions, characterizing his cinematic style with restraint and composure. This approach breaks the imagination of a "mystical Tibet" and instead presents the region through his lens of everyday life realism. However, this does not imply that Pema Tseden's representation of Tibet is an unmediated reality. On the contrary, it is still a carefully constructed cinematic reality that offers an alternative image of Tibet that resists romanticization and imagination while having a discussion around tradition and modernity.

Thus, the center of discussion lies not on whether reality is gazed upon or not but on who does the seeing and how the product of seeing mediates reality. Comparing the structure of "Kundun” and “The Silent Holy Stone,” it’s worth noting that both protagonists in the film encounter anotherness that intrudes into their lives. For Dalai Lama, it is the communists invading their land, and for the little monk, it’s the gradual modernization that seems to demystify the sacred, commercialize experience, and reduce belief to spectacle. Building upon this parallel, both “Kundun” and “The Silent Holy Stone” can be seen as narratives of resistance – each protagonist, in their own context, is confronting an otherness that unsettles their world's spiritual and cultural fabric. The “otherness” here—whether in the form of political violence or modernization—is not just an external threat but a force that reveals inner truths. Through their encounters with this otherness, the films do not simply document loss or intrusion; they visualize a struggle to preserve meaning, to re-enchant the sacred within a transforming world. The sacred, then, is activated and made perceptible through contrast and conflict.

To prevent the discussion from falling again into the dualism of sacred and secular that mystifies the transcendence and reduces it to abstract symbolism, an overarching implication is needed to clarify the sacred product of cinematic sites. To interpret from Professor Angela Zito’s essay announcing that “we should examine how media practices make experiences and values ‘sacred’ (Zito, 2007),” theologies, doctrines, and religious symbols in films are all supplementary material to produce the cinematic sacredness. In this view, the sacred is not a fixed theological being waiting to be discovered and gazed upon, but something dynamically constructed through cinematic form using sound, image, narrative, etc. Martin Scorsese represents and revitalizes Tibet in Morocco through cinematic constructions that place the audiences in the lost world of Tibet and thus proves to American audiences (though Disney is discouraged from screening publicly the film due to forces from the Chinese government) that there could be an oriental magic land existing with them. Comparatively, Pema Tseden captures in-depth the reality of Tibetan people’s lives and proves to Chinese audiences that a truth-bearing character – the little monk – can take the essence and discard the useless from the incoming modernism wave. Through the construction of these cinematic worlds, shaped by each director’s perceived reality, the film functions not merely as a reflector of religious tradition but as an active site where sacred meaning is invented and reconfigured. In this way, cinema emerges as a medium of modern religion – an art form born of modernity participating in the continual reinvention of society.

---

<em>Final project for Religion and Media (Professor Angela Zito), May 2025.</em>

## References

Bal, M. (1995). Reading The Gaze: The construction of Gender in ‘Rembrandt.’ In How obvious is art? (pp. 147–173). https://doi.org/10.1007/978-1-349-24065-4_8

Benjamin, W. (2007). The work of art in the age of mechanical reproduction. In SAGE Publications Ltd eBooks (pp. 25–33). https://doi.org/10.4135/9781446269534.n3

Chirico, K. P. S. (2019). Scorsese’s Kundun as Catholic Encounter with the Dalai Lama and His Tibetan Dharma1. In BRILL eBooks (pp. 171–195). https://doi.org/10.1163/9789004411401_010

Comaroff, J. (1994). Defying disenchantment. reflections on ritual, power, and history. In University of Hawaii Press eBooks (pp. 301–314). https://doi.org/10.1515/9780824842529-014

Siefert, M. (2015). Frank Capra’s Eastern Horizons: American identity and the cinema of international relations. Historical Journal of Film Radio and Television, 35(3), 539–541. https://doi.org/10.1080/01439685.2015.1059618

Zito, Angela. “Can television mediate religious experience? The theology of Joan of Arcadia” in Religion: Beyond a Concept, edited by Hent DeVries. Fordham University Press, 2007. pp 724-738.`,
  }),
  essay("Affordable Housing or Public Space", "2024-10-23T00:00", {
    dek: "A Case Study on Elizabeth Street Garden",
    tags: ["Research"],
    pdf: "assets/files/elizabeth-street-garden.pdf",
    body: `On May 10, 2024, while riding a Citi Bike down Elizabeth Street in Little Italy, I caught sight of an intriguing open garden bathed in the warm glow of the sunset. Though captivated, I decided not to stop for a closer look. Three months later, upon returning to New York after traveling, I remembered the spot and resolved to explore it. On August 25, 2024, I entered the garden and immediately noticed a banner on my left reading, “Help Save the Garden.” Scanning the QR code beside it, I unknowingly embarked on a journey to uncover the challenges facing this unique space. A flyer at the site explained that the garden is kept open to the public by neighborhood volunteers, offering hundreds of free community programs across its 20,000 square feet of green space and ornamental sculptures.

![](assets/writings/elizabeth-street-garden/fig-1.jpg)

After learning more about the functions of community boards and its advisory role in the society, I decide to go to Community board 2 to dive more deeply into the subject. On September 12th, 2024, after registering through the community Board No. 2’s official website, I went to a routine meeting featuring Landmarks Committee 1.

Community Board 2 (CB2) addresses key concerns related to development, planning, land use, and zoning, as well as the delivery of essential City services like sanitation and street upkeep. (Manhattan Community Board 2, n.d.) Located at 3 Washington Square Village, CB2 covers places including Greenwich Village, Little Italy, SoHo, NoHo, Hudson Square, Chinatown, Gansevoort Market, and of course, Elizabeth Street Garden.

Arriving early at CB2’s office, I also met Mark Diller, the district manager. After a short self-introduction of myself and my interest in researching more about Elizabeth Street Garden, he told me that this meeting features entirely on the Landmarks Preservation Committee, or LPC. Also, he introduced me to a lady named Jeannine Kiely, who is the president of “Friends of Elizabeth Street Garden.” I introduced myself to Jeannine and received her contact information.

After a zoom meeting with Jeannie Kiely, the founder of “Friends of Elizabeth Street Garden” at the community board meeting, I kept on contacting her and knew more information about the history of the site, current state of the lawsuit, and efforts community boards had made throughout the years of fighting. Furthermore, I proposed a possible solution after taking a closer look at the issue.

Back in 1822, according to a book named “History of Public-School Society (PSS) of the City of New York,” it documented that “the pastor of the Bethel Baptist church applied to his trustees and requested them to erect a building for a school in Elizabeth Street. (Bourne, 1870)” Having the name of “school No. 5,” the building is subject to charitable trust - a legally binding arrangement that donates assets to a charity or nonprofit for charitable purposes.

The next transfer of property right happened in 1853. As documented in the book of PSS history “The school property remained in the care of the Society until transferred to the Board of Education, in 1853. (Bourne, 1870)”

The area where Elizabeth Street is located, the Little Italy, is traditionally a neighborhood where generations of Italian immigrants have been proud to call home. According to a newspaper published back in 1974, an organization named “The Little Italy Restoration Association” had consulted with the Department of City Planning and proposed a plan in building a 600-pupil elementary school. (Fowler, 1976)

In 1981, a 151-unit building of federally subsidized apartments was built on one end of the parcel, leaving the adjacent 20000 square foot lot vacant until the city leased it for $4,000 a month to Allan Reiver, the owner of an adjacent gallery. (New York Times, 2019) Allan Reiver transformed it into a garden and outdoor exhibition room for architectural garden ornaments. With two lion-shaped sculptures, lush parterres filled with vegetation, and comfortable chairs and tables for relaxation, the Elizabeth Street Garden sends forth an atmosphere of historical relics. That is the reason why the garden differs much from other open spaces. In 1990, according to a report by DNAinfo, the Allan got CB2’s support to lease the lot, where weeds are overgrown, and sculptures are stored. After a year has passed, Allan paid $4000 to the city every month , planted vegetations in the garden, and maintained the garden. (Tcholakian, n.d.)

In 2012, the city council member Margret Chin proposed to make the lot as an affordable housing component to the Seward Park Urban Renewal Area (SPURA). This proposal, the starter of the twelve years fight against demolishing the garden, is later granted by the Department of Housing Preservation and Development (HPD) in 2012 (Colon, 2019). Claiming that SoHo area needs more affordable housing and opportunities to let more people enjoy the area, Ms. Chin has a certain point of argument.

The conflicting issue placed the two most needed spaces - affordable housing and open recreational space – on the opposite sides of discussion. People standing against the demolishment argues that even though creating affordable housing is a must-needed planning to the city, it should not be done at the sacrifice of the public garden. According to New York Times, the city plans to sell the land to build a seven-story, 123 apartment elevators building - Heaven Green - for low-income seniors owned by a construction company called “Penrose.” A rendered image by Haven Green of what the building and the surrounding environment will look like is pasted down below. Comparing to what I saw in the garden in real life, the view of the open space after the new construction lost its sense of history and sense of distilled time.

![](assets/writings/elizabeth-street-garden/fig-2.jpg)

To have a better understanding of the issue, I went to the garden again to investigate on Oct 20th. I walked into the garden from the gate at Elizabeth Street. The other gate is located at Mott Street at the opposite side of the block. I want to the garden in a lovely afternoon with dense people inside, so most of the sittings are occupied with downtown New Yorkers reading, talking, and online working. People love the garden, but the space is not enough.

Under such circumstance, getting rid of the garden and build a new senior affordable is going to post direct harm to the neighborhood’s quality of living. People including Martin Scorsese, Robert Denaro, and Kiki Smith had sent letters to the mayor. Putting the usefulness of these letters from celebrities aside, I agree to what Professor. Broderick said in a class that we shouldn’t be relying on special voices to vote for justice. In all, it should be a collective effort from the community.

During my visit to the Elizabeth Street Garden, I spoke with two volunteers stationed at a table near the entrance. After a brief introduction, I inquired about the current state of the legal efforts to preserve the garden. The volunteers were unable to provide new information beyond what is publicly available, as they are only permitted to discuss official updates published by the garden’s administration. Nevertheless, I asked about an area in the garden that appeared unfurnished and filled with debris. They explained that, due to the financial strain of ongoing legal battles, the garden lacks sufficient funding to repair and maintain this section. Consequently, the area remains in disrepair.

![](assets/writings/elizabeth-street-garden/fig-3.jpg)

The potential destruction of Elizabeth Street Garden threatens not only the community but also the prosperity of nearby businesses and organizations. An open letter to Mayor Eric Adams hosted on the garden’s official website, highlights that the garden draws over a thousand visitors each week, offering significant economic benefits to local businesses. Described as a “unique green oasis” amid the dense urban landscape, the garden serves as both an artistic space and a popular spot for residents and tourists. As of November 6, 2024, a total of 222 organizations and businesses have signed this letter in support of preserving the garden.

During my October 30 visit to nearby businesses, I spoke with locals about their perspectives. At “Lovely Day,” a Thai restaurant located a street away from the garden, I spoke with an employee named Claire. She explained that Lovely Day signed the open letter, adding, “I go to the garden every day before and after work, and so does the owner of this restaurant. She walks her dog in the garden every morning.” Claire also noted the “symbiotic” relationship between the shop and the garden, suggesting that each brings foot traffic to the other.

I also visited “Maguire,” a nearby clothing store, and spoke to the owner, Debb. She shared that while she had signed the letter, she harbored mixed feelings. “I know that maybe the construction of affordable housing could bring me more customers,” she said, “but I’m worried that the sun will be blocked even more. Right now, the buildings nearby already shade the area in the afternoon—I don’t want all the sunlight to disappear.” Her words underscored the broader sentiment: that losing the garden would impact not just residents but the entire local ecosystem of businesses, challenging both the neighborhood’s character and economic liveliness.

Inside a report shared with me from Jeannie, I read a diagram describing acres of parkland per 1.000 residents in relationship to different areas in New York. It is concluded that the Acres of Parkland per 1.000 residents for areas inside CB2 is significantly lower than NYC’s goal. The garden, unfortunately, is in the only downtown neighborhood that NYC Parks defines as underserved by open space. Little Italy & SoHo have even less open space – open space ratio of 0.07 or 3 square foot per person, equalizing to the size of a subway seat. While exploring the Lower East Side and Little Italy, I observed that there are few alternative sites where residents can relax and spend leisure time. One such site is the Dorothy Strelsin Memorial Garden at 174 Suffolk Street (illustrated in the photo on the right), a small rectangular garden that offers a similar sense of tranquility. Visitors there were engaged in activities like meditation and reading. However, this garden is only about one-third the size of the Elizabeth Street Garden, making it insufficient to accommodate large gatherings or public events due to limited space.

![](assets/writings/elizabeth-street-garden/fig-4.png)

![](assets/writings/elizabeth-street-garden/fig-5.jpg)

Jeannie also explained to me the bigger and better alternative for another construction site of the affordable house: the 388 Hudson. At that side, five times as much housing could be established, and the garden wouldn’t have to be destroyed. Officially named the “Win-Win proposal,” it’s proposed by the Council member Christopher Marte. A funding transfer from Haven Green, in collaboration with up-zonings from the Council, can realize up to approximately 705 new affordable housing units and preserve Elizabeth Street Garden. However, the suggestion was not accepted immediately, but after 6 years. According to an interview with Joseph Reiver whose father Allan Reiver was the creater of the garden, he said that: “they started making plans to build on it recently after wasting six years. And then the other sites, they’ve also said similar dismissive things. Maybe they will start building on them too, who knows. (Nevins, 2024)” On the left side is a photograph of 388 Hudson, which is still an open ground garage.

![](assets/writings/elizabeth-street-garden/fig-6.jpg)

As for the current state of the garden till October 29th, according to Architectural Record, an order is enacted to vacate the property was issued for September 10, but the garden, facing significant challenges, was granted an additional two weeks when an appeals court judge suspended the eviction notice. It now has permission to stay open until at least October 30 (Schulman, 2024). As the new deadline approaches, the future of the garden remains uncertain. On November 2nd, advocates of Elizabeth Street Garden claims that their eviction has been paused pending an appeal, which means that the case is currently scheduled for February 2025 (Houlis, 2024).

In conclusion, the Elizabeth Street Garden stands as a rare and cherished green space in a densely populated area of New York City with both historical and cultural value. It provides both a landmark and a recreational haven for the community. This ongoing dispute over its potential demolition and redevelopment reflects broader challenges in the process of urban planning, where the need for affordable housing shall be balanced with preserving public spaces that contribute to both the residents’ quality of life and the prosperity of the businesses and organizations adjacent to the site. Despite advocacy from prominent individuals, local businesses, and community groups, the garden’s future remains uncertain as it faces impending legal and political obstacles few months later. This case highlights the importance of inclusive community decision-making and the need for sustainable solutions that address multiple needs from people without sacrificing one for the other. Furthermore, the proposed alternative site at 388 Hudson presents a viable “win-win” solution, underscoring the possibility of constructive collaboration between housing and preservation goals. As the community continues to advocate for the garden, its fate rests on the outcomes of the upcoming appeals, leaving the future of this unique green oasis in question.

---

<em>Written for Shaping the Urban Environment (Professor Mosette Broderick), October 2024.</em>

## References

A Lush Urban Garden or Senior Citizen Housing: Which Would You Choose? (2020). New York Times. https://www.nytimes.com/2019/03/07/nyregion/garden-little-italy-senior-housing.html

Bourne, W. O. (1870). History of the Public School Society of the City of New York. http://ci.nii.ac.jp/ncid/BA19342182

CB2 Manhattan Community Board – Manhattan Community Board 2. (n.d.). CB2 Manhattan Community Board - Manhattan Community Board 2. https://cbmanhattan.cityofnewyork.us/cb2/

Colon, D. (2019, January 23). Inside the fight over the Elizabeth Street Garden. Curbed NY. https://ny.curbed.com/2019/1/23/18194444/nolita-new-york-affordable-housing-elizabeth-street-garden

Fowler, G. (1976). City, to revive and refurbish little Italy. Nytimes. https://www.nytimes.com/1974/09/20/archives/city-to-revive-and-refurbish-little-italy.html

HomeElizabeth Street Garden | Friends of Elizabeth Street Garden. (n.d.). https://elizabethstreetgarden.org/

Houlis, K. (2024, November 3). Eviction of NYC’s Elizabeth Street Garden paused pending an appeal. CBS News. https://www.cbsnews.com/newyork/news/elizabeth-street-garden-eviction-paused-pending-appeal/

Nevins, J. (2024, October 23). Meet Joseph Reiver, the man fighting to save the Elizabeth Street Garden. Interview Magazine. https://www.interviewmagazine.com/culture/meet-joseph-reiver-the-man-fighting-to-save-the-elizabeth-street-garden

Schulman, P. (2024, October 28). Elizabeth Street Garden gets temporary stay of eviction. Architectural Record. https://www.architecturalrecord.com/articles/17174-elizabeth-street-garden-gets-temporary-stay-of-eviction

Tcholakian, D. (n.d.). Here’s what you need to know about fight over Elizabeth Street Garden - Nolita - New York - DNAInfo. DNAinfo New York. https://www.dnainfo.com/new-york/20160918/nolita/heres-what-you-need-know-about-fight-over-elizabeth-street-garden/

Wiseman discusses public welfare. (n.d.). Studs Terkel Radio Archive. https://studsterkel.wfmt.com/programs/frederick-wiseman-discusses-public-welfare`,
  }),
  essay("Vicinity, Volume, and a Progressive Sense of Place", "2025-12-03T00:00", {
    dek: "Migrant Infrastructures and Everyday Practices at Dong Xuan Center",
    tags: ["Research"],
    pdf: "assets/files/dong-xuan-center.pdf",
    body: `## 1. Introduction

Discourses under the topic of migration, sense of belonging, and community formation have been a crucial component of urban and cultural geography studies. Questions were asked regarding the survival ship, rights to space, and rights to live of minority groups in society based on egalitarian principles. Meanwhile, concerns were also suggested on the commercialization and essentialization of communities that aware us also on the danger of capital intrusion. Within this broader discussion, both existing scholarship on the area’s history and a 2025 report issued by the local district indicate that the Dong Xuan Center (DXC), a market in Lichtenberg, Berlin shaped strongly by Vietnamese traditions, offers a particularly compelling site for examining the dialectical relationship between economic logics and modes of social survival. The DXC makes visible both the economic vitality that provides a hub for migrant groups’ sense of belonging and the regulatory restrictions imposed by local authorities. Discussions around DXC makes it a key site for reflecting how migrant communities could negotiate existence and belonging in modern capitalist cities.

Aside from historical, political, and theoretical inquiries, this paper takes on a fresh perspective through ethnographic observation of the visible nearby. Instead of approaching the market as a static ethnic site or a poli-economic zone of interest, this paper observes the DXC as a daily infrastructure and give back the agency to members inside, including Vietnamese, Turkish, Indian, and Chinese vendors. Through ethnographic observation, this paper asks the research question of how Vietnamese and other migrant entrepreneurs at the Dong Xuan Center negotiate their sense of belonging through embodied practices within the everyday vicinity of the community.

## 2. Review of the Literature

Vietnam communities in Berlin have a highly heterogeneous history. Generally, two main groups immigrated from Vietnam. The first were refugees who arrived in the Federal Republic of Germany (FRG) under the Geneva Refugee Convention after the Vietnam War (Beth & Tuckermann, 2012). The East German government, through its close relations with North Vietnam, signed an agreement that brought 70,000 Vietnamese contract workers to East Germany (Nguyễn, 2024). Around 2005, Vietnamese contract workers established the Dong Xuan Center, making it the core of Vietnamese cultural and economic life in East Germany. However, Nguyễn (2024) noted that Western boat immigrants did not visit until 2010. Immigrants at the DXC were considered loyal to socialist Vietnam. Today, segregation is less pronounced, thanks to third-wave migration and generational change.

A paper on the "Transformative power of arrival infrastructures" describes DXC as an outcome of the marginalized economic situation of Vietnamese Berliners. They faced labor market exclusion in the early 2000s (Kreichauf et al., 2020). The author identifies two types of infrastructure. One is shaped internally, by sustained social and cultural networks. The other is shaped externally, by systems of governance and economic logic (Kreichauf et al., 2020). Ethnic economies, from an external perspective, play a crucial socio-economic role. They provide employment and services within migrant networks and serve as visible sites between marginalized groups and the wider urban economy. Schmiz and Kitzmann examined immigrant entrepreneurs as agents bridging internal and external infrastructures. Entrepreneurs create economic and social benefits by promoting their ethnicity (Schmiz & Kitzmann, 2017).

While entrepreneurial agency in such infrastructures makes minority economies visible, it also raises questions about the commodification of cultural difference. What do we really mean when discussing diversity in a society? Is it an ideology that celebrates difference and encourages speaking up, or a set of moral guidelines that promotes equity? Maybe neither answer catches the telos of this celebrated liberal concept of multiformity. As Lee (1992) warned in his essay on commodification of ethnicity, “a celebration of ethnic diversity is prone to criticism of essentialism, be it through parades or festivals as place-making activities or through branding initiatives, e.g., of Chinatowns.” The ethnic diversity is transformed into a social spectacle that’s easily commercialized. Toward the further development plan of DXC of “developing a Chinatown-style neighborhood with housing, business areas, kindergartens… (Kreichauf et al., 2020)” Local governments in Berlin react in a defensive manner, fearing the formation of a “parallel society.” In line with the Urban Development Plan for Industry and Commerce, the Lichtenberg authorities rejected DXC’s plan to transform the land use from industrial to mixed-use retail (Schmiz & Kitzmann, 2017).

At first, the link between commercialization and the essentialization of minority communities seems plausible. However, upon closer inspection, if we view diversity and mobility only through a cultural lens and ignore power and material conditions, anti-essentialism loses its force. Veronis (2007), in a study of Latin Americans in Toronto, explained that minority spaces form through experiences of 'othering' and constant engagement with difference and exclusion. This situation mirrors hardships faced by Vietnamese groups. Veronis (2007) further stated that being labeled 'Other' becomes a political identity used to fight exclusion. If we discuss anti-essentialism without considering minority groups' living conditions, it becomes a romanticized ideal. Commercialization and the symbolization of identity are not always forms of estrangement. Instead, they may help build subjectivity and identity. Massey's essay on "a global sense of place" argues that the specificity of a place comes from the unique constellation of social relations. These relations meet at a particular location (Massey, 1991). She opposes a reactionary sense of place and believes that as time and space compress, we also need a progressive view. This vision parallels Veronis (2007), who describes the "barrio latino" and "casa" as "third spaces"—arenas where Latin Americans negotiate identity, community, and citizenship.

The literature reveals a dialectical relationship between material survival and symbolic belonging. Minority groups rely on economic participation for their livelihoods while also seeking a sense of togetherness that resists commodification. Biao Xiang (2021) describes vicinity as a reconciliation of this tension, where physical estrangement is felt, and togetherness is imagined. When experience and symbolism are divided, meaning is lost. Vicinity thus forms a site where daily encounters build social ties. Similarly, Gieseking (2015) argues that physical presence and repeated encounters create the 'volume' of urban spaces, giving depth to social relations through embodied experiences. Both concepts highlight how daily interactions spatially and socially shape communities.

This paper also draws on Yi-Fu Tuan’s spatial ethics, which emphasize being with the world in a sympathetic, meaningful way. Guided by Tuan and Xiang’s ideas, the analysis connects the material and emotional aspects of the Dong Xuan Center to broader questions of how people coexist. The paper argues that the DXC is a progressive space for coexistence, where social and spatial relationships interact. By focusing on everyday negotiations within the DXC, the analysis aims to overcome the simple binary of commodification versus authenticity, showing how practices in the center shape its development.

## 3. Method: Descriptive Ethnography

To understand how migrant entrepreneurs at the Dong Xuan Center negotiate their sense of belonging, I combined primary and secondary sources. Primary sources consist of direct observations, mapping based on participation, sensory ethnography, the latest government documents from 2025, and casual interviews. Secondary sources include journal articles, online websites, and books.

For my personal observations, from September to December 2025, I visited the Dong Xuan center 9 times and spent a decent amount of time at each visit. I interviewed merchants and customers, mapped out DXC, and observed the surroundings while participating. Such first-person engagements are central to understanding vicinity, as conceptualized by Xiang Biao, where meaning is produced through bodily presence and everyday encounters. After each visit, I would immediately record what I observed on my phone as an audio file so that I could review it when writing. I used these techniques not only to critically observe the space but also to engage with the community, build stronger relationships, and encourage more interactions. All observations respect anonymity, and no personal data or identifying details were recorded.

Reflecting on my methodology, the combination of primary and secondary sources shows a complementary effect, largely due to my limited access to official administrative documents from DXC. In addition, because of my limited proficiency in German, I could not communicate smoothly with most Vietnamese merchants, so I relied on a trusted translator in several interactions; this aspect will be further described later. Moreover, since each visit to DXC required at least 3.5 hours, including travel time, I had to manage my daily routine and deliberately engage with the field. I achieved this by integrating DXC into my own practical, lived needs—shopping for groceries, repairing my friend’s computer, eating, and doing my nails—which became part of my everyday life in Berlin. It is also worth noting, with reflexivity, that my positionality as a Chinese student shaped how vendors engaged with me. I was perceived primarily more as a customer rather than a researcher, which facilitated certain interactions during my visits.

## 4. Conceptual Framework

This paper draws upon three main concepts suggested by past scholars: progressive sense of place, volume of space, and vicinity. Through engaging with these concepts, this paper provides an analytical framework on how migrant entrepreneurs and workers at DXC negotiate a sense of belonging through everyday practices.

Following Massey’s proposition of a progressive sense of place amid modernization, I treat DXC as a place with a non-static identity, non-enclosed boundaries, and a mix of broader social relationships. This lens provides me with a sense of distributed power that is absent in a top-down unity. Instead, power emerges from DXC’s relationships with the outer world, which shapes its trading practices, internal arrangements, and diasporic stories.

Secondly, volume of space, as Gieseking implemented in her analysis of lesbian struggles in New York City, informs my analysis of DXC as a tool for engaging with bodily presences in DXC. As volume of space captures the compound result of bodily crossing-over, essentially, how people move among DXC, the walking routes, smell, and division of spaces, it provides informative materials on analyzing bodily engagements with the community and the formation of social networks within the community.

Thirdly, the vicinity, or the scope of vision suggested by Xiang, provides the basis for my analysis of DXC as a lens for observing the surroundings from the perspectives of merchants, customers, and nearby residents. As a major unit in the middle of Lichtenberg, this paper investigates the role that DXC plays as a unique entity in the daily lives of people in the surrounding area. Through observing festivals, special commodities, and ethnic food, I treat DXC itself as a site for constructing a material sense of the nearby.

## 5. Case Study Description

### a. Arrival at DXC: Sensory and Visual

During my first visit to DXC, instead of taking the tram that would have brought me directly to the main entrance, I followed Google Maps while riding a bike and accidentally rode into a warehouse stacked with bottled drinks. The space's stillness felt unsettling. I was unsure whether I had trespassed. Walking through the narrow aisles, I eventually found an exit that opened into the northern edge of the Dong Xuan Center.

![Figure A: Warehouse south of DXC. Shot by author](assets/writings/dong-xuan-center/fig-a.jpg)

![Figure B: Interiors. Shot by author](assets/writings/dong-xuan-center/fig-b.jpg)

There are seven rectangular halls in DXC, each roughly the size of half a football field and only one story high. Unlike modern malls or shopping centers, their appearance is plain and industrial. Inside each hall, the space is split into two long sections, with shops lined up in parallel rows on both sides. A narrow, straight aisle runs through the middle, connecting both entrances and leaving each business enough room for both retail activities and wholesale storage. Walking through the halls, I constantly noticed a pungent smell and kept wondering what it was. I finally figured it out later when I was getting my nails done at DXC—it was the scent of fake nail powder. It was so strong that it even overpowered the smell of food, though I eventually got used to it. Feeling a bit tired after browsing the entire area, I saw businesses including restaurants, nail salons, barbershops, grocery stores, markets, and other retail shops. Among all kinds of shops, I found more guest traffic in markets and salons, and fewer in retail shops. Through observing the merchants and language, I found that the businesses are mostly owned by Asian, Turkish, and Arabic immigrant entrepreneurs. As for customers, the race seems mixed. From my personal observation, the guest flow is slightly higher than on weekdays, given its closure on Tuesday rather than Sunday.

![Figure C: Hall 1. Shot by author](assets/writings/dong-xuan-center/fig-c.jpg)

![Figure D: Mapping. Mapped by author](assets/writings/dong-xuan-center/fig-d.jpg)

### b. Mapping of DXC

The map above illustrates my condensed observational findings from the site. As green color illustrates one’s bodily route, the entrance is right beside the tram stop of Herzbergstraße with the M-line passing through. While red blocks all markets and restaurants, purple blocks indicate other businesses I visited and interacted with. While the red blocks represent all the markets and restaurants, the purple blocks indicate the other businesses I visited and interacted with. When reading the map vertically from top to bottom, a pattern emerges: the number of red blocks increases, suggesting a preference for being located closer to the entrance and therefore better guest flow. Also, by labeling different shops and areas alphabetically, I can more easily locate and refer to them when describing my participation scheme.

### c. Participating in DXC

This descriptive section focuses on subjective participation in DXC. By engaging with the site through practical routines as a resident of Lichtenberg, I seek to understand the space from within, through the embodied perspective of someone who shops, repairs, and eats.

First, I had long wanted to break my nail-biting habit, so I decided it was time to get a manicure. DXC offers plenty of choices that are cheap and professional compared to others. I went to the shop “a” and tried to communicate my demands, but failed due to my lack of proficiency in German. Amazingly, when the Vietnamese receptionist realized I spoke Chinese, she immediately switched to Chinese. Later, I learned that this was because she had spent some time studying at a university in Hong Kong. The manicure costs only 25 euros. Once the work officially began, something unexpected happened: all the staff, including the owner, gathered around me with curiosity. In a brief exchange, I learned the reason: they had never seen a man get his nails done. This surprised me. In Berlin, it is common for men to paint their nails or get manicures, especially in queer-friendly districts. Their surprise made visible the cultural assumptions about ideas about gender, presentation, and norms. Moments later, their comments, laughter, and gentle teasing folded me into their social world. I learned from the receptionist, my gatekeeper, about the site's ethnic distribution. I was told that, except for the businesses run by Vietnamese people, the two halls at the northeastern corner are mostly dominated by Turkish and Arabic businesses (area “G”), and the one labeled area “B” is a cluster of Chinese vendors.

Following her directions, I want to visit Area B during my next visit and stop at a shop that sells watches. The owner, originally from Wenzhou, imports the goods from China and distributes them across Europe. Through an informal interview, I asked the owner some questions regarding her personal and social life. Here are five key takeaways I excerpted from our conversation:

• “My monthly rent is cheap, only about 1,800 euros. Way cheaper compared to the rents in central Berlin.”
• “The center’s advertising helped my business a lot. The Vietnamese owner’s daughter and son have taken over running the place. They did a lot of online advertising.”
• “Doing retail here is tough since thieves come almost every day to steal my watches. We’ve called the police before, but generally it’s useless.”
• “My neighbors and I get along well, if we don’t sell the same stuff. (laughter)”
• “We Chinese mostly stick together. We play mahjong, and we have a Dong Xuan Center group chat on WeChat.” (Translated from Chinese dialogue)

The owner was nice to me. We exchanged contact, and she even invited me to a mahjong night, but unfortunately, I did not have the chance to join. Furthermore, I visited two other Chinese vendors whose views on their business conditions were noticeably less optimistic. One of them complained that she is forced to sell goods at very low prices and can barely make a living. One possible explanation for this stark contrast lies in the type of goods they sell. The vendor who reported barely making a living primarily deals in wholesale clothing: items that appeared old-fashioned and low-priced. From this perspective, the struggle may not simply stem from market saturation, but also from the need for merchandise to adapt to shifting trends and consumer preferences.

![Figure E: Women’s day. Shot by author](assets/writings/dong-xuan-center/fig-e.jpg)

During my subsequent visits to DXC, I came across several gatherings organized by the local Vietnamese community. On October 20th, I walked past a restaurant (area “H”) and noticed several women dressed in ethnic clothing with red flowers and bandanas as decorations. Intrigued, I walked inside and tried to learn about the event from a waiter using Google Translate. I learned that it was a celebration for “Vietnamese Women’s Day.”Inside, nearly every table was filled with women dining together, while men stood nearby holding bouquets of flowers, waiting to present them. The atmosphere was warm, festive, and intimate. Unfortunately, because the banquet was fully booked in advance, I was unable to join the celebration myself.

![Figure F: Google Translation. Shot by author](assets/writings/dong-xuan-center/fig-f.jpg)

Another ceremonial space I encountered was the banquet hall where a wedding was taking place. It was again a coincidental encounter, this time at area “d”, where a relatively more modern architecture takes place. Inside, the hall was filled with bright lights, floral decorations, and round tables arranged in the familiar style of East and Southeast Asian wedding banquets.

![Figure G: Wedding inside a hall. Shot by author](assets/writings/dong-xuan-center/fig-g.jpg)

### d. DXC and Restrictions from Local Government

The newest report published by the Lichtenberg district (Bezirksamt Lichtenberg von Berlin, 2025) on the commercial use of land aligns with the paper by Schmiz and Kitzmann (2017). It claimed that DXC is considered a “special center (Sonderzentrum)” that “no further retail growth shall occur (kein Einzelhandelswachstum erfolgen).” The reason for its classification as a “special center,” as the report explains, is that the Dong Xuan Center is a predominantly Asian-oriented commercial and service location. And due to the “highly specialized assortment, wholesale orientation, and regionally oriented customer base, " it disqualifies it from fulfilling the everyday needs of nearby residents. (Bezirksamt Lichtenberg von Berlin, 2025)” In short, in 2025, the DXC is approached by local authorities with a conservative attitude, thereby placing the burden of negotiation and survival largely on the migrant entrepreneurs who inhabit it.

## 6. Discussion

While the Lichtenberg retail plan argues that the DXC’s “highly specialized” product range prevents it from serving local everyday needs, my ethnographic observations reveal a different lived reality. The district fails to acknowledge the everyday relational infrastructures of survival ships that operate through migrant economies, generating a “place of sense” in the broader neighborhood. In the discussion section, two main perspectives will be considered, one from within, including the business owners and cultural practitioners, and the other from without, including travelers and nearby residents.

Firstly, DXC itself demonstrates a basic “place of sense” through its daily use and existence. According to Kreichauf et al. (2020), DXC, as a “basic infrastructure,” empowers migrants by enabling arrival, belonging, mobility, and economic activity. Through repeated trading practices, DXC accumulates agency by circulating in Berlin’s discourse as a node of cultural presence, which attracts a wide range of visitors.

Secondly, the “sense of place” then emerges from relational practices. As an import and export center in Europe for Asian goods, DXC serves as the hub for transnational trade (Kreichauf et al., 2020). My encounters with Chinese and Vietnamese entrepreneurs reveal their business practices, including importing from their homeland and exporting around Europe. This situates DXC in a web of global connections. This relationality resonates with Massey’s argument that places are “constructed out of social relations…meeting and weaving together at a particular locus (Massey, 1991).” DXC embodies precisely such a place. From merchants selling the newest version of Labubu to those who provide nail materials and services across Europe, DXC’s meaning emerges not solely from “ethnic character” but from its everyday function as a relational infrastructure that connects Berlin and Europe to wider Asian worlds. The relational value is also generated from within, through, for example, every merchant’s psychological mapping of DXC, togetherness between Chinese merchants and their community, and the mutual struggle against thieves.

Thirdly, the volume of space that pronounces the immigrant identity is generated through cultural practices. Gieseking’s idea of volume emphasizes bodily movements, gathering, and leaving traces in space. The celebrations I encountered, including Vietnamese Women’s Day at a restaurant and a wedding banquet, accumulate in spatial memory. DXC thus becomes a site of cultural reproduction that allows migrant communities to continuously remake their identities through everyday rituals and shared practices. In addition, the smell of nail polish also adds a layer to its unique, sensational character. Therefore, DXC’s volume is produced by the very communities that inhabit it, making the site more than just a marketplace.

By framing the analysis externally, DXC creates a sense of community for residents. Contrary to the district’s classification of the center as a special provider of cultural goods with little relevance to everyday demand, my observations suggest otherwise. What I encountered are affordable services, including nail salons, hairdressers, and phone and computer repair shops. They met my practical needs during fieldwork and are likely to be necessary for the daily routines of nearby residents. In this sense, DXC participates in what Xiang Biao (2021) calls vicinity. DXC thus becomes a site for showing how commercial interests and relational connections can co-exist. Analyzing from this angle, one cannot ignore the broader commercial considerations behind the government’s restrictive stance toward DXC: the competition between DXC and other retail centers in Lichtenberg, which is never explicitly addressed in planning documents but could nevertheless affect policy decisions. This becomes one of the future research possibilities.

## 7. Conclusion

Taken together, the findings from this paper suggest that the Dong Xuan Center functions less as a bounded, paralleled ethnic enclave than as an infrastructure in which material survival, spatial practice, and symbolic belonging are continuously generated. In this paper, it is argued that, rather than confirming a duality between commodification and authenticity, everyday interactions within DXC demonstrate how migrant entrepreneurs actively constitute a relational sense of place through their embodied presence. In this light, the center’s significance lies not only in its economic role but in its capacity to generate a lived spatial ethic that foregrounds the ongoing production of social ties within the constraints of contemporary urban governance in Berlin.

---

<em>Individual research for Global Connections, NYU Berlin, December 2025.</em>

## Use of AI

For the use of AI, I used ChatGPT to help me translate and explain the document “Entwurf Zentren- und Einzelhandelskonzept für den Bezirk Lichtenberg von Berlin – Fortschreibung 2025” published on “mein.berlin.de.” I used Grammarly to fix my language.

## Citation

Geschichte, Arbeit und Alltag vietnamesischer Migrant_innen. In K. N. Ha (Hrsg.), Asiatische Deutsche. Vietnamese Diaspora and Beyond (Pp 99–117). Hamburg, Berlin: Assoziation A. (o.D.). -.

Gieseking, J. J. (2015). Crossing over into neighbourhoods of the body: urban territories, borders and lesbian‐queer bodies in New York City. Area, 48(3), 262–270. https://doi.org/10.1111/area.12147

Kreichauf, R., Rosenberger, O. & Strobel, P. (2020). The Transformative Power of Urban Arrival Infrastructures: Berlin’s Refugio and Dong Xuan Center. Urban Planning, 5(3), 44–54. https://doi.org/10.17645/up.v5i3.2897

Lee, D. O. (1992). Commodification of Ethnicity. Urban Affairs Quarterly, 28(2), 258–275. https://doi.org/10.1177/004208169202800204

Massey, D. (1991). A Global Sense of Place. -, 146–156. https://doi.org/10.4324/9780203931950-45

Nguyễn, N. H. C. (2024). Routledge Handbook of the Vietnamese Diaspora. In Routledge eBooks. https://doi.org/10.4324/9781003036104

Schmiz, A. & Kitzmann, R. (2017). Negotiating an Asiatown in Berlin: Ethnic diversity in urban planning. Cities, 70, 1–10. https://doi.org/10.1016/j.cities.2017.06.001

Tuan, Y. (2014). Romantic Geography: In Search of the Sublime Landscape. https://muse.jhu.edu/chapter/992344/pdf

Veronis, L. (2007). Strategic spatial essentialism: Latin Americans’ real and imagined geographies of belonging in Toronto. Social & Cultural Geography, 8(3), 455–473. https://doi.org/10.1080/14649360701488997

Xiang, B. (2021). The nearby: A scope of seeing. Journal Of Contemporary Chinese Art, 8(2), 147–165. https://doi.org/10.1386/jcca_00042_1

Bezirksamt Lichtenberg von Berlin. (2025). Entwurf des Zentren- und Einzelhandelskonzepts für den Bezirk Lichtenberg in Berlin – Fortschreibung 2025 [Draft centers-and-retail concept for the district of Lichtenberg, Berlin – 2025 update]. https://www.berlin.de/`,
  }),
  essay("Eavesdrop", "2026-09-08T00:00", {
    dek: "An afternoon on a Washington Square Park bench, a phone left recording, and a conversation about eggs.",
    tags: ["Prose"],
    body: `“Just a tiny bit closer…”  I dragged my body like a wriggling snail along the bench. I stopped as I sensed the smell of the baguette inside the old lady’s bag; That’s when I realized I’d reached the minimum social distance. I glimpsed their lips moving, but all I could hear was the sound of a contrabass from the other side of Washington Square Park. Till that day, I had never considered jazz cacophonous.

I chose to stay nonetheless, for not often would I have such leisure of relaxing in a Park bench, bathing in early fall sunshine while inhaling second-hand marijuana.

Maybe it was a COVID aftereffect that my auditory perception had degraded, or maybe the old couple had noticed my clownish sitting pose, either way, I hear nothing but jazz.

Change of strategy.

I took out my phone, placed it between the couple and me, then turned on an AI transcription software (which I found exciting probably due to the unethicalness), hoping to capture from their mouths something useful for this writing assignment.

Then I sat straight. The jazz sounded less annoying as I wondered what could possibly be transcribed. Should it be some sensational gossip? Something such as a conspiracy theory I’ve never heard of or a dark secret from the couple that they used to be sex murderers or the confirmation of recent rumors that the president had died…? Not actually. Judging by their expression it maybe just small talks. I don’t like small talk, since I’m not good at it. Are they even a couple?

Aside from the jazz, what I could hear were some blurry chit-chats from people. What was there to laugh at. What was so funny?  Hold up. Where did all those negativities came from? Maybe I’m just having a bad day, even under this lovely weather. Think positively: I was listening to free Jazz without accidentally catching the musicians' eyes which would then oblige me to tip…

The couple left. I turned my phone on, it reads:

> “Let’s sit here for a minute. Sit here for a minute shall we? Do we have eggs at home? We had a boiled egg. Not a lot. Yes we have some. Trying to get rid of some of that stuff in the freezer. No, not if we go out to Dinner with Daniel. Tomorrow is what…Sunday? Let’s go.”(Granola Transcription Sept 8th.)

It turned out to be about eggs. My mother once said you should never let eggs run out in your fridge. It seems like an internationally recognized thing.

I left and went and bought some eggs.`,
  }),
  // essay("Title", "2026-09-16T00:00", {
  //   dek: "One sentence on what it's about.",
  //   tags: ["Film"],
  //   body: `First paragraph.
  //
  // Second paragraph.`,
  // }),
].sort((a, b) => b.at.localeCompare(a.at));

let ROOT;
const INDEX = new Map();                 // id -> node, rebuilt on every tree change
function setTree(folderTops) {
  // drop known content into folders by name (survives Supabase folder loads),
  // with nothing to keep in sync by hand.
  const content = folderContent();
  (function place(list) {
    list.forEach(n => {
      if (n.children) {
        if (content[n.name]) n.children.push(...content[n.name].map(c => ({ ...c })));
        place(n.children);
      }
    });
  })(folderTops);
  ROOT = folder("Home", "2026-07-18T09:00", [...folderTops, ...DESK_FILES()], "desktop");
  INDEX.clear();
  (function link(node, parent) {
    node.parent = parent; INDEX.set(node.id, node);
    (node.children || []).forEach(c => link(c, node));
  })(ROOT, null);
}
setTree(defaultFolders());               // render immediately; Supabase refines it at boot

const LINKS = [
  { id: "vimeo", name: "Vimeo", icon: "s-vimeo", href: "https://vimeo.com/haolangli" },
  { id: "instagram", name: "Instagram", icon: "s-ig", href: "https://instagram.com/YOUR_IG" },
  { id: "spotify", name: "Spotify", icon: "s-spotify", href: "https://open.spotify.com/user/mws60vypvaj8xc6ldz50t98ky?si=12b56e912e50412c" },
  { id: "x", name: "X", icon: "s-x", href: "https://x.com/YIPIhaolang" },
  { id: "contact", name: "Contact Sheet", icon: "s-mail", contact: true },
  { id: "arena", name: "Are.na", icon: "s-arena", href: "https://www.are.na/haolang-li/channels" },
];

const TAG_COLORS = ["#FF9F0A", "#FF453A", "#0A84FF", "#FFD60A", "#BF5AF2", "#FF9F0A", "#FF453A"];

/* ================= routing: every node is a real, shareable URL =========
   GitHub Pages has no server-side routing, so a direct hit on e.g.
   /films/reviews is caught by 404.html, which stashes the intended path and
   bounces to "/"; initialNodeFromLocation() reads it back on boot. From
   then on, entering a page pushes a real browser history entry — via
   window.history, since `history` below is the app's own (unrelated) stack
   and shadows that name inside this file.
   The path mirrors the tree exactly, one slugged segment per level —
   /films/film-projects/static — so it stays correct as sections grow
   sub-folders and those sub-folders grow their own content, with nothing
   to keep in sync by hand. */
// a title with no Latin letters at all (a Chinese essay title) keeps its own
// characters instead of collapsing to an empty segment
const slugWith = (s, re) => s.toLowerCase().trim().replace(/&/g, "and").replace(re, "-").replace(/^-+|-+$/g, "");
const slugify = (s) => slugWith(s, /[^a-z0-9]+/g) || slugWith(s, /[^\p{L}\p{N}]+/gu);
function pathForNode(node) {
  if (!node || node === ROOT) return "/";
  const parts = [];
  for (let n = node; n && n !== ROOT; n = n.parent) parts.unshift(slugify(n.name));
  return "/" + parts.join("/");
}
function nodeForPath(path) {
  const parts = (path || "/").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  let node = ROOT;
  for (const part of parts) {
    let seg = part; try { seg = decodeURIComponent(part); } catch {}
    const next = (node.children || []).find(c => slugify(c.name) === seg.toLowerCase());
    if (!next) return ROOT;   // unknown path — same fallback as before
    node = next;
  }
  return node;
}
function syncUrl(push) {
  const path = pathForNode(cwd);
  if (encodeURI(path) === location.pathname) return;
  window.history[push ? "pushState" : "replaceState"](null, "", path);
}
function initialNodeFromLocation() {
  let path = location.pathname;
  try {
    const saved = sessionStorage.getItem("hl-redirect-path");
    if (saved != null) {
      sessionStorage.removeItem("hl-redirect-path");
      path = saved;
      window.history.replaceState(null, "", path || "/");
    }
  } catch {}
  return nodeForPath(path);
}
const currentSlug = () => location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

/* ---- contact sheet: a full page of its own, not part of the folder tree ---- */
function showContactSheet() {
  hideWindow("min");
  els.contactLayer.hidden = false;
  document.body.classList.add("contact-on");
}
function hideContactSheetUI() {
  if (els.contactLayer.hidden) return;
  els.contactLayer.hidden = true;
  document.body.classList.remove("contact-on");
  openWindow();
}
function openContactSheet() {          // user clicked into it: push a real entry
  if (!els.contactLayer.hidden) return;
  showContactSheet();
  window.history.pushState(null, "", "/contact");
}
function closeContactSheet() { window.history.back(); }
// browser back/forward: resync cwd (or the contact sheet) from the URL, without touching history again
window.addEventListener("popstate", () => {
  if (currentSlug() === "contact") { showContactSheet(); return; }
  hideContactSheetUI();
  const node = nodeForPath(location.pathname);
  if (node === cwd) return;
  cwd = node; selection.clear(); anchorIndex = -1; render();
});

/* ================= state ================= */
let cwd = initialNodeFromLocation();  // current folder — from the URL, when it names a section
let history = [], future = [];  // navigation stacks
let view = "icon";              // 'icon' | 'list'
let selection = new Set();      // of nodes
let anchorIndex = -1;           // for shift-select
let sortAsc = true;

const $ = id => document.getElementById(id);

/* ================= motion: springs, projection, rubber-band =================
   Apple-style fluid motion (see: Designing Fluid Interfaces, WWDC18).
   Springs are interruptible and velocity-aware; re-targeting carries velocity. */
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");

const springStates = new WeakMap(); // el -> { props: {x:{val,vel,target}...}, raf, onDone }
function springApply(el, p) {
  const s = (p.sx || p.sy)
    ? `scale(${p.sx ? p.sx.val : 1}, ${p.sy ? p.sy.val : 1})`   // FLIP resizes stretch like a real surface
    : `scale(${p.scale ? p.scale.val : 1})`;
  el.style.transform = `translate3d(${p.x?.val || 0}px, ${p.y?.val || 0}px, 0) ${s}`;
  if (p.opacity) el.style.opacity = p.opacity.val;
}
const UNIT_PROPS = new Set(["scale", "opacity", "sx", "sy"]); // dimensionless props default to 1
function springTo(el, targets, { damping = 1, response = 0.35, velocity = {}, onDone } = {}) {
  let st = springStates.get(el);
  if (!st) { st = { props: {}, raf: 0 }; springStates.set(el, st); }
  st.onDone = onDone;
  for (const k in targets) {
    const cur = st.props[k] || { val: UNIT_PROPS.has(k) ? 1 : 0, vel: 0 };
    cur.target = targets[k];
    if (velocity[k] !== undefined) cur.vel = velocity[k];
    st.props[k] = cur;
  }
  if (REDUCED.matches) { // gentler equivalent: settle instantly, no travel
    for (const k in st.props) { st.props[k].val = st.props[k].target; st.props[k].vel = 0; }
    springApply(el, st.props);
    st.onDone && st.onDone();
    return;
  }
  if (st.raf) return; // loop already running; targets just changed (interruption = re-target)
  const stiffness = Math.pow((2 * Math.PI) / response, 2);
  const dampCoef = damping * 2 * Math.sqrt(stiffness);
  let last = performance.now();
  const tick = (now) => {
    // advance in real time even if rAF is throttled; small substeps keep integration stable
    let remaining = Math.min((now - last) / 1000, 0.25); last = now;
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 120); remaining -= h;
      for (const k in st.props) {
        const p = st.props[k];
        const accel = stiffness * (p.target - p.val) - dampCoef * p.vel;
        p.vel += accel * h;
        p.val += p.vel * h;
      }
    }
    let settled = true;
    for (const k in st.props) {
      const p = st.props[k];
      const eps = UNIT_PROPS.has(k) ? 0.002 : 0.05; // unit-aware tolerance
      if (Math.abs(p.vel) > eps * 4 || Math.abs(p.target - p.val) > eps) settled = false;
    }
    if (settled) {
      for (const k in st.props) { st.props[k].val = st.props[k].target; st.props[k].vel = 0; }
      springApply(el, st.props);
      st.raf = 0;
      st.onDone && st.onDone();
      return;
    }
    springApply(el, st.props);
    st.raf = requestAnimationFrame(tick);
  };
  st.raf = requestAnimationFrame(tick);
}
/* momentum projection — where the flick is going, not where it stopped */
function project(v, deceleration = 0.998) { return (v / 1000) * deceleration / (1 - deceleration); }
/* progressive resistance at a boundary */
function rubberband(overshoot, dimension = 300, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}
/* write the live (presentation) value directly — 1:1 tracking during a gesture;
   a later springTo starts from exactly here, so hand-off has no seam */
function setPresentation(el, vals) {
  let st = springStates.get(el);
  if (!st) { st = { props: {}, raf: 0 }; springStates.set(el, st); }
  for (const k in vals) {
    const p = st.props[k] || { val: 0, vel: 0, target: vals[k] };
    p.val = vals[k]; p.target = vals[k];
    st.props[k] = p;
  }
  springApply(el, st.props);
}
/* pointer velocity from a short move history */
function makeVelocityTracker() {
  let hist = [];
  return {
    push(x, y) { const t = performance.now(); hist.push({ x, y, t }); hist = hist.filter(h => t - h.t < 90); },
    read() {
      if (hist.length < 2) return { vx: 0, vy: 0 };
      const a = hist[0], b = hist[hist.length - 1], dt = (b.t - a.t) / 1000;
      return dt > 0 ? { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt } : { vx: 0, vy: 0 };
    },
  };
}
const els = {
  win: $("window"), sideNav: $("side-nav"), title: $("tb-title"),
  back: $("tb-back"), fwd: $("tb-fwd"), content: $("content"),
  iconView: $("icon-view"), listView: $("list-view"), homeView: $("home-view"),
  columnsView: $("columns-view"), galleryView: $("gallery-view"), digitalView: $("digital-view"),
  filmsView: $("films-view"), filmsSectionView: $("films-section-view"),
  filmDetailView: $("film-detail-view"),
  writingsView: $("writings-view"), workView: $("work-view"), essayView: $("essay-view"), stillLightbox: $("still-lightbox"),

  rubber: $("rubber-band"),
  menuLayer: $("menu-layer"), overlayLayer: $("overlay-layer"),
  sidebar: $("sidebar"), desktop: $("desktop"), contactLayer: $("contact-layer"),
};

const findByName = (name) => {
  let hit = null;
  (function walk(n) { if (hit) return; if (n.name === name && n.children) hit = n; (n.children || []).forEach(walk); })(ROOT);
  return hit;
};
const items = () => {
  const list = (cwd.children || []).slice();
  if (curView() === "list") list.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  return list;
};
const pathOf = (node) => { const p = []; for (let n = node; n; n = n.parent) p.unshift(n); return p; };

/* ---- dates ---- */
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
});
const dateOf = (n) => n.at ? DATE_FMT.format(new Date(n.at)).replace(",", "").replace(/(\d{4}) /, "$1 at ") : "—";
/* ================= sidebar (built from the live tree, keyed by id) =========
   Home plus the four sections, flat, no icons — quiet text, room to breathe.
   A section with sub-pages (FILMS today) is a disclosure row instead of a
   link: clicking it only reveals its sub-folders, it never navigates by
   itself — only a sub-folder is an actual page. Links is the same pattern,
   already was. */
let linksOpen = true;
const openSections = new Set(["FILMS", "PHOTOGRAPHY"]);   // section names whose sub-list starts expanded
function buildSidebar() {
  const section = (node, label = node.name) =>
    `<button class="side-item side-section" data-fid="${node.id}"><span>${label}</span></button>`;
  const sectionGroup = (node) => {
    const open = openSections.has(node.name);
    return `
      <div class="side-group">
        <button class="side-item side-section side-toggle ${open ? "open" : ""}" data-expand="${node.name}">
          <span>${node.name}</span>
          <svg class="side-sec-chev" viewBox="0 0 20 20"><use href="#t-chev-d"/></svg>
        </button>
        <div class="side-subitems" id="side-sub-${node.id}" ${open ? "" : "hidden"}>
          ${node.children.map(sub => `<button class="side-item side-subitem" data-fid="${sub.id}"><span>${sub.name}</span></button>`).join("")}
        </div>
      </div>`;
  };

  let h = `<div class="side-sections">` + section(ROOT, "HOME");
  ROOT.children.filter(n => n.children).forEach(n => {
    // "has sub-pages" means real sub-folders (kind Folder) — a section whose
    // children are only files, not organizing folders, stays a plain link
    h += n.children.some(c => c.kind === "Folder") ? sectionGroup(n) : section(n);
  });
  h += `</div>`;
  h += `<button class="side-sec side-sec-toggle ${linksOpen ? "open" : ""}" data-toggle="links">
      <span>Links</span><svg class="side-sec-chev" viewBox="0 0 20 20"><use href="#t-chev-d"/></svg>
    </button>`;
  h += `<div class="side-links-list" id="side-links-list" ${linksOpen ? "" : "hidden"}>`;
  LINKS.forEach(l => {
    h += `<button class="side-item side-link" data-app="${l.id}" ${l.contact ? 'data-contact="1"' : ""}>
        <svg viewBox="0 0 20 20"><use href="#${l.icon}"/></svg><span>${l.name}</span>
      </button>`;
  });
  h += `</div>`;
  els.sideNav.innerHTML = h;
  els.sideNav.onclick = e => {
    const expand = e.target.closest("[data-expand]");
    if (expand) {
      const name = expand.dataset.expand;
      const open = openSections.has(name) ? (openSections.delete(name), false) : (openSections.add(name), true);
      expand.classList.toggle("open", open);
      const node = ROOT.children.find(n => n.name === name);
      $(`side-sub-${node.id}`).hidden = !open;
      return;
    }
    const toggle = e.target.closest("[data-toggle]");
    if (toggle) {
      linksOpen = !linksOpen;
      toggle.classList.toggle("open", linksOpen);
      $("side-links-list").hidden = !linksOpen;
      return;
    }
    const btn = e.target.closest(".side-item");
    if (!btn) return;
    if (btn.dataset.contact) { track("contact-open"); openContactSheet(); return; }
    if (btn.dataset.app) {
      const app = LINKS.find(l => l.id === btn.dataset.app);
      track("link-out", { to: btn.dataset.app });
      if (app) window.open(app.href, "_blank", "noopener");
      return;
    }
    const node = INDEX.get(btn.dataset.fid);
    if (node) navigate(node);
  };
}
function syncSidebar() {
  els.sideNav.querySelectorAll(".side-item").forEach(b =>
    b.classList.toggle("active", b.dataset.fid === cwd.id));
}

/* ================= site search: the toolbar box, top-right =================
   A flat index over the folder tree — sections, and whatever real content
   sits inside them (film projects today; anything else once it exists).
   Raw photos are skipped: there are 77 of them and "digital-43.jpg" isn't
   a meaningful search target. */
function searchIndex() {
  const idx = [{ label: "HOME", sub: "", node: ROOT }];
  (function walk(node, depth) {
    (node.children || []).forEach(child => {
      if (child.isPhoto) return;
      const sub = depth === 0 ? (child.children ? "Section" : "Home") : node.name;
      idx.push({ label: child.name, sub, node: child });
      if (child.children) walk(child, depth + 1);
    });
  })(ROOT, 0);
  return idx;
}
function searchMatch(entry, q) {
  const n = entry.node;
  if (entry.label.toLowerCase().includes(q)) return true;
  if (n.description && n.description.toLowerCase().includes(q)) return true;
  if (n.festivals && n.festivals.join(" ").toLowerCase().includes(q)) return true;
  return false;
}
let searchResults = [], searchHi = -1;
function renderSearchResults() {
  const box = $("tb-search-results");
  if (!searchResults.length) { box.innerHTML = `<div class="tsr-empty">No matches</div>`; box.hidden = false; return; }
  box.innerHTML = searchResults.map((it, i) => `
    <button class="tsr-item ${i === searchHi ? "hi" : ""}" data-i="${i}">
      <span class="tsr-name">${it.label}</span>
      ${it.sub ? `<span class="tsr-sub">${it.sub}</span>` : ""}
    </button>`).join("");
  box.hidden = false;
  box.querySelectorAll(".tsr-item").forEach(btn =>
    btn.addEventListener("click", () => selectSearchResult(searchResults[+btn.dataset.i])));
}
function closeSearchResults() { $("tb-search-results").hidden = true; searchHi = -1; }
function selectSearchResult(entry) {
  track("search-result", { picked: entry.label });
  openNode(entry.node);
  $("tb-search-input").value = "";
  closeSearchResults();
  $("tb-search-input").blur();
}
$("tb-search-input").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  searchHi = -1;
  if (!q) { closeSearchResults(); searchResults = []; return; }
  searchResults = searchIndex().filter(entry => searchMatch(entry, q)).slice(0, 8);
  renderSearchResults();
});
$("tb-search-input").addEventListener("keydown", e => {
  if (e.key === "Escape") { closeSearchResults(); e.target.blur(); return; }
  if ($("tb-search-results").hidden) return;
  if (e.key === "ArrowDown") { e.preventDefault(); searchHi = Math.min(searchHi + 1, searchResults.length - 1); renderSearchResults(); return; }
  if (e.key === "ArrowUp") { e.preventDefault(); searchHi = Math.max(searchHi - 1, 0); renderSearchResults(); return; }
  if (e.key === "Enter") {
    e.preventDefault();
    const pick = searchResults[searchHi >= 0 ? searchHi : 0];
    if (pick) selectSearchResult(pick);
  }
});
document.addEventListener("click", e => { if (!e.target.closest("#tb-search")) closeSearchResults(); });

/* ================= what people open =================
   Umami counts pages by itself; these are the clicks it can't see — which
   film, which piece of writing, which file. Names only, nothing about the
   person. With no Umami script on the page (see index.html), it does
   nothing at all. */
function track(event, data) {
  try {
    if (localStorage.getItem("umami.disabled")) return;   // this browser opted out (see index.html)
    window.umami?.track(event, data);
  } catch {}
}

/* ================= navigation ================= */
function navigate(node, { record = true } = {}) {
  if (node === cwd) return;
  if (record) { history.push(cwd); future = []; }
  cwd = node;
  selection.clear(); anchorIndex = -1;
  render();
  syncUrl(true);
}
function goBack() { if (history.length) { future.push(cwd); cwd = history.pop(); selection.clear(); render(); syncUrl(false); } }
function goForward() { if (future.length) { history.push(cwd); cwd = future.pop(); selection.clear(); render(); syncUrl(false); } }
function goUp() { if (cwd.parent) navigate(cwd.parent); }

/* ================= rendering ================= */
const ICON_BOX = { "i-folder-mac": "0 0 128 128", "i-doc-mac": "0 0 116 128", "i-pdf-mac": "0 0 116 128", "i-mov-mac": "0 0 116 128", "i-jpg-mac": "0 0 116 128", "i-webloc": "0 0 120 150" };
function iconSvg(node, cls = "file-icon") {
  return `<svg class="${cls}" viewBox="${ICON_BOX[node.icon] || "0 0 120 150"}"><use href="#${node.icon}"/></svg>`;
}
function render() {
  const list = items();
  // the folder path, flattened into the toolbar itself. HOME is a section
  // like any other, not an ancestor of them — so the trail never starts
  // with HOME unless HOME is actually where you are: FILMS › Film Projects,
  // not HOME › FILMS › Film Projects.
  const crumbPath = cwd === ROOT ? [ROOT] : pathOf(cwd).slice(1);
  els.title.innerHTML = crumbPath.map((n, i) => `
    ${i ? '<span class="crumb-sep">›</span>' : ""}
    <button class="crumb-item" data-depth="${i}">${n === ROOT ? "HOME" : n.name}</button>`).join("");
  els.title.querySelectorAll(".crumb-item").forEach(el => {
    el.addEventListener("click", () => navigate(crumbPath[+el.dataset.depth]));
  });
  document.title = cwd === ROOT ? "Haolang Li" : `${cwd.name} — Haolang Li`;
  els.back.disabled = !history.length;
  els.fwd.disabled = !future.length;

  // Home is the single-frame showcase; Dazzcam is a photo wall and FILMS is a
  // project list, each with no other view — none of these four ever fall
  // back to the plain grid/list/columns/gallery. A section's own page (FILMS
  // itself, landed on via the breadcrumb) reads as a centered credits-style
  // list of its sub-folders instead of folder-icon tiles — same "has real
  // sub-folders" test the sidebar uses to decide whether a section gets the
  // disclosure treatment.
  const onDesk = view === "icon" && cwd === ROOT;
  const onDigital = cwd.name === "Dazzcam" && list.some(n => n.isPhoto);
  const onFilms = cwd.name === "Film Projects";
  const onFilmDetail = Boolean(cwd.parent && cwd.parent.name === "Film Projects");
  const onFilmsSection = cwd !== ROOT && cwd.parent === ROOT && (cwd.children || []).some(c => c.kind === "Folder");
  const onWritings = cwd.name === "WRITINGS" && cwd.parent === ROOT;
  const onEssay = cwd.kind === "Essay";
  const onWork = cwd.name === "WORK EXPERIENCE" && cwd.parent === ROOT;
  const custom = onDigital || onFilms || onFilmDetail || onFilmsSection || onWritings || onEssay || onWork;
  stopHome();
  els.homeView.hidden = !onDesk;
  els.digitalView.hidden = !onDigital;
  els.filmsView.hidden = !onFilms;
  els.filmsSectionView.hidden = !onFilmsSection;
  els.filmDetailView.hidden = !onFilmDetail;
  els.writingsView.hidden = !onWritings;
  els.essayView.hidden = !onEssay;
  els.workView.hidden = !onWork;
  els.iconView.hidden = custom || view !== "icon" || onDesk;
  els.listView.hidden = custom || view !== "list";
  els.columnsView.hidden = custom || view !== "columns";
  els.galleryView.hidden = custom || view !== "gallery";

  if (onDesk) {
    renderHome();
  } else if (onDigital) {
    renderDigital(list);
  } else if (onFilms) {
    renderFilms(list);
  } else if (onFilmsSection) {
    renderFilmsSection(cwd);
  } else if (onFilmDetail) {
    renderFilmDetail(cwd);
  } else if (onWritings) {
    renderWritings(list);
  } else if (onEssay) {
    renderEssay(cwd);
  } else if (onWork) {
    renderWork();
  } else if (view === "icon") {
    els.iconView.innerHTML = list.map((n, i) => `
      <div class="icon-item ${selection.has(n) ? "selected" : ""}" data-i="${i}">
        <div class="ic-frame">${iconSvg(n)}</div>
        <div class="ic-label">${n.name}</div>
      </div>`).join("");
  } else if (view === "columns") {
    renderColumns(list);
  } else if (view === "gallery") {
    renderGallery(list);
  } else {
    els.listView.innerHTML = `
      <div class="lv-head">
        <div class="lv-col c-name" id="lv-sort">Name <span class="sort-arrow">${sortAsc ? "▲" : "▼"}</span></div>
        <div class="lv-col c-date">Date Modified</div>
        <div class="lv-col c-size">Size</div>
        <div class="lv-col c-kind">Kind</div>
      </div>
      ${list.map((n, i) => `
      <div class="lv-row ${selection.has(n) ? "selected" : ""}" data-i="${i}">
        <div class="lv-cell c-name">${iconSvg(n, "")}<span>${n.name}</span></div>
        <div class="lv-cell c-date lv-dim">${dateOf(n)}</div>
        <div class="lv-cell c-size lv-dim">${n.size}</div>
        <div class="lv-cell c-kind lv-dim">${n.kind}</div>
      </div>`).join("")}`;
    const sortBtn = $("lv-sort");
    if (sortBtn) sortBtn.onclick = () => { sortAsc = !sortAsc; render(); };
  }

  // Arriving somewhere new starts at the top and fades up into place, the
  // way pages change on wim-wenders.com. Re-renders of the same page (a
  // folder reload, a view switch) don't replay it.
  if (cwd.id !== lastArrivalId) {
    lastArrivalId = cwd.id;
    els.content.scrollTop = 0;
    arrive(onDesk ? els.homeView : onDigital ? els.digitalView : onFilms ? els.filmsView
      : onFilmsSection ? els.filmsSectionView : onFilmDetail ? els.filmDetailView
      : onWritings ? els.writingsView : onEssay ? els.essayView : onWork ? els.workView
      : view === "list" ? els.listView : view === "columns" ? els.columnsView
      : view === "gallery" ? els.galleryView : els.iconView);
  }
  syncSidebar();
  adminDecorate();
}
let lastArrivalId = null;
/* restart the arrival animation on a view; its rows, if it has any, follow
   one after another (see .is-arriving in the stylesheet) */
function arrive(el) {
  if (!el) return;
  el.querySelectorAll(".film-row, .fd-still, .dg-item, .fs-credit-item, .wr-item, .wk-item").forEach((c, i) =>
    c.style.setProperty("--i", Math.min(i, 12)));
  el.classList.remove("is-arriving");
  void el.offsetWidth;
  el.classList.add("is-arriving");
}
/* ================= HOME: one film at a time =================
   Built after the gallery on wim-wenders.com: the frame is the page, the
   chrome steps back, and two quiet lines under the picture say what it is.
   The frame and the caption both open the film; ‹ › step through by hand.

   Which still comes next: every still in Film Projects gets its turn, dealt
   in rounds. A round visits every film once, in a shuffled order, so no
   film comes back before all the others have had a frame. Each film deals
   its own stills from a shuffled pile of its own, so over successive rounds
   every frame is shown before any of that film's frames repeat. */

// The self-introduction below the frame. Empty for now — the space is laid
// out and held either way; drop paragraphs (plain strings) in to fill it.
const HOME_INTRO = { label: "About", paragraphs: [] };

const shuffled = (a) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// films whose stills stay off the showcase (they still have their own pages)
const HOME_SKIP = new Set(["Rock‘n’Roll"]);
const homeDeck = (() => {
  const piles = new Map();          // film id → that film's stills not yet dealt this pass
  let round = [], last = null;
  function draw() {
    if (!round.length) {
      round = shuffled(FILM_PROJECTS.filter(p => p.stills.length && !HOME_SKIP.has(p.name)));
      if (!round.length) return null;
      // a round never opens on the film that closed the one before it
      if (round.length > 1 && round[0] === last) round.push(round.shift());
    }
    const film = round.shift();
    let pile = piles.get(film.id);
    if (!pile || !pile.length) piles.set(film.id, pile = shuffled([...film.stills]));
    last = film;
    return { film, src: pile.shift() };
  }
  // one more still from this film's own pile, skipping any in `taken`
  draw.more = (film, taken) => {
    for (let tries = 0; tries < film.stills.length * 2; tries++) {
      let pile = piles.get(film.id);
      if (!pile || !pile.length) piles.set(film.id, pile = shuffled([...film.stills]));
      const src = pile.shift();
      if (!taken.includes(src)) return src;
    }
    return null;
  };
  return draw;
})();

// what has been shown, so ‹ retraces it exactly; › past the end deals anew
let homeHist = [], homePos = -1, homeLayer = 0, homeToken = 0;

const homeMeta = (p) => {
  const meta = p.meta || "";
  const year = (meta.match(/\b(?:19|20)\d{2}\b/) || [])[0];
  const mins = (meta.match(/(\d+)\s*min/i) || [])[1];
  const roles = p.roles.map(r => ROLE_LABEL[r] || r).join(", ");
  return [mins && `${mins} min`, p.type, year, roles && `<strong>${roles}</strong>`].filter(Boolean).join(" · ");
};
const CHEVRON = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// On a phone HOME is a column of three stills instead of one frame
const homePhone = matchMedia("(max-width: 740px)");
homePhone.addEventListener("change", () => { if (cwd === ROOT && !els.homeView.hidden) { stopHome(); renderHome(); } });
const homePapersHtml = () => ROOT.children.filter(n => !n.children).map(n =>
  `<button class="hl-link" data-id="${n.id}">${n.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}</button>`).join("");

function renderHome() {
  if (homePhone.matches) { renderHomeStack(); return; }
  const intro = HOME_INTRO.paragraphs.filter(t => t && String(t).trim());
  const papers = ROOT.children.filter(n => !n.children);   // CV, self intro, reel — still one tap away
  els.homeView.innerHTML = `
    <section class="home-hero">
      <div class="home-stage">
        <button class="home-nav home-prev" aria-label="Previous film">${CHEVRON("M14.5 5 7.5 12l7 7")}</button>
        <a class="home-frame"><img class="hf-img" alt=""><img class="hf-img" alt=""></a>
        <button class="home-nav home-next" aria-label="Next film">${CHEVRON("M9.5 5l7 7-7 7")}</button>
      </div>
      <a class="home-caption">
        <span class="hc-title"></span>
        <span class="hc-meta"></span>
      </a>
      <div class="home-progress" aria-hidden="true"><i></i></div>
    </section>
    <section class="home-intro${intro.length ? "" : " is-empty"}">
      ${intro.length ? `
        <h2 class="hi-label">${HOME_INTRO.label}</h2>
        <div class="hi-body">${intro.map(t => `<p>${t}</p>`).join("")}</div>` : ""}
      <nav class="home-links">
        ${papers.map(n => `<button class="hl-link" data-id="${n.id}">${n.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}</button>`).join("")}
      </nav>
    </section>`;

  const hero = els.homeView.querySelector(".home-hero");
  const stage = hero.querySelector(".home-stage");
  const frame = hero.querySelector(".home-frame"), caption = hero.querySelector(".home-caption");
  hero.querySelector(".home-prev").addEventListener("click", () => homeStep(-1));
  hero.querySelector(".home-next").addEventListener("click", () => homeStep(1));
  hero.querySelector(".home-progress i").addEventListener("animationend", () => homeStep(1));

  // both the picture and its two lines lead to the film
  let swiped = false;
  [frame, caption].forEach(el => el.addEventListener("click", e => {
    e.preventDefault();
    if (swiped) { swiped = false; return; }
    const entry = homeHist[homePos], node = entry && INDEX.get(entry.film.id);
    if (node) { track("film-open", { film: node.name, from: "home" }); navigate(node); }
  }));
  // the frame holds still while you're looking at it
  [stage, caption].forEach(el => {
    el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hero.classList.add("paused"); });
    el.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hero.classList.remove("paused"); });
  });
  // a sideways swipe turns the page on touch screens
  let sx = null;
  stage.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") sx = e.clientX; });
  stage.addEventListener("pointerup", e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { swiped = true; homeStep(dx < 0 ? 1 : -1); }
  });
  els.homeView.querySelectorAll(".hl-link").forEach(b =>
    b.addEventListener("click", () => {
      const node = INDEX.get(b.dataset.id);
      track("file-open", { file: node ? node.name : b.dataset.id });
      openNode(node);
    }));

  homeLayer = 0;
  if (homePos < 0) { const first = homeDeck(); if (!first) return; homeHist.push(first); homePos = 0; }
  showHomeFrame(homeHist[homePos], true);
}

function homeStep(d) {
  if (homePhone.matches) { stackStep(d); return; }
  if (!homeHist.length) return;
  if (d > 0) {
    if (homePos < homeHist.length - 1) homePos++;
    else {
      const next = homeDeck(); if (!next) return;
      homeHist.push(next); homePos++;
    }
  } else if (homePos > 0) {
    homePos--;
  } else {
    // nothing earlier yet: deal a frame in front, from the same rounds
    let prev = homeDeck();
    if (prev && prev.film === homeHist[0].film) prev = homeDeck() || prev;
    if (!prev) return;
    homeHist.unshift(prev);
  }
  showHomeFrame(homeHist[homePos]);
}

function showHomeFrame(entry, first = false) {
  const hero = els.homeView.querySelector(".home-hero");
  if (!hero || !entry) return;
  const node = INDEX.get(entry.film.id);
  const href = node ? pathForNode(node) : "#";
  const imgs = hero.querySelectorAll(".hf-img");
  const incoming = imgs[1 - homeLayer], outgoing = imgs[homeLayer];
  const caption = hero.querySelector(".home-caption"), frame = hero.querySelector(".home-frame");
  const bar = hero.querySelector(".home-progress i");
  const token = ++homeToken;

  const paintCaption = () => {
    hero.querySelector(".hc-title").textContent = entry.film.name;
    hero.querySelector(".hc-meta").innerHTML = homeMeta(entry.film);
    frame.href = caption.href = href;
    frame.setAttribute("aria-label", `${entry.film.name} — open the film`);
  };
  const reveal = () => {
    if (token !== homeToken) return;            // a later step already took over
    incoming.classList.add("on");
    outgoing.classList.remove("on");
    homeLayer = 1 - homeLayer;
    if (first) paintCaption();
    else {
      caption.classList.add("swap");
      setTimeout(() => { if (token !== homeToken) return; paintCaption(); caption.classList.remove("swap"); }, 320);
    }
    // restart the dwell: its end is what turns to the next frame
    bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
    // have the frame after this one decoded before it's needed
    if (homePos === homeHist.length - 1) {
      const ahead = homeDeck();
      if (ahead) {
        homeHist.push(ahead); new Image().src = ahead.src;
        if (homeHist.length > 240) { homeHist.shift(); homePos--; }
      }
    } else new Image().src = homeHist[homePos + 1].src;
  };
  // Reveal once the picture is decoded, so the dissolve never shows it half
  // drawn. decode() alone isn't enough to rely on: Chromium holds it back
  // while the page is hidden (a tab opened in the background), so the load
  // event backs it up — whichever comes first wins, the other is a no-op.
  let settled = false;
  const go = () => { if (!settled) { settled = true; reveal(); } };
  incoming.onload = () => setTimeout(go, 250);
  incoming.onerror = go;
  incoming.src = entry.src;
  if (incoming.decode) incoming.decode().then(go, () => {});
  if (incoming.complete && incoming.naturalWidth) setTimeout(go, 250);   // already cached: load won't fire again
}

/* ---- HOME on a phone: one film, three of its stills, stacked tight ----
   Films come in the same rounds as the big frame; each set is three
   different stills from one film, in that film's own aspect ratio, with
   the caption once underneath. The whole set turns together (each tile a
   beat after the one above) when the dwell runs out, or on a sideways swipe. */
let stackSets = [], stackPos = -1;
function dealStackSet() {
  const first = homeDeck();
  if (!first) return [];
  const set = [first];
  while (set.length < 3) {
    const src = homeDeck.more(first.film, set.map(e => e.src));
    if (!src) break;
    set.push({ film: first.film, src });
  }
  return set;
}
function renderHomeStack() {
  const intro = HOME_INTRO.paragraphs.filter(t => t && String(t).trim());
  els.homeView.innerHTML = `
    <section class="home-stack">
      ${[0, 1, 2].map(() => `
      <a class="hs-tile"><img class="hf-img" alt=""><img class="hf-img" alt=""></a>`).join("")}
      <a class="hs-caption"><span class="hc-title"></span><span class="hc-meta"></span></a>
      <div class="home-progress" aria-hidden="true"><i></i></div>
    </section>
    <section class="home-intro${intro.length ? "" : " is-empty"}">
      ${intro.length ? `
        <h2 class="hi-label">${HOME_INTRO.label}</h2>
        <div class="hi-body">${intro.map(t => `<p>${t}</p>`).join("")}</div>` : ""}
      <nav class="home-links">${homePapersHtml()}</nav>
    </section>`;
  const stack = els.homeView.querySelector(".home-stack");
  stack.querySelector(".home-progress i").addEventListener("animationend", () => stackStep(1));
  let sx = null, sy = null, swiped = false;
  stack.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
  stack.addEventListener("pointerup", e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; stackStep(dx < 0 ? 1 : -1); }
  });
  stack.querySelectorAll(".hs-tile, .hs-caption").forEach(el => el.addEventListener("click", e => {
    e.preventDefault();
    if (swiped) { swiped = false; return; }
    const entry = stackSets[stackPos] && stackSets[stackPos][0], node = entry && INDEX.get(entry.film.id);
    if (node) { track("film-open", { film: node.name, from: "home-phone" }); navigate(node); }
  }));
  els.homeView.querySelectorAll(".hl-link").forEach(b =>
    b.addEventListener("click", () => {
      const node = INDEX.get(b.dataset.id);
      track("file-open", { file: node ? node.name : b.dataset.id });
      openNode(node);
    }));
  if (stackPos < 0) { const first = dealStackSet(); if (!first.length) return; stackSets.push(first); stackPos = 0; }
  showStackSet(stackSets[stackPos], true);
}
function stackStep(d) {
  if (!stackSets.length) return;
  if (d > 0) {
    if (stackPos === stackSets.length - 1) { const next = dealStackSet(); if (!next.length) return; stackSets.push(next); }
    stackPos++;
  } else if (stackPos > 0) stackPos--;
  else { const prev = dealStackSet(); if (!prev.length) return; stackSets.unshift(prev); }
  showStackSet(stackSets[stackPos]);
}
function showStackSet(set, first = false) {
  const stack = els.homeView.querySelector(".home-stack");
  if (!stack || !set) return;
  const token = ++homeToken;
  const bar = stack.querySelector(".home-progress i");
  const film = set[0].film, node = INDEX.get(film.id);
  const href = node ? pathForNode(node) : "#";
  const ar = film.stillRatio || 16 / 9;
  const caption = stack.querySelector(".hs-caption");
  const paint = () => {
    stack.style.setProperty("--still-ar", ar);
    caption.querySelector(".hc-title").textContent = film.name;
    caption.querySelector(".hc-meta").innerHTML = homeMeta(film);
    caption.href = href;
  };
  if (first) paint();
  else {
    caption.classList.add("swap");
    setTimeout(() => { if (token !== homeToken) return; paint(); caption.classList.remove("swap"); }, 320);
  }
  stack.querySelectorAll(".hs-tile").forEach((tile, i) => {
    const entry = set[i];
    tile.hidden = !entry;
    if (!entry) return;
    const imgs = tile.querySelectorAll(".hf-img");
    const layer = +(tile.dataset.layer || 0);
    const incoming = imgs[1 - layer], outgoing = imgs[layer];
    let settled = false;
    const reveal = () => {
      if (settled || token !== homeToken) return;
      settled = true;
      setTimeout(() => {
        if (token !== homeToken) return;
        // a frame shot in another shape (BURNING STAGE's portraits) is shown whole
        const own = incoming.naturalWidth / incoming.naturalHeight;
        incoming.classList.toggle("fit-whole", Boolean(own) && Math.abs(own - ar) / ar > 0.15);
        incoming.classList.add("on"); outgoing.classList.remove("on");
        tile.dataset.layer = 1 - layer;
        tile.href = href;
        tile.setAttribute("aria-label", `${film.name} — open the film`);
      }, first ? 0 : 320 + i * 160);
    };
    incoming.onload = () => setTimeout(reveal, 120);
    incoming.onerror = reveal;
    incoming.src = entry.src;
    if (incoming.decode) incoming.decode().then(reveal, () => {});
    if (incoming.complete && incoming.naturalWidth) setTimeout(reveal, 120);
  });
  bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
  // the next set, decoded ahead of time
  if (stackPos === stackSets.length - 1) {
    const ahead = dealStackSet();
    if (ahead.length) { stackSets.push(ahead); ahead.forEach(e => { new Image().src = e.src; }); }
    if (stackSets.length > 120) { stackSets.shift(); stackPos--; }
  } else stackSets[stackPos + 1].forEach(e => { new Image().src = e.src; });
}

// leaving HOME: drop any frame still decoding so it can't land on another page
function stopHome() { homeToken++; }

/* ---- digital: a quiet contact-sheet wall, one tap opens the full frame ---- */
/* Justified rows (Flickr/Google Photos style): every photo keeps its own
   aspect ratio — nothing is ever cropped. Images are packed into rows whose
   height is solved so the row's total width lands exactly on the container
   width; the last, incomplete row sits at the target height unstretched. */
function layoutDigitalRows(list, containerW, targetH, gap) {
  const rows = [];
  let row = [], sumAr = 0;
  const finalize = (items, h, stretch) => {
    const widths = items.map(n => Math.round(n.ar * h));
    if (stretch) {
      const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * gap;
      widths[widths.length - 1] += containerW - total; // absorb rounding onto the last tile
    }
    rows.push({ items, h, widths });
  };
  list.forEach(n => {
    row.push(n); sumAr += n.ar;
    const naturalW = sumAr * targetH + (row.length - 1) * gap;
    if (naturalW >= containerW) {
      const availW = containerW - (row.length - 1) * gap;
      finalize(row, availW / sumAr, true);
      row = []; sumAr = 0;
    }
  });
  if (row.length) finalize(row, targetH, false);
  return rows;
}
function renderDigital(list) {
  const containerW = els.digitalView.clientWidth || els.content.clientWidth || 800;
  const gap = containerW < 640 ? 2 : 3;
  const targetH = containerW < 640 ? 130 : 230;
  const rows = layoutDigitalRows(list, containerW, targetH, gap);
  els.digitalView.innerHTML = `
    <div class="dg-caption">
      <div class="dg-caption-title">Dazz Cam Photography</div>
      <div class="dg-caption-sub">Shot on iPhone. Film Emulation Type: FXN/FXN2</div>
    </div>
    <div class="dg-rows" style="gap:${gap}px">
      ${rows.map(row => `
        <div class="dg-row" style="height:${Math.round(row.h)}px;gap:${gap}px">
          ${row.items.map((n, k) => {
            const i = list.indexOf(n);
            return `<button class="dg-item ${selection.has(n) ? "selected" : ""}" data-i="${i}" style="width:${row.widths[k]}px" aria-label="${n.name}">
              <img src="${n.href}" loading="lazy" decoding="async" alt="">
            </button>`;
          }).join("")}
        </div>`).join("")}
    </div>`;
  armDigitalResize();
}
let digitalResizeArmed = false;
function armDigitalResize() {
  if (digitalResizeArmed) return;
  digitalResizeArmed = true;
  let raf = 0;
  new ResizeObserver(() => {
    if (els.digitalView.hidden) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => renderDigital(items()));
  }).observe(els.digitalView);
}

/* ================= FILMS: a vertical list, poster-left, plus a role filter =================
   FILMS is the first section with real content design (more to follow per
   section). Each row is a project; the DIRECTOR/PRODUCER/DP chips filter by
   the role Haolang held on it — mutually exclusive, exactly one active at a
   time, never a mixed "everything" view. Clicking a row opens its own
   detail page (renderFilmDetail below) — the breadcrumb reads FILMS › <title>.

   Under the DP filter specifically, a project with 3+ stills shows as a
   stills row (3 frames, no poster) instead of the usual poster row —
   cinematography is the thing to show off there. Projects without stills
   yet still fall back to the poster row so nothing looks broken. */
let filmRoleFilter = FILM_ROLES[0];
// `type` (Narrative Short, Documentary Short, ...) leads every meta line,
// ahead of the year/runtime — every project carries one. The role Haolang
// held rides at the end, bold — it's the headline fact for the DP-style
// template; director credit and festivals (no "Festival:" label, just the
// name) sit underneath.
const filmMetaBase = (p) => [p.type, p.meta].filter(Boolean).join(" · ");
// a description can run to more than one paragraph — blank lines split it,
// so a long director's statement doesn't collapse into one wall of text
const filmDescHtml = (p, cls) => (p.description || "").trim()
  ? p.description.trim().split(/\n\s*\n/).map(t => `<p class="${cls}">${t.trim()}</p>`).join("")
  : "";
/* Stills keep the shape they were shot in: each project declares the aspect
   ratio its frames share (2.4:1 scope, 16:9, ...) and the tiles take it, so
   nothing is cropped just to fit a fixed grid. An odd one out — BURNING
   STAGE mixes scope performance frames with two ~4:3 portraits — is shown
   whole inside its tile rather than cropped to fill it. */
function fitStills(root) {
  root.querySelectorAll("[data-still-ar]").forEach(box => {
    const cell = +box.dataset.stillAr || 16 / 9;
    box.querySelectorAll("img").forEach(img => {
      const mark = () => {
        if (!img.naturalWidth) return;
        const own = img.naturalWidth / img.naturalHeight;
        img.classList.toggle("fit-whole", Math.abs(own - cell) / cell > 0.15);
      };
      img.complete ? mark() : img.addEventListener("load", mark, { once: true });
    });
  });
}
const filmMetaLine = (p) => [
  filmMetaBase(p),
  p.roles.length ? `<strong class="film-role-inline">${p.roles.map(r => ROLE_LABEL[r] || r).join(", ")}</strong>` : "",
].filter(Boolean).join(" · ");
const filmCredits = (p) => `
  ${p.director ? `<div class="film-credit">Director: ${p.director}</div>` : ""}
  ${p.festivals.map(f => `<div class="film-credit">${f}</div>`).join("")}`;
function filmPosterRow(p, list) {
  return `
    <button class="film-row" data-i="${list.indexOf(p)}">
      ${p.poster ? `<div class="film-poster"><img src="${p.poster}" alt="" loading="lazy"></div>` : ""}
      <div class="film-info">
        <div class="film-title">${p.name}</div>
        <div class="film-meta">${filmMetaLine(p)}</div>
        ${filmDescHtml(p, "film-desc")}
        ${p.festivals.length ? `
          <ul class="film-festivals">${p.festivals.map(f => `<li>${f}</li>`).join("")}</ul>` : ""}
      </div>
    </button>`;
}
function filmStillsRow(p, list) {
  return `
    <button class="film-row film-row-stills" data-i="${list.indexOf(p)}">
      <div class="film-stills" data-still-ar="${p.stillRatio}" style="--still-ar:${p.stillRatio}">
        ${p.stills.slice(0, 3).map(s => `<div class="film-still"><img src="${s}" alt="" loading="lazy"></div>`).join("")}
      </div>
      <div class="film-stills-credits">
        <div class="film-title">${p.name}</div>
        <div class="film-meta">${filmMetaLine(p)}</div>
        ${filmCredits(p)}
      </div>
    </button>`;
}

/* ================= WORK EXPERIENCE =================
   The CV's work section as a quiet ledger: dates in the left margin, the
   company set large, the role in small caps beneath, then what the job was.
   Ongoing positions carry a small live dot. */
const workMonth = (ym) => { const [y, m] = ym.split("-"); return `${MONTHS[+m - 1]} ${y}`; };
const workDates = (w) => !w.end ? `${workMonth(w.start)} — Present`
  : w.end === w.start ? workMonth(w.start) : `${workMonth(w.start)} — ${workMonth(w.end)}`;
function renderWork() {
  if (!WORK) { renderWorkLock(); return; }
  els.workView.innerHTML = `
    <div class="wk-wrap">
      <div class="wk-list">
        ${WORK.map(w => `
        <section class="wk-item">
          <div class="wk-when">
            <span class="wk-dates">${workDates(w)}</span>
            ${w.end ? "" : '<span class="wk-now"><i></i>Current</span>'}
          </div>
          <div class="wk-main">
            <h2 class="wk-company">${w.company}${w.aka ? ` <span class="wk-aka">${w.aka}</span>` : ""}</h2>
            <div class="wk-role">${w.role}</div>
            <ul class="wk-points">${w.points.map(p => `<li>${p}</li>`).join("")}</ul>
          </div>
        </section>`).join("")}
      </div>
      <a class="wk-cv" href="assets/files/CV.pdf" target="_blank" rel="noopener">Full CV ↗</a>
    </div>`;
  els.workView.querySelector(".wk-cv").addEventListener("click", () => track("file-open", { file: "CV.pdf", from: "work" }));
}

function renderWorkLock() {
  els.workView.innerHTML = `
    <form class="wk-lock" autocomplete="off">
      <div class="wk-lock-title">Work Experience</div>
      <p class="wk-lock-note">This page is password protected.</p>
      <div class="wk-lock-field">
        <input type="password" class="wk-lock-input" placeholder="Password" aria-label="Password" autocomplete="current-password">
        <button type="submit" class="wk-lock-go" aria-label="Unlock">→</button>
      </div>
      <p class="wk-lock-err" aria-live="polite"></p>
    </form>`;
  const form = els.workView.querySelector(".wk-lock");
  const input = form.querySelector("input"), err = form.querySelector(".wk-lock-err");
  const onPage = cwd;
  restoreWorkKey().then(ok => { if (ok && cwd === onPage) { renderWork(); arrive(els.workView); } });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value || form.classList.contains("busy")) return;
    form.classList.add("busy"); err.textContent = "";
    const ok = await unlockWork(input.value).catch(() => false);
    form.classList.remove("busy");
    if (ok) { track("work-unlock"); if (cwd === onPage) { renderWork(); arrive(els.workView); } return; }
    track("work-unlock-failed");
    err.textContent = "Incorrect password.";
    input.select();
    form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
  });
  // typing must reach the field, not the Finder's keyboard shortcuts
  input.addEventListener("keydown", e => e.stopPropagation());
  setTimeout(() => input.focus({ preventScroll: true }), 60);
}

/* ================= WRITINGS: a quiet feed =================
   One column, newest first: date on the left, title + standfirst on the
   right, hairlines between. Tags (when pieces carry any) filter the feed —
   "All" plus one chip per tag. A piece opens as its own reading page. */
let writingTag = "All";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const essayDate = (at) => { const [y, m, d] = at.slice(0, 10).split("-"); return `${+d} ${MONTHS[+m - 1]} ${y}`; };
// ~230 English words or ~450 Chinese characters a minute
function readMins(body) {
  const cjk = (body.match(/[\u3400-\u9fff]/g) || []).length;
  const words = body.replace(/<[^>]+>/g, " ").replace(/[\u3400-\u9fff]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230 + cjk / 450));
}
const essayMeta = (e) => [...e.tags, e.body.trim() && `${readMins(e.body.split(/\n---\n/)[0])} min read`].filter(Boolean).join(" · ");
const linkify = (t) => t.replace(/https?:\/\/[^\s<]+[^\s<.,;)]/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
function essayBlocksHtml(text, notes) {
  return text.trim().split(/\n\s*\n/).map(b => {
    const t = b.trim();
    if (t.startsWith("## ")) return `<h2 class="es-h">${t.slice(3)}</h2>`;
    if (t === "***") return `<div class="es-break" role="separator" aria-hidden="true">＊</div>`;
    if (t.startsWith("### ")) return `<h3 class="es-h3">${t.slice(4)}</h3>`;
    if (t.startsWith("> ")) return `<blockquote class="es-quote">${t.replace(/^>\s?/gm, "")}</blockquote>`;
    // one image per line; several lines in one block sit side by side
    const figs = t.split("\n").map(l => l.match(/^!\[(.*)\]\((.+)\)$/));
    if (figs.every(Boolean)) {
      const html = figs.map(([, cap, src]) =>
        `<figure class="es-fig"><img src="${src}" alt="" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`).join("");
      return figs.length > 1 ? `<div class="es-fig-row">${html}</div>` : html;
    }
    if (t.startsWith("• ")) return `<ul class="es-list">${t.split("\n").map(li => `<li>${li.replace(/^•\s*/, "")}</li>`).join("")}</ul>`;
    return `<p>${notes ? linkify(t) : t.replace(/\n/g, "<br>")}</p>`;
  }).join("");
}
function essayBodyHtml(body) {
  const [text, notes] = body.split(/\n---\n/);
  return essayBlocksHtml(text, false) + (notes ? `<div class="es-notes">${essayBlocksHtml(notes, true)}</div>` : "");
}
function renderWritings(list) {
  const tags = [...new Set(list.flatMap(e => e.tags))];
  if (writingTag !== "All" && !tags.includes(writingTag)) writingTag = "All";
  const shown = writingTag === "All" ? list : list.filter(e => e.tags.includes(writingTag));
  els.writingsView.innerHTML = `
    <div class="wr-wrap">
      ${tags.length ? `
      <div class="film-filters wr-filters">
        ${["All", ...tags].map((t, i) => `
          ${i ? '<span class="film-filter-sep">/</span>' : ""}
          <button class="film-chip ${writingTag === t ? "on" : ""}" data-tag="${t}">${t}</button>`).join("")}
      </div>` : ""}
      ${shown.length ? `
      <div class="wr-list">
        ${shown.map(e => `
        <button class="wr-item" data-i="${list.indexOf(e)}">
          <time class="wr-date">${essayDate(e.at)}</time>
          <span class="wr-main">
            <span class="wr-title">${e.name}</span>
            ${e.dek ? `<span class="wr-dek">${e.dek}</span>` : ""}
            ${essayMeta(e) ? `<span class="wr-meta">${essayMeta(e)}</span>` : ""}
          </span>
          <span class="wr-arrow" aria-hidden="true">→</span>
        </button>`).join("")}
      </div>` : `
      <div class="wr-empty">
        <div class="wr-empty-title">Writings</div>
        <p>Nothing published yet.</p>
      </div>`}
    </div>`;
  els.writingsView.querySelectorAll(".film-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (writingTag === chip.dataset.tag) return;
      writingTag = chip.dataset.tag;
      track("writings-filter", { tag: writingTag });
      renderWritings(items());
      arrive(els.writingsView.querySelector(".wr-list"));
    });
  });
  els.writingsView.querySelectorAll(".wr-item").forEach(row => {
    row.addEventListener("click", () => {
      const piece = list[+row.dataset.i];
      track("writing-open", { title: piece.name });
      navigate(piece);
    });
  });
}
function renderEssay(node) {
  const all = node.parent.children.filter(c => c.kind === "Essay");
  const i = all.indexOf(node);
  const newer = all[i - 1], older = all[i + 1];
  const pager = (e, label, cls) => e ? `
    <button class="es-page ${cls}" data-id="${e.id}">
      <span class="es-page-label">${label}</span>
      <span class="es-page-title">${e.name}</span>
    </button>` : `<span class="es-page ${cls}"></span>`;
  els.essayView.innerHTML = `
    <article class="es-wrap">
      <button class="es-back">← All writings</button>
      <header class="es-head">
        <div class="es-kicker"><time>${essayDate(node.at)}</time>${essayMeta(node) ? ` · ${essayMeta(node)}` : ""}</div>
        <h1 class="es-title">${node.name}</h1>
        ${node.dek ? `<p class="es-dek">${node.dek}</p>` : ""}
        ${node.pdf ? `<a class="es-pdf" href="${node.pdf}" target="_blank" rel="noopener">Original PDF ↗</a>` : ""}
      </header>
      ${node.cover ? `<figure class="es-cover"><img src="${node.cover}" alt=""></figure>` : ""}
      <div class="es-body">${essayBodyHtml(node.body)}</div>
      ${all.length > 1 ? `
      <nav class="es-pager">${pager(newer, "Newer", "es-newer")}${pager(older, "Older", "es-older")}</nav>` : ""}
    </article>`;
  els.essayView.querySelector(".es-back").addEventListener("click", () => navigate(node.parent));
  els.essayView.querySelector(".es-pdf")?.addEventListener("click", () => track("pdf-open", { title: node.name }));
  // counted once: the end of the text scrolled into view
  const tail = els.essayView.querySelector(".es-body > :last-child");
  if (tail && window.IntersectionObserver) {
    const io = new IntersectionObserver(entries => {
      if (!entries.some(x => x.isIntersecting)) return;
      io.disconnect();
      track("writing-finished", { title: node.name });
    }, { root: els.content, threshold: 0.6 });
    io.observe(tail);
  }
  const figs = [...els.essayView.querySelectorAll(".es-fig img")];
  figs.forEach((img, i) => img.addEventListener("click", () => {
    track("figure-open", { title: node.name, figure: i + 1 });
    openStillLightbox(figs.map(f => f.getAttribute("src")), i);
  }));
  els.essayView.querySelectorAll("button.es-page").forEach(btn => {
    btn.addEventListener("click", () => navigate(INDEX.get(btn.dataset.id)));
  });
}

/* ---- a section's own page (e.g. landing on FILMS via the breadcrumb):
   its sub-folders as a centered, end-credits-style list, not folder tiles ---- */
function renderFilmsSection(node) {
  const subs = node.children.filter(c => c.kind === "Folder");
  els.filmsSectionView.innerHTML = `
    <div class="fs-credits">
      ${subs.map(s => `<button class="fs-credit-item" data-i="${subs.indexOf(s)}">${s.name}</button>`).join("")}
    </div>`;
  els.filmsSectionView.querySelectorAll(".fs-credit-item").forEach(btn => {
    btn.addEventListener("click", () => navigate(subs[+btn.dataset.i]));
  });
}
function renderFilms(list) {
  const shown = list.filter(p => p.roles.includes(filmRoleFilter));
  const dpMode = filmRoleFilter === "DP";
  els.filmsView.innerHTML = `
    <div class="film-filters">
      ${FILM_ROLES.map((r, i) => `
        ${i ? '<span class="film-filter-sep">/</span>' : ""}
        <button class="film-chip ${filmRoleFilter === r ? "on" : ""}" data-role="${r}">${CHIP_LABEL[r]}</button>`).join("")}
    </div>
    <div class="film-list">
      ${shown.length ? shown.map(p =>
        dpMode && p.stills.length >= 3 ? filmStillsRow(p, list) : filmPosterRow(p, list)
      ).join("") : `<div class="film-empty">No projects for this filter yet.</div>`}
    </div>`;
  els.filmsView.querySelectorAll(".film-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (filmRoleFilter === chip.dataset.role) return;   // mutually exclusive: always exactly one
      filmRoleFilter = chip.dataset.role;
      track("films-filter", { role: filmRoleFilter });
      renderFilms(items());
      arrive(els.filmsView.querySelector(".film-list"));
    });
  });
  els.filmsView.querySelectorAll(".film-row").forEach(row => {
    row.addEventListener("click", () => {
      const film = list[+row.dataset.i];
      track("film-open", { film: film.name, from: "list", role: filmRoleFilter });
      navigate(film);
    });
  });
  fitStills(els.filmsView);
}
// Vimeo tells the page when someone presses play (dnt=1 keeps it cookie-free)
let vimeoWatched = null;
window.addEventListener("message", e => {
  if (!/player\.vimeo\.com$/.test(new URL(e.origin).host)) return;
  let msg = e.data; try { msg = typeof msg === "string" ? JSON.parse(msg) : msg; } catch { return; }
  if (msg && msg.event === "play" && vimeoWatched) track("video-play", { film: vimeoWatched });
});

function renderFilmDetail(node) {
  vimeoWatched = node.vimeo ? node.name : null;
  const stillsMode = node.stills.length >= 3;
  const stills = node.stills;
  els.filmDetailView.innerHTML = `
    <div class="fd-container">
      <div class="fd-wrap">
        ${node.poster ? `<div class="fd-poster"><img src="${node.poster}" alt=""></div>` : ""}
        <div class="fd-info">
          <h1 class="fd-title">${node.name}</h1>
          <div class="fd-meta">${stillsMode ? filmMetaLine(node) : filmMetaBase(node)}</div>
          ${stillsMode ? `
            ${node.director ? `<div class="fd-credit-line">Director: ${node.director}</div>` : ""}
            ${filmDescHtml(node, "fd-desc")}
            ${node.festivals.length ? `<div class="fd-credit-line fd-fest-lines">${node.festivals.map(f => `<div>${f}</div>`).join("")}</div>` : ""}
          ` : `
            ${node.roles.length ? `<div class="fd-roles">${node.roles.map(r => `<span class="fd-role">${ROLE_LABEL[r] || r}</span>`).join("")}</div>` : ""}
            ${filmDescHtml(node, "fd-desc")}
            ${node.festivals.length ? `
              <div class="fd-fest-head">Festivals</div>
              <ul class="fd-festivals">${node.festivals.map(f => `<li>${f}</li>`).join("")}</ul>` : ""}
          `}
        </div>
      </div>
      ${node.vimeo ? `
        <div class="fd-video" style="--video-ar:${node.vimeo.ar || node.stillRatio}">
          <iframe src="https://player.vimeo.com/video/${node.vimeo.id}?${node.vimeo.h ? `h=${node.vimeo.h}&` : ""}title=0&byline=0&portrait=0&dnt=1"
            title="${node.name}" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>` : ""}
      ${stillsMode ? `
        <div class="fd-stills" data-still-ar="${node.stillRatio}" style="--still-ar:${node.stillRatio}">
          ${stills.map((s, i) => `<button class="fd-still" data-i="${i}"><img src="${s}" alt="" loading="lazy"></button>`).join("")}
        </div>` : ""}
    </div>`;
  if (stillsMode) {
    els.filmDetailView.querySelectorAll(".fd-still").forEach(btn => {
      btn.addEventListener("click", () => {
        track("still-open", { film: node.name, still: +btn.dataset.i + 1 });
        openStillLightbox(stills, +btn.dataset.i);
      });
    });
    fitStills(els.filmDetailView);
  }
}

/* ---- still lightbox: click a frame in the detail grid to see it full-size ---- */
let stillLightboxList = [], stillLightboxIndex = 0;
function renderStillLightbox() {
  $("sl-img").src = stillLightboxList[stillLightboxIndex];
  $("sl-count").textContent = `${stillLightboxIndex + 1} / ${stillLightboxList.length}`;
}
function openStillLightbox(stills, index) {
  stillLightboxList = stills; stillLightboxIndex = index;
  renderStillLightbox();
  els.stillLightbox.hidden = false;
}
function closeStillLightbox() { els.stillLightbox.hidden = true; }
function stepStillLightbox(d) {
  stillLightboxIndex = (stillLightboxIndex + d + stillLightboxList.length) % stillLightboxList.length;
  renderStillLightbox();
}

/* ================= guest book: one public canvas =================
   A single shared board. Everyone draws, types and drops photos onto the
   same canvas; every mark is one row in Supabase, replayed in order, so
   nothing clobbers anything and the board is the sum of every visit.
   Coordinates are stored 0..1 of the canvas, so it renders at any size. */
const SUPA = {
  url: "https://knpwwgqkpcfjupsegouu.supabase.co",
  key: "sb_publishable_2xqtnwBkGZeYEyJJf7VtyA_dm9c-pFf",   // publishable (public) key
};
const SHARED = () => Boolean(SUPA.key);
const supaHeaders = () => ({ apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}` });

const GB_INKS = ["#EDE8DC", "#7FA9D6", "#FF9F0A", "#E5484D", "#F05CA8", "#57C785"];
const BOARD = { on: false, tool: "pen", ink: GB_INKS[0], ctx: null, ready: false,
  lastAt: null, poll: 0, drawing: false, pts: [], strokes: [] };

/* ---- geometry helpers: everything stored 0..1 ---- */
function boardMetrics() {
  const cv = $("gb-canvas"); const r = cv.getBoundingClientRect();
  return { w: r.width, h: r.height };
}
function boardSize() {
  const cv = $("gb-canvas");
  if (!BOARD.ctx) return;
  const r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const dpr = devicePixelRatio || 1;
  if (cv.width === Math.round(r.width * dpr) && cv.height === Math.round(r.height * dpr)) return;
  cv.width = Math.round(r.width * dpr);
  cv.height = Math.round(r.height * dpr);
  BOARD.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  BOARD.ctx.lineCap = BOARD.ctx.lineJoin = "round";
  boardRepaint();                    // size changed → redraw everything to scale
}

/* ---- rendering ---- */
function drawEl(el) {
  const ctx = BOARD.ctx, { w, h } = boardMetrics();
  if (el.kind === "path") {
    const p = el.payload; if (!p.pts || p.pts.length < 1) return;
    ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, p.w * w);
    ctx.beginPath();
    p.pts.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h));
    if (p.pts.length === 1) { const [x, y] = p.pts[0]; ctx.lineTo(x * w + .01, y * h); }
    ctx.stroke();
  } else if (el.kind === "text") {
    const p = el.payload;
    ctx.fillStyle = p.color; ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.round(p.size * h)}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillText(p.text, p.x * w, p.y * h);
  } else if (el.kind === "photo" && el._img) {
    const p = el.payload;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
    ctx.fillStyle = "#EDE8DC";
    ctx.fillRect(p.x * w - 6, p.y * h - 6, p.w * w + 12, p.h * h + 12);
    ctx.restore();
    ctx.drawImage(el._img, p.x * w, p.y * h, p.w * w, p.h * h);
  }
}
function boardRepaint() {
  const cv = $("gb-canvas");
  BOARD.ctx.clearRect(0, 0, cv.width, cv.height);
  BOARD.strokes.forEach(drawEl);
}

/* photos need their image decoded before they can paint; do it once, then repaint */
function hydratePhoto(el) {
  if (el.kind !== "photo" || el._img) return;
  const im = new Image();
  im.onload = () => { el._img = im; boardRepaint(); };
  im.src = el.payload.src;
}

/* ---- server ---- */
async function boardFetch(since) {
  const q = since
    ? `created_at=gt.${encodeURIComponent(since)}&order=created_at.asc`
    : `order=created_at.asc&limit=4000`;
  const r = await fetch(`${SUPA.url}/rest/v1/board?select=id,kind,payload,created_at&${q}`, { headers: supaHeaders() });
  if (!r.ok) throw new Error(r.status);
  return (await r.json()).map(row => ({ id: row.id, kind: row.kind, payload: row.payload, at: row.created_at }));
}
async function boardCommit(kind, payload) {
  // draw locally at once so it feels instant
  const el = { kind, payload, at: new Date().toISOString(), local: true };
  hydratePhoto(el);
  BOARD.strokes.push(el);
  drawEl(el);
  if (!SHARED()) return;
  try {
    const r = await fetch(`${SUPA.url}/rest/v1/board`, {
      method: "POST",
      headers: { ...supaHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ kind, payload }),
    });
    if (!r.ok) throw new Error(await r.text() || r.status);
  } catch { gbToast("Offline — others won't see this one"); }
}
async function boardLoad() {
  if (!SHARED()) { boardRepaint(); return; }
  try {
    const list = await boardFetch(null);
    BOARD.strokes = list;
    BOARD.lastAt = list.length ? list[list.length - 1].at : null;
    list.forEach(hydratePhoto);
    boardRepaint();
  } catch { gbToast("Could not load the board"); }
}
function boardStartPoll() {
  clearInterval(BOARD.poll);
  if (!SHARED()) return;
  BOARD.poll = setInterval(async () => {
    if (!BOARD.on) return;
    try {
      const fresh = await boardFetch(BOARD.lastAt);
      if (!fresh.length) return;
      // drop echoes of our own just-committed marks (match on rounded time+kind)
      fresh.forEach(el => {
        BOARD.lastAt = el.at;
        hydratePhoto(el);
        BOARD.strokes.push(el);
        drawEl(el);
      });
    } catch { /* transient */ }
  }, 4000);
}

/* ---- input ---- */
function gbInit() {
  if (BOARD.ready) return;
  BOARD.ready = true;
  const cv = $("gb-canvas");
  BOARD.ctx = cv.getContext("2d");

  $("gb-inks").innerHTML = GB_INKS.map((c, i) =>
    `<button class="gb-ink ${i ? "" : "on"}" data-ink="${c}" style="background:${c}" aria-label="ink ${i + 1}"></button>`).join("");
  $("gb-inks").addEventListener("click", e => {
    const b = e.target.closest(".gb-ink"); if (!b) return;
    BOARD.ink = b.dataset.ink;
    $("gb-inks").querySelectorAll(".gb-ink").forEach(x => x.classList.toggle("on", x === b));
  });
  $("gb-tool-set").addEventListener("click", e => {
    const b = e.target.closest(".gb-tool"); if (!b) return;
    BOARD.tool = b.dataset.tool;
    $("gb-tool-set").querySelectorAll(".gb-tool").forEach(x => x.classList.toggle("on", x === b));
    if (BOARD.tool === "photo") $("gb-file").click();
    cv.style.cursor = BOARD.tool === "text" ? "text" : "crosshair";
  });

  const norm = e => { const r = cv.getBoundingClientRect(); return [ (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height ]; };
  const atPx = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  cv.addEventListener("pointerdown", e => {
    if (BOARD.tool === "text") { e.preventDefault(); gbPlaceText(atPx(e), norm(e)); return; }
    if (BOARD.tool !== "pen") return;
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    BOARD.drawing = true; BOARD.pts = [norm(e)];
    // live feedback: draw the first dab
    const { w, h } = boardMetrics();
    BOARD.ctx.strokeStyle = BOARD.ink; BOARD.ctx.lineWidth = Math.max(1, .0022 * w);
    BOARD.ctx.beginPath(); BOARD.ctx.moveTo(BOARD.pts[0][0] * w, BOARD.pts[0][1] * h);
  });
  cv.addEventListener("pointermove", e => {
    if (!BOARD.drawing) return;
    const { w, h } = boardMetrics();
    const p = norm(e); BOARD.pts.push(p);
    BOARD.ctx.strokeStyle = BOARD.ink; BOARD.ctx.lineWidth = Math.max(1, .0022 * w);
    BOARD.ctx.lineTo(p[0] * w, p[1] * h); BOARD.ctx.stroke();
    BOARD.ctx.beginPath(); BOARD.ctx.moveTo(p[0] * w, p[1] * h);
  });
  const endStroke = () => {
    if (!BOARD.drawing) return;
    BOARD.drawing = false;
    if (!BOARD.pts.length) return;
    boardCommit("path", { color: BOARD.ink, w: .0022, pts: BOARD.pts.map(([x, y]) => [ +x.toFixed(4), +y.toFixed(4) ]) });
    BOARD.pts = [];
  };
  ["pointerup", "pointercancel", "pointerleave"].forEach(t => cv.addEventListener(t, endStroke));

  $("gb-file").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0]; e.target.value = "";
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const im = new Image();
      im.onload = () => {
        // downscale so one photo row stays small
        const MAX = 520, s = Math.min(1, MAX / im.width);
        const oc = document.createElement("canvas");
        oc.width = Math.round(im.width * s); oc.height = Math.round(im.height * s);
        oc.getContext("2d").drawImage(im, 0, 0, oc.width, oc.height);
        const src = oc.toDataURL("image/jpeg", 0.82);
        const { w, h } = boardMetrics();
        const pw = Math.min(260, oc.width), ph = pw * oc.height / oc.width;
        const x = (w / 2 - pw / 2 + (Math.random() - .5) * 120) / w;
        const y = (h / 2 - ph / 2 + (Math.random() - .5) * 80) / h;
        boardCommit("photo", { x: +x.toFixed(4), y: +y.toFixed(4), w: +(pw / w).toFixed(4), h: +(ph / h).toFixed(4), src });
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
  });

  $("gb-exit").addEventListener("click", () => setDeskMode("wallpaper"));
  addEventListener("resize", () => { if (BOARD.on) boardSize(); }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(() => { if (BOARD.on) boardSize(); }).observe($("gb-layer"));
}

/* click, type, Enter commits the text as one element */
function gbPlaceText(px, n) {
  const box = $("gb-caret");
  box.hidden = false;
  box.style.left = px.x + "px"; box.style.top = px.y + "px";
  box.innerHTML = `<input class="gb-text-in" placeholder="type…" spellcheck="false" maxlength="80">`;
  const input = box.querySelector("input");
  input.style.color = BOARD.ink;
  requestAnimationFrame(() => input.focus());
  let done = false;
  const commit = () => {
    if (done) return; done = true;
    const v = input.value.trim();
    box.hidden = true; box.innerHTML = "";
    if (!v) return;
    const { h } = boardMetrics();
    boardCommit("text", { color: BOARD.ink, x: +n[0].toFixed(4), y: +n[1].toFixed(4), size: +(26 / h).toFixed(4), text: v });
  };
  input.addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key === "Enter") commit();
    if (e.key === "Escape") { done = true; box.hidden = true; box.innerHTML = ""; }
  });
  input.addEventListener("blur", commit);
}

function gbToast(msg) {
  let t = document.querySelector(".gb-toast");
  if (!t) { t = document.createElement("div"); t.className = "gb-toast"; $("gb-layer").appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 1800);
}

/* ---- the mode switch ---- */
let deskMode = "wallpaper";
function setDeskMode(mode) {
  deskMode = mode;
  const on = mode === "guestbook";
  $("mb-mode-name").textContent = on ? "Guest Book" : "Wallpaper";
  $("gb-layer").hidden = !on;
  document.body.classList.toggle("gb-on", on);
  BOARD.on = on;
  if (on) {
    gbInit();
    hideWindow("min");
    boardSize();
    boardLoad();
    boardStartPoll();
    requestAnimationFrame(boardSize);
  } else {
    clearInterval(BOARD.poll);
    openWindow();
  }
}
// the trigger button is `hidden` in index.html while Guest Book is disabled;
// this listener stays wired up (harmlessly inert) so re-enabling is a one-line change
$("mb-mode").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(
    mi("Wallpaper", "mode-wallpaper", "", { check: deskMode === "wallpaper" }) +
    mi("Guest Book", "mode-guestbook", "", { check: deskMode === "guestbook" }),
    r.left, r.bottom + 4);
});

/* ---- columns: every level of the path stays on screen, left to right ---- */
function renderColumns(list) {
  const chain = pathOf(cwd);                    // root … cwd
  const sel = selection.size === 1 ? [...selection][0] : null;
  const cols = chain.map((node, depth) => {
    const next = chain[depth + 1];
    const kids = node.children || [];
    const rows = kids.length ? kids.map(c => {
      const onPath = c === next;
      const isSel = depth === chain.length - 1 && selection.has(c);
      return `<div class="col-row ${onPath ? "on-path" : ""} ${isSel ? "selected" : ""}"
                   data-depth="${depth}" data-name="${c.name}"
                   ${depth === chain.length - 1 ? `data-i="${list.indexOf(c)}"` : ""}>
                ${iconSvg(c, "")}<span>${c.name}</span>${c.children ? '<span class="chev">›</span>' : ""}
              </div>`;
    }).join("") : `<div class="col-empty">Empty folder</div>`;
    return `<div class="col" data-depth="${depth}">${rows}</div>`;
  });
  // a file selected in the last column gets a preview column of its own
  if (sel && !sel.children) {
    cols.push(`<div class="col-preview">${iconSvg(sel, "")}
      <div class="cp-name">${sel.name}</div>
      <div class="cp-meta">${sel.kind}${sel.size !== "--" ? ` — ${sel.size}` : ""}</div></div>`);
  } else if (sel && sel.children) {
    const kids = sel.children;
    cols.push(`<div class="col">${kids.length
      ? kids.map(c => `<div class="col-row">${iconSvg(c, "")}<span>${c.name}</span>${c.children ? '<span class="chev">›</span>' : ""}</div>`).join("")
      : '<div class="col-empty">Empty folder</div>'}</div>`);
  }
  els.columnsView.innerHTML = cols.join("");

  els.columnsView.querySelectorAll(".col-row[data-name]").forEach(row => {
    row.addEventListener("click", () => {
      const depth = +row.dataset.depth;
      const node = (chain[depth].children || []).find(c => c.name === row.dataset.name);
      if (!node) return;
      if (depth < chain.length - 1) { navigate(node.children ? node : chain[depth]); return; }
      selectOnly(node, list.indexOf(node));
      renderColumns(items());
    });
    row.addEventListener("dblclick", () => {
      const depth = +row.dataset.depth;
      const node = (chain[depth].children || []).find(c => c.name === row.dataset.name);
      node && openNode(node);
    });
  });
  els.columnsView.scrollLeft = els.columnsView.scrollWidth;
}

/* ---- gallery: one subject large, the rest as a filmstrip ---- */
function renderGallery(list) {
  const star = selection.size ? [...selection][0] : list[0];
  els.galleryView.innerHTML = star ? `
    <div class="gal-stage">
      ${iconSvg(star, "")}
      <div class="gal-name">${star.name}</div>
      <div class="gal-meta">${star.kind}${star.children ? ` — ${star.children.length} item${star.children.length === 1 ? "" : "s"}` : ""} · ${dateOf(star)}</div>
    </div>
    <div class="gal-strip">
      ${list.map((n, i) => `
        <div class="gal-thumb ${n === star ? "selected" : ""}" data-i="${i}">
          ${iconSvg(n, "")}<span>${n.name}</span>
        </div>`).join("")}
    </div>` : `<div class="gal-stage"><div class="gal-meta">Empty folder</div></div>`;

  els.galleryView.querySelectorAll(".gal-thumb").forEach(t => {
    t.addEventListener("click", () => {
      const node = list[+t.dataset.i];
      if (node.children) { navigate(node); return; }   // a folder opens straight away
      selectOnly(node, +t.dataset.i); renderGallery(list);
    });
  });
  const on = els.galleryView.querySelector(".gal-thumb.selected");
  on && on.scrollIntoView({ block: "nearest", inline: "nearest" });
}


/* ================= selection ================= */
const ITEM_SEL = { home: ".hl-none", icon: ".icon-item", list: ".lv-row", columns: ".col-row[data-i]", gallery: ".gal-thumb", digital: ".dg-item" };
// Digital is its own mode regardless of what `view` is set to (it has no
// icon/list/columns/gallery fallback) — this is the single source of truth
// for "what's actually on screen right now" that selection/clicks key off.
function curView() {
  if (cwd === ROOT && !els.homeView.hidden) return "home";
  if (cwd.name === "Dazzcam" && !els.digitalView.hidden) return "digital";
  if (cwd !== ROOT && cwd.parent === ROOT && !els.filmsSectionView.hidden) return "films-section";
  if (cwd.name === "Film Projects" && !els.filmsView.hidden) return "films";
  if (cwd.parent && cwd.parent.name === "Film Projects" && !els.filmDetailView.hidden) return "film-detail";
  if (cwd.name === "WRITINGS" && !els.writingsView.hidden) return "writings";
  if (cwd.kind === "Essay" && !els.essayView.hidden) return "essay";
  if (cwd.name === "WORK EXPERIENCE" && !els.workView.hidden) return "work";
  return view;
}
function elementsForItems() {
  return [...els.content.querySelectorAll(ITEM_SEL[curView()])]
    .filter(el => el.dataset.i !== undefined && +el.dataset.i >= 0);
}
function applySelectionClasses() {
  const list = items();
  elementsForItems().forEach(el => {
    el.classList.toggle("selected", selection.has(list[+el.dataset.i]));
  });
}
function selectOnly(node, idx) { selection.clear(); if (node) selection.add(node); anchorIndex = idx; applySelectionClasses(); }

function handleItemMousedown(e) {
  const el = e.target.closest(ITEM_SEL[curView()]);
  if (!el || el.dataset.i === undefined) return false;
  const list = items();
  const idx = +el.dataset.i, node = list[idx];
  if (!node) return false;
  if (e.metaKey || e.ctrlKey) {
    selection.has(node) ? selection.delete(node) : selection.add(node);
    anchorIndex = idx;
  } else if (e.shiftKey && anchorIndex >= 0) {
    selection.clear();
    const [a, b] = [Math.min(anchorIndex, idx), Math.max(anchorIndex, idx)];
    for (let i = a; i <= b; i++) selection.add(list[i]);
  } else if (!selection.has(node)) {
    selection.clear(); selection.add(node); anchorIndex = idx;
  }
  applySelectionClasses();
  return true;
}

function openNode(node) {
  if (!node) return;
  if (node.children) navigate(node);
  else if (node.isPhoto) quickLook(node);
  else if (node.external) window.open(node.href, "_blank", "noopener");
  else if (node.href) window.open(node.href, "_blank", "noopener");
}

/* content clicks */
els.content.addEventListener("mousedown", e => {
  if (e.button === 2) { // right click: select target under cursor
    const el = e.target.closest(ITEM_SEL[curView()]);
    if (el && el.dataset.i !== undefined) {
      const node = items()[+el.dataset.i];
      if (node && !selection.has(node)) selectOnly(node, +el.dataset.i);
    }
    return;
  }
  if (e.target.closest(".lv-head")) return;
  // columns and gallery wire their own clicks; only icon/list/digital drag-select
  if (["home", "columns", "gallery", "films", "films-section", "film-detail", "writings", "essay", "work"].includes(curView())) { els.content.focus(); return; }
  const hit = handleItemMousedown(e);
  if (!hit) startRubberBand(e);
  els.content.focus();
});
/* One click opens — the way every phone file browser (and this site's touch
   handling) already behaved; mouse and touch now agree. A modified click
   (⌘/Ctrl/Shift) stays selection-only, since that's how multi-select works. */
els.content.addEventListener("click", e => {
  if (["home", "columns", "gallery", "films", "films-section", "film-detail", "writings", "essay", "work"].includes(curView())) return;
  if (e.target.tagName === "INPUT") return;          // don't hijack an inline rename
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;   // modified click: selection only
  const el = e.target.closest(ITEM_SEL[curView()]);
  if (el && el.dataset.i !== undefined) openNode(items()[+el.dataset.i]);
});

/* rubber band */
function startRubberBand(e) {
  if (e.button !== 0) return;
  const rect = els.content.getBoundingClientRect();
  const ox = e.clientX - rect.left + els.content.scrollLeft;
  const oy = e.clientY - rect.top + els.content.scrollTop;
  if (!e.metaKey && !e.shiftKey) { selection.clear(); applySelectionClasses(); }
  const band = els.rubber;
  let moved = false;

  const onMove = (ev) => {
    const x = ev.clientX - rect.left + els.content.scrollLeft;
    const y = ev.clientY - rect.top + els.content.scrollTop;
    if (!moved && Math.hypot(x - ox, y - oy) < 4) return;
    moved = true; band.hidden = false;
    const L = Math.min(ox, x), T = Math.min(oy, y), W = Math.abs(x - ox), H = Math.abs(y - oy);
    Object.assign(band.style, { left: L + "px", top: T + "px", width: W + "px", height: H + "px" });
    const bandRect = { left: L, top: T, right: L + W, bottom: T + H };
    const list = items();
    elementsForItems().forEach(el => {
      const r = el.getBoundingClientRect();
      const er = {
        left: r.left - rect.left + els.content.scrollLeft, top: r.top - rect.top + els.content.scrollTop,
        right: r.right - rect.left + els.content.scrollLeft, bottom: r.bottom - rect.top + els.content.scrollTop,
      };
      const inside = !(er.right < bandRect.left || er.left > bandRect.right || er.bottom < bandRect.top || er.top > bandRect.bottom);
      const node = list[+el.dataset.i];
      inside ? selection.add(node) : selection.delete(node);
      el.classList.toggle("selected", selection.has(node));
    });
  };
  const onUp = () => {
    band.hidden = true;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

/* keyboard */
els.content.addEventListener("keydown", e => {
  const list = items();
  const idxOf = n => list.indexOf(n);
  const selIdx = [...selection].map(idxOf).sort((a, b) => a - b);
  const cv = curView();
  const cols = cv === "digital"
    ? Math.max(1, Math.round(els.digitalView.clientWidth / (els.digitalView.querySelector(".dg-item")?.getBoundingClientRect().width || 160)))
    : cv === "icon"
      ? Math.max(1, Math.floor(els.iconView.clientWidth / (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-size")) + 50)))
      : 1;

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") { e.preventDefault(); list.forEach(n => selection.add(n)); applySelectionClasses(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "1") { e.preventDefault(); setView("icon"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "2") { e.preventDefault(); setView("list"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "3") { e.preventDefault(); setView("columns"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "4") { e.preventDefault(); setView("gallery"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") { e.preventDefault(); goUp(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") { e.preventDefault(); selection.size === 1 && openNode([...selection][0]); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") { e.preventDefault(); hideWindow("min"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "[") { e.preventDefault(); goBack(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "]") { e.preventDefault(); goForward(); return; }
  if (e.key === " " || e.code === "Space") {
    e.preventDefault(); e.stopPropagation();
    if (els.overlayLayer.querySelector(".qlook")) closeOverlays();   // space toggles Quick Look, like Finder
    else if (selection.size) quickLook([...selection][0]);
    return;
  }
  if (e.key === "Escape") { closeOverlays(); selection.clear(); applySelectionClasses(); return; }
  if (e.key === "Enter") { e.preventDefault(); if (selection.size === 1) startRename([...selection][0]); return; }

  if (cv === "home") {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); homeStep(e.key === "ArrowRight" ? 1 : -1); }
    return;
  }
  const arrows = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
  if (e.key in arrows && list.length) {
    e.preventDefault();
    let next;
    if (!selection.size) next = 0;
    else {
      const cur = arrows[e.key] > 0 ? selIdx[selIdx.length - 1] : selIdx[0];
      next = Math.min(list.length - 1, Math.max(0, cur + arrows[e.key]));
    }
    if (e.shiftKey && anchorIndex >= 0) {
      selection.clear();
      const [a, b] = [Math.min(anchorIndex, next), Math.max(anchorIndex, next)];
      for (let i = a; i <= b; i++) selection.add(list[i]);
      applySelectionClasses();
    } else selectOnly(list[next], next);
    const el = elementsForItems()[next];
    el && el.scrollIntoView({ block: "nearest" });
  }
});

/* rename (visual only — resets on reload, like a demo desk) */
function startRename(node) {
  if (view !== "icon") return;
  const list = items();
  const el = elementsForItems()[list.indexOf(node)];
  if (!el) return;
  const label = el.querySelector(".ic-label");
  label.innerHTML = `<input value="${node.name}">`;
  const input = label.querySelector("input");
  input.focus(); input.select();
  const commit = () => { node.name = input.value.trim() || node.name; render(); };
  input.addEventListener("keydown", ev => {
    ev.stopPropagation();
    if (ev.key === "Enter") commit();
    if (ev.key === "Escape") render();
  });
  input.addEventListener("blur", commit);
  input.addEventListener("mousedown", ev => ev.stopPropagation());
}

/* ================= view switching =================
   No UI button for this anymore (⌘1–⌘4 still work) — see VIEW_ICON's old
   home in git history if a picker comes back. */
const VIEW_ICON = { icon: "t-grid", list: "t-list", columns: "t-columns", gallery: "t-gallery" };
function setView(v) {
  if (!VIEW_ICON[v]) return;
  if (cwd.name === "Dazzcam") return; // one view here — nothing to switch to
  view = v;
  render();
}

/* ================= dropdown menus ================= */
let openMenu = null;
function closeMenus() {
  els.menuLayer.innerHTML = "";
  document.querySelectorAll(".mb-item.open").forEach(b => b.classList.remove("open"));
  openMenu = null;
}
function showMenu(html, x, y, ownerBtn) {
  closeMenus();
  const dd = document.createElement("div");
  dd.className = "dropdown";
  dd.innerHTML = html;
  els.menuLayer.appendChild(dd);
  const r = dd.getBoundingClientRect();
  dd.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
  dd.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  // menus grow out of the point that summoned them (§7 anchored origins)
  dd.style.transformOrigin = `${Math.max(8, x - parseFloat(dd.style.left))}px top`;
  if (ownerBtn) ownerBtn.classList.add("open");
  openMenu = dd;
  dd.addEventListener("click", e => {
    const it = e.target.closest(".dd-item");
    if (!it || it.classList.contains("disabled")) return;
    const act = it.dataset.act;
    closeMenus();
    act && runAction(act, it.dataset.arg);
  });
  return dd;
}
const mi = (label, act, kbd = "", opts = {}) =>
  `<div class="dd-item ${opts.disabled ? "disabled" : ""}" ${act ? `data-act="${act}"` : ""} ${opts.arg ? `data-arg="${opts.arg}"` : ""}>
     <span><span class="check">${opts.check ? "✓" : ""}</span>${label}</span>${kbd ? `<span class="kbd">${kbd}</span>` : ""}</div>`;
const sep = '<div class="dd-sep"></div>';
const tagRow = `<div class="dd-tags">${TAG_COLORS.map(c => `<i style="background:${c}"></i>`).join("")}</div>`;

/* eslint-disable no-unused-vars */
const MENUS_RETIRED = {
  apple: () => mi("About This Mac", "about") + sep + mi("System Settings…", null, "", { disabled: true }) +
    mi("App Store…", null, "", { disabled: true }) + sep + mi("Sleep", null, "", { disabled: true }) +
    mi("Restart…", null, "", { disabled: true }) + mi("Shut Down…", null, "", { disabled: true }) +
    sep + mi("Lock Screen", null, "⌃⌘Q", { disabled: true }),
  finder: () => mi("About Finder", "about") + sep + mi("Settings…", null, "⌘,", { disabled: true }) +
    sep + mi("Empty Trash…", null, "⇧⌘⌫", { disabled: true }) + sep + mi("Hide Finder", null, "⌘H", { disabled: true }),
  file: () => mi("New Finder Window", "reopen", "⌘N") + mi("New Folder", null, "⇧⌘N", { disabled: true }) +
    sep + mi("Open", "open-sel", "⌘O", { disabled: !selection.size }) +
    mi("Quick Look", "ql-sel", "Space", { disabled: !selection.size }) +
    mi("Get Info", "info-sel", "⌘I", { disabled: !selection.size }) +
    sep + mi("Rename", "rename-sel", "", { disabled: selection.size !== 1 }) +
    mi("Duplicate", null, "⌘D", { disabled: true }) + mi("Make Alias", null, "⌃⌘A", { disabled: true }) +
    sep + mi("Move to Trash", null, "⌘⌫", { disabled: true }),
  edit: () => mi("Undo", null, "⌘Z", { disabled: true }) + mi("Redo", null, "⇧⌘Z", { disabled: true }) + sep +
    mi("Cut", null, "⌘X", { disabled: true }) + mi("Copy", null, "⌘C", { disabled: !selection.size }) +
    mi("Paste", null, "⌘V", { disabled: true }) + mi("Select All", "select-all", "⌘A"),
  view: () => mi("as Icons", "view-icon", "⌘1", { check: view === "icon" }) +
    mi("as List", "view-list", "⌘2", { check: view === "list" }) +
    mi("as Columns", null, "⌘3", { disabled: true }) + mi("as Gallery", null, "⌘4", { disabled: true }) +
    sep + mi("Toggle Sidebar", "toggle-sidebar", "⌥⌘S") +
    sep + mi("Show Path Bar", null, "⌥⌘P", { check: true, disabled: true }) +
    mi("Show Status Bar", null, "⌘/", { check: true, disabled: true }),
  go: () => mi("Back", "back", "⌘[", { disabled: !history.length }) +
    mi("Forward", "fwd", "⌘]", { disabled: !future.length }) +
    mi("Enclosing Folder", "up", "⌘↑", { disabled: !cwd.parent }) + sep +
    mi("&nbsp;Home", "goto", "⇧⌘D", { arg: "Home" }) +
    mi("&nbsp;FILMS", "goto", "", { arg: "FILMS" }) + mi("&nbsp;WORK EXPERIENCE", "goto", "", { arg: "WORK EXPERIENCE" }) +
    mi("&nbsp;WRITINGS", "goto", "", { arg: "WRITINGS" }) + mi("&nbsp;PHOTOGRAPHY", "goto", "", { arg: "PHOTOGRAPHY" }),
  window: () => mi("Minimize", "minimize", "⌘M") + mi("Zoom", "zoom") + sep + mi("Haolang Li", "reopen", "", { check: true }),
  help: () => mi("About this site", "about") + sep + mi("macOS Help", null, "", { disabled: true }),
};

/* ================= build footer =================
   The browser will happily serve a cached style.css/app.js after a deploy.
   This refetches both with cache:"reload" — which replaces the HTTP cache
   entries — then reloads on a fresh URL so the HTML isn't cached either. */
(function buildFooter() {
  const btn = $("side-refresh"), tag = $("sf-build");
  if (!btn) return;
  const assetUrls = () => [
    ...document.querySelectorAll('link[rel="stylesheet"][href]'),
    ...document.querySelectorAll("script[src]"),
  ].map(el => el.href || el.src).filter(u => u.startsWith(location.origin));

  const mine = document.currentScript?.src || assetUrls().find(u => u.includes("app.js")) || "";
  if (tag) tag.textContent = (mine.match(/[?&]v=([^&]+)/) || [, "dev"])[1];

  btn.addEventListener("click", async () => {
    btn.classList.add("spin");
    try {
      await Promise.all(assetUrls().map(u => fetch(u, { cache: "reload" })));
    } catch { /* offline or blocked — reload anyway */ }
    const url = new URL(location.href);
    url.searchParams.set("r", Date.now().toString(36));
    location.replace(url);
  });

  /* The same staleness catches visitors silently, and there's nobody to press
     the button. GitHub Pages serves index.html with max-age=600, so for ten
     minutes after a deploy a returning browser keeps the old HTML, keeps
     asking for the ?v= assets that HTML names, and shows the previous version
     of the site — the deploy looks like it never happened. So: ask the server
     what it is serving right now, and if it has moved on, take the new one.
     Once per version — the guard is what stops a reload loop when the answer
     doesn't change. */
  (async () => {
    const running = tag && tag.textContent;
    if (!running || running === "dev") return;
    const KEY = "hl-freshened";
    try {
      const html = await (await fetch("/", { cache: "no-store" })).text();
      const latest = (html.match(/app\.js\?v=([^"'&]+)/) || [])[1];
      if (!latest || latest === running) { sessionStorage.removeItem(KEY); return; }
      if (sessionStorage.getItem(KEY) === latest) return;
      sessionStorage.setItem(KEY, latest);
      await Promise.all(assetUrls().map(u => fetch(u, { cache: "reload" }).catch(() => {})));
      location.reload();
    } catch { /* offline, or the fetch was blocked — nothing to do */ }
  })();
})();

/* ================= menu bar: name + appearance ================= */
$("mb-name").addEventListener("click", () => openWindow());

const THEME_KEY = "hl-theme";
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $("mb-theme").title = t === "dark" ? "Switch to light appearance" : "Switch to dark appearance";
}
applyTheme(localStorage.getItem(THEME_KEY) || "dark");
$("mb-theme").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch {}
});

$("tb-back").addEventListener("click", goBack);
$("tb-fwd").addEventListener("click", goForward);
$("side-collapse").addEventListener("click", () => els.sidebar.classList.add("collapsed"));
$("side-expand").addEventListener("click", () => els.sidebar.classList.remove("collapsed"));

/* ================= context menu ================= */
els.content.addEventListener("contextmenu", e => {
  e.preventDefault();
  const el = e.target.closest(ITEM_SEL[curView()]);
  let html;
  if (el && el.dataset.i !== undefined && items()[+el.dataset.i]) {
    const node = items()[+el.dataset.i];
    if (!selection.has(node)) selectOnly(node, +el.dataset.i);
    html =
      mi("Open", "open-sel") + mi("Open With", null, "", { disabled: true }) + sep +
      mi("Move to Trash", null, "", { disabled: true }) + sep +
      mi("Get Info", "info-sel", "⌘I") + mi("Rename", "rename-sel", "", { disabled: selection.size !== 1 }) +
      mi("Duplicate", null, "⌘D", { disabled: true }) + mi("Make Alias", null, "", { disabled: true }) +
      mi(`Quick Look “${node.name}”`, "ql-sel", "Space") + sep +
      mi("Copy", null, "⌘C", { disabled: true }) + mi("Share…", null, "", { disabled: true }) + sep +
      tagRow + mi("Tags…", null, "", { disabled: true }) + sep +
      mi("Quick Actions", null, "", { disabled: true }) + sep + mi("Services", null, "", { disabled: true });
  } else {
    html =
      mi("New Folder", null, "", { disabled: true }) + sep +
      mi("Get Info", "info-cwd", "⌘I") + sep +
      mi("View", null, "", { disabled: true }) + mi("Sort By", null, "", { disabled: true }) + sep +
      mi("Show View Options", null, "", { disabled: true });
  }
  showMenu(html, e.clientX, e.clientY);
});
window.addEventListener("mousedown", e => {
  if (!e.target.closest(".dropdown") && !e.target.closest(".mb-item")) closeMenus();
});
window.addEventListener("blur", closeMenus);

/* ================= actions ================= */
function runAction(act, arg) {
  switch (act) {
    case "back": goBack(); break;
    case "fwd": goForward(); break;
    case "up": goUp(); break;
    case "goto": { const n = findByName(arg); n && navigate(n); break; }
    case "view-icon": setView("icon"); break;
    case "view-list": setView("list"); break;
    case "view-columns": setView("columns"); break;
    case "view-gallery": setView("gallery"); break;
    case "select-all": items().forEach(n => selection.add(n)); applySelectionClasses(); break;
    case "open-sel": [...selection].forEach(openNode); break;
    case "ql-sel": selection.size && quickLook([...selection][0]); break;
    case "info-sel": [...selection].slice(0, 3).forEach((n, i) => getInfo(n, i)); break;
    case "info-cwd": getInfo(cwd, 0); break;
    case "rename-sel": selection.size === 1 && startRename([...selection][0]); break;
    case "admin-uploads": openUploads(); break;
    case "admin-out": adminLogout(); break;
    case "mode-wallpaper": setDeskMode("wallpaper"); break;
    case "mode-guestbook": setDeskMode("guestbook"); break;
    case "toggle-sidebar": els.sidebar.classList.toggle("collapsed"); break;
    case "minimize": hideWindow("min"); break;
    case "zoom": toggleFullscreen(); break;
    case "reopen": openWindow(); break;
    case "about": showAbout(); break;
  }
}

/* ================= quick look ================= */
function closeOverlays() { els.overlayLayer.innerHTML = ""; }
function anchorRectFor(node) {
  const el = elementsForItems()[items().indexOf(node)];
  return el ? el.getBoundingClientRect() : null;
}
/* a surface arrives as a material — scale in from the element that summoned it */
function materialize(box, anchorRect) {
  const rect = box.getBoundingClientRect();
  box.style.left = rect.left + "px"; box.style.top = rect.top + "px";
  if (!anchorRect) {
    setPresentation(box, { scale: 0.94, opacity: 0 });
    springTo(box, { scale: 1, opacity: 1 }, { response: 0.3 });
    return;
  }
  const dx = anchorRect.left + anchorRect.width / 2 - (rect.left + rect.width / 2);
  const dy = anchorRect.top + anchorRect.height / 2 - (rect.top + rect.height / 2);
  setPresentation(box, { x: dx, y: dy, scale: 0.2, opacity: 0 });
  springTo(box, { x: 0, y: 0, scale: 1, opacity: 1 }, { response: 0.38 });
}
function quickLook(node) {
  if (node.isPhoto) { track("photo-open", { photo: node.name }); photoViewer(node); return; }
  closeOverlays();
  const box = document.createElement("div");
  box.className = "qlook";
  let body;
  if (node.href && /\.pdf$/i.test(node.name)) body = `<iframe src="${node.href}" title="${node.name}"></iframe>`;
  else if (node.href && node.external) body = `${iconSvg(node)}`;
  else body = iconSvg(node);
  box.innerHTML = `
    <div class="ql-bar"><button class="ql-close" aria-label="Close"></button><div class="ql-title">${node.name}</div></div>
    <div class="ql-body">${body}</div>
    <div class="ql-meta">${node.kind}${node.children ? ` — ${node.children.length} item${node.children.length === 1 ? "" : "s"}` : ""}</div>`;
  els.overlayLayer.appendChild(box);
  materialize(box, anchorRectFor(node));
  box.querySelector(".ql-close").addEventListener("click", closeOverlays);
  const esc = ev => { if (ev.key === "Escape" || ev.key === " " || ev.code === "Space") { ev.preventDefault(); closeOverlays(); window.removeEventListener("keydown", esc); } };
  window.addEventListener("keydown", esc);
}

/* ---- photo viewer: full frame, no chrome, arrow-key through the roll ---- */
/* the photo itself grows out of the exact tile that was clicked (a true FLIP:
   translate + independent x/y scale, not the generic uniform-scale materialize
   used for panels), with a scrim that dims the room in behind it. */
function materializePhoto(box, backdrop, anchorRect) {
  const rect = box.getBoundingClientRect();
  box.style.left = rect.left + "px"; box.style.top = rect.top + "px";
  setPresentation(backdrop, { opacity: 0 });
  springTo(backdrop, { opacity: 1 }, { response: 0.42 });
  if (!anchorRect || !anchorRect.width || !anchorRect.height) {
    setPresentation(box, { scale: 0.92, opacity: 0 });
    springTo(box, { scale: 1, opacity: 1 }, { response: 0.34 });
    return;
  }
  const sx = anchorRect.width / rect.width, sy = anchorRect.height / rect.height;
  const dx = anchorRect.left + anchorRect.width / 2 - (rect.left + rect.width / 2);
  const dy = anchorRect.top + anchorRect.height / 2 - (rect.top + rect.height / 2);
  setPresentation(box, { x: dx, y: dy, sx, sy, opacity: 0.5 });
  springTo(box, { x: 0, y: 0, sx: 1, sy: 1, opacity: 1 }, { response: 0.4 });
}
/* the reverse of materializePhoto: shrinks back into the tile it came from
   (or the tile now under it, if the roll moved on) before it's removed */
function dematerializePhoto(box, backdrop, anchorRect, onDone) {
  springTo(backdrop, { opacity: 0 }, { response: 0.26 });
  const rect = box.getBoundingClientRect();
  if (!anchorRect || !anchorRect.width || !anchorRect.height) {
    springTo(box, { scale: 0.92, opacity: 0 }, { response: 0.24, onDone });
    return;
  }
  const sx = anchorRect.width / rect.width, sy = anchorRect.height / rect.height;
  const dx = anchorRect.left + anchorRect.width / 2 - (rect.left + rect.width / 2);
  const dy = anchorRect.top + anchorRect.height / 2 - (rect.top + rect.height / 2);
  springTo(box, { x: dx, y: dy, sx, sy, opacity: 0 }, { response: 0.28, onDone });
}
function photoViewer(node) {
  closeOverlays();
  const roll = (node.parent ? node.parent.children : [node]).filter(n => n.isPhoto);
  let i = Math.max(0, roll.indexOf(node));
  const backdrop = document.createElement("div");
  backdrop.className = "ql-backdrop";
  const box = document.createElement("div");
  box.className = "qlook qlook-photo";
  els.overlayLayer.append(backdrop, box);
  backdrop.addEventListener("click", close);

  function paint(anchor) {
    const n = roll[i];
    box.innerHTML = `
      <button class="ql-close" aria-label="Close"></button>
      ${roll.length > 1 ? `
        <button class="ql-nav ql-prev" aria-label="Previous"></button>
        <button class="ql-nav ql-next" aria-label="Next"></button>
        <div class="ql-count">${i + 1} / ${roll.length}</div>` : ""}
      <div class="ql-body"><img class="ql-img" src="${n.href}" alt=""></div>`;
    box.querySelector(".ql-close").addEventListener("click", close);
    if (roll.length > 1) {
      box.querySelector(".ql-prev").addEventListener("click", () => step(-1));
      box.querySelector(".ql-next").addEventListener("click", () => step(1));
    }
    selectOnly(n, items().indexOf(n));
    if (anchor !== undefined) materializePhoto(box, backdrop, anchor);
  }
  function step(d) { i = (i + d + roll.length) % roll.length; paint(); }
  function close() {
    window.removeEventListener("keydown", esc);
    dematerializePhoto(box, backdrop, anchorRectFor(roll[i]), () => { box.remove(); backdrop.remove(); });
  }

  paint(anchorRectFor(node));
  const esc = ev => {
    if (ev.key === "Escape" || ev.code === "Space") { ev.preventDefault(); close(); }
    else if (roll.length > 1 && ev.key === "ArrowLeft") { ev.preventDefault(); step(-1); }
    else if (roll.length > 1 && ev.key === "ArrowRight") { ev.preventDefault(); step(1); }
  };
  window.addEventListener("keydown", esc);
}

/* ================= get info ================= */
function getInfo(node, offset) {
  const box = document.createElement("div");
  box.className = "getinfo";
  box.style.left = (120 + offset * 30) + "px";
  box.style.top = (90 + offset * 30) + "px";
  const where = pathOf(node).slice(0, -1).map(n => n.name).join(" ▸ ") || "—";
  box.innerHTML = `
    <div class="gi-bar"><button class="gi-close" aria-label="Close"></button><div class="gi-title">${node.name} Info</div></div>
    <div class="gi-head">${iconSvg(node, "")}<div><div class="gi-name">${node.name}</div><div class="gi-sub">${node.size === "--" ? "" : node.size}</div></div></div>
    <div class="gi-sec"><h4>General</h4>
      <div class="gi-row"><b>Kind:</b><span>${node.kind}</span></div>
      <div class="gi-row"><b>Size:</b><span>${node.size === "--" ? (node.children ? `${node.children.length} items` : "—") : node.size}</span></div>
      <div class="gi-row"><b>Where:</b><span>${where}</span></div>
      <div class="gi-row"><b>Created:</b><span>${dateOf(node)}</span></div>
      <div class="gi-row"><b>Modified:</b><span>${dateOf(node)}</span></div>
    </div>`;
  els.overlayLayer.appendChild(box);
  materialize(box, anchorRectFor(node));
  box.querySelector(".gi-close").addEventListener("click", () => box.remove());
  makeDraggable(box, box.querySelector(".gi-bar"));
}

/* ================= about ================= */
function showAbout() {
  closeOverlays();
  const box = document.createElement("div");
  box.className = "getinfo";
  box.style.left = "calc(50% - 135px)"; box.style.top = "26%";
  box.innerHTML = `
    <div class="gi-bar"><button class="gi-close"></button><div class="gi-title">About</div></div>
    <div class="gi-sec" style="border-top:0;text-align:center;padding-bottom:18px">
      <div style="font-size:15px;font-weight:700;padding:6px 0 2px">Haolang Li</div>
      <div class="gi-sub">filmmaker & AI video creator</div>
      <div class="gi-sub" style="padding-top:10px">This site is a working replica of macOS Finder.<br>Double-click around. Press Space for Quick Look.</div>
    </div>`;
  els.overlayLayer.appendChild(box);
  materialize(box, null);
  box.querySelector(".gi-close").addEventListener("click", () => box.remove());
  makeDraggable(box, box.querySelector(".gi-bar"));
}

/* ================= window management: traffic lights ================= */
let winHidden = false;
function hideWindow(kind) {
  if (winHidden) return;
  winHidden = true;
  const r = els.win.getBoundingClientRect();
  // minimize sinks toward the bottom edge; close poofs in place — exit hints at where it went
  const dy = kind === "min" ? innerHeight - r.top - r.height / 2 : 70;
  springTo(els.win, { y: dy, scale: 0.08, opacity: 0 },
    { response: 0.42, onDone: () => els.win.classList.add("win-gone") });
}
function openWindow() {
  if (!winHidden) return;
  winHidden = false;
  els.win.classList.remove("win-gone");
  springTo(els.win, { y: 0, scale: 1, opacity: 1 }, { response: 0.42 });
}
function toggleFullscreen() {
  if (winHidden) return;
  const win = els.win;
  const r0 = win.getBoundingClientRect();
  const fs = !win.classList.contains("fullscreen");
  win.classList.toggle("fullscreen", fs);
  document.body.classList.toggle("has-fullscreen", fs);
  const r1 = win.getBoundingClientRect();
  // FLIP: jump to the new layout, then spring the visual difference away
  win.style.transformOrigin = "0 0";
  setPresentation(win, {
    x: r0.left - r1.left, y: r0.top - r1.top,
    sx: r0.width / r1.width, sy: r0.height / r1.height,
  });
  springTo(win, { x: 0, y: 0, sx: 1, sy: 1 }, { response: 0.45 });
}
$("tl-close").addEventListener("click", () => hideWindow("close"));
$("tl-min").addEventListener("click", () => hideWindow("min"));
$("tl-zoom").addEventListener("click", toggleFullscreen);
/* the desktop is the way back in: double-click any empty spot */
els.desktop.addEventListener("dblclick", e => { if (e.target === els.desktop) openWindow(); });

/* drag by toolbar / title — pointer events, 1:1 with grab offset, velocity-aware.
   Top edge rubber-bands instead of hard-stopping; release springs back. */
function makeDraggable(box, handle, { clampToDesktop = false, onFlickDown } = {}) {
  handle.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.target.closest("button") || e.target.closest(".tb-btn")) return;
    handle.setPointerCapture(e.pointerId);
    const startX = e.clientX, startY = e.clientY;
    const r = box.getBoundingClientRect();
    const parentR = clampToDesktop ? els.desktop.getBoundingClientRect() : { left: 0, top: 0 };
    // fold any in-flight spring translate into the base position (animate from presentation value)
    const st = springStates.get(box);
    const tx = st?.props.x?.val || 0, ty = st?.props.y?.val || 0;
    if (st) { for (const k of ["x", "y"]) if (st.props[k]) { st.props[k].val = 0; st.props[k].target = 0; st.props[k].vel = 0; } }
    const offL = r.left - parentR.left - tx, offT = r.top - parentR.top - ty;
    const vt = makeVelocityTracker();
    let moved = false;
    box.classList.add("dragging");
    const onMove = ev => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      vt.push(ev.clientX, ev.clientY);
      const rawTop = offT + dy;
      box.style.left = offL + dx + "px";
      box.style.top = (rawTop < 0 ? rubberband(rawTop) : rawTop) + "px";
    };
    const onUp = ev => {
      box.classList.remove("dragging");
      handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      if (!moved) return;
      const { vx, vy } = vt.read();
      if (onFlickDown && vy > 900) { onFlickDown({ vx, vy }); return; }
      const top = parseFloat(box.style.top);
      if (top < 0) { // was rubber-banding: spring home from the presentation value
        box.style.top = "0px";
        setPresentation(box, { y: top });
        springTo(box, { y: 0 }, { velocity: { y: vy }, response: 0.35 });
      }
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });
}
/* the whole top strip moves the window — toolbar and the sidebar's title area */
makeDraggable(els.win, $("toolbar"), { clampToDesktop: true });
makeDraggable(els.win, $("traffic"), { clampToDesktop: true });

/* resize */
$("resize-handle").addEventListener("mousedown", e => {
  e.preventDefault();
  const startX = e.clientX, startY = e.clientY;
  const r = els.win.getBoundingClientRect();
  els.win.classList.add("resizing");
  const onMove = ev => {
    els.win.style.width = Math.max(430, r.width + ev.clientX - startX) + "px";
    els.win.style.height = Math.max(300, r.height + ev.clientY - startY) + "px";
  };
  const onUp = () => {
    els.win.classList.remove("resizing");
    window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
});


/* ================= icon throw =================
   Grab an icon past the 10px hysteresis and throw it; it springs home
   carrying the release velocity (momentum gesture → a little bounce). */
els.content.addEventListener("pointerdown", e => {
  if (view !== "icon" || e.button !== 0) return;
  const el = e.target.closest(".icon-item");
  if (!el || e.target.tagName === "INPUT") return;
  const startX = e.clientX, startY = e.clientY;
  const vt = makeVelocityTracker();
  let dragging = false;
  const onMove = ev => {
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    if (!dragging) {
      if (Math.hypot(dx, dy) < 10) return;
      dragging = true;
      el.classList.add("lifted");
    }
    vt.push(ev.clientX, ev.clientY);
    setPresentation(el, { x: dx, y: dy });
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (!dragging) return;
    const { vx, vy } = vt.read();
    springTo(el, { x: 0, y: 0 },
      { damping: 0.8, response: 0.42, velocity: { x: vx, y: vy }, onDone: () => el.classList.remove("lifted") });
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
});

/* ================= misc chrome ================= */
/* live clock — same format as the macOS menu bar, and the same as macOS does it,
   the date drops away first when the bar runs out of room. */
const TIGHT_BAR = matchMedia("(max-width: 480px)");
function tickClock() {
  const d = new Date();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let h = d.getHours(); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  const time = `${h}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`;
  $("mb-clock").textContent = TIGHT_BAR.matches
    ? time
    : `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${time}`;
}
tickClock(); setInterval(tickClock, 15000);
TIGHT_BAR.addEventListener("change", tickClock);

/* the sidebar starts open (folded away on phones). Its own collapse button (top of the sidebar) and
   the toolbar's toggle both fold it away; on narrow screens it then sits on
   top of the content (see CSS), so it has to get out of the way once it has
   been used — the scrim is the way back out. */
const narrowMQ = matchMedia("(max-width: 740px)");
const closeSidebarIfNarrow = () => { if (narrowMQ.matches) els.sidebar.classList.add("collapsed"); };
if (narrowMQ.matches) {
  els.sidebar.style.transition = "none";
  els.sidebar.classList.add("collapsed");
  void els.sidebar.offsetWidth;
  els.sidebar.style.transition = "";
}
$("side-scrim").addEventListener("click", closeSidebarIfNarrow);
els.sideNav.addEventListener("click", e => { if (e.target.closest(".side-item")) closeSidebarIfNarrow(); });

/* ================= admin =================
   The owner signs in with Supabase Auth; the JWT is what actually unlocks
   writes (folders + uploads), enforced by RLS. Visitors can't get one. */
const ADMIN = { token: null, email: null, exp: 0 };
const isAdmin = () => Boolean(ADMIN.token) && Date.now() < ADMIN.exp;
const bearer = () => ({ apikey: SUPA.key, Authorization: `Bearer ${ADMIN.token}` });

function adminRestore() {
  try {
    const s = JSON.parse(localStorage.getItem("hl-admin") || "null");
    if (s && s.token && Date.now() < s.exp) { ADMIN.token = s.token; ADMIN.email = s.email; ADMIN.exp = s.exp; }
  } catch {}
}
async function adminLogin(email, password) {
  const r = await fetch(`${SUPA.url}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: SUPA.key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("bad");
  const j = await r.json();
  ADMIN.token = j.access_token; ADMIN.email = email;
  ADMIN.exp = Date.now() + (j.expires_in || 3600) * 1000;
  try { localStorage.setItem("hl-admin", JSON.stringify({ token: ADMIN.token, email, exp: ADMIN.exp })); } catch {}
}
function adminLogout() {
  ADMIN.token = ADMIN.email = null; ADMIN.exp = 0;
  try { localStorage.removeItem("hl-admin"); } catch {}
  document.body.classList.remove("admin-on");
  render();
}

/* ---- folder data ops (owner only) ---- */
async function foldersFetch() {
  const r = await fetch(`${SUPA.url}/rest/v1/folders?select=id,parent,name,pos,created_at&order=pos.asc`, { headers: supaHeaders() });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function reloadFolders() {
  if (!SHARED()) return;
  try {
    const rows = await foldersFetch();
    if (!Array.isArray(rows) || !rows.length) return;   // keep default set if empty
    const curId = cwd && cwd.id;
    setTree(foldersFromRows(rows));
    cwd = INDEX.get(curId) || ROOT;
    history = []; future = [];
    buildSidebar(); render();
  } catch { /* offline — keep whatever we have */ }
}
async function fWrite(method, path, body) {
  if (!isAdmin()) throw new Error("not signed in");
  const r = await fetch(`${SUPA.url}/rest/v1/${path}`, {
    method, headers: { ...bearer(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text() || r.status);
}
const siblingsOf = (node) =>
  (node.parent && node.parent.id !== "desktop") ? node.parent.children : ROOT.children.filter(n => n.children);
async function fAdd(parentId) {
  const name = await askText("New folder", "Folder name", "Untitled");
  if (name == null) return;
  const sibs = parentId ? (INDEX.get(parentId)?.children || []) : ROOT.children.filter(n => n.children);
  try { await fWrite("POST", "folders", { parent: parentId || null, name, pos: sibs.length }); await reloadFolders(); }
  catch { toast("Couldn't add — are you still signed in?"); }
}
async function fRename(id) {
  const node = INDEX.get(id); if (!node) return;
  const name = await askText("Rename", "New name", node.name);
  if (name == null || name === node.name) return;
  try { await fWrite("PATCH", `folders?id=eq.${id}`, { name }); await reloadFolders(); }
  catch { toast("Couldn't rename"); }
}
async function fDelete(id) {
  const node = INDEX.get(id); if (!node) return;
  const n = node.children ? node.children.length : 0;
  if (!await askConfirm(`Delete "${node.name}"${n ? ` and its ${n} item${n === 1 ? "" : "s"}` : ""}?`)) return;
  try { await fWrite("DELETE", `folders?id=eq.${id}`); await reloadFolders(); }
  catch { toast("Couldn't delete"); }
}
async function fMove(id, dir) {
  const node = INDEX.get(id); if (!node) return;
  const sibs = siblingsOf(node).slice();
  const i = sibs.indexOf(node), j = i + dir;
  if (j < 0 || j >= sibs.length) return;
  [sibs[i], sibs[j]] = [sibs[j], sibs[i]];
  try { for (let k = 0; k < sibs.length; k++) await fWrite("PATCH", `folders?id=eq.${sibs[k].id}`, { pos: k }); await reloadFolders(); }
  catch { toast("Couldn't reorder"); }
}

/* ---- uploads (materials for later) ---- */
async function uploadPut(file) {
  const path = Date.now().toString(36) + "-" + file.name.replace(/[^\w.\-]+/g, "_");
  const r = await fetch(`${SUPA.url}/storage/v1/object/uploads/${encodeURIComponent(path)}`, {
    method: "POST", headers: { ...bearer(), "Content-Type": file.type || "application/octet-stream" }, body: file,
  });
  if (!r.ok) throw new Error(await r.text() || r.status);
}
async function uploadList() {
  const r = await fetch(`${SUPA.url}/storage/v1/object/list/uploads`, {
    method: "POST", headers: { apikey: SUPA.key, Authorization: `Bearer ${ADMIN.token || SUPA.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 100, sortBy: { column: "created_at", order: "desc" } }),
  });
  if (!r.ok) throw new Error(r.status);
  return (await r.json()).filter(o => o.name && o.id !== null);
}
async function uploadDelete(name) {
  const r = await fetch(`${SUPA.url}/storage/v1/object/uploads/${encodeURIComponent(name)}`, { method: "DELETE", headers: bearer() });
  if (!r.ok) throw new Error(r.status);
}
const uploadUrl = (name) => `${SUPA.url}/storage/v1/object/public/uploads/${encodeURIComponent(name)}`;

/* ---- small dialogs + toast (shared by admin) ---- */
function toast(msg) {
  let t = document.querySelector(".hl-toast");
  if (!t) { t = document.createElement("div"); t.className = "hl-toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2200);
}
function askText(title, ph, val = "") {
  return new Promise(res => {
    const w = document.createElement("div"); w.className = "nd-wrap";
    w.innerHTML = `<div class="nd-card"><div class="nd-title">${title}</div>
      <input class="nd-input" maxlength="40" placeholder="${ph}" spellcheck="false">
      <div class="nd-actions"><button class="dp-btn" data-a="c">Cancel</button><button class="dp-btn primary" data-a="k">OK</button></div></div>`;
    document.body.appendChild(w);
    const inp = w.querySelector("input"); inp.value = val; inp.focus(); inp.select();
    const done = v => { w.remove(); res(v); };
    w.addEventListener("click", e => { if (e.target === w || e.target.dataset.a === "c") done(null); if (e.target.dataset.a === "k") done(inp.value.trim() || val); });
    inp.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") done(inp.value.trim() || val); if (e.key === "Escape") done(null); });
  });
}
function askConfirm(msg) {
  return new Promise(res => {
    const w = document.createElement("div"); w.className = "nd-wrap";
    w.innerHTML = `<div class="nd-card"><div class="nd-title">${msg}</div>
      <div class="nd-actions"><button class="dp-btn" data-a="c">Cancel</button><button class="dp-btn danger" data-a="k">Delete</button></div></div>`;
    document.body.appendChild(w);
    w.addEventListener("click", e => { if (e.target === w || e.target.dataset.a === "c") { w.remove(); res(false); } if (e.target.dataset.a === "k") { w.remove(); res(true); } });
  });
}

/* ---- login dialog ---- */
function openLogin() {
  const w = document.createElement("div"); w.className = "nd-wrap";
  w.innerHTML = `<div class="nd-card"><div class="nd-title">Admin sign in</div>
    <input class="nd-input" id="li-email" type="email" placeholder="email" spellcheck="false" autocomplete="username">
    <input class="nd-input" id="li-pass" type="password" placeholder="password" style="margin-top:8px" autocomplete="current-password">
    <div class="nd-actions"><button class="dp-btn" data-a="c">Cancel</button><button class="dp-btn primary" data-a="k">Sign in</button></div></div>`;
  document.body.appendChild(w);
  const email = w.querySelector("#li-email"), pass = w.querySelector("#li-pass");
  email.focus();
  [email, pass].forEach(i => i.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") go(); if (e.key === "Escape") w.remove(); }));
  async function go() {
    try {
      await adminLogin(email.value.trim(), pass.value);
      w.remove();
      document.body.classList.add("admin-on");
      toast("Signed in — folders are editable");
      render();
    } catch { toast("Sign-in failed — check email and password"); }
  }
  w.addEventListener("click", e => { if (e.target === w || e.target.dataset.a === "c") w.remove(); if (e.target.dataset.a === "k") go(); });
}

/* the lock button in the menu bar */
$("mb-admin").addEventListener("mousedown", e => {
  e.stopPropagation();
  if (!isAdmin()) { openLogin(); return; }
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(mi("Manage materials…", "admin-uploads") + sep + mi("Sign out", "admin-out"), r.right - 180, r.bottom + 4);
});

/* ---- admin decoration of the current view ---- */
function adminDecorate() {
  document.body.classList.toggle("admin-on", isAdmin());
  if (!isAdmin()) return;
  const ctrl = (id, opts = {}) =>
    `<span class="fadmin" data-fid="${id}">
       ${opts.move ? `<button class="fa-btn" data-fa="left" title="Move left/up">◀</button><button class="fa-btn" data-fa="right" title="Move right/down">▶</button>` : ""}
       <button class="fa-btn" data-fa="rename" title="Rename">✎</button>
       <button class="fa-btn" data-fa="del" title="Delete">✕</button>
     </span>`;

  // inside a folder (icon view): New-folder tile + per-folder controls
  if (view === "icon" && cwd.id !== "desktop") {
    const iv = $("icon-view");
    items().forEach((n, i) => {
      if (!n.children) return;
      const el = iv.querySelector(`.icon-item[data-i="${i}"]`);
      if (el) el.insertAdjacentHTML("beforeend", ctrl(n.id, { move: true }));
    });
    iv.insertAdjacentHTML("beforeend",
      `<div class="icon-item new-folder" data-fadd="${cwd.id}"><div class="ic-frame">＋</div><div class="ic-label">New folder</div></div>`);
  }
}
// one delegated handler for every admin control
document.addEventListener("click", e => {
  const add = e.target.closest("[data-fadd]");
  if (add) { e.stopPropagation(); fAdd(add.dataset.fadd || null); return; }
  const fa = e.target.closest(".fa-btn");
  if (!fa) return;
  e.stopPropagation();
  const id = fa.closest(".fadmin").dataset.fid, a = fa.dataset.fa;
  if (a === "rename") fRename(id);
  else if (a === "del") fDelete(id);
  else if (a === "left") fMove(id, -1);
  else if (a === "right") fMove(id, 1);
}, true);

/* ---- materials panel ---- */
function openUploads() {
  const w = document.createElement("div"); w.className = "gwin";
  w.innerHTML = `<div class="aw-bar"><button class="aw-close"></button><div class="gw-title">Materials</div></div>
    <div class="up-head">
      <label class="dp-btn primary">Upload files<input type="file" id="up-file" multiple hidden></label>
      <span class="up-note">Uploaded files are kept for me to use when building out folders.</span>
    </div>
    <div class="gw-body" id="up-body"><div class="gw-empty">Loading…</div></div>`;
  document.body.appendChild(w);
  materialize(w, null);
  w.querySelector(".aw-close").addEventListener("click", () => w.remove());
  makeDraggable(w, w.querySelector(".aw-bar"));
  const body = w.querySelector("#up-body");
  const isImg = n => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(n);
  async function refresh() {
    try {
      const files = await uploadList();
      body.innerHTML = files.length ? `<div class="gw-grid">${files.map(f => `
        <figure class="gw-card">
          ${isImg(f.name) ? `<img src="${uploadUrl(f.name)}" alt="">` : `<div class="up-file">${f.name.split(".").pop().toUpperCase()}</div>`}
          <figcaption><span class="gw-name">${f.name.replace(/^[a-z0-9]+-/, "")}</span></figcaption>
          <button class="gw-del" data-del="${f.name}">×</button>
        </figure>`).join("")}</div>` : `<div class="gw-empty">Nothing uploaded yet.</div>`;
    } catch { body.innerHTML = `<div class="gw-empty">Couldn't load materials.</div>`; }
  }
  w.querySelector("#up-file").addEventListener("change", async e => {
    const files = [...e.target.files]; e.target.value = "";
    if (!files.length) return;
    toast(`Uploading ${files.length} file${files.length === 1 ? "" : "s"}…`);
    try { for (const f of files) await uploadPut(f); toast("Uploaded"); refresh(); }
    catch { toast("Upload failed — still signed in?"); }
  });
  body.addEventListener("click", async e => {
    const del = e.target.closest("[data-del]"); if (!del) return;
    if (!await askConfirm(`Remove "${del.dataset.del.replace(/^[a-z0-9]+-/, "")}"?`)) return;
    try { await uploadDelete(del.dataset.del); refresh(); } catch { toast("Couldn't remove"); }
  });
  refresh();
}

/* ================= boot ================= */
adminRestore();
if (isAdmin()) document.body.classList.add("admin-on");
buildSidebar();
render();
els.content.focus();
reloadFolders();          // pull the live folder tree; refines the default set
if (currentSlug() === "contact") showContactSheet();   // landed here directly, or via the 404 redirect

$("contact-close").addEventListener("click", closeContactSheet);
window.addEventListener("keydown", e => {
  if (e.key === "Escape" && !els.contactLayer.hidden) closeContactSheet();
});

$("sl-close").addEventListener("click", closeStillLightbox);
$("sl-prev").addEventListener("click", () => stepStillLightbox(-1));
$("sl-next").addEventListener("click", () => stepStillLightbox(1));
els.stillLightbox.addEventListener("click", e => { if (e.target === els.stillLightbox) closeStillLightbox(); });
window.addEventListener("keydown", e => {
  if (els.stillLightbox.hidden) return;
  if (e.key === "Escape") closeStillLightbox();
  else if (e.key === "ArrowLeft") stepStillLightbox(-1);
  else if (e.key === "ArrowRight") stepStillLightbox(1);
});

})();
