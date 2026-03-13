const { db } = require("../config/database");

// Get dashboard summary
exports.getDashboardSummary = (req, res) => {
  try {
    // Total Sales (from completed/confirmed bookings)
    const bookingsData = db
      .prepare(`
        SELECT 
          COUNT(*) as total_bookings,
          SUM(total_amount) as total_revenue,
          SUM(advance_paid) as total_advance
        FROM bookings
        WHERE status IN ('Confirmed', 'Completed')
      `)
      .get();

    // Total Expenses
    const expensesData = db
      .prepare("SELECT SUM(price) as total_expenses FROM expenses")
      .get();

    // Profit = Revenue - Expenses
    const totalRevenue = bookingsData?.total_revenue || 0;
    const totalExpenses = expensesData?.total_expenses || 0;
    const profit = totalRevenue - totalExpenses;

    // Pending bookings count
    const pendingBookings = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'Pending'")
      .get();

    // Total customers
    const customersCount = db
      .prepare("SELECT COUNT(*) as count FROM customers")
      .get();

    // Inventory value
    const inventoryData = db
      .prepare(`
        SELECT SUM(quantity * selling_price) as total_value FROM photo_frames
      `)
      .get();

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        profit: profit,
        profit_margin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) + "%" : "0%",
      },
      bookings: {
        total: bookingsData?.total_bookings || 0,
        advance_collected: bookingsData?.total_advance || 0,
        pending: pendingBookings?.count || 0,
      },
      customers: {
        total: customersCount?.count || 0,
      },
      inventory: {
        total_value: inventoryData?.total_value || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get monthly revenue vs expenses chart data
exports.getMonthlyRevenuExpenses = (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    // Monthly revenue
    const monthlyRevenue = db
      .prepare(`
        SELECT 
          CAST(strftime('%m', booking_date) as INTEGER) as month,
          strftime('%B', booking_date) as month_name,
          SUM(total_amount) as revenue
        FROM bookings
        WHERE strftime('%Y', booking_date) = ?
        AND status IN ('Confirmed', 'Completed')
        GROUP BY CAST(strftime('%m', booking_date) as INTEGER)
        ORDER BY month ASC
      `)
      .all(String(currentYear));

    // Monthly expenses
    const monthlyExpenses = db
      .prepare(`
        SELECT 
          CAST(strftime('%m', expense_date) as INTEGER) as month,
          strftime('%B', expense_date) as month_name,
          SUM(price) as expenses
        FROM expenses
        WHERE strftime('%Y', expense_date) = ?
        GROUP BY CAST(strftime('%m', expense_date) as INTEGER)
        ORDER BY month ASC
      `)
      .all(String(currentYear));

    // Merge data
    const chartData = [];
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(currentYear, month - 1).toLocaleString("default", {
        month: "long",
      });
      const revenue =
        monthlyRevenue.find((r) => r.month === month)?.revenue || 0;
      const expenses =
        monthlyExpenses.find((e) => e.month === month)?.expenses || 0;

      chartData.push({
        month: monthName,
        month_number: month,
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    res.json({
      year: currentYear,
      data: chartData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get service category revenue
exports.getServiceCategoryRevenue = (req, res) => {
  try {
    // Note: Since bookings don't have service details, this will be calculated from service_name if available
    // Or you can extend this to include services in bookings
    const serviceRevenue = db
      .prepare(`
        SELECT 
          sc.category_name,
          COUNT(s.id) as service_count,
          AVG(s.price) as average_price,
          MAX(s.price) as max_price
        FROM service_categories sc
        LEFT JOIN services s ON sc.id = s.category_id
        GROUP BY sc.id
      `)
      .all();

    res.json(serviceRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get frame sales overview
exports.getFrameSalesOverview = (req, res) => {
  try {
    const frames = db
      .prepare(`
        SELECT 
          id,
          frame_name,
          quantity as current_stock,
          selling_price,
          buying_price,
          (quantity * selling_price) as stock_value,
          ROUND((selling_price - buying_price) / buying_price * 100, 2) as profit_margin
        FROM photo_frames
        ORDER BY stock_value DESC
      `)
      .all();

    const totalStockValue = frames.reduce((sum, f) => sum + (f.stock_value || 0), 0);

    res.json({
      frames,
      total_stock_value: totalStockValue,
      total_frames_type: frames.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending tasks/bookings
exports.getPendingTasks = (req, res) => {
  try {
    // Pending bookings
    const pendingBookings = db
      .prepare(`
        SELECT 
          b.id,
          b.event_date,
          b.event_time,
          b.total_amount,
          b.advance_paid,
          c.customer_name,
          c.mobile_number,
          u.full_name as staff_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.status = 'Pending'
        ORDER BY b.event_date ASC
      `)
      .all();

    // Low stock frames
    const lowStockFrames = db
      .prepare(`
        SELECT 
          id,
          frame_name,
          quantity,
          (quantity * selling_price) as stock_value
        FROM photo_frames
        WHERE quantity <= 5
        ORDER BY quantity ASC
      `)
      .all();

    res.json({
      pending_bookings: pendingBookings,
      pending_booking_count: pendingBookings.length,
      low_stock_frames: lowStockFrames,
      low_stock_count: lowStockFrames.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer statistics
exports.getCustomerStatistics = (req, res) => {
  try {
    // Total customers
    const totalCustomers = db
      .prepare("SELECT COUNT(*) as count FROM customers")
      .get();

    // Customers with bookings
    const activeCustomers = db
      .prepare(`
        SELECT COUNT(DISTINCT customer_id) as count FROM bookings
      `)
      .get();

    // Top customers by booking count
    const topCustomers = db
      .prepare(`
        SELECT 
          c.id,
          c.customer_name,
          COUNT(b.id) as booking_count,
          SUM(b.total_amount) as total_spent
        FROM customers c
        LEFT JOIN bookings b ON c.id = b.customer_id
        GROUP BY c.id
        ORDER BY total_spent DESC
        LIMIT 10
      `)
      .all();

    res.json({
      total_customers: totalCustomers?.count || 0,
      active_customers: activeCustomers?.count || 0,
      new_customers_this_month: db
        .prepare(`
          SELECT COUNT(DISTINCT customer_id) as count 
          FROM bookings 
          WHERE strftime('%m', booking_date) = strftime('%m', 'now')
          AND strftime('%Y', booking_date) = strftime('%Y', 'now')
        `)
        .get()?.count || 0,
      top_customers: topCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get booking status distribution
exports.getBookingStatusDistribution = (req, res) => {
  try {
    const distribution = db
      .prepare(`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(total_amount) as total_amount,
          SUM(advance_paid) as total_advance
        FROM bookings
        GROUP BY status
      `)
      .all();

    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
