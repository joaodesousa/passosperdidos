import Link from "next/link"

export default function Footer() {
  return (
    <footer className="dark:bg-[#09090B] pt-10 pb-6">
      <div className="flex flex-col items-center justify-center text-xs dark:text-white dark:text-opacity-50">
        <p>Informação obtida através do site da <Link href="https://www.parlamento.pt" target="_blank" className="text-blue-900">Assembleia da República</Link>.</p>
        <p>Resumos criados através do modelo <Link href="https://www.together.ai/models/deepseek-r1-distilled-llama-70b-free" target="_blank" className="text-blue-900"><i>DeepSeek R1 Distilled Llama 70B Free</i></Link></p>
        <p><Link href="mailto:geral@passosperdidos.pt" target="_blank" className="text-blue-900">Contacto</Link></p>
      </div>
    </footer>
  )
}

