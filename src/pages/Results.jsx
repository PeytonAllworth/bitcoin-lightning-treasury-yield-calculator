
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Info, ShieldCheck, DraftingCompass, CalendarClock, Presentation, CheckCircle2, HelpCircle, Zap, Bitcoin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

function performCalculation({ inputs, btcPrice }) {
  const {
    btcReserves: initialBtcReserves,
    sharesOutstanding,
    lightningAllocation,
    lightningYield,
    traditionalYield, // This input is now effectively ignored for btcPassive/Idle Treasury
    btcCagr,
    monthlyRebalancing, // This flag now represents 'monthly rebalancing' behavior, not 'reinvest yield'
  } = inputs;
  const initialBtcPrice = btcPrice;

  const lightningAllocationPercent = lightningAllocation / 100;
  const quarterlyLightningYieldRate = Math.pow(1 + (lightningYield / 100), 1 / 4) - 1;
  // traditionalYield is only used for informational purposes for the user on the calculator page,
  // but for the "Idle Treasury" in this model, the yield is hardcoded to 0.
  const quarterlyTraditionalYieldRate = 0; // Explicitly set to 0 for "Idle Treasury"
  const quarterlyBtcCagrRate = Math.pow(1 + ((btcCagr || 0) / 100), 1 / 4) - 1;

  let btcOnLightning = initialBtcReserves * lightningAllocationPercent;
  let btcPassive = initialBtcReserves * (1 - lightningAllocationPercent); // This is now "Idle Treasury"

  let currentBtcPriceForCalc = initialBtcPrice;

  const quarterlyEpsResults = [];
  let cumulativeBtcFromLightning = 0;

  for (let q = 1; q <= 20; q++) {
    const btcEarnedFromLightning = btcOnLightning * quarterlyLightningYieldRate;
    const btcEarnedFromPassive = btcPassive * quarterlyTraditionalYieldRate; // This will always be 0
    
    cumulativeBtcFromLightning += btcEarnedFromLightning;

    const epsIncrementUSD = (btcEarnedFromLightning * currentBtcPriceForCalc) / sharesOutstanding;
    const satsPerShareThisQuarter = (btcEarnedFromLightning / sharesOutstanding) * 100000000;

    quarterlyEpsResults.push({
      quarter: `Y${Math.floor((q - 1) / 4) + 1}Q${((q - 1) % 4) + 1}`,
      eps_usd: epsIncrementUSD,
      sats_per_share: satsPerShareThisQuarter
    });
    
    // Logic for reinvesting yield vs. rebalancing
    if (monthlyRebalancing) { // This means we ARE rebalancing, i.e., NOT letting Lightning yield grow independently
      const totalBtc = btcOnLightning + btcEarnedFromLightning + btcPassive + btcEarnedFromPassive;
      btcOnLightning = totalBtc * lightningAllocationPercent;
      btcPassive = totalBtc * (1 - lightningAllocationPercent);
    } else { // This means we are NOT rebalancing, i.e., letting Lightning yield grow independently (reinvesting within Lightning)
      btcOnLightning += btcEarnedFromLightning;
      btcPassive += btcEarnedFromPassive; // btcPassive won't grow from its own yield
    }

    currentBtcPriceForCalc *= (1 + quarterlyBtcCagrRate);
  }

  const cumulativeSatsPerShare = quarterlyEpsResults.reduce((acc, r) => acc + r.sats_per_share, 0);
  const year1EpsUplift = quarterlyEpsResults.slice(0, 4).reduce((acc, r) => acc + r.eps_usd, 0);

  return {
    btcReserves: initialBtcReserves,
    sharesOutstanding: sharesOutstanding,
    quarterlyEPS: quarterlyEpsResults,
    cumulativeEpsUSD: quarterlyEpsResults.reduce((acc, curr) => acc + curr.eps_usd, 0),
    cumulativeRoutingFees: cumulativeBtcFromLightning,
    cumulativeSatsPerShare,
    lightningAllocation: inputs.lightningAllocation,
    lightningYield: inputs.lightningYield,
    traditionalYield: inputs.traditionalYield, // Still passed for informational display if needed
    btcPrice: initialBtcPrice,
    btcCagr: inputs.btcCagr,
    runRateEpsUplift: year1EpsUplift,
    monthlyRebalancing: monthlyRebalancing, // This now indicates if 'rebalancing' is on or off
  };
}


export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const [initialInputs, setInitialInputs] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [results, setResults] = useState(null);
  const [previousResults, setPreviousResults] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  // monthlyRebalancing state now represents the *internal calculation logic* for monthly rebalancing
  // true = rebalance, false = no rebalance (reinvest yield into lightning)
  const [monthlyRebalancing, setMonthlyRebalancing] = useState(false); 
  const [showHighlight, setShowHighlight] = useState(false);
  const [showDeltaTooltip, setShowDeltaTooltip] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    // Ensure the page loads at the top
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (location.state?.inputs && location.state?.btcPrice !== null) {
      setInitialInputs(location.state.inputs);
      setBtcPrice(location.state.btcPrice);
      // The monthlyRebalancing state from the calculator directly maps to the internal calc logic
      setMonthlyRebalancing(location.state.inputs.monthlyRebalancing || false);
    } else {
      navigate(createPageUrl('Calculator'));
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (initialInputs && btcPrice !== null) {
      setPreviousResults(results); // Store current results before new calculation

      // Pass the current monthlyRebalancing state to the calculation function
      const currentInputs = { ...initialInputs, monthlyRebalancing };
      const newResults = performCalculation({ inputs: currentInputs, btcPrice });
      
      if (results) { // Only trigger animations if results already exist (i.e., not initial load)
        setShowHighlight(true);
        setShowDeltaTooltip(true);
        setShowAnimation(true);
        setAnimateNumbers(true);
        
        // Hide highlight after 3 seconds
        setTimeout(() => setShowHighlight(false), 3000);
        // Hide delta tooltip after 18 seconds (increased from 12)
        setTimeout(() => setShowDeltaTooltip(false), 18000);
        // Hide animation after 1 second
        setTimeout(() => setShowAnimation(false), 1000);
        // Hide number animation after 600ms
        setTimeout(() => setAnimateNumbers(false), 600);
      }
      
      setResults(newResults);
    }
  }, [initialInputs, btcPrice, monthlyRebalancing]); // Removed 'results' from dependency array

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Calculating results...</p>
      </div>
    );
  }

  const epsData = results.quarterlyEPS || [];
  const epsDataInUSD = epsData;
  const cumulativeEpsUSD = results.cumulativeEpsUSD || 0;
  const cumulativeRoutingFees = results.cumulativeRoutingFees || 0;
  const cumulativeSatsPerShare = results.cumulativeSatsPerShare || 0;
  const q1EpsUplift = epsDataInUSD[0]?.eps_usd || 0; // Renamed from q1EpsUpliftUSD for consistency in function
  const runRateEpsUpliftUSD = results.runRateEpsUplift || 0;

  const allocationPct = parseFloat(results.lightningAllocation).toLocaleString('en-US', {
    maximumFractionDigits: 1
  });

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };
  
  const formatCurrency = (num) => {
    if (num === null || num === undefined) return '$0.00';
    return '$' + num.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const formatBtcNumber = (num) => {
    if (num === null || num === undefined) return '0.00';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const calculateDeltaPercentage = () => {
    if (!previousResults || !results) return 0;
    const previousCumulative = previousResults.cumulativeSatsPerShare || 0;
    const currentCumulative = results.cumulativeSatsPerShare || 0;
    if (previousCumulative === 0) {
      if (currentCumulative === 0) return 0;
      return 100; // If previous was 0 and current is not, it's a 100% increase (or more if previous was negative)
    }
    return ((currentCumulative - previousCumulative) / previousCumulative) * 100;
  };

  const calculateBtcDeltaPercentage = () => {
    if (!previousResults || !results) return 0;
    const previousBtc = previousResults.cumulativeRoutingFees || 0;
    const currentBtc = results.cumulativeRoutingFees || 0;
    if (previousBtc === 0) {
      if (currentBtc === 0) return 0;
      return 100;
    }
    return ((currentBtc - previousBtc) / previousBtc) * 100;
  };

  const deltaPercentage = calculateDeltaPercentage();
  const btcDeltaPercentage = calculateBtcDeltaPercentage();

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <div className="relative pt-12 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Calculator'), { state: { inputs: initialInputs } })}
              className="absolute left-0 top-0 sm:top-1/2 sm:-translate-y-1/2 rounded-xl flex items-center gap-2"
              aria-label="Back to Calculator"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Calculator</span>
            </Button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">Non-Dilutive Lightning Yield Impact</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Incremental EPS and per-share Bitcoin growth from Lightning routing fees, in addition to existing holdings.
              </p>
            </div>
          </div>
        </div>

        {/* Reinvest Toggle */}
        <Card className="rounded-xl border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  // Current: monthlyRebalancing: true (rebalance) -> gray; monthlyRebalancing: false (no rebalance) -> yellow
                  // New: Reinvest Yield: ON (monthlyRebalancing false) -> yellow; Reinvest Yield: OFF (monthlyRebalancing true) -> gray
                  animate={{ 
                    color: monthlyRebalancing ? "#6B7280" : "#F59E0B"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
                <Label htmlFor="monthly-rebalancing-results" className="text-sm font-semibold">Reinvest Lightning Yield</Label>
              </div>
              <Switch
                id="monthly-rebalancing-results"
                checked={!monthlyRebalancing} // Invert logic: checked=ON means !monthlyRebalancing (no rebalance, yield reinvested)
                onCheckedChange={(checked) => setMonthlyRebalancing(!checked)} // Update monthlyRebalancing to be opposite of checked value
              />
            </div>
            <div className="text-xs text-gray-500 leading-relaxed min-h-[2.5rem] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={monthlyRebalancing ? "rebalance-off" : "reinvest-on"} // Use distinct keys based on `monthlyRebalancing` state
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {!monthlyRebalancing // This is true when "Reinvest Lightning Yield" is ON
                    ? "The initial Lightning allocation compounds on its own; its share of the total treasury will grow proportionally larger over time."
                    : "The Lightning allocation is dynamically adjusted to consistently maintain its target percentage of the total growing treasury."
                  }
                </motion.p>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Inputs snapshot */}
        <motion.div
          animate={showHighlight ? { 
            boxShadow: "0 0 20px rgba(250, 204, 21, 0.4)",
            backgroundColor: "rgba(254, 249, 195, 0.3)" 
          } : {
            boxShadow: "none",
            backgroundColor: "rgb(249, 250, 251)" // Corresponds to bg-gray-50
          }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gray-50 border-gray-200 rounded-xl">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium">Scenario inputs:</span> {formatNumber(results.btcReserves || 0)} BTC • {allocationPct}% Lightning • {results.lightningYield}% yield • {results.btcCagr}% BTC CAGR • {formatNumber(results.sharesOutstanding || 0)} shares • BTC price (t₀): {formatCurrency(results.btcPrice || 0).replace('$', '$').replace('.00', '')}
                
                {/* Display Reinvest Yield: ON/OFF based on !results.monthlyRebalancing */}
                {!results.monthlyRebalancing && ( // This means Reinvest Yield is ON (no rebalancing)
                  <span className="inline-flex items-center gap-1 ml-2">
                    <motion.div
                      animate={showHighlight ? { 
                        color: "#F59E0B" // bright yellow when turned ON (reinvesting)
                      } : { 
                        color: "#F59E0B" // bright yellow when stable and ON
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="w-3 h-3" />
                    </motion.div>
                    <motion.span 
                      className="font-medium"
                      animate={showHighlight ? { 
                        color: "#F59E0B" // bright yellow text
                      } : { 
                        color: "#F59E0B"
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      Reinvest Yield: ON
                    </motion.span>
                  </span>
                )}
                {results.monthlyRebalancing && ( // This means Reinvest Yield is OFF (rebalancing is active)
                  <span className="inline-flex items-center gap-1 ml-2">
                    <motion.div
                      animate={showHighlight ? { 
                        color: "#6B7280" // gray-500 - dull when rebalancing is ON
                      } : { 
                        color: "#6B7280" // gray-500 - stays dull when stable and ON
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="w-3 h-3" />
                    </motion.div>
                    <motion.span 
                      className="font-medium"
                      animate={showHighlight ? { 
                        color: "#6B7280" // gray-500 - dull text
                      } : { 
                        color: "#6B7280"
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      Reinvest Yield: OFF
                    </motion.span>
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Headline Result */}
        <div className="relative">
          <Card className="text-center bg-green-50 border-green-200 rounded-2xl">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm sm:text-base text-muted-foreground mb-2 font-semibold">Non-Dilutive EPS Uplift</p>
              <motion.p 
                className="text-4xl sm:text-5xl font-bold text-green-600"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                animate={animateNumbers ? { 
                  scale: [1, 1.05, 1],
                  color: ["#16a34a", "#059669", "#16a34a"]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                +{formatCurrency(q1EpsUplift)} per share
              </motion.p>
              <p className="text-sm text-gray-500 mt-3">
                Allocating {allocationPct}% to Lightning can deliver material, non-dilutive EPS over 5 years.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Q1 EPS calculated using start-of-quarter BTC price
              </p>
            </CardContent>
          </Card>
          
          {/* Single Delta Tooltip for Bitcoin routing fees */}
          <AnimatePresence>
            {showDeltaTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-2 right-4 bg-white border border-orange-200 rounded-lg px-3 py-2 shadow-lg z-10"
              >
                <div className="text-xs font-medium">
                  {btcDeltaPercentage > 0 ? (
                    <span className="text-green-600">+{btcDeltaPercentage.toFixed(1)}% vs. previous setting</span>
                  ) : (
                    <span className="text-red-600">{btcDeltaPercentage.toFixed(1)}% vs. previous setting</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">5-year Bitcoin routing fees</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-200"></div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" style={{ marginTop: '-1px' }}></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
          <Card className="text-center rounded-xl ring-2 ring-green-500 bg-green-50/50 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1 flex flex-col">
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-sm sm:text-base font-medium">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help inline-flex items-center gap-1">
                        Run-Rate EPS Uplift<br />(Year 1)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Sum of the first four quarterly EPS uplifts using quarterly compounding of Lightning yield and BTC CAGR.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pt-1 pb-3 sm:pb-4 flex-1 flex flex-col justify-center items-center gap-2">
              <motion.p 
                className="text-4xl sm:text-5xl font-bold text-green-600"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                animate={animateNumbers ? { 
                  scale: [1, 1.08, 1],
                  color: ["#16a34a", "#059669", "#16a34a"]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {formatCurrency(runRateEpsUpliftUSD)}
              </motion.p>
              <p className="text-xs text-muted-foreground leading-tight text-center">Annualized, non-dilutive EPS from routing fees at current inputs.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center rounded-xl ring-2 ring-green-500 bg-green-50/50 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1 flex flex-col">
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-sm sm:text-base font-medium">Cumulative EPS Gain<br />(5Y, USD/share)</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pt-1 pb-3 sm:pb-4 flex-1 flex flex-col justify-center items-center gap-2">
              <motion.p 
                className="text-4xl sm:text-5xl font-bold text-green-600"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                animate={animateNumbers ? { 
                  scale: [1, 1.08, 1],
                  color: ["#16a34a", "#059669", "#16a34a"]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {formatCurrency(cumulativeEpsUSD)}
              </motion.p>
              <p className="text-xs text-muted-foreground leading-tight text-center">Total non‑dilutive EPS uplift across 5‑year projection.</p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-xl ring-2 ring-orange-400 bg-orange-50 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1 flex flex-col">
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-sm sm:text-base font-medium">Cumulative Routing Fees<br />(5-Year BTC Earned)</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pt-1 pb-3 sm:pb-4 flex-1 flex flex-col justify-center items-center gap-2">
              <motion.p 
                className="text-4xl sm:text-5xl font-bold"
                style={{ color: '#F7931A', fontVariantNumeric: 'tabular-nums' }}
                animate={animateNumbers ? { 
                  scale: [1, 1.08, 1],
                  color: ["#F7931A", "#E8851A", "#F7931A"]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {formatBtcNumber(cumulativeRoutingFees)}
              </motion.p>
              <p className="text-xs text-muted-foreground leading-tight text-center">Total BTC earned from Lightning routing over 5 years.</p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-xl ring-2 ring-orange-400 bg-orange-50 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1 flex flex-col">
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-sm sm:text-base font-medium">Cumulative Sats/Share Growth<br />(5-Year Projection)</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pt-1 pb-3 sm:pb-4 flex-1 flex flex-col justify-center items-center gap-2">
              <motion.p 
                className="text-4xl sm:text-5xl font-bold"
                style={{ color: '#F7931A', fontVariantNumeric: 'tabular-nums' }}
                animate={animateNumbers ? { 
                  scale: [1, 1.08, 1],
                  color: ["#F7931A", "#E8851A", "#F7931A"]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                +{formatNumber(cumulativeSatsPerShare)}
              </motion.p>
              <p className="text-xs text-muted-foreground leading-tight text-center">Total non‑dilutive per‑share growth in sats from Lightning yield.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-gray-500 max-w-3xl mx-auto mt-8 space-y-1">
          <p>Operating costs scale with channel size but remain minimal versus projected EPS uplift.</p>
          <p>Detailed cost modeling available on request.</p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <Card className="rounded-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Quarterly EPS Uplift (USD per share)</CardTitle>
              <CardDescription>Shows incremental non‑dilutive EPS per share in USD; sats/share equivalent displayed on hover.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={epsDataInUSD} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" fontSize={12} interval={isMobile ? 3 : 0} />
                  <YAxis tickFormatter={(val) => formatCurrency(val)} fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      padding: '12px'
                    }}
                    formatter={(value, name, props) => {
                      const data = props.payload;
                      return [
                        <div key="tooltip-content">
                          <div style={{ color: '#28a745', fontWeight: '600', fontSize: '13px' }}>
                            +{formatCurrency(data.eps_usd)} EPS
                          </div>
                          <div style={{ color: '#F7931A', fontWeight: '500', fontSize: '11px', marginTop: '2px' }}>
                            +{formatNumber(data.sats_per_share || 0)} sats/share
                          </div>
                        </div>
                      ];
                    }}
                    labelFormatter={(label) => `Quarter: ${label}`}
                  />
                  <Bar dataKey="eps_usd" name="Incremental EPS (USD)" fill="#F7931A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Sats/share shown for context; values are already reflected in EPS.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 8-Week Lightning Yield Sprint */}
        <div className="mt-16 pt-8 text-center">
          <div className="w-full h-px bg-gray-200 mb-8 max-w-2xl mx-auto"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">8-Week Lightning Yield Sprint: My Deliverables</h2>

          {/* My Role CTA */}
          <Card className="rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 shadow-sm">
              <CardContent className="p-8 text-left">
                  <h3 className="text-xl font-bold mb-6 text-gray-900">My Role (8-Week Sprint)</h3>
                  <p className="mb-5 text-gray-700 leading-relaxed">In 8 weeks, I will deliver a board-ready Lightning Yield plan that positions Semler as a first mover in public-company Bitcoin Strategy:</p>
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed"><strong>Design</strong> a pilot Lightning Yield plan tailored to Semler's Bitcoin Treasury.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed"><strong>Deliver</strong> a compliance memo to ensure routing fees are GAAP & SOX-ready.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed"><strong>Map</strong> custody, liquidity, and team roles for a smooth, low-friction launch.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed"><strong>Produce</strong> investor-ready framing to position Lightning Yield as an mNAV enhancer without shareholder dilution.</span>
                    </li>
                  </ul>
                  <div className="border-t border-green-200 pt-5 mt-3">
                    <p className="text-gray-800 leading-relaxed">
                      <span className="font-bold text-gray-900">Outcome:</span> When everyone chases the same trade, the edge disappears. For most treasury strategies, mNAV will trend toward 1. For Semler Scientific, this Lightning strategy creates a <strong className="font-semibold text-gray-900">first-mover advantage</strong> in Bitcoin Treasury management.
                    </p>
                  </div>
              </CardContent>
          </Card>
        </div>

        {/* Methodology */}
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border rounded-xl bg-muted/30">
                <AccordionTrigger className="px-4 sm:px-6 hover:no-underline">
                    <div className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-muted-foreground"/>
                        <span className="text-sm sm:text-base font-semibold text-foreground">Methodology & Assumptions</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-sm text-muted-foreground">
                   <ul className="list-disc list-outside pl-5 space-y-2">
                        <li><strong>Scope:</strong> To isolate the structural role of Lightning, this analysis assumes a static BTC treasury with no debt financing, ATM equity issuance, or opportunistic trading — focusing exclusively on yield earned natively from Lightning, independent of balance sheet leverage or equity financing decisions.</li>
                        <li><strong>Inputs:</strong> User-defined variables — BTC reserves, Lightning allocation %, projected Lightning yield, BTC CAGR, share count (calculator includes illustrative defaults).</li>
                        <li><strong>Allocation:</strong> {!results.monthlyRebalancing // This is true when "Reinvest Lightning Yield" is ON
                          ? 'Initial BTC portion allocated to Lightning compounds on its own yield, gradually increasing its weight in the treasury.'
                          : 'Lightning and idle treasury BTC are rebalanced monthly to maintain the selected Lightning allocation percentage of the total growing treasury.'}</li>
                        <li><strong>Compounding:</strong> BTC price CAGR and Lightning yield are compounded quarterly. (Monthly/continuous compounding differences are immaterial at modeled yields/time horizon.)</li>
                        <li><strong>Pricing path:</strong> Quarterly BTC prices derived geometrically from current live price and assumed annual CAGR.</li>
                        <li><strong>EPS calc:</strong> Each quarter's Lightning-earned BTC converted to USD at that quarter's price, divided by fully diluted shares, and summed. "Year-1 Run-Rate EPS Uplift" = sum of first four quarterly uplifts. 5-Year EPS Gain = sum of 20 quarters.</li>
                        <li><strong>Disclaimer:</strong> All results are planning estimates only; not investment advice or forward-looking guidance.</li>
                   </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}
