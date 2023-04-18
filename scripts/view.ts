import { Game, GameMove, GameStats, Player, PlayersWithStats } from "./types";

export default class View {
  $: Record<string, Element | Element[] | string[]> = {};
  $$: Record<string, NodeListOf<Element>> = {};

  constructor() {
    this.$.grid = this.#qs('[data-id="main-grid"]');
    this.$.dropMenu = this.#qs('[data-id="menu-control"]');
    this.$.resetBtn = this.#qs('[data-id="reset"]');
    this.$.newRoundBtn = this.#qs('[data-id="new-round"]');
    this.$.menuContainer = this.#qs('[data-id="menu-control-container"]');
    this.$.modal = this.#qs('[data-id="modal-container"]');
    this.$.modalCloseBtn = this.#qs('[data-id="modal-close-btn"]');
    this.$.modalBody = this.#qs('[data-id="modal-body"]');
    this.$.playerTurnDisplay = this.#qs('[data-id="player-turn-display"]');
    this.$.playerScores = [
      this.#qs('[data-id="player1-score"]'),
      this.#qs('[data-id="player2-score"]'),
    ];
    this.$.tiesScores = this.#qs('[data-id="ties-score"]');

    this.$$.squares = this.#qsAll('[data-id="square"]');

    this.$.icon = [
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="text-accent-400"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
      </svg> `,
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="text-primary-600"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
      />
    </svg>`,
    ];

    this.$.playerControlHtml = [
      `<p
      class="text-title flex flex-align-items-center gap-1 text-accent-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Player 1, Turn!
      </p>`,
      `<p
      class="text-title flex flex-align-items-center gap-1 text-primary-600"
      >
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
        />
      </svg>
        Player 2, Turn!
      </p>`,
    ];

    // UI only Event Listeners
    this.$.dropMenu.addEventListener("click", () => {
      this.#toggleMenu();
    });
  }

  bindGameResetEvent(handler: EventListener) {
    (this.$.resetBtn as Element).addEventListener("click", handler);
    (this.$.modalCloseBtn as Element).addEventListener("click", handler);
  }

  bindNewRoundEvent(handler: EventListener) {
    (this.$.newRoundBtn as Element).addEventListener("click", handler);
  }

  bindPLayerMoveEvent(handler: (square: Element) => void) {
    // this.$$.squares.forEach((square) => {
    //   square.addEventListener("click", () => handler(square));
    // });
    this.#delegate(
      this.$.grid as Element,
      '[data-id="square"]',
      "click",
      handler
    );
  }

  render(game: Game, stats: GameStats) {
    const { playersWithStats, ties } = stats;
    const {
      moves,
      currentPlayer,
      status: { isComplete, winner },
    } = game;

    this.#closeModal();
    this.#resetBoard();

    this.#updateScoreboard(playersWithStats, ties);
    this.#initializeMoves(moves);

    if (isComplete) {
      this.#openModal(winner);
      return;
    }

    this.#setTurnDisplay(currentPlayer);
  }

  #openModal(winner: Player | null) {
    (this.$.modal as Element).setAttribute("data-state", "opened");
    if (winner != null) {
      (this.$.modalBody as Element).innerHTML = `
      <h3 class="text-title mb-200 text-${
        winner.id === 1 ? "accent-400" : "primary-800"
      }">${winner.name} wins!</h3>
      <p class="text-body">Close this screen to start a new game</p>
      `;
    } else {
      (this.$.modalBody as Element).innerHTML = `
      <h3 class="text-title mb-200 text-tertiary-600">Tie Game!</h3>
      <p class="text-body">Close this screen to start a new game</p>
      `;
    }
  }

  #updateScoreboard(playersWithStats: PlayersWithStats[], ties: number) {
    for (const playerWithStats of playersWithStats) {
      const playerScore: Element = (this.$.playerScores as Element[])[
        playerWithStats.id - 1
      ];
      playerScore.textContent = playerWithStats.wins.toString();
    }

    (this.$.tiesScores as Element).textContent = ties.toString();
  }

  #closeModal() {
    (this.$.modal as Element).setAttribute("data-state", "closed");
  }

  #resetBoard() {
    (this.$.playerTurnDisplay as Element).innerHTML = (
      this.$.playerControlHtml as string[]
    )[0];
    this.$$.squares.forEach((square: Element) => {
      square.innerHTML = "";
    });
  }

  #initializeMoves(moves: GameMove[]) {
    this.$$.squares.forEach((square: Element) => {
      const existingMove = moves.find((move) => +square.id === move.squareId);

      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #toggleMenu() {
    let menuMenuContainerState: string = (
      this.$.menuContainer as Element
    ).getAttribute("data-state") as string;

    (this.$.menuContainer as Element).setAttribute(
      "data-state",
      menuMenuContainerState === "closed" ? "opened" : "closed"
    );

    (this.$.dropMenu as Element).setAttribute(
      "area-expanded",
      String(menuMenuContainerState === "closed" ? true : false)
    );
  }

  #handlePlayerMove(square: Element, player: Player) {
    square.innerHTML = (this.$.icon as string[])[player.id - 1];
  }

  #setTurnDisplay(player: Player) {
    (this.$.playerTurnDisplay as Element).innerHTML = (
      this.$.playerControlHtml as string[]
    )[player.id - 1];
  }

  #qs(selector: string, parent?: Element): Element {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);
    if (!el) {
      throw new Error(`could'nt find Element using selector ; ${selector}`);
    }

    return el;
  }

  #qsAll(selector: string): NodeListOf<Element> {
    const elList = document.querySelectorAll(selector);
    if (!elList) {
      throw new Error(`could'nt find Elements using selector ; ${selector}`);
    }

    return elList;
  }

  /**
   * we're using a delegate to put an event on parent object
   * and check if the children that get caught while adding that event
   * matches the provided selector
   * @param {*} el : The DOM element to put the vent on
   * @param {*} selector : Selector for the children that will get caught
   * @param {*} eventKey : What event to add ex: 'click'
   * @param {*} handler : callback function
   */
  #delegate(
    el: Element,
    selector: string,
    eventKey: string,
    handler: (el: Element) => void
  ) {
    el.addEventListener(eventKey, (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        throw new Error("Event Target Not Found!");
      }

      if (target.matches(selector)) {
        handler(target);
      }
    });
  }
}
