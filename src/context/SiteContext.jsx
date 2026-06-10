import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { get } from '../utils/apiMethods';
import { API } from '../utils/apiPaths';

const SiteContext = createContext({ siteTitle: 'CWFASHION', siteLogo: null });

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  const fetchSettings = useCallback(() => {
    get(API.FOOTER.GET).then(({ data }) => {
      if (data.settings) setSettings(data.settings);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'visible') fetchSettings(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchSettings]);

  const siteTitle = settings?.title || 'CWFASHION';
  const siteLogo = settings?.logo || null;

  return (
    <SiteContext.Provider value={{ siteTitle, siteLogo, settings }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
