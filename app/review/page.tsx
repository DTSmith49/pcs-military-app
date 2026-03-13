"use client";

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

import { useState } from "react";
import { useForm } from "react-hook-form";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY"
];

type ReviewFormValues = {
  schoolName: string;
  schoolCity?: string;
  schoolState: string;
  interstateCompact?: "yes" | "no" | "not_sure";
  purpleStar?: "yes" | "no" | "not_sure";
  iep504Status?: "honored_promptly" | "delayed" | "not_honored" | "not_applicable";
  academicExperience?: "1" | "2" | "3" | "4" | "5";
  communityBelonging?: "1" | "2" | "3" | "4" | "5";
  communicationEngagement?: "1" | "2" | "3" | "4" | "5";
  specialNeedsSupport?: "1" | "2" | "3" | "4" | "5";
  overallFit?: "1" | "2" | "3" | "4" | "5";
  extraNotes?: string;
};

const STEPS = [
  { number: 1, label: "School Info" },
  { number: 2, label: "Enrollment" },
  { number: 3, label: "Ratings" },
  { number: 4, label: "Comments" },
];

const RATINGS = ["1","2","3","4","5"];

function RatingPills({
  value,
  onChange,
  groupLabel,
}: {
  value?: string;
  onChange: (v: string) => void;
  groupLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        role="radiogroup"
        aria-label={groupLabel}
        className="flex gap-2 flex-wrap"
      >
        {RATINGS.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={value === r}
            onClick={() => onChange(r)}
            className={`min-w-[44px] min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              value === r
                ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                : "bg-white text-slate-600 border-slate-300 hover:border-[#1B2A4A]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 px-1" aria-hidden="true">
        <span>Very poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}

function YesNoPills({
  value,
  onChange,
  options,
  groupLabel,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  groupLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="flex gap-2 flex-wrap"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
            value === o.value
              ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
              : "bg-white text-slate-600 border-slate-300 hover:border-[#1B2A4A]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8" aria-label="Form progress">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s.number
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-slate-200 text-slate-400"
              }`}
              aria-current={step === s.number ? "step" : undefined}
            >
              {step > s.number ? "✓" : s.number}
            </div>
            <span className={`text-xs hidden sm:block ${step >= s.number ? "text-[#1B2A4A] font-medium" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 ${step > s.number ? "bg-[#1B2A4A]" : "bg-slate-200"}`} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const [step, setStep] = useState(1);
  const [schoolMode, setSchoolMode] = useState<"existing" | "new">("new");
  const [submitted, setSubmitted] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  // P-02: track submit-in-progress to show loading state and prevent double-submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<ReviewFormValues>({
    defaultValues: {
      schoolName: "",
      schoolCity: "",
      schoolState: "",
      extraNotes: "",
    },
  });

  // P-01: subscribe only to the specific fields used in conditional logic,
  // avoiding a full re-render on every keystroke in unrelated fields.
  const [
    schoolName,
    schoolState,
    interstateCompact,
    purpleStar,
    iep504Status,
    academicExperience,
    communityBelonging,
    communicationEngagement,
    specialNeedsSupport,
    overallFit,
  ] = watch([
    "schoolName",
    "schoolState",
    "interstateCompact",
    "purpleStar",
    "iep504Status",
    "academicExperience",
    "communityBelonging",
    "communicationEngagement",
    "specialNeedsSupport",
    "overallFit",
  ]);

    // When a user picks an existing school, call this to fill the form fields
  function handleExistingSchoolSelect(school: { name: string; state: string; city?: string }) {
    setValue("schoolName", school.name, { shouldValidate: true });
    setValue("schoolState", school.state, { shouldValidate: true });
    if (school.city) {
      setValue("schoolCity", school.city);
    }
  }

  const onSubmit = async (data: ReviewFormValues) => {
    // P-02: set loading state before fetch, always clear it after
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        alert("There was a problem saving your review. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("There was a network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center flex flex-col gap-4">
          <span role="img" aria-label="Military medal" className="text-5xl">🎖️</span>
          <h2 className="text-2xl font-bold text-[#1B2A4A]">Thank you for your review.</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your experience helps other military families make better decisions
            during one of the most stressful parts of a PCS move.
          </p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setStep(1); }}
            className="mt-2 text-sm text-[#1B2A4A] underline"
          >
            Submit another review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B2A4A]">Write a School Review</h1>
          <p className="text-slate-500 text-sm mt-1">
            Help military families find schools that truly support their kids.
          </p>
          <button
            type="button"
            aria-expanded={privacyOpen}
            aria-controls="privacy-notice"
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="mt-3 text-sm text-[#1B2A4A] underline flex items-center gap-1"
          >
            <span role="img" aria-label="Information" className="not-italic">ℹ️</span>
            Privacy &amp; how this works {privacyOpen ? "▲" : "▼"}
          </button>
          {privacyOpen && (
            <div
              id="privacy-notice"
              role="region"
              aria-label="Privacy notice"
              className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-slate-600 leading-relaxed"
            >
              Reviews are anonymous. Do not include full names of children or staff,
              medical details, or personally identifying information. Focus on
              experiences that help other families make informed decisions.
            </div>
          )}
        </div>

        <ProgressBar step={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {step === 1 && (
  <div className="flex flex-col gap-5">
    <h2 className="text-lg font-bold text-[#1B2A4A]">School Information</h2>

    {/* Toggle: existing vs new */}
    <div className="flex gap-2 text-sm">
      <button
        type="button"
        onClick={() => setSchoolMode("existing")}
        className={`flex-1 rounded-lg border px-3 py-2 font-medium ${
          schoolMode === "existing"
            ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
            : "bg-slate-50 text-slate-700 border-slate-300"
        }`}
      >
        Choose existing school
      </button>
      <button
        type="button"
        onClick={() => setSchoolMode("new")}
        className={`flex-1 rounded-lg border px-3 py-2 font-medium ${
          schoolMode === "new"
            ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
            : "bg-slate-50 text-slate-700 border-slate-300"
        }`}
      >
        Add a new school
      </button>
    </div>

    {schoolMode === "existing" ? (
      <>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="existingSchool"
            className="text-sm font-medium text-slate-700"
          >
            Search for your school
          </label>
          <input
            id="existingSchool"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
            placeholder="Start typing a school name, city, or state… (directory search coming soon)"
            disabled
          />
          <p className="text-xs text-slate-500 mt-1">
            Directory search will be wired up after this step is connected to
            your schools database. For now, use “Add a new school” to continue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            alert(
              "School directory search is not hooked up yet. Please use “Add a new school” to continue this review."
            );
          }}
          className="mt-2 w-full bg-slate-200 text-slate-600 font-semibold py-3 rounded-lg cursor-not-allowed"
        >
          Next: Enrollment Experience →
        </button>
      </>
    ) : (
      <>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="schoolName"
            className="text-sm font-medium text-slate-700"
          >
            School name <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="schoolName"
            type="text"
            {...register("schoolName", { required: true })}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
            placeholder="e.g., Smith Elementary School"
            aria-required="true"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="schoolCity"
            className="text-sm font-medium text-slate-700"
          >
            City (optional)
          </label>
          <input
            id="schoolCity"
            type="text"
            {...register("schoolCity")}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
            placeholder="e.g., Rockville"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="schoolState"
            className="text-sm font-medium text-slate-700"
          >
            State <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <select
            id="schoolState"
            {...register("schoolState", { required: true })}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] bg-white"
            aria-required="true"
          >
            <option value="">Select a state...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!schoolName || !schoolState) {
              alert("Please enter a school name and state.");
              return;
            }
            setStep(2);
          }}
          className="mt-2 w-full bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Next: Enrollment Experience →
        </button>
      </>
    )}
  </div>
)}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Enrollment &amp; Transition Experience</h2>
                <div className="flex flex-col gap-2">
                  <p id="compact-label" className="text-sm font-medium text-slate-700">
                    Did the school demonstrate familiarity with the Interstate Compact?
                  </p>
                  <p className="text-xs text-slate-500">Covers enrollment, class placement, credit transfer, and activity eligibility after your PCS.</p>
                  <YesNoPills
                    value={interstateCompact}
                    onChange={(v) => setValue("interstateCompact", v as ReviewFormValues["interstateCompact"])}
                    groupLabel="Interstate Compact familiarity"
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "not_sure", label: "Not sure" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p id="purple-star-label" className="text-sm font-medium text-slate-700">
                    Is this a Purple Star designated school?
                  </p>
                  <p className="text-xs text-slate-500">Purple Star schools have committed staff training and support for military-connected students.</p>
                  <YesNoPills
                    value={purpleStar}
                    onChange={(v) => setValue("purpleStar", v as ReviewFormValues["purpleStar"])}
                    groupLabel="Purple Star designation"
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "not_sure", label: "Not sure" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p id="iep-label" className="text-sm font-medium text-slate-700">
                    If your child has an IEP or 504 plan, was it honored after your PCS?
                  </p>
                  <p className="text-xs text-slate-500">Skip if not applicable to your family.</p>
                  <YesNoPills
                    value={iep504Status}
                    onChange={(v) => setValue("iep504Status", v as ReviewFormValues["iep504Status"])}
                    groupLabel="IEP or 504 plan outcome"
                    options={[
                      { value: "honored_promptly", label: "Yes, promptly" },
                      { value: "delayed", label: "Eventually" },
                      { value: "not_honored", label: "Not honored" },
                      { value: "not_applicable", label: "N/A" },
                    ]}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-slate-300 text-slate-600 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors">← Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-1 bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold py-3 rounded-lg transition-colors">Next: Ratings →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Rate Your Experience</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">Academic Experience</p>
                  <p className="text-xs text-slate-500">Curriculum alignment, credit transfer, course rigor.</p>
                  <RatingPills groupLabel="Academic Experience rating" value={academicExperience} onChange={(v) => setValue("academicExperience", v as ReviewFormValues["academicExperience"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">Community &amp; Belonging</p>
                  <p className="text-xs text-slate-500">How welcomed your child felt from day one.</p>
                  <RatingPills groupLabel="Community and Belonging rating" value={communityBelonging} onChange={(v) => setValue("communityBelonging", v as ReviewFormValues["communityBelonging"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">Communication &amp; Engagement</p>
                  <p className="text-xs text-slate-500">Teacher responsiveness and family involvement.</p>
                  <RatingPills groupLabel="Communication and Engagement rating" value={communicationEngagement} onChange={(v) => setValue("communicationEngagement", v as ReviewFormValues["communicationEngagement"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">Special Needs Support</p>
                  <p className="text-xs text-slate-500">IEP and 504 plan continuity after a move.</p>
                  <RatingPills groupLabel="Special Needs Support rating" value={specialNeedsSupport} onChange={(v) => setValue("specialNeedsSupport", v as ReviewFormValues["specialNeedsSupport"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">Overall Military-Family Fit</p>
                  <p className="text-xs text-slate-500">Overall support for the realities of military life.</p>
                  <RatingPills groupLabel="Overall Military-Family Fit rating" value={overallFit} onChange={(v) => setValue("overallFit", v as ReviewFormValues["overallFit"])} />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 border border-slate-300 text-slate-600 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors">← Back</button>
                  <button type="button" onClick={() => setStep(4)} className="flex-1 bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold py-3 rounded-lg transition-colors">Next: Comments →</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Comments &amp; Submit</h2>
                <div className="flex flex-col gap-1">
                  <label htmlFor="extraNotes" className="text-sm font-medium text-slate-700">
                    Anything else military families should know?
                  </label>
                  <p className="text-xs text-slate-500 mb-1">
                    Optional. Please avoid names of children or staff, or detailed medical information.
                  </p>
                  <textarea
                    id="extraNotes"
                    {...register("extraNotes")}
                    rows={5}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
                    placeholder="Share what went well, what was hard, or what you wish you had known before enrolling..."
                  />
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  {/* P-02: disabled + spinner while submitting to prevent double-submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#E8A020] hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#1B2A4A] font-bold py-4 rounded-lg text-base transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-[#1B2A4A]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Submitting…</span>
                      </>
                    ) : (
                      "Submit Your Review"
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-1">
                    Your review helps the next military family land on their feet.
                  </p>
                </div>
                <button type="button" onClick={() => setStep(3)} className="text-sm text-slate-500 underline text-center">← Back to Ratings</button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
