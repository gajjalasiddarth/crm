const Deal = require('../models/Deal');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @route GET /api/reports/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const isRep = req.user.role === 'sales_rep';
    const matchUser = isRep ? { assignedTo: req.user._id } : {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalContacts, totalLeads, totalDeals,
      openDeals, wonDeals, lostDeals,
      monthRevenue, lastMonthRevenue,
      tasksDue, recentActivities,
      leadsByStatus, dealsByStage,
    ] = await Promise.all([
      Contact.countDocuments(matchUser),
      Lead.countDocuments(matchUser),
      Deal.countDocuments(matchUser),
      Deal.countDocuments({ ...matchUser, stage: { $nin: ['closed_won', 'closed_lost'] } }),
      Deal.countDocuments({ ...matchUser, stage: 'closed_won' }),
      Deal.countDocuments({ ...matchUser, stage: 'closed_lost' }),

      Deal.aggregate([
        { $match: { ...matchUser, stage: 'closed_won', actualCloseDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
      Deal.aggregate([
        { $match: { ...matchUser, stage: 'closed_won', actualCloseDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),

      Task.countDocuments({ ...matchUser, status: { $in: ['todo', 'in_progress'] }, dueDate: { $lte: now } }),
      Activity.find(isRep ? { performedBy: req.user._id } : {}).populate('performedBy', 'name avatar').sort('-createdAt').limit(10),

      Lead.aggregate([{ $match: matchUser }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Deal.aggregate([{ $match: matchUser }, { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } }]),
    ]);

    const thisMonthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalContacts, totalLeads, totalDeals, openDeals, wonDeals, lostDeals,
          monthRevenue: thisMonthRev, revenueGrowth: +revenueGrowth,
          tasksDue,
          winRate: totalDeals > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(1) : 0,
        },
        leadsByStatus,
        dealsByStage,
        recentActivities,
      },
    });
  } catch (err) { next(err); }
};

// @route GET /api/reports/revenue
exports.getRevenueReport = async (req, res, next) => {
  try {
    const { period = '6months' } = req.query;
    const months = period === '12months' ? 12 : period === '3months' ? 3 : 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const revenue = await Deal.aggregate([
      { $match: { stage: 'closed_won', actualCloseDate: { $gte: startDate } } },
      { $group: {
        _id: { year: { $year: '$actualCloseDate' }, month: { $month: '$actualCloseDate' } },
        revenue: { $sum: '$value' },
        count: { $sum: 1 },
        avgDeal: { $avg: '$value' },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const pipeline = await Deal.aggregate([
      { $match: { stage: { $nin: ['closed_won', 'closed_lost'] } } },
      { $group: { _id: '$stage', value: { $sum: '$value' }, count: { $sum: 1 } } },
    ]);

    res.json({ success: true, data: { revenue, pipeline } });
  } catch (err) { next(err); }
};

// @route GET /api/reports/team
exports.getTeamReport = async (req, res, next) => {
  try {
    const teamDeals = await Deal.aggregate([
      { $group: {
        _id: '$assignedTo',
        totalDeals: { $sum: 1 },
        wonDeals: { $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, 1, 0] } },
        lostDeals: { $sum: { $cond: [{ $eq: ['$stage', 'closed_lost'] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, '$value', 0] } },
        pipelineValue: { $sum: { $cond: [{ $not: [{ $in: ['$stage', ['closed_won', 'closed_lost']] }] }, '$value', 0] } },
      }},
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0 } },
      { $sort: { revenue: -1 } },
    ]);

    const teamLeads = await Lead.aggregate([
      { $group: { _id: '$assignedTo', totalLeads: { $sum: 1 }, convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } } } },
    ]);

    // Merge lead data into team deals
    const leadMap = {};
    teamLeads.forEach(l => { leadMap[l._id?.toString()] = l; });

    const mergedTeam = teamDeals.map(d => {
      const leads = leadMap[d._id?.toString()] || {};
      return {
        ...d,
        totalLeads: leads.totalLeads || 0,
        convertedLeads: leads.convertedLeads || 0,
      };
    });

    res.json({ success: true, data: { teamDeals: mergedTeam, teamLeads } });
  } catch (err) { next(err); }
};

// @route GET /api/reports/activities
exports.getActivityReport = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const byType = await Activity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byDay = await Activity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: { byType, byDay } });
  } catch (err) { next(err); }
};
