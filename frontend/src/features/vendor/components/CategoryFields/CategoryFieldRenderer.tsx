import React, { useMemo } from 'react';
import { getCategoryConfig, FieldSchema } from './categoryFieldConfigs';
import {
  TextFieldInput,
  TextAreaFieldInput,
  NumberFieldInput,
  SelectFieldInput,
  MultiSelectFieldInput,
  CheckboxFieldInput,
  RadioFieldInput
} from './FieldTypes';

interface CategoryFieldRendererProps {
  categoryId: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export const CategoryFieldRenderer: React.FC<CategoryFieldRendererProps> = ({
  categoryId,
  values,
  onChange,
  errors = {}
}) => {
  const config = useMemo(() => getCategoryConfig(categoryId), [categoryId]);

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value
    });
  };

  // Check if field should be visible based on dependencies
  const isFieldVisible = (field: FieldSchema): boolean => {
    if (!field.dependsOn) return true;
    return !!values[field.dependsOn];
  };

  const renderField = (field: FieldSchema) => {
    if (!isFieldVisible(field)) return null;

    const commonProps = {
      field,
      value: values[field.name],
      onChange: handleFieldChange,
      error: errors[field.name]
    };

    switch (field.type) {
      case 'text':
        return <TextFieldInput {...commonProps} />;
      case 'textarea':
        return <TextAreaFieldInput {...commonProps} />;
      case 'number':
        return <NumberFieldInput {...commonProps} />;
      case 'select':
        return <SelectFieldInput {...commonProps} />;
      case 'multiselect':
        return <MultiSelectFieldInput {...commonProps} />;
      case 'checkbox':
        return <CheckboxFieldInput {...commonProps} />;
      case 'radio':
        return <RadioFieldInput {...commonProps} />;
      default:
        return null;
    }
  };

  if (!config) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Render fields with proper grouping */}
      {config.fields.map((field) => {
        // Skip fields that are dependents (they'll be rendered with their parent)
        if (field.dependsOn) return null;

        // Find dependent fields
        const dependents = config.fields.filter(f => f.dependsOn === field.name);
        
        // If field has dependents or is marked as fullWidth, take full width
        const shouldSpanFull = field.fullWidth || dependents.length > 0;
        
        return (
          <div key={field.name} className={shouldSpanFull ? 'md:col-span-2' : ''}>
            {/* Parent field */}
            {renderField(field)}
            
            {/* Dependent fields - show below parent when parent is checked/filled */}
            {dependents.length > 0 && values[field.name] && (
              <div className="mt-3 pl-6 border-l-2 border-primary/30 space-y-3">
                {dependents.map((depField) => (
                  <div key={depField.name}>
                    {renderField(depField)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
