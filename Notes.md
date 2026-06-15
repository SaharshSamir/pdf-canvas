# Render System

## There are 3 rendering layers

1. PDF DOM layer
2. Whiteboard Canvas layer
3. UI Elements

## There are 3 components in the rendering system

1. World -> Reality. Source of truth
2. Camera -> Viewport. What area of the world is being looked at.
3. Screen / render surface -> What you see. Based on the camera, what from the world is being projected to the screen.

### Relationship between them

To render the world, we need to bring these 3 components together.

The formula to render a given entity to the screen -

```javascript
(entity.world_x - camera.x) + canvas.width/2
(entity.world_y - camera.y) + canvas.height/2
```

World
  ↓
Camera chooses what to look at
  ↓
Screen shows the result
