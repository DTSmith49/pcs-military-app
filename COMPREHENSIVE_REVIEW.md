# Comprehensive Code Review: PCS Parent SchoolGuide

**Date:** 2026-03-03
**Codebase:** Next.js 16.1.6 / React 19.2.3 / TypeScript / Tailwind CSS v4 / Supabase
**Total Source Files:** 15 TypeScript files, 0 test files

---

## Table of Contents

1. [Security & Secrets Audit](#1-security--secrets-audit)
2. [Input Validation & API Security](#2-input-validation--api-security)
3. [Performance Issues](#3-performance-issues)
4. [Accessibility Issues](#4-accessibility-issues)
5. [Testing Gaps](#5-testing-gaps)
6. [Code Quality Issues](#6-code-quality-issues)
7. [Configuration Improvements](#7-configuration-improvements)
8. [File-by-File Reference](#8-file-by-file-reference)
9. [Implementation Priority](#9-implementation-priority)
10. [Verification Scripts](#10-verification-scripts)

---

## 1. Security & Secrets Audit

### Result: PASS — No Private Keys or Secrets Exposed

A comprehensive search was performed across all source files for:
- Private keys (`BEGIN RSA`, `BEGIN PRIVATE`, `BEGIN EC`, `BEGIN OPENSSH`)
- API keys (`sk_`, `pk_`, `ghp_`, `gho_`, `AIza`, `AKIA`)
- Tokens (`xox`, `eyJ`)
- Hardcoded passwords, credentials, connection strings
- `.env` files committed to repo

**Findings:**

| Check | Status | Details |
|-------|--------|---------|
| `.env` files in repo | PASS | No `.env` files found in source tree |
| `.gitignore` coverage | PASS | `.env*` and `*.pem` correctly excluded (lines 25, 34) |
| Hardcoded secrets | PASS | No hardcoded API keys, tokens, or passwords |
| Supabase credentials | PASS | All use `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` — these are public anon keys, safe for client-side |
| Private key files | PASS | No `.pem`, `.key`, `.pfx`, `.jks` files found |

### Supabase Key Usage Locations

All references correctly use environment variables:

```
lib/supabaseClient.ts:5-6       — process.env.NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
app/api/reviews/route.ts:9-10   — process.env.NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
app/schools/page.tsx:5-6        — process.env.NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
```

> Note: `NEXT_PUBLIC_` prefixed variables are intentionally public. The `ANON_KEY` is Supabase's anonymous/public key meant for client-side use, not a service role key.

---

## 2. Input Validation & API Security

### 2.1 Server-Side Supabase Client Misuse

**File:** `app/api/reviews/route.ts:3,11`
**Severity:** Medium
**Issue:** The API route uses `createBrowserClient` from `@supabase/ssr`, which is designed for browser contexts. Server-side API routes should use `createClient` from `@supabase/supabase-js`.

**Current code:**
```typescript
import { createBrowserClient } from "@supabase/ssr";
// ...
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
```

**Recommended fix:**
```typescript
import { createClient } from "@supabase/supabase-js";
// ...
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

### 2.2 No Input Validation on POST /api/reviews

**File:** `app/api/reviews/route.ts:7-24`
**Severity:** High
**Issue:** The API accepts and inserts any request body without validation. Malformed or malicious data can be inserted directly into Supabase.

**Recommended fix — add validation before insert:**
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.schoolId || typeof body.schoolId !== "string") {
      return NextResponse.json(
        { error: "schoolId is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate rating values (must be 1-5 if present)
    const ratingFields = [
      "academicExperience",
      "communityBelonging",
      "communicationEngagement",
      "specialNeedsSupport",
      "overallFit",
    ];
    for (const field of ratingFields) {
      if (body[field] != null) {
        const num = Number(body[field]);
        if (isNaN(num) || num < 1 || num > 5) {
          return NextResponse.json(
            { error: `${field} must be a number between 1 and 5` },
            { status: 400 }
          );
        }
      }
    }

    // Validate enum fields
    const validCompactValues = ["yes", "no", "not_sure"];
    if (body.interstateCompact && !validCompactValues.includes(body.interstateCompact)) {
      return NextResponse.json(
        { error: "Invalid interstateCompact value" },
        { status: 400 }
      );
    }

    const validPurpleStarValues = ["yes", "no", "not_sure"];
    if (body.purpleStar && !validPurpleStarValues.includes(body.purpleStar)) {
      return NextResponse.json(
        { error: "Invalid purpleStar value" },
        { status: 400 }
      );
    }

    const validIepValues = ["honored_promptly", "delayed", "not_honored", "not_applicable"];
    if (body.iep504Status && !validIepValues.includes(body.iep504Status)) {
      return NextResponse.json(
        { error: "Invalid iep504Status value" },
        { status: 400 }
      );
    }

    // Sanitize text length
    if (body.extraNotes && body.extraNotes.length > 5000) {
      return NextResponse.json(
        { error: "extraNotes must be under 5000 characters" },
        { status: 400 }
      );
    }

    // ... proceed with insert
  }
}
```

---

### 2.3 No Rate Limiting on Review Submission

**File:** `app/api/reviews/route.ts`
**Severity:** Medium
**Issue:** No rate limiting means a malicious user could spam the reviews endpoint.

**Recommended approach:** Add rate limiting via Next.js middleware or use Supabase Row Level Security (RLS) policies. For a simple solution:

```typescript
// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/reviews" && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10;

    const entry = rateLimit.get(ip);
    if (entry && now < entry.resetTime) {
      if (entry.count >= maxRequests) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    }
  }
  return NextResponse.next();
}
```

---

### 2.4 Disable `X-Powered-By` Header

**File:** `next.config.ts`
**Severity:** Low
**Issue:** Next.js sends `X-Powered-By: Next.js` header by default, revealing server technology.

**Fix:**
```typescript
const nextConfig: NextConfig = {
  poweredByHeader: false,
};
```

---

## 3. Performance Issues

### 3.1 `watch()` Causes Full Re-renders on Every Keystroke

**Files:**
- `app/review/page.tsx:134` — `const values = watch()`
- `app/survey/page.tsx:40` — `const values = watch()`

**Severity:** Medium
**Issue:** Calling `watch()` with no arguments subscribes to ALL form fields. Every keystroke in any field triggers a full component re-render.

**Fix for `app/review/page.tsx`:**
```typescript
// Instead of:
const values = watch();

// Watch only the fields needed for the current step:
const schoolName = watch("schoolName");
const schoolState = watch("schoolState");
const interstateCompact = watch("interstateCompact");
const purpleStar = watch("purpleStar");
const iep504Status = watch("iep504Status");
const academicExperience = watch("academicExperience");
const communityBelonging = watch("communityBelonging");
const communicationEngagement = watch("communicationEngagement");
const specialNeedsSupport = watch("specialNeedsSupport");
const overallFit = watch("overallFit");
```

**Fix for `app/survey/page.tsx`:**
```typescript
// Watch only the fields that have conditional dependents:
const creditsAccepted = watch("credits_accepted");
const usesDigitalPlatform = watch("uses_digital_platform");

const shouldShowField = (fieldId: string): boolean => {
  const field = currentSection.fields.find((f) => f.id === fieldId);
  if (!field?.conditional) return true;
  const { field: dependsOn, value } = field.conditional;
  if (dependsOn === "credits_accepted") return creditsAccepted === value;
  if (dependsOn === "uses_digital_platform") return usesDigitalPlatform === value;
  return true;
};
```

---

### 3.2 No Loading State on Form Submission — Double Submit Possible

**File:** `app/review/page.tsx:136-152`
**Severity:** Medium
**Issue:** The async `onSubmit` handler has no loading state. Users can click "Submit" multiple times.

**Fix:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (data: ReviewFormValues) => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      // Show inline error instead of alert()
      return;
    }
    setSubmitted(true);
  } catch (e) {
    // Show inline error instead of alert()
  } finally {
    setIsSubmitting(false);
  }
};

// In the submit button:
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold py-4 rounded-lg text-base transition-colors disabled:opacity-50"
>
  {isSubmitting ? "Submitting..." : "Submit Your Review"}
</button>
```

---

### 3.3 No Pagination on Schools List

**File:** `app/schools/page.tsx:11-14`
**Severity:** Medium (grows with data)
**Issue:** Fetches ALL schools with no limit. Will degrade as database grows.

**Current:**
```typescript
const { data: schools } = await supabase
  .from("schools")
  .select("id, name, city, state")
  .order("name", { ascending: true });
```

**Recommended fix:** Add pagination with `.range()`:
```typescript
const PAGE_SIZE = 50;
const { data: schools } = await supabase
  .from("schools")
  .select("id, name, city, state")
  .order("name", { ascending: true })
  .range(0, PAGE_SIZE - 1);
```

---

### 3.4 Deprecated `@next/font` Dependency

**File:** `package.json:12`
**Severity:** Low
**Issue:** `"@next/font": "^14.2.15"` is deprecated. The app already correctly uses `next/font/google` in `layout.tsx`.

**Fix:** Remove from dependencies:
```bash
npm uninstall @next/font
```

---

### 3.5 Smooth Scroll on Step Transitions

**File:** `app/survey/page.tsx:27,37`
**Severity:** Low
**Issue:** `window.scrollTo(0, 0)` causes an abrupt jump.

**Fix:**
```typescript
window.scrollTo({ top: 0, behavior: "smooth" });
```

---

### 3.6 Inefficient Conditional Field Lookup

**File:** `app/survey/page.tsx:42-48`
**Severity:** Low
**Issue:** `shouldShowField()` uses `.find()` (O(n) linear scan) for every field on every render.

**Fix:** Pre-compute a Map:
```typescript
const fieldMap = useMemo(
  () => new Map(currentSection.fields.map((f) => [f.id, f])),
  [currentSection]
);

const shouldShowField = (fieldId: string): boolean => {
  const field = fieldMap.get(fieldId);
  if (!field?.conditional) return true;
  const { field: dependsOn, value } = field.conditional;
  return values[dependsOn] === value;
};
```

---

## 4. Accessibility Issues

### 4.1 Missing Skip Navigation Link (WCAG 2.4.1 — Level A FAIL)

**File:** `app/layout.tsx`
**Severity:** Critical
**Issue:** No skip link for keyboard users to bypass the header navigation.

**Fix — add as first child of `<body>`:**
```tsx
<body className="font-sans bg-white text-slate-900 antialiased">
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:rounded focus:shadow"
  >
    Skip to main content
  </a>
  <header>...</header>
  <main id="main-content">{children}</main>
  ...
</body>
```

---

### 4.2 Emojis Without Accessible Labels (WCAG 1.1.1 — Level A FAIL)

**Severity:** High
**Issue:** Emojis are used extensively as meaningful content but lack text alternatives for screen readers.

**Affected locations:**

| File | Lines | Emojis |
|------|-------|--------|
| `app/page.tsx` | 4-8 | Stats: `🏫`, `👨‍👩‍👧`, `🇺🇸` |
| `app/page.tsx` | 10-14 | Steps: `🔍`, `📖`, `✍️` |
| `app/page.tsx` | 16-23 | Dimensions: `📚`, `📋`, `🤝`, `❤️`, `📣`, `⭐` |
| `app/page.tsx` | 160-161 | Stars: `★` repeated |
| `app/schools/page.tsx` | 40, 62 | School: `🏫` |
| `app/review/page.tsx` | 158 | Medal: `🎖️` |
| `app/review/page.tsx` | 189 | Info: `ℹ️`, arrows: `▲`/`▼` |
| `app/review/page.tsx` | 106 | Checkmark: `✓` |

**Fix pattern — for meaningful emojis:**
```tsx
// Before:
<span className="text-2xl">{s.icon}</span>

// After:
<span className="text-2xl" role="img" aria-label={s.label}>{s.icon}</span>
```

**Fix pattern — for decorative emojis:**
```tsx
<span className="text-2xl" aria-hidden="true">{s.icon}</span>
```

**Fix for star ratings:**
```tsx
// Before:
<div className="flex gap-0.5 text-[#E8A020] text-lg">
  {"★".repeat(t.stars)}
</div>

// After:
<div className="flex gap-0.5 text-[#E8A020] text-lg" role="img" aria-label={`${t.stars} out of 5 stars`}>
  {"★".repeat(t.stars)}
</div>
```

---

### 4.3 Form Labels Use `<div>` Instead of `<label>` (WCAG 1.3.1 — Level A FAIL)

**File:** `app/review/page.tsx`
**Severity:** High
**Lines:** 209, 220, 229, 262, 277, 292, 330, 335, 340, 345, 350, 377

**Current pattern:**
```tsx
<div className="text-sm font-medium text-slate-700">
  School name <span className="text-red-500">*</span>
</div>
<input type="text" {...register("schoolName")} />
```

**Fix:**
```tsx
<label htmlFor="schoolName" className="text-sm font-medium text-slate-700">
  School name <span className="text-red-500">*</span>
</label>
<input id="schoolName" type="text" {...register("schoolName")} />
```

Apply this to all form fields in the review page. Each input/select/textarea needs a matching `id` and `<label htmlFor="...">`.

---

### 4.4 RatingPills Missing ARIA Attributes (WCAG 4.1.2 — Level A FAIL)

**File:** `app/review/page.tsx:37-61`
**Severity:** High
**Issue:** Button group acts as a radio group but has no ARIA semantics.

**Fix:**
```tsx
function RatingPills({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={label}>
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
      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>Very poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}
```

---

### 4.5 YesNoPills Missing ARIA Attributes (WCAG 4.1.2 — Level A FAIL)

**File:** `app/review/page.tsx:64-91`
**Severity:** High

**Fix — same pattern as RatingPills:**
```tsx
function YesNoPills({
  value,
  onChange,
  options,
  label,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={label}>
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
```

---

### 4.6 ProgressBar Missing ARIA Semantics

**File:** `app/review/page.tsx:93-118`
**Severity:** Medium

**Fix:**
```tsx
function ProgressBar({ step }: { step: number }) {
  return (
    <nav aria-label="Review progress" className="flex items-center gap-2 mb-8">
      <ol className="flex items-center gap-2 w-full">
        {STEPS.map((s, i) => (
          <li
            key={s.number}
            className="flex items-center gap-2 flex-1"
            aria-current={step === s.number ? "step" : undefined}
          >
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s.number
                    ? "bg-[#1B2A4A] text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
                aria-label={`Step ${s.number}: ${s.label}${step > s.number ? " (completed)" : step === s.number ? " (current)" : ""}`}
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
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

### 4.7 Tooltip Missing ARIA and Keyboard Support (WCAG 4.1.2 — Level A FAIL)

**File:** `components/Tooltip.tsx`
**Severity:** High
**Issues:**
- No `aria-expanded` on trigger button
- No `role="tooltip"` on popup
- No `aria-controls` / `id` linking
- No Escape key handler to close
- No click-outside-to-close

**Fix:**
```tsx
"use client";

import { useState, useRef, useEffect, useId } from "react";

export function Tooltip({
  label = "What is this?",
  body,
}: {
  label?: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <span className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={tooltipId}
        className="text-xs text-blue-600 underline"
      >
        {label}
      </button>
      {open && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-20 mt-1 w-64 rounded border border-slate-300 bg-white p-2 text-xs text-slate-700 shadow"
        >
          {body}
        </div>
      )}
    </span>
  );
}
```

---

### 4.8 Privacy Toggle Missing `aria-expanded`

**File:** `app/review/page.tsx:184-189`
**Severity:** Medium

**Current:**
```tsx
<button type="button" onClick={() => setPrivacyOpen(!privacyOpen)} className="...">
  ℹ️ Privacy & how this works {privacyOpen ? "▲" : "▼"}
</button>
```

**Fix:**
```tsx
<button
  type="button"
  onClick={() => setPrivacyOpen(!privacyOpen)}
  aria-expanded={privacyOpen}
  className="mt-3 text-sm text-[#1B2A4A] underline flex items-center gap-1"
>
  <span aria-hidden="true">ℹ️</span> Privacy & how this works{" "}
  <span aria-hidden="true">{privacyOpen ? "▲" : "▼"}</span>
</button>
```

---

### 4.9 Search Input Missing Label (WCAG 1.3.1 — Level A FAIL)

**File:** `app/page.tsx:67-71`
**Severity:** High

**Fix:**
```tsx
<label htmlFor="hero-search" className="sr-only">Search by city, state, or base name</label>
<input
  id="hero-search"
  type="text"
  placeholder="Search by city, state, or base name..."
  className="flex-1 rounded-lg px-4 py-3 text-white bg-transparent placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020] border border-blue-400"
/>
```

---

### 4.10 Color Contrast Failures (WCAG 1.4.3 — Level AA FAIL)

**Severity:** High

| File | Line | Class | Issue | Fix |
|------|------|-------|-------|-----|
| `app/review/page.tsx` | 56 | `text-slate-400` | ~3.0:1 contrast on white (needs 4.5:1) | Change to `text-slate-500` |
| `app/page.tsx` | 95 | `text-slate-500` | ~4.6:1 (marginal pass) | Acceptable or bump to `text-slate-600` |
| `app/page.tsx` | 62 | `text-blue-200` | Light blue on dark navy — verify contrast | Check with contrast tool; may need `text-blue-100` |
| `app/page.tsx` | 168 | `text-slate-400` | Testimonial branch/state text | Change to `text-slate-500` |
| `app/layout.tsx` | 47 | `text-slate-400` | Footer description on dark bg | Change to `text-slate-300` |

---

### 4.11 Missing Focus Management on Step Transitions

**Files:** `app/review/page.tsx`, `app/survey/page.tsx`
**Severity:** Medium
**Issue:** When users navigate between form steps, focus is not moved to the new step heading. Screen reader users lose their place.

**Fix — add ref-based focus management:**
```typescript
const stepHeadingRef = useRef<HTMLHeadingElement>(null);

// After setting step:
useEffect(() => {
  stepHeadingRef.current?.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [step]);

// On each step's heading:
<h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-bold text-[#1B2A4A] outline-none">
  ...
</h2>
```

---

### 4.12 WCAG 2.1 Compliance Summary

| Criterion | Level | Status | Issue |
|-----------|-------|--------|-------|
| 1.1.1 Non-text Content | A | FAIL | Emojis lack text alternatives |
| 1.3.1 Info and Relationships | A | FAIL | Form labels use `<div>` not `<label>` |
| 1.4.3 Contrast (Minimum) | AA | FAIL | `text-slate-400` on white |
| 2.1.1 Keyboard | A | PASS | All controls are keyboard accessible |
| 2.4.1 Bypass Blocks | A | FAIL | No skip navigation link |
| 2.4.3 Focus Order | A | WARN | Focus not managed between form steps |
| 2.4.7 Focus Visible | AA | PASS | Tailwind provides default focus styles |
| 4.1.2 Name, Role, Value | A | FAIL | RatingPills/YesNoPills/Tooltip missing ARIA |

---

## 5. Testing Gaps

### Current State: 0% Test Coverage

- Zero test files exist
- No test dependencies installed
- No test script in `package.json`

### 5.1 Install Test Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

### 5.2 Vitest Configuration

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

**Create `vitest.setup.ts`:**
```typescript
import "@testing-library/jest-dom/vitest";
```

---

### 5.3 Critical Tests to Write

#### API Route Tests — `app/api/reviews/__tests__/route.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  })),
}));

describe("POST /api/reviews", () => {
  it("should reject requests without schoolId", async () => {
    // Test that missing schoolId returns 400
  });

  it("should reject invalid rating values", async () => {
    // Test that ratings outside 1-5 return 400
  });

  it("should accept valid review data", async () => {
    // Test successful review submission
  });

  it("should handle Supabase errors gracefully", async () => {
    // Test that Supabase errors return 500 with message
  });
});
```

#### Review Form Tests — `app/review/__tests__/page.test.tsx`

```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewPage from "../page";

describe("ReviewPage", () => {
  it("renders step 1 by default", () => {
    render(<ReviewPage />);
    expect(screen.getByText("School Information")).toBeInTheDocument();
  });

  it("prevents advancing without required fields", async () => {
    render(<ReviewPage />);
    const nextButton = screen.getByText(/Next: Enrollment/);
    fireEvent.click(nextButton);
    // Should stay on step 1
    expect(screen.getByText("School Information")).toBeInTheDocument();
  });

  it("advances to step 2 when required fields are filled", async () => {
    const user = userEvent.setup();
    render(<ReviewPage />);
    await user.type(screen.getByPlaceholderText(/Smith Elementary/), "Test School");
    await user.selectOptions(screen.getByRole("combobox"), "VA");
    await user.click(screen.getByText(/Next: Enrollment/));
    expect(screen.getByText("Enrollment & Transition Experience")).toBeInTheDocument();
  });

  it("can navigate back from step 2 to step 1", async () => {
    // Navigate to step 2, click back, verify step 1 shows
  });
});
```

#### Tooltip Tests — `components/__tests__/Tooltip.test.tsx`

```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip } from "../Tooltip";

describe("Tooltip", () => {
  it("renders the trigger button", () => {
    render(<Tooltip body="Test content" />);
    expect(screen.getByText("What is this?")).toBeInTheDocument();
  });

  it("shows content on click", () => {
    render(<Tooltip body="Test content" />);
    fireEvent.click(screen.getByText("What is this?"));
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("hides content on second click", () => {
    render(<Tooltip body="Test content" />);
    const button = screen.getByText("What is this?");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    render(<Tooltip body="Test content" />);
    fireEvent.click(screen.getByText("What is this?"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("has correct ARIA attributes", () => {
    render(<Tooltip body="Test content" />);
    const button = screen.getByText("What is this?");
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
```

---

## 6. Code Quality Issues

### 6.1 JSX Comment Rendered as Visible Text (BUG)

**File:** `app/survey/page.tsx:160`
**Severity:** High (visible bug)
**Issue:** A JavaScript `//` comment inside JSX return value renders as text on the page.

**Current:**
```tsx
{field.type === "school_search" && (
  <input
    type="text"
    placeholder="Start typing the school name"
    {...commonProps}
    className="mt-1 block w-full border rounded px-3 py-2"
  />
  // Later you can replace this with an autocomplete tied to your Schools table
)}
```

**Fix:** Remove the comment or use JSX comment syntax:
```tsx
{field.type === "school_search" && (
  <>
    <input
      type="text"
      placeholder="Start typing the school name"
      {...commonProps}
      className="mt-1 block w-full border rounded px-3 py-2"
    />
    {/* Later: replace with autocomplete tied to Schools table */}
  </>
)}
```

---

### 6.2 `console.log` in Production Code

**File:** `app/survey/page.tsx:31`
**Severity:** Low

**Current:** `console.log("Survey submitted:", data);`
**Fix:** Remove the line entirely.

---

### 6.3 `console.error` Without Structured Context

**Files:**
- `app/review/page.tsx:149` — `console.error(e)`
- `app/api/reviews/route.ts:48` — `console.error("Supabase insert error", error)`
- `app/api/reviews/route.ts:54` — `console.error("Unexpected error", e)`

**Recommendation:** These are acceptable for now but should eventually use structured logging if the app reaches production scale.

---

### 6.4 Weak `any` Typing

| File | Line | Code | Fix |
|------|------|------|-----|
| `app/survey/page.tsx` | 8 | `type FormValues = Record<string, any>` | Generate type from `militarySchoolSurvey` config |
| `app/survey/page.tsx` | 164 | `(error as any).message` | Use `FieldError` from react-hook-form |
| `app/schools/[id]/page.tsx` | 22 | `school: any` | Create `School` interface matching DB schema |

**Fix for survey FormValues:**
```typescript
import { militarySchoolSurvey } from "../config/militarySchoolSurvey";

// Generate type from survey config
type FormValues = {
  [K in typeof militarySchoolSurvey.sections[number]["fields"][number]["id"]]?: string;
};
```

**Fix for school type:**
```typescript
interface School {
  id: string;
  name: string;
  avg_academic_experience_score: number | null;
  avg_enrollment_transition_score: number | null;
  avg_special_needs_support_score: number | null;
  avg_community_belonging_score: number | null;
  avg_communication_engagement_score: number | null;
  avg_overall_military_friendly_score: number | null;
}

function SchoolRatings({ school }: { school: School }) { ... }
```

---

### 6.5 Duplicate Survey Configuration File

**Files:**
- `app/config/militarySchoolSurvey.ts` (449 lines)
- `content/militarySchoolSurvey.ts` (450 lines — identical content)

**Fix:** Delete `content/militarySchoolSurvey.ts`. The app imports from `app/config/militarySchoolSurvey.ts`:
```bash
rm content/militarySchoolSurvey.ts
```

Verify no imports reference the deleted file:
```bash
grep -r "content/militarySchoolSurvey" --include="*.ts" --include="*.tsx"
```

---

### 6.6 Supabase Client Not Reused

**File:** `lib/supabaseClient.ts` — Defines `createSupabaseClient()` utility
**Issue:** Neither `app/api/reviews/route.ts` nor `app/schools/page.tsx` use it.

**Fix for `app/schools/page.tsx`:**
```typescript
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function SchoolsListPage() {
  const supabase = createSupabaseClient();
  // ...
}
```

**Fix for `app/api/reviews/route.ts`:** Create a separate server client utility:
```typescript
// lib/supabaseServerClient.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

### 6.7 Replace `alert()` with Inline Error Messages

**Affected lines:**
- `app/review/page.tsx:144` — `alert("There was a problem saving your review...")`
- `app/review/page.tsx:150` — `alert("There was a network error...")`
- `app/review/page.tsx:246` — `alert("Please enter a school name and state.")`
- `app/survey/page.tsx:32` — `alert("Thank you for your review!")`

**Fix pattern:**
```typescript
const [errorMessage, setErrorMessage] = useState<string | null>(null);

// Replace alert() with:
setErrorMessage("There was a problem saving your review. Please try again.");

// In JSX:
{errorMessage && (
  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
    {errorMessage}
  </div>
)}
```

---

### 6.8 TODO Left in Production Code

**File:** `app/schools/[id]/page.tsx:7`
**Issue:** `// TODO: fetch from your database.` with hardcoded mock data.

**Note:** This is an incomplete feature. The `getSchoolById()` function returns hardcoded data instead of fetching from Supabase. Should be completed with real data fetching.

---

## 7. Configuration Improvements

### 7.1 Next.js Config

**File:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
```

---

### 7.2 ESLint Enhancements (optional)

**File:** `eslint.config.mjs`

Consider adding `no-console` rule to catch stray console.log statements:
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },
];

export default eslintConfig;
```

---

## 8. File-by-File Reference

### Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `app/api/reviews/route.ts` | Server client fix, input validation | P1 Security |
| `next.config.ts` | `poweredByHeader: false` | P1 Security |
| `app/review/page.tsx` | ARIA attrs, `<label>` tags, `watch()` optimization, loading state, `alert()` replacement, `aria-expanded`, color contrast | P2 Mixed |
| `app/layout.tsx` | Skip nav link, `id="main-content"` on main | P2 A11y |
| `app/page.tsx` | Emoji a11y labels, search input label | P2 A11y |
| `components/Tooltip.tsx` | ARIA, Escape key, click-outside | P2 A11y |
| `app/survey/page.tsx` | Fix JSX comment bug, remove console.log, `watch()` optimization, smooth scroll | P3 Quality |
| `app/schools/page.tsx` | Emoji a11y, use shared Supabase client | P3 Mixed |
| `app/schools/[id]/page.tsx` | Fix `any` type | P4 Quality |
| `package.json` | Remove `@next/font`, add test deps/script | P4 Cleanup |

### Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `vitest.config.ts` | Test runner config | P4 Testing |
| `vitest.setup.ts` | Test setup (jest-dom matchers) | P4 Testing |
| `lib/supabaseServerClient.ts` | Server-side Supabase client | P1 Security |
| `app/api/reviews/__tests__/route.test.ts` | API tests | P4 Testing |
| `app/review/__tests__/page.test.tsx` | Form tests | P4 Testing |
| `components/__tests__/Tooltip.test.tsx` | Component tests | P4 Testing |

### Files to Delete

| File | Reason |
|------|--------|
| `content/militarySchoolSurvey.ts` | Exact duplicate of `app/config/militarySchoolSurvey.ts` |

---

## 9. Implementation Priority

### P1 — Security & Correctness (do first)
1. Fix server-side Supabase client usage in API route
2. Add input validation to API route
3. Add `poweredByHeader: false` to Next config

### P2 — Accessibility (high impact)
4. Add skip navigation link
5. Fix form labels (`<div>` to `<label>`)
6. Add ARIA to RatingPills, YesNoPills, ProgressBar
7. Fix Tooltip accessibility
8. Add emoji accessible labels
9. Fix color contrast issues
10. Add search input label

### P3 — Performance & Quality (medium impact)
11. Fix `watch()` to watch specific fields
12. Add loading state to form submission
13. Fix JSX comment rendered as text
14. Remove `console.log` from survey
15. Replace `alert()` with inline messages
16. Smooth scroll on step transitions

### P4 — Cleanup & Testing (maintenance)
17. Remove deprecated `@next/font` dependency
18. Delete duplicate config file
19. Fix `any` types
20. Consolidate Supabase client usage
21. Set up Vitest test infrastructure
22. Write critical tests

---

## 10. Verification Scripts

### Run after implementation to verify fixes:

```bash
# 1. Build check — no compilation errors
npm run build

# 2. Lint check — no linting errors
npm run lint

# 3. Test check — all tests pass
npm test

# 4. Security check — no secrets in source
grep -rn "PRIVATE_KEY\|SECRET_KEY\|password\|sk_live\|BEGIN RSA\|BEGIN PRIVATE" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.next .

# 5. No console.log in production paths
grep -rn "console\.log" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir="__tests__" .

# 6. No alert() calls remaining
grep -rn "alert(" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next .

# 7. Verify duplicate file removed
test ! -f content/militarySchoolSurvey.ts && echo "PASS: Duplicate removed"

# 8. Verify deprecated package removed
! grep -q "@next/font" package.json && echo "PASS: @next/font removed"
```
