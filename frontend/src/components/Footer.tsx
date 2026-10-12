'use client';

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const Footer = () => {
    const pathname = usePathname();
    const [isFixed, setIsFixed] = useState<boolean>();
    const [mobileMode, setMobileMode] = useState<boolean>();
    const [hide, setHide] = useState<boolean>(false);

    const checkHeight = () => {
        const contentHeight = document.getElementsByClassName('page').item(0)?.scrollHeight || 0;
        const windowHeight = window.innerHeight;
        setIsFixed(contentHeight < windowHeight - 70);
    };
    const checkMobileMode = () => {
        setMobileMode(window.innerWidth < 1000);
    };
    const checkEndFooter = () => {
        const el = document.getElementById('end-footer');
        if(!el || mobileMode)return setHide(false);

        const observer = new IntersectionObserver(
            ([entry]) => {
            setHide(entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(el);

        return () => {
            observer.unobserve(el);
        };
    };

    useEffect(() => {
        checkMobileMode();
        checkHeight();
        checkEndFooter();
        window.addEventListener("resize", () => { checkHeight(); checkMobileMode(); });
        return () => window.removeEventListener("resize", () => { checkHeight(); checkMobileMode(); });
    }, []);

    useEffect(() => {
        setTimeout(() => {
            checkEndFooter();
        }, 1_000);
    }, []);

    useEffect(() => {
        checkMobileMode();
        checkHeight();
        checkEndFooter();
        window.addEventListener("resize", () => { checkHeight(); checkMobileMode(); });
        return () => window.removeEventListener("resize", () => { checkHeight(); checkMobileMode(); });
    }, [pathname]);

    return (pathname?.startsWith('/dashboard') ?? false) || !mobileMode ? (<div></div>) :
    (<div id="end" style={{ height: isFixed ? 'auto' : '70px', bottom: 0, transition: '1s', opacity: hide ? 0 : 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70px", width: "100%", background: "rgb(90 40 40 / 50%)", boxShadow: "0px -1px 20px 0px black", backdropFilter: "blur(3px)", position: mobileMode && !isFixed ? "unset" : "fixed", bottom: 0, zIndex: 100, }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "85%", }}>
                <div style={{ color: "#b5b5b5", }}>
                    © 2024-2025 Yumi All Rights Reserved.
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "25%", }}>
                    <div style={{ color: "#b5b5b5", cursor: "no-drop", }}>Privacy Policy</div>
                    <div style={{ color: "#b5b5b5", cursor: "no-drop", }}>Terms &amp; Conditions</div>
                </div>
            </div>
        </div>
    </div>)
}