import { NextRequest, NextResponse } from 'next/server'

const userFoodLogs = new Map<string, any[]>()

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const sessionToken = req.nextUrl.searchParams.get('token')
    
    if (!userId || !sessionToken) {
      return NextResponse.json(
        { success: false, message: "Missing userId or session token" },
        { status: 400 }
      )
    }
    
    // In production, verify the session token against the database
    const logs = userFoodLogs.get(userId) || []
    
    return NextResponse.json({
      success: true,
      logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    })
    
  } catch (error) {
    console.error('Error retrieving food logs:', error)
    return NextResponse.json(
      { success: false, message: "Failed to retrieve food logs" },
      { status: 500 }
    )
  }
}

// POST - Add a new food log
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionToken, foodLog } = await req.json()
    
    if (!userId || !sessionToken || !foodLog) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // In production, verify the session token and userId
    
    const existingLogs = userFoodLogs.get(userId) || []
    const newLog = {
      ...foodLog,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    
    existingLogs.push(newLog)
    userFoodLogs.set(userId, existingLogs)
    
    return NextResponse.json({
      success: true,
      log: newLog
    })
    
  } catch (error) {
    console.error('Error saving food log:', error)
    return NextResponse.json(
      { success: false, message: "Failed to save food log" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a food log
export async function DELETE(req: NextRequest) {
  try {
    const { userId, sessionToken, logId } = await req.json()
    
    if (!userId || !sessionToken || !logId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const existingLogs = userFoodLogs.get(userId) || []
    const updatedLogs = existingLogs.filter(log => log.id !== logId)
    
    userFoodLogs.set(userId, updatedLogs)
    
    return NextResponse.json({
      success: true
    })
    
  } catch (error) {
    console.error('Error deleting food log:', error)
    return NextResponse.json(
      { success: false, message: "Failed to delete food log" },
      { status: 500 }
    )
  }
}
