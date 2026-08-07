type ShiftSelectorProps = {
  workerCount: number | null;
  setWorkerCount: (count: number) => void;
};

function ShiftSelector({
  workerCount: workerCount,
  setWorkerCount: setWorkerCount,
}: ShiftSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((n) => (
        <button
          key={n}
          onClick={() => setWorkerCount(n)}
          className={`
            h-14 rounded-lg font-bold transition
            ${
              workerCount === n
                ? "bg-blue-700 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }
          `}
        >
          {n}교대
        </button>
      ))}
    </div>
  );
}

export default ShiftSelector;