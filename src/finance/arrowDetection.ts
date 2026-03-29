// Arrow detection for income (up) and expense (down) gestures

import type { Stroke } from '../types/brush';
import type { Offset, BoundingBox } from '../types/primitives';
import { boundingBoxFromOffsets } from '../types/primitives';

export type ArrowDirection = 'up' | 'down' | null;

interface ArrowDetectionResult {
  direction: ArrowDirection;
  confidence: number;
  boundingBox: BoundingBox | null;
}

/**
 * Extract all points from strokes into a single array.
 */
function extractPoints(strokes: Stroke[]): Offset[] {
  const points: Offset[] = [];
  for (const stroke of strokes) {
    for (const input of stroke.inputs.inputs) {
      points.push({ x: input.x, y: input.y });
    }
  }
  return points;
}

/**
 * Calculate the primary direction of a set of points.
 * Returns the angle in radians and the dominant direction.
 */
function calculatePrimaryDirection(points: Offset[]): { angle: number; isVertical: boolean; goesUp: boolean } {
  if (points.length < 2) {
    return { angle: 0, isVertical: false, goesUp: false };
  }

  const first = points[0];
  const last = points[points.length - 1];

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const angle = Math.atan2(dy, dx);

  // Check if primarily vertical (within 45 degrees of vertical)
  const isVertical = Math.abs(Math.abs(angle) - Math.PI / 2) < Math.PI / 4;
  const goesUp = dy < 0; // In screen coordinates, negative Y is up

  return { angle, isVertical, goesUp };
}

/**
 * Check if the stroke has an arrowhead shape at the tip.
 * Looks for a V-shape pattern at the end of the stroke.
 */
function hasArrowhead(points: Offset[], direction: 'up' | 'down'): boolean {
  if (points.length < 10) return false;

  // Look at the last 30% of points for the arrowhead
  const tipStartIndex = Math.floor(points.length * 0.7);
  const tipPoints = points.slice(tipStartIndex);

  if (tipPoints.length < 3) return false;

  // Find the bounding box of the tip
  const tipBBox = boundingBoxFromOffsets(tipPoints);
  if (!tipBBox) return false;

  // Check if the tip widens (arrowhead characteristic)
  const tipWidth = tipBBox.right - tipBBox.left;
  const tipHeight = Math.abs(tipBBox.bottom - tipBBox.top);

  // For vertical arrows, the tip should be wider than it is tall (arrowhead shape)
  // But we also accept a reasonable ratio for hand-drawn arrows
  const aspectRatio = tipWidth / (tipHeight + 1);

  // An arrowhead typically has width >= 0.5 * height
  return aspectRatio >= 0.3;
}

/**
 * Analyze stroke patterns to detect if it forms an arrow shape.
 * This handles both single-stroke arrows and multi-stroke arrows.
 */
function analyzeArrowPattern(strokes: Stroke[]): ArrowDetectionResult {
  const allPoints = extractPoints(strokes);

  if (allPoints.length < 5) {
    return { direction: null, confidence: 0, boundingBox: null };
  }

  const bbox = boundingBoxFromOffsets(allPoints);
  if (!bbox) {
    return { direction: null, confidence: 0, boundingBox: null };
  }

  const width = bbox.right - bbox.left;
  const height = bbox.bottom - bbox.top;

  // Arrows should be taller than wide (vertical orientation)
  const aspectRatio = height / (width + 1);
  if (aspectRatio < 1.2) {
    return { direction: null, confidence: 0, boundingBox: bbox };
  }

  // For single stroke: check direction and look for arrowhead pattern
  if (strokes.length === 1) {
    const { isVertical, goesUp } = calculatePrimaryDirection(allPoints);

    if (!isVertical) {
      return { direction: null, confidence: 0, boundingBox: bbox };
    }

    const direction: ArrowDirection = goesUp ? 'up' : 'down';

    // Check for arrowhead
    const hasHead = hasArrowhead(allPoints, direction);

    // Calculate confidence based on verticality and aspect ratio
    const verticalityScore = aspectRatio / 3; // Higher is more vertical
    const confidence = Math.min(0.9, 0.5 + (hasHead ? 0.3 : 0) + Math.min(0.2, verticalityScore * 0.1));

    return { direction, confidence, boundingBox: bbox };
  }

  // For multi-stroke (2-3 strokes): look for stem + arrowhead pattern
  if (strokes.length >= 2 && strokes.length <= 3) {
    // Find the longest stroke (likely the stem)
    let longestStrokeIndex = 0;
    let maxLength = 0;

    strokes.forEach((stroke, index) => {
      const length = stroke.inputs.inputs.length;
      if (length > maxLength) {
        maxLength = length;
        longestStrokeIndex = index;
      }
    });

    const stemPoints = strokes[longestStrokeIndex].inputs.inputs.map(p => ({ x: p.x, y: p.y }));
    const { isVertical, goesUp } = calculatePrimaryDirection(stemPoints);

    if (!isVertical) {
      return { direction: null, confidence: 0, boundingBox: bbox };
    }

    const direction: ArrowDirection = goesUp ? 'up' : 'down';

    // Multi-stroke arrows get higher confidence since they're more intentional
    const confidence = 0.85;

    return { direction, confidence, boundingBox: bbox };
  }

  return { direction: null, confidence: 0, boundingBox: bbox };
}

/**
 * Detect if strokes form an arrow pointing up or down.
 *
 * @param strokes The strokes to analyze
 * @param minConfidence Minimum confidence threshold (default: 0.6)
 * @returns The detected arrow direction or null if no arrow detected
 */
export function detectArrow(strokes: Stroke[], minConfidence: number = 0.6): ArrowDetectionResult {
  if (strokes.length === 0 || strokes.length > 3) {
    return { direction: null, confidence: 0, boundingBox: null };
  }

  const result = analyzeArrowPattern(strokes);

  if (result.confidence < minConfidence) {
    return { direction: null, confidence: result.confidence, boundingBox: result.boundingBox };
  }

  return result;
}

/**
 * Check if a single stroke could be an arrow based on quick heuristics.
 * This is used for early detection before full analysis.
 */
export function isLikelyArrowStroke(stroke: Stroke): boolean {
  const points = stroke.inputs.inputs;
  if (points.length < 10) return false;

  const first = points[0];
  const last = points[points.length - 1];

  const dx = Math.abs(last.x - first.x);
  const dy = Math.abs(last.y - first.y);

  // Must be primarily vertical (dy > dx * 1.5)
  return dy > dx * 1.5 && dy > 50; // At least 50px vertical movement
}
