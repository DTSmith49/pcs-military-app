// app/survey/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { militarySchoolSurvey } from "../config/militarySchoolSurvey";

type FormValues = Record<string, any>;

export default function SurveyPage() {
  const { sections, title } = militarySchoolSurvey;
  const [step, setStep] = useState(0);
  const isLastStep = step === sections.length - 1;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormValues>();

  const currentSection = sections[step];

  const onSubmit = (data: FormValues) => {
    if (!isLastStep) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
      return;
    }
    // For now, just log the data so you can see it works
    console.log("Survey submitted:", data);
    alert("Thank you for your review! (This is a test; nothing was saved yet.)");
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo(0, 0);
  };

  const values = watch();

  const shouldShowField = (fieldId: string): boolean => {
    const field = currentSection.fields.find((f) => f.id === fieldId);
    if (!field) return true;
    if (!field.conditional) return true;
    const { field: dependsOn, value } = field.conditional;
    return values[dependsOn] === value;
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-sm text-gray-600 mb-6">
        Step {step + 1} of {sections.length}: {currentSection.title}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {currentSection.fields.map((field) => {
          if (!shouldShowField(field.id)) return null;

          const error = errors[field.id];
          const commonProps = {
            id: field.id,
            ...register(field.id, { required: field.required ? "This field is required." : false })
          };

          return (
            <div key={field.id} className="space-y-1">
              <label htmlFor={field.id} className="block font-medium">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>

              {/* Simple input rendering by type */}
              {field.type === "single_select" && field.options && (
                <select
                  {...commonProps}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {(field.type === "likert_5" || field.type === "likert_5_agreement") &&
                field.scale_labels && (
                  <div className="mt-1 space-y-1">
                    {field.scale_labels.map((label, index) => {
                      const value = index + 1;
                      return (
                        <label key={label} className="flex items-center gap-2">
                          <input
                            type="radio"
                            value={value}
                            {...register(field.id, {
                              required: field.required ? "This field is required." : false
                            })}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

              {field.type === "numeric_scale" && (
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  {...commonProps}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              )}

              {field.type === "long_text" && (
                <textarea
                  {...commonProps}
                  rows={4}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              )}

              {field.type === "short_text" && (
                <input
                  type="text"
                  {...commonProps}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              )}

              {field.type === "email" && (
                <input
                  type="email"
                  {...commonProps}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              )}

              {field.type === "checkbox" && (
                <div className="mt-1 flex items-center gap-2">
                  <input type="checkbox" {...commonProps} />
                </div>
              )}

              {field.type === "school_search" && (
                <input
                  type="text"
                  placeholder="Start typing the school name"
                  {...commonProps}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
                // Later you can replace this with an autocomplete tied to your Schools table
              )}

              {error && (
                <p className="text-sm text-red-600">{(error as any).message}</p>
              )}
            </div>
          );
        })}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isLastStep ? "Submit review" : "Next"}
          </button>
        </div>
      </form>
    </main>
  );
}