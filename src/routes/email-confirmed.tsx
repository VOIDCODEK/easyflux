import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/email-confirmed")({
  component: EmailConfirmed,
});

function EmailConfirmed() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-10 max-w-md w-full text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle className="text-emerald-400 w-16 h-16" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Email confirmado!
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Sua conta foi verificada com sucesso. Agora voce pode fechar essa pagina e prosseguir para o login.
        </p>
        
          <a href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Ir para o Login
        </a>
        <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          2026 EasyFlux - Gestao Financeira Inteligente
        </p>
      </motion.div>
    </div>
  );
}