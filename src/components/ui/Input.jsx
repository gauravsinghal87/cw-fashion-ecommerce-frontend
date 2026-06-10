const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input className={`input-luxe min-h-[44px] px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${error ? 'border-danger' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};

export default Input;
