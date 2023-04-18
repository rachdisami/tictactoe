import View from "./view.js";
import Store from "./store.js";
import { Player } from "./types";

const players: Player[] = [
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

  window.addEventListener("storage", () => {
    view.render(store.game, store.stats);
  });

  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats);

  view.bindGameResetEvent((event: Event) => {
    event.preventDefault();

    store.reset();
  });

  view.bindNewRoundEvent((event: Event) => {
    event.preventDefault();

    store.newRound();
  });

  view.bindPLayerMoveEvent((square: Element) => {
    const existingMove = store.game.moves.find(
      (move) => +square.id === move.squareId
    );

    if (existingMove) return;

    // Advance to the Next move abd update current player
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", init);
