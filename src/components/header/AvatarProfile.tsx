"use client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Avatar from "../../../public/avatar.png"
import { LogOut, User } from "lucide-react"
import { signOut } from "next-auth/react"
import { useClientSession } from "@/hooks/useClientSession"
import { Session } from "next-auth"
import { useRouter } from "next/navigation"

const AvatarProfile = ({initialSession} : {initialSession : Session | null}) => {
  const session = useClientSession(initialSession)
  const user = session.data?.user
  const router = useRouter()
  return (
   <div className="flex">
     <DropdownMenu >
    <DropdownMenuTrigger>
        <Image className="rounded-full cursor-pointer" alt="avatar" src={user?.image ?? Avatar} width={35} height={35}/>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => router.push(`/profile/${user?.username}`)}  >
        <User/>  Profile
        </DropdownMenuItem >
      <DropdownMenuItem
       onClick={() => signOut()}
      >
        <LogOut/> Logout
        </DropdownMenuItem>
      
    </DropdownMenuContent>
  </DropdownMenu>
   </div>
  
  )
}

export default AvatarProfile
  
