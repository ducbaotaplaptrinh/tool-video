import { 
  ResearchDossier, 
  ScriptDocument, 
  CostRecord, 
  ServiceType,
  HistoricalCitation,
  ResearchFact
} from '@vietsu/shared';
import { ILLMProvider } from '../interfaces/index.js';
import { PREDEFINED_HISTORY_TOPICS } from './history-db.js';

export class MockLLMProvider implements ILLMProvider {
  name = 'MockLLM (Free Offline History Engine)';
  isMock = true;

  async researchHistory(topic: string, historicalEra: string): Promise<ResearchDossier> {
    // Check if topic matches predefined key
    const normalized = topic.toLowerCase();
    for (const [key, predefined] of Object.entries(PREDEFINED_HISTORY_TOPICS)) {
      if (normalized.includes('bạch đằng') || normalized.includes('ngô quyền') || key === 'bach-dang-938') {
        return PREDEFINED_HISTORY_TOPICS['bach-dang-938'].dossier;
      }
      if (normalized.includes('rạch gầm') || normalized.includes('quân xiêm') || normalized.includes('nguyễn huệ') || key === 'rach-gam-xoai-mut-1785') {
        return PREDEFINED_HISTORY_TOPICS['rach-gam-xoai-mut-1785'].dossier;
      }
    }

    // Default dynamic historical facts for any requested Vietnamese topic
    const citation1: HistoricalCitation = {
      id: `cite-${Date.now()}-1`,
      sourceTitle: 'Đại Việt Sử Ký Toàn Thư',
      author: 'Ngô Sĩ Liên & Sử thần nhà Lê',
      volumeOrChapter: 'Bản kỷ toàn thư',
      quoteExcerpt: `Ghi chép về sự kiện ${topic} trong dòng chảy hưng thịnh của non sông Đại Việt.`,
      verificationUrl: 'https://vi.wikipedia.org/wiki/L%E1%BB%8Bch_s%E1%BB%AD_Vi%E1%BB%87t_Nam'
    };

    const citation2: HistoricalCitation = {
      id: `cite-${Date.now()}-2`,
      sourceTitle: 'Khâm Định Việt Sử Thông Giám Cương Mục',
      author: 'Quốc Sử Quán Triều Nguyễn',
      volumeOrChapter: 'Chính biên',
      quoteExcerpt: `Khảo đính nghiêm cẩn về ${topic}, khẳng định tinh thần tự cường dân tộc.`
    };

    const facts: ResearchFact[] = [
      {
        id: `fact-${Date.now()}-1`,
        category: 'CONFIRMED_FACT',
        factSummary: `Sự kiện ${topic} diễn ra trong bối cảnh ${historicalEra}, phản ánh tinh thần kiên cường và trí tuệ chiến lược của tiền nhân.`,
        yearOrEra: historicalEra,
        keyFigures: ['Anh hùng dân tộc Việt Nam'],
        location: 'Đất nước Việt Nam',
        citations: [citation1, citation2]
      },
      {
        id: `fact-${Date.now()}-2`,
        category: 'HISTORICAL_HYPOTHESIS',
        factSummary: `Các nghiên cứu khảo cổ học hiện đại tiếp tục làm sáng tỏ các dấu tích di vật liên quan đến ${topic}.`,
        yearOrEra: 'Thời kỳ khảo cổ hiện đại',
        keyFigures: ['Nhóm nghiên cứu Viện Sử học'],
        location: 'Các khu di tích lịch sử quốc gia',
        citations: [citation1]
      }
    ];

    return {
      topic,
      historicalEra,
      summary: `Tài liệu nghiên cứu thẩm định về "${topic}" thuộc ${historicalEra}. Dữ kiện đã được đối chiếu với Đại Việt Sử Ký Toàn Thư và Khâm Định Việt Sử Thông Giám Cương Mục.`,
      facts,
      verifiedAt: new Date().toISOString(),
      isApproved: false
    };
  }

  async generateScript(dossier: ResearchDossier): Promise<ScriptDocument> {
    const normalized = dossier.topic.toLowerCase();
    if (normalized.includes('bạch đằng') || normalized.includes('ngô quyền')) {
      return PREDEFINED_HISTORY_TOPICS['bach-dang-938'].script;
    }
    if (normalized.includes('rạch gầm') || normalized.includes('quân xiêm') || normalized.includes('nguyễn huệ')) {
      return PREDEFINED_HISTORY_TOPICS['rach-gam-xoai-mut-1785'].script;
    }

    // Dynamic 4-scene script
    return {
      title: `${dossier.topic}: Bản anh hùng ca bất diệt`,
      hook: `Bạn có biết điều phi thường nào đã tạo nên dấu ấn chấn động trong ${dossier.topic}?`,
      context: `Vào ${dossier.historicalEra}, non sông đứng trước những thử thách lịch sử khắc nghiệt.`,
      climax: `Bằng ý chí quật cường và mưu lược kiệt xuất, cha ông ta đã làm nên chiến công hiển hách!`,
      resolutionAndCta: `Hãy tự hào về ngàn năm văn hiến! Bạn cảm nhận thế nào về trang sử hào hùng này?`,
      fullNarrative: `Bạn có biết điều phi thường nào đã tạo nên dấu ấn chấn động trong ${dossier.topic}? Vào ${dossier.historicalEra}, non sông đứng trước thử thách lịch sử. Nhưng bằng ý chí quật cường, cha ông ta đã làm nên chiến công rực rỡ muôn đời!`,
      totalWords: 52,
      estimatedTotalDurationSec: 25,
      isApproved: false,
      scenes: [
        {
          sceneNumber: 1,
          title: 'Khơi nguồn sử thi',
          narrativeText: `Bạn có biết điều phi thường nào đã tạo nên dấu ấn chấn động trong ${dossier.topic}?`,
          wordCount: 16,
          estimatedDurationSec: 6,
          visualPrompt: `Epic 9:16 vertical view of historical Vietnamese landscape in ${dossier.historicalEra}, golden morning sun, cinematic mist.`,
          cameraMotion: 'ZOOM_IN',
          factIds: [dossier.facts[0]?.id || 'f1']
        },
        {
          sceneNumber: 2,
          title: 'Bối cảnh nguy nan',
          narrativeText: `Vào ${dossier.historicalEra}, vận mệnh dân tộc đứng trước những bước ngoặt lịch sử hệ trọng.`,
          wordCount: 16,
          estimatedDurationSec: 6,
          visualPrompt: `Dramatic historical scene of ancient Vietnamese generals and warriors gathering in council, torches, serious atmosphere, 9:16 vertical format.`,
          cameraMotion: 'PAN_LEFT',
          factIds: [dossier.facts[0]?.id || 'f1']
        },
        {
          sceneNumber: 3,
          title: 'Cao trào quyết chiến',
          narrativeText: `Bằng trí tuệ và lòng quả cảm phi thường, quân dân Đại Việt đã bẻ gãy ý chí quân thù!`,
          wordCount: 18,
          estimatedDurationSec: 7,
          visualPrompt: `Dynamic ancient battle recreation, Vietnamese bronze flags, war drums, heroic determination, cinematic smoke and lighting, 9:16 aspect ratio.`,
          cameraMotion: 'ZOOM_OUT',
          factIds: [dossier.facts[0]?.id || 'f1']
        },
        {
          sceneNumber: 4,
          title: 'Âm vang ngàn năm',
          narrativeText: `Chiến tích vẻ vang để lại niềm kiêu hãnh bất diệt trong tâm khảm của muôn đời con cháu Lạc Hồng!`,
          wordCount: 19,
          estimatedDurationSec: 7,
          visualPrompt: `Triumphant golden statue or heroic historical monument surrounded by blooming lotus and Vietnamese traditional motifs, glorious atmosphere, 9:16 vertical.`,
          cameraMotion: 'ZOOM_IN',
          factIds: [dossier.facts[0]?.id || 'f1']
        }
      ]
    };
  }

  estimateCost(units: number, service: ServiceType): CostRecord {
    // Mock cost: $0.00 actual cost
    const costUsd = service === 'LLM_RESEARCH' ? 0.02 : 0.015;
    return {
      id: `cost-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      projectId: '',
      provider: this.name,
      service,
      unitsUsed: units,
      unitType: 'TOKENS',
      estimatedCostUSD: costUsd,
      estimatedCostVND: Math.round(costUsd * 25400),
      createdAt: new Date().toISOString()
    };
  }
}
