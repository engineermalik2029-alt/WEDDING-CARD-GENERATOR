import OpenAI from 'openai';

let openai;

function ensureOpenAiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required. Add it to server/.env.');
  }

  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openai;
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function fallbackInvitationText({ groomName, brideName, weddingDate, weddingVenue, language }) {
  const english = `With the blessings of our families,\n${groomName} & ${brideName}\nrequest the pleasure of your company as they begin their forever.\n\n${weddingDate}\n${weddingVenue}\n\nMay this union be filled with love, grace, joy, and lifelong togetherness.`;

  const translations = {
    English: english,
    Hindi: `परिवारों के आशीर्वाद के साथ,\n${groomName} और ${brideName}\nअपने जीवन के नए सफर की शुरुआत पर आपका स्नेहिल साथ चाहते हैं।\n\n${weddingDate}\n${weddingVenue}\n\nईश्वर इस पवित्र बंधन को प्रेम, खुशियों और समृद्धि से भर दे।`,
    Urdu: `خاندانوں کی دعاؤں کے ساتھ،\n${groomName} اور ${brideName}\nاپنی نئی زندگی کے آغاز پر آپ کی شرکت کے خواہشمند ہیں۔\n\n${weddingDate}\n${weddingVenue}\n\nاللہ اس رشتے کو محبت، رحمت اور خوشیوں سے بھر دے۔`,
    Bengali: `পরিবারের আশীর্বাদ নিয়ে,\n${groomName} ও ${brideName}\nতাদের নতুন জীবনের শুরুতে আপনার উপস্থিতি কামনা করছে।\n\n${weddingDate}\n${weddingVenue}\n\nএই পবিত্র বন্ধন ভালোবাসা, আনন্দ ও সমৃদ্ধিতে ভরে উঠুক।`
  };

  return translations[language] || english;
}

function fallbackImageBase64({ generatedText, theme, language, photoUrl }) {
  const lines = generatedText.split('\n').filter(Boolean).slice(0, 8);
  const themeColors = {
    Minimal: ['#f7efe2', '#111827', '#c6a15b'],
    Traditional: ['#4b0f18', '#fff4d6', '#d8a63f'],
    Floral: ['#3f1028', '#fff0f7', '#f0a8c8'],
    'Old Money': ['#10251c', '#f5ead7', '#b9975b'],
    Royal: ['#120a2a', '#fff2bd', '#d4af37']
  };
  const [background, foreground, accent] = themeColors[theme] || themeColors.Royal;
  const textAnchoring = ['Urdu'].includes(language) ? 'end' : 'middle';
  const x = textAnchoring === 'end' ? 850 : 512;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280" viewBox="0 0 1024 1280">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${background}"/>
        <stop offset="1" stop-color="#050505"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="18%" r="55%">
        <stop offset="0" stop-color="${accent}" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1280" fill="url(#bg)"/>
    <rect width="1024" height="1280" fill="url(#glow)"/>
    <rect x="58" y="58" width="908" height="1164" rx="54" fill="none" stroke="${accent}" stroke-width="6" opacity="0.9"/>
    <rect x="92" y="92" width="840" height="1096" rx="38" fill="none" stroke="${foreground}" stroke-width="1.5" opacity="0.35"/>
    <circle cx="512" cy="245" r="142" fill="${accent}" opacity="0.18"/>
    <image href="${escapeXml(photoUrl)}" x="354" y="105" width="316" height="316" preserveAspectRatio="xMidYMid slice" opacity="0.88"/>
    <circle cx="512" cy="263" r="160" fill="none" stroke="${accent}" stroke-width="7"/>
    <text x="512" y="505" text-anchor="middle" fill="${accent}" font-size="28" font-family="Georgia, serif" letter-spacing="8">WEDDING INVITATION</text>
    <text x="512" y="585" text-anchor="middle" fill="${foreground}" font-size="68" font-family="Georgia, serif" font-weight="700">${escapeXml(theme)}</text>
    ${lines.map((line, index) => `<text x="${x}" y="${675 + index * 54}" text-anchor="${textAnchoring}" fill="${foreground}" font-size="34" font-family="Arial, sans-serif" font-weight="600">${escapeXml(line).slice(0, 90)}</text>`).join('')}
    <path d="M330 1120 C410 1085, 614 1085, 694 1120" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
    <text x="512" y="1175" text-anchor="middle" fill="${accent}" font-size="24" font-family="Arial, sans-serif" letter-spacing="5">AI DEMO PNG PREVIEW</text>
  </svg>`;

  return Buffer.from(svg).toString('base64');
}

export async function generateInvitationText({ groomName, brideName, weddingDate, weddingVenue, language }) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY missing. Using local invitation text generator for development/demo mode.');
    return fallbackInvitationText({ groomName, brideName, weddingDate, weddingVenue, language });
  }

  const client = ensureOpenAiKey();

  const prompt = `You are a premium invitation designer. Write a culturally elegant wedding invitation in ${language} using: Groom ${groomName}, Bride ${brideName}, Date ${weddingDate}, Venue ${weddingVenue}. Format beautifully, add culturally relevant blessings. Keep it concise enough for a luxury 4:5 digital card.`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.5',
    messages: [
      {
        role: 'system',
        content: 'You write tasteful, premium, culturally respectful wedding invitation copy. Return only the invitation text.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.85
  });

  return completion.choices?.[0]?.message?.content?.trim() || '';
}

export async function generateInvitationImage({ generatedText, theme, language, photoUrl }) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY missing. Using local SVG image generator for development/demo mode.');
    return fallbackImageBase64({ generatedText, theme, language, photoUrl });
  }

  const client = ensureOpenAiKey();

  const prompt = `Create a high-resolution, premium wedding invitation card in ${theme} theme. Use this text: ${generatedText}. Language: ${language}. Seamlessly integrate the couple's photo from URL ${photoUrl} into the design. Output as a polished PNG, 4:5 ratio, modern luxurious style. Ensure readable typography, balanced spacing, elegant ornaments, and premium Instagram Reel inspired cinematic luxury.`;

  const response = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    prompt,
    size: '1024x1536',
    quality: 'high',
    n: 1
  });

  const image = response.data?.[0];
  if (!image?.b64_json) {
    throw new Error('OpenAI image generation did not return a base64 PNG.');
  }

  return image.b64_json;
}