# Premium Wedding Invitation Studio

A full-stack single-page web application for dynamically generating and sharing premium wedding invitation cards. It is **free forever by default**: local text generation, local SVG/PNG-style card generation, local uploaded files, and local JSON persistence work without OpenAI, MongoDB, Cloudinary, or paid hosting.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Free Generator:** Local multilingual invitation text + local luxury SVG card renderer
- **Optional AI:** OpenAI Chat Completions + Image Generation when `FREE_MODE=false`
- **Free Database:** Local JSON persistence
- **Optional Database:** MongoDB + Mongoose when `FREE_MODE=false`
- **Free Storage:** Local uploaded/generated files
- **Optional Storage:** Cloudinary when `FREE_MODE=false`
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

Free forever mode works with no `.env` file. Optional values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
FREE_MODE=true

# Optional paid/cloud production values. Only used when FREE_MODE=false.
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

### Easiest on Windows

Double-click:

```txt
start-website.bat
```

Then open:

```txt
http://localhost:5173
```

> Do not open `client/index.html` directly with `file://`. React/Vite apps must be served by Vite or a static web server.

### Terminal

```bash
npm install
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>

## Free Forever Mode

By default, `FREE_MODE=true` behavior is active even if you do not create any `.env` file.

In this mode:

- No OpenAI key is required.
- No Cloudinary account is required.
- No MongoDB database is required.
- Uploaded photos are saved in `server/uploads`.
- Generated final cards are saved in `server/uploads/generated`.
- Invitation records are saved in `server/data/invitations.json`.
- The generated final card uses the built-in premium local SVG renderer.

To use paid production services later, set:

```env
FREE_MODE=false
```

Then add OpenAI, Cloudinary, and MongoDB credentials.

## Workflow

1. User selects a premium template/theme.
2. User enters groom, bride, date, venue, RSVP, language, and uploads a photo.
3. Frontend uploads the photo through `POST /api/uploads/photo`.
4. Backend generates culturally elegant invitation copy locally in free mode, or with OpenAI when enabled.
5. Backend creates the final card locally in free mode, or with OpenAI Image Generation when enabled.
6. Generated card is stored locally in free mode, or uploaded to Cloudinary when enabled.
7. Local JSON stores form data, photo URL, generated text, final image URL, and short ID; MongoDB is optional.
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