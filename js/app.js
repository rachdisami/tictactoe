import View from "./view.js";
import Store from "./store.js";

const players = [
  {
    id: 1,
    name: "Player 1",
    colorClass: "accent-400",
  },
  {
    id: 2,
    name: "Player 2",
    colorClass: "primary-600",
  },
];

function init() {
  const view = new View();
  const store = new Store("tictactoe-storage-key", players);

  function initView() {
    view.closeModal();
    view.resetBoard();
    view.updateScoreboard(store.stats);

    view.initializeMoves(store.game.moves);
  }

  window.addEventListener("storage", (event) => {
    initView();
  });

  initView();

  view.bindGameResetEvent((event) => {
    event.preventDefault();

    store.reset();
    initView();

    view.setTurnDisplay(players[store.game.currentPlayer.id - 1]);
  });

  view.bindNewRoundEvent((event) => {
    event.preventDefault();

    store.newRound();
    initView();

    view.setTurnDisplay(players[store.game.currentPlayer.id - 1]);
  });

  view.bindPLayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => +square.id === move.squareId
    );

    if (existingMove) return;

    // place mark on square
    view.handlePlayerMove(square, store.game.currentPlayer);

    // Advance to the Next move abd update current player
    store.playerMove(+square.id);

    // Check for Game Over
    if (store.game.status.isComplete) {
      view.openModal(store.game.status.winner);

      return;
    }

    // Set the player turn indicator
    view.setTurnDisplay(store.game.currentPlayer);
  });
}

window.addEventListener("load", init);
