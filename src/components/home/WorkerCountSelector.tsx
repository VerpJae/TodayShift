type WorkerCountSelectorProps = {
  workerCount: number | null;
  setWorkerCount: (count: number) => void;
};

function WorkerCountSelector({
  workerCount,
  setWorkerCount,
}: WorkerCountSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => setWorkerCount(count)}
          className={`h-14 rounded-lg font-bold text-white transition ${
            workerCount === count
              ? "bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {count}명
        </button>
      ))}
    </div>
  );
}

export default WorkerCountSelector;
