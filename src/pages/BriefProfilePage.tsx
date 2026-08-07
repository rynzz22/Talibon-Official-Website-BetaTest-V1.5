import BriefProfile from "../components/BriefProfile";
import { motion } from "motion/react";

export default function BriefProfilePage() {
  return (
    <div className="pt-6 pb-20 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <BriefProfile />
      </motion.div>
    </div>
  );
}
