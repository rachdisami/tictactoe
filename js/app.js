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

  window.addEventListener("storage", (event) => {
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    event.preventDefault();

    store.reset();
    view.render(store.game, store.stats);
  });

  view.bindNewRoundEvent((event) => {
    event.preventDefault();

    store.newRound();
    view.render(store.game, store.stats);
  });

  view.bindPLayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => +square.id === move.squareId
    );

    if (existingMove) return;

    // Advance to the Next move abd update current player
    store.playerMove(+square.id);

    view.render(store.game, store.stats);
  });
}

window.addEventListener("load", init);
