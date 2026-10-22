'use client';
import { useState, useContext } from "react";
import { ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { postAuthLogout, postAuthLogoutLocalhost } from "@/src/utils/api";
import { Spinner_ring } from "@/src/components/Spinner";
import { PageHeader } from "@/src/components/DashSections";

export default function UserLogoutPage() {
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const [logging_out, setLogging_out] = useState(false);
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;

    const logout = async () => {
        setLogging_out(true);
        try {
            if (typeof window !== 'undefined' && window.location.hostname === hostname) {
                await postAuthLogout();
            } else {
                await postAuthLogoutLocalhost();
            }

            window.location.pathname = '/';
            setLogging_out(false);
        } catch (error) {
            console.error(error);
            setErrorPopup({ title: 'Logout failed!', message: 'Please try refreshing the page.', show: true });
            setLogging_out(false);
        }
    };

    return (
        <div>
            <PageHeader title="Logout" />

            <div style={{ fontSize: 20, marginBottom: 15 }}>Do you want to log out?</div>
            <button
                onClick={logout}
                disabled={logging_out}
                style={{
                    padding: '10px 20px',
                    border: '#e02424 2px solid',
                    borderRadius: 5,
                    backgroundColor: '#e34545',
                    color: logging_out ? '#e34545' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 20,
                    position: 'relative',
                }}
            >
                Logout
                {logging_out ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Spinner_ring size={45} border={5} color="#fff" />
                    </div>
                ) : null}
            </button>
            <div style={{ marginTop: 50 }}>Note: If you have any problems logging out, please contact the developer.</div>
        </div>
    );
}
