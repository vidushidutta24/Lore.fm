/**
 * AI Interpretation Service
 *
 * Provides a clean adapter layer for interpreting music analytics into
 * personalized, music-focused natural language narratives.
 *
 * Features:
 * - Anti-hallucination grounding: strictly anchored to real calculated context.
 * - Non-psychological musical framing: discusses arrangement, tone, tempo, and genres.
 * - Pluggable LLM integration: Google Gemini / OpenAI / Custom REST via AI_API_KEY.
 * - High-precision deterministic fallback when AI key is absent or unreachable.
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

// ─── Deterministic Analytical Synthesizer (Fallback & Baseline) ──────────────

function generateDeterministicInterpretation(
  context: TasteAnalysisContext
): AIInterpretationResponse {
  const { current, recent, yearly, metricDeltas, trajectory } = context;

  const currentTopGenresStr = current.topGenres.map((g) => g.genre).slice(0, 3).join(', ') || 'eclectic styles';
  const yearlyTopGenresStr = yearly.topGenres.map((g) => g.genre).slice(0, 3).join(', ') || 'varied catalog';
  const currentArtistsStr = current.topArtists.map((a) => a.name).slice(0, 4).join(', ') || 'active rotation';
  const emergingArtistsStr = trajectory.emergingArtists.slice(0, 3).join(', ');
  const risingGenresStr = trajectory.risingGenres.slice(0, 2).join(' and ');
  const coreAnchorsStr = trajectory.coreAnchors.slice(0, 3).join(', ');

  // 1. Where taste is heading
  const headingNarrative = risingGenresStr
    ? `Your listening has been steadily tilting toward ${risingGenresStr}. While your yearly rotation was anchored around ${yearlyTopGenresStr}, the last four weeks show accelerated momentum into newer sonic territory${
        emergingArtistsStr ? `, spearheaded by artists like ${emergingArtistsStr}` : ''
      }.`
    : `Your listening maintains steady continuity around ${currentTopGenresStr}, with consistent depth across your core artists rather than sudden genre pivots.`;

  // 2. How taste has changed
  const diversityChange = metricDeltas.artistDiversity.netChange;
  const loyaltyChange = metricDeltas.loyalty.netChange;
  let primaryShift = 'Balanced evolutionary listening';

  if (diversityChange > 8) {
    primaryShift = 'Noticeable exploratory expansion across a wider artist roster';
  } else if (diversityChange < -8) {
    primaryShift = 'Stronger concentration and deeper focus into a dedicated circle of favorites';
  } else if (loyaltyChange > 8) {
    primaryShift = 'Deepening loyalty to familiar catalog staples';
  }

  const comparisonNarrative = `Over the past year, your artist diversity moved from ${yearly.metrics.artistDiversity} to ${current.metrics.artistDiversity} in the last 4 weeks. ${
    diversityChange > 0
      ? "You've branched out into fresh musical landscapes without abandoning your anchor catalog."
      : "You've settled into a more intimate, focused rotation with repeated visits to your top tracks."
  }`;

  // 3. Musical mood and tone
  const energyDelta = metricDeltas.energy.netChange;
  const acousticDelta = metricDeltas.acousticness.netChange;

  let toneShiftExplanation = `Your recent soundscape sits at an average tempo of ${current.musicalCharacteristics.tempo} BPM with an energy rating of ${current.musicalCharacteristics.energy}/100.`;
  if (energyDelta > 8) {
    toneShiftExplanation += ` Compared to your yearly average, your recent rotation has gained punch and driving momentum, leaning into higher-energy production.`;
  } else if (energyDelta < -8) {
    toneShiftExplanation += ` Compared to your yearly baseline, your recent sessions have noticeably mellowed out, favoring introspective, organic, or acoustic arrangements.`;
  } else if (acousticDelta > 8) {
    toneShiftExplanation += ` Acoustic and textured instrumentation has taken a more prominent seat in your current sound.`;
  } else {
    toneShiftExplanation += ` The energetic balance has stayed remarkably uniform throughout the year.`;
  }

  // 4. Current Sound Identity
  const identityStatement = `Right now, your sound gravitates around ${currentTopGenresStr}. You balance established favorites with newer spins, creating a ${current.musicalCharacteristics.atmosphere.toLowerCase()} atmosphere.`;

  // 5. Your Taste Explained
  const narrativeIntro = `Your music profile is defined by ${current.archetype.title} tendencies—anchored by ${currentTopGenresStr} in the present and framed by a broader history of ${yearlyTopGenresStr}.`;
  const recentVsLong = `Across the last 6 months (${recent.topGenres.map((g) => g.genre).slice(0, 2).join(', ')}), you transitioned smoothly into your current 4-week phase. ${
    emergingArtistsStr
      ? `Fresh entrants like ${emergingArtistsStr} have quickly claimed top rotation spots.`
      : `Longstanding artists remain at the center of your daily sessions.`
  }`;
  const varietyConcentration = `Your artist diversity index stands at ${current.metrics.artistDiversity}/100 and genre diversity at ${current.metrics.genreDiversity}/100. ${
    trajectory.coreAnchors.length > 0
      ? `Artists like ${coreAnchorsStr} serve as the enduring bedrock of your listening.`
      : ''
  }`;
  const patterns = `Your discovery rate is currently calculated at ${current.metrics.discoveryRate}/100 with an artist loyalty score of ${current.metrics.loyaltyScore}/100.`;
  const closingSynthesis = `Overall, your musical trajectory is characterized by authentic intentionality—whether diving deep into specific favorite discs or exploring the fringes of ${currentTopGenresStr}.`;

  return {
    whereTasteIsHeading: {
      headline: risingGenresStr ? `Momentum toward ${risingGenresStr}` : 'Consolidated Musical Direction',
      narrative: headingNarrative,
      keyDrivers: trajectory.emergingArtists.slice(0, 4),
      emergingFocus: risingGenresStr || current.topGenres[0]?.genre || 'Contemporary Soundscapes',
    },
    howTasteHasChanged: {
      headline: `Evolution from 1-Year Baseline to 4-Week Rotation`,
      comparisonNarrative,
      primaryShift,
      metricHighlights: [
        {
          label: 'Artist Diversity',
          change: `${yearly.metrics.artistDiversity} → ${recent.metrics.artistDiversity} → ${current.metrics.artistDiversity}`,
          interpretation: metricDeltas.artistDiversity.interpretation,
        },
        {
          label: 'Genre Diversity',
          change: `${yearly.metrics.genreDiversity} → ${recent.metrics.genreDiversity} → ${current.metrics.genreDiversity}`,
          interpretation: metricDeltas.genreDiversity.interpretation,
        },
        {
          label: 'Discovery Rate',
          change: `${yearly.metrics.discoveryRate} → ${recent.metrics.discoveryRate} → ${current.metrics.discoveryRate}`,
          interpretation: metricDeltas.discovery.interpretation,
        },
        {
          label: 'Artist Loyalty',
          change: `${yearly.metrics.loyaltyScore} → ${recent.metrics.loyaltyScore} → ${current.metrics.loyaltyScore}`,
          interpretation: metricDeltas.loyalty.interpretation,
        },
      ],
    },
    musicalMoodAndTone: {
      headline: current.musicalCharacteristics.atmosphere,
      currentSoundscape: `Dominant tone: ${current.musicalCharacteristics.atmosphere}. Energy: ${current.musicalCharacteristics.energy}/100 | Tempo: ~${current.musicalCharacteristics.tempo} BPM | Acoustic: ${current.musicalCharacteristics.acousticness}/100.`,
      toneShiftExplanation,
      energyTempoAnalysis: `Energy shifted from ${yearly.musicalCharacteristics.energy} (1Y) to ${current.musicalCharacteristics.energy} (4W); Tempo shifted from ${yearly.musicalCharacteristics.tempo} BPM to ${current.musicalCharacteristics.tempo} BPM.`,
    },
    currentSoundIdentity: {
      headline: `Your Sound Right Now`,
      identityStatement,
      coreAtmosphere: current.musicalCharacteristics.atmosphere,
    },
    yourTasteExplained: {
      title: 'Your Musical DNA in Motion',
      introduction: narrativeIntro,
      recentVsLongterm: recentVsLong,
      varietyAndConcentration: varietyConcentration,
      contradictionsAndPatterns: patterns,
      closingSynthesis,
    },
    metadata: {
      provider: 'deterministic_engine',
      isAIGenerated: false,
      notice: 'Computed directly from your authorized Spotify Web API multi-period snapshots.',
      calculatedAt: new Date().toISOString(),
    },
  };
}

// ─── LLM Prompt Construction ────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are Lore.fm's Lead Music AI Analyst.
Your role is to interpret a listener's mathematical music taste metrics across three timeframes:
- Last 4 Weeks (CURRENT)
- Last 6 Months (RECENT ERA)
- Last 1 Year (LONG-TERM BASELINE)

CRITICAL RULES & GUARDRAILS:
1. STRICT DATA INTEGRITY: You are an INTERPRETER, not a data generator. You MUST ONLY reference artist names, genre names, and numbers that are explicitly given in the user data context. NEVER invent artists, genres, track counts, or statistics.
2. MUSIC-FOCUSED & NON-PSYCHOLOGICAL: Discuss musical characteristics, production style, tempo, acoustic textures, arrangement, and artist eras. NEVER make psychological or medical assertions (e.g. NEVER say "You are sad/depressed"). Say "Your listening leans into introspective, acoustic arrangements."
3. TONE & STYLE: Personal, conversational, perceptive, music-knowledgeable, and engaging. Avoid dry corporate jargon (e.g. avoid "auditory preference diversification indices").
4. RETURN STRICT JSON: You must respond ONLY with a valid JSON object strictly adhering to the specified schema.`;
}

function buildUserPrompt(context: TasteAnalysisContext): string {
  return `Analyze this listener's verified Spotify data context and produce a structured JSON response:

DATA CONTEXT:
${JSON.stringify(context, null, 2)}

Required JSON Schema:
{
  "whereTasteIsHeading": {
    "headline": "Short snappy title (e.g., 'A Shift Toward Ambient & Indie-Pop')",
    "narrative": "Conversational paragraph explaining where taste is trending from 1Y to 4W",
    "keyDrivers": ["Artist1", "Artist2"],
    "emergingFocus": "Genre or style name"
  },
  "howTasteHasChanged": {
    "headline": "Summary title of the multi-period shift",
    "comparisonNarrative": "Comparative narrative contrasting 1-Year baseline vs 4-Week current rotation",
    "primaryShift": "One-line takeaway of the primary evolutionary change",
    "metricHighlights": [
      {
        "label": "Artist Diversity",
        "change": "1Y XX → 6M YY → 4W ZZ",
        "interpretation": "Short conversational meaning of this change"
      },
      {
        "label": "Genre Diversity",
        "change": "1Y XX → 6M YY → 4W ZZ",
        "interpretation": "Short conversational meaning"
      },
      {
        "label": "Discovery Rate",
        "change": "1Y XX → 6M YY → 4W ZZ",
        "interpretation": "Short conversational meaning"
      },
      {
        "label": "Artist Loyalty",
        "change": "1Y XX → 6M YY → 4W ZZ",
        "interpretation": "Short conversational meaning"
      }
    ]
  },
  "musicalMoodAndTone": {
    "headline": "Atmosphere / vibe title",
    "currentSoundscape": "Description of the current sonic environment",
    "toneShiftExplanation": "How tempo, energy, and acoustic textures shifted across periods",
    "energyTempoAnalysis": "Clear factual comparison of energy and tempo numbers across periods"
  },
  "currentSoundIdentity": {
    "headline": "Your Sound Right Now",
    "identityStatement": "A sharp, 2-3 sentence summary of what this listener sounds like right now",
    "coreAtmosphere": "E.g., High-Energy & Punchy or Introspective Acoustic"
  },
  "yourTasteExplained": {
    "title": "Your Musical Journey, Explained",
    "introduction": "Engaging opening framing current vs past taste",
    "recentVsLongterm": "Detailed breakdown comparing 4 weeks with 6 months and 1 year",
    "varietyAndConcentration": "Analysis of artist breadth vs focus",
    "contradictionsAndPatterns": "Notable habits, loyalty anchors, and discovery behaviors",
    "closingSynthesis": "Encouraging, perceptive concluding thought"
  }
}`;
}

// ─── External AI Provider Invocation ────────────────────────────────────────

export async function generateTasteAIInterpretation(
  context: TasteAnalysisContext
): Promise<AIInterpretationResponse> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. If Gemini API Key is provided
  if (geminiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${buildSystemPrompt()}\n\n${buildUserPrompt(context)}` },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        },
        { timeout: 15000 }
      );

      const rawJson = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          ...parsed,
          metadata: {
            provider: 'gemini',
            isAIGenerated: true,
            notice: 'Generated using Lore.fm AI interpretation engine & Google Gemini.',
            calculatedAt: new Date().toISOString(),
          },
        };
      }
    } catch (err) {
      console.warn('[AIService] Gemini request failed or timed out. Falling back to deterministic synthesizer:', (err as Error).message);
    }
  }

  // 2. If OpenAI API Key is provided
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
          temperature: 0.4,
        },
        {
          headers: { Authorization: `Bearer ${openaiKey}` },
          timeout: 15000,
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
            notice: 'Generated using Lore.fm AI interpretation engine & OpenAI.',
            calculatedAt: new Date().toISOString(),
          },
        };
      }
    } catch (err) {
      console.warn('[AIService] OpenAI request failed. Falling back to deterministic synthesizer:', (err as Error).message);
    }
  }

  // 3. Fallback: High-Precision Deterministic Synthesizer
  return generateDeterministicInterpretation(context);
}
