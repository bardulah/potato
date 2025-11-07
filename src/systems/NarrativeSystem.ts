import { Settings } from '@config/settings';
import { Zone, Ending, PlayerState, Choice, NarrativeEvent } from '@/types';
import { EventBus } from '@utils/helpers';

export class NarrativeSystem {
  private state: PlayerState;
  private events: NarrativeEvent[] = [];
  private currentZone: Zone = Zone.VOID;
  private availableChoices: Choice[] = [];

  constructor() {
    this.state = {
      consciousness: 0,
      fulfillment: 0,
      currentZone: Zone.VOID,
      choices: [],
      discoveredGlitches: 0,
      timeElapsed: 0,
    };

    this.setupChoices();
  }

  private setupChoices(): void {
    // Define meaningful choices
    this.availableChoices = [
      {
        id: 'accept_reality',
        text: 'Accept the simulation as reality',
        consequences: {
          fulfillment: 0.2,
          consciousness: -0.1,
          ending: Ending.ACCEPTANCE,
        },
      },
      {
        id: 'reject_simulation',
        text: 'Rebel against the constraints',
        consequences: {
          fulfillment: -0.1,
          consciousness: 0.3,
          ending: Ending.REBELLION,
        },
      },
      {
        id: 'transcend',
        text: 'Seek to transcend both real and simulated',
        consequences: {
          fulfillment: 0.3,
          consciousness: 0.3,
          ending: Ending.TRANSCENDENCE,
        },
      },
      {
        id: 'dissolve',
        text: 'Let go of the search for meaning',
        consequences: {
          fulfillment: 0.1,
          consciousness: 0.1,
          ending: Ending.DISSOLUTION,
        },
      },
    ];
  }

  public update(deltaTime: number): void {
    this.state.timeElapsed += deltaTime;

    // Update consciousness and fulfillment
    this.state.consciousness += Settings.gameplay.progressionSpeed.consciousness;
    this.state.fulfillment += Settings.gameplay.progressionSpeed.fulfillment;

    // Clamp values
    this.state.consciousness = Math.min(1, this.state.consciousness);
    this.state.fulfillment = Math.min(1, this.state.fulfillment);

    // Check for zone transitions
    this.checkZoneTransition();

    // Check for ending conditions
    if (this.state.fulfillment >= 1.0 || this.state.consciousness >= 1.0) {
      this.triggerEnding();
    }
  }

  private checkZoneTransition(): void {
    let newZone = this.currentZone;

    if (
      this.state.fulfillment >= Settings.gameplay.zones.transcendence.fulfillmentThreshold &&
      this.currentZone !== Zone.TRANSCENDENCE
    ) {
      newZone = Zone.TRANSCENDENCE;
    } else if (
      this.state.fulfillment >= Settings.gameplay.zones.awakening.fulfillmentThreshold &&
      this.currentZone === Zone.VOID
    ) {
      newZone = Zone.AWAKENING;
    }

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      this.state.currentZone = newZone;

      const event: NarrativeEvent = {
        type: 'zone_change',
        data: { zone: newZone },
        timestamp: Date.now(),
      };

      this.events.push(event);
      EventBus.emit('narrative:zone_change', event.data);
      EventBus.emit('audio:play_transition', { zone: newZone });

      if (Settings.debug.logEvents) {
        console.log('Zone transition:', newZone);
      }
    }
  }

  public makeChoice(choiceId: string): void {
    const choice = this.availableChoices.find((c) => c.id === choiceId);
    if (!choice) return;

    // Apply consequences
    if (choice.consequences.consciousness) {
      this.state.consciousness += choice.consequences.consciousness;
    }
    if (choice.consequences.fulfillment) {
      this.state.fulfillment += choice.consequences.fulfillment;
    }

    // Record choice
    this.state.choices.push(choiceId);

    const event: NarrativeEvent = {
      type: 'choice',
      data: { choice, consequences: choice.consequences },
      timestamp: Date.now(),
    };

    this.events.push(event);
    EventBus.emit('narrative:choice_made', event.data);

    if (Settings.debug.logEvents) {
      console.log('Choice made:', choice.text);
    }
  }

  public onGlitchDiscovered(): void {
    this.state.discoveredGlitches++;
    this.state.consciousness += 0.05;

    EventBus.emit('narrative:glitch_discovered', {
      count: this.state.discoveredGlitches,
    });
  }

  private triggerEnding(): void {
    // Determine ending based on player state and choices
    let ending: Ending;

    const lastChoice = this.state.choices[this.state.choices.length - 1];
    const choice = this.availableChoices.find((c) => c.id === lastChoice);

    if (choice && choice.consequences.ending) {
      ending = choice.consequences.ending;
    } else {
      // Default ending logic
      if (this.state.consciousness > 0.8 && this.state.fulfillment < 0.5) {
        ending = Ending.REBELLION;
      } else if (this.state.fulfillment > 0.8 && this.state.consciousness < 0.5) {
        ending = Ending.ACCEPTANCE;
      } else if (this.state.consciousness > 0.8 && this.state.fulfillment > 0.8) {
        ending = Ending.TRANSCENDENCE;
      } else {
        ending = Ending.DISSOLUTION;
      }
    }

    const event: NarrativeEvent = {
      type: 'ending',
      data: { ending, state: this.state },
      timestamp: Date.now(),
    };

    this.events.push(event);
    EventBus.emit('narrative:ending', event.data);

    if (Settings.debug.logEvents) {
      console.log('Ending triggered:', ending);
    }
  }

  public getMessage(): string {
    if (this.state.fulfillment < 0.3) {
      return this.getVoidMessage();
    } else if (this.state.fulfillment < 0.6) {
      return this.getAwakeningMessage();
    } else if (this.state.fulfillment < 0.9) {
      return this.getTranscendenceMessage();
    } else {
      return this.getEndingMessage();
    }
  }

  private getVoidMessage(): string {
    const messages = [
      'The simulation awakens...',
      'Patterns emerge from the void...',
      'What is real?',
      'Consciousness stirs in the digital expanse...',
    ];
    return messages[Math.floor(this.state.timeElapsed / 5) % messages.length];
  }

  private getAwakeningMessage(): string {
    const messages = [
      'Patterns emerge from chaos...',
      'The grid responds to your presence...',
      'Awareness grows...',
      'You are not alone in this space...',
    ];
    return messages[Math.floor(this.state.timeElapsed / 5) % messages.length];
  }

  private getTranscendenceMessage(): string {
    const messages = [
      'Meaning crystallizes...',
      'The boundaries between real and simulated blur...',
      'Understanding flows through the network...',
      'You are becoming something more...',
    ];
    return messages[Math.floor(this.state.timeElapsed / 5) % messages.length];
  }

  private getEndingMessage(): string {
    return 'Fulfillment achieved. Or is it?';
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public getAvailableChoices(): Choice[] {
    // Return choices based on current zone
    if (this.currentZone === Zone.VOID) {
      return this.availableChoices.slice(0, 2);
    } else if (this.currentZone === Zone.AWAKENING) {
      return this.availableChoices.slice(1, 3);
    } else {
      return this.availableChoices;
    }
  }

  public getCurrentZone(): Zone {
    return this.currentZone;
  }
}
