import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Tourism() {
  const destinations = [
    {
      title: "Danajon Bank",
      category: "Double Barrier Reef",
      description: "One of only six double barrier reefs in the world.",
      image: "/images/danajon_bank.jpg",
      href: "/tourism/spots"
    },
    {
      title: "Holy Trinity",
      category: "Historical Site",
      description: "A beautiful landmark of faith and history.",
      image: "/images/holy_trinity.jpg",
      href: "/tourism/spots"
    },
    {
      title: "Sandbars",
      category: "Nature & Beach",
      description: "Explore the pristine islands scattered across the bank.",
      image: "/images/sandbars.jpg",
      href: "/tourism/spots"
    },
  ];

  return (
    <section id="tourism" className="py-32 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-32">
          <div className="max-w-2xl">
            <span className="section-label">Explore Talibon</span>
            <h2 className="section-title">Beyond the Horizon</h2>
          </div>
          <p className="text-brand-muted font-normal text-base max-w-sm leading-relaxed mb-4">
            Discover the unique biodiversity of the Danajon Bank and the vibrant cultural heritage of northern Bohol.
          </p>
        </div>

        <div className="space-y-32">
          {destinations.map((spot, idx) => (
            <motion.div
              key={spot.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
            >
              <div className="flex-1 relative group">
                <div className="aspect-[16/9] overflow-hidden rounded-[3rem] shadow-2xl">
                  <img 
                    src={spot.image} 
                    alt={spot.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Floating Number */}
                <span className="absolute -top-12 -left-12 text-[12rem] font-extrabold text-brand-primary/5 select-none pointer-events-none font-display">
                  0{idx + 1}
                </span>
              </div>

              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.4em]">{spot.category}</span>
                  <h3 className="text-3xl md:text-4xl font-semibold text-brand-text tracking-tight font-display uppercase">{spot.title}</h3>
                </div>
                <p className="text-base text-brand-muted font-normal leading-relaxed max-w-md">
                  {spot.description}
                </p>
                <Link 
                  to={spot.href}
                  className="minimal-button-outline inline-flex"
                >
                  Explore Destination <ArrowUpRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-44 text-center">
          <Link 
            to="/tourism/spots"
            className="minimal-button-primary inline-flex"
          >
            View All Destinations
          </Link>
        </div>
      </div>
    </section>
  );
}


