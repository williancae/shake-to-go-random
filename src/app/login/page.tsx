"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "williancae" && password === "willian&Foda") {
      sessionStorage.setItem("isAuthenticated", "true")
      router.push("/admin")
    } else {
      setError("Credenciais inválidas")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center p-4 relative overflow-hidden shake-pattern-bg">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <img src="/images/shake_03.png" alt="" className="absolute top-20 right-20 w-14 h-18 -rotate-12 animate-float-delayed" />
        <img src="/images/shake_05.png" alt="" className="absolute bottom-32 left-16 w-12 h-16 rotate-45 animate-float" />
        <img src="/images/shake_07.png" alt="" className="absolute bottom-20 right-32 w-18 h-22 -rotate-6 animate-float-delayed" />
        <img src="/images/shake_12.png" alt="" className="absolute top-1/2 left-8 w-10 h-14 rotate-90 animate-float" />
        <img src="/images/shake_13.png" alt="" className="absolute top-1/3 right-12 w-16 h-20 -rotate-45 animate-float-delayed" />
      </div>

      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/images/shake_04.png" alt="Shake" className="w-12 h-16 animate-bounce" />
          <h1 className="text-5xl font-black text-primary-800 drop-shadow-lg">
            Acesso Restrito
          </h1>
          <img src="/images/shake_06.png" alt="Shake" className="w-12 h-16 animate-bounce delay-300" />
        </div>
        <p className="text-xl text-primary-600 font-semibold">
          Faça login para continuar
        </p>
        <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl z-10">
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-primary-700 text-sm font-bold mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow-inner appearance-none border-2 border-primary-200 rounded-lg w-full py-3 px-4 text-primary-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-primary-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-inner appearance-none border-2 border-primary-200 rounded-lg w-full py-3 px-4 text-primary-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
