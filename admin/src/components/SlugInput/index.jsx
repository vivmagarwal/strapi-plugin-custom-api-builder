import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, Field, FieldLabel, FieldInput, FieldHint, FieldError, Stack, Button, Flex } from '@strapi/design-system';
import { Refresh, Check, Cross } from '@strapi/icons';
import { generateSlug, validateSlug, checkSlugUniqueness, generateUniqueSlug } from '../../utils/slugUtils';
import { debounce } from '../../../../../utils/lodash-wrapper.js';

const SlugInput = ({ 
  name, 
  value, 
  onChange, 
  label, 
  placeholder, 
  hint, 
  required = false,
  sourceName = '',
  autoGenerate = true,
  excludeId = null
}) => {
  const [slugValue, setSlugValue] = useState(value || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationState, setValidationState] = useState({
    isValid: true,
    isUnique: true,
    errors: [],
    uniquenessError: null
  });

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce(async (slug) => {
      if (!slug) {
        setValidationState({
          isValid: true,
          isUnique: true,
          errors: [],
          uniquenessError: null
        });
        setIsValidating(false);
        return;
      }

      setIsValidating(true);

      // Format validation
      const formatValidation = validateSlug(slug);
      
      // Uniqueness validation
      let uniquenessValidation = { isUnique: true, error: null };
      if (formatValidation.isValid) {
        uniquenessValidation = await checkSlugUniqueness(slug, excludeId);
      }

      setValidationState({
        isValid: formatValidation.isValid,
        isUnique: uniquenessValidation.isUnique,
        errors: formatValidation.errors,
        uniquenessError: uniquenessValidation.error
      });

      setIsValidating(false);
    }, 500),
    [excludeId]
  );

  // Auto-generate slug from source name
  useEffect(() => {
    if (autoGenerate && sourceName && !slugValue) {
      const generatedSlug = generateSlug(sourceName);
      setSlugValue(generatedSlug);
      onChange(generatedSlug);
    }
  }, [sourceName, autoGenerate, slugValue, onChange]);

  // Update slug value when prop changes
  useEffect(() => {
    if (value !== slugValue) {
      setSlugValue(value || '');
    }
  }, [value]);

  // Validate slug when it changes
  useEffect(() => {
    debouncedValidate(slugValue);
  }, [slugValue, debouncedValidate]);

  const handleSlugChange = (e) => {
    const newSlug = e.target.value;
    setSlugValue(newSlug);
    onChange(newSlug);
  };

  const handleGenerateSlug = async () => {
    if (!sourceName) return;

    setIsGenerating(true);
    try {
      const uniqueSlug = await generateUniqueSlug(sourceName, excludeId);
      setSlugValue(uniqueSlug);
      onChange(uniqueSlug);
    } catch (error) {
      console.error('Error generating slug:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) return null;
    if (!slugValue) return null;
    
    const hasErrors = !validationState.isValid || !validationState.isUnique;
    return hasErrors ? <Cross /> : <Check />;
  };

  const getValidationColor = () => {
    if (isValidating || !slugValue) return undefined;
    
    const hasErrors = !validationState.isValid || !validationState.isUnique;
    return hasErrors ? 'danger600' : 'success600';
  };

  const getAllErrors = () => {
    const allErrors = [...validationState.errors];
    
    if (!validationState.isUnique) {
      allErrors.push('This slug is already in use. Please choose a different one.');
    }
    
    if (validationState.uniquenessError) {
      allErrors.push(validationState.uniquenessError);
    }
    
    return allErrors;
  };

  const hasErrors = !validationState.isValid || !validationState.isUnique;
  const allErrors = getAllErrors();

  return (
    <Field name={name} error={hasErrors ? allErrors[0] : undefined}>
      <Stack spacing={1}>
        <Flex justifyContent="space-between" alignItems="center">
          <FieldLabel required={required}>{label}</FieldLabel>
          {autoGenerate && sourceName && (
            <Button
              type="button"
              variant="tertiary"
              size="S"
              startIcon={<Refresh />}
              onClick={handleGenerateSlug}
              loading={isGenerating}
              disabled={!sourceName}
            >
              Generate
            </Button>
          )}
        </Flex>
        
        <FieldInput>
          <TextInput
            name={name}
            placeholder={placeholder}
            value={slugValue}
            onChange={handleSlugChange}
            error={hasErrors}
            endAction={getValidationIcon()}
          />
        </FieldInput>

        {hint && <FieldHint>{hint}</FieldHint>}
        
        {slugValue && (
          <FieldHint>
            Your API will be available at: <code>/api/custom-api/{slugValue}</code>
          </FieldHint>
        )}

        {isValidating && (
          <FieldHint>Validating slug...</FieldHint>
        )}

        {hasErrors && allErrors.length > 0 && (
          <FieldError>
            <Stack spacing={1}>
              {allErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Stack>
          </FieldError>
        )}
      </Stack>
    </Field>
  );
};

export default SlugInput;