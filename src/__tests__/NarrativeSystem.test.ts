import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NarrativeSystem } from '../systems/NarrativeSystem';
import { Zone, Ending } from '../types';
import { EventBus } from '../utils/helpers';

describe('NarrativeSystem', () => {
  let narrative: NarrativeSystem;

  beforeEach(() => {
    EventBus.clear();
    narrative = new NarrativeSystem();
  });

  it('should start in VOID zone', () => {
    expect(narrative.getCurrentZone()).toBe(Zone.VOID);
  });

  it('should have initial state with zero consciousness and fulfillment', () => {
    const state = narrative.getState();
    expect(state.consciousness).toBe(0);
    expect(state.fulfillment).toBe(0);
    expect(state.discoveredGlitches).toBe(0);
    expect(state.choices.length).toBe(0);
  });

  it('should transition to AWAKENING zone at 33% fulfillment', () => {
    const state = narrative.getState();

    // Manually set fulfillment to transition threshold
    while (state.fulfillment < 0.33) {
      narrative.update(1); // Delta time = 1
    }

    expect(narrative.getCurrentZone()).toBe(Zone.AWAKENING);
  });

  it('should transition to TRANSCENDENCE zone at 66% fulfillment', () => {
    const state = narrative.getState();

    // Manually advance to transcendence
    while (state.fulfillment < 0.66) {
      narrative.update(1);
    }

    expect(narrative.getCurrentZone()).toBe(Zone.TRANSCENDENCE);
  });

  it('should emit zone_change event on transition', () => {
    let emitted = false;
    let emittedZone: Zone | null = null;

    EventBus.on('narrative:zone_change', (data) => {
      emitted = true;
      emittedZone = data.zone;
    });

    // Advance to awakening
    const state = narrative.getState();
    while (state.fulfillment < 0.33) {
      narrative.update(1);
    }

    expect(emitted).toBe(true);
    expect(emittedZone).toBe(Zone.AWAKENING);
  });

  it('should return appropriate choices based on zone', () => {
    // In VOID, should get 2 choices
    let choices = narrative.getAvailableChoices();
    expect(choices.length).toBe(2);

    // Advance to AWAKENING
    const state = narrative.getState();
    while (state.fulfillment < 0.33) {
      narrative.update(1);
    }

    // In AWAKENING, should get different choices
    choices = narrative.getAvailableChoices();
    expect(choices.length).toBeGreaterThan(0);
  });

  it('should apply choice consequences', () => {
    const choices = narrative.getAvailableChoices();
    const choice = choices[0];

    const stateBefore = narrative.getState();
    const consciousnessBefore = stateBefore.consciousness;
    const fulfillmentBefore = stateBefore.fulfillment;

    narrative.makeChoice(choice.id);

    const stateAfter = narrative.getState();

    // Choices should modify consciousness or fulfillment
    const changed =
      stateAfter.consciousness !== consciousnessBefore ||
      stateAfter.fulfillment !== fulfillmentBefore;

    expect(changed).toBe(true);
    expect(stateAfter.choices).toContain(choice.id);
  });

  it('should increase consciousness when glitch is discovered', () => {
    const stateBefore = narrative.getState();
    const consciousnessBefore = stateBefore.consciousness;

    narrative.onGlitchDiscovered();

    const stateAfter = narrative.getState();
    expect(stateAfter.consciousness).toBeGreaterThan(consciousnessBefore);
    expect(stateAfter.discoveredGlitches).toBe(1);
  });

  it('should track multiple glitch discoveries', () => {
    narrative.onGlitchDiscovered();
    narrative.onGlitchDiscovered();
    narrative.onGlitchDiscovered();

    const state = narrative.getState();
    expect(state.discoveredGlitches).toBe(3);
  });

  it('should return different messages based on fulfillment level', () => {
    const message1 = narrative.getMessage();

    // Advance fulfillment
    const state = narrative.getState();
    while (state.fulfillment < 0.5) {
      narrative.update(1);
    }

    const message2 = narrative.getMessage();

    // Messages should be different at different stages
    expect(message1).not.toBe(message2);
  });

  it('should cap consciousness and fulfillment at 1.0', () => {
    const state = narrative.getState();

    // Run many updates to push beyond limits
    for (let i = 0; i < 10000; i++) {
      narrative.update(1);
    }

    expect(state.consciousness).toBeLessThanOrEqual(1);
    expect(state.fulfillment).toBeLessThanOrEqual(1);
  });
});
