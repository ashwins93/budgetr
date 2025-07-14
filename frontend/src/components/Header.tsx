const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

import chevronLeft from "../assets/icons/chevron-left.svg";
import chevronRight from "../assets/icons/chevron-right.svg";

export function Header({
  currentDate,
  onChange,
}: {
  currentDate: Date;
  onChange: (date: Date) => void;
}) {
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const imgStyle = "w-8 h-8";
  const buttonStyle = "p-2 rounded-sm hover:bg-gray-200 cursor-pointer";

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + delta);
    onChange(newDate);
  };

  return (
    <div className="mt-6 py-2 flex justify-between items-center">
      <button className={buttonStyle} onClick={() => changeMonth(-1)}>
        <img className={imgStyle} src={chevronLeft} alt="previous" />
      </button>
      <div className="text-2xl font-extralight">
        {month} {year}
      </div>
      <button className={buttonStyle} onClick={() => changeMonth(1)}>
        <img className={imgStyle} src={chevronRight} alt="next" />
      </button>
    </div>
  );
}
