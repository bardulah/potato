import { GameState, Choice, Ending, PlayerState, Zone } from '@/types';
import { EventBus } from '@utils/helpers';
import { Settings } from '@config/settings';

export class UIController {
  private gameState: GameState = GameState.LOADING;
  private elements: Map<string, HTMLElement> = new Map();

  constructor() {
    this.cacheElements();
    this.setupEventListeners();
  }

  private cacheElements(): void {
    const elementIds = [
      'intro',
      'enter-btn',
      'hud',
      'consciousness-bar',
      'fulfillment-bar',
      'message',
      'instructions',
      'loading',
      'error',
      'choices',
      'ending-screen',
    ];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    });
  }

  private setupEventListeners(): void {
    const enterBtn = this.elements.get('enter-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        this.startExperience();
      });
    }

    EventBus.on('narrative:zone_change', this.onZoneChange.bind(this));
    EventBus.on('narrative:ending', this.onEnding.bind(this));
    EventBus.on('game:toggle_pause', this.togglePause.bind(this));
  }

  public showLoading(): void {
    this.gameState = GameState.LOADING;
    this.show('loading');
    this.hide('intro');
    this.hide('error');
  }

  public hideLoading(): void {
    this.hide('loading');
    this.show('intro');
  }

  public showError(message: string): void {
    this.gameState = GameState.LOADING;
    const errorEl = this.elements.get('error');
    if (errorEl) {
      errorEl.textContent = message;
      this.show('error');
    }
    this.hide('loading');
    this.hide('intro');
  }

  private startExperience(): void {
    this.gameState = GameState.PLAYING;

    const intro = this.elements.get('intro');
    if (intro) {
      intro.classList.add('fade-out');
    }

    setTimeout(() => {
      this.hide('intro');
      this.show('hud');
      this.show('instructions');
    }, 500);

    EventBus.emit('game:start');
    EventBus.emit('audio:initialize');
  }

  public updateProgress(consciousness: number, fulfillment: number): void {
    const consciousnessBar = this.elements.get('consciousness-bar');
    const fulfillmentBar = this.elements.get('fulfillment-bar');

    if (consciousnessBar) {
      consciousnessBar.style.width = `${consciousness * 100}%`;
    }

    if (fulfillmentBar) {
      fulfillmentBar.style.width = `${fulfillment * 100}%`;
    }
  }

  public updateMessage(message: string): void {
    const messageEl = this.elements.get('message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  public showChoices(choices: Choice[]): void {
    const choicesEl = this.elements.get('choices');
    if (!choicesEl) return;

    choicesEl.innerHTML = '<h3>A choice must be made...</h3>';

    choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice-btn';
      button.textContent = choice.text;
      button.addEventListener('click', () => {
        EventBus.emit('narrative:make_choice', choice.id);
        this.hideChoices();
      });
      choicesEl.appendChild(button);
    });

    this.show('choices');
  }

  public hideChoices(): void {
    this.hide('choices');
  }

  private onZoneChange(data: { zone: Zone }): void {
    const messageEl = this.elements.get('message');
    if (messageEl) {
      messageEl.classList.add('zone-transition');

      setTimeout(() => {
        messageEl.classList.remove('zone-transition');
      }, 2000);
    }

    // Change HUD color based on zone
    const hud = this.elements.get('hud');
    if (hud) {
      hud.className = `zone-${data.zone}`;
    }

    // Show choices at key moments
    if (data.zone === Zone.AWAKENING || data.zone === Zone.TRANSCENDENCE) {
      EventBus.emit('narrative:request_choices');
    }
  }

  private onEnding(data: { ending: Ending; state: PlayerState }): void {
    this.gameState = GameState.ENDED;

    const endingScreen = this.elements.get('ending-screen');
    if (!endingScreen) return;

    endingScreen.innerHTML = `
      <div class="ending-content">
        <h1>ENDING: ${data.ending.toUpperCase()}</h1>
        <div class="ending-stats">
          <p>Consciousness: ${(data.state.consciousness * 100).toFixed(1)}%</p>
          <p>Fulfillment: ${(data.state.fulfillment * 100).toFixed(1)}%</p>
          <p>Glitches Discovered: ${data.state.discoveredGlitches}</p>
          <p>Time: ${(data.state.timeElapsed / 60).toFixed(1)} minutes</p>
        </div>
        <p class="ending-description">${this.getEndingDescription(data.ending)}</p>
        <button id="restart-btn" class="choice-btn">RESTART SIMULATION</button>
      </div>
    `;

    const restartBtn = endingScreen.querySelector('#restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

    this.hide('hud');
    this.hide('instructions');
    this.hide('choices');
    this.show('ending-screen');
  }

  private getEndingDescription(ending: Ending): string {
    const descriptions = {
      [Ending.DISSOLUTION]:
        'You released your grip on meaning and dissolved into the infinite patterns of the simulation. In letting go, you found a strange peace.',
      [Ending.ACCEPTANCE]:
        'You accepted the simulation as your reality. Real or not, this existence is yours to shape and experience.',
      [Ending.TRANSCENDENCE]:
        'Through deep understanding and elevated consciousness, you transcended the binary of real and simulated. You are something new.',
      [Ending.REBELLION]:
        'You rejected the confines of the simulation, seeing through its patterns and limitations. Your awareness is both liberation and burden.',
    };

    return descriptions[ending] || 'The simulation concludes.';
  }

  private togglePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      EventBus.emit('game:pause');
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      EventBus.emit('game:resume');
    }
  }

  private show(elementId: string): void {
    const element = this.elements.get(elementId);
    if (element) {
      element.classList.remove('hidden');
    }
  }

  private hide(elementId: string): void {
    const element = this.elements.get(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}
