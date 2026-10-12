import { usePathname } from "next/navigation";
import AppLink from "../components/AppLink";

export const NotFound = () => {
  const path = usePathname();
  
  return<><div className='w-[100%] min-h-[100%] flex flex-col align-center justify-center items-center'>
    <b className='text-[100px]/[80px]'>404</b>
    <h2 className='text-[50px]/[60px]'>Not Found</h2>
    <AppLink href={'/'+path.split('/')[1]} className='cursor-pointer mt-4'>Back to <b>Home</b> page</AppLink>
  </div>
</>};