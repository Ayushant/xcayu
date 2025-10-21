import express from 'express';
import { getPublicSimulations, getSimulationCredentials } from '../controllers/simulationController.js';

const router = express.Router();

/**
 * Public Simulation Routes
 * These routes don't require authentication and are used by the public-facing simulation selection page
 */

// Get all active simulations for public display
router.get('/public', getPublicSimulations);

// Get simulation details with login credentials
router.get('/credentials/:id', getSimulationCredentials);

export default router;
