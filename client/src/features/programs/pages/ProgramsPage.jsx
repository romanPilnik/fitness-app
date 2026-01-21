import { useState, useEffect } from 'react';
import { programService } from '@/services';
import { Link } from 'react-router-dom';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setError(null);
        const programs = await programService.getAll();
        setPrograms(programs);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (programs.length === 0) return <div>No programs available</div>;

  return (
    <div>
      {programs.map((program) => (
        <div key={program._id}>
          <h3>{program.name}</h3>
          <p>{program.description}</p>
          <Link to={`/programs/${program._id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
}
