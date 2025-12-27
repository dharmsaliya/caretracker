// server/index.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// --- ROUTES ---

// 1. Get all Teams (For the dropdown menu)
app.get('/api/teams', async (req, res) => {
  const teams = await prisma.team.findMany();
  res.json(teams);
});

// 2. Create New Equipment (UPDATED)
app.post('/api/equipment', async (req, res) => {
  // Now accepting all required fields
  const { 
    name, 
    serialNumber, 
    location, 
    maintenanceTeamId, 
    department, 
    purchaseDate, 
    warrantyEnd 
  } = req.body;

  try {
    const newEquipment = await prisma.equipment.create({
      data: {
        name,
        serialNumber,
        location,
        department, // Now saving department
        // Parse dates correctly
        purchaseDate: new Date(purchaseDate), 
        warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
        status: 'OPERATIONAL',
        maintenanceTeamId: parseInt(maintenanceTeamId)
      }
    });
    res.json(newEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(400).json({ error: error.message });
  }
});

// 3. Get All Equipment (With Smart Counts)
app.get('/api/equipment', async (req, res) => {
  const equipment = await prisma.equipment.findMany({
    include: { 
      maintenanceTeam: true,
      // This adds a 'requestCount' field automatically!
      _count: {
        select: { requests: true }
      }
    }
  });
  res.json(equipment);
});

// 4. Create a Maintenance Request
app.post('/api/requests', async (req, res) => {
  const { title, description, type, priority, equipmentId, scheduledDate } = req.body;

  try {
    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        type,      // "CORRECTIVE" or "PREVENTIVE"
        priority,  
        status: "NEW", 
        equipmentId: parseInt(equipmentId),
        // Convert string date to Date object if it exists
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null
      }
    });
    res.json(newRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Get All Requests (Updated for Team Filtering)
app.get('/api/requests', async (req, res) => {
  const { teamId } = req.query; // Get teamId from URL query params

  const whereClause = teamId 
    ? { equipment: { maintenanceTeamId: parseInt(teamId) } } 
    : {};

  const requests = await prisma.maintenanceRequest.findMany({
    where: whereClause,
    include: {
      equipment: true, 
      assignedTo: true 
    }
  });
  res.json(requests);
});

// 6. Update Status (UPDATED)
app.patch('/api/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, duration } = req.body; // Now accepting duration

  try {
    const updateData = { status };

    // Only update duration if it's provided (e.g., when moving to REPAIRED)
    if (duration !== undefined) {
      updateData.duration = parseInt(duration);
    }

    // 1. Update the request
    const request = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // 2. SCRAP Logic
    if (status === 'SCRAP') {
      await prisma.equipment.update({
        where: { id: request.equipmentId },
        data: { status: 'UNUSABLE' }
      });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 7. Get History for Specific Equipment (When button is clicked)
app.get('/api/equipment/:id/requests', async (req, res) => {
  const { id } = req.params;
  const requests = await prisma.maintenanceRequest.findMany({
    where: { equipmentId: parseInt(id) },
    orderBy: { createdAt: 'desc' }
  });
  res.json(requests);
});

// 8. Get Dashboard Stats (Bonus Feature)
app.get('/api/stats', async (req, res) => {
  try {
    // Fetch all requests with their team info
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        equipment: {
          include: { maintenanceTeam: true }
        }
      }
    });

    // Calculate counts manually
    const stats = {};
    requests.forEach(req => {
      const teamName = req.equipment?.maintenanceTeam?.name || "Unassigned";
      stats[teamName] = (stats[teamName] || 0) + 1;
    });

    // Convert to array for the Chart: [{ name: 'Mechanics', value: 5 }]
    const chartData = Object.keys(stats).map(key => ({
      name: key,
      value: stats[key]
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Assign Ticket to User (NEW FEATURE)
app.patch('/api/requests/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const request = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: { 
        assignedToId: parseInt(userId),
        status: 'IN_PROGRESS' // Auto-move to In Progress when picked up (Optional but good UX)
      },
      include: { assignedTo: true } // Return updated user info
    });
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});