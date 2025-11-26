import express from "express";
import { prisma } from "../lib/prisma.js";
import { todayLocalRange } from "../helpers/date.js";
import { toLocalDayRange } from "../helpers/date.js";

const router = express.Router();

/* ------------------------------------------
  ADD EXPENSE ITEM
--------------------------------------------*/

router.post("/add", async (req, res) => {
  try {
    const { name, price, notes } = req.body;

    if (!name || price <= 0)
      return res.status(400).json({ success: false, message: "Invalid data" });

    // Only today's group
    const { start, end } = todayLocalRange();

    let group = await prisma.expenseGroup.findFirst({
      where: { date: { gte: start, lt: end } },
    });

    if (!group) {
      group = await prisma.expenseGroup.create({
        data: { date: start },
      });
    }

    const item = await prisma.expenseItem.create({
      data: {
        groupId: group.id,
        name,
        price: Number(price),
        notes: notes || "",
      },
    });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ------------------------------------------
  GET EXPENSES BY SPECIFIC DATE
--------------------------------------------*/

router.get("/by-date", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date)
      return res.status(400).json({ success: false, message: "Date required" });

    const { start, end } = toLocalDayRange(date);

    const group = await prisma.expenseGroup.findFirst({
      where: { date: { gte: start, lt: end } },
      include: { items: true },
    });

    res.json({ success: true, data: group || { date: start, items: [] } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/* ------------------------------------------
  LAST 30 DAYS EXPENSE SUMMARY
--------------------------------------------*/
router.get("/last-30-days", async (req, res) => {
  try {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 30);

    const groups = await prisma.expenseGroup.findMany({
      where: { date: { gte: start, lt: end } },
      include: { items: true },
      orderBy: { date: "desc" },
    });

    const total = groups.reduce(
      (sum, g) => sum + g.items.reduce((a, i) => a + i.price, 0),
      0
    );

    res.json({ success: true, data: groups, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ------------------------------------------
  TOTAL EXPENSES (LIFETIME)
--------------------------------------------*/
router.get("/total", async (req, res) => {
  try {
    const groups = await prisma.expenseGroup.findMany({
      include: { items: true },
    });

    const total = groups.reduce(
      (sum, g) => sum + g.items.reduce((a, i) => a + i.price, 0),
      0
    );

    res.json({ success: true, total });
  } catch (error) {
    console.error("TOTAL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ------------------------------------------
  DELETE ITEM
--------------------------------------------*/
router.delete("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the parent groupId before deleting
    const item = await prisma.expenseItem.findUnique({
      where: { id },
      select: { groupId: true },
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const groupId = item.groupId;

    // Delete the expense item
    await prisma.expenseItem.delete({
      where: { id },
    });

    // Check if group now has 0 items
    const remainingCount = await prisma.expenseItem.count({
      where: { groupId },
    });

    let groupDeleted = false;

    if (remainingCount === 0) {
      // Delete the group
      await prisma.expenseGroup.delete({
        where: { id: groupId },
      });
      groupDeleted = true;
    }

    res.json({
      success: true,
      message: "Item deleted",
      groupDeleted,
      groupId,
    });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE entire expense group
router.delete("/group/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check group exists
    const group = await prisma.expenseGroup.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Expense group not found",
      });
    }

    // Delete the group (items deleted automatically via cascade)
    await prisma.expenseGroup.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Expense group deleted successfully",
      deletedGroupId: id,
    });
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting expense group",
    });
  }
});

export default router;
