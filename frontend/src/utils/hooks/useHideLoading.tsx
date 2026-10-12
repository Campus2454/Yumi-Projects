import { useEffect } from 'react';

export function useHideLoading() {
  const hideLoading = () => {
    setTimeout(() => {
      const preLoaderBar = document.getElementById('PreLoaderBar');
      console.log(document.readyState);
      if (document.readyState === 'complete' && preLoaderBar) {
        preLoaderBar.style.display = 'none';
      };
    }, 2000);
  };
  
  const handleVisibilityChange = () => {
    if(document.visibilityState === 'visible'){
      if(document.readyState === 'complete'){
        console.log('reloading...');
        window.location.reload();
      };
    };
  };
  
  hideLoading();
  if (typeof window !== 'undefined') {
    window.addEventListener('load', hideLoading);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('load', hideLoading);
    }
  };
};
