import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div>
      <h2>404 Error</h2>
      <p>Oops the page you're looking for does not exist</p>
      <Link to="/">Take me home</Link>
    </div>
  );
}
