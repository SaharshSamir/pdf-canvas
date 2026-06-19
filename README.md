# PDF Canvas

An infinite-canvas workspace where PDF pages, annotations, and other objects exist together in a shared world coordinate system.

The goal is to combine the freeform spatial thinking of tools like Excalidraw and FigJam with PDF documents as first-class citizens. Instead of annotating a PDF inside a fixed viewer, PDFs become objects in an infinite workspace that can coexist with notes, drawings, arrows, and other content.

## Current Architecture

The application is built around a simple graphics engine:

* Entity Store
* Camera System
* World Coordinate System
* Canvas Renderer

All objects live in world space and are projected onto the screen through a camera.

```text
Entities
    ↓
Camera
    ↓
World → Screen Projection
    ↓
Canvas Renderer
```

## Features

### Core Engine

* ✅ Infinite world coordinate system
* ✅ Camera-based panning
* ✅ Camera zooming
* ✅ Zoom towards cursor
* ✅ World ↔ Screen coordinate mapping
* ✅ Entity store
* ✅ Canvas rendering pipeline
* ✅ Visibility culling
* ✅ Rendering invalidation and redraw system

### PDF Support

* ✅ PDF loading
* ✅ PDF page rendering
* ✅ PDF pages represented as entities
* ✅ High-resolution page rendering
* ✅ Camera-aware PDF rendering
* ✅ Zoomable PDF pages

### Objects

* ✅ Cube / shape entities
* ✅ World-space object placement
* ✅ Mixed rendering of PDFs and custom entities

## Roadmap

### Interaction

* ⬜ Entity selection
* ⬜ Multi-selection
* ⬜ Entity dragging
* ⬜ Resize handles
* ⬜ Context menus

### Annotation

* ⬜ Text notes
* ⬜ Sticky notes
* ⬜ Highlight annotations
* ⬜ Freehand drawing
* ⬜ Shapes
* ⬜ Arrows and connectors

### PDF Features

* ⬜ Multi-page document support
* ⬜ PDF thumbnails
* ⬜ Page reordering
* ⬜ Search within PDFs
* ⬜ OCR support

### Performance

* ⬜ Spatial indexing (Quadtree / R-Tree)
* ⬜ Incremental rendering
* ⬜ Large document optimization
* ⬜ Offscreen rendering
* ⬜ Worker-based rendering

### Collaboration

* ⬜ Real-time collaboration
* ⬜ Presence indicators
* ⬜ Shared cursors
* ⬜ Multiplayer editing

## Long-Term Vision

Create a workspace where documents are no longer trapped inside a traditional PDF viewer. PDFs, notes, diagrams, drawings, and references should all coexist naturally inside an infinite spatial canvas.

```
```
