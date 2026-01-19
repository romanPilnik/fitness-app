import { useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { useEffect, useState } from 'react';
import { programTemplatesMock } from '../../../mocks/programTemplates.mock';

const USE_MOCK = true;

export default function TemplateDetailsPage() {
  const { id } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [programName, setProgramName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const response = USE_MOCK
          ? (() => {
              // 🔧 CHANGE: select a single template from the list mock by ID
              const found = programTemplatesMock.data.docs.find(
                (t) => t._id === id
              );

              // 🔧 CHANGE: simulate backend 404 behavior
              if (!found) {
                throw new Error('Program template not found');
              }

              // 🔧 CHANGE: shape mock response to match interceptor contract
              return { data: found };
            })()
          : await api.get(`/api/v1/programs/templates/${id}`);

        setTemplate(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!template) return <div>Template not found</div>;
  return (
    <div>
      <h2>
        {template.name} <button onClick={() => setIsCreating(true)}>Customize</button>
      </h2>
      <p>{template.description}</p>
      <p>Difficulty: {template.difficulty}</p>
      <p>Split Type: {template.splitType}</p>
      <p>Days per Week: {template.daysPerWeek}</p>
      <h3>Workouts:</h3>
      <ul>
        {template.workouts.map((workout, index) => (
          <li key={index}>
            <h4>
              Day: {workout.dayNumber} - {workout.name}
            </h4>
            {workout.exercises.map((exercise) => (
              <ul key={exercise.exerciseId}>
                {exercise.exerciseId.name} {exercise.targetSets}X{exercise.targetReps}
              </ul>
            ))}
          </li>
        ))}
      </ul>
      <p>Created By: {template.createdBy}</p>

      {isCreating ? (
        <div>
          <h3>Create Program From Template</h3>
          <input
            type="text"
            placeholder="Program Name"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
          />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <button>Create Program</button>
          <button onClick={() => setIsCreating(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsCreating(true)}>Use This Template</button>
      )}
    </div>
  );
}
