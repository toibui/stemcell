import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // đường dẫn tới Prisma client
import {  StaffRole } from "@prisma/client"

import bcrypt from "bcryptjs"
// GET all staff
export async function GET() {
  try {
    const staffList = await prisma.staff.findMany({
      // Nếu muốn include các relation, thêm vào include ở đây
      // include: { someRelation: true }
    });
    return NextResponse.json(staffList);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST create new staff
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const {
      fullName,
      phone,
      email,
      password,
      role,
      isActive
    } = data

    // ===== 1️⃣ Validate cơ bản =====
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // ===== 2️⃣ Kiểm tra email đã tồn tại =====
    const existing = await prisma.staff.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // ===== 3️⃣ Hash password =====
    const hashedPassword = await bcrypt.hash(password, 10)

    // ===== 4️⃣ Tạo staff =====
    const newStaff = await prisma.staff.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword, // ✅ lưu password đã hash
        role: role as StaffRole,  // đảm bảo đúng enum
        isActive: isActive ?? true
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(newStaff, { status: 201 })

  } catch (err) {
    console.error("Create staff error:", err)
    return NextResponse.json(
      { error: "Failed to create staff" },
      { status: 500 }
    )
  }
}
