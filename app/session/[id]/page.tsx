'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Session {
  id: number
  host: string
  date: string
  time: string
  total_spots: number
  created_at: string
}

interface Player {
  id: number
  session_id: number
  name: string
  created_at: string
}

interface UnavailablePlayer {
  id: number
  session_id: number
  name: string
  created_at: string
}

interface SessionWithPlayers extends Session {
  players: Player[]
  unavailable_players: UnavailablePlayer[]
}

export default function SessionPage() {
  const params = useParams()
  const sessionId = params?.id as string
  
  const [session, setSession] = useState<SessionWithPlayers | null>(null)
  const [loading, setLoading] = useState(true)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    if (sessionId) {
      fetchSession()
      
      // Subscribe to real-time updates
      const playersChannel = supabase
        .channel(`players-channel-${sessionId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
          fetchSession()
        })
        .subscribe()

      const unavailableChannel = supabase
        .channel(`unavailable-players-channel-${sessionId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'unavailable_players' }, () => {
          fetchSession()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(playersChannel)
        supabase.removeChannel(unavailableChannel)
      }
    }
  }, [sessionId])

  async function fetchSession() {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) {
        console.error('Error fetching session:', sessionError)
        setSession(null)
        setLoading(false)
        return
      }

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (playersError) {
        console.error('Error fetching players:', playersError)
      }

      const { data: unavailableData, error: unavailableError } = await supabase
        .from('unavailable_players')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (unavailableError) {
        console.error('Error fetching unavailable players:', unavailableError)
      }

      setSession({
        ...sessionData,
        players: playersData || [],
        unavailable_players: unavailableData || []
      })
    } catch (error) {
      console.error('Error:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    
    const form = e.target as HTMLFormElement
    const statusInput = form.querySelector('input[name="status"]') as HTMLInputElement
    const status = statusInput?.value
    
    if (!playerName.trim()) return
    if (!session) return

    if (status === 'in') {
      await addPlayer()
    } else if (status === 'out') {
      await addUnavailable()
    }
  }

  async function addPlayer() {
    if (!session) return

    if (session.players.length >= session.total_spots) {
      alert('Session is full!')
      return
    }

    if (session.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      alert('You are already signed up as available!')
      return
    }

    const unavailablePlayer = session.unavailable_players.find(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    )
    if (unavailablePlayer) {
      await supabase.from('unavailable_players').delete().eq('id', unavailablePlayer.id)
    }

    const { error } = await supabase
      .from('players')
      .insert([
        {
          session_id: session.id,
          name: playerName,
        },
      ])

    if (error) {
      console.error('Error adding player:', error)
      alert('Error adding player')
    } else {
      setPlayerName('')
      fetchSession()
      alert(`✓ ${playerName} - You're in!`)
    }
  }

  async function addUnavailable() {
    if (!session) return

    if (session.unavailable_players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      alert('You are already marked as unavailable!')
      return
    }

    const availablePlayer = session.players.find(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    )
    if (availablePlayer) {
      await supabase.from('players').delete().eq('id', availablePlayer.id)
    }

    const { error } = await supabase
      .from('unavailable_players')
      .insert([
        {
          session_id: session.id,
          name: playerName,
        },
      ])

    if (error) {
      console.error('Error adding unavailable player:', error)
      alert('Error marking as unavailable')
    } else {
      setPlayerName('')
      fetchSession()
      alert(`✓ ${playerName} - Marked as unavailable`)
    }
  }

  async function removePlayer(playerId: number) {
    if (confirm('Remove this player from the session?')) {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)

      if (error) {
        console.error('Error removing player:', error)
        alert('Error removing player')
      }
    }
  }

  async function removeUnavailable(playerId: number) {
    if (confirm('Remove this unavailable status?')) {
      const { error } = await supabase
        .from('unavailable_players')
        .delete()
        .eq('id', playerId)

      if (error) {
        console.error('Error removing unavailable player:', error)
        alert('Error removing unavailable status')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🏓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600">This session doesn't exist or may have been deleted.</p>
        </div>
      </div>
    )
  }

  const spotsLeft = session.total_spots - session.players.length

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-['Bebas_Neue'] text-4xl md:text-7xl tracking-wide bg-gradient-to-r from-court-green to-green-400 bg-clip-text text-transparent mb-2 animate-slideIn">
            CLAREMONT PICKLEBALL
          </h1>
          <div className="text-gray-600 text-lg md:text-xl animate-slideIn" style={{ animationDelay: '0.1s' }}>
            {session.host === 'bill' ? "Bill's" : "Sandy's"} Session
          </div>
        </header>

        <div className="bg-card-bg rounded-2xl p-4 md:p-8 border border-border-color relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-green to-accent-orange"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
            <div>
              <div className="font-['Bebas_Neue'] text-2xl md:text-4xl tracking-wide text-court-green">
                {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-gray-600 text-lg md:text-xl font-medium mt-1">
                {session.time}
              </div>
            </div>
            <div className="text-left md:text-right mt-3 md:mt-0">
              <div className="font-['Bebas_Neue'] text-2xl md:text-3xl text-gray-900">
                {spotsLeft} / {session.total_spots}
              </div>
              <div className="text-gray-600 text-xs md:text-sm uppercase tracking-wide">
                Spots Available
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl mb-6 md:mb-8 border border-border-color">
            <form onSubmit={handleSignup} className="mb-4">
              <label className="block mb-2 text-gray-600 text-sm uppercase tracking-wide font-medium">
                Your Response
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="First Name Last Initial (e.g., John D.)"
                  required
                  className="w-full px-4 py-3 bg-white border border-border-color rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-court-green focus:ring-2 focus:ring-court-green/20 transition-all"
                />
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    name="status"
                    value="in"
                    onClick={(e) => {
                      const form = e.currentTarget.form;
                      if (form) {
                        const hiddenInput = form.querySelector('input[name="status"]') as HTMLInputElement;
                        if (hiddenInput) hiddenInput.value = 'in';
                      }
                    }}
                    disabled={spotsLeft === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-court-green to-green-400 text-white font-semibold rounded-lg uppercase tracking-wide hover:shadow-lg hover:shadow-court-green/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    I'm In
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="out"
                    onClick={(e) => {
                      const form = e.currentTarget.form;
                      if (form) {
                        const hiddenInput = form.querySelector('input[name="status"]') as HTMLInputElement;
                        if (hiddenInput) hiddenInput.value = 'out';
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg uppercase tracking-wide hover:bg-gray-400 hover:-translate-y-0.5 transition-all"
                  >
                    I'm Out
                  </button>
                </div>
                <input type="hidden" name="status" />
              </div>
              {spotsLeft === 0 && (
                <p className="text-accent-orange text-center mt-4">Session is full! You can still mark yourself as unavailable.</p>
              )}
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            {session.players.map((player, index) => (
              <div
                key={player.id}
                className="bg-gradient-to-br from-court-green/10 to-white border border-border-color rounded-xl p-4 md:p-5 flex justify-between items-center hover:border-court-green hover:-translate-y-1 transition-all animate-slideInPlayer shadow-sm"
              >
                <div className="flex items-center">
                  <span className="font-['Bebas_Neue'] text-xl md:text-2xl text-court-green mr-2">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-base md:text-lg text-gray-900">{player.name}</span>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="w-8 h-8 flex items-center justify-center text-accent-orange text-2xl hover:bg-accent-orange/20 rounded-lg transition-all hover:rotate-90 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
            
            {Array.from({ length: spotsLeft }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="bg-white border border-dashed border-gray-300 rounded-xl p-4 md:p-5 flex items-center justify-center text-gray-400 italic text-sm md:text-base"
              >
                {session.players.length + i + 1}. Available
              </div>
            ))}
          </div>

          {session.unavailable_players.length > 0 && (
            <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200">
              <div className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-3">
                Can't Attend ({session.unavailable_players.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {session.unavailable_players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 flex items-center gap-2 text-gray-600"
                  >
                    <span className="text-sm font-medium">{player.name}</span>
                    <button
                      onClick={() => removeUnavailable(player.id)}
                      className="text-gray-400 hover:text-gray-600 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
