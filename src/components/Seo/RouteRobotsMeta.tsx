import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const isPrivateRoute = (pathname: string) =>
  pathname === '/login' || pathname === '/admin' || pathname.startsWith('/admin/');

export default function RouteRobotsMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    let robotsMeta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.content = isPrivateRoute(pathname)
      ? 'noindex, nofollow'
      : 'index, follow';
  }, [pathname]);

  return null;
}
