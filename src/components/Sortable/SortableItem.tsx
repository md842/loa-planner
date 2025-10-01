import "./SortableItem.css";

import {type CSSProperties, type PropsWithChildren, createContext, useContext, useMemo} from "react";

import type {DraggableSyntheticListeners, UniqueIdentifier} from "@dnd-kit/core";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

import Button from "react-bootstrap/Button";

interface Props{
  id: UniqueIdentifier;
}

interface Context{
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {}
});

export function SortableItem({children, id}: PropsWithChildren<Props>){
  const {attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({id});

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition
  };

  return(
    <SortableItemContext.Provider value={context}>
      <li className="sortable-item mb-2" ref={setNodeRef} style={style}>
        {children}
      </li>
    </SortableItemContext.Provider>
  );
}

export function DeleteButton(props: {handleDelete(index: number): void, index: number}){
  return(
    <Button variant="link" onClick={() => props.handleDelete(props.index)}>
      <i className="bi bi-trash3-fill"/>
    </Button>
  );
}

export function DragHandle(){
  const {attributes, listeners, ref} = useContext(SortableItemContext);

  return(
    <Button variant="link" {...attributes} {...listeners} ref={ref}>
      <i className="bi bi-grip-vertical"/>
    </Button>
  );
}

export function EditButton(props: {handleEdit(index: number): void, index: number}){
  return(
    <Button variant="link" onClick={() => props.handleEdit(props.index)}>
      <i className="bi bi-pencil-fill"/>
    </Button>
  );
}