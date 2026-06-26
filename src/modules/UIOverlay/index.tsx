import { useEffect } from "react";
import type { Tools } from "../../types";

type Props = {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  currentTool: string;
  setCurrentTool: React.Dispatch<React.SetStateAction<Tools>>;
}

export default function UIOverlay({ setFile, setCurrentTool, currentTool }: Props) {

  useEffect(() => {
    const fileInputDiv = document.getElementById("file-input");
    const controlsDiv = document.getElementById("controls");

    const parent = fileInputDiv?.parentElement;
    if (!fileInputDiv || !parent || !controlsDiv) return;
    const controlsRect = controlsDiv.getBoundingClientRect();

    fileInputDiv.style.transform = `translate(${(parent.clientWidth / 2) - (fileInputDiv.clientWidth / 2)}px, 5px)`;

    controlsDiv.style.transform =
      `translate(${(parent.clientWidth / 2) - (fileInputDiv.clientWidth / 2)}px, ${parent.clientHeight - controlsRect.height - 5}px)`;

  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setFile(files[0]);
  }

  return (
    <div id="UI-overlay" className="h-full w-full bg-red-300">
      <div id="file-input" className="backdrop-blur-lg p-2 text-sm rounded-xl absolute border border-zinc-700 bg-zinc-800/60">
        <input onChange={(e) => handleInputChange(e)} type="file" />
      </div>
      <div id="controls" className="flex justify-between gap-4 backdrop-blur-lg p-2 text-sm rounded-xl absolute border border-zinc-700 bg-zinc-800/60">
        <p
          onClick={() => setCurrentTool("text")}
          className={`${currentTool === "text" ? "bg-zinc-700 rounded-sm" : ""} p-2 cursor-pointer`}
        >Text</p>
        <p
          onClick={() => setCurrentTool("drag")}
          className={`${currentTool === "drag" ? "bg-zinc-700 rounded-sm" : ""} p-2 cursor-pointer`}
        >Drag</p>
        <p
          onClick={() => setCurrentTool("square")}
          className={`${currentTool === "square" ? "bg-zinc-700 rounded-sm" : ""} p-2 cursor-pointer`}
        >Square</p>
        <p
          onClick={() => setCurrentTool("circle")}
          className={`${currentTool === "circle" ? "bg-zinc-700 rounded-sm" : ""} p-2 cursor-pointer`}
        >Circle</p>
      </div>
    </div>
  )
}
