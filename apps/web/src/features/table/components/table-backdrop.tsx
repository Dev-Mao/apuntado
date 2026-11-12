export function TableBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="absolute -top-24 -right-20 size-64 rounded-full bg-coral lg:-top-40 lg:-left-36 lg:right-auto lg:size-[30rem]" />
      <span className="absolute -bottom-28 -left-24 hidden size-72 rounded-full bg-salmon/80 lg:block" />
    </div>
  );
}
