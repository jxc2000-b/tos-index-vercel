type StatementProps = {
  children: string;
};

export default function Statement({ children }: StatementProps) {
  return (
    <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white md:text-6xl">
      {children}
    </h1>
  );
}
