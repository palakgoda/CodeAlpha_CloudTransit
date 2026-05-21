const { db } = require('../config/database');
const { getKeys } = require('../config/keys');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Atomically books a bus pass by decrementing seats in a transaction and generating a JWT pass
 */
exports.bookPass = async (req, res, next) => {
  try {
    const { commuterName, routeId } = req.body;

    if (!commuterName || !routeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required body parameters: commuterName, routeId'
      });
    }

    const routeRef = db.collection('routes').doc(routeId);
    const ticketRef = db.collection('tickets').doc();
    const txnId = `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const bookedAt = new Date().toISOString();

    let ticketData = null;

    // Atomically check seats and deduct in a transaction
    await db.runTransaction(async (transaction) => {
      const routeDoc = await transaction.get(routeRef);

      if (!routeDoc.exists) {
        const err = new Error(`Route [${routeId}] does not exist.`);
        err.code = 'ROUTE_NOT_FOUND';
        throw err;
      }

      const routeData = routeDoc.data();
      
      if (routeData.routeStatus === 'CANCELLED') {
        const err = new Error(`Route [${routeId}] is cancelled.`);
        err.code = 'ROUTE_CANCELLED';
        throw err;
      }

      const availableSeats = routeData.availableSeats !== undefined ? Number(routeData.availableSeats) : 0;
      const dbFare = routeData.fare !== undefined ? Number(routeData.fare) : 0;

      if (availableSeats <= 0) {
        const err = new Error(`No available seats on route [${routeId}].`);
        err.code = 'SEAT_UNAVAILABLE';
        throw err;
      }

      // Decrement seats by 1
      transaction.update(routeRef, { availableSeats: availableSeats - 1 });

      // Build and queue the ticket document creation inside transaction
      ticketData = {
        ticketId: ticketRef.id,
        txnId,
        commuterName,
        routeId,
        fare: dbFare,
        bookedAt,
        status: 'ACTIVE'
      };

      transaction.set(ticketRef, ticketData);
    });

    // Sign the tamper-proof JWT payload using RS256 algorithm with our in-memory private key
    const { privateKey } = getKeys();
    const qrPayload = jwt.sign(
      {
        txnId: ticketData.txnId,
        ticketId: ticketData.ticketId,
        commuterName: ticketData.commuterName,
        routeId: ticketData.routeId,
        fare: ticketData.fare,
        bookedAt: ticketData.bookedAt
      },
      privateKey,
      { algorithm: 'RS256', expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Ticket pass booked successfully.',
      qrPayload
    });

  } catch (error) {
    console.error('Booking operation failed:', error.message || error);

    if (error.code === 'ROUTE_NOT_FOUND' || error.code === 'SEAT_UNAVAILABLE' || error.code === 'ROUTE_CANCELLED') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred while processing the booking.'
    });
  }
};

/**
 * Verifies the commuter ticket pass against the system public key
 */
exports.verifyPass = async (req, res, next) => {
  try {
    const { qrPayload } = req.body;

    if (!qrPayload) {
      return res.status(400).json({
        success: false,
        message: 'Missing qrPayload parameter in request body'
      });
    }

    const { publicKey } = getKeys();

    // Verify token using RS256 algorithm
    const decoded = jwt.verify(qrPayload, publicKey, { algorithms: ['RS256'] });

    return res.status(200).json({
      success: true,
      message: 'Ticket pass verified successfully.',
      ticket: decoded
    });

  } catch (error) {
    console.error('Ticket pass verification failure:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid, expired, or tampered ticket pass.',
      error: error.message
    });
  }
};

/**
 * Updates the route status (OPERATIONAL, DELAYED, CANCELLED)
 */
exports.updateRouteStatus = async (req, res, next) => {
  try {
    const { routeId, routeStatus, statusMessage } = req.body;
    
    if (!routeId || !routeStatus) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: routeId, routeStatus'
      });
    }

    const routeRef = db.collection('routes').doc(routeId);
    
    await routeRef.update({ 
      routeStatus, 
      statusMessage: statusMessage || '' 
    });

    return res.status(200).json({
      success: true,
      message: 'Route status updated successfully.'
    });

  } catch (error) {
    console.error('Update route status failed:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred while updating the route status.'
    });
  }
};

