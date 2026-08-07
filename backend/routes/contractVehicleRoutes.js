// backend/routes/contractVehicleRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listVehicles, createVehicle, deleteVehicle } from '../controllers/contractVehicleController.js';

const router = express.Router();
router.use(protect);

router.get('/',    listVehicles);
router.post('/',   createVehicle);
router.delete('/:id', deleteVehicle);

export default router;
