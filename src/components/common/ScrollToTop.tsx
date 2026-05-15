import { memo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = memo(function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
});

export default ScrollToTop;
