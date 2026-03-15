// Static list of US military installations with lat/lng
// Coordinates are approximate installation centroids
export interface Base {
  name: string
  aliases: string[]
  lat: number
  lng: number
  state: string
}

export const BASES: Base[] = [
  { name: "Fort Liberty", aliases: ["Fort Bragg"], lat: 35.1396, lng: -79.0061, state: "NC" },
  { name: "Fort Campbell", aliases: [], lat: 36.6554, lng: -87.4776, state: "KY" },
  { name: "Fort Hood", aliases: ["Fort Cavazos"], lat: 31.1351, lng: -97.7834, state: "TX" },
  { name: "Fort Cavazos", aliases: ["Fort Hood"], lat: 31.1351, lng: -97.7834, state: "TX" },
  { name: "Fort Benning", aliases: ["Fort Moore"], lat: 32.3543, lng: -84.9561, state: "GA" },
  { name: "Fort Moore", aliases: ["Fort Benning"], lat: 32.3543, lng: -84.9561, state: "GA" },
  { name: "Fort Stewart", aliases: [], lat: 31.8693, lng: -81.6090, state: "GA" },
  { name: "Fort Gordon", aliases: ["Fort Eisenhower"], lat: 33.4218, lng: -82.1543, state: "GA" },
  { name: "Fort Eisenhower", aliases: ["Fort Gordon"], lat: 33.4218, lng: -82.1543, state: "GA" },
  { name: "Fort Bliss", aliases: [], lat: 31.8485, lng: -106.4085, state: "TX" },
  { name: "Fort Sill", aliases: [], lat: 34.6481, lng: -98.4011, state: "OK" },
  { name: "Fort Riley", aliases: [], lat: 39.0553, lng: -96.8011, state: "KS" },
  { name: "Fort Leavenworth", aliases: [], lat: 39.3612, lng: -94.9243, state: "KS" },
  { name: "Fort Leonard Wood", aliases: [], lat: 37.7268, lng: -92.1385, state: "MO" },
  { name: "Fort Drum", aliases: [], lat: 44.0568, lng: -75.7596, state: "NY" },
  { name: "Fort Hamilton", aliases: [], lat: 40.6051, lng: -74.0327, state: "NY" },
  { name: "Fort Meade", aliases: [], lat: 39.1076, lng: -76.7402, state: "MD" },
  { name: "Fort Belvoir", aliases: [], lat: 38.7151, lng: -77.1527, state: "VA" },
  { name: "Fort Myer", aliases: ["Joint Base Myer-Henderson Hall"], lat: 38.8793, lng: -77.0769, state: "VA" },
  { name: "Fort Eustis", aliases: ["Joint Base Langley-Eustis"], lat: 37.1651, lng: -76.5985, state: "VA" },
  { name: "Fort Lee", aliases: ["Fort Gregg-Adams"], lat: 37.2376, lng: -77.3385, state: "VA" },
  { name: "Fort Gregg-Adams", aliases: ["Fort Lee"], lat: 37.2376, lng: -77.3385, state: "VA" },
  { name: "Fort Polk", aliases: ["Fort Johnson"], lat: 31.0440, lng: -93.2085, state: "LA" },
  { name: "Fort Johnson", aliases: ["Fort Polk"], lat: 31.0440, lng: -93.2085, state: "LA" },
  { name: "Fort Knox", aliases: [], lat: 37.9010, lng: -85.9627, state: "KY" },
  { name: "Fort Jackson", aliases: [], lat: 34.0485, lng: -80.8918, state: "SC" },
  { name: "Fort Rucker", aliases: ["Fort Novosel"], lat: 31.3568, lng: -85.7168, state: "AL" },
  { name: "Fort Novosel", aliases: ["Fort Rucker"], lat: 31.3568, lng: -85.7168, state: "AL" },
  { name: "Fort Wainwright", aliases: [], lat: 64.8271, lng: -147.6543, state: "AK" },
  { name: "Fort Richardson", aliases: ["Joint Base Elmendorf-Richardson"], lat: 61.2543, lng: -149.7968, state: "AK" },
  { name: "Fort Shafter", aliases: [], lat: 21.3568, lng: -157.8968, state: "HI" },
  { name: "Schofield Barracks", aliases: [], lat: 21.4943, lng: -158.0635, state: "HI" },
  { name: "Camp Pendleton", aliases: [], lat: 33.3768, lng: -117.3635, state: "CA" },
  { name: "Camp Lejeune", aliases: [], lat: 34.6776, lng: -77.3635, state: "NC" },
  { name: "Camp Humphreys", aliases: [], lat: 36.9701, lng: 127.0301, state: "KOR" },
  { name: "Camp Zama", aliases: [], lat: 35.4843, lng: 139.3968, state: "JPN" },
  { name: "Ramstein Air Base", aliases: [], lat: 49.4368, lng: 7.6001, state: "DEU" },
  { name: "Spangdahlem Air Base", aliases: [], lat: 49.9726, lng: 6.6926, state: "DEU" },
  { name: "Landstuhl", aliases: ["Landstuhl Regional Medical Center"], lat: 49.4076, lng: 7.5718, state: "DEU" },
  { name: "Naval Station Norfolk", aliases: ["NS Norfolk"], lat: 36.9376, lng: -76.2968, state: "VA" },
  { name: "Naval Air Station Oceana", aliases: ["NAS Oceana"], lat: 36.8201, lng: -76.0335, state: "VA" },
  { name: "Naval Station San Diego", aliases: ["NS San Diego", "32nd Street Naval Station"], lat: 32.6818, lng: -117.1318, state: "CA" },
  { name: "Naval Base Kitsap", aliases: ["NB Kitsap", "Bremerton"], lat: 47.5568, lng: -122.6251, state: "WA" },
  { name: "Naval Station Great Lakes", aliases: ["NS Great Lakes"], lat: 42.2951, lng: -87.8385, state: "IL" },
  { name: "Naval Air Station Pensacola", aliases: ["NAS Pensacola"], lat: 30.3526, lng: -87.3085, state: "FL" },
  { name: "Naval Air Station Jacksonville", aliases: ["NAS Jacksonville"], lat: 30.2343, lng: -81.6793, state: "FL" },
  { name: "Naval Air Station Whidbey Island", aliases: ["NAS Whidbey"], lat: 48.3518, lng: -122.6551, state: "WA" },
  { name: "Naval Air Station Lemoore", aliases: ["NAS Lemoore"], lat: 36.3301, lng: -119.9518, state: "CA" },
  { name: "Marine Corps Base Quantico", aliases: ["MCB Quantico", "Quantico"], lat: 38.5218, lng: -77.3051, state: "VA" },
  { name: "Marine Corps Base Twentynine Palms", aliases: ["29 Palms", "MCAGCC"], lat: 34.2568, lng: -116.0635, state: "CA" },
  { name: "Marine Corps Air Station Miramar", aliases: ["MCAS Miramar"], lat: 32.8685, lng: -117.1418, state: "CA" },
  { name: "Marine Corps Air Station Cherry Point", aliases: ["MCAS Cherry Point"], lat: 34.9001, lng: -76.8835, state: "NC" },
  { name: "Marine Corps Air Station Beaufort", aliases: ["MCAS Beaufort"], lat: 32.4743, lng: -80.7235, state: "SC" },
  { name: "Marine Corps Air Station New River", aliases: ["MCAS New River"], lat: 34.7068, lng: -77.4385, state: "NC" },
  { name: "Marine Corps Logistics Base Albany", aliases: ["MCLB Albany"], lat: 31.5793, lng: -84.0668, state: "GA" },
  { name: "Joint Base Lewis-McChord", aliases: ["JBLM", "Fort Lewis", "McChord"], lat: 47.1076, lng: -122.5668, state: "WA" },
  { name: "Joint Base Pearl Harbor-Hickam", aliases: ["Pearl Harbor", "Hickam"], lat: 21.3501, lng: -157.9635, state: "HI" },
  { name: "Joint Base San Antonio", aliases: ["JBSA", "Lackland", "Randolph", "Fort Sam Houston"], lat: 29.3835, lng: -98.6168, state: "TX" },
  { name: "Joint Base Andrews", aliases: ["Andrews AFB"], lat: 38.8118, lng: -76.8668, state: "MD" },
  { name: "Joint Base Langley-Eustis", aliases: ["Langley AFB"], lat: 37.0826, lng: -76.3585, state: "VA" },
  { name: "Joint Base McGuire-Dix-Lakehurst", aliases: ["McGuire", "Fort Dix", "Lakehurst"], lat: 40.0176, lng: -74.5918, state: "NJ" },
  { name: "Joint Base Elmendorf-Richardson", aliases: ["JBER", "Elmendorf"], lat: 61.2543, lng: -149.7968, state: "AK" },
  { name: "Eglin Air Force Base", aliases: ["Eglin AFB"], lat: 30.4826, lng: -86.5251, state: "FL" },
  { name: "Patrick Space Force Base", aliases: ["Patrick AFB", "Cape Canaveral"], lat: 28.2343, lng: -80.6018, state: "FL" },
  { name: "MacDill Air Force Base", aliases: ["MacDill AFB"], lat: 27.8493, lng: -82.5218, state: "FL" },
  { name: "Hurlburt Field", aliases: [], lat: 30.4276, lng: -86.6885, state: "FL" },
  { name: "Tyndall Air Force Base", aliases: ["Tyndall AFB"], lat: 30.0793, lng: -85.6085, state: "FL" },
  { name: "Keesler Air Force Base", aliases: ["Keesler AFB"], lat: 30.4118, lng: -88.9235, state: "MS" },
  { name: "Columbus Air Force Base", aliases: ["Columbus AFB"], lat: 33.6418, lng: -88.4435, state: "MS" },
  { name: "Barksdale Air Force Base", aliases: ["Barksdale AFB"], lat: 32.5018, lng: -93.6635, state: "LA" },
  { name: "Dyess Air Force Base", aliases: ["Dyess AFB"], lat: 32.4201, lng: -99.8518, state: "TX" },
  { name: "Goodfellow Air Force Base", aliases: ["Goodfellow AFB"], lat: 31.3576, lng: -100.3968, state: "TX" },
  { name: "Sheppard Air Force Base", aliases: ["Sheppard AFB"], lat: 33.9885, lng: -98.8318, state: "TX" },
  { name: "Laughlin Air Force Base", aliases: ["Laughlin AFB"], lat: 29.3593, lng: -100.7785, state: "TX" },
  { name: "Luke Air Force Base", aliases: ["Luke AFB"], lat: 33.5351, lng: -112.3835, state: "AZ" },
  { name: "Davis-Monthan Air Force Base", aliases: ["Davis-Monthan AFB", "DM AFB"], lat: 32.1668, lng: -110.8835, state: "AZ" },
  { name: "Holloman Air Force Base", aliases: ["Holloman AFB"], lat: 32.8518, lng: -106.0985, state: "NM" },
  { name: "Kirtland Air Force Base", aliases: ["Kirtland AFB"], lat: 35.0451, lng: -106.6085, state: "NM" },
  { name: "Cannon Air Force Base", aliases: ["Cannon AFB"], lat: 34.3826, lng: -103.3218, state: "NM" },
  { name: "Nellis Air Force Base", aliases: ["Nellis AFB"], lat: 36.2368, lng: -115.0335, state: "NV" },
  { name: "Travis Air Force Base", aliases: ["Travis AFB"], lat: 38.2668, lng: -121.9268, state: "CA" },
  { name: "Vandenberg Space Force Base", aliases: ["Vandenberg AFB", "VSFB"], lat: 34.7368, lng: -120.5668, state: "CA" },
  { name: "Edwards Air Force Base", aliases: ["Edwards AFB"], lat: 34.9051, lng: -117.8835, state: "CA" },
  { name: "Beale Air Force Base", aliases: ["Beale AFB"], lat: 39.1368, lng: -121.4368, state: "CA" },
  { name: "Mountain Home Air Force Base", aliases: ["Mountain Home AFB"], lat: 43.0451, lng: -115.8685, state: "ID" },
  { name: "Fairchild Air Force Base", aliases: ["Fairchild AFB"], lat: 47.6151, lng: -117.6551, state: "WA" },
  { name: "McConnell Air Force Base", aliases: ["McConnell AFB"], lat: 37.6226, lng: -97.2685, state: "KS" },
  { name: "Whiteman Air Force Base", aliases: ["Whiteman AFB"], lat: 38.7226, lng: -93.5485, state: "MO" },
  { name: "Scott Air Force Base", aliases: ["Scott AFB"], lat: 38.5451, lng: -89.8518, state: "IL" },
  { name: "Wright-Patterson Air Force Base", aliases: ["Wright-Patterson AFB", "WPAFB"], lat: 39.8268, lng: -84.0485, state: "OH" },
  { name: "Selfridge Air National Guard Base", aliases: ["Selfridge ANGB"], lat: 42.6076, lng: -82.8318, state: "MI" },
  { name: "Dover Air Force Base", aliases: ["Dover AFB"], lat: 39.1285, lng: -75.4668, state: "DE" },
  { name: "Shaw Air Force Base", aliases: ["Shaw AFB"], lat: 33.9726, lng: -80.4735, state: "SC" },
  { name: "Seymour Johnson Air Force Base", aliases: ["Seymour Johnson AFB"], lat: 35.3393, lng: -77.9618, state: "NC" },
  { name: "Pope Army Airfield", aliases: ["Pope Field"], lat: 35.1701, lng: -79.0151, state: "NC" },
  { name: "Hanscom Air Force Base", aliases: ["Hanscom AFB"], lat: 42.4626, lng: -71.2868, state: "MA" },
  { name: "Otis Air National Guard Base", aliases: ["Otis ANGB"], lat: 41.6551, lng: -70.5218, state: "MA" },
  { name: "Pease Air National Guard Base", aliases: ["Pease ANGB"], lat: 43.0793, lng: -70.8235, state: "NH" },
  { name: "Buckley Space Force Base", aliases: ["Buckley AFB", "Buckley SFB"], lat: 39.7168, lng: -104.7518, state: "CO" },
  { name: "Schriever Space Force Base", aliases: ["Schriever AFB", "Schriever SFB"], lat: 38.8026, lng: -104.5268, state: "CO" },
  { name: "Peterson Space Force Base", aliases: ["Peterson AFB", "Peterson SFB"], lat: 38.8193, lng: -104.7018, state: "CO" },
  { name: "United States Air Force Academy", aliases: ["USAFA", "Air Force Academy"], lat: 38.9985, lng: -104.8618, state: "CO" },
  { name: "United States Military Academy", aliases: ["West Point", "USMA"], lat: 41.3918, lng: -73.9568, state: "NY" },
  { name: "United States Naval Academy", aliases: ["USNA", "Annapolis"], lat: 38.9826, lng: -76.4818, state: "MD" },
]

/** Fuzzy-match a user query against base names and aliases */
export function findBase(query: string): Base | null {
  const q = query.toLowerCase().trim()
  if (!q) return null

  // Exact match first
  const exact = BASES.find(
    (b) =>
      b.name.toLowerCase() === q ||
      b.aliases.some((a) => a.toLowerCase() === q)
  )
  if (exact) return exact

  // Partial match
  const partial = BASES.find(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.aliases.some((a) => a.toLowerCase().includes(q))
  )
  return partial ?? null
}
