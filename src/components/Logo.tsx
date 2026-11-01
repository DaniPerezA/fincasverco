export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt=""
      width={512}
      height={512}
      className={className}
    />
  );
}
