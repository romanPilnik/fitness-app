import { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { Link } from 'react-router-dom';
import { programTemplatesMock } from '../../../mocks/programTemplates.mock';

const USE_MOCK = true;

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setError(null);

        const response = USE_MOCK
          ? programTemplatesMock
          : (await api.get('/api/v1/templates')).data;


        setTemplates(response.data.docs || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (templates.length === 0) return <div>No templates available</div>;

  return (
    <div>
      {templates.map((template) => (
        <div key={template._id}>
          <h3>{template.name}</h3>
          <p>{template.difficulty}</p>
          <Link to={`/templates/${template._id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
}
