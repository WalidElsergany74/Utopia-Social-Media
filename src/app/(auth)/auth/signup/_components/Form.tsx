"use client"
import FormFields from '@/components/form-fields/FormFields'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/Loader'
import { Pages, Routes } from '@/constants/enums'
import { toast } from '@/hooks/use-toast'
import useFormFields from '@/hooks/useFormFields'
import { signUp } from '@/server/_actions/auth'
import { IFormField } from '@/types'
import { ValidationErrors } from '@/validation'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'



const initialState: {
    message?: string;
    error?: ValidationErrors;
    status?: number | null;
    formData?: FormData | null;
  } = {
    message: "",
    error: {},
    status: null,
    formData: null,
  };

const Form = () => {
    const router = useRouter()
    const [state, action, pending] = useActionState(signUp, initialState);
    const  {getFormFields} = useFormFields({slug : Pages.Register})

    useEffect(() => {
        if (state.status && state.message) {
          toast({
            title: state.message,
            className: state.status === 201 ? "text-green-400" : "text-destructive",
          });
        }
        if (state.status === 201) {
          router.replace(`/${Routes.AUTH}/${Pages.LOGIN}`);
        }
      }, [router, state.message, state.status]);

  return (
    <form action={action}>
      {getFormFields().map((field: IFormField) => {
        const fieldValue = state.formData?.get(field.name) as string;
        return (
          <div key={field.name} className="mb-3">
            <FormFields
                 {...field}
                error={state.error}
                defaultValue={fieldValue} />
          </div>
        );
      })}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader /> : "Register"}
      </Button>
    </form>
  )
}

export default Form
