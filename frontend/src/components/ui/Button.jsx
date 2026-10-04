const Button = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        px-4
        py-2.5
        text-sm
        font-semibold
        text-white
        bg-blue-600
        hover:bg-blue-700
        disabled:cursor-not-allowed
        disabled:opacity-50
        transition
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
