# Premium Wedding Invitation Studio

A full-stack single-page web application for dynamically generating and sharing premium AI-powered wedding invitation cards.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **AI:** OpenAI Chat Completions + Image Generation
- **Database:** MongoDB + Mongoose
- **Storage:** Cloudinary
- **Share URLs:** `nanoid` short IDs with `/card/:id` viewer route

## Project Structure

```txt
premium-card-generator/
  client/     React/Vite SPA
  server/     Express API, MongoDB models, OpenAI + Cloudinary services
```

## Environment Variables

Create `server/.env` from `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Required values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/wedding_cards
OPENAI_API_KEY=sk-...
OPENAI_TEXT_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-1
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Create `client/.env` from `client/.env.example` if your API URL is not the default:

```env
VITE_API_URL=http://localhost:5000
```

## Local Development

```bash
npm install
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>

## Workflow

1. User selects a premium template/theme.
2. User enters groom, bride, date, venue, RSVP, language, and uploads a photo.
3. Frontend uploads the photo to Cloudinary through `POST /api/uploads/photo`.
4. Backend asks OpenAI Chat Completions to generate culturally elegant invitation copy.
5. Backend sends a detailed image prompt to OpenAI Image Generation.
6. Generated PNG is uploaded to Cloudinary.
7. MongoDB stores form data, photo URL, generated text, final image URL, and short ID.
8. Frontend returns a share URL: `/card/:shortId`.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `POST` | `/api/uploads/photo` | Upload JPG/PNG/WebP photo, max 5MB |
| `POST` | `/api/cards/generate` | Generate invitation text + PNG card and persist it |
| `GET` | `/api/cards/:id` | Fetch final generated invitation by short ID |

## Deployment Notes

### Frontend on Vercel

- Root directory: `premium-card-generator/client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend on Render/DigitalOcean

- Root directory: `premium-card-generator/server`
- Build command: `npm install`
- Start command: `npm start`
- Add the server environment variables listed above.
- Set `CLIENT_URL` and `PUBLIC_APP_URL` to the Vercel frontend URL.

## Important AI Note

The code keeps model names configurable. The requested `gpt-5.5` is used as the default text model via `OPENAI_TEXT_MODEL`; image generation defaults to `gpt-image-1`, which can be replaced with any future GPT image model when available in your OpenAI account.