
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const presets = {
  conservative: {
    label: 'Bear Case',
    lightningAllocation: 10,
    lightningYield: 2.5,
    btcCagr: 21
  },
  base: {
    label: 'Base Case',
    lightningAllocation: 15,
    lightningYield: 4,
    btcCagr: 29
  },
  aggressive: {
    label: 'Bull Case',
    lightningAllocation: 25,
    lightningYield: 6,
    btcCagr: 37
  }
};

export default function PresetButtons({ onPresetSelect, currentInputs }) {
  const [recentlyChanged, setRecentlyChanged] = useState(null);

  const handlePresetClick = (presetKey) => {
    const preset = presets[presetKey];
    onPresetSelect({
      ...currentInputs,
      lightningAllocation: preset.lightningAllocation,
      lightningYield: preset.lightningYield,
      btcCagr: preset.btcCagr
    });
    
    // Set recently changed state for visual feedback
    setRecentlyChanged(presetKey);
    
    // Clear the feedback state after animation
    setTimeout(() => setRecentlyChanged(null), 800);
  };

  const isPresetActive = (preset) => {
    return (
      preset.lightningAllocation === currentInputs.lightningAllocation &&
      preset.lightningYield === currentInputs.lightningYield &&
      preset.btcCagr === currentInputs.btcCagr
    );
  };

  return (
    <div className="text-center space-y-3">
      <p className="text-sm font-semibold text-gray-800">Quick Scenarios</p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <TooltipProvider>
          {Object.entries(presets).map(([key, preset]) => {
            const isActive = isPresetActive(preset);
            const wasRecentlyChanged = recentlyChanged === key;
            
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <motion.div
                    animate={wasRecentlyChanged ? {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 0 rgba(247, 147, 26, 0)",
                        "0 0 15px rgba(247, 147, 26, 0.4)",
                        "0 0 0 rgba(247, 147, 26, 0)"
                      ]
                    } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="lg" // Changed from 'sm' to 'lg'
                      onClick={() => handlePresetClick(key)}
                      className={`w-36 h-12 rounded-md transition-all text-base font-medium ${ // Adjusted width, height, font size, and weight
                        isActive 
                          ? 'bg-[#F7931A] hover:bg-[#E8851A] text-white shadow-sm' 
                          : 'text-gray-700 bg-white hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-lg">
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-gray-900 mb-2">{preset.label} Assumptions:</div>
                    <div className="text-gray-600">Lightning Allocation: <span className="font-medium text-gray-900">{preset.lightningAllocation}%</span></div>
                    <div className="text-gray-600">Lightning Yield: <span className="font-medium text-gray-900">{preset.lightningYield}%</span></div>
                    <div className="text-gray-600">BTC CAGR: <span className="font-medium text-gray-900">{preset.btcCagr}%</span></div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
