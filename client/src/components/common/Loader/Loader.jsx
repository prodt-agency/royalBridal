function Loader({
  size = 40,
}) {
  return (
    <div className="flex justify-center items-center py-10">
      <div
        style={{
          width: size,
          height: size,
        }}
        className="
          animate-spin
          rounded-full
          border-4
          border-gray-300
          border-t-rose-700
        "
      />
    </div>
  );
}

export default Loader;