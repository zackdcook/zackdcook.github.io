import test from 'node:test';
import assert from 'node:assert/strict';
import { BEBRAVE_EPIC_COLORS } from '../lib/bebrave-config';
import { carvingEdge, carvingLightEdge, carvingDarkEdge, contrastRatio, luminance } from '../lib/bebrave/carving-contrast';

test('contrast calculation matches the sRGB black/white and mid-gray reference values', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.ok(Math.abs(luminance('#808080') - .21586) < .00001);
});

test('every authorized random pigment has a clearly separated inner edge', () => {
  for (const { name, value } of BEBRAVE_EPIC_COLORS) {
    assert.ok(contrastRatio(value, carvingEdge(value)) >= 3, `${name} needs at least 3:1 edge separation`);
  }
  // Previously published brown marks retain the same treatment.
  assert.ok(contrastRatio('#3B2418', carvingEdge('#3B2418')) >= 3);
});

test('the paired outside edges retain separation across the entire bark luminance range', () => {
  for (let level = 0; level <= 255; level++) {
    const bark = `#${level.toString(16).padStart(2, '0').repeat(3)}`;
    assert.ok(Math.max(contrastRatio(bark, carvingLightEdge), contrastRatio(bark, carvingDarkEdge)) >= 3);
  }
});
