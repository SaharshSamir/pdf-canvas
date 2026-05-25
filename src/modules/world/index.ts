const squareColors = ["red", "blue", "green", "yellow", "pink", "violet"];

export type Coord = {
  x: number;
  y: number
}

export function fillRandomSquares(
  div: HTMLDivElement,
  setCameraCoord: React.Dispatch<React.SetStateAction<Coord>>
) {
  if (div === null) return;

  const numberOfCubes = 50;
  let isDragging = false;
  let draggedFrom: Coord | undefined = undefined;

  for (let i = 0; i < numberOfCubes; i++) {
    const square = document.createElement("div");
    square.style.height = "20px";
    square.style.width = "20px";
    square.style.backgroundColor = squareColors[Math.floor((Math.random() * 10) % squareColors.length)];
    square.style.position = "absolute"
    square.style.left = `${Math.random() * 1000}px`;
    square.style.top = `${Math.random() * 1000}px`;

    div.appendChild(square);
  }

  div.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isDragging = true;
    console.log('begin dragging');
  })
  div.addEventListener("mouseup", (e) => {
    e.stopPropagation();
    isDragging = false;
    console.log('stop dragging');
  })
  div.addEventListener("mousemove", (e) => {
    if (isDragging) {
      setCameraCoord((cc) => {
        return {
          x: cc.x + e.movementX,
          y: cc.y + e.movementY,
        }
      })
    }
  })
}
