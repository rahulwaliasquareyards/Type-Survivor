# Type Survivor

## Overview

Type Survivor is a browser-based typing game where players must type words correctly before the timer expires.

Players start with 5 lives.

A life is lost when:

* The player types an incorrect word.
* The player fails to type the word before the timer expires.

The game ends when all 5 lives are lost.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* CSS

## Storage

* Local Storage for High Score

No backend required.

---

# Main Menu

Display:

# Type Survivor

Buttons:

1. Play
2. Quit

Quit should show:

"Thanks for playing!"

---

# Difficulty Selection

After clicking Play, show:

## Easy

Word Length:

* 3 to 4 letters

Examples:

* key
* dog
* game
* tree

---

## Medium

Word Length:

* 5 to 7 letters

Examples:

* player
* coding
* rocket
* typing

---

## Hard

Word Length:

* 8 to 12 letters

Examples:

* keyboard
* strategy
* developer
* champion
* adventure

Difficulty only changes word length.

---

# Gameplay Screen

Display:

* Current Score
* Best Score
* Remaining Lives
* Difficulty
* Current Word Timer
* Current Speed Level

Center Screen:

Large word display box.

Below:

Typing input field.

Requirements:

* Auto focus enabled.
* Player never needs to click the input field.
* Press Enter to submit.

---

# Core Gameplay

Starting Values:

* Lives = 5
* Score = 0
* Timer = 5.0 seconds per word

Game Loop:

1. Show random word.
2. Start timer.
3. Player types word.
4. Press Enter.

Correct Answer:

* Score +1
* Generate new word
* Reset timer

Wrong Answer:

* Lose 1 life
* Generate new word
* Reset timer

Timer Expired:

* Lose 1 life
* Generate new word
* Reset timer

---

# Difficulty Scaling

All difficulties use the same timer.

Starting Timer:

* 5.0 seconds

Every 10 seconds of gameplay:

Reduce timer by:

* 0.1 seconds

Example:

5.0s
↓
4.9s
↓
4.8s
↓
4.7s
↓
4.6s

Minimum Timer:

1.0 second

Never go below 1 second.

---

# Lives System

Starting Lives:

* 5

Maximum Lives:

* 5

When Lives Reach 0:

Show Game Over Screen.

---

# Score System

Correct Word:
+1 Score

Wrong Word:
+0 Score

Missed Word:
+0 Score

Track:

* Current Score
* Best Score

Save Best Score using Local Storage.

---

# Word Database

Create separate word arrays.

## Easy Words

3-4 letters only.

Example:

* key
* game
* tree
* dog
* run
* jump
* fire
* book

---

## Medium Words

5-7 letters only.

Example:

* coding
* player
* rocket
* typing
* school
* banana
* monkey
* camera

---

## Hard Words

8-12 letters only.

Example:

* keyboard
* strategy
* champion
* developer
* adventure
* dangerous
* fantastic
* knowledge

---

# Visual Feedback

Correct Word:

* Green flash
* Small scale animation

Wrong Word:

* Red flash

Life Lost:

* Screen shake effect

Game Over:

* Fade animation
* Game Over popup

---

# Audio

Sounds:

* Button Click
* Correct Word
* Wrong Word
* Life Lost
* Game Over

Use lightweight audio files.

---

# Game Over Screen

Display:

# Game Over

Show:

* Final Score
* Best Score

Buttons:

1. Play Again
2. Main Menu
3. Quit

---

# Local Storage

Save:

* Best Score

Load automatically on startup.

Update automatically when a new high score is achieved.

---

# Project Structure

src/

components/

* MainMenu.tsx
* DifficultyMenu.tsx
* GameScreen.tsx
* GameOverScreen.tsx
* WordBox.tsx
* ScorePanel.tsx

data/

* easyWords.ts
* mediumWords.ts
* hardWords.ts

hooks/

* useTimer.ts
* useGameState.ts

utils/

* storage.ts
* wordGenerator.ts

App.tsx

---

# UI Style

Theme:

Dark Modern

Colors:

* Dark Background
* White Text
* Green Success Feedback
* Red Error Feedback

Responsive Design Required.

Supported Devices:

* Desktop
* Laptop
* Mobile Browser

---

# Win Condition

No win screen.

The objective is to survive as long as possible and achieve the highest score.

---

# Success Criteria

The player can:

* Open the game.
* Select a difficulty.
* Type words.
* Gain score.
* Lose lives.
* Experience increasing speed.
* Reach Game Over.
* Save and view High Score.

The game must run entirely in the browser without any backend services.
1
