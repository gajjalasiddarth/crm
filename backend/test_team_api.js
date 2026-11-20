const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Deal = require('./models/Deal');
const Lead = require('./models/Lead');

async function testTeamReport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const admin = await User.findOne({ email: 'addagatlarajaneesh@gmail.com' });
    if (!admin) {
      console.log('Admin user not found!');
      process.exit(1);
    }
    console.log(`\nLogged in as: ${admin.name} (role: ${admin.role})`);

    // Check existing deals
    const allDeals = await Deal.find({}).populate('assignedTo', 'name email role');
    console.log(`\n--- Total Deals in DB: ${allDeals.length} ---`);
    allDeals.forEach(d => {
      console.log(`  Deal: "${d.title}" | Stage: ${d.stage} | Value: $${d.value} | Assigned: ${d.assignedTo?.name || 'none'}`);
    });

    // Check existing leads
    const allLeads = await Lead.find({}).populate('assignedTo', 'name email role');
    console.log(`\n--- Total Leads in DB: ${allLeads.length} ---`);
    allLeads.forEach(l => {
      console.log(`  Lead: "${l.title}" | Status: ${l.status} | Assigned: ${l.assignedTo?.name || 'none'}`);
    });

    // Now run the EXACT same aggregation that was failing before the fix
    console.log('\n--- Running Team Deals Aggregation (the one that was broken) ---');
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

      console.log('SUCCESS! Aggregation returned:');
      teamDeals.forEach(td => {
        console.log(`  ${td.user?.name}: ${td.totalDeals} deals, $${td.revenue} revenue, $${td.pipelineValue} pipeline, ${td.wonDeals} won, ${td.lostDeals} lost`);
      });

      // Also test the OLD broken query to confirm it fails
      console.log('\n--- Running OLD broken aggregation (with $nin) to confirm it crashes ---');
      try {
        await Deal.aggregate([
          { $group: {
            _id: '$assignedTo',
            pipelineValue: { $sum: { $cond: [{ $nin: ['$stage', ['closed_won', 'closed_lost']] }, '$value', 0] } },
          }},
        ]);
        console.log('OLD query also worked (MongoDB may have accepted $nin in expressions in this version)');
      } catch (oldErr) {
        console.log(`OLD query FAILED as expected: ${oldErr.message}`);
      }

    } catch (err) {
      console.log(`AGGREGATION FAILED: ${err.message}`);
    }

    // Test the full API endpoint via HTTP
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const http = require('http');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/reports/team',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };

    console.log('\n--- Testing /api/reports/team endpoint ---');
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        const parsed = JSON.parse(data);
        console.log(`Success: ${parsed.success}`);
        if (parsed.data?.teamDeals) {
          console.log(`Team members found: ${parsed.data.teamDeals.length}`);
          parsed.data.teamDeals.forEach(td => {
            console.log(`  ${td.user?.name}: deals=${td.totalDeals}, won=${td.wonDeals}, revenue=$${td.revenue}, pipeline=$${td.pipelineValue}, leads=${td.totalLeads}, convertedLeads=${td.convertedLeads}`);
          });
        } else {
          console.log('Response:', JSON.stringify(parsed, null, 2));
        }
        mongoose.disconnect();
        process.exit(0);
      });
    });
    req.on('error', (err) => {
      console.log(`HTTP Error: ${err.message}`);
      mongoose.disconnect();
      process.exit(1);
    });
    req.end();

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testTeamReport();
