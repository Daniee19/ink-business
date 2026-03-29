// Arrow detection for income (up) and expense (down) gestures
// VERY TOLERANT VERSION - optimized for quick gesture recognition

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
 * Calculate the primary direction using multiple methods for robustness.
 * Analyzes start-to-end direction, overall trajectory, and dominant movement.
 */
function calculateDirection(points: Offset[]): { goesUp: boolean; confidence: number } {
  if (points.length < 3) {
    return { goesUp: false, confidence: 0 };
  }

  const first = points[0];
  const last = points[points.length - 1];

  // Method 1: Simple start-to-end
  const totalDy = last.y - first.y;
  const totalDx = Math.abs(last.x - first.x);
  const totalDyAbs = Math.abs(totalDy);

  // Method 2: Average direction over segments
  let upSegments = 0;
  let downSegments = 0;
  const sampleRate = Math.max(1, Math.floor(points.length / 10));

  for (let i = sampleRate; i < points.length; i += sampleRate) {
    const dy = points[i].y - points[i - sampleRate].y;
    if (dy < -2) upSegments++;
    else if (dy > 2) downSegments++;
  }

  // Method 3: Compare first quarter to last quarter
  const quarterLen = Math.floor(points.length / 4);
  const firstQuarter = points.slice(0, Math.max(1, quarterLen));
  const lastQuarter = points.slice(-Math.max(1, quarterLen));

  const firstAvgY = firstQuarter.reduce((sum, p) => sum + p.y, 0) / firstQuarter.length;
  const lastAvgY = lastQuarter.reduce((sum, p) => sum + p.y, 0) / lastQuarter.length;
  const quarterDy = lastAvgY - firstAvgY;

  // Combine methods to determine direction
  const startEndUp = totalDy < 0;
  const segmentsUp = upSegments > downSegments;
  const quarterUp = quarterDy < 0;

  // Count votes
  const upVotes = (startEndUp ? 1 : 0) + (segmentsUp ? 1 : 0) + (quarterUp ? 1 : 0);
  const goesUp = upVotes >= 2; // Majority vote

  // Calculate confidence based on how vertical the movement is
  const verticalRatio = totalDyAbs / (totalDx + 1);
  let confidence = 0.5;

  // More vertical = more confident
  if (verticalRatio > 0.3) confidence += 0.15;
  if (verticalRatio > 0.5) confidence += 0.1;
  if (verticalRatio > 1.0) confidence += 0.1;
  if (verticalRatio > 2.0) confidence += 0.1;

  // Unanimous votes = more confident
  if (upVotes === 3 || upVotes === 0) confidence += 0.1;

  // Sufficient vertical movement = more confident
  if (totalDyAbs > 30) confidence += 0.1;
  if (totalDyAbs > 60) confidence += 0.1;

  return { goesUp, confidence: Math.min(0.95, confidence) };
}

/**
 * Simplified arrow pattern analysis.
 * Much more tolerant - just needs some vertical movement.
 */
function analyzeArrowPattern(strokes: Stroke[]): ArrowDetectionResult {
  const allPoints = extractPoints(strokes);

  // Very low minimum points requirement
  if (allPoints.length < 3) {
    return { direction: null, confidence: 0, boundingBox: null };
  }

  const bbox = boundingBoxFromOffsets(allPoints);
  if (!bbox) {
    return { direction: null, confidence: 0, boundingBox: null };
  }

  const width = bbox.right - bbox.left;
  const height = bbox.bottom - bbox.top;

  // Just need SOME vertical component - very tolerant
  // Only reject if it's clearly horizontal (width > height * 3)
  if (width > height * 3 && height < 20) {
    return { direction: null, confidence: 0, boundingBox: bbox };
  }

  // Get direction from the stroke(s)
  const { goesUp, confidence } = calculateDirection(allPoints);

  // Minimum height for a valid arrow gesture
  if (height < 15) {
    return { direction: null, confidence: 0, boundingBox: bbox };
  }

  const direction: ArrowDirection = goesUp ? 'up' : 'down';

  // Boost confidence for more vertical strokes
  const aspectRatio = height / (width + 1);
  let finalConfidence = confidence;
  if (aspectRatio > 1) finalConfidence += 0.05;
  if (aspectRatio > 2) finalConfidence += 0.05;

  return {
    direction,
    confidence: Math.min(0.95, finalConfidence),
    boundingBox: bbox
  };
}

/**
 * Detect if strokes form an arrow pointing up or down.
 * Very tolerant detection - optimized for quick gestures.
 *
 * @param strokes The strokes to analyze
 * @param minConfidence Minimum confidence threshold (default: 0.35 - very low for maximum tolerance)
 * @returns The detected arrow direction or null if no arrow detected
 */
export function detectArrow(strokes: Stroke[], minConfidence: number = 0.35): ArrowDetectionResult {
  if (strokes.length === 0 || strokes.length > 5) {
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
 * Very tolerant - just needs some vertical movement.
 */
export function isLikelyArrowStroke(stroke: Stroke): boolean {
  const points = stroke.inputs.inputs;
  if (points.length < 3) return false;

  const first = points[0];
  const last = points[points.length - 1];

  const dx = Math.abs(last.x - first.x);
  const dy = Math.abs(last.y - first.y);

  // Very tolerant: just needs dy > dx * 0.5 and some minimum movement
  // This accepts almost any stroke that goes more up/down than sideways
  return dy > dx * 0.5 && dy > 20;
}
