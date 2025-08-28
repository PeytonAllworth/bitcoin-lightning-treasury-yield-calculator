
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bitcoin, Calculator as CalcIcon, TrendingUp, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputSection from '../components/calculator/InputSection';
import FAQModal from '../components/calculator/FAQModal';
import { createPageUrl } from '@/utils';

export default function Calculator() {
  const navigate = useNavigate();
  const location = useLocation();

  const [inputs, setInputs] = useState({
    btcReserves: 5021,
    sharesOutstanding: 14805000,
    lightningAllocation: 15,
    lightningYield: 4,
    btcCagr: '', // Changed from 30 to blank
    monthlyRebalancing: false // Added monthlyRebalancing
  });

  const [showFAQ, setShowFAQ] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentBtcPrice, setCurrentBtcPrice] = useState(65000);

  // Effect to restore inputs if navigating back from results page
  useEffect(() => {
    if (location.state?.inputs) {
      setInputs(location.state.inputs);
      // Clear the state to prevent re-applying if the user navigates away and comes back without a specific state
      // navigate(location.pathname, { replace: true, state: {} }); // This clears the state, but might not be desired if user directly navigates back using browser buttons.
      // For now, let's just apply it and rely on default state for fresh visits.
    }
  }, [location.state]); // Depend on location.state to re-run when state changes (e.g., coming back from /results)

  // Fetch current BTC price
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        // Try multiple APIs for better reliability
        let price = null;

        // First try CoinGecko
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
          const data = await response.json();
          if (data.bitcoin?.usd) {
            price = data.bitcoin.usd;
          }
        } catch (error) {
          console.log('CoinGecko API failed, trying fallback...');
        }

        // Fallback to CoinDesk API if CoinGecko fails
        if (!price) {
          try {
            const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const data = await response.json();
            if (data.bpi?.USD?.rate_float) {
              price = data.bpi.USD.rate_float;
            }
          } catch (error) {
            console.log('CoinDesk API also failed');
          }
        }

        if (price) {
          setCurrentBtcPrice(Math.round(price));
        }
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
        // Keep default price if all APIs fail
      }
    };

    fetchBtcPrice();

    // Update price every 5 minutes
    const interval = setInterval(fetchBtcPrice, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!inputs.btcReserves || inputs.btcReserves <= 0) {
      newErrors.btcReserves = 'Must be > 0';
    }
    if (!inputs.sharesOutstanding || inputs.sharesOutstanding <= 0) {
      newErrors.sharesOutstanding = 'Must be > 0';
    }
    if (inputs.btcCagr === '' || inputs.btcCagr === null || inputs.btcCagr === undefined) {
      newErrors.btcCagr = 'Required';
    }
    setErrors(newErrors);
    return newErrors;
  };

  const calculateLightningImpact = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey) {
        const fieldIdMap = {
          btcReserves: 'btc-reserves',
          sharesOutstanding: 'shares-outstanding',
          btcCagr: 'btc-cagr',
        };
        const fieldId = fieldIdMap[firstErrorKey];
        const element = document.getElementById(fieldId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus({ preventScroll: true });
        }
      }
      return;
    }

    setIsCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // The calculation logic for quarterly EPS, cumulative values, etc.,
    // is now intended to be handled by the Results page or a shared utility
    // that the Results page can call dynamically.
    // This component now just collects inputs and passes them on,
    // allowing the Results page to re-calculate based on rebalancing toggle state.

    setIsCalculating(false); // Stop loading after timeout

    // Navigate to Results page, passing raw inputs and current BTC price.
    navigate(createPageUrl('Results'), { state: { inputs, btcPrice: currentBtcPrice } });
  };

  return (
    <div className="min-h-screen py-20 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        {/* Header */}
        <header className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-[#F7931A]/10 to-yellow-100 rounded-full w-16 h-16 sm:w-20 sm:h-20">
            <Bitcoin className="w-8 h-8 sm:w-10 sm:h-10 text-[#F7931A]" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-gray-900">
              Bitcoin Treasury{' '}
              <span className="block sm:inline text-[#F7931A]">Lightning Yield</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed px-4">
              Estimate non-dilutive EPS impact and per-share Bitcoin growth under GAAP fair-value rules.
            </p>
            <p className="text-sm text-gray-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live BTC Price: ${currentBtcPrice.toLocaleString()}
              </span>
            </p>
          </div>
        </header>

        {/* Value Proposition Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <Card className="text-center rounded-xl border-gray-200 bg-white shadow-sm">
            <CardHeader className="p-6 sm:p-8">
              <div className="mx-auto bg-blue-50 p-3 rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-4">
                <CalcIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center min-h-[3.5rem]">Instant Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Immediate EPS and per-share Bitcoin projections in 60 seconds.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center rounded-xl border-gray-200 bg-white shadow-sm">
            <CardHeader className="p-6 sm:p-8">
              <div className="mx-auto bg-green-50 p-3 rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center min-h-[3.5rem]">EPS Impact</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                See how Lightning yield enhances non‑dilutive earnings per share.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center rounded-xl border-gray-200 bg-white shadow-sm">
            <CardHeader className="p-6 sm:p-8">
              <div className="mx-auto bg-[#F7931A]/10 p-3 rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-4">
                <Bitcoin className="w-6 h-6 sm:w-7 sm:h-7 text-[#F7931A]" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center min-h-[3.5rem]">Non-Dilutive Treasury Growth</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Track how Lightning fees grow per-share Bitcoin holdings without issuing new shares.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Calculator Section */}
        <main className="max-w-4xl mx-auto pt-8">
          <InputSection
            inputs={inputs}
            setInputs={setInputs}
            onCalculate={calculateLightningImpact}
            isCalculating={isCalculating}
            errors={errors}
          />
        </main>

        <div className="text-center text-xs text-muted-foreground max-w-2xl mx-auto px-4 py-6 mt-16 bg-gray-50 rounded-lg border border-gray-200">
          <p className="font-medium mb-3">This model isolates Lightning yield impact and excludes Semler Scientific's proprietary 'BTC Yield' metric, which tracks per‑share Bitcoin growth.</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>Designed for corporate Bitcoin Treasury under ASC 350‑60 (effective FY 2025)</li>
            <li>Yield estimates assume Bitcoin remains in company‑controlled multi‑signature channels</li>
            <li>All results are planning estimates only and do not constitute investment advice</li>
          </ul>
        </div>

        {/* FAQ and Footer */}
        <footer className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto pt-12">
          <div className="border-t border-gray-200"></div>
          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowFAQ(true)}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900"
            >
              <HelpCircle className="w-4 h-4" />
              How Lightning Yield Works & Methodology
            </Button>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
    </div>
  );
}
