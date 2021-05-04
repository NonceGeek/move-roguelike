import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CELL_WIDTH_IN_PIXELS } from '../../constants/config';
import { ITEMS } from '../../constants/items';
import { TILES } from '../../constants/tiles';
import { CellContent } from '../../typings/cell';
import { TileType } from '../../typings/tileType';
import { Cell, CellProps } from '../Cell';

const Wrapper = styled.div`
  background-color: grey;
  width: 170px;
  height: 94%;
  padding: 10px 10px;
`;

interface CellWrapperProps {
  selected: boolean;
}

const CellWrapper = styled.div<CellWrapperProps>`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border: ${(props) => (props.selected ? 'solid 2px blue' : 'solid 2px grey')};
  cursor: pointer;
  height: 27px;
  width: 128px;
  padding: 3px 3px 3px 3px;
`;

const Label = styled.div`
  font-size: 12px;
  margin-left: 10px;
`;

const defaultCellProps: CellProps = {
  content: 0,
  moveDirection: 'Up',
  tileType: '.',
  shouldPlayerAnimate: false,
  visibility: 'clear',
  cellWidth: CELL_WIDTH_IN_PIXELS,
  inViewport: true,
  revealed: true,
};

interface Props {
  selectedTile: TileType | null;
  handleSelectedTile: (tile: TileType) => void;
  selectedContent: CellContent | null;
  handleSelectedContent: (content: CellContent) => void;
}

export const Toolbar: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <p>Tiles</p>
      {TILES.map((tile) => {
        return (
          <CellWrapper
            key={tile.name}
            selected={props.selectedTile === tile.type}
            onClick={() => props.handleSelectedTile(tile.type)}
          >
            <Cell {...defaultCellProps} tileType={tile.type} />
            <Label>{tile.name}</Label>
          </CellWrapper>
        );
      })}
      <p>Contents</p>
      <CellWrapper
        selected={props.selectedContent === 'Player'}
        onClick={() => props.handleSelectedContent('Player')}
      >
        <Cell {...defaultCellProps} tileType={'.'} content="Player" />
        <Label>Player</Label>
      </CellWrapper>
      {ITEMS.map((item) => {
        return (
          <CellWrapper
            key={item.type}
            selected={props.selectedContent === item.type}
            onClick={() => props.handleSelectedContent(item.type)}
          >
            <Cell {...defaultCellProps} tileType={'.'} content={item.type} />
            <Label>{item.type}</Label>
          </CellWrapper>
        );
      })}
      <p>----</p>
      <Link to="/">PLAY</Link>
    </Wrapper>
  );
};