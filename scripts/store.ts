import type {
  Player,
  Game,
  GameMove,
  GameState,
  GameStatus,
  GameStats,
  PlayersWithStats,
} from "./types";

type GameStateCallBack = (previousState: GameState) => GameState;

const initValue: GameState = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class store extends EventTarget {
  constructor(
    private readonly storageKey: string,
    private readonly players: Player[]
  ) {
    super();
  }

  get stats(): GameStats {
    const state = this.getState();

    return {
      playersWithStats: this.players.map((player: Player) => {
        const wins = state.history.currentRoundGames.filter(
          (game: Game) => game.status.winner?.id === +player.id
        ).length;

        return {
          id: player.id,
          name: player.name,
          colorClass: player.colorClass,
          wins,
        };
      }) as PlayersWithStats[],

      ties: state.history.currentRoundGames.filter(
        (game: Game) => game.status.winner === null
      ).length,
    };
  }

  get game(): Game {
    const state = this.getState();
    const currentPlayer: Player =
      this.players[state.currentGameMoves.length % 2];
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

    let winner: Player | null = null;

    for (const player of this.players) {
      const playerSquares = state.currentGameMoves
        .filter((move: GameMove) => move.player.id === player.id)
        .map((move: GameMove) => move.squareId);

      for (const pattern of winningPatterns) {
        if (pattern.every((v) => playerSquares.includes(v))) {
          winner = player;
        }
      }
    }

    return {
      moves: structuredClone(this.getState()).currentGameMoves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length >= 9,
        winner,
      },
    };
  }

  playerMove(squareId: number): void {
    const stateClone: GameState = structuredClone(this.getState()) as GameState;

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.saveState(stateClone);
  }

  reset(): void {
    const { moves, status, currentPlayer } = this.game;
    const stateClone: GameState = structuredClone(this.getState()) as GameState;

    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        currentPlayer,
        status,
      });
    }

    stateClone.currentGameMoves = [];
    this.saveState(stateClone);
  }

  newRound(): void {
    this.reset();
    const stateClone: GameState = structuredClone(this.getState()) as GameState;

    stateClone.history.allGames.push(...stateClone.history.currentRoundGames);
    stateClone.history.currentRoundGames = [];

    this.saveState(stateClone);
  }

  private getState(): GameState {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? (JSON.parse(item) as GameState) : initValue;
  }

  private saveState(newStateOrFunc: GameState | GameStateCallBack): void {
    const prevState: GameState = this.getState();
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
