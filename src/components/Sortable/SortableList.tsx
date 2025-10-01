import React, {type ReactNode, useMemo, useState} from "react";

import {type Active, type UniqueIdentifier, DndContext, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";

import {DeleteButton, DragHandle, EditButton, SortableItem} from "./SortableItem";
import {SortableOverlay} from "./SortableOverlay";

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange(items: T[]): void;
  renderItem(item: T, index: number): ReactNode;
  /* Optional function to run after moving items (e.g., CharacterGoalTable runs
     this after updating goals to additionally update roster goals) */
  moveHandler?(activeIndex: number, overIndex: number): void;
}

export function SortableList<T extends BaseItem>(props: Props<T>) {
  let {items, onChange, renderItem, moveHandler} = props; // Unpack props 

  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.id),
    [active, items]
  );
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({active}) => {setActive(active);}}
      onDragEnd={({active, over}) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);
          onChange(arrayMove(items, activeIndex, overIndex));
          if (moveHandler) // If defined, run optional move handler
            moveHandler(activeIndex, overIndex);
        }
        setActive(null);
      }}
      onDragCancel={() => {setActive(null);}}
    >
      <SortableContext items={items}>
        <ul className="d-flex flex-column p-0 mx-3 my-4">
          {items.map((item, index: number) => (
            <React.Fragment key={item.id}>{renderItem(item, index)}</React.Fragment>
          ))}
        </ul>
      </SortableContext>
      <SortableOverlay>
        {activeItem ? renderItem(activeItem, -1) : null}
      </SortableOverlay>
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DeleteButton = DeleteButton;
SortableList.DragHandle = DragHandle;
SortableList.EditButton = EditButton;