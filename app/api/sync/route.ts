import { NextRequest, NextResponse } from 'next/server'
import LZString from 'lz-string'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Parse compressed payload
    const formData = await req.formData()
    const compressedData = formData.get('data') as string
    
    if (!compressedData) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    // Decompress payload
    const decompressedStr = LZString.decompressFromEncodedURIComponent(compressedData)
    if (!decompressedStr) {
      return NextResponse.json({ error: 'Failed to decompress data' }, { status: 400 })
    }

    const operations = JSON.parse(decompressedStr)
    
    if (!Array.isArray(operations)) {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 })
    }

    console.log(`[SYNC] Received ${operations.length} operations from user ${userId}`)

    // Process each operation in the batch
    // In a real application, you'd want to wrap this in a database transaction
    // and use the conflict-resolution.ts helpers to merge state safely.
    for (const op of operations) {
      console.log(`[SYNC] Processing ${op.action}`, op.payload)
      // Example switch case for real world:
      // switch(op.action) {
      //   case 'UPDATE_OFFLINE_STORE': 
      //     await processTodoSync(op.payload); break;
      //   case 'CREATE_TRANSACTION':
      //     await createTransaction(...op.payload); break;
      // }
    }

    return NextResponse.json({ success: true, processed: operations.length })
  } catch (error) {
    console.error('[SYNC API Error]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
