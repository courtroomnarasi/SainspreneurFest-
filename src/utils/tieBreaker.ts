import { Evaluation, Team, TeamAggregatedScore } from '../types';
import { ARTICLE_RUBRIC, VIDEO_RUBRIC } from '../data/rubricData';

export function calculateSingleArticleScore(score: Evaluation['articleScore'] | number): number {
  if (typeof score === 'number') {
    return Number((score || 0).toFixed(2));
  }
  if (!score || typeof score !== 'object') return 0;
  let total = 0;
  ARTICLE_RUBRIC.forEach(item => {
    const rawScore = (score as any)[item.id] || 0;
    if (rawScore >= 1 && rawScore <= 4) {
      total += item.levels[rawScore as 1 | 2 | 3 | 4].points;
    }
  });
  return Number(total.toFixed(2));
}

export function calculateSingleVideoScore(video: Evaluation['videoScore'] | number): number {
  if (typeof video === 'number') {
    return Number((video || 0).toFixed(2));
  }
  if (!video || typeof video !== 'object') return 0;
  let total = 0;
  VIDEO_RUBRIC.forEach(item => {
    const rawScore = (video as any)[item.id] || 0;
    if (rawScore >= 1 && rawScore <= 4) {
      total += item.levels[rawScore as 1 | 2 | 3 | 4].points;
    }
  });
  const penalty = video.durationPenalty || 0;
  return Number(Math.max(0, total - penalty).toFixed(2));
}

export function calculateSingleFinalScore(final: Evaluation['finalScore']): number {
  if (!final) return 0;
  const f1 = (final.f1 || 0) * 7.5; // max 30
  const f2 = (final.f2 || 0) * 7.5; // max 30
  const f3 = (final.f3 || 0) * 5.0; // max 20
  const f4 = (final.f4 || 0) * 5.0; // max 20
  return Number((f1 + f2 + f3 + f4).toFixed(2));
}

export function aggregateTeamsScores(teams: Team[], evaluations: Evaluation[]): TeamAggregatedScore[] {
  const aggregated: TeamAggregatedScore[] = teams.map(team => {
    const teamEvals = evaluations.filter(e => e.teamId === team.id && e.status === 'submitted');
    
    if (teamEvals.length === 0) {
      return {
        team,
        evaluationsCount: 0,
        articleScoreAvg: 0,
        videoScoreAvg: 0,
        finalScoreAvg: 0,
        scoreSainsInovasi: 0,
        scoreKelayakanBisnis: 0,
        scoreBahanLokal: 0,
        scorePresentasiPenulisan: 0,
        totalScore: 0
      };
    }

    let sumArticle = 0;
    let sumVideo = 0;
    let sumFinal = 0;

    let sumSains = 0;
    let sumBisnis = 0;
    let sumLokal = 0;
    let sumPres = 0;

    teamEvals.forEach(ev => {
      const art = calculateSingleArticleScore(ev.articleScore as any);
      const vid = calculateSingleVideoScore(ev.videoScore as any);
      sumArticle += art;
      sumVideo += vid;

      const isArtObj = ev.articleScore && typeof ev.articleScore === 'object';
      const isVidObj = ev.videoScore && typeof ev.videoScore === 'object';

      if (isArtObj && isVidObj) {
        // Extract Priority components from rubric items
        // Sains (30%): A1 (8+12+10=30) and V1 (15+15=30)
        const a1 = ((ev.articleScore.a1_1 || 0) * 2) + ((ev.articleScore.a1_2 || 0) * 3) + ((ev.articleScore.a1_3 || 0) * 2.5);
        const v1 = ((ev.videoScore.v1_1 || 0) * 3.75) + ((ev.videoScore.v1_2 || 0) * 3.75);
        const sains = (a1 + v1) / 2; // out of 30

        // Bisnis (30%): A2 (8+10+12=30) and V2 (12+12+6=30)
        const a2 = ((ev.articleScore.a2_1 || 0) * 2) + ((ev.articleScore.a2_2 || 0) * 2.5) + ((ev.articleScore.a2_3 || 0) * 3);
        const v2 = ((ev.videoScore.v2_1 || 0) * 3) + ((ev.videoScore.v2_2 || 0) * 3) + ((ev.videoScore.v2_3 || 0) * 1.5);
        const bisnis = (a2 + v2) / 2; // out of 30

        // Bahan Lokal Pasuruan (20%): A3 (10+10=20) and V3 (12+8=20)
        const a3 = ((ev.articleScore.a3_1 || 0) * 2.5) + ((ev.articleScore.a3_2 || 0) * 2.5);
        const v3 = ((ev.videoScore.v3_1 || 0) * 3) + ((ev.videoScore.v3_2 || 0) * 2);
        const lokal = (a3 + v3) / 2; // out of 20

        // Presentasi & Sistematika (20%): A4 (10+10=20) and V4 (10+10=20)
        const a4 = ((ev.articleScore.a4_1 || 0) * 2.5) + ((ev.articleScore.a4_2 || 0) * 2.5);
        const v4 = ((ev.videoScore.v4_1 || 0) * 2.5) + ((ev.videoScore.v4_2 || 0) * 2.5);
        const pres = (a4 + v4) / 2; // out of 20

        const penalty = ev.videoScore.durationPenalty || 0;

        sumSains += sains;
        sumBisnis += bisnis;
        sumLokal += lokal;
        sumPres += Math.max(0, pres - (penalty / 2));
      } else {
        // Fallback proportional distribution if numeric scores were pulled directly from Spreadsheet
        const combined = (art + vid) / 2;
        sumSains += combined * 0.30;
        sumBisnis += combined * 0.30;
        sumLokal += combined * 0.20;
        sumPres += combined * 0.20;
      }

      if (ev.finalScore) {
        sumFinal += calculateSingleFinalScore(ev.finalScore);
      }
    });

    const count = teamEvals.length;
    const articleAvg = Number((sumArticle / count).toFixed(2));
    const videoAvg = Number((sumVideo / count).toFixed(2));
    const finalAvg = sumFinal > 0 ? Number((sumFinal / count).toFixed(2)) : 0;

    const avgSains = Number((sumSains / count).toFixed(2));
    const avgBisnis = Number((sumBisnis / count).toFixed(2));
    const avgLokal = Number((sumLokal / count).toFixed(2));
    const avgPres = Number((sumPres / count).toFixed(2));

    const totalCombined = Number((avgSains + avgBisnis + avgLokal + avgPres).toFixed(2));

    return {
      team,
      evaluationsCount: count,
      articleScoreAvg: articleAvg,
      videoScoreAvg: videoAvg,
      finalScoreAvg: finalAvg,
      scoreSainsInovasi: avgSains,
      scoreKelayakanBisnis: avgBisnis,
      scoreBahanLokal: avgLokal,
      scorePresentasiPenulisan: avgPres,
      totalScore: totalCombined
    };
  });

  // Sort based on Bagian E:
  // 1. Total Nilai Akhir
  // 2. Prioritas 1: Skor Sains dan Inovasi Produk
  // 3. Prioritas 2: Skor Potensi / Kelayakan Bisnis dan Kemasan
  // 4. Prioritas 3: Skor Pemanfaatan Bahan Lokal Pasuruan
  aggregated.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.scoreSainsInovasi !== a.scoreSainsInovasi) {
      return b.scoreSainsInovasi - a.scoreSainsInovasi;
    }
    if (b.scoreKelayakanBisnis !== a.scoreKelayakanBisnis) {
      return b.scoreKelayakanBisnis - a.scoreKelayakanBisnis;
    }
    if (b.scoreBahanLokal !== a.scoreBahanLokal) {
      return b.scoreBahanLokal - a.scoreBahanLokal;
    }
    return b.scorePresentasiPenulisan - a.scorePresentasiPenulisan;
  });

  return aggregated.map((item, index) => ({
    ...item,
    rank: index + 1,
    isTopTen: index < 10 && item.totalScore > 0
  }));
}
