import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProjectsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-white/95 backdrop-blur-sm py-5'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 z-50">
            <div className="w-10 h-10 bg-brand-navy flex items-center justify-center rounded-sm">
              <span className="text-brand-gold font-bold text-xl">SVI</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold tracking-tight leading-none text-brand-navy">SVI INFRA SOLUTIONS</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Pvt. Ltd. — Since 2009</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-brand-gold ${
                  location.pathname === link.path ? 'text-brand-gold' : 'text-brand-navy'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Projects Dropdown */}
            <div
              className="relative group cursor-pointer py-2"
              onMouseEnter={() => setIsProjectsOpen(true)}
              onMouseLeave={() => setIsProjectsOpen(false)}
            >
              <span
                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors hover:text-brand-gold ${
                  location.pathname.includes('/projects') ? 'text-brand-gold' : 'text-brand-navy'
                }`}
              >
                Projects <ChevronDown size={16} />
              </span>
              
              <AnimatePresence>
                {isProjectsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-sm overflow-hidden border border-gray-100"
                  >
                    <Link
                      to="/projects/current"
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-navy hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    >
                      Current Projects
                    </Link>
                    <Link
                      to="/projects/completed"
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-navy hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    >
                      Completed Projects
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/contact"
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-brand-gold ${
                location.pathname === '/contact' ? 'text-brand-gold' : 'text-brand-navy'
              }`}
            >
              Contact
            </Link>

            <Link
              to="/registration"
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider border border-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
            >
              Register Now
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 text-brand-navy p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 top-0 bg-white z-40 md:hidden overflow-y-auto pt-24 pb-8 px-6"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-serif text-brand-navy"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="flex flex-col gap-4">
                <span className="text-2xl font-serif text-brand-navy">Projects</span>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-gold/30">
                  <Link
                    to="/projects/current"
                    className="text-lg text-gray-600 hover:text-brand-gold"
                  >
                    Current Projects
                  </Link>
                  <Link
                    to="/projects/completed"
                    className="text-lg text-gray-600 hover:text-brand-gold"
                  >
                    Completed Projects
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className="text-2xl font-serif text-brand-navy"
              >
                Contact Us
              </Link>
              
              <div className="mt-8">
                <Link
                  to="/registration"
                  className="inline-block w-full text-center bg-brand-navy text-white text-lg font-semibold px-6 py-4 rounded-md"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
