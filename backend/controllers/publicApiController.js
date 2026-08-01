// backend/controllers/publicApiController.js
// Handlers behind /api/v1/* — the external, API-key-authenticated surface.
// req.apiUser / req.apiPlan are set by middleware/apiKeyAuth.js.
import UserOpportunity from '../models/UserOpportunity.js';

const MAX_PAGE_SIZE = 50;

// GET /api/v1/opportunities?page=1&limit=25
export const listOpportunities = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit) || 25));
    const skip  = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      UserOpportunity.find({ user: req.apiUser._id })
        .populate('opportunity')
        .sort({ matchScore: -1, fetchedAt: -1 })
        .skip(skip)
        .limit(limit),
      UserOpportunity.countDocuments({ user: req.apiUser._id }),
    ]);

    const data = rows
      .filter(r => r.opportunity) // guard against a deleted/orphaned Opportunity doc
      .map(r => ({
        id:             r.opportunity._id,
        title:          r.opportunity.title,
        agency:         r.opportunity.agency,
        naicsCode:      r.opportunity.naicsCode,
        pscCode:        r.opportunity.pscCode,
        setAside:       r.opportunity.setAside,
        estimatedValue: r.opportunity.estimatedValue,
        dueDate:        r.opportunity.dueDate,
        postedDate:     r.opportunity.postedDate,
        solicitationNumber: r.opportunity.sourceId,
        resourceLinks:  r.opportunity.resourceLinks || [],
        pointOfContacts: r.opportunity.pointOfContacts || [],
        matchScore:     r.matchScore,
        matchReasons:   r.matchReasons,
      }));

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/opportunities/:id
export const getOpportunity = async (req, res) => {
  try {
    const row = await UserOpportunity.findOne({
      user: req.apiUser._id,
      opportunity: req.params.id,
    }).populate('opportunity');

    if (!row || !row.opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found in your matched feed.' });
    }

    const o = row.opportunity;
    res.json({
      success: true,
      data: {
        id:             o._id,
        title:          o.title,
        agency:         o.agency,
        naicsCode:      o.naicsCode,
        naicsDescription: o.naicsDescription,
        pscCode:        o.pscCode,
        pscDescription: o.pscDescription,
        setAside:       o.setAside,
        estimatedValue: o.estimatedValue,
        dueDate:        o.dueDate,
        postedDate:     o.postedDate,
        description:    o.description,
        solicitationNumber: o.sourceId,
        resourceLinks:  o.resourceLinks || [],
        pointOfContacts: o.pointOfContacts || [],
        matchScore:     row.matchScore,
        matchReasons:   row.matchReasons,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
