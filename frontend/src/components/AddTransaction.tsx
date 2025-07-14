import { db } from "../../wailsjs/go/models";

const inputStyle =
  "rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function AddTransaction({
  createTransaction,
  transaction,
  setTransaction,
  resetForm,
}: {
  createTransaction: React.FormEventHandler<HTMLFormElement>;
  transaction: db.Transaction;
  setTransaction: React.Dispatch<React.SetStateAction<db.Transaction>>;
  resetForm: () => void;
}) {
  return (
    <form
      className="mt-1 items-center"
      onSubmit={createTransaction}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          resetForm();
        }
      }}
    >
      <div className="flex gap-2 w-full">
        <input
          className={`${inputStyle} w-full text-lg`}
          placeholder="Enter description"
          required
          value={transaction.description || ""}
          onChange={(e) => {
            setTransaction(
              (transaction) =>
                new db.Transaction({
                  ...transaction,
                  description: e.target.value,
                })
            );
          }}
          name="description"
        />
        <input
          className={`${inputStyle} w-[200px] text-right text-xl`}
          type="text"
          pattern="^\d+$"
          placeholder="12345"
          required
          value={transaction.amount || ""}
          onChange={(e) => {
            setTransaction(
              (transaction) =>
                new db.Transaction({
                  ...transaction,
                  amount: e.target.value,
                })
            );
          }}
          name="amount"
        />
      </div>
      <button type="submit"></button>
    </form>
  );
}
