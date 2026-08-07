// backend/controllers/contractVehicleController.js
import ContractVehicle from '../models/ContractVehicle.js';
import UserCertification from '../models/UserCertification.js';

// Compares a vehicle's stated eligibility requirements against the real,
// current user profile. Returns true/false only when there's something
// concrete to compare against — null means "not enough info entered on
// this vehicle to judge," which is more honest than a false negative.
async function attachEligibility(vehicles, user) {
  const hasNaicsReq = vehicles.some(v => v.eligibleNaicsCodes?.length);
  const hasSetAsideReq = vehicles.some(v => v.eligibleSetAsides?.length);
  let activeCertTypes = [];
  if (hasSetAsideReq) {
    const certs = await UserCertification.find({ user: user._id, expiryDate: { $gt: new Date() } }).select('type');
    activeCertTypes = certs.map(c => c.type);
  }
  const userNaics = new Set(user.naicsCodes || []);

  return vehicles.map(v => {
    const obj = v.toObject ? v.toObject() : v;
    const naicsReq = obj.eligibleNaicsCodes || [];
    const setAsideReq = obj.eligibleSetAsides || [];
    if (naicsReq.length === 0 && setAsideReq.length === 0) {
      return { ...obj, eligible: null };
    }
    const naicsOk = naicsReq.length === 0 || naicsReq.some(n => userNaics.has(n));
    const setAsideOk = setAsideReq.length === 0 || setAsideReq.some(s => activeCertTypes.includes(s));
    return { ...obj, eligible: naicsOk && setAsideOk };
  });
}

// GET /api/contract-vehicles
export const listVehicles = async (req, res) => {
  try {
    const vehicles = await ContractVehicle.find({ user: req.user._id }).sort({ createdAt: -1 });
    const withEligibility = await attachEligibility(vehicles, req.user);
    res.json({ success: true, data: withEligibility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/contract-vehicles
export const createVehicle = async (req, res) => {
  try {
    const { name, acronym, agency, type, onRampStatus, ceilingValue, eligibleNaicsCodes, eligibleSetAsides, expiryDate, notes } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle name is required.' });
    }
    const vehicle = await ContractVehicle.create({
      user: req.user._id,
      name: name.trim(),
      acronym: acronym || '',
      agency: agency || '',
      type: type || 'Other',
      onRampStatus: onRampStatus || 'unknown',
      ceilingValue: ceilingValue || null,
      eligibleNaicsCodes: eligibleNaicsCodes || [],
      eligibleSetAsides: eligibleSetAsides || [],
      expiryDate: expiryDate || null,
      notes: notes || '',
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/contract-vehicles/:id
export const deleteVehicle = async (req, res) => {
  try {
    await ContractVehicle.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
