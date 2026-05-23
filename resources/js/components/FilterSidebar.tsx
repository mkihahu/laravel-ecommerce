import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                className="w-full flex items-center justify-between py-4 px-1 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-sm text-gray-900 uppercase tracking-wide">{title}</span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="pb-4 px-1">
                    {children}
                </div>
            )}
        </div>
    );
}

interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value), value[1] - 10);
        onChange([newMin, value[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value), value[0] + 10);
        onChange([value[0], newMax]);
    };

    const minPercent = ((value[0] - min) / (max - min)) * 100;
    const maxPercent = ((value[1] - min) / (max - min)) * 100;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Min</label>
                    <input
                        type="number"
                        value={value[0]}
                        onChange={handleMinChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Max</label>
                    <input
                        type="number"
                        value={value[1]}
                        onChange={handleMaxChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
            </div>

            <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                    className="absolute h-full bg-orange-500 rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`,
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value[0]}
                    onChange={handleMinChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value[1]}
                    onChange={handleMaxChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
                <span>${value[0]}</span>
                <span>${value[1]}</span>
            </div>
        </div>
    );
}
