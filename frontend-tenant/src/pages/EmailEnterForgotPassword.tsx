import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"

import '/backgrounds/Background_road.svg'

const EmailEnterForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [particles, setParticles] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Génère les particules une seule fois
    const generated = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 10,
      delay: Math.random() * 1,
    }))
    setParticles(generated)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
              await api.post("/auth/forgot-password", {
        email,
      })
      navigate("/forgot-password")
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi du code de vérification.")
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden min-h-screen w-full bg-gradient-to-tr from-[#0D2F4A] to-[#188994] flex items-center justify-center">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-30"
          style={{
            left: p.left,
            top: p.top,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <img className="absolute w-full" src="/backgrounds/Background_road.svg" />
      
      <div className="flex justify-center items-center w-screen min-h-screen px-4">
        <div className="flex-shrink-0 w-full max-w-[500px]">
          <div className="flex flex-col w-full bg-white/10 backdrop-blur-lg border border-white/75 rounded-3xl p-4 sm:p-8 text-white shadow-lg">
            <h2 className="text-2xl sm:text-2xl font-extralight text-center mb-2">Entrez votre adresse email</h2>
            <p className="text-sm font-extralight text-center text-white/80 mb-6">Nous vous enverrons un code de vérifications</p>

            <form onSubmit={handleSubmit} className="flex flex-col justify-center space-y-4 sm:space-y-6 px-2 sm:px-10">
              <div className="flex justify-center">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 sm:py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>

              {error && (
                <div className="text-red-300 text-sm text-center">{error}</div>
              )}

              <div className="flex justify-center w-full">
                <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#6AB1B0] p-[1px] rounded-full w-full">
                  <button 
                    type="submit" 
                    className="flex justify-center w-full self-center relative px-6 py-2 sm:py-3 rounded-full bg-[#18A8A5] overflow-hidden"
                  >
                    <span className="text-white text-sm font-extralight">Vérifier</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailEnterForgotPassword
