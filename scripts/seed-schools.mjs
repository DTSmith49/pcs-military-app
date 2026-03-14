import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PCS_STATES = [
  { fips: 37, name: 'North Carolina' },
  { fips: 51, name: 'Virginia' },
  { fips: 48, name: 'Texas' },
  { fips: 13, name: 'Georgia' },
  { fips: 6,  name: 'California' },
  { fips: 12, name: 'Florida' },
  { fips: 53, name: 'Washington' },
  { fips: 15, name: 'Hawaii' },
  { fips: 21, name: 'Kentucky' },
  { fips: 20, name: 'Kansas' },
];

const BASE_URL = 'https://educationdata.urban.org/api/v1/schools/ccd/directory/2019';

async function fetchSchoolsForState(fips, stateName) {
  let allSchools = [];
  let nextUrl = `${BASE_URL}/?fips=${fips}&school_type=1&per_page=1000`;
  let pageNum = 1;

  while (nextUrl) {
    console.log(`   Fetching page ${pageNum} for ${stateName}...`);
    const res = await fetch(nextUrl);
    if (!res.ok) {
      console.error(`   ❌ HTTP ${res.status} on page ${pageNum} for ${stateName}`);
      break;
    }
    const data = await res.json();
    const results = data.results || [];
    allSchools = allSchools.concat(results);
    console.log(`   → Page ${pageNum}: ${results.length} schools (running total: ${allSchools.length})`);
    nextUrl = data.next || null;
    pageNum++;
    if (nextUrl) await new Promise(r => setTimeout(r, 500));
  }

  return allSchools;
}

function mapSchool(s) {
  const ratio = (s.enrollment && s.teachers_fte && s.teachers_fte > 0)
    ? parseFloat((s.enrollment / s.teachers_fte).toFixed(1))
    : null;

  const frlRatio = (s.enrollment > 0 && s.free_or_reduced_price_lunch != null && s.free_or_reduced_price_lunch >= 0)
    ? parseFloat((s.free_or_reduced_price_lunch / s.enrollment).toFixed(3))
    : null;

  return {
    ncessch: s.ncessch || null,
    school_name: s.school_name || 'Unknown',
    street_address: s.street_mailing || null,
    city: s.city_mailing || null,
    state_abbr: s.state_mailing || null,
    zip: s.zip_mailing || null,
    latitude: s.latitude != null ? parseFloat(s.latitude) : null,
    longitude: s.longitude != null ? parseFloat(s.longitude) : null,
    grade_low: s.lowest_grade_offered != null ? String(s.lowest_grade_offered) : null,
    grade_high: s.highest_grade_offered != null ? String(s.highest_grade_offered) : null,
    title_i_status: s.title_i_status != null ? String(s.title_i_status) : null,
    school_level: s.school_level != null ? String(s.school_level) : null,
    school_type: s.school_type != null ? String(s.school_type) : null,
    enrollment: s.enrollment != null ? parseInt(s.enrollment) : null,
    pupil_teacher_ratio: ratio,
    frl_ratio: frlRatio,
    is_dodea: false,
    installation_id: null,
    review_count: 0,
    composite_score: null,
  };
}

async function upsertBatch(schools) {
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < schools.length; i += 500) {
    const batch = schools.slice(i, i + 500);  // ← fixed: batch defined here
    const { error } = await supabase
      .from('schools')
      .upsert(batch, { onConflict: 'ncessch', ignoreDuplicates: false });

    if (error) {
      console.error(` ❌ Batch error:`, JSON.stringify(error, null, 2));
      errors += batch.length;
    } else {
      console.log(`   ✅ Batch ${i + 1}–${i + batch.length} inserted`);
      inserted += batch.length;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  return { inserted, errors };
}

async function main() {
  console.log('🚀 Starting NCES CCD school seeding...\n');

  let totalInserted = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  for (const state of PCS_STATES) {
    console.log(`\n📍 ${state.name} (FIPS ${state.fips})`);

    const rawSchools = await fetchSchoolsForState(state.fips, state.name);
    console.log(`   → ${rawSchools.length} total schools returned by API`);

    const mapped = rawSchools.map(mapSchool).filter(s => {
      if (!s.ncessch) return false;
      if (s.latitude == null || s.longitude == null) return false;
      return true;
    });

    const skipped = rawSchools.length - mapped.length;
    totalSkipped += skipped;
    console.log(`   → ${mapped.length} with valid coordinates (${skipped} skipped — no lat/lng)`);

    if (mapped.length === 0) {
      console.log(`   ⚠️ No valid schools to insert for ${state.name}`);
      continue;
    }

    const { inserted, errors } = await upsertBatch(mapped);
    totalInserted += inserted;
    totalErrors += errors;

    console.log(`   ✔ ${state.name} complete: ${inserted} inserted, ${errors} errors`);
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`🎉 Seeding complete!`);
  console.log(`   Total inserted: ${totalInserted}`);
  console.log(`   Total skipped:  ${totalSkipped} (no coordinates)`);
  console.log(`   Total errors:   ${totalErrors}`);
  console.log('──────────────────────────────────────────\n');
}

main().catch(err => {
  console.error('💥 Unhandled error:', err);
  process.exit(1);
});
