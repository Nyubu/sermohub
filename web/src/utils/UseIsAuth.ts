import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

// Hook to make sure user is logged in
export const UseIsAuth = () => {
    const [{data, fetching}] = useMeQuery(); // Check if user is logged in
    const router = useRouter();
    // console.log(router);
    useEffect(() => {
        if (!fetching && !data?.me) { // If not logged in. Must also take consideration of "fetching" state
            router.replace('/login?next=' + router.pathname) // Tells them where to go after logging in
        }
    }, [fetching, data, router])
}