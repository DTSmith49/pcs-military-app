"use client";

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

function RatingPills({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 flex-wrap">
        {RATINGS.map((r) => (
          <button
            key={r}
            type="button"
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
      <div className="flex justify-between text-xs text-slate-400 px-1">
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
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
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
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s.number
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {step > s.number ? "✓" : s.number}
            </div>
            <span className={`text-xs hidden sm:block ${step >= s.number ? "text-[#1B2A4A] font-medium" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 ${step > s.number ? "bg-[#1B2A4A]" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
export default function ReviewPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<ReviewFormValues>({
    defaultValues: {
      schoolName: "",
      schoolCity: "",
      schoolState: "",
      extraNotes: "",
    },
  });

  const values = watch();

  const onSubmit = async (data: ReviewFormValues) => {
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
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center flex flex-col gap-4">
          <div className="text-5xl">🎖️</div>
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
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="mt-3 text-sm text-[#1B2A4A] underline flex items-center gap-1"
          >
            ℹ️ Privacy & how this works {privacyOpen ? "▲" : "▼"}
          </button>
          {privacyOpen && (
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-slate-600 leading-relaxed">
              Reviews are anonymous. Do not include full names of children or staff,
              medical details, or personally identifying information. Focus on
              experiences that help other families make informed decisions.
            </div>
          )}
        </div>

        <ProgressBar step={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-lg font-bold text-[#1B2A4A]">School Information</h2>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-slate-700">
                    School name <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="text"
                    {...register("schoolName", { required: true })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
                    placeholder="e.g., Smith Elementary School"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-slate-700">City (optional)</div>
                  <input
                    type="text"
                    {...register("schoolCity")}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
                    placeholder="e.g., Rockville"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-slate-700">
                    State <span className="text-red-500">*</span>
                  </div>
                  <select
                    {...register("schoolState", { required: true })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] bg-white"
                  >
                    <option value="">Select a state...</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!values.schoolName || !values.schoolState) {
                      alert("Please enter a school name and state.");
                      return;
                    }
                    setStep(2);
                  }}
                  className="mt-2 w-full bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Next: Enrollment Experience →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Enrollment & Transition Experience</h2>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">
                    Did the school demonstrate familiarity with the Interstate Compact?
                  </div>
                  <p className="text-xs text-slate-400">Covers enrollment, class placement, credit transfer, and activity eligibility after your PCS.</p>
                  <YesNoPills
                    value={values.interstateCompact}
                    onChange={(v) => setValue("interstateCompact", v as ReviewFormValues["interstateCompact"])}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "not_sure", label: "Not sure" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">
                    Is this a Purple Star designated school?
                  </div>
                  <p className="text-xs text-slate-400">Purple Star schools have committed staff training and support for military-connected students.</p>
                  <YesNoPills
                    value={values.purpleStar}
                    onChange={(v) => setValue("purpleStar", v as ReviewFormValues["purpleStar"])}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "not_sure", label: "Not sure" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">
                    If your child has an IEP or 504 plan, was it honored after your PCS?
                  </div>
                  <p className="text-xs text-slate-400">Skip if not applicable to your family.</p>
                  <YesNoPills
                    value={values.iep504Status}
                    onChange={(v) => setValue("iep504Status", v as ReviewFormValues["iep504Status"])}
                    options={[
                      { value: "honored_promptly", label: "Yes, promptly" },
                      { value: "delayed", label: "Eventually" },
                      { value: "not_honored", label: "Not honored" },
                      { value: "not_applicable", label: "N/A" },
                    ]}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-slate-300 text-slate-600 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Next: Ratings →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Rate Your Experience</h2>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">Academic Experience</div>
                  <p className="text-xs text-slate-400">Curriculum alignment, credit transfer, course rigor.</p>
                  <RatingPills value={values.academicExperience} onChange={(v) => setValue("academicExperience", v as ReviewFormValues["academicExperience"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">Community & Belonging</div>
                  <p className="text-xs text-slate-400">How welcomed your child felt from day one.</p>
                  <RatingPills value={values.communityBelonging} onChange={(v) => setValue("communityBelonging", v as ReviewFormValues["communityBelonging"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">Communication & Engagement</div>
                  <p className="text-xs text-slate-400">Teacher responsiveness and family involvement.</p>
                  <RatingPills value={values.communicationEngagement} onChange={(v) => setValue("communicationEngagement", v as ReviewFormValues["communicationEngagement"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">Special Needs Support</div>
                  <p className="text-xs text-slate-400">IEP and 504 plan continuity after a move.</p>
                  <RatingPills value={values.specialNeedsSupport} onChange={(v) => setValue("specialNeedsSupport", v as ReviewFormValues["specialNeedsSupport"])} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-slate-700">Overall Military-Family Fit</div>
                  <p className="text-xs text-slate-400">Overall support for the realities of military life.</p>
                  <RatingPills value={values.overallFit} onChange={(v) => setValue("overallFit", v as ReviewFormValues["overallFit"])} />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border border-slate-300 text-slate-600 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Next: Comments →
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Comments & Submit</h2>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-slate-700">
                    Anything else military families should know?
                  </div>
                  <p className="text-xs text-slate-400 mb-1">
                    Optional. Please avoid names of children or staff, or detailed medical information.
                  </p>
                  <textarea
                    {...register("extraNotes")}
                    rows={5}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
                    placeholder="Share what went well, what was hard, or what you wish you had known before enrolling..."
                  />
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold py-4 rounded-lg text-base transition-colors"
                  >
                    Submit Your Review
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-1">
                    Your review helps the next military family land on their feet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm text-slate-400 underline text-center"
                >
                  ← Back to Ratings
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
