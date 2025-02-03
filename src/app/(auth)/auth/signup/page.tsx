import React from 'react'
import Link from '@/components/link'
import { buttonVariants } from '@/components/ui/button'
import { Pages, Routes } from '@/constants/enums'
import Form from './_components/Form'

const SignUpPage = () => {
  return (
    <div className="py-8 md:py-12   element-center min-h-screen">
    <div className="container element-center">
      <div className="w-full max-w-md p-6 bg-white dark:bg-background  border dark:border-primary rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-black dark:text-white mb-4">
          Welcome to <span className="text-primary tracking-widest font-extrabold">Utopia</span>
        </h2>
        <Form />
        <p className="mt-2 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
          <span>Already have an account ? </span>
          <Link
            href={`/${Routes.AUTH}/${Pages.LOGIN}`}
            className={`${buttonVariants({
              variant: "link",
              size: "sm",
            })} !text-black dark:!text-white`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}

export default SignUpPage
