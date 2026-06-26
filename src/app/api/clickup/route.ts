import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.CLICKUP_API_KEY
  const listIdsRaw = process.env.CLICKUP_LIST_IDS

  if (!apiKey || !listIdsRaw) {
    return NextResponse.json(
      { error: 'Server belum dikonfigurasi. Tambahkan CLICKUP_API_KEY dan CLICKUP_LIST_IDS di environment variables.' },
      { status: 500 }
    )
  }

  const listIds = listIdsRaw.split(',').map(id => id.trim()).filter(Boolean)

  try {
    const allTasks = await Promise.all(
      listIds.map(async (listId) => {
        const [tasksRes, listRes] = await Promise.all([
          fetch(`https://api.clickup.com/api/v2/list/${listId}/task?subtasks=true&include_closed=true`, {
            headers: { Authorization: apiKey },
          }),
          fetch(`https://api.clickup.com/api/v2/list/${listId}`, {
            headers: { Authorization: apiKey },
          }),
        ])

        if (!tasksRes.ok) {
          const err = await tasksRes.json()
          throw new Error(err.err || `Gagal mengambil tasks dari list ${listId}`)
        }

        const tasksData = await tasksRes.json()
        const listData = listRes.ok ? await listRes.json() : {}

        return {
          listId,
          listName: listData.name || `List ${listId}`,
          tasks: tasksData.tasks || [],
        }
      })
    )

    return NextResponse.json({ lists: allTasks, updatedAt: new Date().toISOString() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
