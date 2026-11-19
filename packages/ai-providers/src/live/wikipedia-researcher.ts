import { ResearchDossier, ResearchFact, HistoricalCitation } from '@vietsu/shared';

interface WikiSearchResult {
  title: string;
  snippet: string;
}

export class WikipediaHistoricalResearcher {
  private userAgent = 'VietSuStudioBot/1.0 (contact@vietsu.vn; Vietnamese History Educational Project)';

  public async research(topic: string, historicalEra: string): Promise<ResearchDossier> {
    try {
      // 1. Search Wikipedia for topic
      const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        topic
      )}&format=json&utf8=1`;

      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!searchRes.ok) {
        throw new Error(`Wikipedia search failed with status: ${searchRes.status}`);
      }

      const searchData = (await searchRes.json()) as any;
      const searchList: WikiSearchResult[] = searchData?.query?.search || [];

      if (searchList.length === 0) {
        return this.createFallbackDossier(topic, historicalEra, 'Không tìm thấy bài viết Wikipedia tương ứng');
      }

      // Pick top article
      const topArticle = searchList[0];
      const articleTitle = topArticle.title;

      // 2. Fetch full article extract
      const extractUrl = `https://vi.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(
        articleTitle
      )}&format=json&utf8=1`;

      const extractRes = await fetch(extractUrl, {
        headers: { 'User-Agent': this.userAgent }
      });

      const extractData = (await extractRes.json()) as any;
      const pages = extractData?.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      const fullText: string = page?.extract || topArticle.snippet.replace(/<[^>]+>/g, '');
      const verificationUrl = `https://vi.wikipedia.org/wiki/${encodeURIComponent(articleTitle.replace(/ /g, '_'))}`;

      // 3. Parse paragraphs into verified facts
      const paragraphs = fullText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length >= 40 && !p.startsWith('=='));

      const facts: ResearchFact[] = [];

      // Extract main confirmed fact from intro
      const introSummary = paragraphs[0] || `${topic} là một dấu mốc lịch sử quan trọng thuộc ${historicalEra}.`;
      
      // Wikipedia is a collaborative encyclopedia (secondary source), NOT an independently verified primary historical chronicle
      const primaryCitation: HistoricalCitation = {
        id: `cite_wiki_${Date.now()}_1`,
        sourceTitle: `Bách khoa toàn thư mở Wikipedia (tiếng Việt) - Bài viết: "${articleTitle}"`,
        author: 'Cộng đồng biên tập Wikipedia tiếng Việt',
        volumeOrChapter: 'Mục Tổng quan và Diễn biến lịch sử',
        quoteExcerpt: introSummary.slice(0, 200),
        verificationUrl,
        isMockSource: false,
        isIndependentlyVerified: false, // Explicitly false: Wikipedia is secondary/open, not independently attested primary chronicle
        verificationLevel: 'WIKIPEDIA_SECONDARY_SOURCE',
        verificationEvidence: `Dữ liệu lịch sử được trích xuất từ ấn bản bách khoa điện tử tiếng Việt "${articleTitle}". Cần đối chiếu với chính sử độc lập để đạt chuẩn kiểm chứng hàn lâm.`
      };

      facts.push({
        id: `fact_wiki_1`,
        category: 'CONFIRMED_FACT',
        factSummary: introSummary.slice(0, 250),
        yearOrEra: historicalEra || 'Lịch sử Việt Nam',
        keyFigures: this.extractKeyFigures(fullText, topic),
        location: this.extractLocation(fullText, topic),
        citations: [primaryCitation],
        isApproved: false,
        isMockSource: false
      });

      // Extract subsequent facts if available
      for (let i = 1; i < Math.min(paragraphs.length, 4); i++) {
        const para = paragraphs[i];
        if (para.length > 50) {
          facts.push({
            id: `fact_wiki_${i + 1}`,
            category: para.toLowerCase().includes('giả thuyết') || para.toLowerCase().includes('khảo cổ')
              ? 'HISTORICAL_HYPOTHESIS'
              : 'CONFIRMED_FACT',
            factSummary: para.slice(0, 250),
            yearOrEra: historicalEra || 'Lịch sử Việt Nam',
            keyFigures: this.extractKeyFigures(para, topic),
            location: this.extractLocation(para, topic),
            citations: [
              {
                id: `cite_wiki_${Date.now()}_${i + 1}`,
                sourceTitle: `Wikipedia tiếng Việt - "${articleTitle}"`,
                author: 'Cộng đồng biên tập Wikipedia tiếng Việt',
                volumeOrChapter: `Đoạn tư liệu ${i + 1}`,
                quoteExcerpt: para.slice(0, 180),
                verificationUrl,
                isMockSource: false,
                isIndependentlyVerified: false,
                verificationLevel: 'WIKIPEDIA_SECONDARY_SOURCE',
                verificationEvidence: `Trích xuất từ mục diễn biến "${articleTitle}" trên Wikipedia tiếng Việt.`
              }
            ],
            isApproved: false,
            isMockSource: false
          });
        }
      }

      return {
        topic,
        historicalEra: historicalEra || 'Lịch sử Việt Nam',
        summary: introSummary.slice(0, 300),
        facts,
        verifiedAt: new Date().toISOString(),
        isApproved: false,
        isMockEngine: false
      };
    } catch (err: any) {
      console.warn(`[WikipediaResearcher] Tra cứu trực tuyến thất bại (${err.message}). Chuyển sang hồ sơ dữ liệu chờ người dùng xác minh.`);
      return this.createFallbackDossier(topic, historicalEra, err.message);
    }
  }

  private extractKeyFigures(text: string, defaultTopic: string): string[] {
    const knownFigures = [
      'Ngô Quyền', 'Trần Hưng Đạo', 'Lý Thường Kiệt', 'Quang Trung', 'Nguyễn Huệ',
      'Lê Lợi', 'Nguyễn Trãi', 'Đinh Bộ Lĩnh', 'Hai Bà Trưng', 'Bà Triệu',
      'An Dương Vương', 'Phùng Hưng', 'Mai Thúc Loan', 'Lý Nam Đế', 'Trần Quốc Tuấn'
    ];
    const found = knownFigures.filter(f => text.includes(f));
    return found.length > 0 ? found : [defaultTopic.split(' ')[0] || 'Danh nhân Việt Nam'];
  }

  private extractLocation(text: string, defaultTopic: string): string {
    const knownLocations = [
      'Sông Bạch Đằng', 'Thăng Long', 'Hoa Lư', 'Ải Chi Lăng', 'Núi Lam Sơn',
      'Ngọc Hồi', 'Đống Đa', 'Sông Như Nguyệt', 'Hà Nội', 'Quảng Ninh', 'Hải Phòng'
    ];
    const found = knownLocations.find(loc => text.includes(loc));
    return found || 'Địa danh lịch sử Việt Nam';
  }

  /**
   * Tạo hồ sơ dự phòng khi tra cứu thất bại.
   * TUYỆT ĐỐI KHÔNG bịa đặt nguồn sử sách (như Đại Việt Sử Ký Toàn Thư) khi chưa thực sự đối chiếu.
   */
  private createFallbackDossier(topic: string, historicalEra: string, reason: string): ResearchDossier {
    return {
      topic,
      historicalEra,
      summary: `Hồ sơ nghiên cứu sự kiện "${topic}" thuộc ${historicalEra}. (${reason}). Dữ liệu đang chờ xác minh độc lập.`,
      verifiedAt: new Date().toISOString(),
      isApproved: false,
      isMockEngine: false,
      facts: [
        {
          id: `fact_fallback_1`,
          category: 'HISTORICAL_HYPOTHESIS', // Đánh dấu giả định khi chưa tìm thấy tài liệu xác thực
          factSummary: `Sự kiện "${topic}" trong thời kỳ ${historicalEra} cần được cung cấp tư liệu và đối chiếu nguồn sử học trước khi xuất bản.`,
          yearOrEra: historicalEra,
          keyFigures: [topic.split(' ')[0] || 'Chưa rõ nhân vật'],
          location: 'Việt Nam',
          citations: [
            {
              id: `cite_fallback_1`,
              sourceTitle: 'Chưa có nguồn kiểm chứng trực tuyến',
              author: 'Hệ thống tự động (Chờ người dùng cung cấp nguồn)',
              volumeOrChapter: 'Chưa xác minh',
              quoteExcerpt: `Dữ liệu về ${topic} cần được người dùng tải lên tư liệu hoặc kiểm chứng thủ công. (${reason})`,
              verificationUrl: '',
              isMockSource: false,
              isIndependentlyVerified: false,
              verificationLevel: 'UNVERIFIED',
              verificationEvidence: 'Không tìm thấy bài viết Wikipedia tương ứng. Cần người dùng phê duyệt và bổ sung trích dẫn chính sử trước khi xuất bản.'
            }
          ],
          isApproved: false,
          isMockSource: false
        }
      ]
    };
  }
}
