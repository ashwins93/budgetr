import crossIcon from "./assets/icons/cross.svg";
import { Quit } from "../wailsjs/runtime";
import * as app from "../wailsjs/go/main/App";

function App() {
  const onClose = () => {
    Quit();
  };

  const getTransactions = async () => {
    try {
      const res = await app.GetTransactions(new Date().toISOString());
      console.log({ res });
    } catch (err) {
      console.error({ err });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5 relative">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 m-6 cursor-pointer p-2 hover:bg-gray-200 rounded-sm"
      >
        <img src={crossIcon} alt="" className="h-6 w-6" />
      </button>
      <h1 className="text-3xl font-medium">Budgetr</h1>
      <button onClick={getTransactions}>Get transaction</button>
    </div>
  );
}

export default App;
