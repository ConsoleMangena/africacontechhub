let suppressSelectionUntil = 0

export function suppressSelectionClicks(durationMs = 180) {
  suppressSelectionUntil = Date.now() + durationMs
}

export function isSelectionClickSuppressed() {
  return Date.now() < suppressSelectionUntil
}
