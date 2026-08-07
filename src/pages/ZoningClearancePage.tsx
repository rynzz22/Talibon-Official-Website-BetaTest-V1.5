import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Download, ShieldCheck, CreditCard, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentButton from '../components/PaymentButton';

const ZoningClearancePage: React.FC = () => {
  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2025/10/LC-Application-Form.pdf";

  return (
    <div className="pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Modern Gradient Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-16 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
              Zoning Certificate/Clearances
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-bold uppercase tracking-[0.3em] opacity-80">
              Talibon Municipality – Official Documents
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-20 bg-gray-50/50">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col md:flex-row items-center gap-8 group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                <MapPin className="text-white" size={36} />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
                  LC Application Form
                </h3>
                <p className="text-gray-500 font-medium text-lg">
                  Land classification and zoning clearance application
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link 
                  to="/e-services?service=zoning_clearance"
                  className="px-8 py-5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/10"
                >
                  <Laptop size={18} />
                  File Electronically
                </Link>
                <a 
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-4 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-black text-xs tracking-widest hover:shadow-2xl hover:shadow-indigo-500/30 transition-all group/btn"
                >
                  <Download size={20} className="group-hover/btn:translate-y-0.5 transition-transform" />
                  DOWNLOAD PDF
                </a>
              </div>
            </motion.div>

            {/* Online Payment Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 flex flex-col md:flex-row items-center gap-8 shadow-sm"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <CreditCard className="text-indigo-600" size={36} />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
                  Online Clearing Fee
                </h3>
                <p className="text-gray-500 font-medium">
                  Conveniently pay your zoning clearance fees online.
                </p>
              </div>

              <div className="w-full md:w-72">
                <PaymentButton itemName="Zoning Clearance Fee" amount={300} />
              </div>
            </motion.div>

            {/* Additional Info */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-6 items-start p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Legal Compliance</h4>
                  <p className="text-gray-500 text-sm font-medium">Ensuring all land developments follow the local zoning ordinances and national building codes.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Land Use</h4>
                  <p className="text-gray-500 text-sm font-medium">Proper classification of land for residential, commercial, or industrial purposes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ZoningClearancePage;
