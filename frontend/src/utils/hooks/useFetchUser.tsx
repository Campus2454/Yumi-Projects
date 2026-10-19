import { useEffect, useState, useRef } from "react";
import { checkToken, checkTokenLocalhost, getAuthStatus, getAuthStatusLocalhost } from "../api";
import { AuthStatus } from "../types";

export function useFetchUser() {
    const [user, setUser] = useState<AuthStatus>();
    const [errorUser, setError] = useState('');
    const [loadingUser, setLoading] = useState(false);
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    const hasFetched = useRef(false);
    const fetchUser = async () => {
        setLoading(true);
        try {
            if (window.location.hostname === hostname) {
                const { data } = await getAuthStatus();

                const { data: tokenData } = await checkToken(data.id, data.discordId, data.accessToken, data.refreshToken);

                if (tokenData.statusCode == '1') {
                    // console.info('User:', data);
                    setUser(data);
                } else if (tokenData.statusCode == '2') {
                    console.info('Token refreshed successfully.');
                    const refreshedUser = await getAuthStatus();
                    // console.info('User:', refreshedUser.data);
                    setUser(refreshedUser.data);
                } else {
                    setUser(undefined);
                    setError(tokenData.message || 'Unknown error');
                }
            } else if (window.location.hostname !== hostname) {
                const { data } = await getAuthStatusLocalhost();

                const { data: tokenData } = await checkTokenLocalhost(data.id, data.discordId, data.accessToken, data.refreshToken);

                if (tokenData.statusCode == '1') {
                    // console.info('User:', data);
                    setUser(data);
                } else if (tokenData.statusCode == '2') {
                    console.info('Token refreshed successfully.');
                    const refreshedUser = await getAuthStatusLocalhost();
                    // console.info('User:', refreshedUser.data);
                    setUser(refreshedUser.data);
                } else {
                    setUser(undefined);
                    setError(tokenData.message || 'Unknown error');
                }
            }
        } catch (error: any) {
            setError(error.response?.status || error.message || 'Unknown error');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        fetchUser();
    }, []);

    return { user, errorUser, loadingUser };
}

// import { useEffect, useRef, useState } from "react";
// import { checkToken, checkTokenLocalhost, getAuthStatus, getAuthStatusLocalhost } from "../api";
// import { AuthStatus } from "../types";

// export function useFetchUser() {
//     const [user, setUser] = useState<AuthStatus>();
//     const [errorUser, setError] = useState('');
//     const [loadingUser, setLoading] = useState(false);

//     useEffect(() => {
//         setLoading(true);
//         if (window.location.hostname == hostname) {
//             getAuthStatus()
//             .then(({ data }) => {
//                 const user = data;
//                 checkToken(data.id, data.discordId, data.accessToken, data.refreshToken)
//                 .then(({ data }) => {
//                     if(data.error){
//                         console.error('User:', data.error)
//                         setUser(undefined)
//                         setError(`${data.error || 'Unknown error'}`);
//                     }else if(data.statusCode == '0'){
//                         console.error('User:', data.message);
//                         setUser(undefined)
//                         setError(`${data.error || 'Unknown error'}`);
//                     }else if(data.statusCode == '1'){
//                         console.info('User:', user);
//                         setUser(user);
//                         setLoading(false);
//                     }else if(data.statusCode == '2'){
//                         console.info('User:', data.message);
//                         setTimeout(() => {
//                             getAuthStatus()
//                             .then(({ data }) => {
//                                 console.info('User:', data);
//                                 setUser(data);
//                                 setLoading(false);
//                             })
//                             .catch(error => {
//                                 console.error(error);
//                                 setError(`${error.response.status || error || 'Unknown error'}`);
//                             })
//                         }, 2000);
//                     }else if(data.statusCode == '3' || data.statusCode == '4'){
//                         console.error('User:', data.message);
//                         setUser(undefined);
//                     };
//                 })
//                 .catch(error => {
//                     console.error('User:', error);
//                     setUser(undefined)
//                     setError(`${error.response.status || error || 'Unknown error'}`);
//                 })
//             })
//             .catch(error => {
//                 setTimeout(() => {
//                     getAuthStatus()
//                     .then(({ data }) => {
//                         const user = data;
//                         checkToken(data.id, data.discordId, data.accessToken, data.refreshToken)
//                         .then(({ data }) => {
//                             if(data.error){
//                                 console.error('User:', data.error)
//                                 setUser(undefined)
//                                 setError(`${data.error || 'Unknown error'}`);
//                             }else if(data.statusCode == '0'){
//                                 console.error('User:', data.message);
//                                 setError(`${data.message || 'Unknown error'}`);
//                                 setUser(undefined)
//                             }else if(data.statusCode == '1'){
//                                 console.info('User:', user);
//                                 setUser(user);
//                                 setLoading(false);
//                             }else if(data.statusCode == '2'){
//                                 console.info('User:', data.message);
//                                 setTimeout(() => {
//                                     getAuthStatus()
//                                     .then(({ data }) => {
//                                         console.info('User:', data);
//                                         setUser(data);
//                                         setLoading(false);
//                                     })
//                                     .catch(error => {
//                                         console.error(error);
//                                         setError(`${error.response.status || error || 'Unknown error'}`);
//                                     })
//                                 }, 2000);
//                             }else if(data.statusCode == '3' || data.statusCode == '4'){
//                                 console.error('User:', data.message);
//                                 setUser(undefined);
//                                 setError(`${data.message || 'Unknown error'}`);
//                             };
//                         })
//                         .catch(error => {
//                             console.error('User:', error);
//                             setUser(undefined)
//                             setError(`${error.response.status || error || 'Unknown error'}`);
//                         })
//                     })
//                     .catch(error => {
//                         console.error(error);
//                         setError(`${error.response.status || error || 'Unknown error'}`);
//                     })
//                 }, 2000);
//             })
//         } else if (window.location.hostname != hostname)  {
//             getAuthStatusLocalhost()
//             .then(({ data }) => {
//                 const user = data;
//                 checkTokenLocalhost(data.id, data.discordId, data.accessToken, data.refreshToken)
//                 .then(({ data }) => {
//                     if(data.error){
//                         console.error('User:', data.error)
//                         setUser(undefined)
//                         setError(`${data.error || 'Unknown error'}`);
//                     }else if(data.statusCode == '0'){
//                         console.error('User:', data.message);
//                         setUser(undefined)
//                         setError(`${data.message || 'Unknown error'}`);
//                     }else if(data.statusCode == '1'){
//                         console.info('User:', user);
//                         setUser(user);
//                         setLoading(false);
//                     }else if(data.statusCode == '2'){
//                         console.info('User:', data.message);
//                         setTimeout(() => {
//                             getAuthStatusLocalhost()
//                             .then(({ data }) => {
//                                 console.info('User:', data);
//                                 setUser(data);
//                                 setLoading(false);
//                             })
//                             .catch(error => {
//                                 console.error(error);
//                                 setError(`${error.response.status || error || 'Unknown error'}`);
//                             })
//                         }, 2000);
//                     }else if(data.statusCode == '3' || data.statusCode == '4'){
//                         console.error('User:', data.message);
//                         setUser(undefined);
//                         setError(`${data.message || 'Unknown error'}`);
//                     };
//                 })
//                 .catch(error => {
//                     console.error('User:', error);
//                     setUser(undefined)
//                     setError(`${error.response.status || error || 'Unknown error'}`);
//                 })
//             })
//             .catch(error => {
//                 setTimeout(() => {
//                     getAuthStatusLocalhost()
//                     .then(({ data }) => {
//                         const user = data;
//                         checkTokenLocalhost(data.id, data.discordId, data.accessToken, data.refreshToken)
//                         .then(({ data }) => {
//                             if(data.error){
//                                 console.error('User:', data.error)
//                                 setUser(undefined)
//                                 setError(`${data.error || 'Unknown error'}`);
//                             }else if(data.statusCode == '0'){
//                                 console.error('User:', data.message);
//                                 setUser(undefined)
//                                 setError(`${data.message || 'Unknown error'}`);
//                             }else if(data.statusCode == '1'){
//                                 console.info('User:', user);
//                                 setUser(user);
//                                 setLoading(false);
//                             }else if(data.statusCode == '2'){
//                                 console.info('User:', data.message);
//                                 setTimeout(() => {
//                                     getAuthStatusLocalhost()
//                                     .then(({ data }) => {
//                                         console.info('User:', data);
//                                         setUser(data);
//                                         setLoading(false);
//                                     })
//                                     .catch(error => {
//                                         console.error(error);
//                                         setError(`${error.response.status || error || 'Unknown error'}`);
//                                     })
//                                 }, 2000);
//                             }else if(data.statusCode == '3' || data.statusCode == '4'){
//                                 console.error('User:', data.message);
//                                 setUser(undefined);
//                                 setError(`${data.message || 'Unknown error'}`);
//                             };
//                         })
//                         .catch(error => {
//                             console.error('User:', error);
//                             setUser(undefined)
//                             setError(`${error.response.status || error || 'Unknown error'}`);
//                         })
//                     })
//                     .catch(error => {
//                         console.error(error);
//                         setError(`${error.response.status || error || 'Unknown error'}`);
//                     })
//                 }, 2000);
//             })
//         }
//         setLoading(false);
//     }, []);
    
//     return { user, errorUser, loadingUser };
// }