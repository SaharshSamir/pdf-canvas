import { useEffect } from "react";

type Props = {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function UIOverlay({ setFile }: Props) {

  useEffect(() => {
    const fileInputDiv = document.getElementById("file-input");
    const parent = fileInputDiv?.parentElement;
    if (!fileInputDiv || !parent) return;

    fileInputDiv.style.transform = `translate(${(parent.clientWidth / 2) - (fileInputDiv.clientWidth / 2)}px, 5px)`;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setFile(files[0]);
  }

  return (
    <div id="file-input" className="p-2 text-sm rounded-xl absolute  bg-zinc-700">
      <input onChange={(e) => handleInputChange(e)} type="file" />
    </div>
  )
}
