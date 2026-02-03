import React, { useState, useEffect, useRef } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "./badge"; // Assuming Badge component exists
import { Button } from "./button";

export function MultiSelect({ options, value, onChange, placeholder = "Select items..." }) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((item) => item !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const handleRemove = (optionValue, e) => {
        e.stopPropagation();
        onChange(value.filter((item) => item !== optionValue));
    };

    const selectedLabels = value.map(
        (val) => options.find((opt) => opt.value === val)?.label || val
    );

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className="min-h-[44px] max-h-48 overflow-y-auto w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus-within:ring-2 focus-within:ring-primary/50 focus:outline-none flex flex-wrap gap-2 cursor-pointer transition-all"
                onClick={() => setOpen(!open)}
            >
                {value.length === 0 && (
                    <span className="text-gray-400">{placeholder}</span>
                )}
                {value.map((val) => {
                    const label = options.find(o => o.value === val)?.label || val;
                    return (
                        <Badge key={val} variant="secondary" className="mr-1 mb-1 bg-primary/20 text-primary-foreground hover:bg-primary/30">
                            {label}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={(e) => handleRemove(val, e)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    );
                })}
                <div className="flex-1 flex justify-end">
                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </div>
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-[#1e1e1e] border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 sticky top-0 bg-[#1e1e1e] border-b border-white/10 z-10">
                        <input
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-sm px-2 py-1 text-sm text-white focus:outline-none"
                            placeholder="Search..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-2 text-center text-sm text-gray-500">No results found.</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-white/10 ${value.includes(option.value) ? "bg-white/10" : ""
                                        }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${value.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                        <Check className={`h-4 w-4 text-white ${value.includes(option.value) ? "visible" : "invisible"}`} />
                                    </div>
                                    <span className="text-gray-200">{option.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
