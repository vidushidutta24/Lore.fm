🎧 Personal Spotify Music Analyzer

A personalized music intelligence dashboard that connects to Spotify,
learns from your listening history, tracks how your taste evolves over
time, and turns your listening habits into insights, recommendations,
and playful stories.

Spotify gives you the data. This project tries to understand what it
says about you.

✨ What Is This?

This project is a personal Spotify assistant that goes beyond showing
basic statistics.

Instead of only answering:

"Who are my top artists?"

it aims to answer:

"How has my music taste changed?"

"What kind of listener am I?"

"Which artists or genres should I explore next?"

"What does my recent listening say about the phase of life I'm in?"

The application combines Spotify data, historical snapshots, analytics,
visualizations, recommendations, and a playful music-based storytelling
layer.

🚀 Core Features

🎵 Spotify Connection

Secure Spotify authentication

Connect/disconnect Spotify account

Retrieve authorized Spotify listening data

No Spotify passwords stored by the application

📊 Personal Music Dashboard

Top artists

Top tracks

Top albums where available

Recently played music where available

Favorite artists and recurring listens

Genre overview

Current listening profile

🧬 Music DNA

Analyze characteristics of the user's music taste, including: - Dominant
genres - Genre diversity - Artist diversity - Artist loyalty - Discovery
behavior - Mainstream vs. niche tendencies - Recurring musical patterns

Generate playful listener archetypes such as: - The Genre Explorer - The
Pop Loyalist - The Emotional Listener - The Nostalgic Listener

These labels should be based on measurable listening patterns, not
random guesses.

📈 Taste Evolution

Track music taste across time: - Recent period - Medium-term period -
Long-term period - Historical snapshots - Year-over-year comparisons

Visualize: - Genre shifts - Artist changes - Discovery patterns -
Changes in music diversity - Musical phases

🗓️ Personal Music Timeline

Create a visual timeline showing how the user's music taste changes over
the years.

Example:

2024 → 2025 → 2026

Highlight major artists, genres, and noticeable changes.

🔮 Lore Wrapped — Yearly Wrapped Predictor

Predict what the user's Spotify Wrapped may look like based on their
listening data throughout the year.

The feature should estimate:

Potential #1 artist

Potential #1 song

Top artists

Top genres

Estimated listening minutes

Artists or songs currently trending toward the user's Wrapped

Changes in predictions as listening behavior changes

The predictor should use actual listening data and transparent calculations.
It should not pretend to know Spotify's final Wrapped results.

Where appropriate, show prediction confidence based on the stability and
strength of the available listening trends.

The prediction should update as new listening data is collected.

AI can be used to explain the predictions in a playful, personalized way,
but the underlying predictions should come from the application's
calculation engine rather than being invented by the AI.

🔮 Personalized Discovery & ML Recommendation Engine

Lore.fm uses the user's listening history to understand their musical
preferences and discover music they have not already heard.

The recommendation system uses machine learning and personalized feature
analysis to recommend:

New songs

New artists

Similar music

Related genres

Music outside the user's normal comfort zone

The recommendation pipeline is:

Spotify data → Feature engineering → ML recommendation engine →
Candidate generation → Personalized ranking → Remove already-heard
music → Discover

The system should consider listening frequency, favorite artists and
tracks, genre preferences, historical behavior, artist/track similarity,
and discovery behavior.

Recommendations should explain why they were suggested.

The first ML implementation should use a content-based recommendation
approach and remain extensible for future personalized ranking and more
advanced recommendation models.

🎧 What Should I Listen To?

A personalized listening mode with prompts such as: - "I'm feeling
sad." - "Give me something new." - "Give me something completely
different." - "Give me music for studying." - "Surprise me."

📖 Music-Based Life Story

A playful entertainment feature that creates a fictional interpretation
of the user's current "life chapter" based on listening patterns.

This should be clearly presented as entertainment rather than
psychological analysis.

🤖 Personalized Music Assistant

A conversational layer that can make observations such as: - "You've
been listening to this artist a lot lately." - "You keep discovering new
artists but return to the same favorites." - "Your taste has become more
diverse this year." - "You're entering another sad-girl music phase."

🖥️ Main Sections

Section         Purpose

Dashboard   Current overview of the user's music
Listening   Tracks, artists, albums, and recent listening
Taste       Music DNA and genre analysis
Timeline    Evolution of music taste
Wrapped     Predicted yearly Spotify Wrapped
Discover    Personalized recommendations
Story       Playful music-based life story
Assistant   Personalized music interaction

🤖 Machine Learning

Lore.fm is not intended to only read and display Spotify data. The
application should progressively learn useful patterns from the user's
listening behavior.

The ML layer is primarily used for personalized music discovery.

Initial ML stack:

Python

pandas

NumPy

scikit-learn

FastAPI for communication with the existing Node/Express backend

Gemini may be used as an optional explanation layer, but it should not
invent recommendation results or factual listening statistics.

🛠️ Development Philosophy

This project should be developed progressively.

MVP

Spotify authentication

Spotify profile retrieval

Top artists

Top tracks

Recently played data where available

Main dashboard

Basic genre/artist analysis

Data visualizations

Phase 2

Historical data storage

Taste evolution

Year-over-year comparisons

Personal music timeline

Phase 3

Personalized recommendations

Genre exploration

Music personality

Music-based life story

Phase 4

Interactive music assistant

More advanced insights

Better recommendation logic

Additional visualizations and personalization

🎨 Design Direction

The application should feel like a polished modern music product rather
than a generic analytics dashboard.

Visual style

Dark cinematic interface

Spotify-inspired atmosphere without copying Spotify's UI

Large artwork

Artist imagery

Elegant charts

Subtle gradients

Glassmorphism used selectively

Smooth animations

Strong typography

Micro-interactions

Responsive layouts

The interface should work well on both desktop and mobile.

🔐 Privacy & Security

The project should follow secure authentication practices.

Never request or store Spotify passwords.

Never expose Spotify client secrets in frontend code.

Store secrets in environment variables.

Request only the Spotify permissions actually required.

Store historical listening data responsibly.

Provide a way to disconnect Spotify.

Do not fabricate Spotify data when an API limitation exists.

⚠️ Important API Principle

Spotify's API capabilities and policies can change.

If a requested feature cannot be implemented using currently available
Spotify data, the application should adapt to the available data rather
than pretending that unavailable information exists.

All statistics shown as factual should originate from real retrieved
data or transparent calculations based on that data.

🌱 Future Ideas

Potential future additions:

Lore Wrapped — yearly Spotify Wrapped prediction

Wrapped trend tracking and confidence changes

Listening streaks

Favorite music eras

"Your most replayed artist this month"

Music taste similarity with friends

Shareable music profile cards

Monthly personal reports

Listening mood trends

Artist discovery map

Genre exploration tree

"Your musical eras" generator

Personalized playlists where permitted by Spotify APIs

Exportable yearly music reports

🎯 Project Goal

The ultimate goal is to create a personal musical archive and
intelligence system.

It should remember the user's musical history, understand how their
taste changes, help them discover new music, and turn raw listening data
into something meaningful and fun.

This isn't just a Spotify stats dashboard.

It's a personal story told through music.