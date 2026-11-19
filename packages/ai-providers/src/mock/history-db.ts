import { ResearchFact, ResearchDossier, ScriptDocument } from '@vietsu/shared';

export interface PredefinedTopic {
  topic: string;
  historicalEra: string;
  dossier: ResearchDossier;
  script: ScriptDocument;
}

export const PREDEFINED_HISTORY_TOPICS: Record<string, PredefinedTopic> = {
  'bach-dang-938': {
    topic: 'Chiến thắng Bạch Đằng năm 938 của Ngô Quyền',
    historicalEra: 'Thời kỳ Tự chủ & Tiền Ngô',
    dossier: {
      topic: 'Chiến thắng Bạch Đằng năm 938 của Ngô Quyền',
      historicalEra: 'Thời kỳ Tự chủ & Tiền Ngô',
      summary: 'Năm 938, Ngô Quyền lãnh đạo quân dân Đại Việt đánh tan quân xâm lược Nam Hán do Hoằng Thao chỉ huy trên sông Bạch Đằng bằng chiến thuật cọc ngầm bịt sắt, kết thúc hơn 1000 năm Bắc thuộc, mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc.',
      verifiedAt: new Date().toISOString(),
      isApproved: true,
      facts: [
        {
          id: 'fact-bd-1',
          category: 'CONFIRMED_FACT',
          factSummary: 'Ngô Quyền cho đóng cọc gỗ vạt nhọn, đầu bịt sắt ở cửa sông Bạch Đằng, lợi dụng thủy triều lên xuống để nhử và phá hủy chiến thuyền giặc.',
          yearOrEra: 'Năm 938',
          keyFigures: ['Ngô Quyền', 'Lưu Hoằng Thao', 'Lưu Cung'],
          location: 'Cửa sông Bạch Đằng (vùng giáp ranh Hải Phòng - Quảng Ninh ngày nay)',
          citations: [
            {
              id: 'cite-bd-1',
              sourceTitle: 'Đại Việt Sử Ký Toàn Thư',
              author: 'Ngô Sĩ Liên',
              volumeOrChapter: 'Ngoại kỷ - Quyển V: Tiền Ngô Vương',
              pageOrSection: 'Tờ 11a',
              quoteExcerpt: 'Vương sai đóng cọc lớn vạt nhọn, đầu bịt sắt ngầm ở cửa biển trước, rồi cho thuyền nhẹ ra khiêu chiến khi triều lên...',
              verificationUrl: 'https://vi.wikipedia.org/wiki/Tr%E1%BA%ADn_B%E1%BA%A1ch_%C4%90%E1%BA%B1ng_(938)'
            },
            {
              id: 'cite-bd-2',
              sourceTitle: 'Việt Sử Tiêu Án',
              author: 'Ngô Thì Sĩ',
              volumeOrChapter: 'Tiền Ngô Vương kỷ',
              pageOrSection: 'Mục năm Mậu Tuất (938)',
              quoteExcerpt: 'Hoằng Thao khinh địch đuổi theo, khi triều rút, thuyền giặc mắc vào cọc ngầm bị đắm tan tác.'
            }
          ]
        },
        {
          id: 'fact-bd-2',
          category: 'CONFIRMED_FACT',
          factSummary: 'Hoằng Thao tử trận cùng quá nửa quân lính, vua Nam Hán Lưu Cung đang đóng quân ở biên giới nghe tin bại trận chỉ biết khóc thương và rút quân.',
          yearOrEra: 'Mùa đông năm 938',
          keyFigures: ['Hoằng Thao', 'Lưu Cung', 'Ngô Quyền'],
          location: 'Cửa biển Bạch Đằng',
          citations: [
            {
              id: 'cite-bd-3',
              sourceTitle: 'Khâm Định Việt Sử Thông Giám Cương Mục',
              author: 'Quốc Sử Quán Triều Nguyễn',
              volumeOrChapter: 'Tiền biên - Quyển V',
              quoteExcerpt: 'Lưu Cung thương khóc, thu nhặt tàn quân rút lui, từ đó không dám nhòm ngó phương Nam nữa.'
            }
          ]
        },
        {
          id: 'fact-bd-3',
          category: 'HISTORICAL_HYPOTHESIS',
          factSummary: 'Khu vực bãi cọc được phát hiện tại Yên Hưng (Yên Giang, Quảng Ninh) và Đầm Thượng (Cao Quỳ, Thủy Nguyên, Hải Phòng) có thể là một phần trong hệ thống trận địa liên hoàn thời Ngô Quyền hoặc thời Trần.',
          yearOrEra: 'Khai quật khảo cổ 1958 - 2019',
          keyFigures: ['Các nhà khảo cổ Viện Khảo cổ học Việt Nam'],
          location: 'Khu di tích bãi cọc Yên Giang và bãi cọc Cao Quỳ',
          citations: [
            {
              id: 'cite-bd-4',
              sourceTitle: 'Báo cáo Khảo cổ học Việt Nam',
              author: 'Viện Khảo cổ học',
              volumeOrChapter: 'Số 4/2020',
              quoteExcerpt: 'Phân tích niên đại Carbon C14 trên mẫu gỗ cọc lim, sến, táu cho thấy các mốc trùng khớp với thế kỷ X và XIII.'
            }
          ]
        }
      ]
    },
    script: {
      title: 'Huyết chiến Bạch Đằng 938: Bãi cọc ngầm chấm dứt nghìn năm Bắc thuộc',
      hook: 'Bạn có biết: Một con sông đã chôn vùi dã tâm của cả một đế chế phương Bắc chỉ trong nửa ngày?',
      context: 'Năm 938, đoàn chiến thuyền vĩ đại của Nam Hán do Hoằng Thao dẫn đầu hung hãn tiến vào cửa ngõ Đại Việt, toan áp đặt ách thống trị vĩnh viễn.',
      climax: 'Nhưng Ngô Quyền đã bày trận địa cọc ngầm bịt sắt! Khi thủy triều rút cạn, chiến thuyền giặc mắc cạn tan nát, Hoằng Thao đền tội giữa biển khơi!',
      resolutionAndCta: 'Chiến thắng Bạch Đằng khẳng định nền độc lập trường tồn của dân tộc. Bạn tự hào nhất về điều gì trong lịch sử nước nhà?',
      fullNarrative: 'Bạn có biết: Một con sông đã chôn vùi dã tâm của cả một đế chế phương Bắc chỉ trong nửa ngày? Năm 938, đoàn chiến thuyền Nam Hán hung hãn tiến vào Đại Việt. Nhưng Ngô Quyền đã bày sẵn bãi cọc ngầm bịt sắt. Khi thủy triều rút cạn, thuyền giặc mắc cạn vỡ tan tành. Chiến thắng Bạch Đằng chấm dứt hơn 1000 năm Bắc thuộc, mở ra kỷ nguyên tự chủ muôn đời!',
      totalWords: 72,
      estimatedTotalDurationSec: 30,
      isApproved: true,
      scenes: [
        {
          sceneNumber: 1,
          title: 'Cửa biển Bạch Đằng sục sôi',
          narrativeText: 'Bạn có biết: Một con sông đã chôn vùi dã tâm của cả một đế chế phương Bắc chỉ trong nửa ngày?',
          wordCount: 20,
          estimatedDurationSec: 7,
          visualPrompt: 'Cinematic 9:16 vertical shot, ancient Bach Dang river in Vietnam during dawn, mist rising over water, dark clouds, dramatic contrast, historical epic atmosphere.',
          cameraMotion: 'ZOOM_IN',
          factIds: ['fact-bd-1']
        },
        {
          sceneNumber: 2,
          title: 'Chiến thuyền Nam Hán hung hãn',
          narrativeText: 'Năm 938, đoàn chiến thuyền Nam Hán hung hãn tiến vào Đại Việt hòng đô hộ nước ta.',
          wordCount: 16,
          estimatedDurationSec: 7,
          visualPrompt: 'Ancient war galleys of Southern Han navy advancing with large banners, dark waters, ominous weather, epic fleet view, 9:16 vertical framing.',
          cameraMotion: 'PAN_LEFT',
          factIds: ['fact-bd-1']
        },
        {
          sceneNumber: 3,
          title: 'Trận địa cọc ngầm bịt sắt',
          narrativeText: 'Nhưng Ngô Quyền đã bày sẵn bãi cọc ngầm bịt sắt. Khi thủy triều rút cạn, thuyền giặc mắc cạn vỡ tan tành!',
          wordCount: 22,
          estimatedDurationSec: 8,
          visualPrompt: 'Historical recreation of iron-tipped wooden stakes emerging as tide recedes, enemy wooden warships crashing and splintering, fierce battle smoke, 9:16 format.',
          cameraMotion: 'ZOOM_OUT',
          factIds: ['fact-bd-1', 'fact-bd-2']
        },
        {
          sceneNumber: 4,
          title: 'Khúc ca khải hoàn độc lập',
          narrativeText: 'Chiến thắng Bạch Đằng chấm dứt hơn 1000 năm Bắc thuộc, mở ra kỷ nguyên tự chủ muôn đời!',
          wordCount: 16,
          estimatedDurationSec: 8,
          visualPrompt: 'Heroic portrait of King Ngo Quyen in traditional Vietnamese royal battle attire overlooking Bach Dang river at sunrise, victorious golden sunlight, 9:16 vertical.',
          cameraMotion: 'ZOOM_IN',
          factIds: ['fact-bd-2']
        }
      ]
    }
  },

  'rach-gam-xoai-mut-1785': {
    topic: 'Trận Rạch Gầm - Xoài Mút năm 1785',
    historicalEra: 'Thời kỳ Tây Sơn (1778 - 1802)',
    dossier: {
      topic: 'Trận Rạch Gầm - Xoài Mút năm 1785',
      historicalEra: 'Thời kỳ Tây Sơn (1778 - 1802)',
      summary: 'Đầu năm 1785, Nguyễn Huệ chỉ huy nghĩa quân Tây Sơn mai phục và tiêu diệt gần như hoàn toàn 5 vạn quân Xiêm La (Thái Lan) trên khúc sông Tiền đoạn từ Rạch Gầm đến Xoài Mút (Tiền Giang ngày nay), bảo vệ vững chắc chủ quyền bờ cõi phương Nam.',
      verifiedAt: new Date().toISOString(),
      isApproved: true,
      facts: [
        {
          id: 'fact-rg-1',
          category: 'CONFIRMED_FACT',
          factSummary: 'Nguyễn Huệ bố trí mai phục dọc hai bờ sông và các cù lao, dùng thuyền nhẹ nhử quân Xiêm lọt vào trận địa hỏa công khép kín.',
          yearOrEra: 'Đêm 19 rạng sáng 20 tháng 1 năm 1785',
          keyFigures: ['Nguyễn Huệ', 'Chiêu Tăng', 'Chiêu Sương', 'Nguyễn Ánh'],
          location: 'Sông Tiền, đoạn Rạch Gầm đến Xoài Mút (Tiền Giang)',
          citations: [
            {
              id: 'cite-rg-1',
              sourceTitle: 'Đại Nam Thực Lục',
              author: 'Quốc Sử Quán Triều Nguyễn',
              volumeOrChapter: 'Tiền biên - Quyển 12',
              quoteExcerpt: 'Quân Tây Sơn đón đánh ở Rạch Gầm, dùng súng lớn và hỏa hổ bắn phá dữ dội, thuyền giặc tan vỡ...'
            }
          ]
        }
      ]
    },
    script: {
      title: 'Sấm sét Rạch Gầm - Xoài Mút 1785: 5 vạn quân Xiêm khiếp đảm Tây Sơn',
      hook: 'Chỉ trong một đêm, Nguyễn Huệ đã quét sạch 5 vạn quân ngoại bang hùng hổ bằng hỏa công sấm sét!',
      context: 'Năm 1785, liên quân Xiêm La cậy quân đông tràn vào miền Nam, cướp bóc tàn bạo, khiến muôn dân oán thán.',
      climax: 'Đêm ngày 19 tháng 1, pháo lệnh nổ vang trời! Thuyền chiến Tây Sơn đồng loạt phóng hỏa, biến khúc sông Rạch Gầm thành biển lửa cuồn cuộn!',
      resolutionAndCta: 'Từ đây, người Xiêm sợ Tây Sơn như sợ cọp! Hãy bình luận để tưởng nhớ công đức anh hùng áo vải cờ đào!',
      fullNarrative: 'Chỉ trong một đêm, Nguyễn Huệ đã quét sạch 5 vạn quân ngoại bang bằng hỏa công sấm sét! Năm 1785, liên quân Xiêm La tràn vào cướp phá phương Nam. Tại khúc sông Rạch Gầm, pháo lệnh Tây Sơn nổ vang, thuyền chiến phóng hỏa biến dòng sông thành biển lửa! Người Xiêm sau trận này sợ Tây Sơn như cọp!',
      totalWords: 64,
      estimatedTotalDurationSec: 28,
      isApproved: true,
      scenes: [
        {
          sceneNumber: 1,
          title: 'Khói lửa miền Tây Nam Bộ',
          narrativeText: 'Chỉ trong một đêm, Nguyễn Huệ đã quét sạch 5 vạn quân ngoại bang bằng hỏa công sấm sét!',
          wordCount: 18,
          estimatedDurationSec: 7,
          visualPrompt: 'Dramatic vertical 9:16 view of burning warships on a wide tropical river at night, fiery orange reflections, sparks in the dark sky, heroic historical theme.',
          cameraMotion: 'ZOOM_IN',
          factIds: ['fact-rg-1']
        },
        {
          sceneNumber: 2,
          title: 'Quân Xiêm ngạo mạn',
          narrativeText: 'Năm 1785, liên quân Xiêm La tràn vào cướp phá phương Nam, coi thường quân dân ta.',
          wordCount: 15,
          estimatedDurationSec: 7,
          visualPrompt: 'Historical illustration of 18th century Siamese navy fleets invading Mekong delta riverbanks, ancient flags, 9:16 vertical composition.',
          cameraMotion: 'PAN_LEFT',
          factIds: ['fact-rg-1']
        },
        {
          sceneNumber: 3,
          title: 'Bão lửa Rạch Gầm',
          narrativeText: 'Tại khúc sông Rạch Gầm, pháo lệnh Tây Sơn nổ vang, thuyền chiến phóng hỏa biến dòng sông thành biển lửa!',
          wordCount: 19,
          estimatedDurationSec: 7,
          visualPrompt: 'Epic battle on river, Vietnamese Tay Son soldiers firing cannons and fire-lances from war junks, exploding enemy fleet, intense cinematic action 9:16.',
          cameraMotion: 'ZOOM_OUT',
          factIds: ['fact-rg-1']
        },
        {
          sceneNumber: 4,
          title: 'Oai danh Tây Sơn',
          narrativeText: 'Người Xiêm sau trận này sợ uy thế Tây Sơn như sợ cọp, bờ cõi phương Nam sạch bóng quân thù!',
          wordCount: 19,
          estimatedDurationSec: 7,
          visualPrompt: 'Emperor Quang Trung Nguyen Hue on war horse with red royal banner, majestic landscape of Southern Vietnam, victorious sunset light, 9:16 vertical portrait.',
          cameraMotion: 'ZOOM_IN',
          factIds: ['fact-rg-1']
        }
      ]
    }
  }
};
