import { cn } from '../../lib/utils';

const Switch = ({ checked, onCheckedChange, disabled = false, id }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            id={id}
            onClick={() => !disabled && onCheckedChange(!checked)}
            disabled={disabled}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#282828] disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-green-500" : "bg-gray-600"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
};

export default Switch;
