import Link from "next/link"

export default function Footer() {
  return (
    <footer className="dark:bg-[#09090B] pt-10 pb-6">
      <div className="flex flex-col items-center justify-center text-xs dark:text-white dark:text-opacity-50">
        <p>Informação obtida através do site da <Link href="https://www.parlamento.pt" target="_blank" className="text-blue-900">Assembleia da República</Link>.</p>
        <p>Resumos criados através do modelo <Link href="https://mistral.ai/news/announcing-mistral-7b" target="_blank" className="text-blue-900"><i>Mistral 7B</i></Link> (em fase de teste)</p>
        <p><Link href="mailto:geral@passosperdidos.pt" target="_blank" className="text-blue-900">Contacto</Link></p>
      </div>
    </footer>
  )
}

