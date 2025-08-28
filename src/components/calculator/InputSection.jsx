
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SliderInput from './SliderInput';
import PresetButtons from './PresetButtons';
import { cn } from '@/lib/utils';

export default function InputSection({ 
  inputs, 
  setInputs, 
  onCalculate, 
  isCalculating,
  errors 
}) {
  const [highlightedFields, setHighlightedFields] = React.useState(new Set());

  const updateInput = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Watch for changes in key input fields to trigger highlights
  React.useEffect(() => {
    const fieldsToHighlight = new Set();
    
    // Check if any of the preset-related fields have changed
    const presetFields = ['lightningAllocation', 'lightningYield', 'btcCagr'];
    presetFields.forEach(field => {
      fieldsToHighlight.add(field);
    });
    
    setHighlightedFields(fieldsToHighlight);
    
    // Clear highlights after animation
    const timer = setTimeout(() => {
      setHighlightedFields(new Set());
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [inputs.lightningAllocation, inputs.lightningYield, inputs.btcCagr]);

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    return num.toLocaleString();
  };

  const parseNumber = (str) => {
    const value = String(str).replace(/,/g, '');
    if (value === '') return '';
    const num = parseFloat(value);
    return isNaN(num) ? '' : num;
  };

  const handleNumberInput = (field, value) => {
    const numericValue = parseNumber(value);
    updateInput(field, numericValue);
  };

  return (
    <Card className="rounded-2xl border-gray-200 bg-white shadow-sm">
      <CardHeader className="text-center px-6 sm:px-10 pt-8 pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Treasury Calculator</CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600 mt-2">
          Model how Lightning yield can enhance EPS and Bitcoin Treasury growth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10 px-6 sm:px-10 pb-10">
        
        {/* Company Inputs Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Company Inputs</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="btc-reserves" className="text-sm font-semibold text-gray-900">Total BTC Reserves</Label>
              <Input
                id="btc-reserves"
                type="text"
                value={formatNumber(inputs.btcReserves)}
                onChange={(e) => handleNumberInput('btcReserves', e.target.value)}
                placeholder="5,021"
                className={cn("rounded-lg", errors.btcReserves && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.btcReserves && <p className="text-xs text-destructive">{errors.btcReserves}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares-outstanding" className="text-sm font-semibold text-gray-900">Shares Outstanding</Label>
              <Input
                id="shares-outstanding"
                type="text"
                value={formatNumber(inputs.sharesOutstanding)}
                onChange={(e) => handleNumberInput('sharesOutstanding', e.target.value)}
                placeholder="14,805,000"
                className={cn("rounded-lg", errors.sharesOutstanding && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.sharesOutstanding && <p className="text-xs text-destructive">{errors.sharesOutstanding}</p>}
            </div>
          </div>
        </div>
        
        {/* Preset Buttons */}
        <div className="pt-8 border-t border-gray-200">
          <PresetButtons 
            onPresetSelect={setInputs}
            currentInputs={inputs}
          />
        </div>

        {/* Yield Inputs Section */}
        <div className="space-y-6 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Yield Inputs</h3>
          <div className="space-y-6">
            <motion.div
              animate={highlightedFields.has('lightningAllocation') ? {
                backgroundColor: ["rgba(254, 249, 195, 0)", "rgba(254, 249, 195, 0.6)", "rgba(254, 249, 195, 0)"]
              } : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="rounded-lg"
            >
              <SliderInput
                id="lightning-allocation"
                label="% of Treasury Allocated to Lightning"
                value={inputs.lightningAllocation}
                onChange={(value) => updateInput('lightningAllocation', value)}
                min={0}
                max={100}
                step={1}
                description="Portion of bitcoin treasury deployed to Lightning routing"
              />
            </motion.div>

            <motion.div
              animate={highlightedFields.has('lightningYield') ? {
                backgroundColor: ["rgba(254, 249, 195, 0)", "rgba(254, 249, 195, 0.6)", "rgba(254, 249, 195, 0)"]
              } : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="rounded-lg"
            >
              <SliderInput
                id="lightning-yield"
                label="Projected Lightning Yield (%)"
                value={inputs.lightningYield}
                onChange={(value) => updateInput('lightningYield', value)}
                min={0}
                max={10}
                step={0.1}
                highlighted={true}
                description="Estimated annual yield from Lightning routing fees. Typical range for well-managed channels is 2–7%, with early adopters in high-volume payment flows achieving 4–7%."
              />
            </motion.div>

            {/* Reinvest Lightning Yield Toggle */}
            <div className="space-y-3 p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <Label htmlFor="monthly-rebalancing" className="text-sm font-semibold text-gray-900">
                    Reinvest Lightning Yield
                  </Label>
                </div>
                <Switch
                  id="monthly-rebalancing"
                  checked={!inputs.monthlyRebalancing}
                  onCheckedChange={(checked) => updateInput('monthlyRebalancing', !checked)}
                />
              </div>
              <div className="text-xs text-gray-500 leading-relaxed min-h-[2.5rem] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={inputs.monthlyRebalancing ? "rebalance" : "reinvest"}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {!inputs.monthlyRebalancing
                      ? "The initial Lightning allocation compounds on its own; its share of the total treasury will grow proportionally larger over time."
                      : "The Lightning allocation is dynamically adjusted to consistently maintain its target percentage of the total growing treasury."
                    }
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Market Assumptions Section */}
        <div className="space-y-6 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Market Assumptions</h3>
          <motion.div
            animate={highlightedFields.has('btcCagr') ? {
              backgroundColor: ["rgba(254, 249, 195, 0)", "rgba(254, 249, 195, 0.6)", "rgba(254, 249, 195, 0)"]
            } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="space-y-2 p-2 rounded-lg"
          >
            <Label htmlFor="btc-cagr" className="text-sm font-semibold text-gray-900">BTC CAGR (%)</Label>
            <Input
              id="btc-cagr"
              type="text"
              value={inputs.btcCagr}
              onChange={(e) => updateInput('btcCagr', e.target.value)}
              placeholder="e.g. 29"
              className={cn("rounded-lg", errors.btcCagr && "border-destructive focus-visible:ring-destructive")}
            />
            <p className="text-xs text-gray-500">Assumed annual BTC price growth for scenario modeling.</p>
            {errors.btcCagr && <p className="text-xs text-destructive">{errors.btcCagr}</p>}
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-200">
          <Button
            size="lg"
            onClick={onCalculate}
            disabled={isCalculating}
            className="w-full sm:w-auto hover:bg-[#E8851A] text-white rounded-xl px-12 py-7 text-base sm:text-lg font-semibold shadow-md"
            style={{ backgroundColor: '#F7931A' }}
          >
            {isCalculating ? 'Calculating...' : 'Calculate EPS & Treasury Impact'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
