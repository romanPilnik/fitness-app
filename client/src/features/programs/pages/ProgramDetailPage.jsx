import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { programService } from '@/services';

export default function ProgramDetailPage() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProgram() {
      try {
        setError(null);
        const program = await programService.getById(id);
        setProgram(program);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgram();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!program) return <div>Program not found</div>;

  return (
    <div>
      <h2>{program.name}</h2>
      <p>{program.description}</p>
      <h3>Workouts:</h3>
      <ul>
        {program.workouts.map((workout, index) => (
          <li key={index}>
            <h4>
              Day: {workout.dayNumber} - {workout.name}
            </h4>
            {workout.exercises.map((exercise) => (
              <ul key={exercise.exerciseId._id}>
                {exercise.exerciseId.name} {exercise.targetSets}X{exercise.targetReps}
              </ul>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
