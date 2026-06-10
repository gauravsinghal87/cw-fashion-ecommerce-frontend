import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-white border border-primary hover:bg-primary/90',
  outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
  accent: 'bg-accent text-primary border border-accent hover:bg-accent/90',
  ghost: 'bg-transparent text-gray-600 border border-transparent hover:bg-gray-100',
  danger: 'bg-danger text-white border border-danger hover:bg-danger/90',
};

const sizes = {
  sm: 'px-3 py-2 text-xs sm:text-sm min-h-[44px]',
  md: 'px-5 py-2.5 text-sm sm:text-base min-h-[44px]',
  lg: 'px-8 py-3.5 text-sm sm:text-base min-h-[48px]',
  xl: 'px-12 py-4 text-base sm:text-lg min-h-[52px]',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading, disabled, ...props }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
          Processing...
        </span>
      ) : children}
    </motion.button>
  );
};

export default Button;
