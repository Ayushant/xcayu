import Simulation from '../models/simulationModel.js';
import { io } from '../Server.js';

/**
 * Public endpoint to get all active simulations
 * No authentication required - for public simulation selection page
 */
export const getPublicSimulations = async (req, res) => {
  try {
    const simulations = await Simulation.find({ 
      isActive: true,
      isTemplate: true,
      status: 'Active'
    })
      .populate('course', 'courseName courseCode')
      .select('-answers -userId -createdBy -__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        simulations
      }
    });
  } catch (error) {
    console.error('Error fetching public simulations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching simulations',
      error: error.message
    });
  }
};

/**
 * Get simulation details with credentials (for opening a simulation)
 * No authentication required - provides login credentials
 */
export const getSimulationCredentials = async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await Simulation.findById(id)
      .populate('course', 'courseName courseCode')
      .select('simulationName degree college course description instructions studentCredentials adminCredentials isActive status');

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found'
      });
    }

    if (!simulation.isActive || simulation.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'This simulation is not currently active'
      });
    }

    res.json({
      success: true,
      data: {
        simulation: {
          id: simulation._id,
          name: simulation.simulationName,
          degree: simulation.degree,
          college: simulation.college,
          course: simulation.course,
          description: simulation.description,
          instructions: simulation.instructions,
          studentLogin: simulation.studentCredentials,
          adminLogin: simulation.adminCredentials
        }
      }
    });
  } catch (error) {
    console.error('Error fetching simulation credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching simulation details',
      error: error.message
    });
  }
};

/**
 * Generate unique credentials for a simulation
 */
export const generateCredentials = (simulationName, degree, type = 'student') => {
  // Create a slug from the simulation name
  const slug = simulationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 20);

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  const email = type === 'student' 
    ? `student-${slug}-${randomSuffix}@sim.edu`
    : `admin-${slug}-${randomSuffix}@sim.edu`;
  
  const password = `${degree}${randomSuffix}`;

  return { email, password };
};

export default {
  getPublicSimulations,
  getSimulationCredentials,
  generateCredentials
};
