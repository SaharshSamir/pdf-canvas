import { useEffect } from "react";

export default function UIOverlay() {

  useEffect(() => {
    const fileInputDiv = document.getElementById("file-input");
    const parent = fileInputDiv?.parentElement;
    if (!fileInputDiv || !parent) return;

    fileInputDiv.style.transform = `translate(${(parent.clientWidth / 2) - (fileInputDiv.clientWidth / 2)}px, 5px)`;
  }, []);

  return (
    <div id="file-input" className="p-2 text-sm rounded-xl absolute  bg-zinc-700">
      <input type="file" />
    </div>
  )
}
