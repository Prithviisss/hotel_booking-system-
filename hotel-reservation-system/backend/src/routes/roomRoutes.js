const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRoomTypes,
  createRoomType,
  updateRoomType,
  checkAvailability
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// Public availability check
router.post('/availability', checkAvailability);

// Room Types routes
router.get('/types/all', getAllRoomTypes);
router.post('/types', protect, authorize('ADMIN'), createRoomType);
router.put('/types/:id', protect, authorize('ADMIN'), updateRoomType);

// General Room CRUD routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', protect, authorize('ADMIN'), createRoom);
router.put('/:id', protect, authorize('ADMIN'), updateRoom);
router.delete('/:id', protect, authorize('ADMIN'), deleteRoom);

module.exports = router;

