import React, { useEffect, useState } from 'react';
import {
  Page, Layout, TextField, Button, Card, Modal, TextStyle, Stack, Select, Checkbox, FormLayout
} from '@shopify/polaris';
import useApiRequest from '../hooks/useApiRequest';
import { useAuthenticatedFetch } from '../hooks';
import { useNavigate } from "react-router-dom";

const CreateForm = () => {
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [storeId, setStoreId] = useState('');


  const { responseData, isLoading, error } = useApiRequest("/api/store/info", "GET");

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (responseData) {
      setStoreId(responseData?.data[0]?.id);
    }
  }, [responseData]);

  const fieldTypes = [
    'Text', 'Textarea', 'File', 'Email', 'Password', 'Number', 'Telephone', 'Checkbox',
    'Single checkbox', 'Select', 'Radio', 'Date', 'Time', 'Date time', 'Color', 'Range',
    'URL', 'Ratings', 'Divider', 'Spacer', 'Heading'
  ];

  const handleFormNameChange = (value) => setFormName(value);

  const handleAddField = (fieldType) => {
    const newField = { type: fieldType, label: `New ${fieldType} Field`, size: 'full', required: false, defaultValue: '', placeholder: '', customClass: '', options: '' };
    setFields([...fields, newField]);
    setSelectedField(fields.length);
    setIsAddFieldModalOpen(false);
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    setSelectedField(null);
  };

  const renderFieldSettings = () => {
    if (selectedField === null) return null;
    const field = fields[selectedField];

    return (
      <Card title="Field Settings" sectioned>
        <Stack vertical>
          <TextField
            label="Field label"
            value={field.label}
            onChange={(value) => handleFieldChange(selectedField, 'label', value)}
          />
          <Select
            label="Field Size"
            options={[
              { label: 'One Third', value: 'one-third' },
              { label: 'Half', value: 'half' },
              { label: 'Full', value: 'full' }
            ]}
            value={field.size}
            onChange={(value) => handleFieldChange(selectedField, 'size', value)}
          />
          {['Text', 'Textarea', 'Email', 'Password', 'Number', 'Telephone', 'URL'].includes(field.type) && (
            <>
              <TextField
                label="Field default value"
                value={field.defaultValue}
                onChange={(value) => handleFieldChange(selectedField, 'defaultValue', value)}
              />
              <TextField
                label="Field placeholder"
                value={field.placeholder}
                onChange={(value) => handleFieldChange(selectedField, 'placeholder', value)}
              />
            </>
          )}
          {['Checkbox', 'Single checkbox'].includes(field.type) && (
            <>
              <Checkbox
                label="Checked by default"
                checked={field.defaultValue === 'true'}
                onChange={(value) => handleFieldChange(selectedField, 'defaultValue', value ? 'true' : 'false')}
              />
            </>
          )}
          {field.type === 'Select' && (
            <>
              <TextField
                label="Options (comma separated)"
                value={field.options || ''}
                onChange={(value) => handleFieldChange(selectedField, 'options', value)}
              />
            </>
          )}
          {field.type === 'Radio' && (
            <>
              <TextField
                label="Options (comma separated)"
                value={field.options || ''}
                onChange={(value) => handleFieldChange(selectedField, 'options', value)}
              />
            </>
          )}
          {['Date', 'Time', 'Date time'].includes(field.type) && (
            <>
              <TextField
                label="Field default value"
                value={field.defaultValue}
                onChange={(value) => handleFieldChange(selectedField, 'defaultValue', value)}
                type={field.type === 'Date time' ? 'datetime-local' : field.type.toLowerCase()}
              />
            </>
          )}
          {field.type === 'Color' && (
            <>
              <TextField
                label="Field default value"
                value={field.defaultValue}
                onChange={(value) => handleFieldChange(selectedField, 'defaultValue', value)}
                type="color"
              />
            </>
          )}
          {field.type === 'Range' && (
            <>
              <TextField
                label="Minimum value"
                value={field.min || ''}
                onChange={(value) => handleFieldChange(selectedField, 'min', value)}
                type="number"
              />
              <TextField
                label="Maximum value"
                value={field.max || ''}
                onChange={(value) => handleFieldChange(selectedField, 'max', value)}
                type="number"
              />
            </>
          )}
          {field.type === 'Heading' && (
            <>
              <TextField
                label="Heading Text"
                value={field.label}
                onChange={(value) => handleFieldChange(selectedField, 'label', value)}
              />
            </>
          )}
          {field.type === 'File' && (
            <>
              <TextField
                label="Field placeholder"
                value={field.placeholder}
                onChange={(value) => handleFieldChange(selectedField, 'placeholder', value)}
              />
            </>
          )}
          {field.type === 'Ratings' && (
            <>
              <TextField
                label="Maximum rating value"
                value={field.max || '5'}
                onChange={(value) => handleFieldChange(selectedField, 'max', value)}
                type="number"
              />
            </>
          )}
          <Checkbox
            label="Required field"
            checked={field.required}
            onChange={(value) => handleFieldChange(selectedField, 'required', value)}
          />
          <TextField
            label="Field Custom Class"
            value={field.customClass}
            onChange={(value) => handleFieldChange(selectedField, 'customClass', value)}
          />
          <Stack distribution="center">
            <Button onClick={() => handleRemoveField(selectedField)}>Remove Field</Button>
            <Button onClick={() => setSelectedField(null)}>Close</Button>
          </Stack>
        </Stack>
      </Card>
    );
  };

  const renderPreviewField = (field, index) => {
    const sizeClass = field.size === 'full' ? 'Polaris-FormLayout__Item--fullWidth' :
      field.size === 'half' ? 'Polaris-FormLayout__Item--halfWidth' :
        'Polaris-FormLayout__Item--oneThirdWidth';
  
    switch (field.type) {
      case 'Text':
      case 'Email':
      case 'Password':
      case 'Number':
      case 'Telephone':
      case 'URL':
        return (
          <div key={index} className={sizeClass}>
            <TextField
              label={field.label + (field.required ? ' *' : '')}
              type={field.type.toLowerCase()}
              value={field.defaultValue}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
      case 'Textarea':
        return (
          <div key={index} className={sizeClass}>
            <TextField
              label={field.label + (field.required ? ' *' : '')}
              value={field.defaultValue}
              placeholder={field.placeholder}
              multiline={4}
              required={field.required}
            />
          </div>
        );
      case 'Checkbox':
      case 'Single checkbox':
        return (
          <div key={index} className={sizeClass}>
            <Checkbox
              label={field.label + (field.required ? ' *' : '')}
              checked={field.defaultValue === 'true'}
            />
          </div>
        );
      case 'Select':
        return (
          <div key={index} className={sizeClass}>
            <Select
              label={field.label + (field.required ? ' *' : '')}
              options={field.options.split(',').map(option => ({ label: option.trim(), value: option.trim() }))}
              value={field.defaultValue}
            />
          </div>
        );
      case 'Radio':
        return (
          <div key={index} className={sizeClass}>
            <TextStyle>{field.label + (field.required ? ' *' : '')}</TextStyle>
            {field.options.split(',').map((option, i) => (
              <RadioButton
                key={i}
                label={option.trim()}
                checked={field.defaultValue === option.trim()}
              />
            ))}
          </div>
        );
      case 'Date':
      case 'Time':
      case 'Date time':
        return (
          <div key={index} className={sizeClass}>
            <TextField
              label={field.label + (field.required ? ' *' : '')}
              value={field.defaultValue}
              type={field.type === 'Date time' ? 'datetime-local' : field.type.toLowerCase()}
              required={field.required}
            />
          </div>
        );
      case 'Color':
        return (
          <div key={index} className={sizeClass}>
            <TextField
              label={field.label + (field.required ? ' *' : '')}
              value={field.defaultValue}
              type="color"
              required={field.required}
            />
          </div>
        );
      case 'Range':
        return (
          <div key={index} className={sizeClass}>
            <label>{field.label + (field.required ? ' *' : '')}</label>
            <input
              type="range"
              min={field.min || '0'}
              max={field.max || '100'}
              defaultValue={field.defaultValue}
              className="Polaris-RangeSlider"
              required={field.required}
            />
          </div>
        );
      case 'Heading':
        return (
          <div key={index} className={sizeClass}>
            <h2>{field.label}</h2>
          </div>
        );
      case 'File':
        return (
          <div key={index} className={sizeClass}>
            <TextField
              label={field.label}
              placeholder={field.placeholder}
              type="file"
            />
          </div>
        );
      case 'Ratings':
        return (
          <div key={index} className={sizeClass}>
            <TextField
              label={field.label + ' (Max rating: ' + (field.max || '5') + ')'}
              value={field.defaultValue}
              type="number"
              max={field.max || '5'}
            />
          </div>
        );
      default:
        return (
          <div key={index} className={sizeClass}>
            <TextStyle>Unsupported field type: {field.type}</TextStyle>
          </div>
        );
    }
  };
  

  const handleSaveForm = async () => {
    try {
      const formId = `form_${Date.now()}`;

      const formData = {
        formId,
        formName,
        fields: fields.map(field => ({
          type: field.type,
          label: field.label,
          size: field.size,
          required: field.required,
          defaultValue: field.defaultValue,
          placeholder: field.placeholder,
          customClass: field.customClass,
          options: field.options || '', // For select fields
        })),
        storeId: storeId 
      };
  
      const response = await fetch('/api/save-form', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the raw response text
        throw new Error(errorText);
      }
  
      const data = await response.json();
      console.log('Form saved successfully:', data);
      navigate("/");
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };
  

  return (
    <Page fullWidth title="Create form">
      <Layout>
        <Layout.Section oneThird>
          <Card title="Form Details" sectioned>
            <TextField
              label="Form Name"
              value={formName}
              onChange={handleFormNameChange}
              autoComplete="off"
            />
          </Card>
          <Card sectioned>
            <Stack distribution='center'>
              <Button onClick={handleSaveForm}>Save Form</Button>
            </Stack>
          </Card>

          <Card title="Form Fields" sectioned>
            {fields.map((field, index) => (
              <Button key={index} onClick={() => setSelectedField(index)} fullWidth>
                {field.label || `${field.type} Field ${index + 1}`}
              </Button>
            ))}
          </Card>
          <Button onClick={() => setIsAddFieldModalOpen(true)} primary fullWidth>Add Field</Button>
          {renderFieldSettings()}
        </Layout.Section>

        <Layout.Section>
          <Card title="Form Preview" sectioned>
            <FormLayout>
              <TextStyle variation="strong">{formName || 'Untitled Form'}</TextStyle>
              {fields.map((field, index) => renderPreviewField(field, index))}
              <Button primary>Submit</Button>
            </FormLayout>
          </Card>
        </Layout.Section>

        <Layout.Section oneThird>
          <Card title="Form Settings" sectioned>
            <Stack vertical>
              <Button>Form settings</Button>
              <Button>After submission action</Button>
              <Button>Form design</Button>
              <Button>Admin email configurations</Button>
              <Button>Customer email configurations</Button>
              <Button>Klaviyo Integration</Button>
              <Button>Custom Css</Button>
              <Button>Shopify Customer Integration</Button>
              <Button>Analytics Event Tracking</Button>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        title="Add New Field"
      >
        <Modal.Section>
          <Stack horizontal>
            {fieldTypes.map((type) => (
              <Button key={type} onClick={() => handleAddField(type)}>{type}</Button>
            ))}
          </Stack>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default CreateForm;
