export type Player = {
  id: number;
  name: string;
  colorClass?: string;
};

export type PlayersWithStats = Player & {
  wins: number;
};

export type GameMove = {
  squareId: number;
  player: Player;
};

export type GameStatus = {
  isComplete: boolean;
  winner: Player | null;
};

export type GameStats = {
  playersWithStats: PlayersWithStats[];
  ties: number;
};

export type Game = {
  moves: GameMove[];
  currentPlayer: Player;
  status: GameStatus;
};

export type GameState = {
  currentGameMoves: GameMove[];
  history: {
    currentRoundGames: Game[];
    allGames: Game[];
  };
};
