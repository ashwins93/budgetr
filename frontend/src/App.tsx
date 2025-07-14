import crossIcon from "./assets/icons/cross.svg";
import { Quit } from "../wailsjs/runtime";
import * as app from "../wailsjs/go/main/App";
import { Header } from "./components/Header";
import { useMemo, useState } from "react";
import { db } from "../wailsjs/go/models";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "./utils";
import { AddTransaction } from "./components/AddTransaction";
import lockClose from "./assets/icons/lock-close.svg";
import lockOpen from "./assets/icons/lock-open.svg";
import trash from "./assets/icons/trash.svg";

const addBtnStyle =
  "w-full px-3 py-2 text-xs uppercase tracking-wide font-bold cursor-pointer rounded-sm bg-gray-200 hover:bg-gray-300";

const subHeaderStyle =
  "uppercase font-bold my-4 text-sm pb-2 border-b border-gray-200";

function App() {
  const onClose = () => {
    Quit();
  };

  const [currentDate, setCurrentDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setUTCDate(5);
    defaultDate.setUTCHours(0);
    defaultDate.setUTCMinutes(0);
    defaultDate.setUTCSeconds(0);
    defaultDate.setUTCMilliseconds(0);
    return defaultDate;
  });

  const { data } = useQuery({
    queryKey: [
      "transactions",
      currentDate.getMonth(),
      currentDate.getFullYear(),
    ],
    queryFn: () => {
      return app.GetTransactions(currentDate.toISOString());
    },
  });

  const queryClient = useQueryClient();

  const [inputMode, setInputMode] = useState<"income" | "expense" | "">("");

  const [transaction, setTransaction] = useState<db.Transaction>(
    new db.Transaction()
  );

  const createTransaction: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    const newTransaction: db.Transaction = new db.Transaction(transaction);
    newTransaction.amount = Number(transaction.amount);
    newTransaction.effectiveDate = currentDate.toISOString();

    if (inputMode === "expense") {
      newTransaction.amount = -newTransaction.amount;
    }

    try {
      await app.CreateTransaction(newTransaction);
    } catch (err) {
      console.error(err);
    }

    resetForm();
    queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });
  };

  const togglePin = async (transaction: db.Transaction) => {
    const updatedTransaction = new db.Transaction(transaction);
    updatedTransaction.pinned = updatedTransaction.pinned === 1 ? 0 : 1;
    try {
      await app.UpdateTransaction(updatedTransaction);
    } catch (err) {
      console.error(err);
    }

    queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });
  };

  const deleteTransaction = async (id: string) => {
    try {
      await app.DeleteTransaction(id);
    } catch (err) {
      console.error(err);
    }

    queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });
  };

  const income = useMemo(() => {
    if (data && data.length) {
      return data
        .filter((t) => t.amount > 0)
        .sort((a, b) => a.amount - b.amount);
    }
    return [];
  }, [data]);

  const expense = useMemo(() => {
    if (data && data.length) {
      const val = data
        .filter((t) => t.amount < 0)
        .sort((a, b) => a.amount - b.amount);

      return val;
    }
    return [];
  }, [data]);

  const resetForm = () => {
    setInputMode("");
    setTransaction(new db.Transaction());
  };

  return (
    <div className="max-w-2xl mx-auto p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 m-6 cursor-pointer p-2 hover:bg-gray-200 rounded-sm"
      >
        <img src={crossIcon} alt="" className="h-6 w-6" />
      </button>
      <h1 className="text-3xl font-black">Budgetr</h1>
      <Header currentDate={currentDate} onChange={setCurrentDate} />
      <div className="flex gap-2 my-6">
        <button className={addBtnStyle} onClick={() => setInputMode("expense")}>
          Add Expense
        </button>
        <button className={addBtnStyle} onClick={() => setInputMode("income")}>
          Add Income
        </button>
      </div>
      <div className={subHeaderStyle}>Income</div>
      <div className="flex flex-col gap-1">
        {income.map((inc) => (
          <div className="flex gap-2 w-full group" key={inc.id}>
            <img
              src={inc.pinned === 1 ? lockClose : lockOpen}
              alt=""
              onClick={() => togglePin(inc)}
            />
            <div className="text-lg w-full">{inc.description}</div>
            <div className="text-xl w-[200px] text-right">
              {formatNumber(inc.amount)}
            </div>
            <img
              src={trash}
              alt="delete"
              className="hidden group-hover:block"
              onClick={() => deleteTransaction(inc.id)}
            />
          </div>
        ))}
      </div>
      {inputMode === "income" && (
        <AddTransaction
          resetForm={resetForm}
          createTransaction={createTransaction}
          setTransaction={setTransaction}
          transaction={transaction}
        />
      )}
      <div className={subHeaderStyle}>Expense</div>
      <div className="flex flex-col gap-1">
        {expense.map((exp) => (
          <div className="flex gap-2 w-full group" key={exp.id}>
            <img
              src={exp.pinned === 1 ? lockClose : lockOpen}
              alt=""
              onClick={() => togglePin(exp)}
            />
            <div className="text-lg w-full">{exp.description}</div>
            <div className="text-xl w-[200px] text-right">
              {formatNumber(exp.amount)}
            </div>
            <img
              src={trash}
              alt="delete"
              className="hidden group-hover:block"
              onClick={() => deleteTransaction(exp.id)}
            />
          </div>
        ))}
      </div>
      {inputMode === "expense" && (
        <AddTransaction
          resetForm={resetForm}
          createTransaction={createTransaction}
          setTransaction={setTransaction}
          transaction={transaction}
        />
      )}
      {data && data.length && (
        <div className="flex gap-2 items-center mt-6">
          <div className="w-full text-lg font-semibold">Balance</div>
          <div className="text-right text-xl w-[200px] font-semibold">
            {formatNumber(data.reduce((acc, t) => acc + t.amount, 0))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
