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

// 2. Create Equipment
app.post('/api/equipment', async (req, res) => {
  const { name, serialNumber, location, maintenanceTeamId } = req.body;
  try {
    // Logic: Find a technician in that team to assign as default
    const defaultTech = await prisma.user.findFirst({
      where: { teamId: parseInt(maintenanceTeamId) }
    });

    const newEquipment = await prisma.equipment.create({
      data: {
        name,
        serialNumber,
        location,
        purchaseDate: new Date(), // Default to now
        maintenanceTeamId: parseInt(maintenanceTeamId),
        ownerId: defaultTech ? defaultTech.id : null // Auto-assign tech logic
      }
    });
    res.json(newEquipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Get All Equipment (For the list view)
app.get('/api/equipment', async (req, res) => {
  const equipment = await prisma.equipment.findMany({
    include: { maintenanceTeam: true } // Join table to show team name
  });
  res.json(equipment);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ... previous code ...

// --- PHASE 2: KANBAN APIS ---

// 4. Create a Maintenance Request (UPDATED for Calendar)
app.post('/api/requests', async (req, res) => {
  // Added 'scheduledDate' to the destructured variables
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

// 5. Get All Requests (For the Kanban Board)
app.get('/api/requests', async (req, res) => {
  const requests = await prisma.maintenanceRequest.findMany({
    include: {
      equipment: true, // We need the machine name on the card
      assignedTo: true // We need the technician avatar
    }
  });
  res.json(requests);
});

// 6. Update Status (The Drag & Drop Logic)
app.patch('/api/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "IN_PROGRESS", "REPAIRED", "SCRAP"

  try {
    // 1. Update the request status
    const request = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // 2. SMART AUTOMATION: If moved to Scrap, kill the machine
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