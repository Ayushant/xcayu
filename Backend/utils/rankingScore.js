/**
 * Ranking Score Calculator
 * 
 * Calculates similarity score between student's ranking and correct ranking
 * Returns percentage score (0-100)
 * 
 * Uses normalized Kendall's tau distance with pairwise comparison
 */

/**
 * Calculate ranking similarity score
 * @param {Array} studentRanking - Student's ranking [{text, rank}, ...]
 * @param {Array} correctRanking - Correct ranking [{text, correctRank}, ...]
 * @returns {Number} Percentage score (0-100)
 */
export function calculateRankingScore(studentRanking, correctRanking) {
  if (!studentRanking || !correctRanking || studentRanking.length === 0) {
    return 0;
  }

  const n = studentRanking.length;
  
  // Create mapping of option text to ranks
  const studentRankMap = {};
  const correctRankMap = {};
  
  studentRanking.forEach(item => {
    studentRankMap[item.text] = item.rank;
  });
  
  correctRanking.forEach(item => {
    correctRankMap[item.text] = item.correctRank || item.rank;
  });

  // Calculate pairwise comparisons
  let concordantPairs = 0;
  let discordantPairs = 0;
  
  const options = Object.keys(studentRankMap);
  
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      const option1 = options[i];
      const option2 = options[j];
      
      const studentOrder = studentRankMap[option1] - studentRankMap[option2];
      const correctOrder = correctRankMap[option1] - correctRankMap[option2];
      
      // Check if the relative ordering is the same
      if (studentOrder * correctOrder > 0) {
        concordantPairs++;
      } else if (studentOrder * correctOrder < 0) {
        discordantPairs++;
      }
      // If equal (studentOrder * correctOrder === 0), we ignore it
    }
  }
  
  const totalPairs = concordantPairs + discordantPairs;
  
  if (totalPairs === 0) {
    // Perfect match or all tied
    return 100;
  }
  
  // Kendall's tau coefficient: (concordant - discordant) / total
  // Normalize to 0-100 scale
  const kendallTau = (concordantPairs - discordantPairs) / totalPairs;
  const percentageScore = ((kendallTau + 1) / 2) * 100;
  
  return Math.round(percentageScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate exact match bonus
 * Gives bonus points for exact position matches
 * @param {Array} studentRanking 
 * @param {Array} correctRanking 
 * @returns {Number} Bonus percentage (0-20)
 */
export function calculateExactMatchBonus(studentRanking, correctRanking) {
  if (!studentRanking || !correctRanking) return 0;
  
  const studentRankMap = {};
  const correctRankMap = {};
  
  studentRanking.forEach(item => {
    studentRankMap[item.text] = item.rank;
  });
  
  correctRanking.forEach(item => {
    correctRankMap[item.text] = item.correctRank || item.rank;
  });
  
  let exactMatches = 0;
  const totalOptions = Object.keys(studentRankMap).length;
  
  for (const option in studentRankMap) {
    if (studentRankMap[option] === correctRankMap[option]) {
      exactMatches++;
    }
  }
  
  // Max 20% bonus for all exact matches
  return (exactMatches / totalOptions) * 20;
}

/**
 * Calculate total ranking score with bonus
 * @param {Array} studentRanking 
 * @param {Array} correctRanking 
 * @returns {Number} Total percentage score (0-100)
 */
export function calculateTotalRankingScore(studentRanking, correctRanking) {
  const baseScore = calculateRankingScore(studentRanking, correctRanking);
  const bonus = calculateExactMatchBonus(studentRanking, correctRanking);
  
  // Base score is already 0-100, bonus adds up to 20 more
  // But we cap at 100
  return Math.min(100, Math.round((baseScore * 0.8 + bonus) * 100) / 100);
}

/**
 * Validate ranking format
 * @param {Array} ranking 
 * @returns {Boolean}
 */
export function isValidRanking(ranking) {
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return false;
  }
  
  const ranks = ranking.map(item => item.rank || item.correctRank);
  const uniqueRanks = new Set(ranks);
  
  // Check if all ranks are present and unique
  if (uniqueRanks.size !== ranking.length) {
    return false;
  }
  
  // Check if ranks are consecutive from 1 to n
  for (let i = 1; i <= ranking.length; i++) {
    if (!uniqueRanks.has(i)) {
      return false;
    }
  }
  
  return true;
}

export default {
  calculateRankingScore,
  calculateExactMatchBonus,
  calculateTotalRankingScore,
  isValidRanking
};

