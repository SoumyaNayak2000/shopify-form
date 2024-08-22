import { useState, useEffect } from 'react';
import { Layout, Page, Card as PolarisCard, DataTable, Button, Toast, Frame } from "@shopify/polaris";
import { Card } from "../components/Card";
import { useAuthenticatedFetch } from '../hooks';

export default function HomePage() {
  const [totalForms, setTotalForms] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [formsSubmittedToday, setFormsSubmittedToday] = useState(0);
  const [forms, setForms] = useState([]);
  const [toast, setToast] = useState({ active: false, message: '', error: false });


  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    async function fetchData() {
      try {
        const formCountResult = await fetch('/api/forms/total').then(res => res.json());
        
        setTotalForms(formCountResult?.count);

        const submissionCountResult = await fetch('/api/submissions').then(res => res.json());
        setTotalSubmissions(submissionCountResult.count);

        const todayResult = await fetch('/api/forms/today').then(res => res.json());
        setFormsSubmittedToday(todayResult.count);

        const formsResult = await fetch('/api/forms/details').then(res => res.json());
        setForms(formsResult);

      } catch (error) {
        console.error('Error fetching data:', error);
        setToast({ active: true, message: 'Error fetching data', error: true });
      }
    }
    fetchData();
  }, []);



  const handleEdit = (formId) => {
    console.log('Edit form', formId);
    // Navigate to form edit page or open a modal
  };

  const handleDelete = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      const result = await response.json();

      if (response.ok) {
        setToast({ active: true, message: 'Form deleted successfully', error: false });
        setForms(forms.filter(form => form.formId !== formId));
      } else {
        setToast({ active: true, message: result.message, error: true });
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      setToast({ active: true, message: 'Error deleting form', error: true });
    }
  };

  const rows = forms.map(form => [
    form.formId,
    form.formName,
    form.totalSubmissions,
    <Button onClick={() => handleEdit(form.formId)}>Edit</Button>,
    <Button onClick={() => handleDelete(form.formId)}>Delete</Button>
  ]);

  return (
    <Frame>
      <Page fullWidth>
        <div className="home-section">
          <div className="cards-section">
            <Layout>
              <Card title="Total Forms" count={totalForms} />
              <Card title="Total Submissions" count={totalSubmissions} />
              <Card title="Form Submitted Today" count={formsSubmittedToday} />
            </Layout>
          </div>
          <div className="forms-table">
            <PolarisCard title="Forms Overview" sectioned>
              <DataTable
                columnContentTypes={['text', 'text', 'numeric', 'text', 'text']}
                headings={['Form ID', 'Form Name', 'Total Submissions', 'Edit', 'Delete']}
                rows={rows}
              />
            </PolarisCard>
          </div>
          {toast.active && (
            <Toast content={toast.message} error={toast.error} onDismiss={() => setToast({ active: false })} />
          )}
        </div>
      </Page>
    </Frame>
  );
}
