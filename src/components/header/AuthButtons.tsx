"use client"
import React from 'react'
import { Button } from '../ui/button'
import { usePathname, useRouter } from 'next/navigation';
import { Pages, Routes } from '@/constants/enums';
import { useClientSession } from '@/hooks/useClientSession';
import { Session } from 'next-auth';
import AvatarProfile from './AvatarProfile';

const AuthButtons = ({initialSession} : {initialSession : Session | null }) => {
  const session =  useClientSession(initialSession)
    const router = useRouter();
    const pathname = usePathname()
  return (
     <div>
      
  {session?.data?.user && (
    <>
    <AvatarProfile initialSession={initialSession} />
    </>
  )}



  {!session?.data?.user && (
    <div className='flex items-center space-x-2 '>
    <Button
         className={`${
           pathname.startsWith(`/${Routes.AUTH}/${Pages.LOGIN}`)
             ? "text-primary"
             : "text-slate-600 dark:text-neutral-200"
         } hover:!text-primary duration-200 transition-colors font-semibold hover:no-underline !px-1`}
         size="lg"
         variant="link"
         onClick={() =>
           router.push(`/${Routes.AUTH}/${Pages.LOGIN}`)
         }
       >
         Login
       </Button>
       <Button
         className="!px-8 !rounded-full"
         size="lg"
         onClick={() =>
           router.push(`/${Routes.AUTH}/${Pages.Register}`)
         }
       >
     Register
       </Button>
 </div>
  )}
  </div>
  )
}

export default AuthButtons
