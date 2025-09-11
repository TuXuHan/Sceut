// 簡化備用推薦系統
export function getStaticRecommendations(gender: string) {
  if (gender === "feminine") {
    return {
      brands: [
        {
          id: "kenzo",
          name: "Kenzo",
          origin: "法國",
          style: "日式自然美學與法式浪漫結合",
          description: "高田賢三創立的品牌，融合日式自然敬畏與法式浪漫情懷。",
          occasions: "日常休閒、戶外活動",
          reason: "品牌的自然美學與活力特質完美匹配。",
          recommendedFragrance: {
            name: "Flower",
            description: "經典花香調，純真而充滿活力",
          },
        },
        {
          id: "issey",
          name: "Issey Miyake",
          origin: "日本",
          style: "極簡主義美學與創新科技結合",
          description: "三宅一生香水系列體現極簡美學和創新追求。",
          occasions: "現代都市、簡約生活",
          reason: "極簡美學能夠帶來純淨現代的香氣體驗。",
          recommendedFragrance: {
            name: "L'Eau d'Issey",
            description: "經典水感香調，純淨如山泉般清新",
          },
        },
        {
          id: "diptyque",
          name: "Diptyque",
          origin: "法國",
          style: "東方元素與法式優雅融合",
          description: "巴黎香水品牌，創造融合東西方美學的獨特作品。",
          occasions: "優雅聚會、文化活動",
          reason: "對東方文化的理解能帶來獨特香氣體驗。",
          recommendedFragrance: {
            name: "Kyoto",
            description: "致敬京都的香調，融合寺廟香火與日式庭園",
          },
        },
      ],
      analysis: "清新香調適合日常佩戴，能營造專業形象。建議選擇具有良好平衡感的香水作品。",
    }
  } else {
    return {
      brands: [
        {
          id: "cdg-m",
          name: "Comme des Garçons",
          origin: "日本",
          style: "前衛木質香調，現代男性魅力",
          description: "川久保玲品牌的香水系列，為現代男性提供獨特香氣選擇。",
          occasions: "創意工作、個性展現",
          reason: "創新精神和獨特木質香調符合偏好。",
          recommendedFragrance: {
            name: "Hinoki",
            description: "日本檜木靈感，森林般寧靜純淨",
          },
        },
        {
          id: "auphorie",
          name: "Auphorie",
          origin: "日本",
          style: "奢華東方香調，神秘深沉",
          description: "日本小眾品牌專注東方神秘色彩的奢華體驗。",
          occasions: "特殊場合、個人收藏",
          reason: "東方神秘美學能滿足品味追求。",
          recommendedFragrance: {
            name: "Miyako",
            description: "京都靈感的奢華東方香調",
          },
        },
        {
          id: "takasago",
          name: "高砂香料",
          origin: "日本",
          style: "傳統香道與現代技術融合",
          description: "日本重要香料公司，傳統香道與現代調香結合。",
          occasions: "冥想靜思、文化體驗",
          reason: "傳統工藝和現代美學展現成熟品味。",
          recommendedFragrance: {
            name: "Oud Kyoto",
            description: "京都沉香，傳統香道現代演繹",
          },
        },
      ],
      analysis: "木質香調適合商務場合，能建立穩重形象。建議選擇具有東方文化底蘊的香水品牌。",
    }
  }
}
