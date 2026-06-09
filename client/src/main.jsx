import React from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarHeart, Copy, Crown, ImagePlus, Loader2, Send, Sparkles } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const templates = [
  { id: 'noor', name: 'Noor Royale', hint: 'Emerald arches, soft gold, regal South Asian luxury', gradient: 'from-emerald-950 via-stone-950 to-yellow-700' },
  { id: 'zari', name: 'Zari Bloom', hint: 'Floral embroidery, champagne glow, romantic detailing', gradient: 'from-rose-950 via-pink-900 to-amber-400' },
  { id: 'ivory', name: 'Ivory Vows', hint: 'Minimal editorial layout with quiet old-money warmth', gradient: 'from-stone-100 via-amber-100 to-stone-300' },
  { id: 'sultan', name: 'Sultan Palace', hint: 'Royal maroon, ornamental frame, palace invitation mood', gradient: 'from-red-950 via-yellow-950 to-amber-500' },
  { id: 'moonlit', name: 'Moonlit Nikah', hint: 'Deep navy, moon glow, cinematic evening celebration', gradient: 'from-slate-950 via-blue-950 to-cyan-400' },
  { id: 'botanical', name: 'Botanical Luxe', hint: 'Fine floral borders, olive velvet, premium garden feel', gradient: 'from-lime-950 via-green-950 to-emerald-300' }
];

const languages = ['English', 'Hindi', 'Urdu', 'Bengali'];
const themes = ['Minimal', 'Traditional', 'Floral', 'Old Money', 'Royal'];

const initialForm = {
  groomName: 'Ayaan Malik',
  brideName: 'Zoya Khan',
  weddingDate: 'Sunday, 21 December 2026',
  weddingVenue: 'The Royal Palm, Lahore',
  rsvpPhone: '+92 300 1234567',
  language: 'English',
  theme: 'Royal',
  template: templates[0].id
};

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (_error) {
    throw new Error('Backend is not running. Please start the website with start-website.bat or run npm run dev, then open http://localhost:5173.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

function App() {
  const path = window.location.pathname;
  const cardMatch = path.match(/^\/card\/([^/]+)/);
  return cardMatch ? <CardViewer id={cardMatch[1]} /> : <InvitationStudio />;
}

function InvitationStudio() {
  const [form, setForm] = React.useState(initialForm);
  const [photoFile, setPhotoFile] = React.useState(null);
  const [photoPreview, setPhotoPreview] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');

  const selectedTemplate = templates.find((template) => template.id === form.template) || templates[0];

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setResult(null);
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setError('');
    setPhotoUrl('');
    setResult(null);

    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhotoIfNeeded() {
    if (photoUrl) return photoUrl;
    if (!photoFile) throw new Error('Please upload a couple photo first.');

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('photo', photoFile);
      const data = await apiFetch('/api/uploads/photo', { method: 'POST', body: payload });
      setPhotoUrl(data.url);
      return data.url;
    } finally {
      setUploading(false);
    }
  }

  async function generateCard() {
    setError('');
    setGenerating(true);
    setResult(null);

    try {
      const uploadedUrl = await uploadPhotoIfNeeded();
      const data = await apiFetch('/api/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photoUrl: uploadedUrl })
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function copyShareLink() {
    if (!result?.shareUrl) return;
    await navigator.clipboard.writeText(result.shareUrl);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070d] text-amber-50">
      <DecorativeBackground />
      <Header />

      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" /> AI-generated premium wedding invitations
            </div>
            <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl">
              Create cinematic <span className="gold-text">wedding cards</span> in minutes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-amber-50/70">
              Select a luxury design direction, add your wedding details, upload a personal photo, and let AI craft a polished PNG invitation with a unique shareable link.
            </p>
            <a href="#create" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-700 px-6 py-4 font-black text-stone-950 shadow-glow transition hover:-translate-y-1">
              <CalendarHeart className="h-5 w-5" /> Create Your Wedding Card
            </a>
          </div>
          <LivePreview form={form} photoPreview={photoPreview} selectedTemplate={selectedTemplate} />
        </div>
      </section>

      <section id="create" className="relative mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="space-y-6">
          <Panel title="1. Choose a premium design" subtitle="Interactive preview thumbnails, no pre-made AI image templates.">
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, template: template.id }))}
                  className={classNames(
                    'group rounded-3xl border p-3 text-left transition hover:-translate-y-1',
                    form.template === template.id ? 'border-amber-300 bg-amber-200/10 shadow-glow' : 'border-white/10 bg-white/[0.06] hover:border-white/30'
                  )}
                >
                  <div className={classNames('mb-3 h-28 rounded-2xl bg-gradient-to-br shadow-2xl', template.gradient)}>
                    <div className="flex h-full items-end justify-between p-3">
                      <div className="h-12 w-12 rounded-full border border-white/40 bg-white/20 backdrop-blur" />
                      <div className="h-16 w-10 rounded-t-full border border-white/40 bg-black/20" />
                    </div>
                  </div>
                  <b className="text-white">{template.name}</b>
                  <p className="mt-1 text-sm leading-5 text-amber-50/60">{template.hint}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="2. Upload couple photo" subtitle="JPG, PNG, or WebP. Max 5MB with live preview.">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-amber-100/25 bg-black/20 p-6 text-center transition hover:border-amber-300/70">
              {photoPreview ? (
                <img src={photoPreview} alt="Uploaded couple preview" className="mb-4 h-48 w-full rounded-2xl object-cover" />
              ) : (
                <ImagePlus className="mb-4 h-12 w-12 text-amber-300" />
              )}
              <span className="font-black text-white">Upload personal photo</span>
              <span className="mt-1 text-sm text-amber-50/60">This uploads to Cloudinary before AI generation.</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoChange} />
            </label>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="3. Wedding details" subtitle="The live preview updates instantly while the final card is generated by AI.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Groom's Name" name="groomName" value={form.groomName} onChange={updateField} />
              <TextInput label="Bride's Name" name="brideName" value={form.brideName} onChange={updateField} />
              <TextInput label="Wedding Date" name="weddingDate" value={form.weddingDate} onChange={updateField} />
              <TextInput label="Wedding Venue" name="weddingVenue" value={form.weddingVenue} onChange={updateField} />
              <TextInput label="RSVP Phone Number" name="rsvpPhone" value={form.rsvpPhone} onChange={updateField} />
              <SelectInput label="Language" name="language" value={form.language} onChange={updateField} options={languages} />
              <SelectInput label="Theme" name="theme" value={form.theme} onChange={updateField} options={themes} />
            </div>
          </Panel>

          <Panel title="4. Generate & share" subtitle="AI writes invitation text, creates a final PNG, stores it, and returns a share link.">
            <div className="flex flex-wrap gap-3">
              <button onClick={generateCard} disabled={generating || uploading} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-700 px-5 font-black text-stone-950 disabled:cursor-not-allowed disabled:opacity-60">
                {generating || uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {uploading ? 'Uploading Photo...' : generating ? 'Generating Card...' : '✨ Generate Card'}
              </button>
              <button onClick={copyShareLink} disabled={!result?.shareUrl} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                <Copy className="h-5 w-5" /> 🔗 Share
              </button>
            </div>

            {error && <p className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 p-4 font-semibold text-red-100">{error}</p>}

            {result && (
              <div className="mt-5 rounded-3xl border border-emerald-300/25 bg-emerald-400/10 p-4">
                <p className="font-black text-emerald-100">Your invitation is ready.</p>
                <input readOnly value={result.shareUrl} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-amber-50 outline-none" />
                <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
                  <img src={result.finalImageUrl} alt="Final generated wedding card" className="rounded-2xl border border-white/10" />
                  <p className="whitespace-pre-wrap text-sm leading-6 text-amber-50/75">{result.generatedText}</p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="relative z-10 border-b border-white/10 bg-black/25 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-700 text-stone-950 shadow-glow">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-white">Wedding AI Studio</p>
            <p className="text-xs font-semibold text-amber-50/55">Premium cards • AI text • AI PNG</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-amber-100 sm:inline-flex">4:5 share-ready PNG</span>
      </div>
    </header>
  );
}

function DecorativeBackground() {
  return <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(216,180,106,.25),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(148,84,255,.18),transparent_30%),linear-gradient(135deg,#07070d,#13101d_50%,#07070d)]" />;
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="mt-1 text-sm font-medium text-amber-50/60">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TextInput({ label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-black text-amber-50/80">
      {label}
      <input {...props} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 font-semibold text-white outline-none transition focus:border-amber-300" />
    </label>
  );
}

function SelectInput({ label, options, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-black text-amber-50/80">
      {label}
      <select {...props} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 font-semibold text-white outline-none transition focus:border-amber-300">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function LivePreview({ form, photoPreview, selectedTemplate }) {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[430px] rounded-[2.2rem] border border-amber-200/20 bg-black p-4 shadow-glow">
      <div className={classNames('absolute inset-4 rounded-[1.75rem] bg-gradient-to-br opacity-80', selectedTemplate.gradient)} />
      {photoPreview && <img src={photoPreview} alt="Preview" className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-[1.75rem] object-cover opacity-35 mix-blend-screen" />}
      <div className="absolute inset-4 rounded-[1.75rem] bg-gradient-to-t from-black via-black/45 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-6 text-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-100">Wedding Invitation</p>
          <p className="mt-2 text-sm font-semibold text-amber-50/65">{form.theme} • {form.language}</p>
        </div>
        <div>
          <p className="font-display text-5xl font-black leading-none text-white">{form.groomName}</p>
          <p className="my-3 font-display text-3xl text-amber-200">&</p>
          <p className="font-display text-5xl font-black leading-none text-white">{form.brideName}</p>
        </div>
        <div className="space-y-2 text-sm font-bold text-amber-50/80">
          <p>{form.weddingDate}</p>
          <p>{form.weddingVenue}</p>
          <p>RSVP {form.rsvpPhone}</p>
        </div>
      </div>
    </div>
  );
}

function CardViewer({ id }) {
  const [card, setCard] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    apiFetch(`/api/cards/${id}`)
      .then(setCard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#08070d] p-4 text-amber-50">
      <DecorativeBackground />
      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 text-center shadow-2xl backdrop-blur-xl">
        {loading && <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-300" />}
        {error && <p className="p-8 font-bold text-red-100">{error}</p>}
        {card && (
          <>
            <img src={card.finalImageUrl} alt={`${card.formData.groomName} and ${card.formData.brideName} wedding invitation`} className="mx-auto rounded-[1.5rem]" />
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-700 px-5 py-3 font-black text-stone-950">
              <Send className="h-4 w-4" /> Copy Invitation Link
            </button>
          </>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);