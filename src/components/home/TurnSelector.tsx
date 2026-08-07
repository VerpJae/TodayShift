type TurnSelectorProps = {
  workerCount: number | null;
  myTurn: number | null;
  setMyTurn: (turn: number) => void;
};

function TurnSelector({
  workerCount,
  myTurn,
  setMyTurn,
}: TurnSelectorProps) {
  if (workerCount === null) {
    return null;
  }

  return (
    <div className="mt-4">
      <h2 className="font-semibold mb-4">
        내 담당 턴
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: workerCount }).map((_, index) => {
          const turn = index + 1;

          return (
            <button
              key={turn}
              onClick={() => setMyTurn(turn)}
              className={`
                h-14 rounded-lg font-bold transition
                ${
                  myTurn === turn
                    ? "bg-green-600 text-white"
                    : "bg-green-400 text-white hover:bg-green-500"
                }
              `}
            >
              {turn}턴
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TurnSelector;