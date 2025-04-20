const Tender = require('../models/Tender');
const Request = require('../models/TenderRequest');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const TenderRequest = require('../models/TenderRequest');
const User = require('../models/User');
const Order = require('../models/OrderModel');

// Create a new tender
exports.createTender = catchAsync(async (req, res, next) => {
  const {
    title,
    location,
    category,
    referenceNo,
    startingDate,
    closingDate,
    details,
    requestId
  } = req.body;

  // Check if request exists
  const request = await Request.findById(requestId);
  if (!request) {
    return next(new AppError('No request found with that ID', 404));
  }

  // Create tender
  const newTender = await Tender.create({
    title,
    location,
    category,
    referenceNo,
    startingDate,
    closingDate,
    details,
    requestId,
    createdBy: req.body.procurementUserID
  });

  res.status(201).json({
    status: 'success',
    data: {
      tender: newTender
    }
  });
});

exports.getAllTenders = catchAsync(async (req, res, next) => {  
  try {
    const tenders = await Tender.find()
      .populate('requestId')  // Populate full TenderRequest data
      .populate('createdBy'); // Populate full User data

    console.log('Fetched tenders:', tenders); // Debug log

    res.status(200).json({
      status: 'success',
      results: tenders.length,
      data: { tenders },
    });
  } catch (error) {
    next(error); // Pass errors to error-handling middleware
  }
});




// Get tender by ID
exports.getTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findById(req.params.id)
    .populate('requestId')
    .populate('createdBy', 'fullName email');

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tender
    }
  });
});

// Update tender
exports.updateTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tender
    }
  });
});

// Delete tender
exports.deleteTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findByIdAndDelete(req.params.id);

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get tender count
exports.getTenderCount = catchAsync(async (req, res, next) => {
  const count = await Tender.countDocuments();
  
  res.status(200).json({
    status: 'success',
    data: {
      count
    }
  });
});

// Get tenders by status
exports.getTendersByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;
  const tenders = await Tender.find({ status })
    .populate('requestId')
    .populate('createdBy', 'fullName email');

  res.status(200).json({
    status: 'success',
    results: tenders.length,
    data: {
      tenders
    }
  });
});

// Get all tenders with their order details
exports.getAllTendersWithOrders = catchAsync(async (req, res, next) => {
  try {
    // First get all tenders with populated request and creator info
    const tenders = await Tender.find()
      .populate('requestId')
      .populate('createdBy');
    
    // Get all orders grouped by tenderId
    const orders = await Order.aggregate([
      {
        $group: {
          _id: '$tenderId',
          orders: { $push: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'orders.userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      }
    ]);

    // Create a map of tenderId to orders for quick lookup
    const ordersMap = new Map();
    orders.forEach(item => {
      ordersMap.set(item._id.toString(), {
        orders: item.orders,
        userDetails: item.userDetails
      });
    });

    // Combine tenders with their orders
    const tendersWithOrders = tenders.map(tender => {
      const tenderObj = tender.toObject();
      const orderInfo = ordersMap.get(tender._id.toString()) || { orders: [], userDetails: [] };
      
      return {
        ...tenderObj,
        orders: orderInfo.orders.map(order => {
          const user = orderInfo.userDetails.find(u => u._id.toString() === order.userId.toString());
          return {
            ...order,
            userDetails: user || null
          };
        }),
        orderCount: orderInfo.orders.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: tendersWithOrders.length,
      data: { tenders: tendersWithOrders },
    });
  } catch (error) {
    next(error);
  }
});