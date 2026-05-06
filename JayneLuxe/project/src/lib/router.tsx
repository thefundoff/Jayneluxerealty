import { useState, useEffect, ReactNode } from 'react';

export type Route = 'home' | 'property' | 'properties' | 'contact' | 'admin' | 'about';

export interface RouteParams {
  propertyId?: string;
}

export const useRouter = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [params, setParams] = useState<RouteParams>({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (!hash || hash === '/') {
        setCurrentRoute('home');
        setParams({});
      } else if (hash.startsWith('/property/')) {
        const propertyId = hash.split('/')[2];
        setCurrentRoute('property');
        setParams({ propertyId });
      } else if (hash === '/properties') {
        setCurrentRoute('properties');
        setParams({});
      } else if (hash === '/contact') {
        setCurrentRoute('contact');
        setParams({});
      } else if (hash === '/admin') {
        setCurrentRoute('admin');
        setParams({});
      } else if (hash === '/about') {
        setCurrentRoute('about');
        setParams({});
      }

      window.scrollTo(0, 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
  };

  return { currentRoute, params, navigate };
};

interface RouterProps {
  route: Route;
  children: Record<Route, ReactNode>;
}

export const Router = ({ route, children }: RouterProps) => {
  return <>{children[route]}</>;
};
