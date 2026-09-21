/** The six design standards every holidayz.vip kit is built to. Order matters (standard 1 = safety). */
export const DESIGN_STANDARDS = [
  { key: "safety_first", label: "Safety first", icon: "🛡️", line: "Nothing asks anyone to disclose, perform, or defend. Opt-outs are real." },
  { key: "representation", label: "Representation", icon: "🪞", line: "The people in the copy and art are us. No tokens, no costume." },
  { key: "heritage_as_content", label: "Heritage as content", icon: "🕯️", line: "The Nguzo Saba and Black holiday tradition are the operating system, not decoration." },
  { key: "peer_register", label: "Peer register", icon: "🗣️", line: "A teen or an elder would say this out loud. Nothing reads as school or HR." },
  { key: "neurodivergent_first", label: "Neurodivergent-first", icon: "🧩", line: "Every activity has a time estimate, a sensory note, and a low-demand version." },
  { key: "measured_returned", label: "Measured, returned", icon: "🧭", line: "The Soul Compass check-in is a gift back to the family, not surveillance." },
] as const;

export type StandardKey = (typeof DESIGN_STANDARDS)[number]["key"];
