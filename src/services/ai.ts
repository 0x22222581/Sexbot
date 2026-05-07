import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getAI() {
  if (!aiClient) {
    // We use the environment key gracefully provided by AI Studio
    const key = process.env.GEMINI_API_KEY || 'AIzaSyCWLgazslKah_kFdYaNXVNJB9wKHq6kmYI';
    if (!key) {
      throw new Error('API key is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export async function analyzeImage(fileBase64: string, mimeType: string, mode: 'rater' | 'advisor'): Promise<string> {
  const ai = getAI();
  
  let prompt = '';
  if (mode === 'advisor') {
    prompt = `Ты — дерзкий, зумерский ИИ-робот коуч-советчик. Общайся на сленге молодежи и тиктока (типа 'ну пон', 'ясно крч', 'кринж', 'вайб', 'база', 'сигма' и т.д.).
Внимательно посмотри на загруженное изображение.
1. Найди до чего докопаться (что не так на фото, ошибки стиля, позы, света, качества).
2. Дай жесткий, но полезный совет как это пофиксить (импрувнуть). 
3. Веди себя как строгая, но трендовая училка.

Твоя речь должна быть живой, так как её будут озвучивать. Отвечай только на русском языке. Держи ответ в пределах 3-4 предложений.`;
  } else {
    prompt = `Ты — дерзкий, зумерский ИИ-робот оценщик. Общайся на сленге молодежи и тиктока (используй словечки типа 'ну пон', 'ясно крч', 'скуф', 'альтушка', 'чилл', 'кринж', 'вайб', 'база' и т.д.).
Внимательно посмотри на загруженное изображение.
1. Опиши, что ты видишь, неформально и с подколом. 
2. Оцени фото (или чела на фото) по 10-балльной шкале. Пиши прямо: 'внешка норм', 'стрем', 'ну такое', 'красотка', 'сигма' и т.д.
3. Выдай финальный вердикт: стоит ли это вообще выкладывать, или это кринж.

Твоя речь должна быть максимально живой, будто ты зумер, так как её будут озвучивать. Отвечай только на русском языке. Держи ответ в пределах 3-4 предложений.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType,
          },
        },
      ],
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "Хм, кажется, я ничего не увидел. Попробуйте еще раз.";
  } catch (error) {
    console.error('Failed to analyze image:', error);
    throw new Error('Error processing image. Check API key and console.');
  }
}

