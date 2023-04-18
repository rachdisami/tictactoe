export default class View {
  $ = {};
  $$ = {};

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
    this.$.dropMenu.addEventListener("click", (event) => {
      this.#toggleMenu();
    });
  }

  bindGameResetEvent(handler) {
    this.$.resetBtn.addEventListener("click", handler);
    this.$.modalCloseBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPLayerMoveEvent(handler) {
    // this.$$.squares.forEach((square) => {
    //   square.addEventListener("click", () => handler(square));
    // });
    this.#delegate(this.$.grid, '[data-id="square"]', "click", handler);
  }

  render(game, stats) {
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

  #openModal(winner) {
    this.$.modal.setAttribute("data-state", "opened");
    if (winner != null) {
      this.$.modalBody.innerHTML = `
      <h3 class="text-title mb-200 text-${
        winner === 1 ? "accent-400" : "primary-800"
      }">Player ${winner} wins!</h3>
      <p class="text-body">Close this screen to start a new game</p>
      `;
    } else {
      this.$.modalBody.innerHTML = `
      <h3 class="text-title mb-200 text-tertiary-600">Tie Game!</h3>
      <p class="text-body">Close this screen to start a new game</p>
      `;
    }
  }

  #updateScoreboard(playersWithStats, ties) {
    for (const playerWithStats of playersWithStats) {
      const playerScore = this.$.playerScores[playerWithStats.id - 1];
      playerScore.innerText = playerWithStats.wins;
    }

    this.$.tiesScores.innerText = ties;
  }

  #closeModal() {
    this.$.modal.setAttribute("data-state", "closed");
  }

  #resetBoard() {
    this.$.playerTurnDisplay.innerHTML = this.$.playerControlHtml[0];
    this.$$.squares.forEach((square) => {
      square.innerHTML = "";
    });
  }

  #initializeMoves(moves) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => +square.id === move.squareId);

      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #toggleMenu() {
    event.preventDefault();
    let menuMenuContainerState =
      this.$.menuContainer.getAttribute("data-state");

    this.$.menuContainer.setAttribute(
      "data-state",
      menuMenuContainerState === "closed" ? "opened" : "closed"
    );

    this.$.dropMenu.setAttribute(
      "area-expanded",
      menuMenuContainerState === "closed" ? true : false
    );
  }

  #handlePlayerMove(square, player) {
    square.innerHTML = this.$.icon[player.id - 1];
  }

  #setTurnDisplay(player) {
    this.$.playerTurnDisplay.innerHTML =
      this.$.playerControlHtml[player.id - 1];
  }

  #qs(selector, parent) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);
    if (!el) {
      throw new Error(`could'nt find Element using selector ; ${selector}`);
    }

    return el;
  }

  #qsAll(selector, parent) {
    const elList = parent
      ? parent.querySelectorAll(selector)
      : document.querySelectorAll(selector);
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
  #delegate(el, selector, eventKey, handler) {
    el.addEventListener(eventKey, (event) => {
      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
