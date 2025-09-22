import type {PropsWithChildren} from "react";
import {type DropAnimation, DragOverlay, defaultDropAnimationSideEffects} from "@dnd-kit/core";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4"
      }
    }
  })
};


export function SortableOverlay({children}: PropsWithChildren<{}>){
  return(
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}