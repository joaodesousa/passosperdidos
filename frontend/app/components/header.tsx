import Image from "next/image"
import { ModeToggle } from "./mode-toggle"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-[#2952cc] dark:bg-[#09090B] dark:border-b dark:border-white dark:border-opacity-15 text-white">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image
            src="/passosperdidos.png"
            alt="Assembleia da República"
            width={100}
            height={100}
            className="brightness-0 invert"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon" className="text-white ">
            <Bell className="h-5 w-5" />
          </Button> */}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

