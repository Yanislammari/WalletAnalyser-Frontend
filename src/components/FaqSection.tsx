import type React from "react";
import type { FaqUI } from "../models/UI/FaqUI";
import FaqItem from "./FaqItem";

const faqs: FaqUI[] = [
  {
    question: "What brokers and file formats are supported?",
    awnser: "WalletAnalyser accepts any CSV or Excel file. We provide a pre-formatted template and a visual example to guide column mapping. If your broker uses a custom export format, you can remap columns manually before importing.",
  },
  {
    question: "What is TWR and why does it matter?",
    awnser: "Time-Weighted Return measures portfolio performance independently of external cash flows — deposits and withdrawals. It's the standard metric used by fund managers to fairly compare performance across periods and portfolios.",
  },
  {
    question: "Can I add a stock that isn't in your database?",
    awnser: "Yes. You can create a custom stock and assign it a sector, country, and concentration. Our team reviews and validates new entries, which then become available to all users.",
  },
  {
    question: "Is my financial data secure?",
    awnser: "Your data is encrypted at rest and in transit. We never share or sell portfolio data. Each user only ever sees their own portfolios.",
  },
  {
    question: "Is there a mobile app?",
    awnser: "The full analytics experience is optimised for web. A mobile app is in development for key metrics and overview — the complete toolkit will remain on web.",
  },
];

const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="relative bg-[#0d0a1a] py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-[0.15em] mb-3">FAQ</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">Common questions</h2>
        </div>
        {faqs.map((faq) => (
          <FaqItem key={faq.question} faq={faq} />
        ))}
      </div>
    </section>
  );
}

export default FaqSection;
