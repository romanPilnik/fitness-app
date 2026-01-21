import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService, programService } from '@/services';

export default function TemplateDetailsPage() {
  const { id } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [programName, setProgramName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const navigate = useNavigate();

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const program = await programService.createFromTemplate(template._id, startDate, {
        name: programName,
      });
      navigate(`/programs/${program._id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setError(null);
        const template = await templateService.getById(id);
        setTemplate(template);
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
              <ul key={exercise.exerciseId._id}>
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
          <button disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Creating...' : 'Create'}
          </button>
          {submitError && <div className="error">{submitError}</div>}
          <button onClick={() => setIsCreating(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsCreating(true)}>Use This Template</button>
      )}
    </div>
  );
}
