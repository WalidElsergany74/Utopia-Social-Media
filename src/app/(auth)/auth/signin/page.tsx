import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import Form from "./_components/Form";


const SigninPage = () => {
  return (
    <div className="py-28 md:py-24   element-center min-h-screen">
      <div className="container element-center">
        <div className="w-full max-w-md p-6 bg-white dark:bg-background border dark:border-primary rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center text-black dark:text-white mb-4">
            Welcome to <span className="text-primary tracking-widest font-extrabold">Utopia</span>
          </h2>
          <Form />
          <p className="mt-2 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            <span>Don&apos;t have an account? </span>
            <Link
              href={`/${Routes.AUTH}/${Pages.Register}`}
              className={`${buttonVariants({
                variant: "link",
                size: "sm",
              })} !text-black dark:!text-white`}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
