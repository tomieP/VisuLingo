/**
 * VisuLingo Smart Sticker Anti-Collision & Layout Engine
 * 
 * Automatically resolves overlaps between vocabulary stickers so each label
 * remains fully visible, easily readable, and clickable with its illustrated theme.
 */

export interface PositionableItem {
  id?: string;
  word: string;
  x: number; // percentage (0..100)
  y: number; // percentage (0..100)
  [key: string]: any;
}

/**
 * Estimates the width and height of a sticker pill as percentages of the photo container.
 * Based on text length, padding, dot, pronunciation speaker, and frame decorations.
 */
export function estimateStickerDimensions(word: string): { width: number; height: number } {
  const charCount = (word || '').trim().length;
  // Base width for padding (24px) + dot (14px) + speaker (20px) + decoration margin (10px) = ~68px
  // In a standard 360px mobile container: ~19% + ~2.1% per char
  const estimatedWidth = Math.max(20, Math.min(38, 18 + charCount * 2.1));
  // Standard pill height (~34px) + illustrated frame top decorations (hats, ears, antlers ~10px) = ~44px (~11%)
  const estimatedHeight = 10.5;

  return {
    width: estimatedWidth,
    height: estimatedHeight,
  };
}

/**
 * Resolves overlapping stickers using a multi-pass repulsive relaxation algorithm.
 * Stacks overlapping labels vertically (with subtle horizontal staggering) while
 * keeping them as close as possible to their detected objects.
 */
export function resolveStickerOverlaps<T extends PositionableItem>(items: T[]): T[] {
  if (!items || items.length <= 1) {
    return items ? items.map((item) => ({ ...item })) : [];
  }

  // Safe boundaries within photo (prevent overflowing outside screen borders)
  const MIN_X = 14;
  const MAX_X = 86;
  const MIN_Y = 10;
  const MAX_Y = 88;

  // Clone items to avoid mutating input props
  const resolved: T[] = items.map((item) => ({
    ...item,
    x: Math.max(MIN_X, Math.min(MAX_X, Number(item.x) || 50)),
    y: Math.max(MIN_Y, Math.min(MAX_Y, Number(item.y) || 50)),
  }));

  const MAX_ITERATIONS = 12;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let hasCollision = false;

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const itemA = resolved[i];
        const itemB = resolved[j];

        const dimA = estimateStickerDimensions(itemA.word);
        const dimB = estimateStickerDimensions(itemB.word);

        // Required distances to prevent visual overlap (plus 1.5% breathing room)
        const reqDx = (dimA.width + dimB.width) / 2 + 1.5;
        const reqDy = (dimA.height + dimB.height) / 2 + 1.5;

        const dx = itemB.x - itemA.x;
        const dy = itemB.y - itemA.y;

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Check if bounding rectangles overlap
        if (absDx < reqDx && absDy < reqDy) {
          hasCollision = true;

          // Vertical separation is primary because pills are much wider than they are tall
          const overlapY = reqDy - absDy;
          const shiftY = overlapY / 2 + 0.6;
          const dirY = dy === 0 ? (i % 2 === 0 ? -1 : 1) : Math.sign(dy);

          itemA.y -= shiftY * dirY;
          itemB.y += shiftY * dirY;

          // Subtle horizontal stagger if almost vertically aligned
          if (absDx < 8) {
            const staggerX = 3.5;
            const dirX = dx === 0 ? (i % 2 === 0 ? -1 : 1) : Math.sign(dx);
            itemA.x -= staggerX * dirX;
            itemB.x += staggerX * dirX;
          }

          // Boundary clamping with overflow redistribution
          if (itemA.y < MIN_Y) {
            const overflow = MIN_Y - itemA.y;
            itemA.y = MIN_Y;
            itemB.y = Math.min(MAX_Y, itemB.y + overflow);
          } else if (itemA.y > MAX_Y) {
            const overflow = itemA.y - MAX_Y;
            itemA.y = MAX_Y;
            itemB.y = Math.max(MIN_Y, itemB.y - overflow);
          }

          if (itemB.y < MIN_Y) {
            const overflow = MIN_Y - itemB.y;
            itemB.y = MIN_Y;
            itemA.y = Math.min(MAX_Y, itemA.y + overflow);
          } else if (itemB.y > MAX_Y) {
            const overflow = itemB.y - MAX_Y;
            itemB.y = MAX_Y;
            itemA.y = Math.max(MIN_Y, itemA.y - overflow);
          }

          itemA.x = Math.max(MIN_X, Math.min(MAX_X, itemA.x));
          itemB.x = Math.max(MIN_X, Math.min(MAX_X, itemB.x));
          itemA.y = Math.max(MIN_Y, Math.min(MAX_Y, itemA.y));
          itemB.y = Math.max(MIN_Y, Math.min(MAX_Y, itemB.y));
        }
      }
    }

    if (!hasCollision) {
      break;
    }
  }

  // Round coordinates cleanly to 1 decimal place
  return resolved.map((item) => ({
    ...item,
    x: Math.round(item.x * 10) / 10,
    y: Math.round(item.y * 10) / 10,
  }));
}
