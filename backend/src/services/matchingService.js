const { Sequelize, Op } = require('sequelize');
const { Factory, Auditor } = require('../models');

class MatchingService {
  constructor() {
    this.maxDistance = 100;
  }

  async findBestAuditor(factoryAddress, factoryLocation) {
    try {
      const factory = await Factory.findOne({
        where: { wallet_address: factoryAddress },
      });

      if (!factory) {
        throw new Error('Factory not found');
      }

      const auditors = await Auditor.findAll({
        where: {
          is_active: true,
          geo_region: {
            [Op.or]: [
              { [Op.eq]: factory.location },
              { [Op.like]: `%${factory.location}%` },
            ],
          },
        },
        order: [
          ['reputation_score', 'DESC'],
          ['audit_count', 'ASC'],
        ],
        limit: 10,
      });

      if (auditors.length === 0) {
        const fallbackAuditors = await Auditor.findAll({
          where: { is_active: true },
          order: [
            ['reputation_score', 'DESC'],
            ['audit_count', 'ASC'],
          ],
          limit: 5,
        });
        
        return this.rankAuditors(fallbackAuditors, factory);
      }

      return this.rankAuditors(auditors, factory);
    } catch (error) {
      console.error('Auditor matching failed:', error);
      throw error;
    }
  }

  rankAuditors(auditors, factory) {
    return auditors.map(auditor => {
      const distanceScore = this.calculateDistanceScore(auditor, factory);
      const reputationScore = auditor.reputation_score;
      const availabilityScore = this.calculateAvailabilityScore(auditor);

      const totalScore = (
        distanceScore * 0.4 +
        (reputationScore / 10) * 0.4 +
        availabilityScore * 0.2
      );

      return {
        auditor,
        score: totalScore,
        breakdown: {
          distance: distanceScore,
          reputation: reputationScore / 10,
          availability: availabilityScore,
        },
      };
    }).sort((a, b) => b.score - a.score);
  }

  calculateDistanceScore(auditor, factory) {
    if (!factory.latitude || !factory.longitude || !auditor.latitude || !auditor.longitude) {
      return 50;
    }

    const distance = this.haversineDistance(
      factory.latitude,
      factory.longitude,
      auditor.latitude,
      auditor.longitude
    );

    if (distance <= 10) return 100;
    if (distance <= 25) return 80;
    if (distance <= 50) return 60;
    if (distance <= 100) return 40;
    return 20;
  }

  calculateAvailabilityScore(auditor) {
    const daysSinceLastAudit = auditor.last_audit_at
      ? (Date.now() - auditor.last_audit_at.getTime()) / (1000 * 60 * 60 * 24)
      : 30;

    if (daysSinceLastAudit > 14) return 100;
    if (daysSinceLastAudit > 7) return 80;
    if (daysSinceLastAudit > 3) return 60;
    return 40;
  }

  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = new MatchingService();
