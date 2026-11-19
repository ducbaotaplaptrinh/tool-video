import { 
  ILLMProvider 
} from '../interfaces/index.js';
import { 
  ResearchDossier, 
  ScriptDocument, 
  ScriptSceneDraft, 
  CostRecord,
  ServiceType 
} from '@vietsu/shared';
import { WikipediaHistoricalResearcher } from './wikipedia-researcher.js';

export class LiveLLMProvider implements ILLMProvider {
  public name = 'LiveLLMProvider (Wikipedia Grounding + LLM Engine)';
  public isMock = false;
  private researcher = new WikipediaHistoricalResearcher();

  public async researchHistory(topic: string, historicalEra: string): Promise<ResearchDossier> {
    return this.researcher.research(topic, historicalEra);
  }

  public async generateScript(dossier: ResearchDossier): Promise<ScriptDocument> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        return await this.generateWithGemini(dossier, geminiKey);
      } catch (err: any) {
        console.warn(`[LiveLLMProvider] Gemini API call failed: ${err.message}. Fallback to Grounded Engine.`);
      }
    } else if (openaiKey) {
      try {
        return await this.generateWithOpenAI(dossier, openaiKey);
      } catch (err: any) {
        console.warn(`[LiveLLMProvider] OpenAI API call failed: ${err.message}. Fallback to Grounded Engine.`);
      }
    }

    // Grounded Historical Script Engine (Zero API cost, 100% reliable bám sát Zod schema)
    return this.generateGroundedScript(dossier);
  }

  private generateGroundedScript(dossier: ResearchDossier): ScriptDocument {
    const mainFact = dossier.facts[0]?.factSummary || dossier.summary;
    const secondaryFact = dossier.facts[1]?.factSummary || `Một trang sử vàng chói lọi trong thời kỳ ${dossier.historicalEra}.`;
    const figures = dossier.facts[0]?.keyFigures?.join(', ') || 'các bậc anh hùng dân tộc';
    const location = dossier.facts[0]?.location || 'non sông gấm vóc Việt Nam';

    const hook = `Bạn có biết bí mật làm nên chiến thắng ${dossier.topic} lưu danh ngàn thu trong lịch sử dân tộc?`;
    const context = `Vào ${dossier.historicalEra}, non sông ${location} đứng trước họa xâm lăng hiểm nghèo. Nhưng ý chí quật cường của nhân dân ta chưa bao giờ khuất phục.`;
    const climax = `Dưới sự lãnh đạo kiệt xuất của ${figures}, thế trận đã đảo chiều ngoạn mục. ${mainFact}`;
    const resolutionAndCta = `Chiến thắng ${dossier.topic} khẳng định chủ quyền độc lập thiêng liêng. Hãy nhấn theo dõi Việt Sử Studio để tự hào dòng máu Việt!`;

    const scenes: ScriptSceneDraft[] = [
      {
        sceneNumber: 1,
        title: `Cảnh 1: Khúc tráng ca mở màn ${dossier.topic}`,
        narrativeText: hook,
        wordCount: hook.split(/\s+/).length,
        estimatedDurationSec: 5,
        visualPrompt: `Epic cinematic scene of ancient Vietnam during ${dossier.historicalEra}, dramatic clouds, historical Vietnamese atmosphere, highly detailed, photorealistic 8k, vertical 9:16`,
        cameraMotion: 'ZOOM_IN',
        factIds: [dossier.facts[0]?.id || 'f1']
      },
      {
        sceneNumber: 2,
        title: 'Cảnh 2: Bối cảnh giặc ngoại xâm áp sát bờ cõi',
        narrativeText: context,
        wordCount: context.split(/\s+/).length,
        estimatedDurationSec: 7,
        visualPrompt: `Ancient Vietnamese landscape, ${location}, stormy skies, traditional ancient Vietnamese banners and military encampment, cinematic lighting, 9:16 vertical`,
        cameraMotion: 'PAN_LEFT',
        factIds: [dossier.facts[1]?.id || dossier.facts[0]?.id || 'f2']
      },
      {
        sceneNumber: 3,
        title: 'Cảnh 3: Trận đánh quyết định xoay chuyển cờ nước',
        narrativeText: climax,
        wordCount: climax.split(/\s+/).length,
        estimatedDurationSec: 9,
        visualPrompt: `Heroic battle scene of ancient Vietnam, ${figures} commanding warriors, ancient Vietnamese armor and weapons, fierce battle atmosphere, cinematic masterpiece 9:16`,
        cameraMotion: 'ZOOM_OUT',
        factIds: [dossier.facts[0]?.id || 'f3']
      },
      {
        sceneNumber: 4,
        title: 'Cảnh 4: Khải hoàn và bài học muôn đời',
        narrativeText: resolutionAndCta,
        wordCount: resolutionAndCta.split(/\s+/).length,
        estimatedDurationSec: 6,
        visualPrompt: `Triumphant golden sunrise over ancient Vietnam, national pride, heroic historical memorial, dramatic lighting, vertical 9:16 ratio`,
        cameraMotion: 'STATIC',
        factIds: []
      }
    ];

    const fullNarrative = `${hook} ${context} ${climax} ${resolutionAndCta}`;
    const totalWords = scenes.reduce((sum, s) => sum + s.wordCount, 0);
    const estimatedTotalDurationSec = scenes.reduce((sum, s) => sum + s.estimatedDurationSec, 0);

    return {
      title: dossier.topic,
      hook,
      context,
      climax,
      resolutionAndCta,
      fullNarrative,
      totalWords,
      estimatedTotalDurationSec,
      scenes,
      isApproved: false
    };
  }

  private async generateWithGemini(dossier: ResearchDossier, apiKey: string): Promise<ScriptDocument> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `Bạn là biên kịch video lịch sử Việt Nam chuyên nghiệp cho Facebook Reels (30-45 giây).
Hãy dựa vào hồ sơ sử liệu sau để viết kịch bản 4 cảnh:
Chủ đề: ${dossier.topic}
Thời kỳ: ${dossier.historicalEra}
Tóm tắt sự kiện: ${dossier.summary}
Dữ kiện xác thực: ${JSON.stringify(dossier.facts.map(f => f.factSummary))}

Trả về duy nhất định dạng JSON thuần túy (không bọc codeblock markdown):
{
  "title": "${dossier.topic}",
  "hook": "câu hook mở đầu kịch tính 10-15 từ",
  "context": "bối cảnh diễn biến 20-30 từ",
  "climax": "cao trào trận đánh 25-35 từ",
  "resolutionAndCta": "kết bài và lời kêu gọi theo dõi 15-20 từ",
  "fullNarrative": "toàn văn kết hợp 4 phần trên",
  "totalWords": 100,
  "estimatedTotalDurationSec": 27,
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Tiêu đề cảnh 1",
      "narrativeText": "Lời thoại cảnh 1",
      "wordCount": 20,
      "estimatedDurationSec": 6,
      "visualPrompt": "Prompt tạo ảnh tiếng Anh 9:16 phong cách cổ phong Việt Nam",
      "cameraMotion": "ZOOM_IN",
      "factIds": []
    }
  ],
  "isApproved": false
}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = (await res.json()) as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini API did not return text');
    return JSON.parse(text);
  }

  private async generateWithOpenAI(dossier: ResearchDossier, apiKey: string): Promise<ScriptDocument> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia biên kịch video lịch sử Việt Nam cho Facebook Reels. Luôn xuất JSON chuẩn.'
          },
          {
            role: 'user',
            content: `Viết kịch bản 4 phân cảnh dựa trên: ${dossier.topic} (${dossier.historicalEra}). Dữ kiện: ${dossier.summary}`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI API did not return text');
    return JSON.parse(text);
  }

  public estimateCost(units: number, service: ServiceType): CostRecord {
    // Zero API cost when using grounded Wikipedia engine; token rate applied if API key present
    const isLiveApi = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
    const ratePer1k = isLiveApi ? 0.00015 : 0.0;
    const costUSD = (units / 1000) * ratePer1k;
    const costVND = Math.round(costUSD * 25400);

    return {
      id: `cost_llm_${Date.now()}`,
      projectId: '',
      provider: isLiveApi ? (process.env.GEMINI_API_KEY ? 'Google Gemini' : 'OpenAI') : 'Wikipedia Grounded Engine',
      service,
      unitsUsed: units,
      unitType: 'TOKENS',
      estimatedCostUSD: costUSD,
      estimatedCostVND: costVND,
      createdAt: new Date().toISOString()
    };
  }
}
