// ESM wrapper around card_runtime.js. The runtime file is byte-identical
// to the engine source (a classic-script IIFE that registers
// <gamepatch-card> on evaluation). This wrapper adapts it to ESM
// consumption without modifying the source: side-effect import triggers
// the IIFE; the exported no-op gives React components a tree-shake-
// resistant symbol to reference.
import "./card_runtime.js";
export function ensureGamepatchCard() {}
