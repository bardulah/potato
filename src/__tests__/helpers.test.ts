import { describe, it, expect, beforeEach } from 'vitest';
import { MathUtils, EventBus, ObjectPool, PreferencesManager } from '../utils/helpers';
import * as THREE from 'three';

describe('MathUtils', () => {
  it('lerp should interpolate correctly', () => {
    expect(MathUtils.lerp(0, 10, 0.5)).toBe(5);
    expect(MathUtils.lerp(0, 10, 0)).toBe(0);
    expect(MathUtils.lerp(0, 10, 1)).toBe(10);
  });

  it('clamp should constrain values', () => {
    expect(MathUtils.clamp(5, 0, 10)).toBe(5);
    expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
    expect(MathUtils.clamp(15, 0, 10)).toBe(10);
  });

  it('map should transform ranges correctly', () => {
    expect(MathUtils.map(5, 0, 10, 0, 100)).toBe(50);
    expect(MathUtils.map(0, 0, 10, 0, 100)).toBe(0);
    expect(MathUtils.map(10, 0, 10, 0, 100)).toBe(100);
  });

  it('smoothstep should provide smooth interpolation', () => {
    expect(MathUtils.smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 1);
    expect(MathUtils.smoothstep(0, 1, 0)).toBe(0);
    expect(MathUtils.smoothstep(0, 1, 1)).toBe(1);
  });

  it('randomRange should return values within range', () => {
    for (let i = 0; i < 100; i++) {
      const value = MathUtils.randomRange(0, 10);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it('randomInt should return integers within range', () => {
    for (let i = 0; i < 100; i++) {
      const value = MathUtils.randomInt(0, 10);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
  });
});

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  it('should register and emit events', () => {
    let called = false;
    EventBus.on('game:start', () => {
      called = true;
    });

    EventBus.emit('game:start', undefined);
    expect(called).toBe(true);
  });

  it('should pass data to callbacks', () => {
    let received: number | undefined;
    EventBus.on('audio:set_master', (data) => {
      received = data;
    });

    EventBus.emit('audio:set_master', 0.5);
    expect(received).toBe(0.5);
  });

  it('should unregister events', () => {
    let count = 0;
    const callback = () => {
      count++;
    };

    EventBus.on('game:start', callback);
    EventBus.emit('game:start', undefined);
    expect(count).toBe(1);

    EventBus.off('game:start', callback);
    EventBus.emit('game:start', undefined);
    expect(count).toBe(1); // Should not increase
  });

  it('should return unsubscribe function', () => {
    let count = 0;
    const unsubscribe = EventBus.on('game:start', () => {
      count++;
    });

    EventBus.emit('game:start', undefined);
    expect(count).toBe(1);

    unsubscribe();
    EventBus.emit('game:start', undefined);
    expect(count).toBe(1); // Should not increase
  });

  it('should handle multiple listeners', () => {
    let count1 = 0;
    let count2 = 0;

    EventBus.on('game:start', () => {
      count1++;
    });
    EventBus.on('game:start', () => {
      count2++;
    });

    EventBus.emit('game:start', undefined);
    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  it('should get listener count', () => {
    expect(EventBus.getListenerCount('game:start')).toBe(0);

    EventBus.on('game:start', () => {});
    expect(EventBus.getListenerCount('game:start')).toBe(1);

    EventBus.on('game:start', () => {});
    expect(EventBus.getListenerCount('game:start')).toBe(2);
  });
});

describe('ObjectPool', () => {
  interface TestObject {
    value: number;
  }

  it('should acquire and release objects', () => {
    const pool = new ObjectPool<TestObject>(
      () => ({ value: 0 }),
      (obj) => {
        obj.value = 0;
      },
      5
    );

    const obj = pool.acquire();
    expect(obj).toBeDefined();
    expect(pool.getStats().inUse).toBe(1);

    pool.release(obj);
    expect(pool.getStats().inUse).toBe(0);
    expect(pool.getStats().available).toBe(5);
  });

  it('should reset objects when released', () => {
    const pool = new ObjectPool<TestObject>(
      () => ({ value: 0 }),
      (obj) => {
        obj.value = 0;
      },
      1
    );

    const obj = pool.acquire();
    obj.value = 100;
    pool.release(obj);

    const obj2 = pool.acquire();
    expect(obj2.value).toBe(0);
  });

  it('should grow when pool is exhausted', () => {
    const pool = new ObjectPool<TestObject>(
      () => ({ value: 0 }),
      (obj) => {},
      2
    );

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire(); // Should create new one

    expect(pool.getStats().total).toBe(3);
  });

  it('should release all objects', () => {
    const pool = new ObjectPool<TestObject>(
      () => ({ value: 0 }),
      (obj) => {
        obj.value = 0;
      },
      5
    );

    pool.acquire();
    pool.acquire();
    pool.acquire();

    expect(pool.getStats().inUse).toBe(3);

    pool.releaseAll();
    expect(pool.getStats().inUse).toBe(0);
    expect(pool.getStats().available).toBe(8); // Initial 5 + 3 acquired
  });
});

describe('PreferencesManager', () => {
  let prefs: PreferencesManager;

  beforeEach(() => {
    localStorage.clear();
    prefs = new PreferencesManager();
  });

  it('should get and set preferences', () => {
    prefs.set('volume', 0.5);
    expect(prefs.get('volume', 0)).toBe(0.5);
  });

  it('should return default value when not set', () => {
    expect(prefs.get('missing', 'default')).toBe('default');
  });

  it('should persist to localStorage', () => {
    prefs.set('test', 'value');

    // Create new instance to simulate reload
    const prefs2 = new PreferencesManager();
    expect(prefs2.get('test', null)).toBe('value');
  });

  it('should check if key exists', () => {
    expect(prefs.has('test')).toBe(false);
    prefs.set('test', 'value');
    expect(prefs.has('test')).toBe(true);
  });

  it('should remove preferences', () => {
    prefs.set('test', 'value');
    expect(prefs.has('test')).toBe(true);

    prefs.remove('test');
    expect(prefs.has('test')).toBe(false);
  });

  it('should clear all preferences', () => {
    prefs.set('test1', 'value1');
    prefs.set('test2', 'value2');

    prefs.clear();
    expect(prefs.has('test1')).toBe(false);
    expect(prefs.has('test2')).toBe(false);
  });
});
