import UIOverlay from "./modules/UIOverlay"
import Workspace from "./modules/Workspace"

function App() {

  return (
    <div className="w-screen h-screen bg-zinc-800">
      <Workspace />
      <UIOverlay />
    </div>
  )
}

export default App

