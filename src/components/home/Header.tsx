type HeaderProps = {
  dateText: string;
};

function Header({ dateText }: HeaderProps) {
  return (
    <header className="border-b p-5">
      <h1 className="text-2xl font-bold">
        오늘은몇턴?
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        {dateText}
      </p>
    </header>
  );
}

export default Header;
