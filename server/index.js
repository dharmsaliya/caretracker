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