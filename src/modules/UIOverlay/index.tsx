import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAppState } from "../state/app";

type Props = {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function UIOverlay({ setFile }: Props) {

  const { activeTool, setActiveTool, clearEntities } = useAppState();

  useEffect(() => {
    const fileInputDiv = document.getElementById("file-input");
    const controlsDiv = document.getElementById("controls");
    const clearButton = document.getElementById("clear-btn");

    const parent = fileInputDiv?.parentElement;

    if (!fileInputDiv || !parent || !controlsDiv || !clearButton) return;

    const controlsRect = controlsDiv.getBoundingClientRect();

    fileInputDiv.style.transform = `translate(${(parent.clientWidth / 2) - (fileInputDiv.clientWidth / 2)}px, 5px)`;

    controlsDiv.style.transform =
      `translate(${(parent.clientWidth / 2) - (controlsRect.width / 2)}px, ${parent.clientHeight - controlsRect.height * 2}px)`;
    //`translate(${(parent.clientWidth / 2) - (controlsRect.width / 2)}px, ${parent.clientHeight - controlsRect.height - 5}px)`;

    clearButton.style.transform = `translate(5px, ${parent.clientHeight / 2}px)`;

  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setFile(files[0]);
  }

  return (
    <div id="UI-overlay" className="h-full w-full bg-black overflow-hidden scrollbar-hidden">
      <div onClick={clearEntities} id="clear-btn" className="cursor-pointer backdrop-blur-lg p-2 rounded-md absolute border border-zinc-700 bg-zinc-800/60">
        <Icon icon="grommet-icons:clear" height={20} width={20} />
      </div>
      <div id="file-input" className="backdrop-blur-lg p-2 text-sm rounded-xl absolute border border-zinc-700 bg-zinc-800/60">
        <input onChange={(e) => handleInputChange(e)} type="file" />
      </div>
      <div id="controls" className="flex justify-between gap-4 backdrop-blur-lg p-1 text-sm rounded-xl absolute border border-zinc-700 bg-zinc-900/60">
        <div
          onClick={() => setActiveTool("selection")}
          className={`${activeTool === "selection" ? "bg-zinc-700 " : "hover:bg-zinc-800"} rounded-md p-2 cursor-pointer `}
        >
          <Icon icon="fluent:cursor-16-filled" height={20} width={20} color="#FFFFFF" />
        </div>
        <div
          onClick={() => setActiveTool("drag")}
          className={`${activeTool === "drag" ? "bg-zinc-700" : "hover:bg-zinc-800"} rounded-md p-2 cursor-pointer `}
        >
          <Icon icon="at-icons:pointer" height={20} width={20} color="#FFFFFF" />
        </div>
        <div
          onClick={() => setActiveTool("text")}
          className={`${activeTool === "text" ? "bg-zinc-700" : "hover:bg-zinc-800"} rounded-md p-2 cursor-pointer `}
        >
          <Icon icon="fa-solid:i-cursor" height={20} width={20} color="#FFFFFF" />
        </div>
        <div
          onClick={() => setActiveTool("square")}
          className={`${activeTool === "square" ? "bg-zinc-700" : "hover:bg-zinc-800"} rounded-md p-2 cursor-pointer `}
        >
          <Icon icon="uim:squre-shape" height={20} width={20} color="#FFFFFF" />
        </div>
      </div>
    </div>
  )
}
