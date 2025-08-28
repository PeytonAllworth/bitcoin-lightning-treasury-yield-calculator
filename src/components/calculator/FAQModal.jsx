
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap, FileText, Shield, TrendingUp, HelpCircle, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqData = [
  {
    icon: <Zap className="w-3.5 h-3.5 text-orange-500 group-data-[state=open]:text-orange-500 transition-colors" />,
    question: "How does Lightning yield work?",
    answer: "Lightning Network enables Bitcoin Treasury to earn yield by providing liquidity for payment routing. Funds remain in company custody while collecting routing fees in bitcoin."
  },
  {
    icon: <TrendingUp className="w-3.5 h-3.5 text-orange-500 group-data-[state=open]:text-orange-500 transition-colors" />,
    question: "What yield is expected from well‑managed channels?",
    answer: "Typical annual yield ranges from 2% to 7%. Optimized nodes with high liquidity and connectivity can achieve the upper end of this range."
  },
  {
    icon: <FileText className="w-3.5 h-3.5 text-green-500 group-data-[state=open]:text-green-500 transition-colors" />,
    question: "How does this impact GAAP accounting?",
    answer: "Under ASC 350‑60, bitcoin allocated to Lightning can be treated as a productive asset. Routing fees flow through net income, allowing non‑dilutive EPS recognition."
  },
  {
    icon: <Shield className="w-3.5 h-3.5 text-purple-500 group-data-[state=open]:text-purple-500 transition-colors" />,
    question: "What are the risks?",
    answer: "Key risks include liquidity management, network monitoring, and technical operational overhead. However, bitcoin custody remains fully under company control."
  },
  {
    icon: <HelpCircle className="w-3.5 h-3.5 text-indigo-500 group-data-[state=open]:text-indigo-500 transition-colors" />,
    question: "Why focus on EPS impact?",
    answer: "Lightning yield directly contributes to quarterly EPS without issuing new shares. For public Bitcoin Treasury, this supports a potential mNAV premium in the market."
  }
];

export default function FAQModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-gray-50">
        <DialogHeader className="px-4 sm:px-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-sm mb-4">
            <FileQuestion className="h-5 w-5 text-gray-600" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
            Earning with Full Custody
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto pt-2 pb-4 text-center">
            Estimate Lightning routing yield, its GAAP treatment, and EPS impact under ASC 350‑60.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 px-4 sm:px-6">
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 rounded-xl shadow-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg mb-3 text-gray-900 leading-relaxed">
                <span className="font-bold text-lg">Earning with Full Custody</span> — Corporate Bitcoin Treasury can earn routing fees through Lightning yield, unlocking income from previously idle assets while maintaining <strong className="font-semibold">full custody</strong> and <strong className="font-semibold">regulatory compliance</strong>.
              </h3>
            </CardContent>
          </Card>

          <div className="pt-3">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqData.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border border-gray-200 rounded-xl px-4 bg-white shadow-sm group">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {faq.icon}
                      </div>
                      <span className="font-semibold text-base text-gray-900">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="border-t border-gray-300 pt-6">
            <Card className="rounded-xl bg-white shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold text-gray-900">Methodology & Assumptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base text-gray-600 p-6 pt-0 leading-relaxed" style={{ lineHeight: '1.5' }}>
                <p>• Model assumes monthly rebalancing to maintain the target Lightning allocation.</p>
                <p>• Yield estimates use historical Lightning Network routing fee data.</p>
                <p>• EPS impact calculated using additional bitcoin yield converted to sats per share.</p>
                <p>• Projections assume stable network growth and adoption.</p>
                <p>• Results are for planning purposes only; actual yields may vary by channel performance and market conditions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
