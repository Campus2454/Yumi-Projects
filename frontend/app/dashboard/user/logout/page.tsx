'use client';
import { useState, useContext } from "react";
import { ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { postAuthLogout, postAuthLogoutLocalhost } from "@/src/utils/api";
import { Spinner_ring } from "@/src/components/Spinner";
import { PageHeader } from "@/src/components/DashSections";
import styled from "styled-components";
import { UserContext } from "@/src/utils/contexts/Contexts";

export default function UserLogoutPage() {
    const { user } = useContext(UserContext);
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


    const LogoutB = styled.button`
        padding: 10px 20px;
        border: #e02424 2px solid;
        border-radius: 5px;
        background-color: #e34545;
        color: ${props => props.disabled ? '#e34545' : '#fff'};
        cursor: ${props => props.disabled ? 'progress' : 'pointer'};
        font-weight: bold;
        font-size: 20px;
        position: relative;
    `;

    return (
        <div>
            <PageHeader title="Logout" />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 15 }}>Do you want to log out?</div>
                <LogoutB onClick={logout} disabled={!user || logging_out}>
                    Logout
                    {!user || logging_out ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Spinner_ring size={45} border={5} color="#fff" />
                        </div>
                    ) : null}
                </LogoutB>
            </div>
        </div>
    );
}
