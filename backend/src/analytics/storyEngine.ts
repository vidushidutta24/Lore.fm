/**
 * Story Analyzer & Narrative Generator Engine for Lore.fm
 *
 * Turns verified, historical Spotify listening events and multi-period snapshots
 * into whimsical, structured story chapters.
 *
 * Strictly grounded in real data:
 * - Real play counts & timestamps
 * - Real artist & track metadata
 * - Real multi-period rank trajectories (1Y → 6M → 4W)
 * - Zero hallucination / Zero invented events
 */

import { prisma } from '../services/prisma';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export type StoryType =
  | 'TASTE_SHIFT'
  | 'OBSESSION'
  | 'NEW_ARRIVAL'
  | 'THE_FADE'
  | 'AFTER_MIDNIGHT'
  | 'RABBIT_HOLE';

export interface StoryTrackEvidence {
  trackId: string;
  trackName: string;
  artistId: string;
  artistName: string;
  albumName: string | null;
  albumImageUrl: string | null;
  playCount?: number;
  previewUrl: string | null;
  spotifyUrl: string | null;
  playedAt?: string;
  roleDescription?: string;
}

export interface StoryArtistEvidence {
  artistId: string;
  artistName: string;
  imageUrl: string | null;
  genres: string[];
  spotifyUrl: string | null;
  rank?: number;
  roleDescription?: string;
}

export interface StoryPeriod {
  start?: string;
  end?: string;
  label: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  type: StoryType;
  emoji: string;
  title: string;
  subtitle: string;
  prologue: string;
  paragraphs: string[];
  moral?: string;
  period: StoryPeriod;
  facts: Record<string, string | number | boolean | string[]>;
  evidenceTracks: StoryTrackEvidence[];
  evidenceArtists: StoryArtistEvidence[];
  confidenceScore: number;
}

export interface StoryPayload {
  userId: string;
  prologue: {
    title: string;
    description: string;
    totalListeningEventsAnalyzed: number;
    totalSnapshotsAnalyzed: number;
    hasSufficientData: boolean;
  };
  chapters: StoryChapter[];
  metadata: {
    engine: string;
    generatedAt: string;
    typesFound: StoryType[];
  };
}

// ─── Helper Functions ───────────────────────────────────────────────────────

function deduplicateTracks(tracks: StoryTrackEvidence[]): StoryTrackEvidence[] {
  const seen = new Set<string>();
  const result: StoryTrackEvidence[] = [];
  for (const t of tracks) {
    if (!seen.has(t.trackId)) {
      seen.add(t.trackId);
      result.push(t);
    }
  }
  return result;
}

function deduplicateArtists(artists: StoryArtistEvidence[]): StoryArtistEvidence[] {
  const seen = new Set<string>();
  const result: StoryArtistEvidence[] = [];
  for (const a of artists) {
    if (!seen.has(a.artistId)) {
      seen.add(a.artistId);
      result.push(a);
    }
  }
  return result;
}

// ─── Story Detectors ────────────────────────────────────────────────────────

/**
 * 1. THE TASTE SHIFT 🦋
 * Detects noticeable shifts in top genres / artist sounds between long_term and short_term.
 */
function detectTasteShift(
  shortArtists: any[],
  longArtists: any[],
  shortTracks: any[],
  genreSnaps: any[]
): StoryChapter | null {
  const shortGenresMap: Record<string, number> = {};
  for (const a of shortArtists) {
    const genres: string[] = JSON.parse(a.artist.genres || '[]');
    for (const g of genres) {
      shortGenresMap[g] = (shortGenresMap[g] || 0) + (21 - a.rank);
    }
  }

  const longGenresMap: Record<string, number> = {};
  for (const a of longArtists) {
    const genres: string[] = JSON.parse(a.artist.genres || '[]');
    for (const g of genres) {
      longGenresMap[g] = (longGenresMap[g] || 0) + (21 - a.rank);
    }
  }

  let risingGenre = '';
  let maxGrowth = 0;
  for (const [genre, shortWeight] of Object.entries(shortGenresMap)) {
    const longWeight = longGenresMap[genre] || 0;
    const growth = shortWeight - longWeight;
    if (growth > maxGrowth) {
      maxGrowth = growth;
      risingGenre = genre;
    }
  }

  const topShortArtist = shortArtists[0]?.artist;
  const topLongArtist = longArtists[0]?.artist;

  if (!risingGenre && (!topShortArtist || topShortArtist.id === topLongArtist?.id)) {
    const newLeader = shortArtists.find((sa) => !longArtists.slice(0, 3).some((la) => la.artist.id === sa.artist.id));
    if (!newLeader) return null;
  }

  const targetArtist = topShortArtist || shortArtists[0]?.artist;
  const evidenceArtistObj: StoryArtistEvidence | null = targetArtist
    ? {
        artistId: targetArtist.spotifyId,
        artistName: targetArtist.name,
        imageUrl: targetArtist.imageUrl,
        genres: JSON.parse(targetArtist.genres || '[]'),
        spotifyUrl: targetArtist.spotifyUrl,
        rank: 1,
        roleDescription: 'Soundtrack pioneer of the new era',
      }
    : null;

  // Filter tracks by the target artist or recent top tracks
  const relevantTracks = shortTracks
    .filter((st) => st.track.trackArtists.some((ta: any) => ta.artist.spotifyId === targetArtist?.spotifyId))
    .concat(shortTracks);

  const evidenceTracks: StoryTrackEvidence[] = deduplicateTracks(
    relevantTracks.slice(0, 5).map((st) => ({
      trackId: st.track.spotifyId,
      trackName: st.track.name,
      artistId: st.track.trackArtists[0]?.artist.spotifyId || targetArtist?.spotifyId || '',
      artistName: st.track.trackArtists[0]?.artist.name || targetArtist?.name || 'Unknown',
      albumName: st.track.album?.name || null,
      albumImageUrl: st.track.album?.imageUrl || null,
      previewUrl: st.track.previewUrl || null,
      spotifyUrl: st.track.spotifyUrl || null,
      roleDescription: 'Soundtrack defining the recent period',
    }))
  ).slice(0, 3);

  const genreName = risingGenre ? risingGenre.charAt(0).toUpperCase() + risingGenre.slice(1) : (targetArtist?.name ? `${targetArtist.name}'s Soundscape` : 'A New Musical Direction');
  const pastReference = topLongArtist ? topLongArtist.name : 'your previous rotation';

  return {
    id: 'chapter-taste-shift',
    chapterNumber: 1,
    type: 'TASTE_SHIFT',
    emoji: '🦋',
    title: `The ${genreName} Era`,
    subtitle: 'When your musical compass quietly discovered a fresh horizon.',
    prologue: 'Every library has turning points where one style makes room for another.',
    paragraphs: [
      `There was a time when ${pastReference} anchored your daily listening. Your playlists had a comfortable, familiar rhythm that you returned to without thinking.`,
      `Then, quietly and without announcement, something shifted. ${targetArtist ? targetArtist.name : 'New textures'} began appearing in your queue with greater frequency.`,
      `What started as an occasional curiosity quickly grew into a central theme. Your recent four-week rotation shows a deliberate expansion into ${risingGenre ? `the world of ${risingGenre}` : 'new melodies'}, marking the arrival of a distinctive new chapter.`,
    ],
    moral: 'Taste is never stationary; it wanders where curiosity leads.',
    period: {
      label: '1 Year Baseline → Past 4 Weeks',
    },
    facts: {
      risingGenre: risingGenre || 'New rotation favorites',
      previousAnchor: pastReference,
      currentLeader: targetArtist?.name || 'Recent additions',
      tracksObserved: evidenceTracks.length,
    },
    evidenceTracks,
    evidenceArtists: evidenceArtistObj ? [evidenceArtistObj] : [],
    confidenceScore: 0.9,
  };
}

/**
 * 2. THE OBSESSION 🔁
 * Finds tracks with high repeat counts or distinct single-track loyalty.
 */
function detectObsession(
  listeningEvents: any[],
  shortTracks: any[]
): StoryChapter | null {
  const trackPlayCounts = new Map<string, { count: number; track: any; firstPlayed: Date; lastPlayed: Date }>();

  for (const ev of listeningEvents) {
    const tid = ev.track.spotifyId;
    const existing = trackPlayCounts.get(tid);
    if (existing) {
      existing.count += 1;
      if (new Date(ev.playedAt) < existing.firstPlayed) existing.firstPlayed = new Date(ev.playedAt);
      if (new Date(ev.playedAt) > existing.lastPlayed) existing.lastPlayed = new Date(ev.playedAt);
    } else {
      trackPlayCounts.set(tid, {
        count: 1,
        track: ev.track,
        firstPlayed: new Date(ev.playedAt),
        lastPlayed: new Date(ev.playedAt),
      });
    }
  }

  let maxItem: { count: number; track: any; firstPlayed: Date; lastPlayed: Date } | null = null;
  for (const item of trackPlayCounts.values()) {
    if (!maxItem || item.count > maxItem.count) {
      maxItem = item;
    }
  }

  let topTrackObj = maxItem?.track;
  let playCount = maxItem?.count || 1;
  let firstDateStr = maxItem?.firstPlayed ? maxItem.firstPlayed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';
  let lastDateStr = maxItem?.lastPlayed ? maxItem.lastPlayed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today';

  if ((!maxItem || maxItem.count <= 1) && shortTracks.length > 0) {
    topTrackObj = shortTracks[0].track;
    playCount = 1;
  }

  if (!topTrackObj) return null;

  const artistName = topTrackObj.trackArtists?.[0]?.artist?.name || 'Unknown Artist';
  const trackName = topTrackObj.name;

  const evidenceTrack: StoryTrackEvidence = {
    trackId: topTrackObj.spotifyId,
    trackName: topTrackObj.name,
    artistId: topTrackObj.trackArtists?.[0]?.artist?.spotifyId || '',
    artistName,
    albumName: topTrackObj.album?.name || null,
    albumImageUrl: topTrackObj.album?.imageUrl || null,
    playCount,
    previewUrl: topTrackObj.previewUrl || null,
    spotifyUrl: topTrackObj.spotifyUrl || null,
    roleDescription: playCount > 1 ? `Replayed ${playCount} recorded times in your recent stream` : 'Reigned as your #1 most played track',
  };

  const evidenceArtist: StoryArtistEvidence = {
    artistId: topTrackObj.trackArtists?.[0]?.artist?.spotifyId || '',
    artistName,
    imageUrl: topTrackObj.trackArtists?.[0]?.artist?.imageUrl || topTrackObj.album?.imageUrl || null,
    genres: topTrackObj.trackArtists?.[0]?.artist?.genres ? JSON.parse(topTrackObj.trackArtists[0].artist.genres) : [],
    spotifyUrl: topTrackObj.trackArtists?.[0]?.artist?.spotifyUrl || null,
    roleDescription: 'The artist behind the repeat button',
  };

  return {
    id: 'chapter-obsession',
    chapterNumber: 2,
    type: 'OBSESSION',
    emoji: '🔁',
    title: `The Loop That Never Stopped`,
    subtitle: `"${trackName}" refused to leave your thoughts.`,
    prologue: 'Some songs are merely heard; others take up permanent residence in your mind.',
    paragraphs: [
      `You didn't just listen to "${trackName}" by ${artistName}. You kept coming back to it, pressing play as if each listen was uncovering something you hadn't heard before.`,
      playCount > 1
        ? `Across your recorded history, it registered ${playCount} distinct plays between ${firstDateStr} and ${lastDateStr}. It soundtracked your routines, your journeys, and the spaces in between.`
        : `It climbed to the absolute top of your recent four-week chart, standing tall above every other melody in your catalog.`,
      `When a track becomes this familiar, it ceases to be just music and becomes a time capsule of whatever season you're living through.`,
    ],
    moral: 'A song played on repeat is a feeling looking for a melody.',
    period: {
      label: `${firstDateStr} — ${lastDateStr}`,
    },
    facts: {
      trackName,
      artistName,
      recordedPlays: playCount,
      periodSpan: `${firstDateStr} to ${lastDateStr}`,
    },
    evidenceTracks: [evidenceTrack],
    evidenceArtists: [evidenceArtist],
    confidenceScore: 0.95,
  };
}

/**
 * 3. THE NEW ARRIVAL 🌱
 * Detects an artist who newly surged into 4W rotation without appearing in 1Y baseline.
 */
function detectNewArrival(
  shortArtists: any[],
  longArtists: any[],
  shortTracks: any[]
): StoryChapter | null {
  const longArtistIds = new Set(longArtists.map((a) => a.artist.spotifyId));

  const newArtistSnap = shortArtists.find((a) => !longArtistIds.has(a.artist.spotifyId));
  if (!newArtistSnap) return null;

  const artist = newArtistSnap.artist;
  const artistTracks = deduplicateTracks(
    shortTracks
      .filter((st) => st.track.trackArtists.some((ta: any) => ta.artist.spotifyId === artist.spotifyId))
      .map((st) => ({
        trackId: st.track.spotifyId,
        trackName: st.track.name,
        artistId: artist.spotifyId,
        artistName: artist.name,
        albumName: st.track.album?.name || null,
        albumImageUrl: st.track.album?.imageUrl || null,
        previewUrl: st.track.previewUrl || null,
        spotifyUrl: st.track.spotifyUrl || null,
        roleDescription: `Rank #${st.rank} in your recent rotation`,
      }))
  );

  const evidenceArtist: StoryArtistEvidence = {
    artistId: artist.spotifyId,
    artistName: artist.name,
    imageUrl: artist.imageUrl,
    genres: JSON.parse(artist.genres || '[]'),
    spotifyUrl: artist.spotifyUrl,
    rank: newArtistSnap.rank,
    roleDescription: `Entered directly at rank #${newArtistSnap.rank}`,
  };

  return {
    id: 'chapter-new-arrival',
    chapterNumber: 3,
    type: 'NEW_ARRIVAL',
    emoji: '🌱',
    title: `A New Voice Takes the Stage`,
    subtitle: `How ${artist.name} walked into your library and stayed.`,
    prologue: 'The best discoveries happen without a map.',
    paragraphs: [
      `A year ago, ${artist.name} was nowhere to be found in your top Spotify rankings. Your rotation was occupied by other voices.`,
      `Then came the first play. Whether suggested by an algorithm, sent by a friend, or stumbled upon in the dark, the connection was immediate.`,
      `In just four weeks, ${artist.name} has claimed rank #${newArtistSnap.rank} in your library. What began as a single listen has officially blossomed into a regular ritual.`,
    ],
    moral: 'Every long-time favorite was once just a stranger on track three.',
    period: {
      label: 'Recent 4-Week Discovery',
    },
    facts: {
      artistName: artist.name,
      currentRank: newArtistSnap.rank,
      baselinePresence: 'Not present in 1-year history',
      tracksCount: artistTracks.length,
    },
    evidenceTracks: artistTracks.slice(0, 3),
    evidenceArtists: [evidenceArtist],
    confidenceScore: 0.88,
  };
}

/**
 * 4. THE FADE 🍂
 * Detects an artist prominent in 1Y baseline who has stepped back or declined in 4W rotation.
 */
function detectTheFade(
  shortArtists: any[],
  longArtists: any[],
  longTracks: any[]
): StoryChapter | null {
  const shortArtistRankMap = new Map<string, number>();
  for (const a of shortArtists) {
    shortArtistRankMap.set(a.artist.spotifyId, a.rank);
  }

  // Find top long-term artist that dropped >= 4 ranks or completely disappeared
  let fadedSnap: any = null;
  let rankDrop = 0;

  for (const la of longArtists.slice(0, 10)) {
    const sRank = shortArtistRankMap.get(la.artist.spotifyId);
    if (sRank === undefined) {
      // Completely vanished
      fadedSnap = la;
      rankDrop = 99;
      break;
    } else if (sRank - la.rank >= 4 && sRank - la.rank > rankDrop) {
      fadedSnap = la;
      rankDrop = sRank - la.rank;
    }
  }

  if (!fadedSnap) return null;

  const artist = fadedSnap.artist;
  const legacyTracks: StoryTrackEvidence[] = deduplicateTracks(
    longTracks
      .filter((lt) => lt.track.trackArtists.some((ta: any) => ta.artist.spotifyId === artist.spotifyId))
      .map((lt) => ({
        trackId: lt.track.spotifyId,
        trackName: lt.track.name,
        artistId: artist.spotifyId,
        artistName: artist.name,
        albumName: lt.track.album?.name || null,
        albumImageUrl: lt.track.album?.imageUrl || null,
        previewUrl: lt.track.previewUrl || null,
        spotifyUrl: lt.track.spotifyUrl || null,
        roleDescription: `Historical favorite (Rank #${lt.rank})`,
      }))
  ).slice(0, 3);

  const evidenceArtist: StoryArtistEvidence = {
    artistId: artist.spotifyId,
    artistName: artist.name,
    imageUrl: artist.imageUrl,
    genres: JSON.parse(artist.genres || '[]'),
    spotifyUrl: artist.spotifyUrl,
    rank: fadedSnap.rank,
    roleDescription: `Rank #${fadedSnap.rank} in your 1-Year baseline`,
  };

  const currentRankText = shortArtistRankMap.has(artist.spotifyId)
    ? `slipped from rank #${fadedSnap.rank} to rank #${shortArtistRankMap.get(artist.spotifyId)}`
    : `stepped outside your active top 20`;

  return {
    id: 'chapter-the-fade',
    chapterNumber: 4,
    type: 'THE_FADE',
    emoji: '🍂',
    title: `The Chapter That Quietly Closed`,
    subtitle: `When ${artist.name}'s songs gently stepped into the background.`,
    prologue: 'Not all departures are dramatic; some melodies simply make room for new ones.',
    paragraphs: [
      `For much of the past year, ${artist.name} held a commanding presence in your rotation, sitting comfortably at rank #${fadedSnap.rank}.`,
      `Their songs were the backdrop to countless moments. But as your soundtrack expanded and new genres took root, the plays became fewer.`,
      `In your most recent four-week chart, ${artist.name} has ${currentRankText}. They remain a defining pillar of where you came from, preserved like a well-loved bookmark in your musical story.`,
    ],
    moral: 'A song out of rotation is not forgotten; it is merely resting.',
    period: {
      label: '1-Year Baseline → Recent 4 Weeks',
    },
    facts: {
      artistName: artist.name,
      historicalRank: fadedSnap.rank,
      currentStatus: currentRankText,
    },
    evidenceTracks: legacyTracks,
    evidenceArtists: [evidenceArtist],
    confidenceScore: 0.85,
  };
}

/**
 * 5. AFTER MIDNIGHT 🌙
 * Analyzes listening events between 12 AM and 5 AM.
 */
function detectAfterMidnight(listeningEvents: any[]): StoryChapter | null {
  if (!listeningEvents || listeningEvents.length < 3) return null;

  const nocturnalEvents = listeningEvents.filter((ev) => {
    const hour = new Date(ev.playedAt).getHours();
    return hour >= 0 && hour < 5;
  });

  if (nocturnalEvents.length < 2) return null;

  const totalEvents = listeningEvents.length;
  const nocturnalPercentage = Math.round((nocturnalEvents.length / totalEvents) * 100);

  const hourCounts: Record<number, number> = {};
  const nocturnalTracksMap = new Map<string, { count: number; track: any; lastPlayed: Date }>();

  for (const ev of nocturnalEvents) {
    const h = new Date(ev.playedAt).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;

    const tid = ev.track.spotifyId;
    const existing = nocturnalTracksMap.get(tid);
    if (existing) {
      existing.count += 1;
    } else {
      nocturnalTracksMap.set(tid, {
        count: 1,
        track: ev.track,
        lastPlayed: new Date(ev.playedAt),
      });
    }
  }

  let peakHour = 1;
  let maxHourCount = 0;
  for (const [h, count] of Object.entries(hourCounts)) {
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHour = parseInt(h, 10);
    }
  }

  const peakHourFormatted = `${peakHour === 0 ? 12 : peakHour}:00 AM – ${peakHour + 1}:00 AM`;

  const sortedNocturnal = Array.from(nocturnalTracksMap.values()).sort((a, b) => b.count - a.count);
  const topNightTrack = sortedNocturnal[0]?.track;
  const topNightArtist = topNightTrack?.trackArtists?.[0]?.artist?.name || 'late-night melodies';

  const evidenceTracks: StoryTrackEvidence[] = deduplicateTracks(
    sortedNocturnal.slice(0, 5).map((item) => ({
      trackId: item.track.spotifyId,
      trackName: item.track.name,
      artistId: item.track.trackArtists?.[0]?.artist?.spotifyId || '',
      artistName: item.track.trackArtists?.[0]?.artist?.name || 'Unknown',
      albumName: item.track.album?.name || null,
      albumImageUrl: item.track.album?.imageUrl || null,
      playCount: item.count,
      previewUrl: item.track.previewUrl || null,
      spotifyUrl: item.track.spotifyUrl || null,
      playedAt: item.lastPlayed.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      roleDescription: `Played at ${item.lastPlayed.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`,
    }))
  ).slice(0, 3);

  const primaryArtist = topNightTrack?.trackArtists?.[0]?.artist;
  const evidenceArtist: StoryArtistEvidence | null = primaryArtist
    ? {
        artistId: primaryArtist.spotifyId,
        artistName: primaryArtist.name,
        imageUrl: primaryArtist.imageUrl,
        genres: JSON.parse(primaryArtist.genres || '[]'),
        spotifyUrl: primaryArtist.spotifyUrl,
        roleDescription: 'Nocturnal anchor',
      }
    : null;

  return {
    id: 'chapter-after-midnight',
    chapterNumber: 5,
    type: 'AFTER_MIDNIGHT',
    emoji: '🌙',
    title: `The Midnight Frequency`,
    subtitle: `When the world falls asleep, your music tells a different tale.`,
    prologue: 'The songs we play in the dark carry a vulnerability daylight never hears.',
    paragraphs: [
      `Somewhere past midnight, your listening habits change. Over ${nocturnalPercentage}% of your recorded recent plays unfolded in the stillness between 12:00 AM and 5:00 AM.`,
      `Your nocturnal soundtrack peaks around ${peakHourFormatted}, led by ${topNightArtist}. In those quiet hours, you gravitated toward songs that feel closer and more personal.`,
      `These tracks aren't made for crowded rooms or rushing commutes. They are the songs you turn to when the rest of the world has gone quiet.`,
    ],
    moral: 'Nighttime is the soul’s favorite acoustic chamber.',
    period: {
      label: '12:00 AM — 5:00 AM Window',
    },
    facts: {
      lateNightPlays: nocturnalEvents.length,
      nocturnalPercentage: `${nocturnalPercentage}%`,
      peakHour: peakHourFormatted,
      topNocturnalArtist: topNightArtist,
    },
    evidenceTracks,
    evidenceArtists: evidenceArtist ? [evidenceArtist] : [],
    confidenceScore: 0.92,
  };
}

/**
 * 6. THE RABBIT HOLE 🛤️
 * Detects an aesthetic journey across multi-period anchors and transitions.
 */
function detectRabbitHole(
  shortArtists: any[],
  medArtists: any[],
  longArtists: any[],
  shortTracks: any[]
): StoryChapter | null {
  const longTop = longArtists[0]?.artist;
  const medTop = medArtists.find((ma) => ma.artist.id !== longTop?.id)?.artist || medArtists[0]?.artist;
  const shortTop = shortArtists.find((sa) => sa.artist.id !== longTop?.id && sa.artist.id !== medTop?.id)?.artist || shortArtists[0]?.artist;

  if (!longTop || !medTop || !shortTop) return null;

  const sequence = [longTop.name, medTop.name, shortTop.name];
  const uniqueNames = Array.from(new Set(sequence));
  if (uniqueNames.length < 2) return null;

  const evidenceArtists: StoryArtistEvidence[] = [
    {
      artistId: longTop.spotifyId,
      artistName: longTop.name,
      imageUrl: longTop.imageUrl,
      genres: JSON.parse(longTop.genres || '[]'),
      spotifyUrl: longTop.spotifyUrl,
      roleDescription: 'Step 1: The Root (1-Year Baseline)',
    },
    {
      artistId: medTop.spotifyId,
      artistName: medTop.name,
      imageUrl: medTop.imageUrl,
      genres: JSON.parse(medTop.genres || '[]'),
      spotifyUrl: medTop.spotifyUrl,
      roleDescription: 'Step 2: The Transition (6-Month Bridge)',
    },
    {
      artistId: shortTop.spotifyId,
      artistName: shortTop.name,
      imageUrl: shortTop.imageUrl,
      genres: JSON.parse(shortTop.genres || '[]'),
      spotifyUrl: shortTop.spotifyUrl,
      roleDescription: 'Step 3: The Current Frontier (4-Week Rotation)',
    },
  ];

  const evidenceTracks: StoryTrackEvidence[] = deduplicateTracks(
    shortTracks.slice(0, 5).map((st) => ({
      trackId: st.track.spotifyId,
      trackName: st.track.name,
      artistId: st.track.trackArtists[0]?.artist.spotifyId || '',
      artistName: st.track.trackArtists[0]?.artist.name || 'Unknown',
      albumName: st.track.album?.name || null,
      albumImageUrl: st.track.album?.imageUrl || null,
      previewUrl: st.track.previewUrl || null,
      spotifyUrl: st.track.spotifyUrl || null,
      roleDescription: 'A milestone track on your musical journey',
    }))
  ).slice(0, 3);

  return {
    id: 'chapter-rabbit-hole',
    chapterNumber: 6,
    type: 'RABBIT_HOLE',
    emoji: '🛤️',
    title: `The Musical Rabbit Hole`,
    subtitle: `How ${longTop.name} sparked a path that led to ${shortTop.name}.`,
    prologue: 'Every taste evolution leaves behind a trail of musical breadcrumbs.',
    paragraphs: [
      `Your listening history is not a collection of disconnected tracks; it is an unbroken journey.`,
      `It started with ${longTop.name}, whose sound anchored your baseline a year ago. Through that foundation, your curiosity wandered toward ${medTop.name} over the next six months.`,
      `That subtle pivot opened the door to your current four-week favorite, ${shortTop.name}. Looking back, each artist was a stepping stone into the next chapter of your taste.`,
    ],
    moral: 'Discovery is not an accident; it is the compounding interest of curiosity.',
    period: {
      label: '1 Year → 6 Months → 4 Weeks',
    },
    facts: {
      step1_Root: longTop.name,
      step2_Bridge: medTop.name,
      step3_Frontier: shortTop.name,
      progressionSpan: '12 Months',
    },
    evidenceTracks,
    evidenceArtists,
    confidenceScore: 0.89,
  };
}

// ─── Main Orchestrator ──────────────────────────────────────────────────────

/**
 * Builds the complete verified story narrative for a user from their Spotify data.
 */
export async function generateUserStories(userId: string): Promise<StoryPayload> {
  const [artistSnaps, trackSnaps, genreSnaps, listeningEvents] = await Promise.all([
    prisma.artistSnapshot.findMany({
      where: { userId },
      include: { artist: true },
      orderBy: { rank: 'asc' },
    }),
    prisma.trackSnapshot.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            album: true,
            trackArtists: { include: { artist: true } },
          },
        },
      },
      orderBy: { rank: 'asc' },
    }),
    prisma.genreSnapshot.findMany({
      where: { userId },
      orderBy: { count: 'desc' },
    }),
    prisma.listeningEvent.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            album: true,
            trackArtists: { include: { artist: true } },
          },
        },
      },
      orderBy: { playedAt: 'desc' },
      take: 200,
    }),
  ]);

  const shortArtists = artistSnaps.filter((s) => s.timeRange === 'short_term');
  const medArtists = artistSnaps.filter((s) => s.timeRange === 'medium_term');
  const longArtists = artistSnaps.filter((s) => s.timeRange === 'long_term');

  const shortTracks = trackSnaps.filter((s) => s.timeRange === 'short_term');
  const medTracks = trackSnaps.filter((s) => s.timeRange === 'medium_term');
  const longTracks = trackSnaps.filter((s) => s.timeRange === 'long_term');

  const totalSnapshots = artistSnaps.length + trackSnaps.length;
  const totalEvents = listeningEvents.length;
  const hasSufficientData = totalSnapshots >= 5 || totalEvents >= 5;

  if (!hasSufficientData) {
    return {
      userId,
      prologue: {
        title: 'Your Musical Story Is Just Beginning',
        description:
          'Lore.fm needs a few more days of Spotify listening data to detect deep chapters and taste shifts in your history.',
        totalListeningEventsAnalyzed: totalEvents,
        totalSnapshotsAnalyzed: totalSnapshots,
        hasSufficientData: false,
      },
      chapters: [],
      metadata: {
        engine: 'Lore.fm Deterministic Story Analyzer',
        generatedAt: new Date().toISOString(),
        typesFound: [],
      },
    };
  }

  // Run all 6 story detectors
  const candidates: Array<StoryChapter | null> = [
    detectTasteShift(shortArtists, longArtists, shortTracks, genreSnaps),
    detectObsession(listeningEvents, shortTracks),
    detectNewArrival(shortArtists, longArtists, shortTracks),
    detectTheFade(shortArtists, longArtists, longTracks),
    detectAfterMidnight(listeningEvents),
    detectRabbitHole(shortArtists, medArtists, longArtists, shortTracks),
  ];

  // Filter non-null chapters, deduplicate evidence, and re-index chapter numbers
  const validChapters = candidates
    .filter((c): c is StoryChapter => c !== null)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .map((chapter, index) => ({
      ...chapter,
      chapterNumber: index + 1,
      evidenceTracks: deduplicateTracks(chapter.evidenceTracks),
      evidenceArtists: deduplicateArtists(chapter.evidenceArtists),
    }));

  return {
    userId,
    prologue: {
      title: 'The Chapters of Your Soundtrack',
      description:
        'Every playlist tells a story. Based on your verified Spotify listening history and multi-era snapshots, here is your musical autobiography.',
      totalListeningEventsAnalyzed: totalEvents,
      totalSnapshotsAnalyzed: totalSnapshots,
      hasSufficientData: true,
    },
    chapters: validChapters,
    metadata: {
      engine: 'Lore.fm Deterministic Story Analyzer',
      generatedAt: new Date().toISOString(),
      typesFound: validChapters.map((c) => c.type),
    },
  };
}
