import { Outlet } from 'react-router-dom';

/** Parent for `/sessions/*` under live log — keeps a single `sessions/new` prefix for reorder sub-routes. */
export function LogSessionNewLayout() {
  return <Outlet />;
}
