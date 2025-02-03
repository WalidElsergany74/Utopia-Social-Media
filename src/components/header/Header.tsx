import React from 'react'
import Navbar from './Navbar'
import AuthButtons from './AuthButtons'
import Logo from './Logo'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'


const Header = async () => {
  const initialSession = await getServerSession(authOptions)

 
  return (
    <header  className="py-4 md:py-5  w-full  bg-background  border-b sticky top-0 z-40" >
        <div className="container flex justify-between items-center gap-6 lg:gap-10 ">
            {/* Logo */}
            <Logo/>
             <Navbar initialSession={initialSession}/>
            <div className='hidden lg:flex  lg:items-center lg:gap-6'>
                <AuthButtons initialSession={initialSession}/>
            </div>
        </div>
    </header>
  )
}

export default Header
