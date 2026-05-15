import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import { ThemeProvider } from './components/ThemeProvider';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Projects = lazy(() => import('./pages/Projects'));
const CompletedProjects = lazy(() => import('./pages/CompletedProjects'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Registration = lazy(() => import('./pages/Registration'));
const Contact = lazy(() => import('./pages/Contact'));
const ThankYou = lazy(() => import('./pages/ThankYou'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-gray-900">
    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/projects/current" element={<Projects />} />
              <Route path="/projects/completed" element={<CompletedProjects />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/thank-you" element={<ThankYou />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
