import { motion } from 'motion/react';
import { Linkedin, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TEAM_MEMBERS = [
  {
    name: "Rajendra Prasad",
    role: "Founder & Managing Director",
    bio: "With over 25 years of experience in real estate development, Rajendra has led SVI Infra to become a trusted name in the industry. His vision drives our commitment to quality and transparency.",
    image: "/images/leadership1.png"
  },
  {
    name: "Vikram Sharma",
    role: "Director of Operations",
    bio: "Vikram oversees all on-ground project executions. His meticulous attention to detail ensures that every SVI Infra project is delivered on time and exceeds quality standards.",
    image: "/images/leadership2.png"
  },
  {
    name: "Priya Desai",
    role: "Head of Customer Relations",
    bio: "Priya believes that buying a home should be a joyful journey. She leads our support teams to ensure every client receives personalized, transparent, and prompt service.",
    image: "/images/leadership3.png"
  }
];

export default function Leadership() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <section className="bg-brand-navy py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6"
          >
            Our Leadership
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Meet the visionaries behind SVI Infra Solutions. Our team is dedicated to building not just structures, but lifelong relationships based on trust and excellence.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
              className="bg-white group overflow-hidden border border-gray-200 hover:-translate-y-2 hover:shadow-2xl transition-all duration-400 flex flex-col"
            >
              <div className="relative h-96 overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-brand-navy/10 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 flex gap-4 justify-center">
                  <a href="#" className="w-10 h-10 rounded-full bg-brand-gold text-brand-navy flex items-center justify-center hover:bg-white transition-colors" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-brand-gold text-brand-navy flex items-center justify-center hover:bg-white transition-colors" aria-label="Email">
                    <Mail size={18} />
                  </a>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow text-center">
                <h3 className="text-2xl font-serif text-brand-navy mb-2">{member.name}</h3>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-6 block">{member.role}</span>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <section className="bg-brand-bg py-20 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-navy mb-6">Join Our Growing Team</h2>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg">
            We are always looking for passionate professionals to join us in shaping the future of real estate.
          </p>
          <Link to="/careers" className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 font-bold uppercase text-xs tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors">
            View Open Positions <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
