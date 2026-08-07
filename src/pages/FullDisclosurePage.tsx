import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

const FullDisclosurePage: React.FC = () => {
  const imageUrl = "https://talibon.gov.ph/wp-content/themes/yootheme/cache/e8/RegistrationCert_page-0001-e8213d59.webp";

  return (
    <div className="pt-8 pb-12 px-4 md:px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Transparency & Accountability Policy
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight leading-none font-display">
            Full Disclosure
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 uppercase tracking-tight font-display">Official Certification</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Registration and Compliance Certificate for the Municipality of Talibon.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-xs"
                >
                  <ExternalLink size={15} />
                  VIEW FULL IMAGE
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex justify-center bg-white">
            <div className="relative group max-w-md w-full">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              <img 
                src={imageUrl} 
                alt="Full Disclosure Policy Registration Certificate" 
                className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-gray-100 mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight font-display">About the Policy</h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              The Full Disclosure Policy (FDP) requires local government units to fully disclose particular financial transactions to keep their constituents informed of how the local budget is managed, disbursed and used.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              This promotes honest and efficient governance by allowing citizens to monitor the LGU's financial performance and infrastructure projects.
            </p>
          </div>
          
          <div className="bg-blue-600 rounded-xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight mb-3 relative z-10 font-display">Our Commitment</h3>
            <ul className="space-y-2.5 relative z-10">
              {[
                "Regular financial reporting",
                "Public access to procurement data",
                "Open communication on projects",
                "Strict adherence to DILG guidelines"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-blue-50">
                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FullDisclosurePage;
