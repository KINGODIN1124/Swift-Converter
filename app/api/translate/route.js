import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, from, to } = await req.json();

    if (!text || !to) {
      return NextResponse.json({ error: 'Missing text or target language.' }, { status: 400 });
    }

    // Using Google's unofficial free API for small-scale translations
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from || 'auto'}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data[0]) {
      throw new Error('Translation failed.');
    }

    // The data is an array of sentence parts
    const translatedText = data[0].map(part => part[0]).join('');

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate. Please check your internet or try again later.' }, { status: 500 });
  }
}
