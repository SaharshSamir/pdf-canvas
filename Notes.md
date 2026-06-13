# Render System

## There are 3 rendering layers

1. PDF DOM layer
2. Whiteboard Canvas layer
3. UI Elements

## There are 3 components in the rendering system

1. World -> Reality. Source of truth
2. Camera -> Viewport. What area of the world is being looked at.
3. Screen -> What you see. Based on the camera, what from the world is being projected to the screen.

### Relationship between them

World
  ↓
Camera chooses what to look at
  ↓
Screen shows the result
