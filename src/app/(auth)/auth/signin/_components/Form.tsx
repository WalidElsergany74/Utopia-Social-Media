"use client"
import FormFields from '@/components/form-fields/FormFields';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/Loader';
import { Pages } from '@/constants/enums'
import { toast } from '@/hooks/use-toast';
import useFormFields from '@/hooks/useFormFields'
import { IFormField } from '@/types';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'

const Form = () => {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const {getFormFields} = useFormFields({slug : Pages.LOGIN})

       const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formRef.current) return;
        const formData = new FormData(formRef.current);
         const data: Record<string, string> = {};
         formData.forEach((value, key) => {
            data[key] = value.toString();
          });
          try {
            setIsLoading(true);
            const res = await signIn("credentials", {
              email: data.email,
              password: data.password,
              redirect: false,
            });
            if (res?.error) {
              const validationError = JSON.parse(res?.error).validationError;
              setError(validationError);
              const responseError = JSON.parse(res?.error).responseError;
              if (responseError) {
                toast({
                  title: responseError,
                  className: "text-destructive",
                });
              }
            }
            if (res?.ok) {
              toast({
                title: "Login done successfully",
                className: "text-green-400",
              });
              router.replace(`/`);
            }
          } catch (error) {
            console.log(error);
          } finally {
            setIsLoading(false);
          }
       }

  return (
    <form onSubmit={onSubmit} ref={formRef}>
    {getFormFields().map((field: IFormField) => (
<div key={field.name} className="mb-3">
  <FormFields {...field} error={error}  />
</div>
))}

<Button type="submit" disabled={isLoading} className="w-full">
{isLoading ? <Loader /> : "Login"}
</Button>
</form>
  )
}

export default Form
