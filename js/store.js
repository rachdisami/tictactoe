const initValue = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class store extends EventTarget {
  constructor(key, players) {
    super();
    this.storageKey = key;
    this.players = players;
  }

  get stats() {
    const state = this.#getState();

    return {
      playersWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status?.winner === +player.id
        ).length;

        return {
          ...player,
          wins,
        };
      }),

      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  get game() {
    const state = this.#getState();
    const currentPlayer = this.players[state.currentGameMoves.length % 2];
    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    for (const player of this.players) {
      const playerSquares = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      for (const pattern of winningPatterns) {
        if (pattern.every((v) => playerSquares.includes(v))) {
          winner = player.id;
        }
      }
    }

    return {
      moves: structuredClone(this.#getState()).currentGameMoves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length >= 9,
        winner,
      },
    };
  }

  playerMove(squareId) {
    const stateClone = structuredClone(this.#getState());

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  reset() {
    const { moves, status } = this.game;
    const stateClone = structuredClone(this.#getState());

    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        status,
      });
    }

    stateClone.currentGameMoves = [];
    this.#saveState(stateClone);
  }

  newRound() {
    this.reset();
    const stateClone = structuredClone(this.#getState());

    stateClone.history.allGames.push(...stateClone.history.currentRoundGames);
    stateClone.history.currentRoundGames = [];

    this.#saveState(stateClone);
  }

  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initValue;
  }

  #saveState(newStateOrFunc) {
    const prevState = this.#getState();
    let newState;

    switch (typeof newStateOrFunc) {
      case "function":
        newState = newStateOrFunc(prevState);
        break;

      case "object":
        newState = newStateOrFunc;
        break;

      default:
        throw new Error(
          `Invalid argument: ${newStateOrFunc}, passed to saveState`
        );
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("statechange"));
  }
}
