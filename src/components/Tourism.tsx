import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Tourism() {
  const destinations = [
    {
      title: "Danajon Bank",
      category: "Double Barrier Reef",
      description: "One of only six double barrier reefs in the world.",
      image: "https://scontent.fceb8-1.fna.fbcdn.net/v/t39.30808-6/515210121_1160056812829592_2860987244901239199_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeGKlbFLpI91Umq89OhLdQZIC0eTEzBI_McLR5MTMEj8x_LA7351Kwmy3VsRio7QBOrXYdzLEqVB-Dn6FYh462lc&_nc_ohc=mPfZXpqq_44Q7kNvwFw1_2x&_nc_oc=AdoSqK_dwueE1mFUgTmbUmq1Lkm3jhFHbf9rWIWiWBWHtt_RShtK1FFAWha6sBi53j0&_nc_zt=23&_nc_ht=scontent.fceb8-1.fna&_nc_gid=BZzd4547digyOqAp-MBQ4A&_nc_ss=7a3a8&oh=00_Af3KotQ-zSQYKX0_MFgTR69n7tr2J15UstgFynEpTO4nbA&oe=69D8E182",
      href: "/tourism/spots"
    },
    {
      title: "Holy Trinity",
      category: "Historical Site",
      description: "A beautiful landmark of faith and history.",
      image: "https://scontent.fceb8-1.fna.fbcdn.net/v/t39.30808-6/667740534_1277647481168991_7857431279534299933_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=dd6889&_nc_eui2=AeHT1FEMpH6CbscAmAQK7NNmXtnW4m4vNIFe2dbibi80gUJ7zeWxxgH-d5SdWb5h5TAa_JeABEjpa1KmwVWX8MeT&_nc_ohc=aSKHGoSOdIwQ7kNvwFoCV-p&_nc_oc=AdowBLU6SqSMhGXtnJegRHGSw3C3vlGZ_e7nRZS3i-iUj30RQmC3GmM5_Mza9m-bvCQ&_nc_zt=23&_nc_ht=scontent.fceb8-1.fna&_nc_gid=zVwSwzZ9Yd_AU34sTYlfkw&_nc_ss=7a3a8&oh=00_Af2YHp2-giTY8FpmLqnEf1IRSOR4EkRQwpSjXflAWU6sbg&oe=69D90688",
      href: "/tourism/spots"
    },
    {
      title: "Sandbars",
      category: "Nature & Beach",
      description: "Explore the pristine islands scattered across the bank.",
      image: "https://scontent.fceb8-1.fna.fbcdn.net/v/t39.30808-6/515210121_1160056812829592_2860987244901239199_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeGKlbFLpI91Umq89OhLdQZIC0eTEzBI_McLR5MTMEj8x_LA7351Kwmy3VsRio7QBOrXYdzLEqVB-Dn6FYh462lc&_nc_ohc=mPfZXpqq_44Q7kNvwFw1_2x&_nc_oc=AdoSqK_dwueE1mFUgTmbUmq1Lkm3jhFHbf9rWIWiWBWHtt_RShtK1FFAWha6sBi53j0&_nc_zt=23&_nc_ht=scontent.fceb8-1.fna&_nc_gid=BZzd4547digyOqAp-MBQ4A&_nc_ss=7a3a8&oh=00_Af3KotQ-zSQYKX0_MFgTR69n7tr2J15UstgFynEpTO4nbA&oe=69D8E182",
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


