/**
 * AI Interpretation Service
 *
 * Provides a clean adapter layer for interpreting music analytics into
 * personalized, longitudinal natural language narratives.
 *
 * Features:
 * - Evidence-based longitudinal analysis: compares 4W vs 6M vs 1Y timeframes
 * - Anti-hallucination grounding: pre-digested structured facts sent to LLM
 * - Data availability flags: AI never invents missing genre/artist data
 * - Graceful deterministic fallback when AI key is absent or unreachable
 */

import axios from 'axios';
import { TasteAnalysisContext } from '../analytics/multiPeriodEngine';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface AIInterpretationResponse {
  whereTasteIsHeading: {
    headline: string;
    narrative: string;
    keyDrivers: string[];
    emergingFocus: string;
  };
  howTasteHasChanged: {
    headline: string;
    comparisonNarrative: string;
    primaryShift: string;
    metricHighlights: {
      label: string;
      change: string;
      interpretation: string;
    }[];
  };
  musicalMoodAndTone: {
    headline: string;
    currentSoundscape: string;
    toneShiftExplanation: string;
    energyTempoAnalysis: string;
  };
  currentSoundIdentity: {
    headline: string;
    identityStatement: string;
    coreAtmosphere: string;
  };
  yourTasteExplained: {
    title: string;
    introduction: string;
    recentVsLongterm: string;
    varietyAndConcentration: string;
    contradictionsAndPatterns: string;
    closingSynthesis: string;
  };
  metadata: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'deterministic_engine';
    isAIGenerated: boolean;
    notice: string;
    calculatedAt: string;
  };
}

// ─── Deterministic Longitudinal Synthesizer (Fallback) ──────────────────────

function generateDeterministicInterpretation(
  context: TasteAnalysisContext
): AIInterpretationResponse {
  const { current, recent, yearly, metricDeltas, trajectory, dataAvailability } = context;

  const currentArtists = dataAvailability.hasCurrentArtistData
    ? current.topArtists.slice(0, 5).map((a) => a.name)
    : [];
  const recentArtists = dataAvailability.hasRecentArtistData
    ? recent.topArtists.slice(0, 5).map((a) => a.name)
    : [];
  const yearlyArtists = dataAvailability.hasYearlyArtistData
    ? yearly.topArtists.slice(0, 5).map((a) => a.name)
    : [];

  const currentGenres = dataAvailability.hasCurrentGenreData
    ? current.topGenres.slice(0, 3).map((g) => g.genre)
    : [];
  const yearlyGenres = dataAvailability.hasYearlyGenreData
    ? yearly.topGenres.slice(0, 3).map((g) => g.genre)
    : [];

  const emergingArtistsStr = trajectory.emergingArtists.slice(0, 3).join(', ');
  const decliningArtistsStr = trajectory.decliningArtists.slice(0, 3).join(', ');
  const coreAnchorsStr = trajectory.coreAnchors.slice(0, 3).join(', ');
  const risingGenresStr = trajectory.risingGenres.slice(0, 2).join(' and ');
  const fadingGenresStr = trajectory.fadingGenres.slice(0, 2).join(' and ');

  // 1. Where taste is heading
  let headlineText = 'Consistent Musical Direction';
  let headingNarrative = `Your listening has stayed remarkably consistent. The same core artists populate your 4-week rotation as they did over the past year.`;

  if (emergingArtistsStr && risingGenresStr) {
    headlineText = `Shifting toward ${risingGenresStr}`;
    headingNarrative = `Over the last year your base was ${yearlyGenres.length > 0 ? yearlyGenres.join(', ') : 'eclectic'}, but your current 4-week rotation shows a clear pivot: ${emergingArtistsStr} have entered as fresh entrants, and ${risingGenresStr} is gaining a stronger foothold.`;
  } else if (emergingArtistsStr) {
    headlineText = `New Artists Breaking Into Your Rotation`;
    headingNarrative = `Your 4-week rotation has welcomed new faces: ${emergingArtistsStr}. These artists weren't part of your 1-year baseline, suggesting active exploration even with a stable genre palette.`;
  } else if (risingGenresStr) {
    headlineText = `Rising Genre Momentum: ${risingGenresStr}`;
    headingNarrative = `${risingGenresStr} is taking up a larger share of your recent listening compared to your yearly baseline, pointing to a clear directional genre shift.`;
  }

  // 2. How taste has changed
  const diversityChange = metricDeltas.artistDiversity.netChange;
  const loyaltyChange = metricDeltas.loyalty.netChange;
  const discoveryChange = metricDeltas.discovery.netChange;

  let primaryShift = 'Stable listening habits with no major directional change year-over-year.';
  if (diversityChange > 10) {
    primaryShift = `Significant expansion — artist diversity rose ${metricDeltas.artistDiversity.yearly} → ${metricDeltas.artistDiversity.current}, meaning you are exploring a noticeably wider range of artists than a year ago.`;
  } else if (diversityChange < -10) {
    primaryShift = `Increasing concentration — artist diversity fell ${metricDeltas.artistDiversity.yearly} → ${metricDeltas.artistDiversity.current}, your rotation has narrowed to a tighter circle of core favorites.`;
  } else if (loyaltyChange > 10) {
    primaryShift = `Growing loyalty — loyalty score rose ${metricDeltas.loyalty.yearly} → ${metricDeltas.loyalty.current}, you are returning to familiar artists more frequently than before.`;
  } else if (discoveryChange > 10) {
    primaryShift = `Accelerating discovery — discovery rate jumped ${metricDeltas.discovery.yearly} → ${metricDeltas.discovery.current}, you are bringing in new artists faster than your yearly baseline.`;
  } else if (discoveryChange < -10) {
    primaryShift = `Slower discovery — discovery rate dropped ${metricDeltas.discovery.yearly} → ${metricDeltas.discovery.current}, new artist additions have slowed compared to your yearly baseline.`;
  }

  const yearlyArtistsStr = yearlyArtists.length > 0 ? yearlyArtists.join(', ') : 'your historical core';
  const currentArtistsStr = currentArtists.length > 0 ? currentArtists.join(', ') : 'your current rotation';

  const comparisonNarrative =
    `A year ago, your top artists were ${yearlyArtistsStr}. ` +
    `Today your 4-week rotation centers around ${currentArtistsStr}. ` +
    (coreAnchorsStr ? `${coreAnchorsStr} have persisted across all three timeframes as loyal anchors. ` : '') +
    (decliningArtistsStr
      ? `Meanwhile, ${decliningArtistsStr} featured heavily in your yearly baseline but are less present now.`
      : 'Your yearly favorites have largely carried through to your current rotation.');

  // 3. Musical mood and tone
  const energyDelta = metricDeltas.energy.netChange;
  const tempoDelta = metricDeltas.tempo.netChange;
  const acousticDelta = metricDeltas.acousticness.netChange;

  let toneShiftExplanation = `Currently your listening sits at ~${current.musicalCharacteristics.tempo} BPM with an energy level of ${current.musicalCharacteristics.energy}/100. `;
  if (Math.abs(energyDelta) > 5 || Math.abs(tempoDelta) > 5 || Math.abs(acousticDelta) > 5) {
    toneShiftExplanation +=
      `Compared to your 1-year baseline (${yearly.musicalCharacteristics.energy} energy, ${yearly.musicalCharacteristics.tempo} BPM), ` +
      (energyDelta > 5 ? 'your music has gotten more energetic. ' :
       energyDelta < -5 ? 'the energy has mellowed — you are leaning into softer arrangements. ' : '') +
      (tempoDelta > 5 ? `Tempo has risen +${tempoDelta} BPM, pushing toward faster-paced production. ` :
       tempoDelta < -5 ? `Tempo has dropped ${tempoDelta} BPM, toward a more relaxed sonic environment. ` : '') +
      (acousticDelta > 8 ? 'Acoustic texture is notably more prominent now. ' :
       acousticDelta < -8 ? 'The sound has shifted away from acoustic toward more produced/electronic arrangements. ' : '');
  } else {
    toneShiftExplanation += `Your sonic environment has stayed consistent — energy, tempo, and acoustic texture all shifted by less than 5 points across the year.`;
  }

  // 4. Current sound identity
  const identityStatement = currentArtists.length > 0 || currentGenres.length > 0
    ? `Right now your listening is defined by ${currentArtists.length > 0 ? currentArtists.slice(0, 3).join(', ') : 'your current rotation'}${currentGenres.length > 0 ? `, rooted in ${currentGenres.join(', ')}` : ''}. The overall atmosphere is ${current.musicalCharacteristics.atmosphere.toLowerCase()}.`
    : `Your current listening has a ${current.musicalCharacteristics.atmosphere.toLowerCase()} character, with energy at ${current.musicalCharacteristics.energy}/100 and tempo around ${current.musicalCharacteristics.tempo} BPM.`;

  // 5. Full longitudinal narrative
  const introduction =
    (yearlyArtists.length > 0
      ? `Your 1-year baseline was anchored by ${yearlyArtists.slice(0, 3).join(', ')}.`
      : 'Your 1-year baseline established your core sound.') +
    (recentArtists.length > 0
      ? ` By the 6-month mark, ${recentArtists.slice(0, 3).join(', ')} were central to your rotation.`
      : '') +
    (currentArtists.length > 0
      ? ` Today your 4-week sound is led by ${currentArtists.slice(0, 3).join(', ')}.`
      : '');

  const recentVsLong =
    (coreAnchorsStr
      ? `Consistent anchors across all three periods: ${coreAnchorsStr}. `
      : 'No single artist appeared in all three timeframes. ') +
    (emergingArtistsStr
      ? `New entrants in your 4-week rotation not in your yearly baseline: ${emergingArtistsStr}. `
      : '') +
    (decliningArtistsStr
      ? `Artists from your yearly baseline that have dropped away: ${decliningArtistsStr}.`
      : 'Your yearly favorites have mostly carried through to your current rotation.');

  const genreDiversityNote = dataAvailability.hasCurrentGenreData
    ? `Artist diversity moved from ${metricDeltas.artistDiversity.yearly}/100 (1Y) to ${metricDeltas.artistDiversity.current}/100 (4W). ${diversityChange > 0 ? "You're listening to a broader range of artists than a year ago." : diversityChange < 0 ? 'Your rotation has become more concentrated.' : 'Artist breadth has been consistent.'} Genre diversity: ${metricDeltas.genreDiversity.yearly} (1Y) → ${metricDeltas.genreDiversity.current} (4W).`
    : `Artist diversity moved from ${metricDeltas.artistDiversity.yearly}/100 (1Y) to ${metricDeltas.artistDiversity.current}/100 (4W). Genre data was not returned by Spotify for this period, so genre diversity comparison is not available.`;

  const loyaltyNote =
    `Discovery rate: ${current.metrics.discoveryRate}/100 (now) vs. ${yearly.metrics.discoveryRate}/100 (1Y). ` +
    `Loyalty score: ${current.metrics.loyaltyScore}/100 (now) vs. ${yearly.metrics.loyaltyScore}/100 (1Y). ` +
    (trajectory.coreAnchors.length > 0
      ? `You have ${trajectory.coreAnchors.length} long-term anchor artist(s) that have remained constant across all periods.`
      : 'Your listening circle has turned over significantly since a year ago.');

  const closingSynthesis =
    primaryShift + ' ' +
    (risingGenresStr
      ? `The clearest directional signal is the rise of ${risingGenresStr} in your recent listening.`
      : fadingGenresStr
      ? `Genres like ${fadingGenresStr} have receded, making room for newer sounds.`
      : 'Your taste remains a coherent, intentional thread rather than a restless search.');

  return {
    whereTasteIsHeading: {
      headline: headlineText,
      narrative: headingNarrative,
      keyDrivers: trajectory.emergingArtists.slice(0, 4),
      emergingFocus: risingGenresStr || (currentGenres.length > 0 ? currentGenres[0] : 'Consistent sonic profile'),
    },
    howTasteHasChanged: {
      headline: 'Longitudinal Shift: 1-Year Baseline → 4-Week Rotation',
      comparisonNarrative,
      primaryShift,
      metricHighlights: [
        {
          label: 'Artist Diversity',
          change: `1Y ${metricDeltas.artistDiversity.yearly} → 6M ${metricDeltas.artistDiversity.recent} → 4W ${metricDeltas.artistDiversity.current}`,
          interpretation: metricDeltas.artistDiversity.interpretation,
        },
        {
          label: 'Genre Diversity',
          change: dataAvailability.hasCurrentGenreData
            ? `1Y ${metricDeltas.genreDiversity.yearly} → 6M ${metricDeltas.genreDiversity.recent} → 4W ${metricDeltas.genreDiversity.current}`
            : 'Data not available for this period',
          interpretation: dataAvailability.hasCurrentGenreData
            ? metricDeltas.genreDiversity.interpretation
            : 'Spotify did not return genre tags for your top artists in this period.',
        },
        {
          label: 'Discovery Rate',
          change: `1Y ${metricDeltas.discovery.yearly} → 6M ${metricDeltas.discovery.recent} → 4W ${metricDeltas.discovery.current}`,
          interpretation: metricDeltas.discovery.interpretation,
        },
        {
          label: 'Artist Loyalty',
          change: `1Y ${metricDeltas.loyalty.yearly} → 6M ${metricDeltas.loyalty.recent} → 4W ${metricDeltas.loyalty.current}`,
          interpretation: metricDeltas.loyalty.interpretation,
        },
      ],
    },
    musicalMoodAndTone: {
      headline: current.musicalCharacteristics.atmosphere,
      currentSoundscape: `Energy: ${current.musicalCharacteristics.energy}/100 | Tempo: ~${current.musicalCharacteristics.tempo} BPM | Acousticness: ${current.musicalCharacteristics.acousticness}/100 | Danceability: ${current.musicalCharacteristics.danceability}/100`,
      toneShiftExplanation,
      energyTempoAnalysis: `Energy: ${yearly.musicalCharacteristics.energy} (1Y) → ${recent.musicalCharacteristics.energy} (6M) → ${current.musicalCharacteristics.energy} (4W) | Tempo: ${yearly.musicalCharacteristics.tempo} → ${recent.musicalCharacteristics.tempo} → ${current.musicalCharacteristics.tempo} BPM`,
    },
    currentSoundIdentity: {
      headline: 'Your Sound Right Now',
      identityStatement,
      coreAtmosphere: current.musicalCharacteristics.atmosphere,
    },
    yourTasteExplained: {
      title: 'Your Musical Arc, Explained',
      introduction,
      recentVsLongterm: recentVsLong,
      varietyAndConcentration: genreDiversityNote,
      contradictionsAndPatterns: loyaltyNote,
      closingSynthesis,
    },
    metadata: {
      provider: 'deterministic_engine',
      isAIGenerated: false,
      notice: 'Computed directly from verified Spotify Web API multi-period snapshots. No AI inference used.',
      calculatedAt: new Date().toISOString(),
    },
  };
}

// ─── Pre-Digest Context for LLM ─────────────────────────────────────────────

/**
 * Converts the raw TasteAnalysisContext into a structured, readable summary
 * that Gemini can parse cleanly without navigating a 150-field JSON object.
 * Data availability flags are surfaced explicitly so the AI never invents missing data.
 */
function buildDigestedContext(ctx: TasteAnalysisContext): string {
  const { current, recent, yearly, metricDeltas, trajectory, dataAvailability } = ctx;

  const fmt = (v: number) => v.toString();
  const fmtDelta = (v: number) => (v > 0 ? `+${v}` : `${v}`);
  const dirArrow = (dir: string) => (dir === 'rising' ? '↑' : dir === 'falling' ? '↓' : '→');

  const safeArtists = (period: typeof current, hasData: boolean) =>
    hasData && period.topArtists.length > 0
      ? period.topArtists.slice(0, 6).map((a) => a.name).join(', ')
      : '[No artist data available for this period]';

  const safeGenres = (period: typeof current, hasData: boolean) =>
    hasData && period.topGenres.length > 0
      ? period.topGenres.slice(0, 5).map((g) => `${g.genre} (${g.percentage}%)`).join(', ')
      : '[Genre data not returned by Spotify for this period — do not invent genre names]';

  return `
=== LISTENER DATA SUMMARY ===
Data sampled: ${ctx.dataSummary.artistsSampled} artists, ${ctx.dataSummary.tracksSampled} tracks

--- PERIOD 1: LAST 1 YEAR (Baseline) ---
Top Artists: ${safeArtists(yearly, dataAvailability.hasYearlyArtistData)}
Top Genres: ${safeGenres(yearly, dataAvailability.hasYearlyGenreData)}
Metrics:
  Artist Diversity: ${fmt(yearly.metrics.artistDiversity)}/100
  Genre Diversity: ${fmt(yearly.metrics.genreDiversity)}/100 (unique genres: ${yearly.totalUniqueGenres}${!dataAvailability.hasYearlyGenreData ? ' — unavailable' : ''})
  Discovery Rate: ${fmt(yearly.metrics.discoveryRate)}/100
  Artist Loyalty: ${fmt(yearly.metrics.loyaltyScore)}/100
  Niche Score: ${fmt(yearly.metrics.nicheScore)}/100
Audio Profile: Energy ${yearly.musicalCharacteristics.energy}/100 | Tempo ${yearly.musicalCharacteristics.tempo} BPM | Acousticness ${yearly.musicalCharacteristics.acousticness}/100 | Danceability ${yearly.musicalCharacteristics.danceability}/100 | Atmosphere: ${yearly.musicalCharacteristics.atmosphere}

--- PERIOD 2: LAST 6 MONTHS (Transition) ---
Top Artists: ${safeArtists(recent, dataAvailability.hasRecentArtistData)}
Top Genres: ${safeGenres(recent, dataAvailability.hasRecentGenreData)}
Metrics:
  Artist Diversity: ${fmt(recent.metrics.artistDiversity)}/100
  Genre Diversity: ${fmt(recent.metrics.genreDiversity)}/100 (unique genres: ${recent.totalUniqueGenres}${!dataAvailability.hasRecentGenreData ? ' — unavailable' : ''})
  Discovery Rate: ${fmt(recent.metrics.discoveryRate)}/100
  Artist Loyalty: ${fmt(recent.metrics.loyaltyScore)}/100
  Niche Score: ${fmt(recent.metrics.nicheScore)}/100
Audio Profile: Energy ${recent.musicalCharacteristics.energy}/100 | Tempo ${recent.musicalCharacteristics.tempo} BPM | Acousticness ${recent.musicalCharacteristics.acousticness}/100 | Danceability ${recent.musicalCharacteristics.danceability}/100 | Atmosphere: ${recent.musicalCharacteristics.atmosphere}

--- PERIOD 3: LAST 4 WEEKS (Current) ---
Top Artists: ${safeArtists(current, dataAvailability.hasCurrentArtistData)}
Top Genres: ${safeGenres(current, dataAvailability.hasCurrentGenreData)}
Metrics:
  Artist Diversity: ${fmt(current.metrics.artistDiversity)}/100
  Genre Diversity: ${fmt(current.metrics.genreDiversity)}/100 (unique genres: ${current.totalUniqueGenres}${!dataAvailability.hasCurrentGenreData ? ' — unavailable' : ''})
  Discovery Rate: ${fmt(current.metrics.discoveryRate)}/100
  Artist Loyalty: ${fmt(current.metrics.loyaltyScore)}/100
  Niche Score: ${fmt(current.metrics.nicheScore)}/100
Audio Profile: Energy ${current.musicalCharacteristics.energy}/100 | Tempo ${current.musicalCharacteristics.tempo} BPM | Acousticness ${current.musicalCharacteristics.acousticness}/100 | Danceability ${current.musicalCharacteristics.danceability}/100 | Atmosphere: ${current.musicalCharacteristics.atmosphere}

--- COMPUTED DELTAS (1Y → 6M → 4W) ---
Artist Diversity: ${fmt(metricDeltas.artistDiversity.yearly)} → ${fmt(metricDeltas.artistDiversity.recent)} → ${fmt(metricDeltas.artistDiversity.current)} (net change: ${fmtDelta(metricDeltas.artistDiversity.netChange)} ${dirArrow(metricDeltas.artistDiversity.direction)})
Genre Diversity: ${fmt(metricDeltas.genreDiversity.yearly)} → ${fmt(metricDeltas.genreDiversity.recent)} → ${fmt(metricDeltas.genreDiversity.current)} (net: ${fmtDelta(metricDeltas.genreDiversity.netChange)} ${dirArrow(metricDeltas.genreDiversity.direction)})
Discovery Rate: ${fmt(metricDeltas.discovery.yearly)} → ${fmt(metricDeltas.discovery.recent)} → ${fmt(metricDeltas.discovery.current)} (net: ${fmtDelta(metricDeltas.discovery.netChange)} ${dirArrow(metricDeltas.discovery.direction)})
Artist Loyalty: ${fmt(metricDeltas.loyalty.yearly)} → ${fmt(metricDeltas.loyalty.recent)} → ${fmt(metricDeltas.loyalty.current)} (net: ${fmtDelta(metricDeltas.loyalty.netChange)} ${dirArrow(metricDeltas.loyalty.direction)})
Niche Affinity: ${fmt(metricDeltas.nicheAffinity.yearly)} → ${fmt(metricDeltas.nicheAffinity.recent)} → ${fmt(metricDeltas.nicheAffinity.current)} (net: ${fmtDelta(metricDeltas.nicheAffinity.netChange)} ${dirArrow(metricDeltas.nicheAffinity.direction)})
Energy: ${fmt(metricDeltas.energy.yearly)} → ${fmt(metricDeltas.energy.recent)} → ${fmt(metricDeltas.energy.current)} (net: ${fmtDelta(metricDeltas.energy.netChange)} ${dirArrow(metricDeltas.energy.direction)})
Tempo BPM: ${fmt(metricDeltas.tempo.yearly)} → ${fmt(metricDeltas.tempo.recent)} → ${fmt(metricDeltas.tempo.current)} (net: ${fmtDelta(metricDeltas.tempo.netChange)} ${dirArrow(metricDeltas.tempo.direction)})
Acousticness: ${fmt(metricDeltas.acousticness.yearly)} → ${fmt(metricDeltas.acousticness.recent)} → ${fmt(metricDeltas.acousticness.current)} (net: ${fmtDelta(metricDeltas.acousticness.netChange)} ${dirArrow(metricDeltas.acousticness.direction)})
Danceability: ${fmt(metricDeltas.danceability.yearly)} → ${fmt(metricDeltas.danceability.recent)} → ${fmt(metricDeltas.danceability.current)} (net: ${fmtDelta(metricDeltas.danceability.netChange)} ${dirArrow(metricDeltas.danceability.direction)})

--- ARTIST TRAJECTORY (cross-period movement) ---
Trajectory data available: ${dataAvailability.hasTrajectoryData ? 'Yes' : 'No'}
Emerging (in 4W, NOT in 1Y): ${trajectory.emergingArtists.length > 0 ? trajectory.emergingArtists.join(', ') : 'None detected'}
Declining (in 1Y, NOT in 4W): ${trajectory.decliningArtists.length > 0 ? trajectory.decliningArtists.join(', ') : 'None detected'}
Core anchors (in both 1Y and 4W): ${trajectory.coreAnchors.length > 0 ? trajectory.coreAnchors.join(', ') : 'None detected'}
Rising genres (gained share 1Y→4W): ${trajectory.risingGenres.length > 0 ? trajectory.risingGenres.join(', ') : 'None detected'}
Fading genres (lost share 1Y→4W): ${trajectory.fadingGenres.length > 0 ? trajectory.fadingGenres.join(', ') : 'None detected'}
Stable genres (consistent across periods): ${trajectory.stableGenres.length > 0 ? trajectory.stableGenres.join(', ') : 'None detected'}
`.trim();
}

// ─── LLM Prompt Construction ────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are Lore.fm's Music Intelligence Engine.

Your single purpose is LONGITUDINAL ANALYSIS of a listener's Spotify data across three measured timeframes. You explain HOW their taste has evolved — not what personality type they are.

YOUR TASK — answer these questions using ONLY the provided data:
1. What is the listener's current sound (4W)? Name real artists and genres from the data.
2. What characterized their listening a year ago (1Y)? What was the baseline?
3. What measurably changed 1Y→6M→4W? Reference actual metric deltas with numbers.
4. Which artists are emerging (new in 4W) or declining (faded from 1Y)?
5. Which genres gained or lost share? Only if genre data is marked available.
6. Is the listener diversifying or concentrating? Use the diversity delta.
7. Are they discovering new artists or returning to anchors? Use discovery/loyalty deltas.
8. How have energy, tempo, and acoustic texture shifted?
9. Where does their taste appear to be heading?

STRICT RULES:
- DATA INTEGRITY: Only reference artist and genre names that appear verbatim in the data. NEVER invent names.
- UNAVAILABLE DATA: If the data says "[Genre data not returned by Spotify]", do not mention genres for that period. Say the data was unavailable.
- COMPARISON FIRST: Every insight must compare periods. Never describe just the current snapshot.
- CITE METRICS: Back every claim with at least one number. Example: "Artist diversity rose from 72 (1Y) to 85 (4W)."
- MUSIC LANGUAGE: Discuss arrangements, tempo, acoustic vs electronic textures. No psychology.
- TONE: Conversational, perceptive, direct. Like a knowledgeable music friend.
- JSON ONLY: Return only valid JSON. No markdown, no preamble, no trailing text.`;
}

function buildUserPrompt(context: TasteAnalysisContext): string {
  return `Using the verified Spotify listener data below, perform a longitudinal taste analysis. Answer all 9 questions through the JSON schema fields.

${buildDigestedContext(context)}

Return ONLY this JSON schema filled with your analysis:
{
  "whereTasteIsHeading": {
    "headline": "Sharp 6-8 word title of directional momentum (e.g. 'Trending Toward Ambient & Electronic Textures')",
    "narrative": "2-3 sentences on WHERE taste is heading based on what rose from 1Y to 4W. Reference specific artists or genres from the data. Compare periods explicitly.",
    "keyDrivers": ["Artist or genre driving the shift (from data only)", "Second driver"],
    "emergingFocus": "Single clearest emerging genre or artist direction (from data only)"
  },
  "howTasteHasChanged": {
    "headline": "6-8 word title summarizing the main 1Y→4W evolutionary shift",
    "comparisonNarrative": "3-4 sentences contrasting 1Y baseline with 4W current rotation. Name specific artists from both periods. Explain what dropped and what entered. Reference at least 2 metric deltas with actual numbers.",
    "primaryShift": "One sharp sentence: the single most significant change from 1Y to 4W.",
    "metricHighlights": [
      { "label": "Artist Diversity", "change": "1Y [value] → 6M [value] → 4W [value]", "interpretation": "What this numeric progression means for listening behavior" },
      { "label": "Genre Diversity", "change": "1Y [value] → 6M [value] → 4W [value] — or 'Unavailable' if flagged", "interpretation": "Meaning, or state data was not available" },
      { "label": "Discovery Rate", "change": "1Y [value] → 6M [value] → 4W [value]", "interpretation": "Is this listener finding new artists or returning to anchors?" },
      { "label": "Artist Loyalty", "change": "1Y [value] → 6M [value] → 4W [value]", "interpretation": "What the loyalty trend reveals about listening behavior" }
    ]
  },
  "musicalMoodAndTone": {
    "headline": "Current 4-week atmosphere label from the data",
    "currentSoundscape": "Factual description: energy, tempo, acousticness, danceability numbers for the 4-week period",
    "toneShiftExplanation": "2-3 sentences on how energy/tempo/acoustic texture changed from 1Y to 4W with actual numbers. Is it mellowing or gaining momentum?",
    "energyTempoAnalysis": "Factual comparison: Energy 1Y→6M→4W and Tempo 1Y→6M→4W with actual numbers"
  },
  "currentSoundIdentity": {
    "headline": "Your Sound Right Now",
    "identityStatement": "2-3 sentences describing what this listener sounds like RIGHT NOW based on 4W data only. Name artists and genres only from current period data. Make it specific.",
    "coreAtmosphere": "The 4W atmosphere string from the data"
  },
  "yourTasteExplained": {
    "title": "Your Musical Arc, Explained",
    "introduction": "2-3 sentences establishing the full 1Y→6M→4W arc. Name key artists from each period if available. Frame the story of the year.",
    "recentVsLongterm": "Which artists persisted, which entered, which faded. Compare 4W vs 1Y explicitly. Mention core anchors and emerging artists from trajectory data.",
    "varietyAndConcentration": "Artist and genre diversity trend. Is the listener broadening or narrowing? Use diversity metric deltas. Flag genre diversity as unavailable if the data says so.",
    "contradictionsAndPatterns": "Discovery vs loyalty dynamics with actual numbers. What tension exists? Are they loyal but also discovering?",
    "closingSynthesis": "One compelling sentence summarizing the overall trajectory and where this listener appears to be heading."
  }
}`;
}

// ─── External AI Provider Invocation ────────────────────────────────────────

export async function generateTasteAIInterpretation(
  context: TasteAnalysisContext
): Promise<AIInterpretationResponse> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Gemini
  if (geminiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${buildSystemPrompt()}\n\n${buildUserPrompt(context)}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        },
        { timeout: 20000 }
      );

      const rawJson = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          ...parsed,
          metadata: {
            provider: 'gemini',
            isAIGenerated: true,
            notice: 'Longitudinal analysis generated by Lore.fm AI using Google Gemini — all claims grounded in verified Spotify data.',
            calculatedAt: new Date().toISOString(),
          },
        };
      }
    } catch (err) {
      console.warn(
        '[AIService] Gemini request failed or timed out. Falling back to deterministic synthesizer:',
        (err as Error).message
      );
    }
  }

  // 2. OpenAI
  if (openaiKey) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: buildUserPrompt(context) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: { Authorization: `Bearer ${openaiKey}` },
          timeout: 20000,
        }
      );

      const rawJson = response.data?.choices?.[0]?.message?.content;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          ...parsed,
          metadata: {
            provider: 'openai',
            isAIGenerated: true,
            notice: 'Longitudinal analysis generated by Lore.fm AI using OpenAI — all claims grounded in verified Spotify data.',
            calculatedAt: new Date().toISOString(),
          },
        };
      }
    } catch (err) {
      console.warn(
        '[AIService] OpenAI request failed. Falling back to deterministic synthesizer:',
        (err as Error).message
      );
    }
  }

  // 3. Deterministic Fallback
  return generateDeterministicInterpretation(context);
}
