import { memo } from 'react';
import { css } from '@linaria/core';

import { getCellStyle, getCellClassname, isCellEditable } from './utils';
import type { CellRendererProps } from './types';
import { useRovingCellRef } from './hooks';

const cellCopied = css`
  @layer rdg.Cell {
    background-color: #ccccff;
  }
`;

const cellCopiedClassname = `rdg-cell-copied ${cellCopied}`;

const cellDraggedOver = css`
  @layer rdg.Cell {
    background-color: #ccccff;

    &.${cellCopied} {
      background-color: #9999ff;
    }
  }
`;

const cellDraggedOverClassname = `rdg-cell-dragged-over ${cellDraggedOver}`;

function Cell<R, SR>({
  column,
  colSpan,
  isCellSelected,
  isCopied,
  isDraggedOver,
  row,
  dragHandle,
  skipCellFocusRef,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRowChange,
  selectCell,
  ...props
}: CellRendererProps<R, SR>) {
  const { ref, tabIndex, onFocus } = useRovingCellRef(isCellSelected, skipCellFocusRef);

  const { cellClass } = column;
  const className = getCellClassname(
    column,
    {
      [cellCopiedClassname]: isCopied,
      [cellDraggedOverClassname]: isDraggedOver
    },
    typeof cellClass === 'function' ? cellClass(row) : cellClass
  );

  function selectCellWrapper(openEditor?: boolean) {
    selectCell(row, column, openEditor);
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.({ row, column, selectCell: selectCellWrapper }, event);
    if (event.isDefaultPrevented()) return;
    selectCellWrapper();
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    onContextMenu?.({ row, column, selectCell: selectCellWrapper }, event);
    if (event.isDefaultPrevented()) return;
    selectCellWrapper();
  }

  function handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    onDoubleClick?.({ row, column, selectCell: selectCellWrapper }, event);
    if (event.isDefaultPrevented()) return;
    selectCellWrapper(true);
  }

  function handleRowChange(newRow: R) {
    onRowChange(column, newRow);
  }

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-selected={isCellSelected}
      aria-colspan={colSpan}
      aria-readonly={!isCellEditable(column, row) || undefined}
      ref={ref}
      tabIndex={tabIndex}
      className={className}
      style={getCellStyle(column, colSpan)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onFocus={onFocus}
      {...props}
    >
      {!column.rowGroup && (
        <>
          {column.formatter({
            column,
            row,
            isCellSelected,
            onRowChange: handleRowChange
          })}
          {dragHandle}
        </>
      )}
    </div>
  );
}

export default memo(Cell) as <R, SR>(props: CellRendererProps<R, SR>) => JSX.Element;
