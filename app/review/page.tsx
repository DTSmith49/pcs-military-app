// app/review/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Tooltip } from "@/components/Tooltip";
import { tooltips } from "@/content/siteCopy";

type ReviewFormValues = {
  schoolName: string;
  schoolCity?: string;
  schoolState: string;

  interstateCompact?: "yes" | "no" | "not_sure";
  purpleStar?: "yes" | "no" | "not_sure";
  iep504Status?:
    | "honored_promptly"
    | "delayed"
    | "not_honored"
    | "not_applicable";
  academicExperience?: "1" | "2" | "3" | "4" | "5";
  communityBelonging?: "1" | "2" | "3" | "4" | "5";
  communicationEngagement?: "1" | "2" | "3" | "4" | "5";
  specialNeedsSupport?: "1" | "2" | "3" | "4" | "5";
  overallFit?: "1" | "2" | "3" | "4" | "5";
  extraNotes?: string;
};

export default function ReviewPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch } = useForm<ReviewFormValues>({
    defaultValues: {
      schoolName: "",
      schoolCity: "",
      schoolState: "",

      interstateCompact: undefined,
      purpleStar: undefined,
      iep504Status: undefined,
      academicExperience: undefined,
      communityBelonging: undefined,
      communicationEngagement: undefined,
      specialNeedsSupport: undefined,
      overallFit: undefined,
      extraNotes: "",
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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

  const selectedInterstate = watch("interstateCompact");
  const selectedPurpleStar = watch("purpleStar");
  const selectedIep504 = watch("iep504Status");
  const selectedAcademic = watch("academicExperience");
  const selectedCommunity = watch("communityBelonging");
  const selectedCommunication = watch("communicationEngagement");
  const selectedSpecialNeeds = watch("specialNeedsSupport");
  const selectedOverallFit = watch("overallFit");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Share your experience with a school
      </h1>

      <PrivacyNotice />

      {submitted ? (
        <section className="space-y-3 rounded border border-green-200 bg-green-50 p-4 text-sm text-slate-800">
          <h2 className="text-lg font-semibold">Thank you for sharing.</h2>
          <p>
            Your responses help other military families see how this school
            handles PCS moves, mid-year enrollments, and the needs of
            military-connected students.
          </p>
          <p>
            You can close this page, or{" "}
            <button
              type="button"
              className="underline text-blue-700"
              onClick={() => setSubmitted(false)}
            >
              submit another review
            </button>
            .
          </p>
        </section>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* School information */}
          <section className="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-700">
            <h2 className="text-lg font-medium">School information</h2>

            <div className="space-y-1">
              <label className="flex flex-col gap-1">
                <span className="font-medium">School name</span>
                <input
                  type="text"
                  {...register("schoolName", { required: true })}
                  className="w-full rounded border border-slate-300 p-2 text-sm"
                  placeholder="e.g., Smith Elementary School"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="flex flex-col gap-1">
                <span className="font-medium">City (optional)</span>
                <input
                  type="text"
                  {...register("schoolCity")}
                  className="w-full rounded border border-slate-300 p-2 text-sm"
                  placeholder="e.g., Rockville"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="flex flex-col gap-1">
                <span className="font-medium">State</span>
                <input
                  type="text"
                  {...register("schoolState", { required: true })}
                  className="w-32 rounded border border-slate-300 p-2 text-sm"
                  placeholder="e.g., MD"
                />
              </label>
            </div>
          </section>

          {/* Enrollment & transition and ratings */}
          <section className="space-y-4 rounded border border-slate-200 p-4">
            <h2 className="text-lg font-medium">
              Enrollment & transition experience
            </h2>

            {/* Interstate Compact question */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  Did the school demonstrate familiarity with the Interstate
                  Compact on Educational Opportunity for Military Children?{" "}
                  <Tooltip body={tooltips.interstateCompact.body} />
                </span>
                <span className="text-xs text-slate-500">
                  For example, with enrollment, class placement, credit
                  transfer, or eligibility for activities after your PCS.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                <label>
                  <input
                    type="radio"
                    value="yes"
                    {...register("interstateCompact")}
                    className="mr-1"
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    value="no"
                    {...register("interstateCompact")}
                    className="mr-1"
                  />
                  No
                </label>
                <label>
                  <input
                    type="radio"
                    value="not_sure"
                    {...register("interstateCompact")}
                    className="mr-1"
                  />
                  Not sure
                </label>
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedInterstate || "No answer yet"}
              </p>
            </div>

            {/* Purple Star question */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  Is this school recognized as a Purple Star (or similar) school
                  in its state? <Tooltip body={tooltips.purpleStar.body} />
                </span>
                <span className="text-xs text-slate-500">
                  If you know the school has a Purple Star or equivalent
                  designation, choose Yes. If your state does not have this
                  program, it is okay to choose Not sure.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                <label>
                  <input
                    type="radio"
                    value="yes"
                    {...register("purpleStar")}
                    className="mr-1"
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    value="no"
                    {...register("purpleStar")}
                    className="mr-1"
                  />
                  No
                </label>
                <label>
                  <input
                    type="radio"
                    value="not_sure"
                    {...register("purpleStar")}
                    className="mr-1"
                  />
                  Not sure
                </label>
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedPurpleStar || "No answer yet"}
              </p>
            </div>

            {/* IEP / 504 question */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  If your child has an IEP or 504 plan, was it honored promptly
                  after your PCS? <Tooltip body={tooltips.iep504.body} />
                </span>
                <span className="text-xs text-slate-500">
                  If this does not apply to your family, you can skip this
                  question. Please avoid sharing medical details or names in any
                  comments.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                <label>
                  <input
                    type="radio"
                    value="honored_promptly"
                    {...register("iep504Status")}
                    className="mr-1"
                  />
                  Yes, honored promptly
                </label>
                <label>
                  <input
                    type="radio"
                    value="delayed"
                    {...register("iep504Status")}
                    className="mr-1"
                  />
                  Eventually honored, but delayed
                </label>
                <label>
                  <input
                    type="radio"
                    value="not_honored"
                    {...register("iep504Status")}
                    className="mr-1"
                  />
                  No, not honored or significantly changed
                </label>
                <label>
                  <input
                    type="radio"
                    value="not_applicable"
                    {...register("iep504Status")}
                    className="mr-1"
                  />
                  Not applicable
                </label>
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedIep504 || "No answer yet"}
              </p>
            </div>

            {/* Academic experience rating */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  Overall, how would you rate your child&apos;s academic
                  experience at this school during your PCS?
                </span>
                <span className="text-xs text-slate-500">
                  Think about curriculum alignment, credit transfer, course
                  rigor, and access to options like honors, AP, IB, or dual
                  enrollment.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num}>
                    <input
                      type="radio"
                      value={String(num)}
                      {...register("academicExperience")}
                      className="mr-1"
                    />
                    {num} – {num === 1 && "Very poor"}
                    {num === 2 && "Below average"}
                    {num === 3 && "Average"}
                    {num === 4 && "Good"}
                    {num === 5 && "Excellent"}
                  </label>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedAcademic || "No answer yet"}
              </p>
            </div>

            {/* Community & belonging rating */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  How would you rate your child&apos;s sense of community and
                  belonging at this school?
                </span>
                <span className="text-xs text-slate-500">
                  Think about friendships, how welcoming classmates and staff
                  were when you arrived, and access to activities that helped
                  your child plug in.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num}>
                    <input
                      type="radio"
                      value={String(num)}
                      {...register("communityBelonging")}
                      className="mr-1"
                    />
                    {num} – {num === 1 && "Very poor"}
                    {num === 2 && "Below average"}
                    {num === 3 && "Average"}
                    {num === 4 && "Good"}
                    {num === 5 && "Excellent"}
                  </label>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedCommunity || "No answer yet"}
              </p>
            </div>

            {/* Communication & engagement rating */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  How would you rate the school&apos;s communication and
                  engagement with your family during this PCS?
                </span>
                <span className="text-xs text-slate-500">
                  Consider teacher responsiveness, use of parent portals or
                  email, and how informed you felt about your child&apos;s
                  progress and key dates.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num}>
                    <input
                      type="radio"
                      value={String(num)}
                      {...register("communicationEngagement")}
                      className="mr-1"
                    />
                    {num} – {num === 1 && "Very poor"}
                    {num === 2 && "Below average"}
                    {num === 3 && "Average"}
                    {num === 4 && "Good"}
                    {num === 5 && "Excellent"}
                  </label>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedCommunication || "No answer yet"}
              </p>
            </div>

            {/* Special needs & support rating */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  If your child receives special education services or other
                  supports, how would you rate the support they received here?
                </span>
                <span className="text-xs text-slate-500">
                  Think about how quickly services were in place, the quality of
                  support, and how well staff understood your child&apos;s
                  needs. If this does not apply, you can skip this question.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num}>
                    <input
                      type="radio"
                      value={String(num)}
                      {...register("specialNeedsSupport")}
                      className="mr-1"
                    />
                    {num} – {num === 1 && "Very poor"}
                    {num === 2 && "Below average"}
                    {num === 3 && "Average"}
                    {num === 4 && "Good"}
                    {num === 5 && "Excellent"}
                  </label>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedSpecialNeeds || "No answer yet"}
              </p>
            </div>

            {/* Overall military-family fit rating */}
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex flex-col gap-1">
                <span className="font-medium">
                  Overall, how well do you feel this school fit your family&apos;s
                  needs as a military family during this PCS?
                </span>
                <span className="text-xs text-slate-500">
                  Consider flexibility with orders and timelines, understanding
                  of military life, and how supportive the school felt as a
                  whole.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num}>
                    <input
                      type="radio"
                      value={String(num)}
                      {...register("overallFit")}
                      className="mr-1"
                    />
                    {num} – {num === 1 && "Very poor"}
                    {num === 2 && "Below average"}
                    {num === 3 && "Average"}
                    {num === 4 && "Good"}
                    {num === 5 && "Excellent"}
                  </label>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Selected: {selectedOverallFit || "No answer yet"}
              </p>
            </div>
          </section>

          {/* Open-ended notes */}
          <section className="space-y-2 rounded border border-slate-200 p-4 text-sm text-slate-700">
            <label className="flex flex-col gap-1">
              <span className="font-medium">
                Anything else you want other military families to know about
                this school?
              </span>
              <span className="text-xs text-slate-500">
                Please avoid sharing full names of children or staff, or
                detailed medical information. Focus on experiences that could
                help another family decide or ask better questions.
              </span>
              <textarea
                {...register("extraNotes")}
                rows={4}
                className="mt-2 w-full rounded border border-slate-300 p-2 text-sm"
                placeholder="Optional: share specifics about what went well, what was hard, or what you wish you had known before enrolling."
              />
            </label>
          </section>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white text-sm"
          >
            Submit review (demo)
          </button>
        </form>
      )}
    </main>
  );
}
