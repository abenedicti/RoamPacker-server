# Project Name

## [RoamPacker](https://roam-packer-app.vercel.app/)

## Description

Meeting app for backpackers. Matching system, chat between saved matches and itinerary creation to plan the trip and share with a selected match.

#### [Client Repo here](https://github.com/abenedicti/roam-packer-client)

#### [Server Repo here](https://github.com/abenedicti/RoamPacker-server)

## Backlog Functionalities

Share itinerary in real time, improvement of the chat system and add AI tool to build a trip

## Technologies used

- Node.js
- Express.js – routes and middlewares
- MongoDB – database
- JWT – authentification
- CORS – requests front/back

# Server Structure

## 1️. User

**Collection: `users`**

- `email` (String) – Unique email address
- `password` (String) – Hashed password
- `username` (String) – Display username
- `nationality` (String) – User nationality
- `age` (Number) – Age
- `gender` (String) – Gender
- `countryOfResidence` (String) – Country of residence
- `aboutMe` (String) – Personal description
- `spokenLanguages` (String) – Spoken languages
- `photoUrl` (String) – Profile picture URL
- `favorites` (Array) – Favorite places `{ xid, name, city, country, kind, rate }`
- `matches` (Array[ObjectId]) – References to other matched users
- `savedMatchedUsers` (Array) – Details of saved matched users
- `itineraries` (Array[ObjectId]) – References to created itineraries
- `firstTrip` (Boolean) – First travel experience?
- `partyMood` (Boolean) – Preference for party/fun trips
- `budget` (Number) – Estimated travel budget
- `interests` (Array[String]) – Interests
- `travelStyle` (String) – Preferred travel style
- `startDate` (Date) – Start date of trip
- `tripDuration` (Number) – Duration of trip in days
- `favoriteFood` (String) – Favorite food
- `preferredCountry` (String) – Preferred country to travel
- `timestamps` (Date) – `createdAt` and `updatedAt` automatically added

---

## 2️. Message

**Collection: `messages`**

- `sender` (ObjectId) – User sending the message
- `receiver` (ObjectId) – User receiving the message
- `text` (String) – Message content
- `createdAt` (Date) – Automatic creation date

💡 Handles messaging between users.

---

## 3️. Match

**Collection: `matches`**

- `users` (Array[ObjectId]) – List of users involved in the match
- `createdAt` (Date) – Automatic creation date

💡 Each document represents a “match” between users.

---

## 4️. Itinerary

**Collection: `itineraries`**

- `owner` (ObjectId) – User who created the itinerary
- `title` (String) – Itinerary title
- `points` (Array) – Steps of the itinerary `{ city, lat, lng, comment }`
- `sharedWith` (Array[ObjectId]) – Users with whom the itinerary is shared
- `timestamps` (Date) – `createdAt` and `updatedAt` automatically added

💡 Allows creating, organizing, and sharing custom itineraries.

## API Endpoints (Backend Routes)

| HTTP Method | URL | Request Body | Success Status | Error Status | Description |
| ----------- | --- | ------------ | -------------- | ------------ | ----------- |

### Auth

| POST | `/auth/signup` | `{ email, password, username }` | 201 | 400 | Register a new user |
| POST | `/auth/login` | `{ email, password }` | 200 | 400 | Validate credentials and return JWT |
| GET | `/auth/verify` | - | 200 | 401 | Verify the user token |

### Users

| GET | `/users/:userId` | - | 200 | 404, 401 | Get user profile (with itineraries, matches, saved matches) |
| PUT | `/users/:userId` | `{...fields}` | 200 | 400, 403, 401 | Update user profile (only self) |
| DELETE | `/users/:userId` | - | 200 | 403, 404 | Delete user profile (only self) |

### Favorites

| GET | `/users/favorites` | - | 200 | 401 | Get logged-in user's favorites |
| PUT | `/users/favorites/toggle` | `{ xid, name, city, country, kind, rate }` | 200 | 400, 401 | Add or remove a favorite place |

### Messages

| POST | `/messages/` | `{ receiverId, text }` | 201 | 400, 401 | Send a message to another user |
| GET | `/messages/conversations` | - | 200 | 401 | Get all conversations of logged-in user |
| GET | `/messages/conversation/:otherUserId` | - | 200 | 400, 401 | Get conversation with a specific user |

### Matches

| POST | `/matches/` | `{ otherUserId }` | 201 | 400, 401 | Create a match with another user |
| GET | `/matches/` | - | 200 | 401 | Get all matches for logged-in user |
| POST | `/matches/save` | `{ match }` | 200 | 400, 401 | Save a matched user to “savedMatchedUsers” |
| DELETE | `/matches/:matchId` | - | 200 | 401 | Remove a saved match from logged-in user |

### Itineraries

| POST | `/itineraries/` | `{ title, points }` | 201 | 400, 401 | Create a new itinerary |
| GET | `/itineraries/` | - | 200 | 401 | Get all itineraries of logged-in user |
| GET | `/itineraries/:itineraryId` | - | 200 | 400, 404, 401 | Get a specific itinerary |
| PUT | `/itineraries/:itineraryId` | `{ title?, points? }` | 200 | 400, 403, 404, 401 | Update itinerary (owner only) |
| PUT | `/itineraries/:itineraryId/share` | `{ targetUserId }` | 200 | 400, 403, 404, 401 | Share itinerary with another user |
| DELETE | `/itineraries/:itineraryId` | - | 200 | 400, 403, 404, 401 | Delete an itinerary (owner only) |

### Utils

| POST | `/utils/generate-users` | `{ number }` | 201 | 400 | Generate random users for testing |

### Find Matches

| POST | `/find-match/` | `{ budget?, interests?, travelStyle?, startDate?, tripDuration?, favoriteFood?, preferredCountry?, firstTrip?, partyMood? }` | 200 | 400, 401 | Find users matching criteria (real + fake users for demo) |

### Destinations

| GET | `/destinations/destinations-data` | - | 200 | - | Get static continents and countries data |
| GET | `/destinations/:continent/countries` | - | 200 | 404 | Get all countries of a continent |
| GET | `/destinations/:country/cities` | - | 200 | 404 | Get cities of a country (cached + fallback) |
| GET | `/destinations/city/:cityName` | - | 200 | 404 | Get city details from OpenTripMap API |
| GET | `/destinations/city/:cityName/activities` | - | 200 | 404 | Get activities/places around a city from OpenTripMap API |
