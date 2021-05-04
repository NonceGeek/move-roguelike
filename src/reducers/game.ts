import { GRID_HEIGHT, GRID_WIDTH, INITIAL_MAX_HP } from '../constants/config';
import { getItem } from '../constants/items';
import { getTile } from '../constants/tiles';
import { CellContent, CellData } from '../typings/cell';
import { ItemType } from '../typings/itemType';
import { MoveDirection } from '../typings/moveDirection';
import { Position } from '../typings/position';
import { TileType } from '../typings/tileType';
import { Visibility } from '../typings/visibility';
import { updateVisibility } from '../utils/updateVisibility';

// ACTIONS

interface UpdateCellPayload {
  cellData: CellData;
  position: Position;
}

export interface HoverCellPayload {
  tileType: TileType;
  visibility: Visibility;
  revealed: boolean;
  content: CellContent;
}

export type GameAction =
  | { type: '@@GAME/MOVE_PLAYER'; direction: MoveDirection }
  | { type: '@@GAME/SET_CURRENT_MAP'; currentMap: CellData[][] }
  | { type: '@@GAME/INIT_PLAYER_SPAWN'; playerSpawn: Position }
  | { type: '@@GAME/UPDATE_CELL'; payload: UpdateCellPayload }
  | { type: '@@GAME/INIT_VISIBILITY' }
  | { type: '@@GAME/HOVER_CELL'; payload: HoverCellPayload }
  | { type: '@@GAME/HOVER_AWAY_FROM_CELL' };

const movePlayer = (direction: MoveDirection): GameAction => ({
  type: '@@GAME/MOVE_PLAYER',
  direction,
});

const setCurrentMap = (currentMap: CellData[][]): GameAction => ({
  type: '@@GAME/SET_CURRENT_MAP',
  currentMap,
});

const initPlayerSpawn = (playerSpawn: Position): GameAction => ({
  type: '@@GAME/INIT_PLAYER_SPAWN',
  playerSpawn,
});

const updateCell = (payload: UpdateCellPayload): GameAction => ({
  type: '@@GAME/UPDATE_CELL',
  payload,
});

const initVisibility = (): GameAction => ({
  type: '@@GAME/INIT_VISIBILITY',
});

const hoverCell = (payload: HoverCellPayload): GameAction => ({
  type: '@@GAME/HOVER_CELL',
  payload,
});

const hoverAwayFromCell = (): GameAction => ({
  type: '@@GAME/HOVER_AWAY_FROM_CELL',
});

export const gameActions = {
  movePlayer,
  setCurrentMap,
  initPlayerSpawn,
  updateCell,
  initVisibility,
  hoverCell,
  hoverAwayFromCell,
};

// INITIAL_STATE

export interface GameState {
  currentMap: CellData[][] | null;
  moveDirection: MoveDirection;
  playerPosition: Position;
  playerPreviousPosition: Position;
  shouldPlayerAnimate: boolean;
  characterName: string;
  hp: number;
  maxHp: number;
  gold: number;
  equipedItems: ItemType[];
  inventory: ItemType[];
  interactionText: string;
  eventLogs: string[];
}

export const INITIAL_STATE: GameState = {
  currentMap: null,
  moveDirection: 'Right',
  playerPosition: [0, 0],
  playerPreviousPosition: [0, 0],
  shouldPlayerAnimate: false,
  characterName: 'Kerhebos',
  hp: INITIAL_MAX_HP,
  maxHp: INITIAL_MAX_HP,
  gold: 0,
  equipedItems: [],
  inventory: [],
  interactionText: 'You enter the dungeon.',
  eventLogs: [],
};

// REDUCER

const reduceMovePlayer = (draft = INITIAL_STATE, moveDirection: MoveDirection) => {
  let nextTileX: number;
  let nextTileY: number;
  let nextTile: TileType;

  if (draft.currentMap === null) {
    return;
  }

  const moveToNewPosition = (position: Position) => {
    if (draft.currentMap) {
      // Empty previous location
      draft.currentMap[draft.playerPosition[1]][draft.playerPosition[0]].content = 0;

      // Move player
      draft.currentMap[position[1]][position[0]].content = 'Player';

      // Update visibility
      draft.currentMap = updateVisibility(position, draft.currentMap);

      // Update player position
      draft.playerPreviousPosition = draft.playerPosition;
      draft.playerPosition = position;
      draft.shouldPlayerAnimate = true;
      draft.moveDirection = moveDirection;
    }
  };

  const moveAndStayAtSamePosition = () => ({ ...draft, moveDirection, shouldPlayerAnimate: false });

  switch (moveDirection) {
    case 'Left':
      nextTileX =
        draft.playerPosition[0] > 0 ? draft.playerPosition[0] - 1 : draft.playerPosition[0];
      nextTileY = draft.playerPosition[1];
      nextTile = draft.currentMap[nextTileY][nextTileX].tile;

      if (draft.playerPosition[0] > 0 && nextTile !== '#') {
        return moveToNewPosition([nextTileX, nextTileY]);
      }
      return moveAndStayAtSamePosition();

    case 'Right':
      nextTileX =
        draft.playerPosition[0] < GRID_WIDTH
          ? draft.playerPosition[0] + 1
          : draft.playerPosition[0];
      nextTileY = draft.playerPosition[1];

      nextTile = draft.currentMap[nextTileY][nextTileX].tile;

      if (draft.playerPosition[0] < GRID_WIDTH - 1 && nextTile !== '#') {
        return moveToNewPosition([nextTileX, nextTileY]);
      }
      return moveAndStayAtSamePosition();

    case 'Up':
      nextTileX = draft.playerPosition[0];
      nextTileY =
        draft.playerPosition[1] > 0 ? draft.playerPosition[1] - 1 : draft.playerPosition[1];
      nextTile = draft.currentMap[nextTileY][nextTileX].tile;

      if (draft.playerPosition[1] > 0 && nextTile !== '#') {
        return moveToNewPosition([nextTileX, nextTileY]);
      }
      return moveAndStayAtSamePosition();

    case 'Down':
      nextTileX = draft.playerPosition[0];
      nextTileY =
        draft.playerPosition[1] < GRID_HEIGHT - 1
          ? draft.playerPosition[1] + 1
          : draft.playerPosition[1];
      nextTile = draft.currentMap[nextTileY][nextTileX].tile;

      if (draft.playerPosition[1] < GRID_HEIGHT - 1 && nextTile !== '#') {
        return moveToNewPosition([nextTileX, nextTileY]);
      }
      return moveAndStayAtSamePosition();
  }
};

const reduceUpdateCell = (draft = INITIAL_STATE, payload: UpdateCellPayload) => {
  const { position, cellData } = payload;

  if (draft.currentMap !== null) {
    draft.currentMap[position[1]][position[0]] = cellData;
  }
};

const reduceHoverCell = (draft = INITIAL_STATE, payload: HoverCellPayload) => {
  const { tileType, visibility, revealed, content } = payload;

  if (content === 'Player') {
    draft.interactionText = 'This is you.';
    return;
  }

  if (revealed === false) {
    return;
  }

  let verb = 'see';

  if (visibility === 'dark' && revealed === true) {
    verb = 'remember seing';
  }

  if (visibility === 'dim' && revealed) {
    verb = 'remember seing';
  }

  if (visibility === 'dim') {
    verb = 'get a glimpse of';
  }

  let object;

  if (content !== 0) {
    object = getItem(content)?.nameInSentence;
  } else {
    object = getTile(tileType)?.nameInSentence;
  }

  const interactionText = `You ${verb} ${object}.`;
  draft.interactionText = interactionText;
};

export const game = (draft = INITIAL_STATE, action: GameAction): GameState | void => {
  switch (action.type) {
    case '@@GAME/MOVE_PLAYER':
      return reduceMovePlayer(draft, action.direction);
    case '@@GAME/SET_CURRENT_MAP':
      return void (draft.currentMap = action.currentMap);
    case '@@GAME/INIT_PLAYER_SPAWN':
      draft.playerPosition = action.playerSpawn;
      return void (draft.playerPreviousPosition = action.playerSpawn);
    case '@@GAME/UPDATE_CELL':
      return reduceUpdateCell(draft, action.payload);
    case '@@GAME/INIT_VISIBILITY':
      if (draft.currentMap !== null) {
        return void (draft.currentMap = updateVisibility(draft.playerPosition, draft.currentMap));
      }
      break;
    case '@@GAME/HOVER_CELL':
      return reduceHoverCell(draft, action.payload);
    case '@@GAME/HOVER_AWAY_FROM_CELL':
      return void (draft.interactionText = '');
  }
};